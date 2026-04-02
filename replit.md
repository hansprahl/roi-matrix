# Return on Integrity: Benefit-Cost Matrix — Project Reference

## Project Purpose

A web platform for evaluating business decisions against Daniels Principles. Users rate 5 benefit and 5 cost criteria (1–10) with notes and weights, plot results on a 4-quadrant matrix, optionally complete a Conditional Adoption Filter, and generate an AI executive narrative report. Evaluations can be saved, loaded, compared side-by-side, and exported.

---

## Architecture Overview

pnpm monorepo. Two active artifacts: the React/Vite web app and an Express API server. No database — all user data is in localStorage.

```
artifacts/
  roi-matrix/          # React + Vite + Tailwind SPA (main product)
  api-server/          # Express 5 API server (AI report generation only)
  mobile/              # Expo mobile app (exists but not actively developed)
  mockup-sandbox/      # Vite component preview server (design tooling)
lib/
  db/                  # Drizzle ORM + PostgreSQL (unused by roi-matrix)
  api-spec/            # OpenAPI spec + Orval codegen
  api-zod/             # Generated Zod schemas
  api-client-react/    # Generated React Query hooks
```

---

## Web App (`artifacts/roi-matrix`)

### Stack
- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Wouter for routing
- Dark theme throughout

### Design Tokens (CSS variables in `src/index.css`)
| Token | Value | Usage |
|---|---|---|
| `--background` | `hsl(225,21%,7%)` | Page background |
| `--card` | `hsl(226,20%,13%)` | Card surfaces |
| `--border` | `hsl(229,24%,22%)` | Borders |
| `--primary` | `hsl(226,100%,71%)` | Accent / buttons |
| `--required` | `hsl(122,39%,49%)` | REQUIRED quadrant (green) |
| `--encouraged` | `hsl(207,90%,54%)` | ENCOURAGED quadrant (blue) |
| `--discouraged` | `hsl(36,100%,50%)` | DISCOURAGED quadrant (orange) |
| `--prohibited` | `hsl(4,90%,58%)` | PROHIBITED quadrant (red) |

### Routes
| Path | Component | Description |
|---|---|---|
| `/` | `MatrixPage` | Main evaluation form |
| `/history` | `HistoryPage` | Saved evaluations list |
| `/about` | `AboutPage` | 11-section accordion help guide |

### Pages

**`MatrixPage.tsx`** — All evaluation state lives here. Key state:
- `backgroundInfo`, `stakeholders`, `description` — text inputs
- `benefitRatings`, `costRatings` — `Record<string, number>` (1–10 per criterion)
- `benefitWeights`, `costWeights` — `Record<string, number>` (1=Low, 2=Medium, 3=High)
- `benefitNotes`, `costNotes` — `Record<string, string>` (expandable rationale per criterion)
- `customBenefitLabels`, `customCostLabels` — user-editable criterion names
- `filterState` — `{ checks: boolean[5], notes: string[5] }` for the Conditional Adoption Filter
- `comparisonEval` — second evaluation plotted as dashed dot on the matrix

Right panel sections (in order, all `print:hidden` except AiReport):
1. Background Information + Stakeholders
2. Proposed Action (with Example / Reset buttons)
3. Benefit Ratings (5 RatingSlider components)
4. Cost Ratings (5 RatingSlider components)
5. Conditional Adoption Filter (shown for ENCOURAGED, or REQUIRED with high cost)
6. **AiReport** — the only section that prints
7. EvaluationSummary — Save / Copy Report Text / Print buttons

**`HistoryPage.tsx`** — Reads from localStorage `roi_evaluations`. Cards support Load, Compare, Share (copy text), Delete. Load writes to `roi_pending_load` then navigates to `/`. Compare writes to `roi_comparison`.

**`AboutPage.tsx`** — 11 collapsible accordion sections covering How to Use, Four Quadrants, Ratings/Weights/Notes, Benefit Criteria, Cost Criteria, Conditional Filter, AI Report, History/Compare, Print/Export, Daniels Principles, Real-World Exemplars.

### Components

**`MatrixChart.tsx`** — SVG 4-quadrant chart. Animated dot for current evaluation. Optional dashed dot for comparison eval. Quadrant boundary at (5, 5).

**`RatingSlider.tsx`** — One rating criterion row. Has: pip-style value display (1–10), L/M/H weight badge, info tooltip, expandable note textarea, optional label edit mode.

**`QuadrantBadge.tsx`** — Colored badge showing current quadrant with its description text.

**`ViabilityCheck.tsx`** — Conditional Adoption Filter. 5 yes/no questions with note inputs. Shows YES count / 5.

