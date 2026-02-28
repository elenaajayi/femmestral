"""Fine-tuning script — uploads data and launches Ministral 3B fine-tune job via Mistral API."""

import os
import wandb
from mistralai import Mistral

# W&B setup
wandb.init(project=os.getenv("WANDB_PROJECT", "femmestral"), job_type="fine-tune")

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))


def upload_training_file(path: str) -> str:
    """Upload JSONL training file to Mistral and return file ID."""
    # TODO: open train.jsonl, call client.files.upload(), return file_id
    raise NotImplementedError


def start_fine_tune(training_file_id: str) -> str:
    """Start fine-tuning job on ministral-3b-latest and return job ID."""
    # TODO: call client.fine_tuning.jobs.create(
    #   model="ministral-3b-latest",
    #   training_files=[training_file_id],
    #   hyperparameters={"training_steps": 100, "learning_rate": 1e-4}
    # )
    # log job_id to W&B
    raise NotImplementedError


def poll_job(job_id: str):
    """Poll fine-tuning job until complete, log metrics to W&B."""
    # TODO: poll client.fine_tuning.jobs.get(job_id) until status == "SUCCESS"
    # log training loss to wandb.log()
    raise NotImplementedError


if __name__ == "__main__":
    file_id = upload_training_file("data/train.jsonl")
    job_id = start_fine_tune(file_id)
    poll_job(job_id)
    print(f"Fine-tune complete. Job ID: {job_id}")
    wandb.finish()
