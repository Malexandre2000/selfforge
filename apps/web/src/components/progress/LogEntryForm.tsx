"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

function FieldInput({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.1em] text-ink-400">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="w-full text-ink-950 outline-none placeholder:text-ink-300"
        />
        <span className="text-sm text-ink-400">{suffix}</span>
      </div>
    </label>
  );
}

export function LogEntryForm() {
  const utils = trpc.useUtils();
  const [weightKg, setWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [armsCm, setArmsCm] = useState("");

  const logEntry = trpc.progress.logEntry.useMutation({
    onSuccess: () => {
      utils.progress.get.invalidate();
      setWeightKg("");
      setWaistCm("");
      setChestCm("");
      setArmsCm("");
    },
  });

  const parsed = {
    weightKg: weightKg ? Number(weightKg) : undefined,
    waistCm: waistCm ? Number(waistCm) : undefined,
    chestCm: chestCm ? Number(chestCm) : undefined,
    armsCm: armsCm ? Number(armsCm) : undefined,
  };
  const hasValue = Object.values(parsed).some((v) => v !== undefined);

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6">
      <h2 className="font-display text-xl text-ink-950">Log today&apos;s check-in</h2>
      <p className="mt-1 text-sm text-ink-500">Fill in whichever measurements you have today.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FieldInput label="Weight" suffix="kg" value={weightKg} onChange={setWeightKg} />
        <FieldInput label="Waist" suffix="cm" value={waistCm} onChange={setWaistCm} />
        <FieldInput label="Chest" suffix="cm" value={chestCm} onChange={setChestCm} />
        <FieldInput label="Arms" suffix="cm" value={armsCm} onChange={setArmsCm} />
      </div>

      <button
        onClick={() => logEntry.mutate(parsed)}
        disabled={!hasValue || logEntry.isPending}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
      >
        {logEntry.isPending ? "Saving…" : "Save check-in"}
      </button>
    </div>
  );
}
