import React, { useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import { Download, RotateCcw, Info, Clock, CheckSquare } from "lucide-react";
import { MatrixChart } from "../components/MatrixChart";
import { QuadrantBadge } from "../components/QuadrantBadge";
import { RatingSlider } from "../components/RatingSlider";
import { ViabilityCheck } from "../components/ViabilityCheck";
import { EvaluationSummary } from "../components/EvaluationSummary";
import { BENEFIT_CRITERIA, COST_CRITERIA } from "../constants/questions";
import { FilterState, Evaluation, generateId, saveEvaluation, buildShareText } from "../lib/storage";

const EXAMPLE = {
  description: "Costco Wholesale company-wide wage increase to $25/hr minimum across all locations",
  benefit: { socialImpact: 9, stakeholderTrust: 8, workforceWellbeing: 9, productQuality: 8, longTermViability: 8 },
  cost: { marginImpact: 7, laborTime: 6, operationalComplexity: 7, supplyChainRisk: 6, opportunityCost: 8 },
};

function getQuadrant(benefit: number, cost: number) {
  const isHighBenefit = benefit >= 5.5;
  const isHighCost = cost >= 5.5;
  if (isHighBenefit && !isHighCost) {
    return {
      label: "REQUIRED",
      subtitle: "Ethical baseline — must implement",
      color: "var(--color-required)",
      description: "Ethical baseline – must implement (Integrity, Trust, Respect)",
    };
  } else if (isHighBenefit && isHighCost) {
    return {
      label: "ENCOURAGED",
      subtitle: "Strategic long-term investment",
      color: "var(--color-encouraged)",
      description: "Strategic long-term investment (Viability + Fairness) – proceed with Conditional Adoption review",
    };
  } else if (!isHighBenefit && !isHighCost) {
    return {
      label: "DISCOURAGED",
      subtitle: "Revise, limit, or reject",
      color: "var(--color-discouraged)",
      description: "Revise, limit, or reject (protect Accountability & Rule of Law)",
    };
  } else {
    return {
      label: "PROHIBITED",
      subtitle: "Do not proceed",
      color: "var(--color-prohibited)",
      description: "Do not proceed (preserve long-term Viability)",
    };
  }
}

export function MatrixPage() {
  const [description, setDescription] = useState("");
  
  const [benefitRatings, setBenefitRatings] = useState<Record<string, number>>({
    socialImpact: 5, stakeholderTrust: 5, workforceWellbeing: 5, productQuality: 5, longTermViability: 5
  });
  
  const [costRatings, setCostRatings] = useState<Record<string, number>>({
    marginImpact: 5, laborTime: 5, operationalComplexity: 5, supplyChainRisk: 5, opportunityCost: 5
  });

  const emptyFilter: FilterState = { checks: [false, false, false, false, false], notes: ["", "", "", "", ""] };
  const [filterState, setFilterState] = useState<FilterState>(emptyFilter);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>(null);

  const avg = (ratings: Record<string, number>) => Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;
  
  const benefitScore = parseFloat(avg(benefitRatings).toFixed(1));
  const costScore = parseFloat(avg(costRatings).toFixed(1));
  const quadrant = getQuadrant(benefitScore, costScore);

  const showFilter = quadrant.label === "ENCOURAGED" || (quadrant.label === "REQUIRED" && costScore > 7.0);
  const filterYesCount = filterState.checks.filter(Boolean).length;

  const markDirty = () => {
    if (saved) setSaved(false);
  };

  const handleLoadExample = () => {
    setDescription(EXAMPLE.description);
    setBenefitRatings({ ...EXAMPLE.benefit });
    setCostRatings({ ...EXAMPLE.cost });
    setFilterState({
      checks: [true, true, true, true, false],
      notes: [
        "Phased rollout across 3 regions in Q1",
        "Quarterly stakeholder reporting committed",
        "Improves workforce + customer retention scores",
        "Voluntary employment; market-driven pricing retained",
        ""
      ]
    });
    markDirty();
  };

  const handleReset = () => {
    setDescription("");
    setBenefitRatings({ socialImpact: 5, stakeholderTrust: 5, workforceWellbeing: 5, productQuality: 5, longTermViability: 5 });
    setCostRatings({ marginImpact: 5, laborTime: 5, operationalComplexity: 5, supplyChainRisk: 5, opportunityCost: 5 });
    setFilterState(emptyFilter);
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate slight network delay for feel
    await new Promise(r => setTimeout(r, 600));
    
    const evalData: Evaluation = {
      id: generateId(),
      createdAt: Date.now(),
      description,
      benefitRatings,
      costRatings,
      benefitScore,
      costScore,
      quadrantLabel: quadrant.label,
      quadrantColor: quadrant.color,
      quadrantDescription: quadrant.description,
      filterUsed: showFilter,
      filterChecks: filterState.checks,
      filterNotes: filterState.notes,
      filterYesCount
    };
    
    saveEvaluation(evalData);
    setSaving(false);
    setSaved(true);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 3000);
  };

  const handleShare = async () => {
    const text = buildShareText({
      id: "tmp", createdAt: Date.now(), description, benefitRatings, costRatings,
      benefitScore, costScore, quadrantLabel: quadrant.label, quadrantColor: quadrant.color,
      quadrantDescription: quadrant.description, filterUsed: showFilter,
      filterChecks: filterState.checks, filterNotes: filterState.notes, filterYesCount
    });

    try {
      if (navigator.share) {
        await navigator.share({ title: "ROI Evaluation", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Report copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing", err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* LEFT PANEL - STICKY (Visuals) */}
      <div className="w-full lg:w-[45%] flex-shrink-0 bg-card border-r border-border flex flex-col lg:h-screen lg:overflow-y-auto">
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight mb-3">
              Return on Integrity: <br className="hidden lg:block"/>
              <span className="text-primary">Benefit-Cost Matrix</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              A principled decision tool inspired by Daniels Principles. High-benefit actions are evaluated for courageous yet pragmatic implementation.
            </p>
            
            <div className="flex gap-4 mt-6">
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors">
                <CheckSquare className="w-4 h-4" />
                Matrix
              </Link>
              <Link href="/history" className="inline-flex items-center gap-2 px-4 py-2 bg-input/50 text-foreground/80 border border-border hover:bg-input hover:text-foreground rounded-lg text-sm font-semibold transition-colors">
                <Clock className="w-4 h-4" />
                History
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 px-4 py-2 bg-input/50 text-foreground/80 border border-border hover:bg-input hover:text-foreground rounded-lg text-sm font-semibold transition-colors ml-auto">
                <Info className="w-4 h-4" />
                About
              </Link>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-8 mb-8 lg:mb-0">
            <MatrixChart benefitScore={benefitScore} costScore={costScore} />
            <QuadrantBadge quadrant={quadrant} costScore={costScore} />
          </div>

        </div>
      </div>

      {/* RIGHT PANEL - SCROLLING (Controls) */}
      <div className="flex-1 lg:h-screen lg:overflow-y-auto bg-background p-4 md:p-6 lg:p-8 pb-24">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Action Input Section */}
          <section className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold">Proposed Action</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-md text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Example
                </button>
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-input text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-md text-xs font-semibold transition-colors"
                >
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
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-required shadow-[0_0_8px_rgba(76,175,80,0.6)]" />
              <h2 className="text-xl font-bold flex-1">Benefit Ratings</h2>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-required">{benefitScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase ml-1">/ 10</span>
              </div>
            </div>
            <div className="space-y-3">
              {BENEFIT_CRITERIA.map(c => (
                <RatingSlider 
                  key={c.key} label={c.label} value={benefitRatings[c.key]} colorType="benefit"
                  onChange={(val) => { setBenefitRatings(prev => ({...prev, [c.key]: val})); markDirty(); }} 
                />
              ))}
            </div>
          </section>

          {/* Cost Ratings */}
          <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-prohibited shadow-[0_0_8px_rgba(244,67,54,0.6)]" />
              <h2 className="text-xl font-bold flex-1">Cost Ratings</h2>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-prohibited">{costScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase ml-1">/ 10</span>
              </div>
            </div>
            <div className="space-y-3">
              {COST_CRITERIA.map(c => (
                <RatingSlider 
                  key={c.key} label={c.label} value={costRatings[c.key]} colorType="cost"
                  onChange={(val) => { setCostRatings(prev => ({...prev, [c.key]: val})); markDirty(); }} 
                />
              ))}
            </div>
          </section>

          {/* Filter */}
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

          {/* Summary / Actions */}
          <EvaluationSummary
            description={description}
            benefitRatings={benefitRatings}
            costRatings={costRatings}
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
