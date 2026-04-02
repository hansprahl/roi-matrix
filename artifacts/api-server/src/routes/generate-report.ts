import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const weightLabel = (w: number) => (w === 1 ? "Low" : w === 3 ? "High" : "Medium");

router.post("/generate-report", async (req, res) => {
  const {
    backgroundInfo,
    stakeholders,
    description,
    benefitRatings,
    costRatings,
    benefitWeights,
    costWeights,
    benefitNotes,
    costNotes,
    customBenefitLabels,
    customCostLabels,
    benefitScore,
    costScore,
    quadrantLabel,
    filterUsed,
    filterChecks,
    filterNotes,
    filterYesCount,
    benefitCriteria,
    costCriteria,
    filterQuestions,
  } = req.body;

  let prompt = `You are a senior business ethics advisor writing an executive briefing for a board or leadership team. The quantitative assessment has already been presented to the reader. Do not restate the scores or ratings — synthesize, interpret, and advise.\n\n`;

  prompt += `PROPOSED ACTION: ${description || "(Not specified)"}\n`;
  prompt += `MATRIX RESULT: ${quadrantLabel} — Weighted Benefit Score ${benefitScore}/10 | Weighted Cost Score ${costScore}/10\n\n`;

  if (backgroundInfo?.trim()) {
    prompt += `CONTEXT\n${backgroundInfo.trim()}\n\n`;
  }

  if (stakeholders?.trim()) {
    prompt += `STAKEHOLDERS CONSULTED: ${stakeholders.trim()}\n\n`;
  }

  const highBenefits: string[] = [];
  const lowBenefits: string[] = [];
  for (const c of (benefitCriteria ?? [])) {
    const label = customBenefitLabels?.[c.key] || c.label;
    const rating = benefitRatings?.[c.key] ?? 5;
    const weight = benefitWeights?.[c.key] ?? 2;
    const note = benefitNotes?.[c.key];
    const entry = `${label} [${weightLabel(weight)} priority, ${rating}/10]${note?.trim() ? ` — ${note.trim()}` : ""}`;
    if (rating >= 7) highBenefits.push(entry);
    else lowBenefits.push(entry);
  }

  const highCosts: string[] = [];
  const lowCosts: string[] = [];
  for (const c of (costCriteria ?? [])) {
    const label = customCostLabels?.[c.key] || c.label;
    const rating = costRatings?.[c.key] ?? 5;
    const weight = costWeights?.[c.key] ?? 2;
    const note = costNotes?.[c.key];
    const entry = `${label} [${weightLabel(weight)} priority, ${rating}/10]${note?.trim() ? ` — ${note.trim()}` : ""}`;
    if (rating >= 7) highCosts.push(entry);
    else lowCosts.push(entry);
  }

  if (highBenefits.length) prompt += `STRONG BENEFIT SIGNALS\n${highBenefits.map(e => `• ${e}`).join("\n")}\n\n`;
  if (lowBenefits.length) prompt += `WEAKER BENEFIT AREAS\n${lowBenefits.map(e => `• ${e}`).join("\n")}\n\n`;
  if (highCosts.length) prompt += `SIGNIFICANT COST CONCERNS\n${highCosts.map(e => `• ${e}`).join("\n")}\n\n`;
  if (lowCosts.length) prompt += `MANAGEABLE COST AREAS\n${lowCosts.map(e => `• ${e}`).join("\n")}\n\n`;

  if (filterUsed) {
    prompt += `CONDITIONAL ADOPTION FILTER RESULTS (${filterYesCount}/5 YES)\n`;
    (filterQuestions ?? []).forEach((q: string, i: number) => {
      prompt += `• [${filterChecks?.[i] ? "YES" : "NO"}] ${q}`;
      if (filterNotes?.[i]?.trim()) prompt += ` — ${filterNotes[i].trim()}`;
      prompt += "\n";
    });
    prompt += "\n";
  }

  prompt += `WRITE A CONCISE EXECUTIVE ANALYSIS IN EXACTLY THREE SHORT PARAGRAPHS (target 220–280 words total):\n\n`;
  prompt += `Paragraph 1 — VERDICT: One clear declarative sentence stating your recommendation for this specific action. Then 2–3 sentences explaining the single most important reason — not a list, a focused argument. Reference the Daniels Principles (integrity, fairness, trust, promise-keeping, responsible citizenship) where they arise naturally.\n\n`;
  prompt += `Paragraph 2 — ANALYSIS: Identify the most important tension or risk in this decision — where benefit strength meets cost pressure, or where integrity demands outweigh financial concerns. Draw on the rationale notes provided. Keep it sharp: one key insight, not a summary of all criteria.\n\n`;
  prompt += `Paragraph 3 — NEXT STEPS: Two or three specific, concrete actions this organization should take within the next 30–90 days. Be directive. No hedging.\n\n`;
  prompt += `RULES: Flowing prose only. No headers, no bullets, no markdown, no bold text. Do not mention score numbers. Write as if presenting to a board. Be direct and decisive — this is a briefing, not an academic analysis.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
      messages: [{ role: "user", content: prompt }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("AI report generation error:", err);
    res.write(`data: ${JSON.stringify({ error: "Report generation failed. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
