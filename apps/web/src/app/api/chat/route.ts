import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { count } from "drizzle-orm/sql";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { onboardingProfileSchema } from "@selfforge/types";
import { db } from "@/server/db/client";
import { chatMessages, onboardingProfiles } from "@/server/db/schema";
import { describeProfile } from "@/server/ai/generateDailyPlan";
import { hasActiveAccess } from "@/server/billing/access";

const anthropic = new Anthropic();

// A hard cap on Claude calls per user, independent of subscription status —
// without this, one trialing account (free until day 7, no card charged yet)
// could run unbounded Opus calls at our expense. Broad abuse/IP-level
// protection is a separate, later concern; this just stops runaway cost.
const MESSAGES_PER_HOUR_LIMIT = 30;

const GENERIC_SYSTEM_PROMPT =
  "You are SelfForge's AI self-improvement coach — a warm, direct, no-nonsense " +
  "guide across fitness, nutrition, skincare, haircare, style, grooming, " +
  "confidence, habits, sleep, and motivation. Keep replies concise and " +
  "actionable, never generic fluff.";

function buildSystemPrompt(profileText: string | null): string {
  if (!profileText) return GENERIC_SYSTEM_PROMPT;
  return `${GENERIC_SYSTEM_PROMPT}\n\nHere is what you know about this person:\n${profileText}\n\nUse this to tailor every answer to them specifically — never give generic advice that ignores who they are.`;
}

const bodySchema = z.object({ content: z.string().min(1).max(4000) });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!(await hasActiveAccess(db, userId))) {
    return new Response("Subscribe to unlock the AI coach.", { status: 403 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ n: recentMessageCount }] = await db
    .select({ n: count() })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.role, "user"),
        gt(chatMessages.createdAt, oneHourAgo),
      ),
    );

  if (recentMessageCount >= MESSAGES_PER_HOUR_LIMIT) {
    return new Response("You've hit the hourly message limit. Please try again in a bit.", {
      status: 429,
    });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }
  const { content } = parsed.data;

  const [profileRow] = await db
    .select()
    .from(onboardingProfiles)
    .where(eq(onboardingProfiles.userId, userId));
  const systemPrompt = buildSystemPrompt(
    profileRow ? describeProfile(onboardingProfileSchema.parse(profileRow)) : null,
  );

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(asc(chatMessages.createdAt))
    .limit(30);

  await db.insert(chatMessages).values({ userId, role: "user", content });

  const messageStream = anthropic.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content }) as const),
      { role: "user" as const, content },
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      messageStream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
      messageStream.on("error", (err) => controller.error(err));
      messageStream
        .finalText()
        .then(async (fullText) => {
          await db.insert(chatMessages).values({ userId, role: "assistant", content: fullText });
        })
        .catch(() => {})
        .finally(() => controller.close());
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
