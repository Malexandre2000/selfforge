import { eq } from "drizzle-orm";
import type { Context } from "../context";
import { waitlistEntries } from "../db/schema";

export async function isBetaMember(db: Context["db"], userId: string): Promise<boolean> {
  const [row] = await db
    .select({ status: waitlistEntries.status })
    .from(waitlistEntries)
    .where(eq(waitlistEntries.joinedUserId, userId));
  return row?.status === "joined";
}

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.has(email.toLowerCase());
}
