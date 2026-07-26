import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import {
  genderLabels,
  goalLabels,
  physiqueLabels,
  skinConcernLabels,
  hairConcernLabels,
  budgetLabels,
  gymExperienceLabels,
  type OnboardingProfile,
} from "@selfforge/types";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const dailyPlanSchema = z.object({
  workoutTitle: z.string(),
  workoutDescription: z.string(),
  nutritionTitle: z.string(),
  nutritionDescription: z.string(),
  skincareTitle: z.string(),
  skincareDescription: z.string(),
  groomingTitle: z.string(),
  groomingDescription: z.string(),
  confidenceTitle: z.string(),
  confidenceDescription: z.string(),
  habitTitle: z.string(),
  habitDescription: z.string(),
  motivationTitle: z.string(),
  motivationDescription: z.string(),
});

export type GeneratedDailyPlan = z.infer<typeof dailyPlanSchema>;

export function describeProfile(profile: OnboardingProfile): string {
  return `- Age: ${profile.age}, Gender: ${genderLabels[profile.gender]}
- Height: ${profile.heightCm}cm, Weight: ${profile.weightKg}kg
- Goal: ${goalLabels[profile.goal]}
- Current physique: ${physiqueLabels[profile.currentPhysique]}
- Skin concerns: ${profile.skinConcerns.map((c) => skinConcernLabels[c]).join(", ")}
- Hair concerns: ${profile.hairConcerns.map((c) => hairConcernLabels[c]).join(", ")}
- Self-care budget: ${budgetLabels[profile.budget]}
- Confidence (1-10): ${profile.confidence}
- Sleep: ${profile.sleepHours}h/night
- Gym experience: ${gymExperienceLabels[profile.gymExperience]}
- Current habits: ${profile.currentHabits || "none mentioned"}`;
}

export async function generateDailyPlan(
  profile: OnboardingProfile,
): Promise<GeneratedDailyPlan> {
  const message = await anthropic.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    system:
      "You are SelfForge's AI self-improvement coach. Generate one day's " +
      "personalized plan across 7 categories: workout, nutrition, skincare, " +
      "grooming, a confidence challenge, a habit, and motivation. Be specific " +
      "and actionable, tailored to the person's profile below — never generic. " +
      "Keep each title under 8 words and each description under 2 sentences.",
    messages: [
      {
        role: "user",
        content: `Generate today's plan for someone with this profile:\n${describeProfile(profile)}`,
      },
    ],
    output_config: { format: zodOutputFormat(dailyPlanSchema) },
  });

  if (!message.parsed_output) {
    throw new Error("Claude did not return a structured daily plan");
  }
  return message.parsed_output;
}
