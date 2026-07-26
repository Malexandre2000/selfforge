import { Flame, TrendingUp } from "lucide-react";

function ConsistencyRing({ percent }: { percent: number }) {
  const size = 72;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-ink-200)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--color-ink-950)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Sparkline({ points }: { points: string }) {
  return (
    <svg viewBox="0 0 160 40" className="h-10 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-ink-950)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCards({
  streak,
  confidence,
  confidenceBaseline,
  consistencyPercent,
}: {
  streak: number;
  confidence: number;
  confidenceBaseline: number;
  consistencyPercent: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div className="flex flex-col justify-between rounded-lg bg-ink-950 p-6 text-white">
        <Flame size={20} strokeWidth={1.75} />
        <div className="mt-8">
          <div className="font-display text-4xl">{streak}</div>
          <div className="mt-1 text-sm text-ink-400">day streak</div>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-ink-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <TrendingUp size={20} strokeWidth={1.75} className="text-ink-950" />
          <span className="text-xs text-success">
            +{(confidence - confidenceBaseline).toFixed(1)} since you started
          </span>
        </div>
        <div className="mt-6">
          <div className="font-display text-4xl text-ink-950">{confidence.toFixed(1)}</div>
          <div className="mt-1 text-sm text-ink-500">confidence score</div>
          <div className="mt-3">
            <Sparkline points="0,30 20,28 40,24 60,26 80,18 100,20 120,10 140,12 160,4" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 rounded-lg border border-ink-200 bg-white p-6">
        <ConsistencyRing percent={consistencyPercent} />
        <div>
          <div className="font-display text-2xl text-ink-950">{consistencyPercent}%</div>
          <div className="mt-1 text-sm text-ink-500">consistency, last 30 days</div>
        </div>
      </div>
    </div>
  );
}
