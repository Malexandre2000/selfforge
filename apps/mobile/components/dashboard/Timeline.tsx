import { View, Text } from "react-native";
import { Check, Lock } from "lucide-react-native";

type TimelineItem = {
  label: string;
  date: string;
  status: "done" | "today" | "upcoming";
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <View className="rounded-lg border border-ink-200 bg-white p-6">
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
        Your journey
      </Text>
      <View className="mt-5">
        {items.map((item, i) => (
          <View key={item.label} className="flex-row gap-4">
            <View className="items-center">
              <View
                className={`h-7 w-7 items-center justify-center rounded-full ${
                  item.status === "done"
                    ? "bg-ink-950"
                    : item.status === "today"
                      ? "border-2 border-ink-950 bg-white"
                      : "bg-ink-100"
                }`}
              >
                {item.status === "done" && <Check size={14} color="#fff" />}
                {item.status === "upcoming" && <Lock size={12} color="#A8A29A" />}
              </View>
              {i < items.length - 1 && (
                <View
                  className={`w-px flex-1 ${item.status === "done" ? "bg-ink-950" : "bg-ink-200"}`}
                />
              )}
            </View>
            <View className="pb-6" style={{ opacity: item.status === "upcoming" ? 0.5 : 1 }}>
              <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-400">
                {item.date}
              </Text>
              <Text
                style={{
                  fontFamily: item.status === "today" ? "Inter_600SemiBold" : "Inter_400Regular",
                }}
                className="mt-0.5 text-ink-800"
              >
                {item.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
