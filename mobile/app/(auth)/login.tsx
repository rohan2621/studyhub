import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform
} from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight } from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { FloatingInput } from "../../components/ui/FloatingInput";
import { GradientButton } from "../../components/ui/GradientButton";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";
import { BackgroundArt } from "../../components/ui/BackgroundArt";

export default function LoginScreen() {
  const { colors, isDark } = useThemeStore();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const mutation = useMutation({
    mutationFn: async () =>
      (await api.post("/auth/login", { email: email.trim().toLowerCase(), password })).data,
    onSuccess: async (data) => {
      await login(data.accessToken, data.user, data.refreshToken);

      Toast.show({
        type: "success",
        text1: `Welcome back, ${data.user.name}!`,
      });

      if (data.user.role === 3 || data.user.role === "Admin") {
        router.replace("/(admin)");
      } else {
        router.replace("/(tabs)/home");
      }
    },
    onError: (e: any) => {
      const status = e.response?.status;
      const msg = e.response?.data?.error;
      if (status === 423)
        Toast.show({ type: "error", text1: "Account Locked", text2: msg });
      else
        Toast.show({ type: "error", text1: "Login Failed", text2: msg || "Invalid credentials" });
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BackgroundArt />

      {/* Theme toggle */}
      <View style={{ position: "absolute", top: 56, right: 20, zIndex: 10 }}>
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 80,
            paddingBottom: 36,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <StudyHubBrand size="lg" showTagline />
          </View>

          {/* Login card */}
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 0,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {/* Welcome text */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text, letterSpacing: -0.5 }}>
                Welcome back!
              </Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6 }}>
                Sign in to continue your learning journey
              </Text>
            </View>

            {/* Inputs */}
            <FloatingInput
              label="Email"
              icon={<Mail size={18} color={colors.muted} />}
              value={email}
              onChangeText={setEmail}
              placeholder="rohan@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <FloatingInput
              label="Password"
              icon={<Lock size={18} color={colors.muted} />}
              rightIcon={
                showPw
                  ? <EyeOff size={18} color={colors.muted} />
                  : <Eye size={18} color={colors.muted} />
              }
              onRightIconPress={() => setShowPw((v) => !v)}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              secureTextEntry={!showPw}
            />

            {/* Remember + Forgot */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
                marginBottom: 24,
              }}
            >
              <TouchableOpacity
                onPress={() => setRemember((r) => !r)}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 0,
                    backgroundColor: remember ? colors.primary : "transparent",
                    borderWidth: remember ? 0 : 1.5,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {remember && <Check size={13} color="#fff" strokeWidth={3.5} />}
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <GradientButton
              title="Sign In"
              icon={<ArrowRight size={18} color="#fff" />}
              loading={mutation.isPending}
              onPress={() => mutation.mutate()}
              disabled={!email || !password}
            />
          </View>

          {/* Sign up */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 28 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 14 }}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
