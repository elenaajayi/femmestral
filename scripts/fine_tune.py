"""Fine-tuning script — uploads data, launches Ministral 3B fine-tune via Mistral API,
logs full artifact to W&B, pushes model card and eval data to HuggingFace."""

import os
import time
import json
import wandb
import weave
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

run = wandb.init(
    project=os.getenv("WANDB_PROJECT", "femmestral"),
    job_type="fine-tune",
    config={
        "model": "ministral-3b-latest",
        "training_steps": 100,
        "learning_rate": 1e-4,
        "train_file": "data/train.jsonl",
        "eval_file": "data/eval.jsonl",
        "train_examples": 240,
        "eval_examples": 60,
        "task": "women_health_misinformation",
        "fine_tune_provider": "mistral_api",
        "note": "Weights hosted by Mistral. Access via model ID using Mistral API.",
    }
)

weave.init(os.getenv("WANDB_PROJECT", "femmestral"))

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))


def upload_file(path: str) -> str:
    with open(path, "rb") as f:
        response = client.files.upload(
            file={"file_name": os.path.basename(path), "content": f},
            purpose="fine-tune",
        )
    print(f"Uploaded {path}: {response.id}")
    return response.id


def start_fine_tune(training_file_id: str, eval_file_id: str | None = None) -> str:
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
    print("Polling job status...")
    while True:
        job = client.fine_tuning.jobs.get(job_id=job_id)
        status = job.status
        print(f"Status: {status}")

        if hasattr(job, "trained_tokens") and job.trained_tokens:
            wandb.log({"trained_tokens": job.trained_tokens})

        if status == "SUCCESS":
            print(f"Fine-tune complete. Model ID: {job.fine_tuned_model}")
            wandb.log({"fine_tuned_model_id": job.fine_tuned_model})
            return job.fine_tuned_model

        if status in ("FAILED", "CANCELLED"):
            raise RuntimeError(f"Fine-tune job {status}: {job_id}")

        time.sleep(60)


def run_sample_inference(model_id: str) -> list[dict]:
    """Run sample claims through the fine-tuned model and return results."""
    test_claims = [
        "HPV vaccine causes infertility!! Share with all women!!!",
        "Eating papaya causes miscarriage. Warn all pregnant women!!",
        "Birth control pills cause permanent infertility after 2 years of use.",
        "Mammograms cause breast cancer from the radiation.",
        "Women cannot get pregnant while breastfeeding — it is 100% safe.",
    ]

    results = []
    for claim in test_claims:
        response = client.chat.complete(
            model=model_id,
            messages=[{"role": "user", "content": claim}],
            max_tokens=400,
        )
        output = response.choices[0].message.content
        results.append({"claim": claim, "response": output})
        print(f"\nClaim: {claim}\nResponse: {output[:200]}...")

    return results


def save_artifact(model_id: str, sample_outputs: list[dict]):
    """Save full artifact to W&B — training data, config, sample outputs, model ID."""
    artifact = wandb.Artifact(
        name="ministral-3b-femmestral",
        type="model",
        description=(
            "Ministral 3B fine-tuned via Mistral API on women's health misinformation dataset. "
            "Weights are hosted by Mistral and accessible via the model ID in model_id.txt."
        ),
        metadata={
            **dict(wandb.config),
            "fine_tuned_model_id": model_id,
            "access_instructions": (
                "Call via Mistral API: client.chat.complete(model=model_id, messages=[...])"
            ),
        },
    )

    # Training and eval data
    artifact.add_file("data/train.jsonl", name="train.jsonl")
    artifact.add_file("data/eval.jsonl",  name="eval.jsonl")

    # Config
    config_path = "/tmp/femmestral_config.json"
    with open(config_path, "w") as f:
        json.dump(dict(wandb.config), f, indent=2)
    artifact.add_file(config_path, name="config.json")

    # Model ID + access instructions
    model_id_path = "/tmp/femmestral_model_id.txt"
    with open(model_id_path, "w") as f:
        f.write(f"Fine-tuned model ID: {model_id}\n\n")
        f.write("Access via Mistral API:\n\n")
        f.write("  from mistralai import Mistral\n")
        f.write(f"  client = Mistral(api_key=YOUR_MISTRAL_API_KEY)\n")
        f.write(f"  response = client.chat.complete(\n")
        f.write(f"      model='{model_id}',\n")
        f.write(f"      messages=[{{\"role\": \"user\", \"content\": \"your claim here\"}}],\n")
        f.write(f"  )\n")
    artifact.add_file(model_id_path, name="model_id.txt")

    # Sample outputs from fine-tuned model
    samples_path = "/tmp/femmestral_samples.json"
    with open(samples_path, "w") as f:
        json.dump(sample_outputs, f, indent=2)
    artifact.add_file(samples_path, name="sample_outputs.json")

    run.log_artifact(artifact)
    print("W&B artifact logged with training data, config, model ID, and sample outputs.")


