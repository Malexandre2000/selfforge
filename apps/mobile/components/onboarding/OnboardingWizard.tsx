import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
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
  TextAreaField,
} from "./fields";
import { Slider } from "./Slider";
import { savePendingOnboarding } from "@/lib/onboardingStorage";

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

function kgToLb(kg: number) {
  return Math.round(kg * 2.20462);
}
function lbToKg(lb: number) {
  return lb / 2.20462;
}
function cmToIn(cm: number) {
  return Math.round(cm / 2.54);
}
function inToCm(inches: number) {
  return inches * 2.54;
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    currentHabits: "",
    sleepHours: 7,
    confidence: 5,
  });
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
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  if (submitted) {
    return <CompleteScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <View className="h-1 w-full bg-ink-100">
        <View
          className="h-full bg-ink-950"
          style={{ width: `${(step / ONBOARDING_STEP_FIELDS.length) * 100}%` }}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable onPress={back}>
            <Text style={{ fontFamily: "Inter_500Medium" }} className="text-sm text-ink-500">
              ← {step === 0 ? "Back" : "Back"}
            </Text>
          </Pressable>
          <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-400">
            Step {step + 1} of {ONBOARDING_STEP_FIELDS.length}
          </Text>
        </View>

        <Text
          style={{ fontFamily: "Fraunces_600SemiBold" }}
          className="text-3xl text-ink-950"
        >
          {STEP_TITLES[step]}
        </Text>

        <View className="mt-8 gap-8">
          {step === 0 && <StepBasics draft={draft} set={set} />}
          {step === 1 && <StepGoal draft={draft} set={set} />}
          {step === 2 && <StepConcerns draft={draft} set={set} />}
          {step === 3 && <StepLifestyle draft={draft} set={set} />}
          {step === 4 && <StepConfidence draft={draft} set={set} />}
        </View>

        <Pressable
          onPress={next}
          disabled={!isStepValid}
          className={`mt-12 h-14 items-center justify-center rounded-full ${
            isStepValid ? "bg-ink-950" : "bg-ink-200"
          }`}
        >
          <Text
            style={{ fontFamily: "Inter_500Medium" }}
            className={`text-base ${isStepValid ? "text-white" : "text-ink-400"}`}
          >
            {isLastStep ? "Build my roadmap" : "Continue"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StepBasics({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => void;
}) {
  return (
    <>
      <View>
        <FieldLabel>Age</FieldLabel>
        <NumberField value={draft.age} onChange={(v) => set("age", v)} suffix="years" />
      </View>
      <View>
        <FieldLabel>Gender</FieldLabel>
        <PillGroup
          options={toOptions(GENDER_OPTIONS, genderLabels)}
          value={draft.gender ?? ""}
          onChange={(v) => set("gender", v as OnboardingProfile["gender"])}
        />
      </View>
      <View>
        <FieldLabel>Height</FieldLabel>
        <NumberField
          value={draft.heightCm ? cmToIn(draft.heightCm) : undefined}
          onChange={(inches) => set("heightCm", inToCm(inches))}
          suffix="in"
        />
      </View>
      <View>
        <FieldLabel>Weight</FieldLabel>
        <NumberField
          value={draft.weightKg ? kgToLb(draft.weightKg) : undefined}
          onChange={(lb) => set("weightKg", lbToKg(lb))}
          suffix="lb"
        />
      </View>
    </>
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
      <View>
        <FieldLabel>What&apos;s your primary goal?</FieldLabel>
        <PillGroup
          options={toOptions(GOAL_OPTIONS, goalLabels)}
          value={draft.goal ?? ""}
          onChange={(v) => set("goal", v as OnboardingProfile["goal"])}
        />
      </View>
      <View>
        <FieldLabel>How would you describe your current physique?</FieldLabel>
        <PillGroup
          options={toOptions(PHYSIQUE_OPTIONS, physiqueLabels)}
          value={draft.currentPhysique ?? ""}
          onChange={(v) => set("currentPhysique", v as OnboardingProfile["currentPhysique"])}
        />
      </View>
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
      <View>
        <FieldLabel>Skin concerns (select all that apply)</FieldLabel>
        <MultiPillGroup
          options={toOptions(SKIN_CONCERN_OPTIONS, skinConcernLabels)}
          value={draft.skinConcerns ?? []}
          onChange={(v) => set("skinConcerns", v as OnboardingProfile["skinConcerns"])}
        />
      </View>
      <View>
        <FieldLabel>Hair concerns (select all that apply)</FieldLabel>
        <MultiPillGroup
          options={toOptions(HAIR_CONCERN_OPTIONS, hairConcernLabels)}
          value={draft.hairConcerns ?? []}
          onChange={(v) => set("hairConcerns", v as OnboardingProfile["hairConcerns"])}
        />
      </View>
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
      <View>
        <FieldLabel>Self-care budget</FieldLabel>
        <PillGroup
          options={toOptions(BUDGET_OPTIONS, budgetLabels)}
          value={draft.budget ?? ""}
          onChange={(v) => set("budget", v as OnboardingProfile["budget"])}
        />
      </View>
      <View>
        <FieldLabel>Average sleep per night</FieldLabel>
        <Slider
          value={draft.sleepHours ?? 7}
          onChange={(v) => set("sleepHours", v)}
          min={0}
          max={12}
          minLabel="0 hrs"
          maxLabel="12 hrs"
        />
      </View>
      <View>
        <FieldLabel>Gym experience</FieldLabel>
        <PillGroup
          options={toOptions(GYM_EXPERIENCE_OPTIONS, gymExperienceLabels)}
          value={draft.gymExperience ?? ""}
          onChange={(v) => set("gymExperience", v as OnboardingProfile["gymExperience"])}
        />
      </View>
      <View>
        <FieldLabel>Any current habits worth knowing about?</FieldLabel>
        <TextAreaField
          value={draft.currentHabits ?? ""}
          onChange={(v) => set("currentHabits", v)}
          placeholder="e.g. I already go on a walk most mornings..."
        />
      </View>
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
    <View>
      <FieldLabel>Rate your confidence right now</FieldLabel>
      <Slider
        value={draft.confidence ?? 5}
        onChange={(v) => set("confidence", v)}
        min={1}
        max={10}
        minLabel="Not confident"
        maxLabel="Very confident"
      />
    </View>
  );
}

function CompleteScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-ink-950 px-8">
      <View className="rounded-full border border-white/15 px-4 py-1.5">
        <Text
          style={{ fontFamily: "Inter_500Medium" }}
          className="text-xs uppercase tracking-[2px] text-ink-300"
        >
          Roadmap ready
        </Text>
      </View>
      <Text
        style={{ fontFamily: "Fraunces_600SemiBold" }}
        className="mt-6 text-center text-3xl text-white"
      >
        Your roadmap is built.
      </Text>
      <Text
        style={{ fontFamily: "Inter_400Regular" }}
        className="mt-4 text-center text-base text-ink-300"
      >
        Create a free account to save it and unlock your dashboard, daily
        missions, and coach.
      </Text>
      <Pressable
        onPress={() => router.push("/sign-up")}
        className="mt-9 h-14 w-full items-center justify-center rounded-full bg-white active:opacity-80"
      >
        <Text style={{ fontFamily: "Inter_500Medium" }} className="text-base text-ink-950">
          Create your account
        </Text>
      </Pressable>
    </View>
  );
}
