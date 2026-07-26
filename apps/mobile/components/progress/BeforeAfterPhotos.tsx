import { useState } from "react";
import { View, Text, Pressable, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";

function PhotoSlot({
  label,
  uri,
  onPick,
  onRemove,
}: {
  label: string;
  uri: string | null;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <View className="flex-1">
      <Text
        style={{ fontFamily: "Inter_500Medium" }}
        className="mb-2 text-xs uppercase tracking-[1.5px] text-ink-400"
      >
        {label}
      </Text>
      <View
        className="overflow-hidden rounded-lg border border-dashed border-ink-300 bg-ink-50"
        style={{ aspectRatio: 3 / 4 }}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            <Pressable
              onPress={onRemove}
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-black/60"
            >
              <X size={14} color="#fff" />
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onPick}
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
  );
}

export function BeforeAfterPhotos() {
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);

  async function pick(setter: (uri: string) => void) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Enable photo library access to add a progress photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  }

  return (
    <View className="rounded-lg border border-ink-200 bg-white p-6">
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
        Before / After
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-500">
        Photos stay on this device only until account photo sync is built — nothing is
        uploaded yet.
      </Text>

      <View className="mt-5 flex-row gap-4">
        <PhotoSlot label="Before" uri={before} onPick={() => pick(setBefore)} onRemove={() => setBefore(null)} />
        <PhotoSlot label="After" uri={after} onPick={() => pick(setAfter)} onRemove={() => setAfter(null)} />
      </View>
    </View>
  );
}
