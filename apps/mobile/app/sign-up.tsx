import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? // @ts-expect-error Clerk error shape
            err.errors?.[0]?.message
          : "Something went wrong. Please try again.";
      setError(message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        setError("Verification incomplete. Double-check the code and try again.");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? // @ts-expect-error Clerk error shape
            err.errors?.[0]?.message
          : "Invalid code. Please try again.";
      setError(message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-ink-50 px-8">
      <Text
        style={{ fontFamily: "Fraunces_600SemiBold" }}
        className="text-3xl text-ink-950"
      >
        {pendingVerification ? "Verify your email" : "Create your account"}
      </Text>

      {!pendingVerification ? (
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
              {loading ? "Please wait..." : "Continue"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="mt-8 w-full gap-4">
          <Text
            style={{ fontFamily: "Inter_400Regular" }}
            className="text-center text-sm text-ink-500"
          >
            Enter the code sent to {email}
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="6-digit code"
            keyboardType="number-pad"
            style={{ fontFamily: "Inter_400Regular" }}
            className="h-14 rounded-md border border-ink-200 bg-white px-4 text-center text-lg tracking-widest text-ink-950"
          />
          {error && (
            <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-error">
              {error}
            </Text>
          )}
          <Pressable
            onPress={onVerify}
            disabled={loading}
            className="mt-2 h-14 items-center justify-center rounded-full bg-ink-950"
          >
            <Text style={{ fontFamily: "Inter_500Medium" }} className="text-base text-white">
              {loading ? "Verifying..." : "Verify"}
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={() => router.push("/sign-in")} className="mt-6">
        <Text style={{ fontFamily: "Inter_400Regular" }} className="text-sm text-ink-500">
          Already have an account? <Text className="text-ink-950">Sign in</Text>
        </Text>
      </Pressable>
    </View>
  );
}
