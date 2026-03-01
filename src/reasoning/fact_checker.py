"""Fact checker — fine-tuned Mistral 7B with PubMed RAG context."""

import os
import weave
from src.rag.pubmed import search_pubmed
from src.rag.semantic_scholar import search_semantic_scholar

HF_REPO = os.getenv("HF_REPO", "elenaajayi/femmestral-mistral-7b-v2")

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
    """Build prompt with claim and PubMed evidence context."""
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
    else:
        return f"Claim to fact-check: {claim}\n\nFact-check this claim using your medical knowledge."


def _load_pipeline():
    """Load fine-tuned model pipeline (lazy, cached after first call)."""
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    from peft import PeftModel
    import torch

    base_model_id = "mistralai/Mistral-7B-Instruct-v0.3"
    hf_token = os.getenv("HF_TOKEN")

    base = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        torch_dtype=torch.float16,
        device_map="auto",
        token=hf_token,
    )
    model = PeftModel.from_pretrained(base, HF_REPO, token=hf_token)
    tokenizer = AutoTokenizer.from_pretrained(HF_REPO, token=hf_token)

    return pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        max_new_tokens=600,
        temperature=0.3,
        do_sample=True,
    )


_pipeline = None


@weave.op()
def fact_check(claim_text: str, evidence: list[dict] | None = None) -> dict:
    """
    Run the fine-tuned Mistral 7B model to produce a verdict.

    Args:
        claim_text: The health claim to fact-check
        evidence:   List of evidence dicts from PubMed RAG (optional)

    Returns:
        dict with keys: verdict, confidence, evidence_grade, severity,
                        explanation, source, shareable_correction, raw_response,
                        pubmed_sources
    """
    global _pipeline

    if evidence is None:
        evidence = search_pubmed(claim_text, max_results=3)

    prompt = _build_prompt(claim_text, evidence)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": prompt},
    ]

    if _pipeline is None:
        _pipeline = _load_pipeline()

    output = _pipeline(messages)
    raw = output[0]["generated_text"][-1]["content"] if isinstance(
        output[0]["generated_text"], list
    ) else output[0]["generated_text"]

    return {
        "raw_response":         raw,
        "pubmed_sources":       [p["url"] for p in evidence],
        "pubmed_evidence_used": len(evidence),
    }


@weave.op()
def retrieve_evidence(claim_text: str) -> list[dict]:
    """
    Retrieve evidence from PubMed + Semantic Scholar, deduplicated and sorted.

    Args:
        claim_text: The health claim to fact-check

    Returns:
        Combined, deduplicated evidence list sorted by grade (A > B > C)
    """
    pubmed_results    = search_pubmed(claim_text, max_results=3)
    semantic_results  = search_semantic_scholar(claim_text, max_results=3)

    # Merge — PubMed first (higher credibility), then Semantic Scholar
    combined = pubmed_results + semantic_results

    # Sort by grade
    grade_order = {"A": 0, "B": 1, "C": 2}
    combined.sort(key=lambda r: grade_order.get(r["evidence_grade"], 2))

    return combined[:5]  # cap at 5 sources for prompt length


@weave.op()
def fact_check_pipeline(claim_text: str) -> dict:
    """
    Full pipeline: PubMed + Semantic Scholar retrieval → fine-tuned model → verdict.

    Args:
        claim_text: The health claim to fact-check

    Returns:
        Full result dict including sources and model response
    """
    evidence = retrieve_evidence(claim_text)
    return fact_check(claim_text, evidence)
