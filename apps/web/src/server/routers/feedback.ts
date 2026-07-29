import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { feedbackEntries } from "../db/schema";

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        type: z.enum(["feedback", "bug"]),
        message: z.string().min(1).max(4000),
        pageUrl: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(feedbackEntries).values({
        userId: ctx.userId,
        type: input.type,
        message: input.message,
        pageUrl: input.pageUrl,
      });
    }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(feedbackEntries).orderBy(desc(feedbackEntries.createdAt));
  }),

  adminUpdateStatus: adminProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(["new", "reviewed", "resolved"]) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(feedbackEntries).set({ status: input.status }).where(eq(feedbackEntries.id, input.id));
    }),
});
