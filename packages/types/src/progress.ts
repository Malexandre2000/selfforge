export type WeightPoint = { label: string; weight: number };

/**
 * Placeholder content until the roadmap-generation backend exists.
 * Shape mirrors a ProgressEntry-per-check-in table in ARCHITECTURE.md.
 */
export const MOCK_WEIGHT_HISTORY: WeightPoint[] = [
  { label: "Wk 1", weight: 182 },
  { label: "Wk 2", weight: 180 },
  { label: "Wk 3", weight: 179 },
  { label: "Wk 4", weight: 177 },
  { label: "Wk 5", weight: 176 },
  { label: "Wk 6", weight: 175 },
  { label: "Wk 7", weight: 173 },
  { label: "Wk 8", weight: 172 },
  { label: "Wk 9", weight: 171 },
  { label: "Wk 10", weight: 170 },
];

export type Measurement = {
  label: string;
  unit: string;
  start: number;
  current: number;
  /** Which direction of change counts as progress for this measurement. */
  goodDirection: "down" | "up";
};

export const MOCK_MEASUREMENTS: Measurement[] = [
  { label: "Waist", unit: "in", start: 38, current: 34.5, goodDirection: "down" },
  { label: "Chest", unit: "in", start: 41, current: 42.5, goodDirection: "up" },
  { label: "Arms", unit: "in", start: 13, current: 14.2, goodDirection: "up" },
];
