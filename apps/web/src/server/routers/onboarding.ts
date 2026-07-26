import { eq } from "drizzle-orm";
import { onboardingProfileSchema } from "@selfforge/types";
import { router, protectedProcedure } from "../trpc";
import { onboardingProfiles } from "../db/schema";

export const onboardingRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.userId, ctx.userId));
    return profile ?? null;
  }),

  submit: protectedProcedure
    .input(onboardingProfileSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(onboardingProfiles)
        .values({ userId: ctx.userId, ...input, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: onboardingProfiles.userId,
          set: { ...input, updatedAt: new Date() },
        });
      return { success: true as const };
    }),
});
