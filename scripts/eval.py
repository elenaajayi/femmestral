"""Evaluation script — compares base vs fine-tuned Ministral 3B on eval set."""

import os
import jsonlines
import wandb
from mistralai import Mistral

wandb.init(project=os.getenv("WANDB_PROJECT", "femmestral"), job_type="eval")

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

VERDICTS = ["True", "False", "Mostly False", "Partially True", "Unverified"]


def run_eval(model_id: str, eval_path: str = "data/eval.jsonl") -> dict:
    """
    Run model on eval set and return accuracy metrics.

    Args:
        model_id: Mistral model ID (base or fine-tuned)
        eval_path: Path to eval JSONL

    Returns:
        dict with verdict_accuracy, avg_latency_ms
    """
    # TODO:
    # 1. load eval.jsonl
    # 2. for each example, call model and extract verdict
    # 3. compare to expected verdict
    # 4. log results to W&B
    raise NotImplementedError


if __name__ == "__main__":
    base_metrics = run_eval("ministral-3b-latest")
    wandb.log({"base/verdict_accuracy": base_metrics["verdict_accuracy"]})

    fine_tuned_model_id = os.getenv("FINE_TUNED_MODEL_ID")
    if fine_tuned_model_id:
        ft_metrics = run_eval(fine_tuned_model_id)
        wandb.log({"fine_tuned/verdict_accuracy": ft_metrics["verdict_accuracy"]})

    wandb.finish()
