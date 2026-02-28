"""Fine-tuning script — uploads data, launches Ministral 3B fine-tune, logs to W&B, saves to HuggingFace."""

import os
import time
import wandb
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

# W&B run — judges need to see this
run = wandb.init(
    project=os.getenv("WANDB_PROJECT", "femmestral"),
    job_type="fine-tune",
    config={
        "model": "ministral-3b-latest",
        "training_steps": 100,
        "learning_rate": 1e-4,
        "train_file": "data/train.jsonl",
        "eval_file": "data/eval.jsonl",
    }
)

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))


def upload_training_file(path: str) -> str:
    """Upload JSONL training file to Mistral and return file ID."""
    with open(path, "rb") as f:
        response = client.files.upload(
            file={"file_name": os.path.basename(path), "content": f},
            purpose="fine-tune",
        )
    file_id = response.id
    print(f"Uploaded training file: {file_id}")
    wandb.log({"training_file_id": file_id})
    return file_id


def start_fine_tune(training_file_id: str, eval_file_id: str | None = None) -> str:
    """Start fine-tuning job on ministral-3b-latest and return job ID."""
    job = client.fine_tuning.jobs.create(
        model="ministral-3b-latest",
        training_files=[{"file_id": training_file_id, "weight": 1}],
        validation_files=[eval_file_id] if eval_file_id else None,
        hyperparameters={
            "training_steps": run.config["training_steps"],
            "learning_rate": run.config["learning_rate"],
        },
        integrations=[{
            "type": "wandb",
            "project": os.getenv("WANDB_PROJECT", "femmestral"),
            "api_key": os.getenv("WANDB_API_KEY"),
        }],
    )
    print(f"Fine-tune job started: {job.id}")
    wandb.log({"job_id": job.id})
    return job.id


def poll_job(job_id: str) -> str:
    """Poll fine-tuning job until complete, log metrics to W&B. Returns fine-tuned model ID."""
    print("Polling job status...")
    while True:
        job = client.fine_tuning.jobs.get(job_id=job_id)
        status = job.status
        print(f"Status: {status}")

        if hasattr(job, "trained_tokens"):
            wandb.log({"trained_tokens": job.trained_tokens})

        if status == "SUCCESS":
            print(f"Fine-tune complete! Model: {job.fine_tuned_model}")
            wandb.log({"fine_tuned_model_id": job.fine_tuned_model})
            return job.fine_tuned_model

        if status in ("FAILED", "CANCELLED"):
            raise RuntimeError(f"Fine-tune job {status}: {job_id}")

        time.sleep(60)


def save_adapter_artifact(model_id: str):
    """Save fine-tuned model ID as W&B artifact — required for judges to validate."""
    artifact = wandb.Artifact(
        name="ministral-3b-femmestral",
        type="model",
        description="Ministral 3B fine-tuned on women's health misinformation dataset",
        metadata={
            "base_model": "ministral-3b-latest",
            "fine_tuned_model_id": model_id,
            "task": "health_misinformation_detection",
            "domain": "women_health",
        }
    )
    # Log the model ID in a text file (LoRA adapters are hosted by Mistral)
    with artifact.new_file("model_id.txt") as f:
        f.write(model_id)

    run.log_artifact(artifact)
    print(f"Saved model artifact to W&B: ministral-3b-femmestral")

    # Log to HuggingFace if HF token provided (required for judge validation)
    hf_token = os.getenv("HF_TOKEN")
    hf_repo = os.getenv("HF_REPO", "elenaajayi/femmestral-ministral-3b")
    if hf_token:
        try:
            from huggingface_hub import HfApi
            api = HfApi(token=hf_token)
            api.create_repo(repo_id=hf_repo, exist_ok=True, private=True)
            # Write model card
            model_card = f"""---
base_model: ministral-3b-latest
fine_tuned: true
task: text-classification
domain: women_health_misinformation
---
# Femmestral — Ministral 3B Fine-Tuned

Fine-tuned Ministral 3B for women's health misinformation detection.

**Mistral model ID:** `{model_id}`

Built at Mistral Worldwide Hackathon 2026.
"""
            api.upload_file(
                path_or_fileobj=model_card.encode(),
                path_in_repo="README.md",
                repo_id=hf_repo,
            )
            print(f"Pushed model card to HuggingFace: {hf_repo}")
            wandb.log({"hf_repo": hf_repo})
        except Exception as e:
            print(f"HuggingFace upload failed (non-fatal): {e}")
    else:
        print("HF_TOKEN not set — skipping HuggingFace upload. Add to .env to enable.")


if __name__ == "__main__":
    # Upload data
    train_file_id = upload_training_file("data/train.jsonl")
    eval_file_id = upload_training_file("data/eval.jsonl") if os.path.exists("data/eval.jsonl") else None

    # Fine-tune
    job_id = start_fine_tune(train_file_id, eval_file_id)

    # Wait for completion
    model_id = poll_job(job_id)

    # Save artifact + push to HF
    save_adapter_artifact(model_id)

    print(f"\nDone! Fine-tuned model ID: {model_id}")
    print(f"Set FINE_TUNED_MODEL_ID={model_id} in your .env before running eval.py")

    wandb.finish()
