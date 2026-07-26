import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { MISSION_CATEGORIES, onboardingProfileSchema, type DailyMission } from "@selfforge/types";
import { router, protectedProcedure } from "../trpc";
import { dailyPlans, missionCompletions, onboardingProfiles } from "../db/schema";
import { generateDailyPlan } from "../ai/generateDailyPlan";
import { hasActiveAccess, hasCompletedFirstMission } from "../billing/access";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function planRowToMissions(row: typeof dailyPlans.$inferSelect): DailyMission[] {
  return [
    { id: "workout", category: "workout", title: row.workoutTitle, description: row.workoutDescription },
    { id: "nutrition", category: "nutrition", title: row.nutritionTitle, description: row.nutritionDescription },
    { id: "skincare", category: "skincare", title: row.skincareTitle, description: row.skincareDescription },
    { id: "grooming", category: "grooming", title: row.groomingTitle, description: row.groomingDescription },
    { id: "confidence", category: "confidence", title: row.confidenceTitle, description: row.confidenceDescription },
    { id: "habit", category: "habit", title: row.habitTitle, description: row.habitDescription },
    { id: "motivation", category: "motivation", title: row.motivationTitle, description: row.motivationDescription },
  ];
}

export const missionsRouter = router({
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const date = todayDateString();

    const [existingPlan] = await ctx.db
      .select()
      .from(dailyPlans)
      .where(and(eq(dailyPlans.userId, ctx.userId), eq(dailyPlans.date, date)));

    let plan = existingPlan;

    if (!plan) {
      const [profile] = await ctx.db
        .select()
        .from(onboardingProfiles)
        .where(eq(onboardingProfiles.userId, ctx.userId));

      if (!profile) {
        return { missions: [] as DailyMission[], completions: {}, needsOnboarding: true as const };
      }

      const generated = await generateDailyPlan(onboardingProfileSchema.parse(profile));
      const [inserted] = await ctx.db
        .insert(dailyPlans)
        .values({ userId: ctx.userId, date, ...generated })
        .returning();
      plan = inserted;
    }

    const completionRows = await ctx.db
      .select()
      .from(missionCompletions)
      .where(and(eq(missionCompletions.userId, ctx.userId), eq(missionCompletions.date, date)));

    const completions = Object.fromEntries(completionRows.map((c) => [c.category, c.completed]));

    return { missions: planRowToMissions(plan), completions, needsOnboarding: false as const };
  }),

  toggle: protectedProcedure
    .input(z.object({ category: z.enum(MISSION_CATEGORIES) }))
    .mutation(async ({ ctx, input }) => {
      const date = todayDateString();

      const [existing] = await ctx.db
        .select()
        .from(missionCompletions)
        .where(
          and(
            eq(missionCompletions.userId, ctx.userId),
            eq(missionCompletions.date, date),
            eq(missionCompletions.category, input.category),
          ),
        );

      const nextCompleted = !existing?.completed;

      // Free preview: unsubscribed users get exactly one completed mission,
      // ever, before the paywall — this is the moment they've tasted real
      // value and get asked to keep going. Enforced here too, not just in
      // the UI, so it can't be bypassed by calling the API directly.
      if (nextCompleted && !(await hasActiveAccess(ctx.db, ctx.userId))) {
        if (await hasCompletedFirstMission(ctx.db, ctx.userId)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Subscribe to keep completing your daily missions.",
          });
        }
      }

      await ctx.db
        .insert(missionCompletions)
        .values({ userId: ctx.userId, date, category: input.category, completed: nextCompleted })
        .onConflictDoUpdate({
          target: [missionCompletions.userId, missionCompletions.date, missionCompletions.category],
          set: { completed: nextCompleted },
        });

      return { completed: nextCompleted };
    }),
});
