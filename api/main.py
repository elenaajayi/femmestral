"""Femmestral API — multimodal women's health misinformation fact-checker."""

import os
import json
import re
import hashlib
import tempfile
import subprocess
from pathlib import Path

import weave
import requests as http_requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Weave tracing
weave.init(os.getenv("WANDB_PROJECT", "femmestral"))

app = FastAPI(
    title="Femmestral",
    description="Multimodal women's health misinformation fact-checker",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MISTRAL_MODEL = os.getenv("FINE_TUNED_MODEL_ID") or os.getenv("MISTRAL_MODEL", "mistral-small-latest")
ELEVENLABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY", "")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_json(s: str) -> dict:
    """Best-effort JSON extraction from model output."""
    s = (s or "").strip()
    s = re.sub(r"^```(?:json)?\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"\s*```$", "", s)
    if s.startswith("{") and s.endswith("}"):
        return json.loads(s)
    start = s.find("{")
    if start == -1:
        raise ValueError("No JSON object found in model output.")
    depth = 0
    for i in range(start, len(s)):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return json.loads(s[start : i + 1])
    raise ValueError("Could not parse JSON object.")


def _mistral_chat(system_prompt: str, user_text: str, max_tokens: int = 800) -> str:
    """Call Mistral API and return raw text response."""
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY not configured")
    resp = http_requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": MISTRAL_MODEL,
            "temperature": 0.3,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text},
            ],
        },
        timeout=90,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Mistral API error: {resp.text}")
    return resp.json()["choices"][0]["message"]["content"]


def _mistral_chat_json(system_prompt: str, user_text: str, max_tokens: int = 800) -> dict:
    """Call Mistral API and parse JSON from the response."""
    raw = _mistral_chat(system_prompt + "\n\nRETURN ONLY VALID JSON. No markdown. No commentary.", user_text, max_tokens)
    return _extract_json(raw)


# ---------------------------------------------------------------------------
# Safety filters (Nemotron via NVIDIA NIM)
# ---------------------------------------------------------------------------

from src.safety.nemotron import filter_input, filter_output

# ---------------------------------------------------------------------------
# Evidence retrieval (PubMed + Semantic Scholar)
# ---------------------------------------------------------------------------

from src.rag.pubmed import search_pubmed
from src.rag.semantic_scholar import search_semantic_scholar


def retrieve_evidence(claim_text: str) -> list[dict]:
    """Retrieve and merge evidence from PubMed + Semantic Scholar."""
    pubmed = search_pubmed(claim_text, max_results=3)
    semantic = search_semantic_scholar(claim_text, max_results=3)
    combined = pubmed + semantic
    seen = set()
    deduped = []
    for r in combined:
        if r["url"] not in seen:
            seen.add(r["url"])
            deduped.append(r)
    grade_order = {"A": 0, "B": 1, "C": 2}
    deduped.sort(key=lambda r: grade_order.get(r["evidence_grade"], 2))
    return deduped[:5]


# ---------------------------------------------------------------------------
# Fact-check prompt (matches fine-tuning format)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are Femmestral, a women's health misinformation fact-checker.
You will be given a health claim and relevant medical evidence from PubMed.
Respond ONLY in this exact format:

**Verdict: [False/Misleading/Partially True/True]**
**Confidence: [High/Medium/Low]** | **Evidence: [A/B/C]** | **Severity: [High/Medium/Low]**

[2-3 sentence explanation grounded in the provided evidence]

**Source:** [cite the most relevant source]

**Share this correction:**
[1-2 sentence WhatsApp-friendly correction]"""


def _build_prompt(claim: str, evidence: list[dict]) -> str:
    evidence_block = ""
    for i, paper in enumerate(evidence, 1):
        evidence_block += (
            f"\n[{i}] {paper['title']}\n"
            f"    {paper['abstract']}\n"
            f"    Source: {paper['source']} | Grade: {paper['evidence_grade']}\n"
        )
    if evidence_block:
        return (
            f"Claim to fact-check: {claim}\n\n"
            f"Relevant medical evidence:\n{evidence_block}\n"
            f"Based on the evidence above, fact-check this claim."
        )
    return f"Claim to fact-check: {claim}\n\nFact-check this claim using your medical knowledge."


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

@weave.op()
def fact_check_claim(claim_text: str) -> dict:
    """Full pipeline: safety → evidence → model → safety → response."""
    # 1. Input safety
    input_check = filter_input(claim_text)
    if not input_check["safe"]:
        return {
            "safe": False,
            "blocked_reason": input_check["reason"],
            "verdict": None,
        }

    # 2. Evidence retrieval
    evidence = retrieve_evidence(claim_text)

    # 3. Fact-check via Mistral API
    prompt = _build_prompt(claim_text, evidence)
    raw_response = _mistral_chat(SYSTEM_PROMPT, prompt, max_tokens=600)

    # 4. Output safety
    output_check = filter_output(raw_response)
    if not output_check["safe"]:
        return {
            "safe": False,
            "blocked_reason": output_check["reason"],
            "verdict": None,
        }

    return {
        "safe": True,
        "claim": claim_text,
        "response": raw_response,
        "sources": [{"title": p["title"], "url": p["url"], "grade": p["evidence_grade"]} for p in evidence],
        "source_count": len(evidence),
    }


# ---------------------------------------------------------------------------
# Transcription helper (ElevenLabs)
# ---------------------------------------------------------------------------

def _transcribe_audio(file_path: str) -> str:
    """Transcribe audio using ElevenLabs Speech-to-Text."""
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=500, detail="ELEVEN_LABS_API_KEY not configured")
    with open(file_path, "rb") as f:
        resp = http_requests.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            files={"file": (Path(file_path).name, f)},
            data={"model_id": "scribe_v1"},
            timeout=300,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"ElevenLabs STT error: {resp.text}")
    return resp.json().get("text", "")


def _extract_audio_from_video(video_path: str, out_path: str) -> str:
    """Extract audio from video using ffmpeg."""
    subprocess.check_call(
        ["ffmpeg", "-y", "-i", video_path, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", out_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return out_path


# ---------------------------------------------------------------------------
# Claim extraction (for multi-claim messages)
# ---------------------------------------------------------------------------

CLAIM_EXTRACTION_SYSTEM = """You extract checkable health claims from messages.
Return STRICT JSON: {"claims": [{"text": "...", "priority": "high|medium|low"}]}
Split into 2-6 atomic, verifiable claims. Focus on health/medical claims."""


def _extract_claims(text: str) -> list[dict]:
    """Extract individual claims from a message."""
    try:
        result = _mistral_chat_json(CLAIM_EXTRACTION_SYSTEM, text, max_tokens=500)
        return result.get("claims", [{"text": text, "priority": "high"}])
    except Exception:
        return [{"text": text, "priority": "high"}]


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.2.0", "model": MISTRAL_MODEL}


class TextRequest(BaseModel):
    text: str


@app.post("/check/text")
@weave.op()
async def check_text(request: TextRequest):
    """Fact-check a text message (WhatsApp forward, Reddit comment, etc.)."""
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    # Extract individual claims
    claims = _extract_claims(text)

    # Fact-check each claim
    results = []
    for claim in claims:
        claim_text = claim.get("text", "").strip()
        if not claim_text:
            continue
        result = fact_check_claim(claim_text)
        result["priority"] = claim.get("priority", "medium")
        results.append(result)

    # Aggregate verdict
    has_false = any(
        r.get("safe") and r.get("response", "").lower().startswith("**verdict: false")
        for r in results
    )
    has_misleading = any(
        r.get("safe") and "misleading" in r.get("response", "").lower()[:50]
        for r in results
    )

    if has_false:
        overall = "misinformation"
    elif has_misleading:
        overall = "misleading"
    else:
        overall = "likely_accurate"

    return {
        "overall_verdict": overall,
        "claims_checked": len(results),
        "results": results,
        "original_text": text[:500],
    }


@app.post("/check/audio")
@weave.op()
async def check_audio(file: UploadFile = File(...)):
    """Fact-check a voice note by transcribing then analyzing."""
    with tempfile.NamedTemporaryFile(suffix=Path(file.filename or "audio.wav").suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        transcript = _transcribe_audio(tmp_path)
        if not transcript.strip():
            return {"error": "Could not transcribe audio", "transcript": ""}

        # Run text pipeline on transcript
        claims = _extract_claims(transcript)
        results = []
        for claim in claims:
            claim_text = claim.get("text", "").strip()
            if claim_text:
                result = fact_check_claim(claim_text)
                result["priority"] = claim.get("priority", "medium")
                results.append(result)

        return {
            "transcript": transcript,
            "claims_checked": len(results),
            "results": results,
        }
    finally:
        os.unlink(tmp_path)


@app.post("/check/video")
@weave.op()
async def check_video(file: UploadFile = File(...)):
    """Fact-check a video by extracting audio, transcribing, then analyzing."""
    with tempfile.NamedTemporaryFile(suffix=Path(file.filename or "video.mp4").suffix, delete=False) as tmp:
        tmp.write(await file.read())
        video_path = tmp.name

    audio_path = video_path + ".wav"
    try:
        _extract_audio_from_video(video_path, audio_path)
        transcript = _transcribe_audio(audio_path)
        if not transcript.strip():
            return {"error": "Could not transcribe video audio", "transcript": ""}

        claims = _extract_claims(transcript)
        results = []
        for claim in claims:
            claim_text = claim.get("text", "").strip()
            if claim_text:
                result = fact_check_claim(claim_text)
                result["priority"] = claim.get("priority", "medium")
                results.append(result)

        return {
            "transcript": transcript,
            "claims_checked": len(results),
            "results": results,
        }
    finally:
        for p in [video_path, audio_path]:
            if os.path.exists(p):
                os.unlink(p)


@app.post("/check/image")
@weave.op()
async def check_image(file: UploadFile = File(...)):
    """Fact-check text extracted from an image/screenshot using Gemini Vision."""
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured for image OCR")

    import base64

    contents = await file.read()
    b64 = base64.b64encode(contents).decode()
    mime = file.content_type or "image/png"

    # Use Gemini REST API for vision OCR
    resp = http_requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}",
        json={
            "contents": [{
                "parts": [
                    {"text": "Extract ALL text from this image. Return only the text content, nothing else."},
                    {"inline_data": {"mime_type": mime, "data": b64}},
                ]
            }]
        },
        timeout=60,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Gemini Vision error: {resp.text}")

    extracted_text = ""
    try:
        extracted_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        return {"error": "Could not extract text from image"}

    if not extracted_text.strip():
        return {"error": "No text found in image", "extracted_text": ""}

    # Run text pipeline on extracted text
    claims = _extract_claims(extracted_text)
    results = []
    for claim in claims:
        claim_text = claim.get("text", "").strip()
        if claim_text:
            result = fact_check_claim(claim_text)
            result["priority"] = claim.get("priority", "medium")
            results.append(result)

    return {
        "extracted_text": extracted_text,
        "claims_checked": len(results),
        "results": results,
    }
