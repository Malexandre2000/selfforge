import { View, Text, Pressable } from "react-native";
import {
  Dumbbell,
  Utensils,
  Sparkles,
  Brush,
  Smile,
  ListChecks,
  Flame,
  Check,
  type LucideIcon,
} from "lucide-react-native";
import type { DailyMission, MissionCategory } from "@selfforge/types";

const categoryIcons: Record<MissionCategory, LucideIcon> = {
  workout: Dumbbell,
  nutrition: Utensils,
  skincare: Sparkles,
  grooming: Brush,
  confidence: Smile,
  habit: ListChecks,
  motivation: Flame,
};

export function MissionCard({
  mission,
  label,
  completed,
  onToggle,
}: {
  mission: DailyMission;
  label: string;
  completed: boolean;
  onToggle: () => void;
}) {
  const Icon = categoryIcons[mission.category];

  return (
    <View
      className={`flex-row gap-4 rounded-lg border p-5 ${
        completed ? "border-ink-100 bg-ink-50" : "border-ink-200 bg-white"
      }`}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-md ${
          completed ? "bg-ink-200" : "bg-ink-950"
        }`}
      >
        <Icon size={20} color={completed ? "#78746C" : "#fff"} strokeWidth={1.75} />
      </View>

      <View className="flex-1">
        <Text
          style={{ fontFamily: "Inter_500Medium" }}
          className="text-xs uppercase tracking-[1.5px] text-ink-400"
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "Fraunces_600SemiBold",
            textDecorationLine: completed ? "line-through" : "none",
          }}
          className={`mt-1 text-lg ${completed ? "text-ink-400" : "text-ink-950"}`}
        >
          {mission.title}
        </Text>
        <Text
          style={{ fontFamily: "Inter_400Regular" }}
          className={`mt-1 text-sm leading-relaxed ${completed ? "text-ink-400" : "text-ink-500"}`}
        >
          {mission.description}
        </Text>
      </View>

      <Pressable
        onPress={onToggle}
        className={`h-7 w-7 items-center justify-center self-start rounded-full border ${
          completed ? "border-ink-950 bg-ink-950" : "border-ink-300 bg-white"
        }`}
      >
        {completed && <Check size={15} color="#fff" />}
      </Pressable>
    </View>
  );
}
