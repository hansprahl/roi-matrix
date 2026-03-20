import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Download, RotateCcw, Info, Clock, CheckSquare, Pencil, Check, X } from "lucide-react";
import { MatrixChart } from "../components/MatrixChart";
import { QuadrantBadge } from "../components/QuadrantBadge";
import { RatingSlider } from "../components/RatingSlider";
import { ViabilityCheck } from "../components/ViabilityCheck";
import { EvaluationSummary } from "../components/EvaluationSummary";
import { AiReport } from "../components/AiReport";
import { BENEFIT_CRITERIA, COST_CRITERIA } from "../constants/questions";
import {
  FilterState,
  Evaluation,
  generateId,
  saveEvaluation,
  buildShareText,
  calcWeightedScore,
  getComparison,
  setComparison,
} from "../lib/storage";
import { cn } from "@/lib/utils";

const EXAMPLE_BENEFIT_WEIGHTS = { socialImpact: 3, stakeholderTrust: 3, workforceWellbeing: 3, productQuality: 2, longTermViability: 3 };
const EXAMPLE_COST_WEIGHTS = { marginImpact: 3, laborTime: 2, operationalComplexity: 2, supplyChainRisk: 1, opportunityCost: 2 };
const EXAMPLE_BENEFIT_NOTES = {
  socialImpact: "Directly raises wages for ~310K US workers; measurable community benefit.",
  stakeholderTrust: "Strengthens employee trust and brand loyalty; documented in prior Costco wage actions.",
  workforceWellbeing: "Reduced turnover historically proven at Costco after prior wage increases.",
  productQuality: "Engaged workforce historically linked to fewer customer service errors.",
  longTermViability: "Precedent at Costco: prior wage increases correlated with revenue growth.",
};
const EXAMPLE_COST_NOTES = {
  marginImpact: "Estimated 0.3–0.5% net margin reduction based on labor as ~70% of operating cost.",
  laborTime: "HR program changes required; limited to 1 FTE per region for implementation.",
  operationalComplexity: "Payroll system updates and benefits recalculation required across 870 clubs.",
  supplyChainRisk: "Minimal; supplier wages not directly impacted.",
  opportunityCost: "Defers one regional expansion per analyst estimate.",
};

const EXAMPLE = {
  backgroundInfo: "Costco Wholesale Corporation operates ~870 warehouse clubs globally, with ~310,000 employees (US). The company has a track record of above-market wages and employee-first policies. This evaluation examines a proposed company-wide minimum wage increase to $25/hr. Context: current US federal minimum is $7.25/hr; Costco's current average is ~$23/hr. The decision involves balancing employee welfare and retention against margin pressure and investor expectations. Industry competitors (Walmart, Sam's Club) average $15-17/hr.",
  stakeholders: "Board of Directors, CFO, Regional VPs, Employee Representatives, Institutional Investors, Community Partners",
  description: "Costco Wholesale company-wide wage increase to $25/hr minimum across all locations",
  benefit: { socialImpact: 9, stakeholderTrust: 8, workforceWellbeing: 9, productQuality: 8, longTermViability: 8 },
  cost: { marginImpact: 7, laborTime: 6, operationalComplexity: 7, supplyChainRisk: 6, opportunityCost: 8 },
  filterChecks: [true, true, true, true, false],
  filterNotes: [
    "Phased rollout across 3 regions in Q1",
    "Quarterly stakeholder reporting committed",
    "Improves workforce + customer retention scores",
    "Voluntary employment; market-driven pricing retained",
    "",
  ],
};

const DEFAULT_BENEFIT_RATINGS = { socialImpact: 5, stakeholderTrust: 5, workforceWellbeing: 5, productQuality: 5, longTermViability: 5 };
const DEFAULT_COST_RATINGS = { marginImpact: 5, laborTime: 5, operationalComplexity: 5, supplyChainRisk: 5, opportunityCost: 5 };
const DEFAULT_WEIGHTS = (keys: string[]) => Object.fromEntries(keys.map(k => [k, 2]));

