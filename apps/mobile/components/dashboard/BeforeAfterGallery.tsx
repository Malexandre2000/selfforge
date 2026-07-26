import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";

export function BeforeAfterGallery() {
  return (
    <View className="items-center rounded-lg border border-dashed border-ink-300 bg-white p-8">
      <View className="h-11 w-11 items-center justify-center rounded-md bg-ink-100">
        <Camera size={20} color="#78746C" strokeWidth={1.75} />
      </View>
      <Text
        style={{ fontFamily: "Fraunces_600SemiBold" }}
        className="mt-4 text-center text-xl text-ink-950"
      >
        Your before/after gallery is empty
      </Text>
      <Text
        style={{ fontFamily: "Inter_400Regular" }}
        className="mt-2 text-center text-sm text-ink-500"
      >
        Add your first progress photo and watch the change build up over
        time, side by side.
      </Text>
      <Pressable
        onPress={() => router.push("/progress")}
        className="mt-5 h-11 items-center justify-center rounded-full bg-ink-950 px-5 active:opacity-80"
      >
        <Text style={{ fontFamily: "Inter_500Medium" }} className="text-sm text-white">
          Add your first photo
        </Text>
      </Pressable>
    </View>
  );
}
