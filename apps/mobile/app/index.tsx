import { View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-expo";

export default function Welcome() {
  return (
    <View className="flex-1 items-center justify-center bg-ink-950 px-8">
      <StatusBar style="light" />

      <SignedIn>
        <AccountBadge />
      </SignedIn>

      <View className="rounded-full border border-white/15 px-4 py-1.5">
        <Text className="text-xs font-medium uppercase tracking-[2px] text-ink-300">
          Your AI self-improvement coach
        </Text>
      </View>

      <Text
        style={{ fontFamily: "Fraunces_600SemiBold" }}
        className="mt-8 text-center text-4xl leading-tight text-white"
      >
        Become the most{"\n"}confident version{"\n"}of yourself.
      </Text>

      <Text
        style={{ fontFamily: "Inter_400Regular" }}
        className="mt-5 text-center text-base leading-relaxed text-ink-300"
      >
        One roadmap across fitness, nutrition, skincare, style, and
        discipline — coached by AI that remembers who you are.
      </Text>

      <SignedIn>
        <Link href="/dashboard" asChild>
          <Pressable className="mt-10 h-14 w-full items-center justify-center rounded-full bg-white active:opacity-80">
            <Text
              style={{ fontFamily: "Inter_500Medium" }}
              className="text-base text-ink-950"
            >
              Go to your dashboard
            </Text>
          </Pressable>
        </Link>
      </SignedIn>

      <SignedOut>
        <Link href="/onboarding" asChild>
          <Pressable className="mt-10 h-14 w-full items-center justify-center rounded-full bg-white active:opacity-80">
            <Text
              style={{ fontFamily: "Inter_500Medium" }}
              className="text-base text-ink-950"
            >
              Start your roadmap
            </Text>
          </Pressable>
        </Link>
      </SignedOut>

      <SignedOut>
        <Link href="/sign-in" asChild>
          <Pressable className="mt-4">
            <Text
              style={{ fontFamily: "Inter_400Regular" }}
              className="text-sm text-ink-400"
            >
              Already have an account? <Text className="text-white">Sign in</Text>
            </Text>
          </Pressable>
        </Link>
      </SignedOut>
    </View>
  );
}

function AccountBadge() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <View className="mb-6 flex-row items-center gap-3 rounded-full border border-white/15 px-4 py-2">
      <Text style={{ fontFamily: "Inter_400Regular" }} className="text-xs text-ink-300">
        {user?.primaryEmailAddress?.emailAddress}
      </Text>
      <Pressable onPress={() => signOut()}>
        <Text style={{ fontFamily: "Inter_500Medium" }} className="text-xs text-white">
          Sign out
        </Text>
      </Pressable>
    </View>
  );
}
