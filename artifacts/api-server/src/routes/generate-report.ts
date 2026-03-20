import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

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
    quadrantDescription,
    filterUsed,
    filterChecks,
    filterNotes,
    filterYesCount,
    benefitCriteria,
    costCriteria,
    filterQuestions,
  } = req.body;

  let prompt = `You are an expert business ethics analyst trained in the Daniels Principles framework. Write a professional narrative report for the following business decision evaluation.\n\n`;

  if (backgroundInfo?.trim()) {
    prompt += `BACKGROUND INFORMATION\n${backgroundInfo.trim()}\n\n`;
  }

  if (stakeholders?.trim()) {
    prompt += `STAKEHOLDERS CONSULTED\n${stakeholders.trim()}\n\n`;
  }

  prompt += `PROPOSED ACTION\n${description || "(Not specified)"}\n\n`;

  prompt += `MATRIX RESULT: ${quadrantLabel}\n${quadrantDescription}\n`;
  prompt += `Benefit Score: ${benefitScore}/10 (weighted) | Cost Score: ${costScore}/10 (weighted)\n\n`;

  prompt += `BENEFIT CRITERIA RATINGS\n`;
  for (const c of (benefitCriteria ?? [])) {
    const label = customBenefitLabels?.[c.key] || c.label;
    const rating = benefitRatings?.[c.key] ?? 5;
    const weight = benefitWeights?.[c.key] ?? 2;
    const note = benefitNotes?.[c.key];
    prompt += `- ${label} [${weightLabel(weight)} priority]: ${rating}/10`;
    if (note?.trim()) prompt += `\n  Rationale: ${note.trim()}`;
    prompt += "\n";
  }

  prompt += `\nCOST CRITERIA RATINGS\n`;
  for (const c of (costCriteria ?? [])) {
    const label = customCostLabels?.[c.key] || c.label;
    const rating = costRatings?.[c.key] ?? 5;
    const weight = costWeights?.[c.key] ?? 2;
    const note = costNotes?.[c.key];
    prompt += `- ${label} [${weightLabel(weight)} priority]: ${rating}/10`;
    if (note?.trim()) prompt += `\n  Rationale: ${note.trim()}`;
    prompt += "\n";
  }

  if (filterUsed) {
    prompt += `\nCONDITIONAL ADOPTION FILTER (${filterYesCount}/5 YES)\n`;
    (filterQuestions ?? []).forEach((q: string, i: number) => {
      prompt += `- [${filterChecks?.[i] ? "YES" : "NO"}] ${q}`;
      if (filterNotes?.[i]?.trim()) prompt += `\n  Note: ${filterNotes[i].trim()}`;
      prompt += "\n";
    });
  }

  prompt += `\nWRITE A 400-600 WORD PROFESSIONAL NARRATIVE REPORT THAT:\n`;
  prompt += `1. Opens with a clear executive summary sentence stating the recommendation\n`;
  prompt += `2. Analyzes the key benefit drivers and what they mean for this decision\n`;
  prompt += `3. Discusses cost concerns weighted by their priority level\n`;
  prompt += `4. References the Daniels Principles (integrity, trust, respect, accountability, rule of law, viability, fairness) naturally\n`;
  prompt += `5. If the conditional filter was used, incorporates those results and implications\n`;
  prompt += `6. Closes with 2-3 specific, actionable next steps\n`;
  prompt += `Write in flowing prose paragraphs only — no markdown headers, no bullet points, no bold text. Professional board-level tone.`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
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
