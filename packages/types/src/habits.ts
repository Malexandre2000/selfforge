export type Habit = {
  id: string;
  title: string;
  /** Last 7 days, oldest first, today last. */
  history: boolean[];
};

/**
 * Placeholder content until the roadmap-generation backend exists.
 * Shape mirrors a HabitEntry-per-day table in ARCHITECTURE.md — swapping
 * this for a real per-user query later is a drop-in change.
 */
export const MOCK_HABITS: Habit[] = [
  {
    id: "water",
    title: "Drink 3L of water",
    history: [true, true, false, true, true, true, true],
  },
  {
    id: "walk",
    title: "Morning walk (10 min)",
    history: [true, true, true, true, true, true, true],
  },
  {
    id: "phone",
    title: "No phone after 10pm",
    history: [false, true, true, false, true, true, true],
  },
  {
    id: "meals",
    title: "Track meals",
    history: [true, true, true, true, false, true, true],
  },
  {
    id: "stretch",
    title: "Stretch before bed",
    history: [true, false, true, true, true, true, true],
  },
];

/** Consecutive completed days counting back from the end of history. */
export function currentStreak(history: boolean[]): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]) streak++;
    else break;
  }
  return streak;
}

/** Single-letter weekday labels for the last `count` days, ending today. */
export function last7DayLabels(count = 7): string[] {
  const labels: string[] = [];
  const dayInitials = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(dayInitials[d.getDay()]);
  }
  return labels;
}
