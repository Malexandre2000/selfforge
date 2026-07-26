import { View, Text, Pressable, TextInput } from "react-native";

export function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-3 text-sm font-medium text-ink-700">{children}</Text>;
}

export function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2.5 ${
        selected ? "border-ink-950 bg-ink-950" : "border-ink-200 bg-white"
      }`}
    >
      <Text
        style={{ fontFamily: "Inter_500Medium" }}
        className={`text-sm ${selected ? "text-white" : "text-ink-700"}`}
      >
        {selected ? "✓ " : ""}
        {label}
      </Text>
    </Pressable>
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
    <View className="flex-row flex-wrap gap-2.5">
      {options.map((opt) => (
        <Pill
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
        />
      ))}
    </View>
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
    onChange(value.includes(v) ? withoutNone : [...withoutNone, v]);
  }

  return (
    <View className="flex-row flex-wrap gap-2.5">
      {options.map((opt) => (
        <Pill
          key={opt.value}
          label={opt.label}
          selected={value.includes(opt.value)}
          onPress={() => toggle(opt.value)}
        />
      ))}
    </View>
  );
}

export function NumberField({
  value,
  onChange,
  suffix,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <TextInput
        value={value === undefined || Number.isNaN(value) ? "" : String(value)}
        onChangeText={(t) => {
          const n = Number(t.replace(/[^0-9.]/g, ""));
          onChange(n);
        }}
        keyboardType="numeric"
        style={{ fontFamily: "Inter_400Regular" }}
        className="h-14 w-28 rounded-md border border-ink-200 px-4 text-lg text-ink-950"
      />
      {suffix && (
        <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-500">
          {suffix}
        </Text>
      )}
    </View>
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
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      maxLength={500}
      multiline
      numberOfLines={4}
      style={{ fontFamily: "Inter_400Regular" }}
      className="min-h-28 rounded-md border border-ink-200 p-4 text-base text-ink-950"
      textAlignVertical="top"
    />
  );
}
