import { ScrollView, View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Target, ListChecks, ChevronRight } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { StatCards } from "@/components/dashboard/StatCards";
import { Timeline } from "@/components/dashboard/Timeline";
import { BeforeAfterGallery } from "@/components/dashboard/BeforeAfterGallery";

export default function DashboardScreen() {
  const { user } = useUser();
  const firstName = user?.firstName;
  const { data, isLoading } = trpc.dashboard.get.useQuery();

  return (
    <ScrollView className="flex-1 bg-ink-50" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <StatusBar style="dark" />
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
        {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-2 text-ink-500">
        Here&apos;s where your roadmap stands today.
      </Text>

      <Link href="/missions" asChild>
        <Pressable className="mt-6 flex-row items-center gap-3 rounded-lg bg-ink-950 p-5 active:opacity-90">
          <View className="h-10 w-10 items-center justify-center rounded-md bg-white/15">
            <Target size={18} color="#fff" strokeWidth={1.75} />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: "Inter_500Medium" }} className="text-base text-white">
              Today&apos;s Missions
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-0.5 text-sm text-ink-400">
              7 items — your workout, nutrition, skincare, and more
            </Text>
          </View>
          <ChevronRight size={18} color="#A8A29A" />
        </Pressable>
      </Link>

      <Link href="/habits" asChild>
        <Pressable className="mt-3 flex-row items-center gap-3 rounded-lg border border-ink-200 bg-white p-5 active:opacity-80">
          <View className="h-10 w-10 items-center justify-center rounded-md bg-ink-100">
            <ListChecks size={18} color="#0A0908" strokeWidth={1.75} />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: "Inter_500Medium" }} className="text-base text-ink-950">
              Your Habits
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-0.5 text-sm text-ink-500">
              Keep your streak alive
            </Text>
          </View>
          <ChevronRight size={18} color="#A8A29A" />
        </Pressable>
      </Link>

      {isLoading || !data ? (
        <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-8 text-ink-500">
          Loading your roadmap…
        </Text>
      ) : data.needsOnboarding ? (
        <View className="mt-6 rounded-lg border border-ink-200 bg-white p-6">
          <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
            Let&apos;s build your roadmap
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-2 text-ink-500">
            Complete your onboarding to get your personalized dashboard.
          </Text>
          <Link href="/onboarding" asChild>
            <Pressable className="mt-5 h-11 items-center justify-center rounded-full bg-ink-950 px-6 active:opacity-90">
              <Text style={{ fontFamily: "Inter_500Medium" }} className="text-sm text-white">
                Start onboarding
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <View className="mt-6">
            <StatCards
              streak={data.streak}
              confidence={data.confidence}
              confidenceBaseline={data.confidenceBaseline}
              consistencyPercent={data.consistencyPercent}
            />
          </View>

          <View className="mt-6">
            <Timeline items={data.timeline} />
          </View>

          <View className="mt-6">
            <BeforeAfterGallery photos={data.photos} />
          </View>
        </>
      )}
    </ScrollView>
  );
}
