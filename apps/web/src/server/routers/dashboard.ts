import { and, desc, eq, isNotNull } from "drizzle-orm";
import { router, paidProcedure } from "../trpc";
import { missionCompletions, onboardingProfiles, progressEntries } from "../db/schema";

function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function dateStringToUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

type TimelineStatus = "done" | "today" | "upcoming";

export const dashboardRouter = router({
  get: paidProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(onboardingProfiles)
      .where(eq(onboardingProfiles.userId, ctx.userId));

    if (!profile) {
      return { needsOnboarding: true as const };
    }

    const completions = await ctx.db
      .select({ date: missionCompletions.date })
      .from(missionCompletions)
      .where(and(eq(missionCompletions.userId, ctx.userId), eq(missionCompletions.completed, true)));

    const activeDates = new Set(completions.map((c) => c.date));
    const today = todayUTC();

    // Grace period: a still-open "today" shouldn't zero out yesterday's streak.
    const startCursor = new Date(today);
    if (!activeDates.has(toDateString(today))) {
      startCursor.setUTCDate(startCursor.getUTCDate() - 1);
    }

    let streak = 0;
    const cursor = new Date(startCursor);
    while (activeDates.has(toDateString(cursor))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    let activeInLast30 = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      if (activeDates.has(toDateString(d))) activeInLast30++;
    }
    const consistencyPercent = Math.round((activeInLast30 / 30) * 100);

    const startDate = dateStringToUTC(toDateString(profile.createdAt));
    const daysSinceStart = daysBetween(today, startDate) + 1;

    const firstCompletionDate = [...activeDates].sort()[0];
    const firstCompletionDay = firstCompletionDate
      ? daysBetween(dateStringToUTC(firstCompletionDate), startDate) + 1
      : null;

    const milestones: { label: string; day: number }[] = [
      { label: "Roadmap created", day: 1 },
      ...(firstCompletionDay ? [{ label: "First mission completed", day: firstCompletionDay }] : []),
      { label: "One week milestone", day: 7 },
      { label: "Two week milestone", day: 14 },
      { label: "One month milestone", day: 30 },
      { label: "Two month check-in", day: 60 },
    ].sort((a, b) => a.day - b.day);

    const timeline = milestones.map((m) => {
      const status: TimelineStatus =
        m.day < daysSinceStart ? "done" : m.day === daysSinceStart ? "today" : "upcoming";
      return { label: m.label, date: `Day ${m.day}`, status };
    });

    if (!timeline.some((t) => t.status === "today")) {
      const insertIndex = timeline.findIndex((t) => t.status === "upcoming");
      const todayItem = { label: "Today", date: `Day ${daysSinceStart}`, status: "today" as const };
      if (insertIndex === -1) timeline.push(todayItem);
      else timeline.splice(insertIndex, 0, todayItem);
    }

    const [beforeRow] = await ctx.db
      .select({ pathname: progressEntries.beforePhotoUrl })
      .from(progressEntries)
      .where(and(eq(progressEntries.userId, ctx.userId), isNotNull(progressEntries.beforePhotoUrl)))
      .orderBy(desc(progressEntries.date))
      .limit(1);
    const [afterRow] = await ctx.db
      .select({ pathname: progressEntries.afterPhotoUrl })
      .from(progressEntries)
      .where(and(eq(progressEntries.userId, ctx.userId), isNotNull(progressEntries.afterPhotoUrl)))
      .orderBy(desc(progressEntries.date))
      .limit(1);

    return {
      needsOnboarding: false as const,
      streak,
      consistencyPercent,
      confidence: profile.confidence,
      confidenceBaseline: profile.confidence,
      timeline,
      photos: { before: beforeRow?.pathname ?? null, after: afterRow?.pathname ?? null },
    };
  }),
});
