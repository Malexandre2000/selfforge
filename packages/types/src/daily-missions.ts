export const MISSION_CATEGORIES = [
  "workout",
  "nutrition",
  "skincare",
  "grooming",
  "confidence",
  "habit",
  "motivation",
] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number];

export const missionCategoryLabels: Record<MissionCategory, string> = {
  workout: "Workout",
  nutrition: "Nutrition",
  skincare: "Skincare",
  grooming: "Grooming",
  confidence: "Confidence Challenge",
  habit: "Habit",
  motivation: "Motivation",
};

export type DailyMission = {
  id: string;
  category: MissionCategory;
  title: string;
  description: string;
};

/**
 * Placeholder content until the roadmap-generation backend exists.
 * Shape mirrors the DailyPlan table in ARCHITECTURE.md — swapping this
 * for a real per-user query later is a drop-in change.
 */
export const MOCK_TODAY_MISSIONS: DailyMission[] = [
  {
    id: "workout",
    category: "workout",
    title: "Upper body strength",
    description: "4 sets bench press, 3 sets rows, 3 sets shoulder press. Rest 90s between sets.",
  },
  {
    id: "nutrition",
    category: "nutrition",
    title: "3 balanced meals + 1 snack",
    description: "Target ~2,400 kcal and 160g protein today. Prioritize protein at each meal.",
  },
  {
    id: "skincare",
    category: "skincare",
    title: "AM routine",
    description: "Cleanser, vitamin C serum, moisturizer, SPF 30+.",
  },
  {
    id: "grooming",
    category: "grooming",
    title: "Trim & tidy",
    description: "Trim beard line and eyebrows, 2-minute posture check-in in the mirror.",
  },
  {
    id: "confidence",
    category: "confidence",
    title: "Start one conversation",
    description:
      "Make eye contact and hold a genuine 10-second conversation with someone new today.",
  },
  {
    id: "habit",
    category: "habit",
    title: "Drink 3L of water",
    description: "Track it — aim for a glass with every meal plus two more in between.",
  },
  {
    id: "motivation",
    category: "motivation",
    title: "Today's reminder",
    description: "Discipline is choosing between what you want now and what you want most.",
  },
];
