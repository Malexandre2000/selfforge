import type { Measurement } from "@selfforge/types";

export function MeasurementStats({ measurements }: { measurements: Measurement[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {measurements.map((m) => {
        const delta = m.current - m.start;
        const isGood = m.goodDirection === "down" ? delta < 0 : delta > 0;
        const sign = delta > 0 ? "+" : "";

        return (
          <div key={m.label} className="rounded-lg border border-ink-200 bg-white p-5">
            <div className="text-sm text-ink-500">{m.label}</div>
            <div className="mt-1 font-display text-2xl text-ink-950">
              {m.current} {m.unit}
            </div>
            <div className={`mt-1 text-sm ${isGood ? "text-success" : "text-ink-400"}`}>
              {sign}
              {delta.toFixed(1)} {m.unit} from {m.start} {m.unit}
            </div>
          </div>
        );
      })}
    </div>
  );
}
