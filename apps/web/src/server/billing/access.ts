import { and, eq } from "drizzle-orm";
import { count } from "drizzle-orm/sql";
import type { Context } from "../context";
import { subscriptions, missionCompletions } from "../db/schema";
import { isBetaMember } from "../beta/access";

/** Joined beta members get free access — this is the one place that grants it. */
export async function hasActiveAccess(db: Context["db"], userId: string): Promise<boolean> {
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  if (sub?.status === "trialing" || sub?.status === "active") return true;
  return isBetaMember(db, userId);
}

/** Whether this user has ever completed a mission — the free-preview cutoff. */
export async function hasCompletedFirstMission(db: Context["db"], userId: string): Promise<boolean> {
  const [row] = await db
    .select({ n: count() })
    .from(missionCompletions)
    .where(and(eq(missionCompletions.userId, userId), eq(missionCompletions.completed, true)));
  return (row?.n ?? 0) > 0;
}
