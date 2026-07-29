import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { waitlistEntries } from "../db/schema";
import { sendWelcomeEmail } from "../email/resend";

export const betaRouter = router({
  redeemInvite: protectedProcedure.input(z.object({ code: z.string().max(20) })).mutation(async ({ ctx, input }) => {
    const [row] = await ctx.db.select().from(waitlistEntries).where(eq(waitlistEntries.inviteCode, input.code));

    if (!row || row.status !== "invited") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or already-used invite code." });
    }

    await ctx.db
      .update(waitlistEntries)
      .set({ status: "joined", joinedUserId: ctx.userId, joinedAt: new Date() })
      .where(eq(waitlistEntries.id, row.id));

    await sendWelcomeEmail(row.email, row.name);
    return { ok: true };
  }),
});
