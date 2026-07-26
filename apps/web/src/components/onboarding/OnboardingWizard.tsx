"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  onboardingProfileSchema,
  ONBOARDING_STEP_FIELDS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  PHYSIQUE_OPTIONS,
  SKIN_CONCERN_OPTIONS,
  HAIR_CONCERN_OPTIONS,
  BUDGET_OPTIONS,
  GYM_EXPERIENCE_OPTIONS,
  genderLabels,
  goalLabels,
  physiqueLabels,
  skinConcernLabels,
  hairConcernLabels,
  budgetLabels,
  gymExperienceLabels,
  type OnboardingProfile,
} from "@selfforge/types";
import {
  FieldLabel,
  PillGroup,
  MultiPillGroup,
  NumberField,
  Slider,
  TextAreaField,
} from "./fields";
import { savePendingOnboarding } from "@/lib/onboardingStorage";

const easeOut = [0.16, 1, 0.3, 1] as const;

type Draft = Partial<OnboardingProfile>;

const STEP_TITLES = [
  "The basics",
  "Your goal",
  "Any concerns?",
  "Your lifestyle",
  "How confident do you feel today?",
];

function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): { value: string; label: string }[] {
  return values.map((v) => ({ value: v, label: labels[v] }));
}

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - ft * 12);
  return { ft, in: inches };
}

function ftInToCm(ft: number, inches: number) {
  return (ft * 12 + inches) * 2.54;
}

function kgToLb(kg: number) {
  return Math.round(kg * 2.20462);
}

