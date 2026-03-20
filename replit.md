# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

---

## Return on Integrity: Benefit-Cost Matrix (`artifacts/roi-matrix`)

React + Vite + Tailwind web app. Dark theme. No backend DB — all state in localStorage.

### Features
- **4-quadrant matrix chart** (REQUIRED / ENCOURAGED / DISCOURAGED / PROHIBITED) with animated SVG dot
- **Background Information** textarea + **Stakeholders Consulted** text input
- **Proposed Action** textarea with Example (Costco wage case study) and Reset buttons
- **Benefit / Cost Ratings** — 5 criteria each, with:
  - L/M/H **priority weight** pills (1=Low, 2=Medium default, 3=High) — affects weighted average score
  - **Tooltip** (info icon) with rating guidance per criterion
  - **Expandable rationale notes** (note icon toggles textarea below pips)
  - **Editable labels** — "Labels" button puts all criteria labels into edit mode
- **Weighted average scoring** (`calcWeightedScore`) — not simple mean
- **Conditional Adoption Filter** — 5 yes/no questions with notes; shown for ENCOURAGED quadrant or high-cost REQUIRED
- **AI Narrative Report** — POST `/proxy-api/api/generate-report` → api-server → OpenAI streaming SSE; shows typewriter effect; Copy button
- **Evaluation Summary** — bar chart of all ratings, Save / Share / Print buttons
- **Print/PDF export** — `window.print()` with `@media print` CSS for clean A4 output
- **Save to History** — localStorage `roi_evaluations`
- **History page** — expandable cards showing full evaluation details, weight labels, notes; Load / Compare / Share / Delete actions
- **Load from History** — writes to localStorage `roi_pending_load`, navigates to `/`, MatrixPage reads on mount
- **Comparison mode** — "Compare" button stores eval in `roi_comparison`; MatrixChart shows second dashed dot; left panel shows comparison badge with clear button

### Key files
- `src/pages/MatrixPage.tsx` — main form with all state
- `src/pages/HistoryPage.tsx` — saved evaluations list
- `src/components/MatrixChart.tsx` — SVG chart + comparison dot
- `src/components/RatingSlider.tsx` — weights + notes + tooltips + editable labels
- `src/components/AiReport.tsx` — AI report generation with SSE streaming
- `src/components/EvaluationSummary.tsx` — summary bars + print button
- `src/lib/storage.ts` — Evaluation type, calcWeightedScore, buildShareText, comparison helpers
- `src/constants/questions.ts` — criteria with tooltips, filter questions

### API Server
- `POST /api/generate-report` — streams AI narrative via SSE using OpenAI (gpt-5.2)
- Proxy: Vite dev server proxies `/proxy-api` → `localhost:8080` (api-server)
- Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`
