import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? // @ts-expect-error Clerk error shape
            err.errors?.[0]?.message
          : "Invalid email or password.";
      setError(message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-ink-50 px-8">
      <Text style={{ fontFamily: "Fraunces_600SemiBold" }} className="text-3xl text-ink-950">
        Welcome back
      </Text>

      <View className="mt-8 w-full gap-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ fontFamily: "Inter_400Regular" }}
          className="h-14 rounded-md border border-ink-200 bg-white px-4 text-base text-ink-950"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={{ fontFamily: "Inter_400Regular" }}
          className="h-14 rounded-md border border-ink-200 bg-white px-4 text-base text-ink-950"
        />
        {error && (
          <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-error">
            {error}
          </Text>
        )}
        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className="mt-2 h-14 items-center justify-center rounded-full bg-ink-950"
        >
          <Text style={{ fontFamily: "Inter_500Medium" }} className="text-base text-white">
            {loading ? "Please wait..." : "Sign in"}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push("/sign-up")} className="mt-6">
        <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-500">
          Don&apos;t have an account? <Text className="text-ink-950">Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
