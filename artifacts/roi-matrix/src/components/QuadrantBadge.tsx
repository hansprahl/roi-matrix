import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quadrant {
  label: string;
  subtitle: string;
  color: string;
  description: string;
}

interface QuadrantBadgeProps {
  quadrant: Quadrant;
  costScore: number;
}

export function QuadrantBadge({ quadrant, costScore }: QuadrantBadgeProps) {
  const needsReview = quadrant.label === "ENCOURAGED" || (quadrant.label === "REQUIRED" && costScore > 7.0);

  const colorClassMap: Record<string, string> = {
    REQUIRED: "text-required border-required/30 bg-required/10",
    ENCOURAGED: "text-encouraged border-encouraged/30 bg-encouraged/10",
    DISCOURAGED: "text-discouraged border-discouraged/30 bg-discouraged/10",
    PROHIBITED: "text-prohibited border-prohibited/30 bg-prohibited/10",
  };

  const currentTheme = colorClassMap[quadrant.label] || "";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quadrant.label}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("p-5 rounded-2xl border backdrop-blur-md shadow-lg", currentTheme)}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("px-3 py-1 rounded-lg text-xs font-bold tracking-widest border", currentTheme.replace("bg-", "bg-opacity-20 bg-"))}>
                {quadrant.label}
              </span>
              <span className="font-semibold text-sm opacity-90">{quadrant.subtitle}</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed max-w-[90%]">
              {quadrant.description}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-current/10">
          {needsReview ? (
            <div className="flex items-start gap-3 text-sm opacity-90 bg-background/30 p-3 rounded-xl border border-current/20">
              <ArrowDown className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                Review the <span className="font-bold">Conditional Adoption Filter</span> below to determine precise next steps.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-sm opacity-90 bg-background/30 p-3 rounded-xl border border-current/20">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>No conditional review required for this quadrant.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
