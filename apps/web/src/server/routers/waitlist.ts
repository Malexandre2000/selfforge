import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { waitlistEntries } from "../db/schema";
import { generateCode } from "../beta/codes";
import { checkRateLimit } from "../security/rateLimit";
import { sendBetaInviteEmail } from "../email/resend";

export const waitlistRouter = router({
  join: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(255),
        name: z.string().max(120).optional(),
        referredByCode: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase().trim();

      if (!(await checkRateLimit(ctx.db, `waitlist:${email}`))) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Slow down a little and try again." });
      }

      const [existing] = await ctx.db
        .select({ referralCode: waitlistEntries.referralCode })
        .from(waitlistEntries)
        .where(eq(waitlistEntries.email, email));
      if (existing) {
        return { referralCode: existing.referralCode, alreadyOnList: true };
      }

      // Codes are random within a huge space (33^8), so a collision is
      // vanishingly unlikely — a couple of retries is cheap insurance on a
      // public endpoint rather than letting one bad roll 500 the request.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const [row] = await ctx.db
            .insert(waitlistEntries)
            .values({
              email,
              name: input.name,
              referralCode: generateCode(8),
              referredByCode: input.referredByCode,
            })
            .returning();
          return { referralCode: row.referralCode, alreadyOnList: false };
        } catch {
          if (attempt === 2) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }),

  checkInvite: publicProcedure.input(z.object({ code: z.string().max(20) })).query(async ({ ctx, input }) => {
    const [row] = await ctx.db
      .select({ status: waitlistEntries.status })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.inviteCode, input.code));
    return { valid: row?.status === "invited" };
  }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(waitlistEntries).orderBy(desc(waitlistEntries.createdAt));
    const referralCounts = new Map<string, number>();
    for (const row of rows) {
      if (row.referredByCode) {
        referralCounts.set(row.referredByCode, (referralCounts.get(row.referredByCode) ?? 0) + 1);
      }
    }
    return rows.map((row) => ({ ...row, referralCount: referralCounts.get(row.referralCode) ?? 0 }));
  }),

  adminInvite: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const [row] = await ctx.db
      .update(waitlistEntries)
      .set({ status: "invited", inviteCode: generateCode(10), invitedAt: new Date() })
      .where(eq(waitlistEntries.id, input.id))
      .returning();

    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    if (row.inviteCode) {
      await sendBetaInviteEmail(row.email, row.inviteCode, row.name);
    }
    return { ok: true };
  }),
});
