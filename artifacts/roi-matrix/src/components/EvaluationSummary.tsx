import React from "react";
import { Check, Share2, Save, Loader2, Printer } from "lucide-react";
import { BENEFIT_CRITERIA, COST_CRITERIA, FILTER_QUESTIONS } from "../constants/questions";
import { FilterState } from "../lib/storage";
import { cn } from "@/lib/utils";

interface EvaluationSummaryProps {
  backgroundInfo: string;
  stakeholders: string;
  description: string;
  benefitRatings: Record<string, number>;
  costRatings: Record<string, number>;
  benefitNotes: Record<string, string>;
  costNotes: Record<string, string>;
  benefitWeights: Record<string, number>;
  costWeights: Record<string, number>;
  customBenefitLabels: Record<string, string>;
  customCostLabels: Record<string, string>;
  benefitScore: number;
  costScore: number;
  quadrantLabel: string;
  filterUsed: boolean;
  filterState: FilterState;
  filterYesCount: number;
  onSave: () => void;
  onShare: () => void;
  shareCopied?: boolean;
  saving: boolean;
  saved: boolean;
}

const WEIGHT_LABEL: Record<number, string> = { 1: "L", 2: "M", 3: "H" };
const WEIGHT_COLOR: Record<number, string> = {
  1: "text-muted-foreground",
  2: "text-foreground/60",
  3: "text-primary",
};

export function EvaluationSummary({
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
  quadrantLabel,
  filterUsed,
  filterState,
  filterYesCount,
  onSave,
  onShare,
  shareCopied,
  saving,
  saved,
}: EvaluationSummaryProps) {

  const renderBar = (val: number, isBenefit: boolean) => (
    <div className="flex-1 h-1.5 bg-input rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full", isBenefit ? "bg-required" : "bg-prohibited")}
        style={{ width: `${(val / 10) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/60 shadow-lg p-6 flex flex-col gap-6">

      <div>
        <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">Evaluation Summary</h3>

        {backgroundInfo?.trim() && (
          <div className="mb-4 p-3 rounded-xl bg-input/40 border border-border/60">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Background</p>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{backgroundInfo.trim()}</p>
          </div>
        )}

        {stakeholders?.trim() && (
          <div className="mb-3 flex items-start gap-2 text-sm">
            <span className="text-muted-foreground shrink-0 font-semibold">Stakeholders:</span>
            <span className="text-foreground/80">{stakeholders.trim()}</span>
          </div>
        )}

        <p className={cn("text-lg font-medium leading-snug", description ? "text-foreground" : "text-muted-foreground italic")}>
          {description ? `"${description}"` : "No proposed action described."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-required">Benefits</span>
            <span className="font-mono font-bold text-required bg-required/10 px-2 py-0.5 rounded border border-required/20">{benefitScore.toFixed(1)}</span>
          </div>
          {BENEFIT_CRITERIA.map(c => {
            const label = customBenefitLabels?.[c.key] || c.label;
            const note = benefitNotes?.[c.key];
            const w = benefitWeights?.[c.key] ?? 2;
            return (
              <div key={c.key}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground truncate" style={{ width: "7.5rem" }} title={label}>{label}</span>
                  <span className={cn("text-[9px] font-bold shrink-0", WEIGHT_COLOR[w])}>{WEIGHT_LABEL[w]}</span>
                  {renderBar(benefitRatings[c.key], true)}
                  <span className="text-xs font-mono font-medium text-foreground w-4 text-right shrink-0">{benefitRatings[c.key]}</span>
                </div>
                {note?.trim() && (
                  <p className="text-[11px] text-muted-foreground italic mt-1 pl-[8.5rem] leading-snug">{note.trim()}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-prohibited">Costs</span>
            <span className="font-mono font-bold text-prohibited bg-prohibited/10 px-2 py-0.5 rounded border border-prohibited/20">{costScore.toFixed(1)}</span>
          </div>
          {COST_CRITERIA.map(c => {
            const label = customCostLabels?.[c.key] || c.label;
            const note = costNotes?.[c.key];
            const w = costWeights?.[c.key] ?? 2;
            return (
              <div key={c.key}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground truncate" style={{ width: "7.5rem" }} title={label}>{label}</span>
                  <span className={cn("text-[9px] font-bold shrink-0", WEIGHT_COLOR[w])}>{WEIGHT_LABEL[w]}</span>
                  {renderBar(costRatings[c.key], false)}
                  <span className="text-xs font-mono font-medium text-foreground w-4 text-right shrink-0">{costRatings[c.key]}</span>
                </div>
                {note?.trim() && (
                  <p className="text-[11px] text-muted-foreground italic mt-1 pl-[8.5rem] leading-snug">{note.trim()}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {filterUsed && (
        <div className="pt-5 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Conditional Filter</span>
            <span className="text-xs font-mono font-bold bg-input px-2 py-0.5 rounded">{filterYesCount}/5 YES</span>
          </div>
          <div className="space-y-3">
            {FILTER_QUESTIONS.map((q, i) => {
              const yes = filterState.checks[i];
              return (
                <div key={i} className="flex gap-3 items-start">
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0",
                    yes ? "bg-required/20 text-required border border-required/30" : "bg-prohibited/20 text-prohibited border border-prohibited/30"
                  )}>
                    {yes ? "YES" : "NO "}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/80 leading-relaxed">{q}</p>
                    {filterState.notes[i] && (
                      <p className="text-xs text-muted-foreground italic mt-1 bg-input/30 p-2 rounded border border-border/50">
                        {filterState.notes[i]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-border">
        <button
          onClick={onSave}
          disabled={saving || saved}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
            saved
              ? "bg-required text-required-foreground shadow-[0_0_15px_rgba(76,175,80,0.4)]"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
            (saving || saved) && "cursor-not-allowed opacity-90"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved Successfully" : "Save Evaluation"}
        </button>

        <button
          onClick={onShare}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-300",
            shareCopied
              ? "bg-required/15 text-required border-required/40 shadow-[0_0_12px_rgba(76,175,80,0.25)]"
              : "bg-input/50 text-primary border-primary/30 hover:bg-primary/10"
          )}
        >
          {shareCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {shareCopied ? "Copied to Clipboard" : "Copy Report Text"}
        </button>

        <button
          onClick={() => window.print()}
          className="sm:w-auto px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-input text-muted-foreground border border-border hover:text-foreground hover:border-border/80 transition-all duration-300"
          title="Print report"
        >
          <Printer className="w-4 h-4" />
          <span className="sm:hidden">Print</span>
        </button>
      </div>
    </div>
  );
}
