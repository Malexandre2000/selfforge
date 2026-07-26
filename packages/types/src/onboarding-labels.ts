import {
  BUDGET_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  GYM_EXPERIENCE_OPTIONS,
  HAIR_CONCERN_OPTIONS,
  PHYSIQUE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
} from "./onboarding";

/** Display copy for each onboarding option, shared by web + mobile so wording only lives once. */

export const genderLabels: Record<(typeof GENDER_OPTIONS)[number], string> = {
  male: "Male",
  female: "Female",
  non_binary: "Non-binary",
  prefer_not_to_say: "Prefer not to say",
};

export const goalLabels: Record<(typeof GOAL_OPTIONS)[number], string> = {
  fat_loss: "Lose fat",
  muscle_gain: "Build muscle",
  body_recomposition: "Recomposition (lose fat & build muscle)",
  general_health: "General health",
  confidence: "Build confidence",
};

export const physiqueLabels: Record<(typeof PHYSIQUE_OPTIONS)[number], string> = {
  skinny: "Skinny",
  average: "Average",
  overweight: "Overweight",
  athletic: "Athletic",
  muscular: "Muscular",
};

export const skinConcernLabels: Record<(typeof SKIN_CONCERN_OPTIONS)[number], string> = {
  acne: "Acne",
  dryness: "Dryness",
  oiliness: "Oiliness",
  aging_wrinkles: "Aging / wrinkles",
  dark_spots: "Dark spots",
  sensitivity: "Sensitivity",
  none: "None",
};

export const hairConcernLabels: Record<(typeof HAIR_CONCERN_OPTIONS)[number], string> = {
  thinning: "Thinning",
  dandruff: "Dandruff",
  dryness: "Dryness",
  frizz: "Frizz",
  receding_hairline: "Receding hairline",
  none: "None",
};

export const budgetLabels: Record<(typeof BUDGET_OPTIONS)[number], string> = {
  low: "Keep it minimal",
  medium: "Moderate",
  high: "Willing to invest",
};

export const gymExperienceLabels: Record<(typeof GYM_EXPERIENCE_OPTIONS)[number], string> = {
  none: "Never trained",
  beginner: "Beginner (0-1 yr)",
  intermediate: "Intermediate (1-3 yrs)",
  advanced: "Advanced (3+ yrs)",
};
