import { View, Text } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { Flame, TrendingUp } from "lucide-react-native";

function ConsistencyRing({ percent }: { percent: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E7E5E2" strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#0A0908"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function Sparkline() {
  return (
    <Svg width="100%" height={36} viewBox="0 0 160 40">
      <Polyline
        points="0,30 20,28 40,24 60,26 80,18 100,20 120,10 140,12 160,4"
        fill="none"
        stroke="#0A0908"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StatCards({
  streak,
  confidence,
  confidenceBaseline,
  consistencyPercent,
}: {
  streak: number;
  confidence: number;
  confidenceBaseline: number;
  consistencyPercent: number;
}) {
  return (
    <View className="gap-4">
      <View className="justify-between rounded-lg bg-ink-950 p-6" style={{ minHeight: 140 }}>
        <Flame size={20} color="#fff" strokeWidth={1.75} />
        <View className="mt-6">
          <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-4xl text-white">
            {streak}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-400">
            day streak
          </Text>
        </View>
      </View>

      <View className="rounded-lg border border-ink-200 bg-white p-6">
        <View className="flex-row items-center justify-between">
          <TrendingUp size={20} color="#0A0908" strokeWidth={1.75} />
          <Text style={{ fontFamily: "Inter_400Regular" }} className="text-xs text-success">
            +{(confidence - confidenceBaseline).toFixed(1)} since you started
          </Text>
        </View>
        <View className="mt-5">
          <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-4xl text-ink-950">
            {confidence.toFixed(1)}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-500">
            confidence score
          </Text>
          <View className="mt-3">
            <Sparkline />
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-4 rounded-lg border border-ink-200 bg-white p-6">
        <ConsistencyRing percent={consistencyPercent} />
        <View>
          <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-2xl text-ink-950">
            {consistencyPercent}%
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-500">
            consistency, last 30 days
          </Text>
        </View>
      </View>
    </View>
  );
}