function lbToKg(lb: number) {
  return lb / 2.20462;
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    currentHabits: "",
    sleepHours: 7,
    confidence: 5,
  });
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const stepFields = ONBOARDING_STEP_FIELDS[step];

  const isStepValid = useMemo(() => {
    const shape = Object.fromEntries(stepFields.map((f) => [f, true]));
    const stepSchema = onboardingProfileSchema.pick(
      shape as Record<(typeof stepFields)[number], true>,
    );
    return stepSchema.safeParse(draft).success;
  }, [draft, stepFields]);

  const isLastStep = step === ONBOARDING_STEP_FIELDS.length - 1;
  const progress = ((step + (submitted ? 1 : 0)) / ONBOARDING_STEP_FIELDS.length) * 100;

  function next() {
    if (!isStepValid) return;
    if (isLastStep) {
      const result = onboardingProfileSchema.safeParse(draft);
      if (result.success) savePendingOnboarding(result.data);
      setSubmitted(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  if (submitted) {
    const result = onboardingProfileSchema.safeParse(draft);
    return <CompleteScreen profile={result.success ? result.data : null} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="h-1 w-full bg-ink-100">
        <motion.div
          className="h-full bg-ink-950"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: easeOut }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-10 sm:py-16">
        <div className="mb-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={back}
              className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-950"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-950"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
          )}
          <span className="text-sm text-ink-400">
            Step {step + 1} of {ONBOARDING_STEP_FIELDS.length}
          </span>
        </div>

        <div key={step} className="flex-1 animate-step-in">
          <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
            {STEP_TITLES[step]}
          </h1>

          <div className="mt-10 flex flex-col gap-8">
            {step === 0 && (
              <StepBasics draft={draft} set={set} unit={unit} setUnit={setUnit} />
            )}
            {step === 1 && <StepGoal draft={draft} set={set} />}
            {step === 2 && <StepConcerns draft={draft} set={set} />}
            {step === 3 && <StepLifestyle draft={draft} set={set} />}
            {step === 4 && <StepConfidence draft={draft} set={set} />}
          </div>
        </div>

        <button
          onClick={next}
          disabled={!isStepValid}
          className="group mt-12 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink-950 text-base font-medium text-white transition-opacity disabled:opacity-30 enabled:hover:opacity-90"
        >
          {isLastStep ? "Build my roadmap" : "Continue"}
          <ArrowRight size={17} className="transition-transform group-enabled:group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function StepBasics({
  draft,
  set,
  unit,
  setUnit,
}: {
  draft: Draft;
  set: <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => void;
  unit: "imperial" | "metric";
  setUnit: (u: "imperial" | "metric") => void;
}) {
  const ftIn = draft.heightCm ? cmToFtIn(draft.heightCm) : undefined;

  return (
    <>
      <div>
        <FieldLabel>Age</FieldLabel>
        <NumberField
          value={draft.age ?? NaN}
          onChange={(v) => set("age", v)}
          suffix="years"
          min={13}
          max={100}
        />
      </div>

      <div>
        <FieldLabel>Gender</FieldLabel>
        <PillGroup
          options={toOptions(GENDER_OPTIONS, genderLabels)}
          value={draft.gender ?? ""}
          onChange={(v) => set("gender", v as OnboardingProfile["gender"])}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <FieldLabel>Height</FieldLabel>
          <UnitToggle unit={unit} setUnit={setUnit} />
        </div>
        {unit === "metric" ? (
          <NumberField
            value={draft.heightCm ?? NaN}
            onChange={(v) => set("heightCm", v)}
            suffix="cm"
            min={120}
            max={230}
          />
        ) : (
          <div className="flex gap-3">
            <NumberField
              value={ftIn?.ft ?? NaN}
              onChange={(ft) => set("heightCm", ftInToCm(ft, ftIn?.in ?? 0))}
              suffix="ft"
              min={3}
              max={7}
            />
            <NumberField
              value={ftIn?.in ?? NaN}
              onChange={(inches) => set("heightCm", ftInToCm(ftIn?.ft ?? 5, inches))}
              suffix="in"
              min={0}
              max={11}
            />
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Weight</FieldLabel>
        {unit === "metric" ? (
          <NumberField
            value={draft.weightKg ?? NaN}
            onChange={(v) => set("weightKg", v)}
            suffix="kg"
            min={30}
            max={250}
          />
        ) : (
          <NumberField
            value={draft.weightKg ? kgToLb(draft.weightKg) : NaN}
            onChange={(lb) => set("weightKg", lbToKg(lb))}
            suffix="lb"
            min={66}
            max={550}
          />
        )}
      </div>
    </>
  );
}

function UnitToggle({
  unit,
  setUnit,
}: {
  unit: "imperial" | "metric";
  setUnit: (u: "imperial" | "metric") => void;
}) {
  return (
    <div className="flex rounded-full border border-ink-200 p-0.5 text-xs">
      {(["imperial", "metric"] as const).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => setUnit(u)}
          className={`rounded-full px-3 py-1 font-medium capitalize transition-colors ${
            unit === u ? "bg-ink-950 text-white" : "text-ink-500"
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}

function StepGoal({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => void;
}) {
  return (
    <>
      <div>
        <FieldLabel>What&apos;s your primary goal?</FieldLabel>
        <PillGroup
          options={toOptions(GOAL_OPTIONS, goalLabels)}
          value={draft.goal ?? ""}
          onChange={(v) => set("goal", v as OnboardingProfile["goal"])}
        />
      </div>
      <div>
        <FieldLabel>How would you describe your current physique?</FieldLabel>
        <PillGroup
          options={toOptions(PHYSIQUE_OPTIONS, physiqueLabels)}
          value={draft.currentPhysique ?? ""}
          onChange={(v) => set("currentPhysique", v as OnboardingProfile["currentPhysique"])}
        />
      </div>
    </>
  );
}

function StepConcerns({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => void;
}) {
  return (
    <>
      <div>
        <FieldLabel>Skin concerns (select all that apply)</FieldLabel>
        <MultiPillGroup
          options={toOptions(SKIN_CONCERN_OPTIONS, skinConcernLabels)}
          value={draft.skinConcerns ?? []}
          onChange={(v) => set("skinConcerns", v as OnboardingProfile["skinConcerns"])}
        />
      </div>
      <div>
        <FieldLabel>Hair concerns (select all that apply)</FieldLabel>
        <MultiPillGroup
          options={toOptions(HAIR_CONCERN_OPTIONS, hairConcernLabels)}
          value={draft.hairConcerns ?? []}
          onChange={(v) => set("hairConcerns", v as OnboardingProfile["hairConcerns"])}
        />
      </div>
    </>
  );
}

function StepLifestyle({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => void;
}) {
  return (
    <>
      <div>
        <FieldLabel>Self-care budget</FieldLabel>
        <PillGroup
          options={toOptions(BUDGET_OPTIONS, budgetLabels)}
          value={draft.budget ?? ""}
          onChange={(v) => set("budget", v as OnboardingProfile["budget"])}
        />
      </div>
      <div>
        <FieldLabel>Average sleep per night</FieldLabel>
        <Slider
          value={draft.sleepHours ?? 7}
          onChange={(v) => set("sleepHours", v)}
          min={0}
          max={12}
          minLabel="0 hrs"
          maxLabel="12 hrs"
        />
      </div>
      <div>
        <FieldLabel>Gym experience</FieldLabel>
        <PillGroup
          options={toOptions(GYM_EXPERIENCE_OPTIONS, gymExperienceLabels)}
          value={draft.gymExperience ?? ""}
          onChange={(v) => set("gymExperience", v as OnboardingProfile["gymExperience"])}
        />
      </div>
      <div>
        <FieldLabel>Any current habits worth knowing about?</FieldLabel>
        <TextAreaField
          value={draft.currentHabits ?? ""}
          onChange={(v) => set("currentHabits", v)}
          placeholder="e.g. I already go on a walk most mornings, I track my water intake..."
        />
      </div>
    </>
  );
}

function StepConfidence({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => void;
}) {
  return (
    <div>
      <FieldLabel>Rate your confidence right now</FieldLabel>
      <Slider
        value={draft.confidence ?? 5}
        onChange={(v) => set("confidence", v)}
        min={1}
        max={10}
        minLabel="Not confident"
        maxLabel="Very confident"
      />
    </div>
  );
}

function CompleteScreen({ profile }: { profile: OnboardingProfile | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center">
      <span className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-ink-300">
        Roadmap ready
      </span>
      <h1 className="mt-6 font-display text-3xl tracking-tight text-white sm:text-4xl">
        Your roadmap is built.
      </h1>
      <p className="mt-4 max-w-md text-ink-300">
        Create a free account to save it and unlock your dashboard, daily
        missions, and coach.
      </p>
      {!profile && (
        <p className="mt-4 text-sm text-error">
          Something in your answers didn&apos;t validate — go back and double-check each step.
        </p>
      )}
      <Link
        href="/sign-up"
        className="mt-9 flex h-12 items-center justify-center rounded-full bg-white px-7 text-base font-medium text-ink-950 transition-transform hover:scale-[1.02]"
      >
        Create your account
      </Link>
    </div>
  );
}
