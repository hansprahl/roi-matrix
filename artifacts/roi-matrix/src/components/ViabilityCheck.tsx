import React from "react";
import { Check, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FILTER_QUESTIONS } from "../constants/questions";
import { FilterState } from "../lib/storage";
import { cn } from "@/lib/utils";

interface ViabilityCheckProps {
  state: FilterState;
  onChange: (index: number, checked: boolean, note: string) => void;
}

export function ViabilityCheck({ state, onChange }: ViabilityCheckProps) {
  const yesCount = state.checks.filter(Boolean).length;

  let resultInfo = {
    label: "Defer or Reject",
    sublabel: "Viability risk too high — revise or do not proceed.",
    color: "text-prohibited border-prohibited/40 bg-prohibited/10",
    icon: XCircle,
  };

  if (yesCount >= 4) {
    resultInfo = {
      label: "Adopt Immediately",
      sublabel: "Ethical/strategic imperative met.",
      color: "text-required border-required/40 bg-required/10",
      icon: CheckCircle2,
    };
  } else if (yesCount === 3) {
    resultInfo = {
      label: "Conditional Adoption",
      sublabel: "Proceed only after addressing the missing condition(s).",
      color: "text-discouraged border-discouraged/40 bg-discouraged/10",
      icon: AlertTriangle,
    };
  }

  const ResultIcon = resultInfo.icon;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-border bg-input/20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(108,142,255,0.6)]" />
          <h2 className="text-lg font-bold text-foreground flex-1">Conditional Adoption Filter</h2>
          <div className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-lg font-mono font-bold text-sm">
            {yesCount}/5 YES
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Apply only to ENCOURAGED actions (or high-cost REQUIRED). This filter ensures bold ethical choices remain viable and pragmatic — as modeled by Costco's phased benefit expansions.
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-primary/90 text-sm leading-relaxed">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p>Answer Yes/No below. Provide a brief note explaining your reasoning for each checked item.</p>
        </div>

        <div className="space-y-4">
          {FILTER_QUESTIONS.map((q, i) => {
            const isChecked = state.checks[i];
            return (
              <div key={i} className="group">
                <button
                  onClick={() => onChange(i, !isChecked, state.notes[i])}
                  className="w-full flex items-start text-left gap-4 p-3 rounded-xl hover:bg-input/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <div className={cn(
                    "mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors duration-200",
                    isChecked ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted-foreground/40 group-hover:border-primary/50"
                  )}>
                    {isChecked && <Check className="w-4 h-4" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-muted-foreground mr-2">{i + 1}.</span>
                    <span className={cn("text-sm transition-colors duration-200", isChecked ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {q}
                    </span>
                  </div>
                </button>
                
                <AnimatePresence>
                  {isChecked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-13 pr-3 pb-3 pt-1">
                        <textarea
                          value={state.notes[i]}
                          onChange={(e) => onChange(i, isChecked, e.target.value)}
                          placeholder="Brief evidence or note..."
                          className="w-full min-h-[60px] bg-input/50 border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-y transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn("p-5 sm:p-6 border-t border-border transition-colors duration-300", resultInfo.color.replace('text-', 'bg-').replace('/10', '/5'))}>
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full bg-background border shadow-sm", resultInfo.color)}>
            <ResultIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={cn("text-lg font-bold", resultInfo.color.split(' ')[0])}>{resultInfo.label}</h3>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{resultInfo.sublabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
