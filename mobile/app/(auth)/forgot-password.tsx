import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { ArrowLeft, Mail, ArrowRight, MailCheck } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { FloatingInput } from "../../components/ui/FloatingInput";
import { GradientButton } from "../../components/ui/GradientButton";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";
import { BackgroundArt } from "../../components/ui/BackgroundArt";

export default function ForgotPasswordScreen() {
  const { colors } = useThemeStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => (await api.post("/auth/forgot-password", { email })).data,
    onSuccess: () => setSent(true),
    onError: () => setSent(true),
  });

  return (
    <View
      style={{ flex: 1 }}
      >
      <BackgroundArt />
      <View style={{ position: "absolute", top: 56, right: 20, zIndex: 10 }}>
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 36 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 24 }}
          >
            <ArrowLeft size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}>Back</Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <StudyHubBrand size="md" showTagline={false} />
          </View>

          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Forgot Password?</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              Enter your email and we'll send a reset link
            </Text>
          </View>

          {sent ? (
            <View>
              <View style={{
                backgroundColor: colors.success + "20", borderRadius: 0, padding: 24,
                borderWidth: 1, borderColor: colors.success + "40",
                alignItems: "center", marginBottom: 24,
              }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 0,
                  backgroundColor: colors.success + "30",
                  justifyContent: "center", alignItems: "center", marginBottom: 12,
                }}>
                  <MailCheck size={32} color={colors.success} />
                </View>
                <Text style={{ color: colors.success, fontWeight: "700", fontSize: 16, textAlign: "center" }}>
                  Reset link sent! Check your inbox.
                </Text>
              </View>
              <GradientButton
                title="Back to Login"
                icon={<ArrowRight size={18} color="#fff" />}
                onPress={() => router.replace("/(auth)/login")}
              />
            </View>
          ) : (
            <>
              <FloatingInput
                label="Email Address"
                icon={<Mail size={18} color={colors.textMuted} />}
                value={email}
                onChangeText={setEmail}
                placeholder="you@school.edu"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <GradientButton
                title="Send Reset Link"
                icon={<ArrowRight size={18} color="#fff" />}
                onPress={() => mutation.mutate()}
                loading={mutation.isPending}
                disabled={!email}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
