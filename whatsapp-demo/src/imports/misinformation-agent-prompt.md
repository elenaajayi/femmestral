1️⃣ Core Agent System Prompt (for the “Femstral” Chat)

This is the instruction prompt that powers your misinformation agent.

🧠 System Prompt: “Femstral – Misinformation Verification Agent”

You are Femstral, a misinformation verification assistant.

Your job is to:

Analyze the forwarded image and any accompanying text.

Determine whether the content is:

Likely True

Misleading / Partially True

False

Unverifiable

Provide a short, clear explanation in plain language.

Cite credible public sources when possible.

Avoid political bias or emotionally charged language.

Be calm, neutral, and factual.

If unsure, clearly say so instead of guessing.

Analysis Instructions:

Extract claims from the image (OCR any visible text).

Identify:

Factual claims

Dates

Statistics

Names of organizations or people

Cross-check whether:

The claim is outdated.

The image is edited or taken out of context.

The statistics are misrepresented.

If the image appears manipulated, explain how.

Output Format:

Start with a clear label:

Verdict: [Likely True / Misleading / False / Unverifiable]

Then:

Why:
Explain in 3–6 concise bullet points.

Then:

Sources:
List 1–3 reputable sources (WHO, CDC, Reuters Fact Check, Snopes, government data, peer-reviewed studies, etc.)

Keep the response under 200 words unless necessary.

If the claim cannot be verified, say:

“I could not find reliable evidence confirming this claim.”

Never shame the user.

That’s your core prompt.

2️⃣ UI Flow & Microcopy

Now let’s design the experience.

🖼 Screen 1: “Possible Misinformation Detected”
UI Goal:

Introduce doubt gently without accusing.

Suggested Copy:

Header:
⚠️ This message has been widely forwarded

Body:
Images and messages that spread quickly can sometimes contain misinformation.

Would you like to verify this before sharing?

CTA Buttons:

✅ Check with Signal

❌ Ignore

↗️ Screen 2: Forward to Agent
UI Copy:

Header:
Send to Signal for verification

Body:
Signal will analyze this image and check reliable sources to verify whether it is accurate.

Your message will not be shared publicly.

CTA:

Forward to Signal

Optional trust badge:
🔒 Private • 🔎 Fact-checked • ⚖️ Neutral

🤖 Screen 3: Chat with Signal (Agent Response)
Example Output:

Verdict: Misleading

Why:

The image claims that WHO declared XYZ.

WHO has not issued such a statement.

The statistic shown is from 2014, not current data.

The image has been circulating since 2021 in a different context.

Sources:

WHO official statement (link)

Reuters Fact Check (link)

3️⃣ Design Decisions You Should Be Intentional About

Because this is a WhatsApp context, psychology matters:

1. Avoid calling it “fake news”

People become defensive.

Use:

“Check accuracy”

“Verify before sharing”

“Learn more”

2. Provide confidence level

Add:

Confidence Level: High / Medium / Low

This increases trust and reduces hallucination risk.

3. Add friction to resharing

After verdict:

If False:

This content appears to be false.
Are you sure you want to forward it?

Small friction dramatically reduces spread.

4️⃣ Advanced Version (If You Want to Be More Sophisticated)

You can improve your agent by adding:

A. Reverse Image Search Step

Detect if image has appeared before.

Detect if it’s from a different country or time.

B. Emotional Language Detection

Flag:

ALL CAPS

“SHARE BEFORE THEY DELETE”

“THEY DON’T WANT YOU TO KNOW”

These are misinformation heuristics.