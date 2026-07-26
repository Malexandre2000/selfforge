import { ScrollView, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { currentStreak } from "@selfforge/types";
import { trpc } from "@/lib/trpc";
import { HabitCard } from "@/components/habits/HabitCard";

export default function HabitsScreen() {
  const utils = trpc.useUtils();
  const { data: habits, isLoading } = trpc.habits.list.useQuery();
  const toggle = trpc.habits.toggleToday.useMutation({
    onSuccess: () => utils.habits.list.invalidate(),
  });

  if (isLoading || !habits) {
    return (
      <ScrollView className="flex-1 bg-ink-50" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <StatusBar style="dark" />
        <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
          Your Habits
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-4 text-ink-500">
          Loading your habits…
        </Text>
      </ScrollView>
    );
  }

  const doneToday = habits.filter((h) => h.history[h.history.length - 1]).length;
  const bestStreak = habits.length ? Math.max(...habits.map((h) => currentStreak(h.history))) : 0;

  return (
    <ScrollView className="flex-1 bg-ink-50" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <StatusBar style="dark" />
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
        Your Habits
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-2 text-ink-500">
        {habits.length} active habits · {doneToday} of {habits.length} done today · best streak{" "}
        {bestStreak} days
      </Text>

      <View className="mt-8 gap-4">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            title={habit.title}
            history={habit.history}
            onToggleToday={() => toggle.mutate({ habitId: habit.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
}
