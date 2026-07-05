import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Modal, TextInput, Linking, ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import {
  GraduationCap, Lock, User, Mail, School, ChevronRight,
  Eye, EyeOff, ArrowRight, Search, MapPin, MessageCircle, Plus, X
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
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 0, backgroundColor: i <= score ? clrs[score] : colors.border }} />
        ))}
      </View>
      <Text style={{ color: clrs[score], fontSize: 12, fontWeight: "700" }}>{labels[score]}</Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { colors, isDark } = useThemeStore();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Add school inline
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolCity, setNewSchoolCity] = useState("");

  const GRADES   = ["8", "9", "10", "11", "12"];
  const SECTIONS = ["A", "B", "C", "D", "E"];

  const { data: schools } = useQuery({
    queryKey: ["schools", schoolSearch],
    queryFn: async () => (await api.get(`/schools?query=${schoolSearch}`)).data,
    enabled: schoolSearch.length > 1,
  });

  const addSchoolMutation = useMutation({
    mutationFn: async () =>
      (await api.post("/schools/request", { name: newSchoolName, city: newSchoolCity })).data,
    onSuccess: (data) => {
      // If backend returns the new school immediately, select it
      if (data?.id) {
        setSchoolId(data.id);
        setSchoolName(data.name);
      } else {
        // Otherwise just fill in the name as a pending request
        setSchoolId("pending");
        setSchoolName(newSchoolName);
      }
      Toast.show({ type: "success", text1: "School added!", text2: "Your school has been submitted." });
      setShowAddSchool(false);
      setShowSchoolPicker(false);
      setNewSchoolName("");
      setNewSchoolCity("");
      qc.invalidateQueries({ queryKey: ["schools"] });
    },
    onError: (e: any) =>
      Toast.show({ type: "error", text1: "Failed", text2: e.response?.data?.error ?? "Could not add school" }),
  });

  const mutation = useMutation({
    mutationFn: async () =>
      (await api.post("/auth/signup", { name, email, password, schoolId, grade, section })).data,
    onSuccess: () => setShowSuccess(true),
    onError: (e: any) =>
      Toast.show({ type: "error", text1: "Signup Failed", text2: e.response?.data?.error }),
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BackgroundArt />
      <View style={{ position: "absolute", top: 56, right: 20, zIndex: 10 }}>
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <StudyHubBrand size="md" showTagline />
          </View>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Create Account</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>Access notes, homework & more</Text>
          </View>

          {/* Role locked */}
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBg, borderRadius: 0, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 0, backgroundColor: colors.success + "20", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
              <GraduationCap size={20} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 2 }}>ACCOUNT TYPE</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>Student</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Lock size={13} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 13 }}>Fixed</Text>
            </View>
          </View>

          <FloatingInput label="Full Name" icon={<User size={18} color={colors.textMuted} />} value={name} onChangeText={setName} placeholder="Your full name" />
          <FloatingInput label="Email Address" icon={<Mail size={18} color={colors.textMuted} />} value={email} onChangeText={setEmail} placeholder="you@school.edu" keyboardType="email-address" autoCapitalize="none" />

          {/* School picker trigger */}
          <TouchableOpacity
            onPress={() => setShowSchoolPicker(true)}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBg, borderRadius: 0, borderWidth: 1.5, borderColor: schoolId ? colors.primary : colors.border, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 0, backgroundColor: colors.primary + "20", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
              <School size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 2 }}>SCHOOL</Text>
              <Text style={{ color: schoolId ? colors.text : colors.muted, fontSize: 15, fontWeight: "500" }}>
                {schoolName || "Tap to select your school"}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Grade — 8 to 12 only */}
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10, marginLeft: 4 }}>GRADE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {GRADES.map((g) => (
                <TouchableOpacity key={g} onPress={() => setGrade(g)}
                  style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 0, backgroundColor: grade === g ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: grade === g ? colors.primary : colors.border }}>
                  <Text style={{ color: grade === g ? "#fff" : colors.textMuted, fontSize: 14, fontWeight: "700" }}>Class {g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Section — A to E */}
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10, marginLeft: 4 }}>SECTION</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {SECTIONS.map((s) => (
              <TouchableOpacity key={s} onPress={() => setSection(s)}
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 0, alignItems: "center",
                  backgroundColor: section === s ? colors.primary : colors.inputBg,
                  borderWidth: 1.5, borderColor: section === s ? colors.primary : colors.border,
                  }}>
                <Text style={{ color: section === s ? "#fff" : colors.textMuted, fontSize: 16, fontWeight: "900" }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FloatingInput label="Password" icon={<Lock size={18} color={colors.textMuted} />} value={password} onChangeText={setPassword} placeholder="Min 8 chars, uppercase, number, symbol" secureTextEntry={!showPw} rightIcon={showPw ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />} onRightIconPress={() => setShowPw((v) => !v)} />
          <PasswordStrength password={password} />

          <GradientButton title="Create Account" icon={<ArrowRight size={18} color={isDark ? "#000000" : "#ffffff"} />} onPress={() => mutation.mutate()} loading={mutation.isPending} disabled={!name || !email || !password || !schoolId || !grade || !section} />

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 14 }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── School Picker Modal ── */}
      <Modal visible={showSchoolPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 0, padding: 28, maxHeight: "80%", borderWidth: 1, borderColor: colors.border }}>

            {showAddSchool ? (
              /* ── Add School Form ── */
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Add Your School</Text>
                  <TouchableOpacity onPress={() => setShowAddSchool(false)}>
                    <X size={22} color={colors.muted} />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 20 }}>
                  Can't find your school? Submit it here and it will be added to the system.
                </Text>

                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>SCHOOL NAME</Text>
                <TextInput
                  value={newSchoolName}
                  onChangeText={setNewSchoolName}
                  placeholder="e.g. Sunrise Academy"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 16, color: colors.text, borderWidth: 1.5, borderColor: newSchoolName ? colors.primary : colors.border, marginBottom: 16 }}
                />

                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>CITY</Text>
                <TextInput
                  value={newSchoolCity}
                  onChangeText={setNewSchoolCity}
                  placeholder="e.g. Kathmandu"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 16, color: colors.text, borderWidth: 1.5, borderColor: newSchoolCity ? colors.primary : colors.border, marginBottom: 24 }}
                />

                <TouchableOpacity
                  onPress={() => addSchoolMutation.mutate()}
                  disabled={!newSchoolName.trim() || !newSchoolCity.trim() || addSchoolMutation.isPending}
                  style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 12, opacity: !newSchoolName.trim() || !newSchoolCity.trim() ? 0.5 : 1, flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                  {addSchoolMutation.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <Plus size={18} color="#fff" />
                        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Submit School</Text>
                      </>
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowAddSchool(false)} style={{ borderRadius: 0, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Back to Search</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ── School Search List ── */
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <School size={22} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", flex: 1 }}>Select School</Text>
                  <TouchableOpacity onPress={() => { setShowSchoolPicker(false); setSchoolSearch(""); }}>
                    <X size={22} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBg, borderRadius: 0, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12, gap: 10 }}>
                  <Search size={18} color={colors.muted} />
                  <TextInput
                    placeholder="Search your school..."
                    placeholderTextColor={colors.muted}
                    value={schoolSearch}
                    onChangeText={setSchoolSearch}
                    autoFocus
                    style={{ flex: 1, color: colors.text, fontSize: 15 }}
                  />
                </View>

                <ScrollView keyboardShouldPersistTaps="handled">
                  {/* School results */}
                  {(schools ?? []).map((s: any) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => { setSchoolId(s.id); setSchoolName(s.name); setShowSchoolPicker(false); setSchoolSearch(""); }}
                      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}
                    >
                      <View style={{ width: 40, height: 40, borderRadius: 0, backgroundColor: colors.primary + "20", justifyContent: "center", alignItems: "center" }}>
                        <School size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>{s.name}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <MapPin size={11} color={colors.textMuted} />
                          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{s.city}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Empty state with Add button */}
                  {schoolSearch.length > 1 && (!schools || schools.length === 0) && (
                    <View style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
                      <School size={40} color={colors.muted} />
                      <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: "600" }}>School not found</Text>
                      <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>
                        Can't find "{schoolSearch}"?
                      </Text>
                    </View>
                  )}

                  {/* Always show "Add School" button at bottom */}
                  <TouchableOpacity
                    onPress={() => { setNewSchoolName(schoolSearch); setShowAddSchool(true); }}
                    style={{ margin: 16, backgroundColor: colors.primary + "18", borderRadius: 0, padding: 16, alignItems: "center", borderWidth: 1.5, borderColor: colors.primary + "50", flexDirection: "row", justifyContent: "center", gap: 8 }}
                  >
                    <Plus size={18} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 15 }}>
                      {schoolSearch.length > 1 ? `Add "${schoolSearch}"` : "Add a New School"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Success Modal ── */}
      <Modal visible={showSuccess} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000cc", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 0, padding: 32, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <StudyHubBrand size="sm" showTagline={false} />
            <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 16, marginBottom: 8, textAlign: "center" }}>Welcome to StudyHub!</Text>
            <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
              Contact us on WhatsApp or Instagram to choose a plan and unlock full access.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://wa.me/9779800000000")}
              style={{ backgroundColor: "#25d366", borderRadius: 0, padding: 16, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}
            >
              <MessageCircle size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>WhatsApp Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setShowSuccess(false); router.replace("/(auth)/login"); }}
              style={{ borderWidth: 1.5, borderColor: colors.primary, borderRadius: 0, padding: 16, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}
            >
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 16 }}>Go to Login</Text>
              <ArrowRight size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
