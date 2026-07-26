import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { OnboardingSync } from "@/components/app/OnboardingSync";

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <View className="flex-1 bg-white" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <>
      <OnboardingSync />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