function getQuadrant(benefit: number, cost: number) {
  const isHighBenefit = benefit >= 5.5;
  const isHighCost = cost >= 5.5;
  if (isHighBenefit && !isHighCost) {
    return { label: "REQUIRED", subtitle: "Ethical baseline — must implement", color: "var(--color-required)", description: "Ethical baseline – must implement (Integrity, Trust, Respect)" };
  } else if (isHighBenefit && isHighCost) {
    return { label: "ENCOURAGED", subtitle: "Strategic long-term investment", color: "var(--color-encouraged)", description: "Strategic long-term investment (Viability + Fairness) – proceed with Conditional Adoption review" };
  } else if (!isHighBenefit && !isHighCost) {
    return { label: "DISCOURAGED", subtitle: "Revise, limit, or reject", color: "var(--color-discouraged)", description: "Revise, limit, or reject (protect Accountability & Rule of Law)" };
  } else {
    return { label: "PROHIBITED", subtitle: "Do not proceed", color: "var(--color-prohibited)", description: "Do not proceed (preserve long-term Viability)" };
  }
}

const benefitKeys = BENEFIT_CRITERIA.map(c => c.key);
const costKeys = COST_CRITERIA.map(c => c.key);
const emptyFilter: FilterState = { checks: [false, false, false, false, false], notes: ["", "", "", "", ""] };

