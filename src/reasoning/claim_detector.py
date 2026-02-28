"""Claim detector — identifies whether text contains a health claim."""


def detect_claims(text: str) -> dict:
    """
    Detect whether input text contains a health claim worth fact-checking.

    Args:
        text: Extracted/cleaned text

    Returns:
        dict with keys:
            - is_health_claim (bool)
            - claims (list[str]): atomic claims extracted
            - urgency_cues (list[str]): e.g. "SHARE NOW", "URGENT"
            - authority_claims (list[str]): e.g. "doctor confirmed"
    """
    # TODO: use base Ministral 3B with a prompt to detect and extract claims,
    # or use keyword matching as a fast first pass
    raise NotImplementedError
