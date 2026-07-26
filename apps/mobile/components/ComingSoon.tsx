import { View, Text } from "react-native";

export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <View className="rounded-full border border-ink-200 px-4 py-1.5">
        <Text
          style={{ fontFamily: "Inter_500Medium" }}
          className="text-xs uppercase tracking-[2px] text-ink-500"
        >
          Coming up next
        </Text>
      </View>
      <Text
        style={{ fontFamily: "Fraunces_600SemiBold" }}
        className="mt-6 text-center text-3xl text-ink-950"
      >
        {title}
      </Text>
      <Text
        style={{ fontFamily: "Inter_400Regular" }}
        className="mt-4 text-center text-base text-ink-500"
      >
        {blurb}
      </Text>
    </View>
  );
}
