import { View, Text, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import { useAuthenticatedPhotoHeaders } from "@/lib/useAuthenticatedPhotoHeaders";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Photos = { before: string | null; after: string | null };

function photoSrc(pathname: string) {
  return `${API_URL}/api/photos/${pathname}`;
}

export function BeforeAfterGallery({ photos }: { photos: Photos }) {
  const authHeader = useAuthenticatedPhotoHeaders();

  if (!photos.before && !photos.after) {
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

  return (
    <View className="rounded-lg border border-ink-200 bg-white p-6">
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
        Before / After
      </Text>
      <View className="mt-4 flex-row gap-4">
        {(["before", "after"] as const).map((kind) => (
          <View key={kind} className="flex-1">
            <Text
              style={{ fontFamily: "Inter_500Medium" }}
              className="mb-2 text-xs uppercase tracking-[1.5px] text-ink-400"
            >
              {kind}
            </Text>
            <View
              className="overflow-hidden rounded-lg border border-ink-200 bg-ink-50"
              style={{ aspectRatio: 3 / 4 }}
            >
              {photos[kind] && authHeader ? (
                <Image
                  source={{ uri: photoSrc(photos[kind]!), headers: authHeader }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Pressable
                  onPress={() => router.push("/progress")}
                  className="h-full w-full items-center justify-center gap-2"
                >
                  <Camera size={22} color="#A8A29A" strokeWidth={1.75} />
                  <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-400">
                    Add photo
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
