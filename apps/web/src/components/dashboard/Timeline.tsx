import { Check, Lock } from "lucide-react";

type TimelineItem = {
  label: string;
  date: string;
  status: "done" | "today" | "upcoming";
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6 sm:p-8">
      <h2 className="font-display text-xl text-ink-950">Your journey</h2>
      <div className="mt-6 flex flex-col">
        {items.map((item, i) => (
          <div key={item.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  item.status === "done"
                    ? "bg-ink-950 text-white"
                    : item.status === "today"
                      ? "border-2 border-ink-950 bg-white"
                      : "bg-ink-100 text-ink-400"
                }`}
              >
                {item.status === "done" && <Check size={14} />}
                {item.status === "upcoming" && <Lock size={12} />}
              </div>
              {i < items.length - 1 && (
                <div
                  className={`w-px flex-1 ${
                    item.status === "done" ? "bg-ink-950" : "bg-ink-200"
                  }`}
                />
              )}
            </div>
            <div className={`pb-8 ${item.status === "upcoming" ? "opacity-50" : ""}`}>
              <div className="text-sm text-ink-400">{item.date}</div>
              <div
                className={`mt-0.5 ${
                  item.status === "today"
                    ? "font-semibold text-ink-950"
                    : "text-ink-800"
                }`}
              >
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