def push_to_huggingface(model_id: str, sample_outputs: list[dict]):
    hf_token = os.getenv("HF_TOKEN")
    hf_repo = os.getenv("HF_REPO", "elenaajayi/femmestral-ministral-3b")
    if not hf_token:
        print("HF_TOKEN not set — skipping HuggingFace upload.")
        return

    try:
        from huggingface_hub import HfApi
        api = HfApi(token=hf_token)
        api.create_repo(repo_id=hf_repo, exist_ok=True, private=True)

        # Model card
        samples_md = "\n\n".join(
            f"**Claim:** {s['claim']}\n\n**Response:**\n{s['response']}"
            for s in sample_outputs[:3]
        )
        model_card = f"""---
base_model: ministral-3b-latest
fine_tuned: true
task: text-classification
domain: women_health_misinformation
fine_tune_provider: mistral_api
---

# Femmestral — Ministral 3B Fine-Tuned

Ministral 3B fine-tuned on 240 women's health misinformation examples via the Mistral API.

## Model ID

```
{model_id}
```

## How to Use

```python
from mistralai import Mistral

client = Mistral(api_key="YOUR_MISTRAL_API_KEY")
response = client.chat.complete(
    model="{model_id}",
    messages=[{{"role": "user", "content": "your claim here"}}],
)
print(response.choices[0].message.content)
```

## Output Format

Each response includes:
- **Verdict**: False / Misleading / Partially True / True
- **Confidence**: High / Medium / Low
- **Evidence**: A (WHO/CDC/NIH) / B (other medical orgs)
- **Severity**: High / Medium / Low
- Explanation grounded in medical evidence
- Source citation
- Shareable WhatsApp-style correction

## Training Data

- 240 training examples, 60 eval examples
- Categories: pregnancy, menstrual health, contraception, fertility, cancer,
  menopause, mental health, STIs, nutrition, exercise, hormonal disorders,
  breastfeeding, vaginal health, and more

## Sample Outputs

{samples_md}

## Built at

Mistral Worldwide Hackathon 2026
"""
        api.upload_file(
            path_or_fileobj=model_card.encode(),
            path_in_repo="README.md",
            repo_id=hf_repo,
        )

        # Also push training data and config
        api.upload_file(
            path_or_fileobj=open("data/train.jsonl", "rb"),
            path_in_repo="data/train.jsonl",
            repo_id=hf_repo,
        )
        api.upload_file(
            path_or_fileobj=open("data/eval.jsonl", "rb"),
            path_in_repo="data/eval.jsonl",
            repo_id=hf_repo,
        )

        print(f"Pushed to HuggingFace: https://huggingface.co/{hf_repo}")
        wandb.log({"hf_repo": hf_repo})

    except Exception as e:
        print(f"HuggingFace upload failed (non-fatal): {e}")


if __name__ == "__main__":
    train_file_id = upload_file("data/train.jsonl")
    eval_file_id  = upload_file("data/eval.jsonl")

    job_id   = start_fine_tune(train_file_id, eval_file_id)
    model_id = poll_job(job_id)

    print("\nRunning sample inference on fine-tuned model...")
    sample_outputs = run_sample_inference(model_id)

    save_artifact(model_id, sample_outputs)
    push_to_huggingface(model_id, sample_outputs)

    # Write model ID to .env for eval.py
    env_path = ".env"
    with open(env_path) as f:
        env = f.read()
    with open(env_path, "w") as f:
        f.write(env.replace("FINE_TUNED_MODEL_ID=", f"FINE_TUNED_MODEL_ID={model_id}"))

    print(f"\nDone. Fine-tuned model ID: {model_id}")
    print("FINE_TUNED_MODEL_ID written to .env")

    wandb.finish()
