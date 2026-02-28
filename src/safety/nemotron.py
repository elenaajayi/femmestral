"""Content safety filter via meta/llama-guard-3-8b on NVIDIA NIM."""

# Model: meta/llama-guard-3-8b
# API: https://integrate.api.nvidia.com/v1 (OpenAI-compatible)


def filter_output(text: str) -> dict:
    """
    Run output through content safety filter before returning to user.

    Args:
        text: Model-generated response to check

    Returns:
        dict with keys:
            - safe (bool)
            - filtered_text (str): original text if safe, else blocked message
            - reason (str | None): reason if blocked
    """
    # TODO: call meta/llama-guard-3-8b via NVIDIA NIM,
    # return safe=True and original text if passes,
    # return safe=False with reason if blocked
    raise NotImplementedError
