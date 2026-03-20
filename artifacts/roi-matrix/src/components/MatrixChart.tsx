import React from "react";
import { motion } from "framer-motion";

interface MatrixChartProps {
  benefitScore: number;
  costScore: number;
  comparison?: { benefitScore: number; costScore: number; label?: string };
}

const QUADRANT_COLORS = {
  required: "hsl(122, 39%, 49%)",
  encouraged: "hsl(207, 90%, 54%)",
  discouraged: "hsl(36, 100%, 50%)",
  prohibited: "hsl(4, 90%, 58%)",
};

export function MatrixChart({ benefitScore, costScore, comparison }: MatrixChartProps) {
  const SIZE = 400;
  const PAD = 44;
  const CHART = SIZE - PAD * 2;

  const scoreToX = (cost: number) => PAD + (cost / 10) * CHART;
  const scoreToY = (benefit: number) => PAD + ((10 - benefit) / 10) * CHART;

  const threshX = PAD + (5.5 / 10) * CHART;
  const threshY = PAD + ((10 - 5.5) / 10) * CHART;

  const cx = scoreToX(costScore);
  const cy = scoreToY(benefitScore);

  const compCx = comparison ? scoreToX(comparison.costScore) : 0;
  const compCy = comparison ? scoreToY(comparison.benefitScore) : 0;

  return (
    <div className="w-full flex flex-col items-center bg-card rounded-2xl border border-border shadow-xl p-6">
      <div className="relative w-full aspect-square max-w-[400px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
          <defs>
            <filter id="dotGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Quadrant fills */}
          <rect x={PAD} y={PAD} width={threshX - PAD} height={threshY - PAD}
            fill={QUADRANT_COLORS.required} opacity="0.18" rx="3" />
          <rect x={threshX} y={PAD} width={SIZE - PAD - threshX} height={threshY - PAD}
            fill={QUADRANT_COLORS.encouraged} opacity="0.18" rx="3" />
          <rect x={PAD} y={threshY} width={threshX - PAD} height={SIZE - PAD - threshY}
            fill={QUADRANT_COLORS.discouraged} opacity="0.18" rx="3" />
          <rect x={threshX} y={threshY} width={SIZE - PAD - threshX} height={SIZE - PAD - threshY}
            fill={QUADRANT_COLORS.prohibited} opacity="0.18" rx="3" />

          {/* Border */}
          <rect x={PAD} y={PAD} width={CHART} height={CHART}
            fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" rx="3" />

          {/* Threshold lines */}
          <line x1={threshX} y1={PAD} x2={threshX} y2={PAD + CHART}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="5,4" />
          <line x1={PAD} y1={threshY} x2={PAD + CHART} y2={threshY}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="5,4" />

          {/* Quadrant labels */}
          <text x={PAD + 10} y={PAD + 18} fill={QUADRANT_COLORS.required}
            fontSize="9" fontWeight="700" letterSpacing="1">REQUIRED</text>
          <text x={threshX + 10} y={PAD + 18} fill={QUADRANT_COLORS.encouraged}
            fontSize="9" fontWeight="700" letterSpacing="1">ENCOURAGED</text>
          <text x={PAD + 10} y={SIZE - PAD - 10} fill={QUADRANT_COLORS.discouraged}
            fontSize="9" fontWeight="700" letterSpacing="1">DISCOURAGED</text>
          <text x={threshX + 10} y={SIZE - PAD - 10} fill={QUADRANT_COLORS.prohibited}
            fontSize="9" fontWeight="700" letterSpacing="1">PROHIBITED</text>

          {/* Tick marks */}
          {[0, 2, 4, 6, 8, 10].map((val) => {
            const x = scoreToX(val);
            const y = scoreToY(val);
            return (
              <g key={`tick-${val}`} fill="rgba(255,255,255,0.4)" fontSize="9">
                <line x1={x} y1={PAD + CHART} x2={x} y2={PAD + CHART + 4}
                  stroke="rgba(255,255,255,0.3)" />
                <text x={x} y={SIZE - 6} textAnchor="middle">{val}</text>
                <line x1={PAD - 4} y1={y} x2={PAD} y2={y}
                  stroke="rgba(255,255,255,0.3)" />
                <text x={PAD - 8} y={y + 3} textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={PAD + CHART / 2} y={SIZE - 1} textAnchor="middle"
            fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="700" letterSpacing="2">COST</text>
          <g transform={`translate(10, ${PAD + CHART / 2}) rotate(-90)`}>
            <text x="0" y="0" textAnchor="middle"
              fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="700" letterSpacing="2">BENEFIT</text>
          </g>

          {/* Comparison dot (static, no animation) */}
          {comparison && (
            <g>
              <circle cx={compCx} cy={compCy} r={14} fill="rgba(255,255,255,0.08)" />
              <circle cx={compCx} cy={compCy} r={6} fill="rgba(255,255,255,0.35)"
                stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} strokeDasharray="3,2" />
              {comparison.label && (
                <text x={compCx + 9} y={compCy - 9} fill="rgba(255,255,255,0.6)"
                  fontSize="8" fontWeight="600">{comparison.label}</text>
              )}
            </g>
          )}

          {/* Main animated dot */}
          <motion.g
            animate={{ x: cx, y: cy }}
            initial={{ x: cx, y: cy }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
          >
            <circle cx={0} cy={0} r={18} fill="hsl(226, 100%, 71%)" opacity={0.12} />
            <circle cx={0} cy={0} r={7} fill="hsl(226, 100%, 71%)"
              stroke="white" strokeWidth={2} filter="url(#dotGlow)" />
          </motion.g>
        </svg>
      </div>

      {/* Score display */}
      <div className="flex items-center gap-8 mt-4">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold font-mono" style={{ color: QUADRANT_COLORS.required }}>
            {benefitScore.toFixed(1)}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Benefit</span>
        </div>
        <div className="w-px h-10 bg-border rounded-full" />
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold font-mono" style={{ color: QUADRANT_COLORS.prohibited }}>
            {costScore.toFixed(1)}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Cost</span>
        </div>
        {comparison && (
          <>
            <div className="w-px h-10 bg-border rounded-full" />
            <div className="flex flex-col items-center opacity-50">
              <span className="text-lg font-bold font-mono text-foreground">
                {comparison.benefitScore.toFixed(1)} / {comparison.costScore.toFixed(1)}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                {comparison.label || "Compare"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
