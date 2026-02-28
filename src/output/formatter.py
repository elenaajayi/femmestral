"""Response formatter — structures verdict into display + shareable formats."""

VERDICT_EMOJI = {
    "True": "✅",
    "False": "❌",
    "Mostly False": "⚠️",
    "Partially True": "🔶",
    "Unverified": "❓",
}


def format_response(verdict: str, explanation: str, source: str, shareable_correction: str) -> dict:
    """
    Format fact-check result for display and sharing.

    Args:
        verdict: One of True / False / Mostly False / Partially True / Unverified
        explanation: 2-3 sentence explanation
        source: Citation string
        shareable_correction: WhatsApp-friendly correction message

    Returns:
        dict with keys: display_text, shareable_text, verdict_emoji
    """
    # TODO: build formatted display block (with dividers, emoji, sections)
    # and clean shareable_text for copy button
    raise NotImplementedError
