import { z } from "zod";

/**
 * The 13 onboarding questions from the product brief, as option sets +
 * a Zod schema. Shared by the web and mobile onboarding wizards (and,
 * later, the roadmap-generation backend) so the questions, validation,
 * and copy for each choice live in exactly one place.
 */

export const GENDER_OPTIONS = ["male", "female", "non_binary", "prefer_not_to_say"] as const;

export const GOAL_OPTIONS = [
  "fat_loss",
  "muscle_gain",
  "body_recomposition",
  "general_health",
  "confidence",
] as const;

export const PHYSIQUE_OPTIONS = [
  "skinny",
  "average",
  "overweight",
  "athletic",
  "muscular",
] as const;

export const SKIN_CONCERN_OPTIONS = [
  "acne",
  "dryness",
  "oiliness",
  "aging_wrinkles",
  "dark_spots",
  "sensitivity",
  "none",
] as const;

export const HAIR_CONCERN_OPTIONS = [
  "thinning",
  "dandruff",
  "dryness",
  "frizz",
  "receding_hairline",
  "none",
] as const;

export const BUDGET_OPTIONS = ["low", "medium", "high"] as const;

export const GYM_EXPERIENCE_OPTIONS = [
  "none",
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const onboardingProfileSchema = z.object({
  age: z.number().int().min(13).max(100),
  gender: z.enum(GENDER_OPTIONS),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(250),
  goal: z.enum(GOAL_OPTIONS),
  currentPhysique: z.enum(PHYSIQUE_OPTIONS),
  skinConcerns: z.array(z.enum(SKIN_CONCERN_OPTIONS)).min(1),
  hairConcerns: z.array(z.enum(HAIR_CONCERN_OPTIONS)).min(1),
  budget: z.enum(BUDGET_OPTIONS),
  confidence: z.number().int().min(1).max(10),
  sleepHours: z.number().min(0).max(16),
  gymExperience: z.enum(GYM_EXPERIENCE_OPTIONS),
  currentHabits: z.string().max(500),
});

export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;

export const ONBOARDING_STEP_FIELDS = [
  ["age", "gender", "heightCm", "weightKg"],
  ["goal", "currentPhysique"],
  ["skinConcerns", "hairConcerns"],
  ["budget", "sleepHours", "gymExperience", "currentHabits"],
  ["confidence"],
] as const satisfies readonly (readonly (keyof OnboardingProfile)[])[];
