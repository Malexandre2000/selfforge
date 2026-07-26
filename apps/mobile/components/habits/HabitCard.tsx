import { View, Text, Pressable } from "react-native";
import { Flame, Check } from "lucide-react-native";
import { currentStreak, last7DayLabels } from "@selfforge/types";

const dayLabels = last7DayLabels();

export function HabitCard({
  title,
  history,
  onToggleToday,
}: {
  title: string;
  history: boolean[];
  onToggleToday: () => void;
}) {
  const streak = currentStreak(history);

  return (
    <View className="rounded-lg border border-ink-200 bg-white p-5">
      <View className="flex-row items-center justify-between">
        <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-lg text-ink-950">
          {title}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Flame size={16} color={streak > 0 ? "#0A0908" : "#A8A29A"} strokeWidth={1.75} />
          <Text style={{ fontFamily: "Inter_500Medium" }} className="text-sm text-ink-500">
            {streak}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row justify-between">
        {history.map((done, i) => {
          const isToday = i === history.length - 1;
          return (
            <View key={i} className="items-center gap-1.5">
              <Text style={{ fontFamily: "Inter_400Regular" }} className="text-xs text-ink-400">
                {dayLabels[i]}
              </Text>
              <Pressable
                onPress={isToday ? onToggleToday : undefined}
                className={`h-8 w-8 items-center justify-center rounded-full border ${
                  done ? "border-ink-950 bg-ink-950" : "border-ink-200 bg-white"
                }`}
                style={
                  isToday
                    ? { borderWidth: 2, borderColor: "#0A0908" }
                    : undefined
                }
              >
                {done && <Check size={14} color="#fff" />}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
