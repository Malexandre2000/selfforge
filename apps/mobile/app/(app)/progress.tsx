import { ScrollView, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { trpc } from "@/lib/trpc";
import { WeightChart } from "@/components/progress/WeightChart";
import { MeasurementStats } from "@/components/progress/MeasurementStats";
import { BeforeAfterPhotos } from "@/components/progress/BeforeAfterPhotos";
import { LogEntryForm } from "@/components/progress/LogEntryForm";

export default function ProgressScreen() {
  const { data, isLoading } = trpc.progress.get.useQuery();

  return (
    <ScrollView className="flex-1 bg-ink-50" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <StatusBar style="dark" />
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
        Progress Tracker
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-2 text-ink-500">
        Your measurements and photos, all in one place.
      </Text>

      <View className="mt-8">
        <LogEntryForm />
      </View>

      <View className="mt-6">
        {isLoading ? (
          <View className="rounded-lg border border-ink-200 bg-white p-6">
            <Text style={{ fontFamily: "Inter_400Regular" }} className="text-ink-500">
              Loading your history…
            </Text>
          </View>
        ) : data && data.weightHistory.length >= 2 ? (
          <WeightChart history={data.weightHistory} />
        ) : data && data.weightHistory.length === 1 ? (
          <View className="rounded-lg border border-ink-200 bg-white p-6">
            <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
              Weight
            </Text>
            <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="mt-2 text-3xl text-ink-950">
              {data.weightHistory[0].weight} kg
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-500">
              Log another check-in to start seeing your trend.
            </Text>
          </View>
        ) : (
          <View className="rounded-lg border border-ink-200 bg-white p-6">
            <Text style={{ fontFamily: "Inter_400Regular" }} className="text-ink-500">
              Log your first check-in above to start tracking your weight.
            </Text>
          </View>
        )}
      </View>

      <View className="mt-6">
        {data && data.measurements.length > 0 ? (
          <MeasurementStats measurements={data.measurements} />
        ) : !isLoading ? (
          <View className="rounded-lg border border-ink-200 bg-white p-6">
            <Text style={{ fontFamily: "Inter_400Regular" }} className="text-ink-500">
              Add a waist, chest, or arm measurement above to start tracking.
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-6">
        <BeforeAfterPhotos photos={data?.photos ?? { before: null, after: null }} />
      </View>
    </ScrollView>
  );
}
