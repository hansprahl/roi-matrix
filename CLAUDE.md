# roi-matrix — Return on Integrity: Benefit-Cost Decision Matrix

## What this is

A mobile app (Expo/React Native) that helps evaluate business decisions using an ethics-grounded benefit-cost matrix. Inspired by the **Daniels Principles** (integrity, trust, fairness, accountability, transparency, respect, rule of law, viability) and exemplar companies (In-N-Out, AriZona Tea, Costco).

Originally built in Replit. Pulled to local at `/Users/hansprahl/Projects/roi-matrix`.

---

## How it works

1. User describes a proposed action
2. Rates it across 5 **benefit criteria** and 5 **cost criteria** (1–10 sliders)
3. App plots the result on a 2x2 matrix → assigns one of 4 quadrant verdicts
4. If verdict is ENCOURAGED or borderline REQUIRED, a **Conditional Adoption Filter** appears (5 yes/no questions)
5. User can save the evaluation locally, share it, or generate an AI **executive report** (streamed from backend via SSE)

---

## The matrix

**Threshold:** 5.5 on both axes

| | Low Cost | High Cost |
|---|---|---|
| **High Benefit** | REQUIRED — ethical baseline, must implement | ENCOURAGED — strategic investment, proceed with filter |
| **Low Benefit** | DISCOURAGED — revise, limit, or reject | PROHIBITED — do not proceed |

### Benefit criteria (`constants/questions.ts`)
- Social Impact / Harm Reduction
- Stakeholder Trust
- Workforce Stability & Well-being
- Product / Service Quality
- Long-term Viability & Fairness

### Cost criteria
- Margin Impact
- Labor Time
- Operational Complexity
- Supply Chain Risk
- Opportunity Cost

### Conditional Adoption Filter (5 questions)
Shown when quadrant is ENCOURAGED, or REQUIRED with cost score > 7.0:
1. Protects long-term success? (phased rollout, reserves, ROI tracking)
2. Includes clear oversight? (monitoring, stakeholder reporting, course-correction)
3. Supports the four key areas? (≥3 of: Community Investment, Healthy Workforce, Quality Products, Employee Culture)
4. Fits free-market values? (voluntary exchange, informed consent, competition on genuine value)
5. Can we test it first? (low-risk pilot with clear success metrics and exit plan)

---

## Architecture

```
artifacts/
    mobile/          — Expo/React Native app
        app/
            (tabs)/
                index.tsx       — main matrix screen (ratings, chart, filter, save/share)
                history.tsx     — saved evaluations history
                about.tsx       — about/philosophy page
        components/
            MatrixChart.tsx     — animated SVG 2x2 matrix (react-native-svg + reanimated)
            RatingSlider.tsx    — 1–10 slider for each criterion
            QuadrantBadge.tsx   — verdict display (REQUIRED/ENCOURAGED/etc.)
            ViabilityCheck.tsx  — Conditional Adoption Filter (5 yes/no + notes)
            EvaluationSummary.tsx — save/share/generate-report controls
        constants/
            questions.ts        — BENEFIT_CRITERIA, COST_CRITERIA, FILTER_QUESTIONS
            colors.ts           — theme + quadrant color constants
        lib/
            storage.ts          — AsyncStorage save/load, share (text export), generateId

    api-server/      — Express + TypeScript backend
        src/
            routes/
                generate-report.ts  — POST /generate-report → streams AI executive analysis via SSE
                health.ts
                index.ts
            app.ts
            index.ts
```

---

## AI report generation (`artifacts/api-server/src/routes/generate-report.ts`)

- Model: `claude-sonnet-4-6`
- Streaming SSE response
- Takes: description, all ratings/weights/notes, quadrant label, filter results
- Outputs: 3-paragraph executive briefing (verdict → analysis → next steps)
- Prose only — no headers, bullets, or score numbers
- References Daniels Principles where relevant
- Framed as a board briefing, not academic analysis

---

## Environment

```
# artifacts/api-server/.env
ANTHROPIC_API_KEY=...
```

---

## State from Replit

- Came from Replit — may have Replit-specific config (`.replit`, `.replitignore`, `attached_assets/`)
- These can be ignored for local dev
- `node_modules` exist but may need reinstall: `cd artifacts/mobile && npm install` / `cd artifacts/api-server && npm install`

---

## Local dev

```bash
# Backend
cd artifacts/api-server && npm run dev   # or npx ts-node src/index.ts

# Mobile (Expo)
cd artifacts/mobile && npx expo start
```

---

## What's built

- [x] Full matrix evaluation flow (ratings → quadrant → filter)
- [x] Animated SVG matrix chart with spring-animated dot
- [x] Conditional Adoption Filter with per-question notes
- [x] Save evaluations locally (AsyncStorage)
- [x] Share evaluation as text
- [x] Load example (Costco wage increase)
- [x] AI executive report generation (streaming SSE)
- [x] History tab for saved evaluations
- [x] Custom benefit/cost labels (backend supports them)
- [x] Weighted criteria support (backend supports Low/Medium/High weights)

---

## Known gaps / what's NOT done

- Custom weights UI — backend accepts `benefitWeights`/`costWeights` but the mobile UI doesn't expose them yet (all default to Medium)
- Custom labels UI — backend accepts `customBenefitLabels`/`customCostLabels` but UI uses defaults
- No deploy — no Vercel/Fly config exists for this project yet
- No auth — single-user local storage only

---

## Broader connection

This tool was built in the context of the **NECC 2026** business ethics case competition (Harlan Hills Energy, $50M allocation across 15 proposals). The ROI matrix logic maps directly to how one would evaluate each HHE proposal. The "ROI Benefit Cost Matrix" PDF in Google Drive (ID: `1geOQh5a6fpFiJA2uCQPKmDsCXTnSa__z`) may be related reference material.
