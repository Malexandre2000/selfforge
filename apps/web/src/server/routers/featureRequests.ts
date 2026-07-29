import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { featureRequests, featureRequestVotes } from "../db/schema";

export const featureRequestsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: featureRequests.id,
        title: featureRequests.title,
        description: featureRequests.description,
        status: featureRequests.status,
        createdAt: featureRequests.createdAt,
        voteCount: sql<number>`count(${featureRequestVotes.id})::int`.as("vote_count"),
        votedByMe: sql<boolean>`bool_or(${featureRequestVotes.userId} = ${ctx.userId})`.as("voted_by_me"),
      })
      .from(featureRequests)
      .leftJoin(featureRequestVotes, eq(featureRequestVotes.featureRequestId, featureRequests.id))
      .groupBy(featureRequests.id)
      .orderBy(desc(sql`count(${featureRequestVotes.id})`));
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(3).max(140), description: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(featureRequests)
        .values({ userId: ctx.userId, title: input.title, description: input.description })
        .returning();
      // Auto-vote for your own request so it shows up correctly in your list.
      await ctx.db.insert(featureRequestVotes).values({ featureRequestId: row.id, userId: ctx.userId });
    }),

  toggleVote: protectedProcedure
    .input(z.object({ featureRequestId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(featureRequestVotes)
        .where(
          and(
            eq(featureRequestVotes.featureRequestId, input.featureRequestId),
            eq(featureRequestVotes.userId, ctx.userId),
          ),
        );
      if (existing) {
        await ctx.db.delete(featureRequestVotes).where(eq(featureRequestVotes.id, existing.id));
      } else {
        await ctx.db
          .insert(featureRequestVotes)
          .values({ featureRequestId: input.featureRequestId, userId: ctx.userId });
      }
    }),

  adminUpdateStatus: adminProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(["open", "planned", "shipped", "declined"]) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(featureRequests).set({ status: input.status }).where(eq(featureRequests.id, input.id));
    }),
});
