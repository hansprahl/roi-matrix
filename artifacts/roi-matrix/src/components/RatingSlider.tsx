import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  colorType: "benefit" | "cost";
  weight: number;
  onWeightChange: (w: number) => void;
  note: string;
  onNoteChange: (note: string) => void;
  tooltip: string;
  editMode?: boolean;
  onLabelChange?: (label: string) => void;
}

export function RatingSlider({
  label,
  value,
  onChange,
  colorType,
  weight,
  onWeightChange,
  note,
  onNoteChange,
  tooltip,
  editMode,
  onLabelChange,
}: RatingSliderProps) {
  const [noteOpen, setNoteOpen] = useState(!!note);
  const [showTooltip, setShowTooltip] = useState(false);

  const isBenefit = colorType === "benefit";
  const activeColor = isBenefit
    ? "bg-required shadow-[0_0_8px_rgba(76,175,80,0.4)]"
    : "bg-prohibited shadow-[0_0_8px_rgba(244,67,54,0.4)]";
  const hoverColor = isBenefit ? "hover:border-required" : "hover:border-prohibited";
  const weightActiveClass = isBenefit
    ? "bg-required/20 text-required border-required/50"
    : "bg-prohibited/20 text-prohibited border-prohibited/50";

  return (
    <div className="rounded-xl bg-input/30 border border-border/50 hover:bg-input/50 transition-colors overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        {/* Label */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {editMode && onLabelChange ? (
            <input
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              className="flex-1 bg-input border border-primary/40 rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 min-w-0"
            />
          ) : (
            <span className="text-sm font-medium text-foreground/90 truncate">{label}</span>
          )}
          {!editMode && (
            <div className="relative shrink-0">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <Info className="w-3 h-3" />
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-5 z-50 w-64 p-3 rounded-xl bg-popover border border-border shadow-xl text-xs text-muted-foreground leading-relaxed">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weight L / M / H */}
        <div className="flex items-center gap-0.5 shrink-0">
          {[1, 2, 3].map((w) => (
            <button
              key={w}
              onClick={() => onWeightChange(w)}
              title={w === 1 ? "Low priority" : w === 2 ? "Medium priority" : "High priority"}
              className={cn(
                "w-6 h-5 text-[9px] font-bold rounded border transition-all",
                weight === w
                  ? weightActiveClass
                  : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
              )}
            >
              {w === 1 ? "L" : w === 2 ? "M" : "H"}
            </button>
          ))}
        </div>

        {/* Note toggle */}
        <button
          onClick={() => setNoteOpen(!noteOpen)}
          title="Add rationale note"
          className={cn(
            "shrink-0 p-0.5 rounded transition-colors",
            noteOpen || note
              ? isBenefit ? "text-required" : "text-prohibited"
              : "text-muted-foreground/50 hover:text-muted-foreground"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pip buttons */}
      <div className="flex items-center gap-1 px-3 pb-2.5 overflow-x-auto scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isActive = num <= value;
          return (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={cn(
                "relative w-7 h-8 rounded-md flex items-center justify-center text-xs font-mono transition-all duration-200 shrink-0",
                "border focus:outline-none focus:ring-1 focus:ring-primary/50",
                isActive
                  ? activeColor + " border-transparent text-white"
                  : "bg-background border-border text-muted-foreground " + hoverColor
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={`${label}-active-${num}`}
                  className="absolute inset-0 rounded-md bg-white/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <span className="relative z-10">{num}</span>
            </button>
          );
        })}
      </div>

      {/* Note textarea */}
      {(noteOpen || note) && (
        <div className="px-3 pb-3">
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Brief rationale or evidence for this rating…"
            className="w-full min-h-[52px] bg-input/50 border border-border rounded-lg p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 resize-y transition-all"
          />
        </div>
      )}
    </div>
  );
}
