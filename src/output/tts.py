"""TTS — converts correction text to audio via Eleven Labs."""


def generate_audio(text: str, voice_id: str = "Rachel") -> bytes:
    """
    Generate spoken audio of the correction using Eleven Labs TTS.

    Args:
        text: The correction text to speak
        voice_id: Eleven Labs voice ID (default: Rachel)

    Returns:
        Audio bytes (MP3)
    """
    # TODO: call Eleven Labs API with text, return MP3 bytes
    # User can download/forward as a voice note
    raise NotImplementedError
