import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
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
    <View className="flex-1 gap-1.5">
      <Text
        style={{ fontFamily: "Inter_500Medium" }}
        className="text-xs uppercase tracking-[1.5px] text-ink-400"
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2">
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ""))}
          keyboardType="decimal-pad"
          placeholder="—"
          style={{ fontFamily: "Inter_400Regular" }}
          className="flex-1 text-ink-950"
        />
        <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-400">
          {suffix}
        </Text>
      </View>
    </View>
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
    <View className="rounded-lg border border-ink-200 bg-white p-6">
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
        Log today&apos;s check-in
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-500">
        Fill in whichever measurements you have today.
      </Text>

      <View className="mt-5 flex-row flex-wrap gap-4">
        <FieldInput label="Weight" suffix="kg" value={weightKg} onChange={setWeightKg} />
        <FieldInput label="Waist" suffix="cm" value={waistCm} onChange={setWaistCm} />
        <FieldInput label="Chest" suffix="cm" value={chestCm} onChange={setChestCm} />
        <FieldInput label="Arms" suffix="cm" value={armsCm} onChange={setArmsCm} />
      </View>

      <Pressable
        onPress={() => logEntry.mutate(parsed)}
        disabled={!hasValue || logEntry.isPending}
        className="mt-5 h-11 items-center justify-center rounded-full bg-ink-950 px-6 active:opacity-90"
        style={{ opacity: !hasValue || logEntry.isPending ? 0.4 : 1 }}
      >
        <Text style={{ fontFamily: "Inter_500Medium" }} className="text-sm text-white">
          {logEntry.isPending ? "Saving…" : "Save check-in"}
        </Text>
      </Pressable>
    </View>
  );
}
