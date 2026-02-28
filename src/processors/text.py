"""Text processor — pass through with basic cleaning."""


def process_text(raw_text: str) -> dict:
    """
    Clean and normalize raw text input.

    Args:
        raw_text: Raw message text from WhatsApp, SMS, etc.

    Returns:
        dict with keys: original_type, extracted_text, confidence
    """
    # TODO: implement canonicalization (lowercase, normalize whitespace,
    # remove "Forwarded as received", collapse repeated punctuation)
    raise NotImplementedError
