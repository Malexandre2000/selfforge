import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error" }, { status: 503 });
  }
}
