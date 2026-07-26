import { asc, eq } from "drizzle-orm";
import { router, paidProcedure } from "../trpc";
import { chatMessages } from "../db/schema";

export const aiCoachRouter = router({
  getMessages: paidProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, ctx.userId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(50);
  }),
});
