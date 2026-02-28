"""Fact checker — fine-tuned Ministral 3B for verdict + explanation."""


def fact_check(claim_text: str, evidence: list[dict]) -> dict:
    """
    Run the fine-tuned Ministral 3B model to produce a verdict.

    Args:
        claim_text: The health claim to fact-check
        evidence: List of evidence dicts from PubMed RAG

    Returns:
        dict with keys:
            - verdict (str): "True" | "False" | "Mostly False" | "Partially True" | "Unverified"
            - explanation (str): 2-3 sentence explanation
            - source (str): citation (WHO, PubMed, ACOG, CDC)
            - shareable_correction (str): WhatsApp-friendly correction message
            - confidence (float): 0.0 - 1.0
    """
    # TODO: call fine-tuned Ministral 3B via Mistral API,
    # inject evidence from PubMed into prompt context
    raise NotImplementedError
