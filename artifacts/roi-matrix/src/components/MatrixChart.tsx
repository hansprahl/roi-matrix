import React from "react";
import { motion } from "framer-motion";

interface MatrixChartProps {
  benefitScore: number;
  costScore: number;
}

export function MatrixChart({ benefitScore, costScore }: MatrixChartProps) {
  const SIZE = 400;
  const PAD = 44;
  const CHART = SIZE - PAD * 2;

  const scoreToX = (cost: number) => PAD + (cost / 10) * CHART;
  const scoreToY = (benefit: number) => PAD + ((10 - benefit) / 10) * CHART;

  const threshX = PAD + (5.5 / 10) * CHART;
  const threshY = PAD + ((10 - 5.5) / 10) * CHART;

  const cx = scoreToX(costScore);
  const cy = scoreToY(benefitScore);

  return (
    <div className="w-full max-w-[500px] mx-auto flex flex-col items-center bg-card rounded-2xl border border-border shadow-xl shadow-black/20 p-6">
      <div className="relative w-full aspect-square max-w-[400px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="reqGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="hsl(var(--color-required))" stopOpacity="0.25" />
              <stop offset="1" stopColor="hsl(var(--color-required))" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="encGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="hsl(var(--color-encouraged))" stopOpacity="0.25" />
              <stop offset="1" stopColor="hsl(var(--color-encouraged))" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="disGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="hsl(var(--color-discouraged))" stopOpacity="0.25" />
              <stop offset="1" stopColor="hsl(var(--color-discouraged))" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="proGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="hsl(var(--color-prohibited))" stopOpacity="0.3" />
              <stop offset="1" stopColor="hsl(var(--color-prohibited))" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Quadrant Fills */}
          <rect x={PAD} y={PAD} width={threshX - PAD} height={threshY - PAD} fill="url(#reqGrad)" rx="4" />
          <rect x={threshX} y={PAD} width={SIZE - PAD - threshX} height={threshY - PAD} fill="url(#encGrad)" rx="4" />
          <rect x={PAD} y={threshY} width={threshX - PAD} height={SIZE - PAD - threshY} fill="url(#disGrad)" rx="4" />
          <rect x={threshX} y={threshY} width={SIZE - PAD - threshX} height={SIZE - PAD - threshY} fill="url(#proGrad)" rx="4" />

          {/* Border */}
          <rect x={PAD} y={PAD} width={CHART} height={CHART} fill="none" stroke="hsl(var(--color-border))" strokeWidth="2" rx="4" />

          {/* Grid lines */}
          <line x1={threshX} y1={PAD} x2={threshX} y2={PAD + CHART} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4,4" />
          <line x1={PAD} y1={threshY} x2={PAD + CHART} y2={threshY} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Quadrant Labels */}
          <g opacity="0.8" className="font-sans font-bold text-[10px] tracking-wider">
            <text x={PAD + 10} y={PAD + 18} fill="hsl(var(--color-required))">REQUIRED</text>
            <text x={threshX + 10} y={PAD + 18} fill="hsl(var(--color-encouraged))">ENCOURAGED</text>
            <text x={PAD + 10} y={SIZE - PAD - 12} fill="hsl(var(--color-discouraged))">DISCOURAGED</text>
            <text x={threshX + 10} y={SIZE - PAD - 12} fill="hsl(var(--color-prohibited))">PROHIBITED</text>
          </g>

          {/* Tick marks */}
          {[0, 2, 4, 6, 8, 10].map((val) => {
            const x = scoreToX(val);
            const y = scoreToY(val);
            return (
              <g key={`tick-${val}`} className="font-mono text-[9px]" fill="hsl(var(--color-muted-foreground))">
                <line x1={x} y1={PAD + CHART} x2={x} y2={PAD + CHART + 5} stroke="hsl(var(--color-muted-foreground))" />
                <text x={x} y={SIZE - 12} textAnchor="middle">{val}</text>
                <line x1={PAD - 5} y1={y} x2={PAD} y2={y} stroke="hsl(var(--color-muted-foreground))" />
                <text x={PAD - 10} y={y + 3} textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text x={PAD + CHART / 2} y={SIZE - 2} textAnchor="middle" fill="hsl(var(--color-foreground))" className="font-sans font-bold text-[11px] tracking-widest">
            COST
          </text>
          <g transform={`translate(12, ${PAD + CHART / 2}) rotate(-90)`}>
            <text x="0" y="0" textAnchor="middle" fill="hsl(var(--color-foreground))" className="font-sans font-bold text-[11px] tracking-widest">
              BENEFIT
            </text>
          </g>

          {/* Animated Position Dot */}
          <motion.circle
            cx={cx}
            cy={cy}
            animate={{ cx, cy }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            r={16}
            fill="hsl(var(--color-primary))"
            opacity={0.2}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            animate={{ cx, cy }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            r={7}
            fill="hsl(var(--color-primary))"
            stroke="#ffffff"
            strokeWidth={2}
            className="drop-shadow-[0_0_8px_rgba(108,142,255,0.8)]"
          />
        </svg>
      </div>

      <div className="flex items-center gap-8 mt-6">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-required font-mono">{benefitScore.toFixed(1)}</span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">Benefit</span>
        </div>
        <div className="w-[2px] h-12 bg-border/80 rounded-full" />
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-prohibited font-mono">{costScore.toFixed(1)}</span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-1">Cost</span>
        </div>
      </div>
    </div>
  );
}
