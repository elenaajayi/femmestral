"""Image processor — extracts text from screenshots via NVIDIA NIM vision model."""

# Model: nvidia/llama-3_2-nv-vision-instruct
# API: https://integrate.api.nvidia.com/v1 (OpenAI-compatible)


def process_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Extract text from an image/screenshot using NVIDIA vision NIM.

    Args:
        image_bytes: Raw image bytes
        mime_type: MIME type of the image

    Returns:
        dict with keys: original_type, extracted_text, confidence
    """
    # TODO: encode image as base64, call nvidia/llama-3_2-nv-vision-instruct,
    # prompt: "Extract all text visible in this image. Return only the text, no commentary."
    raise NotImplementedError
