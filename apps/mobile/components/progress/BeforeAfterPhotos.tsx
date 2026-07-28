import { useState } from "react";
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@clerk/clerk-expo";
import { Camera, X } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useAuthenticatedPhotoHeaders } from "@/lib/useAuthenticatedPhotoHeaders";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Kind = "before" | "after";

function photoSrc(pathname: string) {
  return `${API_URL}/api/photos/${pathname}`;
}

function PhotoSlot({
  label,
  kind,
  pathname,
  onUploaded,
}: {
  label: string;
  kind: Kind;
  pathname: string | null;
  onUploaded: () => void;
}) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const authHeader = useAuthenticatedPhotoHeaders();

  async function pick() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Enable photo library access to add a progress photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setBusy(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      const type = asset.mimeType ?? "image/jpeg";
      const name = asset.fileName ?? `${kind}.jpg`;
      formData.append("file", { uri: asset.uri, name, type } as unknown as Blob);
      formData.append("kind", kind);

      const res = await fetch(`${API_URL}/api/upload/progress-photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      onUploaded();
    } catch {
      Alert.alert("Upload failed", "Couldn't upload that photo. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/upload/progress-photo?kind=${kind}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text());
      onUploaded();
    } catch {
      Alert.alert("Remove failed", "Couldn't remove that photo. Try again.");
    } finally {
      setBusy(false);
    }
  }

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
        {busy || (pathname && !authHeader) ? (
          <View className="h-full w-full items-center justify-center">
            <ActivityIndicator color="#A8A29A" />
          </View>
        ) : pathname && authHeader ? (
          <>
            <Image
              source={{ uri: photoSrc(pathname), headers: authHeader }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <Pressable
              onPress={remove}
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-black/60"
            >
              <X size={14} color="#fff" />
            </Pressable>
          </>
        ) : (
          <Pressable onPress={pick} className="h-full w-full items-center justify-center gap-2">
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

export function BeforeAfterPhotos({
  photos,
}: {
  photos: { before: string | null; after: string | null };
}) {
  const utils = trpc.useUtils();
  const refresh = () => utils.progress.get.invalidate();

  return (
    <View className="rounded-lg border border-ink-200 bg-white p-6">
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-xl text-ink-950">
        Before / After
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular" }} className="mt-1 text-sm text-ink-500">
        Only visible to you — kept in your private storage.
      </Text>

      <View className="mt-5 flex-row gap-4">
        <PhotoSlot label="Before" kind="before" pathname={photos.before} onUploaded={refresh} />
        <PhotoSlot label="After" kind="after" pathname={photos.after} onUploaded={refresh} />
      </View>
    </View>
  );
}
