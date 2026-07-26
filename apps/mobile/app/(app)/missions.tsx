import { ScrollView, View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { missionCategoryLabels } from "@selfforge/types";
import { trpc } from "@/lib/trpc";
import { MissionCard } from "@/components/missions/MissionCard";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function MissionsScreen() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.missions.getToday.useQuery();
  const toggle = trpc.missions.toggle.useMutation({
    onSuccess: () => utils.missions.getToday.invalidate(),
  });

  if (isLoading || !data) {
    return (
      <ScrollView className="flex-1 bg-ink-50" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <StatusBar style="dark" />
        <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
          Today&apos;s Missions
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-4 text-ink-500">
          Building your personalized plan…
        </Text>
      </ScrollView>
    );
  }

  if (data.needsOnboarding) {
    return (
      <ScrollView className="flex-1 bg-ink-50" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <StatusBar style="dark" />
        <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
          Today&apos;s Missions
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-4 text-ink-500">
          Complete your onboarding to get your personalized daily plan.
        </Text>
        <Link href="/onboarding" asChild>
          <Pressable className="mt-6 h-12 items-center justify-center rounded-full bg-ink-950 px-7 active:opacity-90">
            <Text style={{ fontFamily: "Inter_500Medium" }} className="text-base text-white">
              Start onboarding
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    );
  }

  const { missions, completions } = data;
  const doneCount = missions.filter((m) => completions[m.category]).length;
  const total = missions.length;
  const allDone = total > 0 && doneCount === total;

  return (
    <ScrollView className="flex-1 bg-ink-50" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <StatusBar style="dark" />
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
        Today&apos;s Missions
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-2 text-ink-500">
        {today}
      </Text>

      <View className="mt-6 flex-row items-center gap-3">
        <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
          <View
            className="h-full rounded-full bg-ink-950"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </View>
        <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-500">
          {doneCount} of {total}
        </Text>
      </View>

      {allDone && (
        <View className="mt-6 rounded-lg bg-ink-950 px-5 py-4">
          <Text
            style={{ fontFamily: "Fraunces_600SemiBold" }}
            className="text-center text-lg text-white"
          >
            All done for today. That&apos;s the whole game.
          </Text>
        </View>
      )}

      <View className="mt-8 gap-4">
        {missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            label={missionCategoryLabels[mission.category]}
            completed={!!completions[mission.category]}
            onToggle={() => toggle.mutate({ category: mission.category })}
          />
        ))}
      </View>
    </ScrollView>
  );
}
