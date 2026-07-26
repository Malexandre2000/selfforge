import { and, eq, gte, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, paidProcedure } from "../trpc";
import { habits, habitEntries } from "../db/schema";

const DEFAULT_HABIT_TITLES = [
  "Drink 3L of water",
  "Morning walk (10 min)",
  "No phone after 10pm",
  "Track meals",
  "Stretch before bed",
];

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/** Oldest first, today last — matches the Habit.history shape in @selfforge/types. */
function last7DateStrings(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const habitsRouter = router({
  list: paidProcedure.query(async ({ ctx }) => {
    let userHabits = await ctx.db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, ctx.userId), eq(habits.active, true)));

    if (userHabits.length === 0) {
      userHabits = await ctx.db
        .insert(habits)
        .values(DEFAULT_HABIT_TITLES.map((title) => ({ userId: ctx.userId, title })))
        .returning();
    }

    const dates = last7DateStrings();
    const habitIds = userHabits.map((h) => h.id);

    const entries = await ctx.db
      .select()
      .from(habitEntries)
      .where(and(inArray(habitEntries.habitId, habitIds), gte(habitEntries.date, dates[0])));

    return userHabits.map((h) => {
      const completedByDate = new Map(
        entries.filter((e) => e.habitId === h.id).map((e) => [e.date, e.completed]),
      );
      return {
        id: h.id,
        title: h.title,
        history: dates.map((d) => completedByDate.get(d) ?? false),
      };
    });
  }),

  toggleToday: paidProcedure
    .input(z.object({ habitId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [owned] = await ctx.db
        .select()
        .from(habits)
        .where(and(eq(habits.id, input.habitId), eq(habits.userId, ctx.userId)));

      if (!owned) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const date = todayDateString();

      const [existing] = await ctx.db
        .select()
        .from(habitEntries)
        .where(and(eq(habitEntries.habitId, input.habitId), eq(habitEntries.date, date)));

      const nextCompleted = !existing?.completed;

      await ctx.db
        .insert(habitEntries)
        .values({ habitId: input.habitId, date, completed: nextCompleted })
        .onConflictDoUpdate({
          target: [habitEntries.habitId, habitEntries.date],
          set: { completed: nextCompleted },
        });

      return { completed: nextCompleted };
    }),
});
