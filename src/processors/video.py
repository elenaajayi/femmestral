"""Video processor — extracts audio via FFmpeg, then transcribes via ASR."""

from .audio import process_audio


def process_video(video_bytes: bytes) -> dict:
    """
    Extract audio from video with FFmpeg, then transcribe with Parakeet ASR.

    Args:
        video_bytes: Raw video bytes

    Returns:
        dict with keys: original_type, extracted_text, confidence
    """
    # TODO: use ffmpeg-python to extract audio track from video bytes,
    # pass extracted audio to process_audio(), return result
    raise NotImplementedError
