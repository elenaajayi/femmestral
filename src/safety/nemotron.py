"""Content safety filter via meta/llama-guard-3-8b on NVIDIA NIM."""

import os
from openai import OpenAI

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
SAFETY_MODEL = "meta/llama-guard-3-8b"

_client = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            base_url=NVIDIA_BASE_URL,
            api_key=os.getenv("NVIDIA_API_KEY"),
        )
    return _client


def filter_input(claim: str) -> dict:
    """
    Check whether an incoming claim is a genuine health query.

    Args:
        claim: The user-submitted health claim to check

    Returns:
        dict with keys:
            - safe (bool): True if claim is a legitimate health query
            - reason (str | None): reason if blocked
    """
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=SAFETY_MODEL,
            messages=[{"role": "user", "content": claim}],
            max_tokens=50,
        )
        result = response.choices[0].message.content.strip().lower()
        safe = result.startswith("safe")
        reason = None if safe else result
        return {"safe": safe, "reason": reason}
    except Exception as e:
        # Fail open — if safety check errors, allow through and log
        return {"safe": True, "reason": f"safety check unavailable: {e}"}


def filter_output(text: str) -> dict:
    """
    Run model output through content safety filter before returning to user.

    Args:
        text: Model-generated fact-check response to check

    Returns:
        dict with keys:
            - safe (bool)
            - filtered_text (str): original text if safe, else blocked message
            - reason (str | None): reason if blocked
    """
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=SAFETY_MODEL,
            messages=[{"role": "user", "content": text}],
            max_tokens=50,
        )
        result = response.choices[0].message.content.strip().lower()
        safe = result.startswith("safe")

        if safe:
            return {"safe": True, "filtered_text": text, "reason": None}
        else:
            return {
                "safe": False,
                "filtered_text": "This response was blocked by the content safety filter.",
                "reason": result,
            }
    except Exception as e:
        # Fail open — if safety check errors, return original text and log
        return {"safe": True, "filtered_text": text, "reason": f"safety check unavailable: {e}"}
