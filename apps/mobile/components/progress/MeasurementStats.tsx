import { View, Text } from "react-native";
import type { Measurement } from "@selfforge/types";

export function MeasurementStats({ measurements }: { measurements: Measurement[] }) {
  return (
    <View className="gap-4">
      {measurements.map((m) => {
        const delta = m.current - m.start;
        const isGood = m.goodDirection === "down" ? delta < 0 : delta > 0;
        const sign = delta > 0 ? "+" : "";

        return (
          <View key={m.label} className="rounded-lg border border-ink-200 bg-white p-5">
            <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-500">
              {m.label}
            </Text>
            <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="mt-1 text-2xl text-ink-950">
              {m.current} {m.unit}
            </Text>
            <Text
              style={{ fontFamily: "Inter_400Regular" }}
              className={`mt-1 text-sm ${isGood ? "text-success" : "text-ink-400"}`}
            >
              {sign}
              {delta.toFixed(1)} {m.unit} from {m.start} {m.unit}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
