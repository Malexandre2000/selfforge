import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { db } from "@/server/db/client";
import { progressEntries } from "@/server/db/schema";
import { hasActiveAccess } from "@/server/billing/access";
import { checkRateLimit } from "@/server/security/rateLimit";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const KINDS = ["before", "after"] as const;
type Kind = (typeof KINDS)[number];

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function columnFor(kind: Kind) {
  return kind === "before" ? progressEntries.beforePhotoUrl : progressEntries.afterPhotoUrl;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!(await hasActiveAccess(db, userId))) {
    return new Response("Subscribe to unlock progress photos.", { status: 403 });
  }
  if (!(await checkRateLimit(db, `upload:${userId}`))) {
    return new Response("Slow down a little and try again.", { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!(file instanceof File) || typeof kind !== "string" || !KINDS.includes(kind as Kind)) {
    return new Response("Invalid request", { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return new Response("File must be an image", { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return new Response("Image is too large (max 8MB)", { status: 400 });
  }

  const column = columnFor(kind as Kind);

  const [existing] = await db
    .select({ pathname: column })
    .from(progressEntries)
    .where(and(eq(progressEntries.userId, userId), isNotNull(column)))
    .orderBy(desc(progressEntries.date))
    .limit(1);

  const extension = EXTENSION_BY_TYPE[file.type] ?? "jpg";
  const pathname = `progress-photos/${userId}/${kind}-${Date.now()}.${extension}`;
  await put(pathname, file, { access: "private", contentType: file.type });

  const photoField = kind === "before" ? "beforePhotoUrl" : "afterPhotoUrl";
  await db
    .insert(progressEntries)
    .values({ userId, date: todayDateString(), [photoField]: pathname })
    .onConflictDoUpdate({
      target: [progressEntries.userId, progressEntries.date],
      set: { [photoField]: pathname },
    });

  // Best-effort cleanup of the photo this one replaces — a failure here
  // leaves an orphaned blob, not a broken app state, so it shouldn't fail
  // the request.
  if (existing?.pathname && existing.pathname !== pathname) {
    await del(existing.pathname).catch(() => {});
  }

  return Response.json({ pathname });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const kind = new URL(req.url).searchParams.get("kind");
  if (typeof kind !== "string" || !KINDS.includes(kind as Kind)) {
    return new Response("Invalid request", { status: 400 });
  }

  const column = columnFor(kind as Kind);

  const [existing] = await db
    .select({ id: progressEntries.id, pathname: column })
    .from(progressEntries)
    .where(and(eq(progressEntries.userId, userId), isNotNull(column)))
    .orderBy(desc(progressEntries.date))
    .limit(1);

  if (!existing?.pathname) {
    return Response.json({ ok: true });
  }

  await del(existing.pathname).catch(() => {});
  await db
    .update(progressEntries)
    .set({ [kind === "before" ? "beforePhotoUrl" : "afterPhotoUrl"]: null })
    .where(eq(progressEntries.id, existing.id));

  return Response.json({ ok: true });
}
