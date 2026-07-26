import { initTRPC, TRPCError } from "@trpc/server";
import { users } from "./db/schema";
import { hasActiveAccess } from "./billing/access";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

/** Requires a signed-in Clerk user; ensures a matching `users` row exists. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  await ctx.db.insert(users).values({ id: ctx.userId }).onConflictDoNothing();

  return next({
    ctx: { ...ctx, userId: ctx.userId },
  });
});

/**
 * Requires an active or trialing subscription. This is the server-side half
 * of the paywall — the UI gates on the same rule via billing.getStatus, but
 * this exists so the restriction holds even if someone calls the API
 * directly, bypassing the client.
 */
export const paidProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!(await hasActiveAccess(ctx.db, ctx.userId))) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Subscribe to unlock this." });
  }

  return next({ ctx });
});
