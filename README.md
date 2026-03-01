<div align="center">

# Femmestral

### Fine-Tuned Mistral for Women's Health Misinformation Detection

[W&B Report](https://api.wandb.ai/links/elenaajayi-n-a/s0np94lb) | [Model](https://huggingface.co/elenaajayi/femmestral-mistral-7b-v2) | [Mistral Worldwide Hackathon 2026](https://mistral.ai)

</div>

---

Women's health misinformation does not live on obscure websites. It lives in WhatsApp groups, family chats, and short-form videos shared by people we trust. "The HPV vaccine causes infertility." "Eating papaya causes miscarriage." "You cannot get pregnant while breastfeeding." These claims reach millions of women before a single correction does, and in many communities they shape real health decisions long before a doctor is ever consulted.

General-purpose language models are not built for this problem. They can answer medical questions, but they do not cite live research, they do not produce the same structured output reliably, and they do not format corrections for the platforms where misinformation actually travels. Femmestral is built to close this gap: a fine-tuned Mistral model grounded in live biomedical evidence, filtered through two layers of content safety, and formatted for the way health information actually spreads.

---

## What It Does

Femmestral takes a women's health claim — submitted as text, an image, a voice note, or a video — retrieves live evidence from PubMed and Semantic Scholar, passes it through a fine-tuned Mistral model, verifies the output with NVIDIA Nemotron content safety, and returns a structured verdict with a source citation and a correction short enough to forward on WhatsApp.

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
User Input (text / image / audio / video)
        |
        v
Nemotron Content Safety  -- input filter via NVIDIA NIM
        |
        v
Claim Extraction         -- OCR for images, ASR for audio/video
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
ElevenLabs TTS           -- WhatsApp-shareable audio correction
        |
        v
Structured Response      -- verdict, confidence, evidence grade, citation, shareable text
```

The pipeline is fully traced in Weave: every call to `fact_check()`, `retrieve_evidence()`, and `fact_check_pipeline()` is decorated with `@weave.op()`, so the full inference trace is available for debugging and evaluation.

---

## Fine-Tuning

We fine-tuned two models using QLoRA (Quantized Low-Rank Adaptation): a Mistral 7B Instruct v0.3 and a Ministral 3B. In QLoRA, the base model weights are frozen at 4-bit precision and a small set of adapter layers are trained on top, which makes fine-tuning feasible on a single A100 in under two hours. Training used Unsloth, which delivers roughly 2x throughput over standard HuggingFace PEFT.

Each training example contains a real women's health claim, the top PubMed abstracts retrieved for that claim, and a fully structured target response covering: verdict, confidence level, evidence grade, severity, a two-to-three sentence explanation grounded in the retrieved abstracts, a source citation, and a WhatsApp-shareable correction.

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

Format compliance at 100% reflects the core fine-tuning objective: the model must produce the structured output on every inference, not only when the evidence is clear-cut.

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

## Multimodal Input

Femmestral handles four input types; all feed into the same retrieval and fact-checking pipeline.

**Text** is submitted directly as a string and passed to the safety filter and evidence retrieval without preprocessing.

**Image**: OCR extracts the claim text from a screenshot or photo (for example, a WhatsApp forward or a social media post captured as an image). The extracted text is then treated as a standard text claim.

**Audio**: ASR transcribes a voice note or audio clip and passes the transcript downstream. This is particularly relevant for audio-first communities where health information circulates as voice messages rather than written text.

**Video**: Frames are extracted at regular intervals and passed to a vision-language model to identify and extract any health claims made visually or verbally. The extracted claim then flows through the same pipeline as any other input.

---

## Notebooks

The project is organized around three notebooks:

**`femmestral_finetune.ipynb`** covers the full fine-tuning and evaluation workflow: data preparation, QLoRA training on Mistral 7B via Unsloth, the RAG pipeline, and the held-out evaluation across 7 labeled claims. This is the primary training artifact and the source of the published model weights.

**`WomenFalseInformation_full_fixed.ipynb`** is a companion analysis notebook built by a Abhi. It implements a multi-stage misinformation detection pipeline using Mistral for routing and classification (via the Mistral API, configurable via the `MISTRAL_MODEL` environment variable to point at the fine-tuned Ministral 3B adapter) and Gemini 2.5 Flash for claim extraction and evidence grounding via Google Search. The notebook processes claims through eight sequential stages from raw input to a final structured verdict JSON, and its outputs are cached at each stage for reproducibility.

**`WomenFalseInformation_video_Vf2.ipynb`** extends the pipeline to video input. It uses Mistral Large for routing, claim extraction, and final verdict generation, and Gemini 2.5 Pro for vision-based frame analysis. Like the full analysis notebook, `MISTRAL_MODEL` can be swapped to point at a fine-tuned adapter.

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
|   |   |-- claim_detector.py                  Claim extraction from raw input
|   |
|   |-- rag/
|   |   |-- pubmed.py                          PubMed retrieval via NCBI E-utilities
|   |   |-- semantic_scholar.py                Semantic Scholar retrieval
|   |
|   |-- safety/
|   |   |-- nemotron.py                        NVIDIA Nemotron content safety filter
|   |   |-- nemotron_eval_results.json         Safety filter evaluation: 12 test cases
|   |
|   |-- processors/
|   |   |-- audio.py                           Audio transcription and claim extraction
|   |   |-- video.py                           Video frame processing
|   |   |-- image.py                           Image OCR
|   |   |-- text.py                            Text preprocessing
|   |
|   |-- output/
|       |-- tts.py                             ElevenLabs audio generation
|       |-- formatter.py                       Response formatting
|
|-- chrome-extension/                          Browser extension for one-click fact-checking
|-- whatsapp-demo/                             WhatsApp interface demo
|-- api/
|   |-- main.py                                FastAPI backend
|
|-- data/
|   |-- train.jsonl                            Training data
|   |-- eval.jsonl                             Evaluation data
|
|-- scripts/
    |-- fine_tune.py                           Fine-tuning script (deprecated; use notebook)
    |-- eval.py                                Evaluation script (deprecated; use notebook)
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
ELEVENLABS_API_KEY=    # ElevenLabs for audio generation
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
| Audio output | ElevenLabs multilingual TTS |
| Backend | FastAPI |
| Browser extension | Chrome extension (Manifest v3) |
| WhatsApp interface | React demo |
| Video analysis | Gemini 2.5 Pro (vision) + Mistral Large (reasoning) |

---

## Team

Built at the Mistral Worldwide Hackathon 2026.