**`AiReport.tsx`** — Two sections:
1. **Assessment Summary** (always visible, no button needed) — quadrant badge, scores, table of all 10 criteria with progress bars / weight badges / expandable notes, filter results
2. **Executive Analysis** (requires clicking "Generate Executive Analysis" button) — streams AI response via SSE with typewriter effect; Copy button

Print-only header (hidden in browser, shown in print via `hidden print:block`): title, subtitle, date.

**`EvaluationSummary.tsx`** — Action bar with Save Evaluation, Copy Report Text, Print buttons. Share button copies full plain-text report to clipboard and shows "Copied to Clipboard" green confirmation for 2.5 seconds.

### Key Library Files

**`src/lib/storage.ts`**
- `Evaluation` — the save format type
- `calcWeightedScore(ratings, weights, criteria)` — weighted average (not simple mean)
- `buildShareText(evaluation)` — formats full plain-text report for clipboard
- `saveEvaluation(eval)` / `getEvaluations()` — localStorage CRUD
- `getComparison()` / `setComparison()` — comparison eval in localStorage `roi_comparison`
- `generateId()` — `Date.now().toString() + Math.random().toString(36).substring(2, 9)` (no uuid)

**`src/constants/questions.ts`**
- `BENEFIT_CRITERIA` — 5 criteria: socialImpact, stakeholderTrust, workforceWellbeing, productQuality, longTermViability
- `COST_CRITERIA` — 5 criteria: marginImpact, laborTime, operationalComplexity, supplyChainRisk, opportunityCost
- `FILTER_QUESTIONS` — 5 yes/no questions for the Conditional Adoption Filter

### Print / PDF Export

`window.print()` triggered from the Print button. CSS `@media print` rules in `src/index.css`:
- All form sections hidden via `print:hidden` Tailwind class
- Left panel hidden (chart, navigation)
- AiReport takes full page width
- Print-only header visible via `hidden print:block` on a div inside AiReport
- White background, clean typography, proper page breaks
- Quadrant colors preserved via `print-color-adjust: exact`

---

## API Server (`artifacts/api-server`)

### Stack
- Express 5 + TypeScript
- OpenAI SDK (via Replit AI Integrations proxy — no user API key needed)
- esbuild CJS bundle for production

### Routes
- `GET /api/healthz` — health check
- `POST /api/generate-report` — streams AI executive analysis via SSE

### AI Report Generation (`src/routes/generate-report.ts`)
- Model: `gpt-5.2` via Replit's OpenAI proxy
- Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` (auto-provisioned by Replit)
- Builds a structured prompt from all evaluation fields (description, scores, criteria notes, filter results)
- Streams SSE: `data: {"content":"..."}` chunks, ends with `data: {"done":true}`
- Error sends: `data: {"error":"..."}`
- Prompt instructs: 3 paragraphs — Verdict → Analysis → Next Steps; ~250 words; no markdown/bullets/headers; board-level briefing tone referencing Daniels Principles

### Production Serving
`src/app.ts` in production also serves the ROI matrix static build and SPA fallback:
```typescript
app.use(express.static("artifacts/roi-matrix/dist/public"));
app.get("/{*path}", (_req, res) => res.sendFile("index.html")); // Express 5 wildcard
```

---

## URL Routing (Important)

### Development
- Vite proxy: `/proxy-api` → `http://localhost:8080` (strips `/proxy-api` prefix)
- AiReport calls: `/proxy-api/api/generate-report`

### Production
- API server artifact config: `paths = ["/api"]` — Replit routes `/api/*` to port 8080
- AiReport calls: `/api/generate-report`
- Switch in `AiReport.tsx`: `import.meta.env.PROD ? "/api/generate-report" : "/proxy-api/api/generate-report"`

---

## Deployment

### Build command (in `.replit`)
```bash
set -e
pnpm install
cd artifacts/roi-matrix; BASE_PATH=/ ./node_modules/.bin/vite build
cd /home/runner/workspace/artifacts/api-server; ./node_modules/.bin/tsx ./build.ts
```

### Run command
```
node artifacts/api-server/dist/index.cjs
```

The API server serves both the API and the ROI matrix static files in production.

---

## LocalStorage Keys
| Key | Contents |
|---|---|
| `roi_evaluations` | Array of saved `Evaluation` objects |
| `roi_comparison` | Single `Evaluation` for side-by-side comparison |
| `roi_pending_load` | Single `Evaluation` written by History page, consumed by MatrixPage on mount |

---

## Workspace Info
- **Node**: 24
- **Package manager**: pnpm
- **TypeScript**: 5.9
- **Monorepo**: pnpm workspaces (`artifacts/*`, `lib/*`, `scripts`)
- **Typecheck**: `pnpm run typecheck` (tsc composite build from root)
