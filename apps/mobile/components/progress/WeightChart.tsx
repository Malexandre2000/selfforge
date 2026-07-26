import { View, Text } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import type { WeightPoint } from "@selfforge/types";

const WIDTH = 320;
const HEIGHT = 140;
const PADDING = 8;

function buildPath(points: WeightPoint[]) {
  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (WIDTH - PADDING * 2) + PADDING;
      const y = HEIGHT - PADDING - ((p.weight - min) / range) * (HEIGHT - PADDING * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export function WeightChart({ history }: { history: WeightPoint[] }) {
  const start = history[0].weight;
  const current = history[history.length - 1].weight;
  const delta = current - start;
  const TrendIcon = delta <= 0 ? TrendingDown : TrendingUp;
  const linePath = buildPath(history);
  const areaPath = `${linePath} L${WIDTH - PADDING},${HEIGHT} L${PADDING},${HEIGHT} Z`;

  return (
    <View className="rounded-lg border border-ink-200 bg-white p-6">
      <View className="flex-row items-start justify-between">
        <View>
          <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
            Weight
          </Text>
          <View className="mt-1 flex-row items-baseline gap-2">
            <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
              {current} kg
            </Text>
            <View className="flex-row items-center gap-1">
              <TrendIcon size={14} color="#1F7A4D" />
              <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-success">
                {Math.abs(delta).toFixed(1)} kg since you started
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-400">
        Started at {start} kg
      </Text>

      <Svg width="100%" height={140} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ marginTop: 16 }}>
        <Defs>
          <LinearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0A0908" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#0A0908" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#weight-fill)" stroke="none" />
        <Path d={linePath} fill="none" stroke="#0A0908" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>

      <View className="mt-2 flex-row justify-between">
        <Text style={{ fontFamily: "Inter_400Regular" }} className="text-xs text-ink-400">
          {history[0].label}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular" }} className="text-xs text-ink-400">
          {history[history.length - 1].label}
        </Text>
      </View>
    </View>
  );
}
