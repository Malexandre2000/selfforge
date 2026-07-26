import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { subscriptions } from "../db/schema";
import { stripe, PRICE_IDS } from "../stripe/client";
import { hasCompletedFirstMission } from "../billing/access";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const billingRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.userId));

    const firstMissionDone = await hasCompletedFirstMission(ctx.db, ctx.userId);

    if (!row) {
      return {
        hasAccess: false as const,
        status: "none" as const,
        plan: null,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        hasCompletedFirstMission: firstMissionDone,
      };
    }

    const hasAccess = row.status === "trialing" || row.status === "active";
    return {
      hasAccess,
      status: row.status,
      plan: row.plan,
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      currentPeriodEnd: row.currentPeriodEnd,
      hasCompletedFirstMission: firstMissionDone,
    };
  }),

  createCheckoutSession: protectedProcedure
    .input(z.object({ plan: z.enum(["monthly", "annual"]) }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.userId));

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        client_reference_id: ctx.userId,
        customer: existing?.stripeCustomerId,
        line_items: [{ price: PRICE_IDS[input.plan], quantity: 1 }],
        subscription_data: {
          trial_period_days: 7,
          metadata: { userId: ctx.userId },
        },
        success_url: `${APP_URL}/dashboard?checkout=success`,
        cancel_url: `${APP_URL}/pricing?checkout=canceled`,
      });

      if (!session.url) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe did not return a checkout URL" });
      }
      return { url: session.url };
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.userId));

    if (!row) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account yet — subscribe first" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: `${APP_URL}/settings`,
    });

    return { url: session.url };
  }),
});
