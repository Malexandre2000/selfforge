"use client";

import { Check } from "lucide-react";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-3 block text-sm font-medium text-ink-700">{children}</label>
  );
}

export function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
        selected
          ? "border-ink-950 bg-ink-950 text-white"
          : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
      }`}
    >
      {selected && <Check size={14} />}
      {label}
    </button>
  );
}

export function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => (
        <Pill
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

export function MultiPillGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(v: string) {
    if (v === "none") {
      onChange(value.includes("none") ? [] : ["none"]);
      return;
    }
    const withoutNone = value.filter((x) => x !== "none" && x !== v);
    const isSelected = value.includes(v);
    onChange(isSelected ? withoutNone : [...withoutNone, v]);
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => (
        <Pill
          key={opt.value}
          label={opt.label}
          selected={value.includes(opt.value)}
          onClick={() => toggle(opt.value)}
        />
      ))}
    </div>
  );
}

export function NumberField({
  value,
  onChange,
  suffix,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="h-14 w-32 rounded-md border border-ink-200 px-4 text-lg text-ink-950 outline-none focus:border-ink-950"
      />
      {suffix && <span className="text-sm text-ink-500">{suffix}</span>}
    </div>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  minLabel,
  maxLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-200 accent-ink-950"
        />
        <span className="font-display w-10 text-center text-2xl text-ink-950">
          {value}
        </span>
      </div>
      {(minLabel || maxLabel) && (
        <div className="mt-2 flex justify-between text-xs text-ink-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

export function TextAreaField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={500}
      rows={4}
      className="w-full resize-none rounded-md border border-ink-200 p-4 text-base text-ink-950 outline-none placeholder:text-ink-400 focus:border-ink-950"
    />
  );
}
