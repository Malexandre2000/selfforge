import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { router, paidProcedure } from "../trpc";
import { progressEntries } from "../db/schema";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

type MeasurementKey = "waistCm" | "chestCm" | "armsCm";
const MEASUREMENT_META: { key: MeasurementKey; label: string; goodDirection: "down" | "up" }[] = [
  { key: "waistCm", label: "Waist", goodDirection: "down" },
  { key: "chestCm", label: "Chest", goodDirection: "up" },
  { key: "armsCm", label: "Arms", goodDirection: "up" },
];

export const progressRouter = router({
  get: paidProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(progressEntries)
      .where(eq(progressEntries.userId, ctx.userId))
      .orderBy(asc(progressEntries.date));

    const weightHistory = rows
      .filter((r) => r.weightKg !== null)
      .map((r) => ({ label: formatDateLabel(r.date), weight: r.weightKg as number }));

    const measurements = MEASUREMENT_META.flatMap(({ key, label, goodDirection }) => {
      const withValue = rows.filter((r) => r[key] !== null);
      if (withValue.length === 0) return [];
      return [
        {
          label,
          unit: "cm",
          start: withValue[0][key] as number,
          current: withValue[withValue.length - 1][key] as number,
          goodDirection,
        },
      ];
    });

    return {
      weightHistory,
      measurements,
      latest: rows.length ? rows[rows.length - 1] : null,
    };
  }),

  logEntry: paidProcedure
    .input(
      z
        .object({
          weightKg: z.number().positive().optional(),
          waistCm: z.number().positive().optional(),
          chestCm: z.number().positive().optional(),
          armsCm: z.number().positive().optional(),
        })
        .refine((v) => Object.values(v).some((x) => x !== undefined), {
          message: "Provide at least one measurement",
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const date = todayDateString();

      const set: Partial<typeof progressEntries.$inferInsert> = {};
      if (input.weightKg !== undefined) set.weightKg = input.weightKg;
      if (input.waistCm !== undefined) set.waistCm = input.waistCm;
      if (input.chestCm !== undefined) set.chestCm = input.chestCm;
      if (input.armsCm !== undefined) set.armsCm = input.armsCm;

      await ctx.db
        .insert(progressEntries)
        .values({ userId: ctx.userId, date, ...input })
        .onConflictDoUpdate({
          target: [progressEntries.userId, progressEntries.date],
          set,
        });
    }),
});
