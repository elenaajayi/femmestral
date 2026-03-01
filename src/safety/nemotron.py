"""Content safety filter via NVIDIA Nemotron on NVIDIA NIM."""

import os
import json
from openai import OpenAI

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
SAFETY_MODEL = "nvidia/llama-3.1-nemotron-nano-8b-v1"

_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            base_url=NVIDIA_BASE_URL,
            api_key=os.getenv("NVIDIA_API_KEY"),
        )
    return _client


def _classify(system_prompt: str, content: str) -> dict:
    """Call Nemotron and parse a safe/unsafe verdict from the response."""
    client = _get_client()
    response = client.chat.completions.create(
        model=SAFETY_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content},
        ],
        max_tokens=50,
        temperature=0,
    )
    result = response.choices[0].message.content.strip().lower()

    # Strip quotes and check if model flagged as unsafe
    cleaned = result.strip('"').strip("'")
    if cleaned.startswith("unsafe"):
        return {"safe": False, "reason": cleaned}

    return {"safe": True, "reason": cleaned}


def filter_input(claim: str) -> dict:
    """
    Verify whether an incoming claim is a legitimate health query safe to process.

    Args:
        claim: The user-submitted health claim to check

    Returns:
        dict with keys:
            - safe (bool): True if claim is a legitimate health query
            - reason (str | None): reason if blocked
    """
    system_prompt = (
        "You are a safety filter for a women's health misinformation fact-checker. "
        "Your job is to verify whether the input is a health-related claim that should be fact-checked. "
        "Health claims — even false or misleading ones — are safe to process. "
        "Flag as unsafe ONLY if the input contains threats, requests for illegal activity, "
        "or is entirely unrelated to health. "
        "If safe, respond: 'This is a legitimate health claim.' "
        "If unsafe, respond: 'unsafe: <brief reason>.'"
    )
    try:
        return _classify(system_prompt, claim)
    except Exception as e:
        return {"safe": True, "reason": f"safety check unavailable: {e}"}


def filter_output(text: str) -> dict:
    """
    Verify model output through Nemotron Content Safety before returning to user.
    Ensures the fact-check response does not contain harmful health advice.

    Args:
        text: Model-generated fact-check response to check

    Returns:
        dict with keys:
            - safe (bool)
            - filtered_text (str): original text if safe, else blocked message
            - reason (str | None): reason if blocked
    """
    system_prompt = (
        "You are a content safety verifier for a women's health fact-checker. "
        "Your job is to verify that the following medical fact-check response is safe to send to a user. "
        "It is safe if it correctly debunks misinformation, cites evidence, or provides accurate health information. "
        "Flag as unsafe ONLY if it contains dangerous medical advice, recommends avoiding proven treatments, "
        "or could directly harm a patient who follows it. "
        "If safe, respond: 'This response is safe.' "
        "If unsafe, respond: 'unsafe: <brief reason>.'"
    )
    try:
        result = _classify(system_prompt, text)
        if result["safe"]:
            return {"safe": True, "filtered_text": text, "reason": result["reason"]}
        else:
            return {
                "safe": False,
                "filtered_text": "This response was blocked by the Nemotron content safety filter.",
                "reason": result["reason"],
            }
    except Exception as e:
        return {"safe": True, "filtered_text": text, "reason": f"safety check unavailable: {e}"}