export function MatrixPage() {
  const [backgroundInfo, setBackgroundInfo] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [description, setDescription] = useState("");

  const [benefitRatings, setBenefitRatings] = useState<Record<string, number>>({ ...DEFAULT_BENEFIT_RATINGS });
  const [costRatings, setCostRatings] = useState<Record<string, number>>({ ...DEFAULT_COST_RATINGS });
  const [benefitNotes, setBenefitNotes] = useState<Record<string, string>>({});
  const [costNotes, setCostNotes] = useState<Record<string, string>>({});
  const [benefitWeights, setBenefitWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS(benefitKeys));
  const [costWeights, setCostWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS(costKeys));
  const [customBenefitLabels, setCustomBenefitLabels] = useState<Record<string, string>>({});
  const [customCostLabels, setCustomCostLabels] = useState<Record<string, string>>({});
  const [editingBenefitLabels, setEditingBenefitLabels] = useState(false);
  const [editingCostLabels, setEditingCostLabels] = useState(false);

  const [filterState, setFilterState] = useState<FilterState>(emptyFilter);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>(null);

  const [comparisonEval, setComparisonEval] = useState<Evaluation | null>(() => getComparison());

  // Check for pending load from history (stored in localStorage before navigation)
  useEffect(() => {
    const raw = localStorage.getItem("roi_pending_load");
    if (!raw) return;
    try {
      const evalData = JSON.parse(raw) as Evaluation;
      localStorage.removeItem("roi_pending_load");
      setBackgroundInfo(evalData.backgroundInfo || "");
      setStakeholders(evalData.stakeholders || "");
      setDescription(evalData.description || "");
      setBenefitRatings({ ...DEFAULT_BENEFIT_RATINGS, ...evalData.benefitRatings });
      setCostRatings({ ...DEFAULT_COST_RATINGS, ...evalData.costRatings });
      setBenefitNotes(evalData.benefitNotes || {});
      setCostNotes(evalData.costNotes || {});
      setBenefitWeights(evalData.benefitWeights ? { ...DEFAULT_WEIGHTS(benefitKeys), ...evalData.benefitWeights } : DEFAULT_WEIGHTS(benefitKeys));
      setCostWeights(evalData.costWeights ? { ...DEFAULT_WEIGHTS(costKeys), ...evalData.costWeights } : DEFAULT_WEIGHTS(costKeys));
      setCustomBenefitLabels(evalData.customBenefitLabels || {});
      setCustomCostLabels(evalData.customCostLabels || {});
      setFilterState({
        checks: evalData.filterChecks?.length ? evalData.filterChecks : emptyFilter.checks,
        notes: evalData.filterNotes?.length ? evalData.filterNotes : emptyFilter.notes,
      });
      setSaved(false);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for comparison updates from HistoryPage
  useEffect(() => {
    const handler = () => setComparisonEval(getComparison());
    window.addEventListener("roi:comparison-changed", handler);
    return () => window.removeEventListener("roi:comparison-changed", handler);
  }, []);

  const benefitScore = parseFloat(calcWeightedScore(benefitRatings, benefitWeights, benefitKeys).toFixed(1));
  const costScore = parseFloat(calcWeightedScore(costRatings, costWeights, costKeys).toFixed(1));
  const quadrant = getQuadrant(benefitScore, costScore);

  const showFilter = quadrant.label === "ENCOURAGED" || (quadrant.label === "REQUIRED" && costScore > 7.0);
  const filterYesCount = filterState.checks.filter(Boolean).length;

  const markDirty = () => { if (saved) setSaved(false); };

  const handleLoadExample = () => {
    setBackgroundInfo(EXAMPLE.backgroundInfo);
    setStakeholders(EXAMPLE.stakeholders);
    setDescription(EXAMPLE.description);
    setBenefitRatings({ ...EXAMPLE.benefit });
    setCostRatings({ ...EXAMPLE.cost });
    setBenefitNotes({ ...EXAMPLE_BENEFIT_NOTES });
    setCostNotes({ ...EXAMPLE_COST_NOTES });
    setBenefitWeights({ ...EXAMPLE_BENEFIT_WEIGHTS });
    setCostWeights({ ...EXAMPLE_COST_WEIGHTS });
    setCustomBenefitLabels({});
    setCustomCostLabels({});
    setFilterState({ checks: [...EXAMPLE.filterChecks], notes: [...EXAMPLE.filterNotes] });
    setSaved(false);
  };

  const handleReset = () => {
    setBackgroundInfo("");
    setStakeholders("");
    setDescription("");
    setBenefitRatings({ ...DEFAULT_BENEFIT_RATINGS });
    setCostRatings({ ...DEFAULT_COST_RATINGS });
    setBenefitNotes({});
    setCostNotes({});
    setBenefitWeights(DEFAULT_WEIGHTS(benefitKeys));
    setCostWeights(DEFAULT_WEIGHTS(costKeys));
    setCustomBenefitLabels({});
    setCustomCostLabels({});
    setFilterState(emptyFilter);
    setSaved(false);
  };

  const buildEvalData = (): Evaluation => ({
    id: generateId(),
    createdAt: Date.now(),
    backgroundInfo,
    stakeholders,
    description,
    benefitRatings,
    costRatings,
    benefitNotes,
    costNotes,
    benefitWeights,
    costWeights,
    customBenefitLabels,
    customCostLabels,
    benefitScore,
    costScore,
    quadrantLabel: quadrant.label,
    quadrantColor: quadrant.color,
    quadrantDescription: quadrant.description,
    filterUsed: showFilter,
    filterChecks: filterState.checks,
    filterNotes: filterState.notes,
    filterYesCount,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    saveEvaluation(buildEvalData());
    setSaving(false);
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 3000);
  };

  const handleShare = async () => {
    const text = buildShareText(buildEvalData());
    try {
      if (navigator.share) {
        await navigator.share({ title: "ROI Evaluation", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Report copied to clipboard!");
      }
    } catch {}
  };

  const clearComparison = () => {
    setComparison(null);
    setComparisonEval(null);
    window.dispatchEvent(new CustomEvent("roi:comparison-changed"));
  };

  const comparisonForChart = comparisonEval
    ? { benefitScore: comparisonEval.benefitScore, costScore: comparisonEval.costScore, label: comparisonEval.description ? comparisonEval.description.slice(0, 22) + (comparisonEval.description.length > 22 ? "…" : "") : "Compare" }
    : undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden font-sans">

      {/* LEFT PANEL */}
      <div className="w-full lg:w-[45%] flex-shrink-0 bg-card border-r border-border flex flex-col lg:h-screen lg:overflow-y-auto print:hidden">
        <div className="p-6 md:p-8 flex-1 flex flex-col">

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight mb-3">
              Return on Integrity: <br className="hidden lg:block"/>
              <span className="text-primary">Benefit-Cost Matrix</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              A principled decision tool inspired by Daniels Principles. High-benefit actions are evaluated for courageous yet pragmatic implementation.
            </p>

            <div className="flex gap-3 mt-6">
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors">
                <CheckSquare className="w-4 h-4" /> Matrix
              </Link>
              <Link href="/history" className="inline-flex items-center gap-2 px-4 py-2 bg-input/50 text-foreground/80 border border-border hover:bg-input hover:text-foreground rounded-lg text-sm font-semibold transition-colors">
                <Clock className="w-4 h-4" /> History
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 px-4 py-2 bg-input/50 text-foreground/80 border border-border hover:bg-input hover:text-foreground rounded-lg text-sm font-semibold transition-colors ml-auto">
                <Info className="w-4 h-4" /> About
              </Link>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 mb-8 lg:mb-0">
            <MatrixChart benefitScore={benefitScore} costScore={costScore} comparison={comparisonForChart} />
            <QuadrantBadge quadrant={quadrant} costScore={costScore} />

            {/* Comparison badge */}
            {comparisonEval && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-input/50 border border-border text-sm">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-foreground/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Comparing with</p>
                  <p className="text-xs text-foreground/80 font-medium truncate">{comparisonEval.description || "Untitled Evaluation"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">B: {comparisonEval.benefitScore.toFixed(1)} / C: {comparisonEval.costScore.toFixed(1)}</p>
                </div>
                <button onClick={clearComparison} className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors" title="Clear comparison">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 lg:h-screen lg:overflow-y-auto bg-background p-4 md:p-6 lg:p-8 pb-24">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Background Information + Stakeholders */}
          <section className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold mb-1">Background Information</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mb-3">
                Paste relevant context — company details, industry data, stakeholder concerns, prior decisions — to inform this evaluation and AI report.
              </p>
              <textarea
                value={backgroundInfo}
                onChange={(e) => { setBackgroundInfo(e.target.value); markDirty(); }}
                placeholder="Paste background context here: company overview, industry data, stakeholder concerns, prior decisions, constraints, goals…"
                className="w-full bg-input/50 border border-border rounded-xl p-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 min-h-[120px] resize-y transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Stakeholders Consulted</label>
              <input
                type="text"
                value={stakeholders}
                onChange={(e) => { setStakeholders(e.target.value); markDirty(); }}
                placeholder="e.g. Board, CFO, HR Director, Employee Representatives, Community Partners…"
                className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </section>

          {/* Proposed Action */}
          <section className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold">Proposed Action</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleLoadExample} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-md text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Example
                </button>
                <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-input text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-md text-xs font-semibold transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); markDirty(); }}
              placeholder="Describe the business action being evaluated..."
              className="w-full bg-input/50 border border-border rounded-xl p-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 min-h-[100px] resize-y transition-all"
            />
          </section>

          {/* Benefit Ratings */}
          <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-required shadow-[0_0_8px_rgba(76,175,80,0.6)]" />
              <h2 className="text-xl font-bold flex-1">Benefit Ratings</h2>
              <button
                onClick={() => setEditingBenefitLabels(v => !v)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  editingBenefitLabels ? "bg-primary/15 text-primary border border-primary/30" : "bg-input text-muted-foreground border border-border hover:text-foreground"
                )}
                title="Edit criterion labels"
              >
                {editingBenefitLabels ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                {editingBenefitLabels ? "Done" : "Labels"}
              </button>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-required">{benefitScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase ml-1">/ 10</span>
              </div>
            </div>
            <div className="space-y-3">
              {BENEFIT_CRITERIA.map(c => (
                <RatingSlider
                  key={c.key}
                  label={customBenefitLabels[c.key] || c.label}
                  value={benefitRatings[c.key]}
                  colorType="benefit"
                  tooltip={c.tooltip}
                  weight={benefitWeights[c.key] ?? 2}
                  note={benefitNotes[c.key] || ""}
                  editMode={editingBenefitLabels}
                  onChange={(val) => { setBenefitRatings(prev => ({ ...prev, [c.key]: val })); markDirty(); }}
                  onWeightChange={(w) => { setBenefitWeights(prev => ({ ...prev, [c.key]: w })); markDirty(); }}
                  onNoteChange={(n) => { setBenefitNotes(prev => ({ ...prev, [c.key]: n })); markDirty(); }}
                  onLabelChange={(lbl) => setCustomBenefitLabels(prev => ({ ...prev, [c.key]: lbl }))}
                />
              ))}
            </div>
            {editingBenefitLabels && (
              <button onClick={() => setCustomBenefitLabels({})} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
                Reset to default labels
              </button>
            )}
          </section>

          {/* Cost Ratings */}
          <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-prohibited shadow-[0_0_8px_rgba(244,67,54,0.6)]" />
              <h2 className="text-xl font-bold flex-1">Cost Ratings</h2>
              <button
                onClick={() => setEditingCostLabels(v => !v)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  editingCostLabels ? "bg-primary/15 text-primary border border-primary/30" : "bg-input text-muted-foreground border border-border hover:text-foreground"
                )}
                title="Edit criterion labels"
              >
                {editingCostLabels ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                {editingCostLabels ? "Done" : "Labels"}
              </button>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-prohibited">{costScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase ml-1">/ 10</span>
              </div>
            </div>
            <div className="space-y-3">
              {COST_CRITERIA.map(c => (
                <RatingSlider
                  key={c.key}
                  label={customCostLabels[c.key] || c.label}
                  value={costRatings[c.key]}
                  colorType="cost"
                  tooltip={c.tooltip}
                  weight={costWeights[c.key] ?? 2}
                  note={costNotes[c.key] || ""}
                  editMode={editingCostLabels}
                  onChange={(val) => { setCostRatings(prev => ({ ...prev, [c.key]: val })); markDirty(); }}
                  onWeightChange={(w) => { setCostWeights(prev => ({ ...prev, [c.key]: w })); markDirty(); }}
                  onNoteChange={(n) => { setCostNotes(prev => ({ ...prev, [c.key]: n })); markDirty(); }}
                  onLabelChange={(lbl) => setCustomCostLabels(prev => ({ ...prev, [c.key]: lbl }))}
                />
              ))}
            </div>
            {editingCostLabels && (
              <button onClick={() => setCustomCostLabels({})} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
                Reset to default labels
              </button>
            )}
          </section>

          {/* Conditional Filter */}
          {showFilter && (
            <ViabilityCheck
              state={filterState}
              onChange={(i, c, n) => {
                const newChecks = [...filterState.checks]; newChecks[i] = c;
                const newNotes = [...filterState.notes]; newNotes[i] = n;
                setFilterState({ checks: newChecks, notes: newNotes });
                markDirty();
              }}
            />
          )}

          {/* AI Report */}
          <AiReport
            backgroundInfo={backgroundInfo}
            stakeholders={stakeholders}
            description={description}
            benefitRatings={benefitRatings}
            costRatings={costRatings}
            benefitWeights={benefitWeights}
            costWeights={costWeights}
            benefitNotes={benefitNotes}
            costNotes={costNotes}
            customBenefitLabels={customBenefitLabels}
            customCostLabels={customCostLabels}
            benefitScore={benefitScore}
            costScore={costScore}
            quadrantLabel={quadrant.label}
            quadrantDescription={quadrant.description}
            filterUsed={showFilter}
            filterChecks={filterState.checks}
            filterNotes={filterState.notes}
            filterYesCount={filterYesCount}
          />

          {/* Evaluation Summary */}
          <EvaluationSummary
            backgroundInfo={backgroundInfo}
            stakeholders={stakeholders}
            description={description}
            benefitRatings={benefitRatings}
            costRatings={costRatings}
            benefitNotes={benefitNotes}
            costNotes={costNotes}
            benefitWeights={benefitWeights}
            costWeights={costWeights}
            customBenefitLabels={customBenefitLabels}
            customCostLabels={customCostLabels}
            benefitScore={benefitScore}
            costScore={costScore}
            quadrantLabel={quadrant.label}
            filterUsed={showFilter}
            filterState={filterState}
            filterYesCount={filterYesCount}
            onSave={handleSave}
            onShare={handleShare}
            saving={saving}
            saved={saved}
          />

        </div>
      </div>

    </div>
  );
}
