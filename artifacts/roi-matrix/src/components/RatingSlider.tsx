import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  colorType: "benefit" | "cost";
}

export function RatingSlider({ label, value, onChange, colorType }: RatingSliderProps) {
  const isBenefit = colorType === "benefit";
  const activeColor = isBenefit ? "bg-required shadow-[0_0_10px_rgba(76,175,80,0.5)]" : "bg-prohibited shadow-[0_0_10px_rgba(244,67,54,0.5)]";
  const hoverColor = isBenefit ? "hover:border-required" : "hover:border-prohibited";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-input/30 border border-border/50 hover:bg-input/60 transition-colors">
      <span className="text-sm font-medium text-foreground/90 w-full sm:w-[45%] flex-shrink-0">
        {label}
      </span>
      
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isActive = num <= value;
          return (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={cn(
                "relative w-7 h-9 rounded-md flex items-center justify-center text-xs font-mono transition-all duration-200",
                "border focus:outline-none focus:ring-2 focus:ring-primary/50",
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
    </div>
  );
}
