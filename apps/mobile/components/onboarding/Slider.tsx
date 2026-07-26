import { View, Text } from "react-native";
import RNSlider from "@react-native-community/slider";

export function Slider({
  value,
  onChange,
  min,
  max,
  minLabel,
  maxLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <View>
      <View className="flex-row items-center gap-4">
        <RNSlider
          style={{ flex: 1, height: 32 }}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#0A0908"
          maximumTrackTintColor="#E7E5E2"
          thumbTintColor="#0A0908"
        />
        <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="w-10 text-center text-2xl text-ink-950">
          {value}
        </Text>
      </View>
      {(minLabel || maxLabel) && (
        <View className="mt-2 flex-row justify-between">
          <Text style={{ fontFamily: "Inter_400Regular" }} className="text-xs text-ink-400">
            {minLabel}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular" }} className="text-xs text-ink-400">
            {maxLabel}
          </Text>
        </View>
      )}
    </View>
  );
}
