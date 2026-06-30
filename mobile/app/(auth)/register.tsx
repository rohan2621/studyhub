import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Modal, TextInput, Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import {
  GraduationCap, Lock, User, Mail, School, ChevronRight,
  Eye, EyeOff, ArrowRight, Search, MapPin, MessageCircle
} from "lucide-react-native";
import { api } from "../../lib/api";
import { useThemeStore } from "../../stores/themeStore";
import { FloatingInput } from "../../components/ui/FloatingInput";
import { GradientButton } from "../../components/ui/GradientButton";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";
import { BackgroundArt } from "../../components/ui/BackgroundArt";

function PasswordStrength({ password }: { password: string }) {
  const { colors } = useThemeStore();
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const clrs = ["", colors.danger, colors.warning, colors.accent, colors.success];
  if (!password) return null;
  return (
    <View style={{ marginBottom: 16, marginTop: -8 }}>
      <View style={{ flexDirection: "row", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i <= score ? clrs[score] : colors.border,
            }}
          />
        ))}
      </View>
      <Text style={{ color: clrs[score], fontSize: 12, fontWeight: "700" }}>{labels[score]}</Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { colors } = useThemeStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [grade, setGrade] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const grades = ["1","2","3","4","5","6","7","8","9","10","11","12","A Level"];

  const { data: schools } = useQuery({
    queryKey: ["schools", schoolSearch],
    queryFn: async () => (await api.get(`/schools?query=${schoolSearch}`)).data,
    enabled: schoolSearch.length > 1,
  });

  const mutation = useMutation({
    mutationFn: async () =>
      (await api.post("/auth/signup", { name, email, password, schoolId, grade })).data,
    onSuccess: () => setShowSuccess(true),
    onError: (e: any) =>
      Toast.show({ type: "error", text1: "Signup Failed", text2: e.response?.data?.error }),
  });

  return (
    <LinearGradient
      colors={colors.backgroundGrad}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <BackgroundArt />
      <View style={{ position: "absolute", top: 56, right: 20, zIndex: 10 }}>
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <StudyHubBrand size="md" showTagline />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Create Account</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              Access notes, homework & more
            </Text>
          </View>

          {/* Role locked */}
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: colors.inputBg, borderRadius: 18,
            borderWidth: 1.5, borderColor: colors.border,
            paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16,
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: colors.success + "20",
              justifyContent: "center", alignItems: "center", marginRight: 12,
            }}>
              <GraduationCap size={20} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 2 }}>
                ACCOUNT TYPE
              </Text>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>Student</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Lock size={13} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 13 }}>Fixed</Text>
            </View>
          </View>

          <FloatingInput
            label="Full Name"
            icon={<User size={18} color={colors.textMuted} />}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
          />
          <FloatingInput
            label="Email Address"
            icon={<Mail size={18} color={colors.textMuted} />}
            value={email}
            onChangeText={setEmail}
            placeholder="you@school.edu"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* School picker trigger */}
          <TouchableOpacity
            onPress={() => setShowSchoolPicker(true)}
            style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: colors.inputBg, borderRadius: 18,
              borderWidth: 1.5, borderColor: colors.border,
              paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: colors.primary + "20",
              justifyContent: "center", alignItems: "center", marginRight: 12,
            }}>
              <School size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 2 }}>
                SCHOOL
              </Text>
              <Text style={{ color: schoolId ? colors.text : colors.muted, fontSize: 15, fontWeight: "500" }}>
                {schoolName || "Tap to select your school"}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Grade */}
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 10, marginLeft: 4 }}>
            GRADE
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {grades.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGrade(g)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                    backgroundColor: grade === g ? colors.primary : colors.inputBg,
                    borderWidth: 1.5, borderColor: grade === g ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ color: grade === g ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "700" }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <FloatingInput
            label="Password"
            icon={<Lock size={18} color={colors.textMuted} />}
            value={password}
            onChangeText={setPassword}
            placeholder="Min 8 chars, uppercase, number, symbol"
            secureTextEntry={!showPw}
            rightIcon={showPw ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
            onRightIconPress={() => setShowPw((v) => !v)}
          />
          <PasswordStrength password={password} />

          <GradientButton
            title="Create Account"
            icon={<ArrowRight size={18} color="#fff" />}
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!name || !email || !password || !schoolId || !grade}
          />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 14 }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* School picker modal */}
      <Modal visible={showSchoolPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
            padding: 28, maxHeight: "75%", borderWidth: 1, borderColor: colors.border,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <School size={22} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Select School</Text>
            </View>

            {/* Search bar */}
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: colors.inputBg, borderRadius: 16,
              paddingHorizontal: 14, paddingVertical: 12,
              borderWidth: 1, borderColor: colors.border, marginBottom: 16, gap: 10,
            }}>
              <Search size={18} color={colors.muted} />
              <TextInput
                placeholder="Search school..."
                placeholderTextColor={colors.muted}
                value={schoolSearch}
                onChangeText={setSchoolSearch}
                autoFocus
                style={{ flex: 1, color: colors.text, fontSize: 15 }}
              />
            </View>

            <ScrollView>
              {schools?.map((s: any) => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => {
                    setSchoolId(s.id);
                    setSchoolName(s.name);
                    setShowSchoolPicker(false);
                    setSchoolSearch("");
                  }}
                  style={{
                    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
                    flexDirection: "row", alignItems: "center", gap: 12,
                  }}
                >
                  <View style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: colors.primary + "20",
                    justifyContent: "center", alignItems: "center",
                  }}>
                    <School size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>{s.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <MapPin size={11} color={colors.textMuted} />
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{s.city}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {schoolSearch.length > 1 && (!schools || schools.length === 0) && (
                <Text style={{ color: colors.textMuted, textAlign: "center", padding: 24 }}>
                  No schools found
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowSchoolPicker(false)}
              style={{
                marginTop: 16, padding: 16, borderRadius: 16,
                borderWidth: 1, borderColor: colors.border, alignItems: "center",
              }}
            >
              <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success modal */}
      <Modal visible={showSuccess} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "center", padding: 24 }}>
          <View style={{
            backgroundColor: colors.card, borderRadius: 32,
            padding: 32, borderWidth: 1, borderColor: colors.border, alignItems: "center",
          }}>
            <StudyHubBrand size="sm" showTagline={false} />
            <Text style={{
              fontSize: 24, fontWeight: "800", color: colors.text,
              marginTop: 16, marginBottom: 8, textAlign: "center",
            }}>
              Welcome to StudyHub!
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
              Contact us on WhatsApp or Instagram to choose a plan and unlock full access.
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL("https://wa.me/9779800000000")}
              style={{
                backgroundColor: "#25d366", borderRadius: 16,
                padding: 16, width: "100%",
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
                marginBottom: 12,
              }}
            >
              <MessageCircle size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>WhatsApp Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setShowSuccess(false); router.replace("/(auth)/login"); }}
              style={{
                borderWidth: 1.5, borderColor: colors.primary, borderRadius: 16,
                padding: 16, width: "100%",
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 16 }}>Go to Login</Text>
              <ArrowRight size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}