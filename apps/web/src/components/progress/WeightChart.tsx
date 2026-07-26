import { TrendingDown, TrendingUp } from "lucide-react";
import type { WeightPoint } from "@selfforge/types";

const WIDTH = 600;
const HEIGHT = 180;
const PADDING = 12;

function buildPath(points: WeightPoint[]) {
  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (WIDTH - PADDING * 2) + PADDING;
      const y =
        HEIGHT -
        PADDING -
        ((p.weight - min) / range) * (HEIGHT - PADDING * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export function WeightChart({ history }: { history: WeightPoint[] }) {
  const start = history[0].weight;
  const current = history[history.length - 1].weight;
  const delta = current - start;
  const TrendIcon = delta <= 0 ? TrendingDown : TrendingUp;
  const linePath = buildPath(history);
  const areaPath = `${linePath} L${WIDTH - PADDING},${HEIGHT} L${PADDING},${HEIGHT} Z`;

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-ink-950">Weight</h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl text-ink-950">{current} kg</span>
            <span className="flex items-center gap-1 text-sm text-success">
              <TrendIcon size={14} />
              {Math.abs(delta).toFixed(1)} kg since you started
            </span>
          </div>
        </div>
        <span className="text-sm text-ink-400">Started at {start} kg</span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-5 h-40 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink-950)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-ink-950)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#weight-fill)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--color-ink-950)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="mt-2 flex justify-between text-xs text-ink-400">
        <span>{history[0].label}</span>
        <span>{history[history.length - 1].label}</span>
      </div>
    </div>
  );
}
