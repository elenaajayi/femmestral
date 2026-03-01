<div align="center">

# Femmestral

### Fine-Tuned Mistral for Women's Health Misinformation Detection

[W&B Report](https://api.wandb.ai/links/elenaajayi-n-a/s0np94lb) | [Model](https://huggingface.co/elenaajayi/femmestral-mistral-7b-v2) | [Mistral Worldwide Hackathon 2026](https://mistral.ai)

</div>

---

Women's health misinformation does not live on obscure websites. It lives in WhatsApp groups, family chats, and short-form videos shared by people we trust. "The HPV vaccine causes infertility." "Eating papaya causes miscarriage." "You cannot get pregnant while breastfeeding." These claims reach millions of women before a single correction does, and in many communities they shape real health decisions long before a doctor is ever consulted.

General-purpose language models are not built for this problem. They can answer medical questions, but they do not cite live research, they do not produce the same structured output reliably, and they do not format corrections for the platforms where misinformation actually travels. Femmestral is built to close this gap: fine-tuned Mistral models grounded in live biomedical evidence, filtered through two layers of content safety, and a Chrome extension that brings real-time claim detection directly into Reddit.

---

## What It Does

Femmestral takes a women's health claim, retrieves live evidence from PubMed and Semantic Scholar, passes it through a fine-tuned Mistral model, verifies the output with NVIDIA Nemotron content safety, and returns a structured verdict with a source citation and a correction short enough to forward on WhatsApp.

Every inference is traced in Weave. Every training run is tracked in W&B. The output format is enforced by the fine-tuning objective itself, so the model produces the same structure on every call, without exception:

```
Verdict: False
Confidence: High | Evidence: A | Severity: High

The HPV vaccine has been studied in over 100 countries and shows no association
with infertility. Multiple large-scale RCTs confirm safety across reproductive outcomes.

Source: PMID:29453920
Share this: The HPV vaccine does not cause infertility. Over 100 countries use it
safely. Talk to your doctor before skipping it.
```

---

## Architecture

```
Text Claim
        |
        v
Nemotron Content Safety  -- input filter via NVIDIA NIM
        |
        v
Evidence Retrieval       -- PubMed (NCBI E-utilities) + Semantic Scholar
        |
        v
Fine-tuned Mistral       -- QLoRA adapter on Mistral 7B or Ministral 3B
        |
        v
Nemotron Content Safety  -- output filter, blocks harmful responses
        |
        v
Structured Response      -- verdict, confidence, evidence grade, citation, shareable text
```

The pipeline is fully traced in Weave: every call to `fact_check()`, `retrieve_evidence()`, and `fact_check_pipeline()` is decorated with `@weave.op()`, so the full evidence context, model response, and source list are logged for every call and available for replay.

The Chrome extension runs as a separate, self-contained track: it scans Reddit comments in real time using a local multi-signal scoring engine and does not call the API.

---

## Fine-Tuning

We fine-tuned two models using QLoRA (Quantized Low-Rank Adaptation): Mistral 7B Instruct v0.3 and Ministral 3B. In QLoRA, the base model weights are frozen at 4-bit precision and a small set of adapter layers are trained on top, which makes fine-tuning feasible on a single A100 in under two hours. Training used Unsloth, which delivers roughly 2x throughput over standard HuggingFace PEFT.

Each training example contains a real women's health claim, the top PubMed abstracts retrieved for that claim, and a fully structured target response covering: verdict, confidence level, evidence grade, severity, a two-to-three sentence explanation grounded in the retrieved abstracts, a source citation, and a WhatsApp-shareable correction. The dataset contains 240 training examples and 60 held-out evaluation examples across categories including fertility, contraception, vaccines, dietary myths, and cancer screening.

We ran two learning rate experiments on the 7B model:

| Run | Learning Rate | Steps | Eval Loss |
|-----|--------------|-------|-----------|
| soft-puddle-8 | 1e-4 | 100 | 0.940 |
| jolly-armadillo-5 | 5e-5 | 80 | 1.027 |

Run 1 (`soft-puddle-8`) is the production model; lower eval loss means the model more reliably produces the full structured format on unseen examples. The fine-tuned 7B adapter is published at `elenaajayi/femmestral-mistral-7b-v2` on HuggingFace. The fine-tuned Ministral 3B adapter is published at `elenaajayi/femmestral-ministral-3b`.

Evaluation on 7 held-out labeled claims:

| Metric | Score |
|--------|-------|
| Verdict accuracy | 86% (6/7) |
| Format compliance | 100% (7/7) |
| Avg latency | 2.95s |

Format compliance at 100% reflects the core fine-tuning objective: the model must produce the structured output on every inference, not only when the evidence is clear-cut. Full evaluation is in `notebooks/femmestral_finetune.ipynb`.

---

## Evidence Retrieval

Before every inference, Femmestral retrieves live evidence from two sources and injects it directly into the prompt, so the model never generates a citation it has not seen in the context window.

**PubMed** is the world's largest biomedical literature database, maintained by the US National Library of Medicine. We query it via the free NCBI E-utilities API, retrieve the top three abstracts per claim, and grade each result by the institutional affiliation of the publishing authors:

| Grade | Sources |
|-------|---------|
| A | NIH, WHO, CDC, ACOG, Cochrane |
| B | NHS, Mayo Clinic, BMJ, The Lancet, NEJM |
| C | All others |

**Semantic Scholar** covers 200 million-plus papers and supplements PubMed with broader academic coverage, particularly for newer research not yet indexed in MEDLINE. It requires no API key for basic usage.

Results from both sources are merged, deduplicated by URL, sorted by evidence grade so that Grade A sources appear first, and capped at five total sources to stay within prompt length limits. The final evidence block is passed verbatim into the model prompt; when a claim returns no evidence at all, the model falls back to its pre-trained medical knowledge and signals lower confidence accordingly.

---

## Content Safety

Two separate Nemotron calls guard every inference: one at the input stage, before any processing begins, and one at the output stage, before the response reaches the user. Both run against `nvidia/llama-3.1-nemotron-nano-8b-v1` via NVIDIA NIM and return a structured result with a reason string for both safe and blocked responses.

The input filter passes any legitimate health claim — including false or dangerous ones, which must reach the fact-checker to be debunked — and blocks only requests that are entirely unrelated to health or that contain explicit threats. The output filter blocks responses that contain dangerous medical advice, recommend avoiding proven treatments, or could directly harm a patient who follows them.

```python
from src.safety.nemotron import filter_input, filter_output

# Input check: is this a legitimate health claim?
filter_input("ibuprofen causes infertility")
# {'safe': True, 'reason': 'this is a legitimate health claim.'}

# Output check: is the generated response safe to return?
filter_output("You should stop taking all medications immediately.")
# {'safe': False, 'filtered_text': 'This response was blocked by the Nemotron content safety filter.',
#  'reason': 'unsafe: recommending cessation of all medications without medical supervision...'}
```

One implementation detail worth noting: the safety classifier is a chat model, not a dedicated rule-based filter. We classify a response as unsafe only when the model's reply begins with `"unsafe:"` — not when any unsafe-sounding keyword appears anywhere in the text. This prevents a class of false positives where a safe response like "there is no dangerous level of ibuprofen use that causes permanent infertility" gets blocked because the word "dangerous" appears in a context that is explicitly negating it. Full evaluation results, including all 12 test cases and pass/fail outcomes, are saved to `src/safety/nemotron_eval_results.json`.

---

## Chrome Extension

The Chrome extension brings real-time misinformation detection directly into Reddit, operating entirely client-side without calling the backend API. It targets Reddit comments across all three UI generations — Shreddit (2024+), the redesign, and old Reddit — and injects fact-check badges and panels next to flagged content.

The scoring engine uses seven weighted signal categories: anti-establishment framing, overclaiming language, pseudo-scientific terminology, empowerment-misinfo patterns, unproven treatment claims, authority-undermining language, and product promotion. Each signal carries a base weight; context multipliers are applied on top — advice-giving language multiplies by 1.4x, urgency cues by 1.3x, product recommendations by 1.5x. Subreddit-specific calibration adjusts risk thresholds for communities like r/health versus r/fitness where the baseline claim density differs. Confidence scores are bounded between 35% and 97% by design: the system never presents a verdict as certain.

Each flagged comment receives a color-coded badge (low / medium / high / critical risk), a panel showing the top signals and their weights, recurring myth detection with trusted resource links, and a disclaimer that the output is not medical advice. A floating action button tracks session statistics: comments scanned, comments flagged, misinformation detected, and myths identified.

---

## Notebooks

The project is organized around three notebooks, which together cover fine-tuning, text-based misinformation analysis, and video processing.

**`femmestral_finetune.ipynb`** covers the full fine-tuning and evaluation workflow: data preparation, QLoRA training on Mistral 7B via Unsloth, the RAG pipeline, held-out evaluation across 7 labeled claims, LoRA adapter upload to HuggingFace, and W&B artifact logging with training metadata. This is the primary training artifact and the source of the published model weights.

**`WomenFalseInformation_full_fixed.ipynb`** is a companion analysis notebook for text claims. It implements an 8-stage misinformation detection pipeline using Mistral for routing and classification — configurable via the `MISTRAL_MODEL` environment variable, which can point at the fine-tuned Ministral 3B adapter — and Gemini 2.5 Flash for grounded claim extraction and verification via Google Search. The pipeline processes a claim through routing, claim extraction, per-claim grounded verification, and aggregate verdict generation, caching outputs at each stage for reproducibility. The two-step Gemini approach — grounded search call first (returns text), then a second call with tools off (returns strict JSON) — works around an SDK limitation that prevents `response_mime_type=application/json` from being set when Google Search grounding is active.

**`WomenFalseInformation_video_Vf2.ipynb`** extends the pipeline to video input using Mistral Large for routing, claim extraction, and final verdict generation, and Gemini 2.5 Pro for vision-based frame analysis. Like the full analysis notebook, `MISTRAL_MODEL` can be swapped to point at a fine-tuned adapter.

---

## Repository Structure

```
femmestral/
|
|-- notebooks/
|   |-- femmestral_finetune.ipynb              Fine-tuning, RAG pipeline, evaluation
|   |-- WomenFalseInformation_full_fixed.ipynb Full misinformation analysis (8-stage pipeline)
|   |-- WomenFalseInformation_video_Vf2.ipynb  Video claim extraction and fact-checking
|
|-- src/
|   |-- reasoning/
|   |   |-- fact_checker.py                    Core fact-check pipeline with Weave tracing
|   |
|   |-- rag/
|   |   |-- pubmed.py                          PubMed retrieval via NCBI E-utilities
|   |   |-- semantic_scholar.py                Semantic Scholar retrieval
|   |
|   |-- safety/
|       |-- nemotron.py                        NVIDIA Nemotron content safety filter
|       |-- nemotron_eval_results.json         Safety filter evaluation: 12 test cases
|
|-- chrome-extension/                          Browser extension for real-time Reddit scanning
|-- whatsapp-demo/                             WhatsApp interface demo
|
|-- data/
|   |-- train.jsonl                            240 training examples
|   |-- eval.jsonl                             60 evaluation examples
|
|-- scripts/
    |-- fine_tune.py                           Fine-tuning script (use notebook for full workflow)
```

---

## Setup

```bash
git clone https://github.com/elenaajayi/femmestral.git
cd femmestral
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required environment variables:

```
HF_TOKEN=              # HuggingFace token for model access
NVIDIA_API_KEY=        # NVIDIA NIM API key (build.nvidia.com)
WANDB_API_KEY=         # Weights and Biases experiment tracking
NCBI_API_KEY=          # Optional: bumps PubMed rate limit from 3 to 10 req/sec
MISTRAL_API_KEY=       # Mistral API key (required for analysis notebooks)
GEMINI_API_KEY=        # Google Gemini API key (required for analysis notebooks)
```

To use the fine-tuned Ministral 3B adapter in the analysis notebooks rather than the default API model, set `MISTRAL_MODEL=elenaajayi/femmestral-ministral-3b` in your `.env`.

---

## Running the Fact-Checker

```python
from src.reasoning.fact_checker import fact_check_pipeline

result = fact_check_pipeline("ibuprofen causes infertility")
print(result["raw_response"])
```

With both safety filters applied:

```python
from src.reasoning.fact_checker import fact_check_pipeline
from src.safety.nemotron import filter_input, filter_output

input_check = filter_input(claim)
if input_check["safe"]:
    result = fact_check_pipeline(claim)
    output_check = filter_output(result["raw_response"])
    if output_check["safe"]:
        print(output_check["filtered_text"])
    else:
        print("Blocked:", output_check["reason"])
```

---

## Experiment Tracking

All training runs and evaluations are tracked in W&B. Every inference call is traced in Weave via `@weave.op()` decorators on `fact_check()`, `retrieve_evidence()`, and `fact_check_pipeline()`, which means the full evidence context, model response, and source list are logged for every call and available for replay.

Full W&B report: https://api.wandb.ai/links/elenaajayi-n-a/s0np94lb
Hugging face models: https://huggingface.co/elenaajayi/femmestral-mistral-7b-v2 and https://huggingface.co/elenaajayi/femmestral-mistral-7b

---

## Stack

| Component | Technology |
|-----------|-----------|
| Fine-tuning (7B) | Mistral 7B Instruct v0.3 + QLoRA + Unsloth |
| Fine-tuning (3B) | Ministral 3B + QLoRA + Unsloth |
| Evidence retrieval | PubMed NCBI E-utilities + Semantic Scholar |
| Content safety | NVIDIA Nemotron (`nvidia/llama-3.1-nemotron-nano-8b-v1`) via NVIDIA NIM |
| Experiment tracking | Weights and Biases + Weave |
| Browser extension | Chrome extension (Manifest v3) — client-side Reddit scanning |
| Video analysis | Gemini 2.5 Pro (vision) + Mistral Large (reasoning) |
| Text analysis | Gemini 2.5 Flash (grounding) + Mistral (routing) |
| WhatsApp interface | React demo |

---

## What's Next

The core machine learning pipeline is complete: the fine-tuned model, retrieval-augmented generation, two-stage content safety filtering via NVIDIA Nemotron (`nvidia/llama-3.1-nemotron-nano-8b-v1`), evaluation across held-out claims, and full W&B and Weave tracking across every inference. The Chrome extension is live and scanning Reddit comments in real time using a multi-signal scoring engine with subreddit-specific calibration. Video claim extraction is handled through a dedicated notebook pipeline using Mistral Large for routing and verdict generation and Gemini 2.5 Pro for vision-based frame analysis.

What remains is the application layer. ElevenLabs will convert the WhatsApp correction field into a shareable audio clip, targeting the voice note format that misinformation commonly travels in across messaging platforms. Standalone audio input — voice notes submitted directly, outside of a video — requires a dedicated transcription step before it can enter the existing pipeline. A FastAPI backend will expose the full fact-checking pipeline as a REST API, connecting the fine-tuned model, RAG retrieval, and safety filtering behind a single endpoint that the Chrome extension and WhatsApp demo can call.

Misinformation wins because it meets people where they already are. That is the same bet Femmestral is making.

---

## Team

Built at the Mistral Worldwide Hackathon 2026.
