import { count, eq } from "drizzle-orm";
import { router, adminProcedure } from "../trpc";
import { waitlistEntries, feedbackEntries, featureRequests } from "../db/schema";

export const adminRouter = router({
  kpis: adminProcedure.query(async ({ ctx }) => {
    const [waitlistTotal] = await ctx.db.select({ n: count() }).from(waitlistEntries);
    const [invited] = await ctx.db
      .select({ n: count() })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.status, "invited"));
    const [joined] = await ctx.db
      .select({ n: count() })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.status, "joined"));
    const [feedbackTotal] = await ctx.db.select({ n: count() }).from(feedbackEntries);
    const [bugTotal] = await ctx.db
      .select({ n: count() })
      .from(feedbackEntries)
      .where(eq(feedbackEntries.type, "bug"));
    const [featureRequestTotal] = await ctx.db.select({ n: count() }).from(featureRequests);

    return {
      waitlistTotal: waitlistTotal.n,
      invited: invited.n,
      joined: joined.n,
      activationRate: invited.n > 0 ? Math.round((joined.n / invited.n) * 100) : 0,
      feedbackTotal: feedbackTotal.n,
      bugTotal: bugTotal.n,
      featureRequestTotal: featureRequestTotal.n,
    };
  }),
});
