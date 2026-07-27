import { sql } from "drizzle-orm";
import type { Context } from "../context";
import { apiRateLimits } from "../db/schema";

const WINDOW_MS = 60_000; // 1-minute fixed window
const MAX_REQUESTS_PER_WINDOW = 120; // generous for real usage, blocks scripted abuse

/**
 * Fixed-window rate limiter backed by Postgres — no new infra (Redis, etc.)
 * needed at this scale, and it's consistent with how the rest of this app
 * is built. Returns false once `key` has made more than
 * MAX_REQUESTS_PER_WINDOW requests in the current window.
 */
export async function checkRateLimit(db: Context["db"], key: string): Promise<boolean> {
  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);

  const [row] = await db
    .insert(apiRateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [apiRateLimits.key, apiRateLimits.windowStart],
      set: { count: sql`${apiRateLimits.count} + 1` },
    })
    .returning();

  return (row?.count ?? 0) <= MAX_REQUESTS_PER_WINDOW;
}
