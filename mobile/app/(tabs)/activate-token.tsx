import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, Modal, ScrollView
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

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pendingActivationCode, setPendingActivationCode] = useState<string | null>(null);

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

  const validateMutation = useMutation({
    mutationFn: async (codeToValidate: string) => (await api.post("/tokens/validate", { code: codeToValidate })).data,
    onSuccess: (data, codeToValidate) => {
      setPendingActivationCode(codeToValidate);
      setAgreedToTerms(false);
      setShowTermsModal(true);
    },
    onError: (e: any) => {
      const err = e.response?.data?.error ?? "Invalid or already used token";
      Toast.show({ type: "error", text1: "Validation Failed", text2: err });
    }
  });

  const activateMutation = useMutation({
    mutationFn: async () => (await api.post("/tokens/activate", { code: pendingActivationCode })).data,
    onSuccess: (data) => {
      setSuccess(true);
      setShowTermsModal(false);
      qc.invalidateQueries({ queryKey: ["tokenStatus"] });
    },
    onError: (e: any) => {
      const err = e.response?.data?.error ?? "Invalid or already used token";
      const msg = e.response?.data?.message ?? err;
      if (err === "DEVICE_MISMATCH") {
        router.replace("/device-mismatch" as any);
      } else {
        Toast.show({ type: "error", text1: "Activation Failed", text2: msg });
        setShowTermsModal(false);
      }
    },
  });

  const handlePressActivate = () => {
    const c = code.trim() ? code.trim() : tokenStatus?.pendingCode;
    if (c) validateMutation.mutate(c);
  };

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
                  onPress={handlePressActivate}
                  disabled={(!code.trim() && !tokenStatus?.hasPendingToken) || validateMutation.isPending}
                  style={{
                    backgroundColor: colors.primary, borderRadius: 0, padding: 18,
                    alignItems: "center",
                    opacity: (!code.trim() && !tokenStatus?.hasPendingToken) ? 0.5 : 1,
                    flexDirection: "row", justifyContent: "center", gap: 10,
                    }}
                >
                  {validateMutation.isPending
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

      <Modal visible={showTermsModal} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 0, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text, marginBottom: 16 }}>Terms & Conditions</Text>
            
            <View style={{ height: 250, backgroundColor: colors.background, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <ScrollView>
                <Text style={{ fontWeight: "800", color: colors.text, marginBottom: 8, fontSize: 15 }}>StudyHub Access Token Terms</Text>
                
                <Text style={{ color: colors.text, marginBottom: 8, lineHeight: 22, fontSize: 14 }}>
                  <Text style={{ fontWeight: "700" }}>• One Device Policy:</Text> Your token will be permanently linked to this current device upon activation. It cannot be used simultaneously on other phones, tablets, or computers.
                </Text>
                <Text style={{ color: colors.text, marginBottom: 8, lineHeight: 22, fontSize: 14 }}>
                  <Text style={{ fontWeight: "700" }}>• Non-Transferable:</Text> Tokens are strictly tied to your account and cannot be sold or transferred.
                </Text>
                <Text style={{ color: colors.text, marginBottom: 8, lineHeight: 22, fontSize: 14 }}>
                  <Text style={{ fontWeight: "700" }}>• Usage:</Text> This token grants access to StudyHub materials for the specified duration. The content is for personal use only.
                </Text>
                <Text style={{ color: colors.text, marginBottom: 8, lineHeight: 22, fontSize: 14 }}>
                  <Text style={{ fontWeight: "700" }}>• Termination:</Text> Violation of these rules may result in immediate suspension of your account without a refund.
                </Text>
                <Text style={{ color: colors.text, marginBottom: 8, lineHeight: 22, fontSize: 14 }}>
                  <Text style={{ fontWeight: "700" }}>• No Refunds:</Text> Once paid, tokens are non-refundable under any circumstances.
                </Text>
                <Text style={{ color: colors.text, marginBottom: 8, lineHeight: 22, fontSize: 14 }}>
                  <Text style={{ fontWeight: "700" }}>• Academic Outcomes:</Text> We are not responsible for any academic drawbacks or poor performance. This app is designed solely as a reference tool for those who missed classes.
                </Text>
                <Text style={{ color: colors.text, marginBottom: 8, lineHeight: 22, fontSize: 14 }}>
                  <Text style={{ fontWeight: "700" }}>• Liability:</Text> We are not responsible for any illegal activities or misuse of the platform.
                </Text>

                <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 13, lineHeight: 20 }}>
                  By checking the box below, you confirm that you have read and understood these terms.
                </Text>
              </ScrollView>
            </View>

            <TouchableOpacity 
              onPress={() => setAgreedToTerms(!agreedToTerms)} 
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 24 }}
            >
              <View style={{ 
                width: 22, height: 22, borderWidth: 2, borderColor: agreedToTerms ? colors.primary : colors.muted,
                backgroundColor: agreedToTerms ? colors.primary : "transparent",
                justifyContent: "center", alignItems: "center", marginTop: 2
              }}>
                {agreedToTerms && <CheckCircle2 size={16} color="#fff" />}
              </View>
              <Text style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: "600", lineHeight: 20 }}>
                I agree to the StudyHub Terms and Conditions and understand the one-device limit.
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setShowTermsModal(false)}
                style={{ flex: 1, padding: 16, borderWidth: 2, borderColor: colors.border, alignItems: "center" }}
              >
                <Text style={{ color: colors.text, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => activateMutation.mutate()}
                disabled={!agreedToTerms || activateMutation.isPending}
                style={{ flex: 1, padding: 16, backgroundColor: colors.primary, alignItems: "center", opacity: (!agreedToTerms || activateMutation.isPending) ? 0.5 : 1 }}
              >
                {activateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Confirm</Text>}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}
