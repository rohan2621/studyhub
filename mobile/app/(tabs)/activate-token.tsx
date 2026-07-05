import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Key, CheckCircle2, Lock, AlertTriangle, RefreshCw } from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { useAuthStore } from "../../stores/authStore";
import { PLANS } from "../../constants/Api";

export default function ActivateTokenScreen() {
  const { colors } = useThemeStore();
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);

  // Check if they already have a pending/active token
  const { data: tokenStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["tokenStatus"],
    queryFn: async () => {
      // Direct call bypassing the 402 interceptor re-redirect loop
      try {
        return (await api.get("/tokens/me")).data;
      } catch (e: any) {
        if (e.response?.status === 402) return null;
        throw e;
      }
    },
    retry: false,
  });

  // If they somehow already have an active token, send them home
  useEffect(() => {
    if (tokenStatus?.hasActiveToken) {
      router.replace("/(tabs)/home");
    }
  }, [tokenStatus]);

  const mutation = useMutation({
    mutationFn: async () => (await api.post("/tokens/activate", { code })).data,
    onSuccess: (data) => {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ["tokenStatus"] });
    },
    onError: (e: any) => {
      const err = e.response?.data?.error ?? "Invalid or already used token";
      const msg = e.response?.data?.message ?? err;
      if (err === "DEVICE_MISMATCH") {
        router.replace("/device-mismatch" as any);
      } else {
        Toast.show({ type: "error", text1: "Activation Failed", text2: msg });
      }
    },
  });

  const handleGoHome = () => router.replace("/(tabs)/home");

  if (statusLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ flex: 1, padding: 24, paddingTop: 70 }}>

          {success ? (
            /* ── Success State ── */
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
              <View style={{ width: 88, height: 88, borderRadius: 0, backgroundColor: colors.success + "20", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.success }}>
                <CheckCircle2 size={44} color={colors.success} />
              </View>
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: "900", textAlign: "center" }}>
                Token Activated! 🎉
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 15, textAlign: "center", lineHeight: 22 }}>
                Your access is now unlocked on this device. You're all set!
              </Text>
              <TouchableOpacity
                onPress={handleGoHome}
                style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 18, paddingHorizontal: 48, marginTop: 16, }}
              >
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 17 }}>Enter StudyHub</Text>
              </TouchableOpacity>
            </View>

          ) : (
            /* ── Token Wall ── */
            <View style={{ flex: 1, justifyContent: "center" }}>

              {/* Icon + heading */}
              <View style={{ alignItems: "center", marginBottom: 36 }}>
                <View style={{ width: 80, height: 80, borderRadius: 0, backgroundColor: colors.primary + "18", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.primary + "50", marginBottom: 18 }}>
                  <Lock size={38} color={colors.primary} />
                </View>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 8 }}>
                  Access Required
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 15, textAlign: "center", lineHeight: 22 }}>
                  Hello, <Text style={{ color: colors.text, fontWeight: "700" }}>{user?.name}</Text>!{"\n"}
                  To use StudyHub you need an active token.{"\n"}
                  One token works on <Text style={{ color: colors.primary, fontWeight: "700" }}>one device only</Text>.
                </Text>
              </View>

              {/* Pending token notice */}
              {tokenStatus?.hasPendingToken && (
                <View style={{ backgroundColor: colors.warning + "15", borderRadius: 0, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.warning + "40", flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <AlertTriangle size={20} color={colors.warning} style={{ marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.warning, fontWeight: "800", fontSize: 14 }}>Pending Token Found</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
                      Code: <Text style={{ color: colors.text, fontWeight: "700", letterSpacing: 2 }}>{tokenStatus.pendingCode}</Text>
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>Tap Activate below to use it, or enter a different code.</Text>
                  </View>
                </View>
              )}

              {/* Token code input card */}
              <View style={{ backgroundColor: colors.card, borderRadius: 0, padding: 24, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10 }}>TOKEN CODE</Text>
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.toUpperCase())}
                  placeholder={tokenStatus?.pendingCode ?? "STDY-XXXX-XXXX"}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={{
                    backgroundColor: colors.inputBg,
                    borderRadius: 0, padding: 18,
                    color: colors.text, fontSize: 20, fontWeight: "700",
                    borderWidth: 1.5,
                    borderColor: code ? colors.primary : colors.border,
                    textAlign: "center", letterSpacing: 3, marginBottom: 20,
                  }}
                />
                <TouchableOpacity
                  onPress={() => mutation.mutate()}
                  disabled={(!code.trim() && !tokenStatus?.hasPendingToken) || mutation.isPending}
                  style={{
                    backgroundColor: colors.primary, borderRadius: 0, padding: 18,
                    alignItems: "center",
                    opacity: (!code.trim() && !tokenStatus?.hasPendingToken) ? 0.5 : 1,
                    flexDirection: "row", justifyContent: "center", gap: 10,
                    }}
                >
                  {mutation.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Key size={18} color="#fff" />
                        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 17 }}>
                          {tokenStatus?.hasPendingToken && !code.trim() ? "Activate Pending Token" : "Activate Token"}
                        </Text>
                      </>
                  }
                </TouchableOpacity>
              </View>

              {/* What is a token */}
              <View style={{ backgroundColor: colors.primary + "0c", borderRadius: 0, padding: 16, borderWidth: 1, borderColor: colors.primary + "20", marginBottom: 20 }}>
                <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 13, marginBottom: 6 }}>How it works</Text>
                {[
                  "📲 One token = one device (your phone)",
                  "🔒 Content is locked per school",
                  "✅ Token is tied to your account",
                  "📞 Contact admin on WhatsApp to get one",
                ].map((item) => (
                  <Text key={item} style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4, lineHeight: 18 }}>{item}</Text>
                ))}
              </View>

              {/* Sign out link */}
              <TouchableOpacity
                onPress={async () => {
                  try { await api.post("/auth/logout"); } catch {}
                  await logout();
                  router.replace("/(auth)/login");
                }}
                style={{ alignItems: "center", padding: 12 }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                  Wrong account? <Text style={{ color: colors.danger, fontWeight: "700" }}>Sign out</Text>
                </Text>
              </TouchableOpacity>

            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
