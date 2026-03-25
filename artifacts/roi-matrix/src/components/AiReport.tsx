import React, { useState } from "react";
import { Sparkles, Loader2, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { BENEFIT_CRITERIA, COST_CRITERIA, FILTER_QUESTIONS } from "../constants/questions";
import { cn } from "@/lib/utils";

interface AiReportProps {
  backgroundInfo: string;
  stakeholders: string;
  description: string;
  benefitRatings: Record<string, number>;
  costRatings: Record<string, number>;
  benefitWeights: Record<string, number>;
  costWeights: Record<string, number>;
  benefitNotes: Record<string, string>;
  costNotes: Record<string, string>;
  customBenefitLabels: Record<string, string>;
  customCostLabels: Record<string, string>;
  benefitScore: number;
  costScore: number;
  quadrantLabel: string;
  quadrantDescription: string;
  filterUsed: boolean;
  filterChecks: boolean[];
  filterNotes: string[];
  filterYesCount: number;
}

const QUADRANT_STYLE: Record<string, { badge: string; dot: string; border: string }> = {
  REQUIRED:    { badge: "bg-required/15 text-required border-required/40",    dot: "bg-required",    border: "border-required/25" },
  ENCOURAGED:  { badge: "bg-encouraged/15 text-encouraged border-encouraged/40",  dot: "bg-encouraged",  border: "border-encouraged/25" },
  DISCOURAGED: { badge: "bg-discouraged/15 text-discouraged border-discouraged/40", dot: "bg-discouraged", border: "border-discouraged/25" },
  PROHIBITED:  { badge: "bg-prohibited/15 text-prohibited border-prohibited/40",  dot: "bg-prohibited",  border: "border-prohibited/25" },
};

const weightLabel = (w: number) => (w === 1 ? "L" : w === 3 ? "H" : "M");
const weightClass = (w: number) =>
  w === 3
    ? "bg-primary/20 text-primary border-primary/30"
    : w === 1
    ? "bg-input text-muted-foreground border-border"
    : "bg-input text-muted-foreground/70 border-border";

function CriterionRow({
  label, rating, weight, note, barColor,
}: { label: string; rating: number; weight: number; note?: string; barColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", weightClass(weight))}
        >
          {weightLabel(weight)}
        </span>
        <span className="text-xs text-foreground/80 flex-1 truncate">{label}</span>
        <span className="text-xs font-bold text-foreground tabular-nums shrink-0">{rating}<span className="text-muted-foreground font-normal">/10</span></span>
        {note?.trim() && (
          <button
            onClick={() => setOpen(v => !v)}
            className="text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      <div className="h-1.5 bg-input rounded-full overflow-hidden ml-8">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${(rating / 10) * 100}%` }}
        />
      </div>
      {open && note?.trim() && (
        <p className="text-xs text-muted-foreground ml-8 mt-1 leading-relaxed italic">{note.trim()}</p>
      )}
    </div>
  );
}

export function AiReport(props: AiReportProps) {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    description, stakeholders, backgroundInfo,
    benefitRatings, costRatings, benefitWeights, costWeights,
    benefitNotes, costNotes, customBenefitLabels, customCostLabels,
    benefitScore, costScore, quadrantLabel, quadrantDescription,
    filterUsed, filterChecks, filterNotes, filterYesCount,
  } = props;

  const qStyle = QUADRANT_STYLE[quadrantLabel] ?? QUADRANT_STYLE.REQUIRED;

  const filterOutcome =
    filterYesCount >= 5
      ? { label: "Adopt Immediately", cls: "text-required" }
      : filterYesCount >= 3
      ? { label: "Conditional Adoption", cls: "text-encouraged" }
      : { label: "Defer or Reject", cls: "text-prohibited" };

  const generateReport = async () => {
    setLoading(true);
    setReport("");
    setError("");
    try {
      const apiUrl = import.meta.env.PROD
        ? "/api-server/api/generate-report"
        : "/proxy-api/api/generate-report";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...props,
          benefitCriteria: BENEFIT_CRITERIA,
          costCriteria: COST_CRITERIA,
          filterQuestions: FILTER_QUESTIONS,
        }),
      });

      if (!response.ok) throw new Error("Server error");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) setReport((prev) => prev + data.content);
              if (data.error) setError(data.error);
              if (data.done) setLoading(false);
            } catch {}
          }
        }
      }
    } catch {
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">

      {/* ── SECTION 1: Assessment Summary ── */}
      <div className={cn("bg-card rounded-2xl border p-5 sm:p-6 shadow-sm", qStyle.border)}>
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
          <div className={cn("w-2 h-2 rounded-full shrink-0", qStyle.dot)} />
          <h2 className="text-base font-bold tracking-tight flex-1">Assessment Summary</h2>
        </div>

        {/* Proposed Action */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Proposed Action</p>
          <p className="text-sm text-foreground leading-relaxed">{description || <span className="text-muted-foreground italic">Not specified</span>}</p>
        </div>

        {/* Stakeholders */}
        {stakeholders?.trim() && (
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Stakeholders Consulted</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{stakeholders}</p>
          </div>
        )}

        {/* Matrix Result */}
        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 mb-5", qStyle.badge, qStyle.border)}>
          <span className={cn("text-xs font-bold tracking-widest uppercase shrink-0", qStyle.badge.includes("text-required") ? "text-required" : qStyle.badge.includes("text-encouraged") ? "text-encouraged" : qStyle.badge.includes("text-discouraged") ? "text-discouraged" : "text-prohibited")}>
            {quadrantLabel}
          </span>
          <div className="w-px h-4 bg-current opacity-20 shrink-0" />
          <div className="flex items-center gap-4 text-xs font-mono text-foreground/70">
            <span>Benefit <strong className="text-foreground">{benefitScore.toFixed(1)}</strong></span>
            <span>Cost <strong className="text-foreground">{costScore.toFixed(1)}</strong></span>
          </div>
        </div>

        {/* Criteria Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Benefit Criteria</p>
            <div className="space-y-3">
              {BENEFIT_CRITERIA.map((c) => (
                <CriterionRow
                  key={c.key}
                  label={customBenefitLabels?.[c.key] || c.label}
                  rating={benefitRatings?.[c.key] ?? 5}
                  weight={benefitWeights?.[c.key] ?? 2}
                  note={benefitNotes?.[c.key]}
                  barColor="bg-required"
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Cost Criteria</p>
            <div className="space-y-3">
              {COST_CRITERIA.map((c) => (
                <CriterionRow
                  key={c.key}
                  label={customCostLabels?.[c.key] || c.label}
                  rating={costRatings?.[c.key] ?? 5}
                  weight={costWeights?.[c.key] ?? 2}
                  note={costNotes?.[c.key]}
                  barColor="bg-prohibited"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Conditional Filter Result */}
        {filterUsed && (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Conditional Adoption Filter</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-foreground/60">{filterYesCount}/5 YES</span>
                <span className={cn("text-xs font-bold", filterOutcome.cls)}>{filterOutcome.label}</span>
              </div>
            </div>
            <div className="space-y-2">
              {(FILTER_QUESTIONS).map((q: string, i: number) => (
                <div key={i} className="flex gap-2.5 text-xs">
                  <span className={cn("font-bold shrink-0 mt-0.5 w-8", filterChecks?.[i] ? "text-required" : "text-prohibited")}>
                    {filterChecks?.[i] ? "YES" : "NO"}
                  </span>
                  <div>
                    <span className="text-foreground/70">{q}</span>
                    {filterNotes?.[i]?.trim() && (
                      <p className="text-muted-foreground italic mt-0.5">{filterNotes[i]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Executive Analysis ── */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(108,142,255,0.5)] shrink-0" />
          <h2 className="text-base font-bold tracking-tight flex-1">Executive Analysis</h2>
          <div className="flex items-center gap-2">
            {report && !loading && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-input text-muted-foreground hover:text-foreground border border-border rounded-lg text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-required" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
            <button
              onClick={generateReport}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {loading ? "Writing…" : report ? "Regenerate" : "Generate"}
            </button>
          </div>
        </div>

        {!report && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-7 h-7 mx-auto mb-2.5 opacity-20" />
            <p className="text-sm max-w-xs mx-auto leading-relaxed">
              Generate a concise, board-ready analysis — verdict, critical insight, and next steps.
            </p>
          </div>
        )}

        {loading && !report && (
          <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Composing executive analysis…</span>
          </div>
        )}

        {report && (
          <div className="text-[15px] text-foreground leading-[1.85] space-y-4">
            {report.split(/\n\n+/).map((para, i) => (
              <p key={i} className={i === 0 ? "font-medium" : ""}>
                {para}
                {loading && i === report.split(/\n\n+/).length - 1 && (
                  <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 rounded align-text-bottom" />
                )}
              </p>
            ))}
            {loading && !report.includes("\n\n") && (
              <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 rounded align-text-bottom" />
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
