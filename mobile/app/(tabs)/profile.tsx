import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { format } from "date-fns";
import {
  CheckCircle2, AlertTriangle, Ticket, School, Bell,
  Search, Calendar, FileStack, LogOut, ChevronRight,
  Settings, Shield, Megaphone, Key, Edit3, Lock, Plus,
  ClipboardList, RefreshCw, X,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { StudyHubBrand } from "../../components/ui/StudyHubBrand";
import { PLANS } from "../../constants/Api";


const REQUEST_TYPES = ["MissingNotes", "MissingPaper", "SubjectRequest", "Other"];

function SectionCard({ title, icon: Icon, iconColor, children }: any) {
  const { colors } = useThemeStore();
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 0, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Icon size={18} color={iconColor ?? colors.text} />
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout, setAuth } = useAuthStore();
  const { colors } = useThemeStore();
  const qc = useQueryClient();
  const isAdmin = Number(user?.role) === 3 || user?.role === "Admin";

  // Edit Profile
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editGrade, setEditGrade] = useState(user?.grade ?? "");
  const [editSection, setEditSection] = useState(user?.section ?? "");

  const GRADES   = ["8", "9", "10", "11", "12"];
  const SECTIONS = ["A", "B", "C", "D", "E"];

  // Change Password
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // Token Renewal
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [renewalPlan, setRenewalPlan] = useState("");
  const [renewalNote, setRenewalNote] = useState("");

  // Custom Requests
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqType, setReqType] = useState(REQUEST_TYPES[0]);
  const [reqSubject, setReqSubject] = useState("");
  const [reqChapter, setReqChapter] = useState("");
  const [reqNote, setReqNote] = useState("");

  // Queries
  const { data: tokenStatus, isLoading } = useQuery({
    queryKey: ["tokenStatus"],
    queryFn: async () => (await api.get("/tokens/me")).data,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data,
  });

  const { data: myRenewals, refetch: refetchRenewals } = useQuery({
    queryKey: ["myRenewals"],
    queryFn: async () => (await api.get("/tokens/renewal/my")).data,
  });

  const { data: myRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["myRequests"],
    queryFn: async () => (await api.get("/custom-requests/my")).data,
  });

  // Mutations
  const editProfileMutation = useMutation({
    mutationFn: async () =>
      (await api.put("/profile", { name: editName, grade: editGrade, section: editSection })).data,
    onSuccess: (data) => {
      if (user) {
        setAuth(
          { ...user, name: data.name, grade: data.grade, section: data.section },
          useAuthStore.getState().accessToken!
        );
      }
      setShowEditProfile(false);
      qc.invalidateQueries({ queryKey: ["profile"] });
      Toast.show({ type: "success", text1: "Profile updated!", text2: `Now in Class ${data.grade}${data.section}` });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const changePwdMutation = useMutation({
    mutationFn: async () => (await api.post("/profile/change-password", { currentPassword: currentPwd, newPassword: newPwd })).data,
    onSuccess: () => {
      setShowChangePwd(false);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      Toast.show({ type: "success", text1: "Password changed!" });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const renewalMutation = useMutation({
    mutationFn: async () => (await api.post("/tokens/renewal", { plan: renewalPlan, note: renewalNote })).data,
    onSuccess: () => {
      setShowRenewalForm(false);
      setRenewalPlan(""); setRenewalNote("");
      refetchRenewals();
      Toast.show({ type: "success", text1: "Renewal request submitted!" });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const requestMutation = useMutation({
    mutationFn: async () => (await api.post("/custom-requests", { type: reqType, subject: reqSubject, chapter: reqChapter, note: reqNote })).data,
    onSuccess: () => {
      setShowRequestForm(false);
      setReqSubject(""); setReqChapter(""); setReqNote("");
      refetchRequests();
      Toast.show({ type: "success", text1: "Request submitted!" });
    },
    onError: (e: any) => Toast.show({ type: "error", text1: e.response?.data?.error ?? "Failed" }),
  });

  const statusColor = (s: string) => ({ Open: colors.warning, Fulfilled: colors.success, Rejected: colors.danger, Approved: colors.success, Pending: colors.warning }[s] ?? colors.muted);

  const actions = [
    { icon: Bell, label: "Notifications", route: "/(tabs)/notifications" },
    { icon: Search, label: "Search Content", route: "/(tabs)/search" },
    { icon: Calendar, label: "Timetable", route: "/(tabs)/timetable" },
    { icon: FileStack, label: "Past Papers", route: "/(tabs)/past-papers" },
    { icon: Megaphone, label: "Announcements", route: "/(tabs)/announcements" },
  ];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Header */}
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 32 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "800" }}>Profile</Text>
            <ThemeToggle />
          </View>
          <View style={{ alignItems: "center" }}>
            <StudyHubBrand size="md" showTagline={false} />
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 12 }}>{user?.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>{user?.email}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ backgroundColor: colors.primary + "20", borderRadius: 0, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.primary + "40" }}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>
                  {typeof user?.role === "number"
                ? ["Student", "Teacher", "TopperContributor", "Admin"][user.role] ?? "Student"
                : user?.role ?? "Student"}
                </Text>
              </View>
              {user?.grade && (
                <View style={{ backgroundColor: colors.accent + "20", borderRadius: 0, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.accent + "40" }}>
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "800" }}>
                    Class {user.grade}{user.section ? ` ${user.section}` : ""}
                  </Text>
                </View>
              )}
            </View>
            {/* Edit profile button */}
            <TouchableOpacity
              onPress={() => { setEditName(user?.name ?? ""); setEditGrade(user?.grade ?? ""); setEditSection(user?.section ?? ""); setShowEditProfile(true); }}
              style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderRadius: 0, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: colors.border }}
            >
              <Edit3 size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ padding: 20 }}>

          {/* Access Token */}
          <SectionCard title="Access Token" icon={Ticket}>
            {tokenStatus?.hasActiveToken ? (
              <View>
                {[
                  ["Plan", tokenStatus.plan],
                  ["Expires", format(new Date(tokenStatus.expiresAt), "MMM dd, yyyy")],
                  ["Days Left", `${tokenStatus.daysLeft} days`],
                ].map(([label, value]) => (
                  <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.textMuted, fontSize: 14 }}>{label}</Text>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>{value}</Text>
                  </View>
                ))}
                <View style={{ backgroundColor: colors.success + "18", borderRadius: 0, padding: 14, alignItems: "center", marginTop: 16, borderWidth: 1, borderColor: colors.success + "40", flexDirection: "row", justifyContent: "center", gap: 8 }}>
                  <CheckCircle2 size={18} color={colors.success} />
                  <Text style={{ color: colors.success, fontWeight: "800", fontSize: 15 }}>Active & Connected</Text>
                </View>
                {/* Renewal request */}
                <TouchableOpacity
                  onPress={() => setShowRenewalForm(true)}
                  style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.primary + "18", borderRadius: 0, padding: 14, borderWidth: 1, borderColor: colors.primary + "40" }}
                >
                  <RefreshCw size={15} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>Request Renewal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={{ backgroundColor: colors.warning + "18", borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: colors.warning + "40" }}>
                  <AlertTriangle size={30} color={colors.warning} style={{ marginBottom: 8 }} />
                  <Text style={{ color: colors.warning, fontWeight: "700", fontSize: 15 }}>No Active Token</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 4 }}>Enter your token code to unlock access</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/activate-token")}
                  style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                  <Key size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Activate Token</Text>
                </TouchableOpacity>
              </View>
            )}
          </SectionCard>

          {/* My Renewal Requests */}
          {(myRenewals?.length ?? 0) > 0 && (
            <SectionCard title="Renewal Requests" icon={RefreshCw} iconColor={colors.primary}>
              {(myRenewals ?? []).slice(0, 3).map((r: any) => (
                <View key={r.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>{r.plan}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{format(new Date(r.createdAt), "MMM dd, yyyy")}</Text>
                  </View>
                  <View style={{ backgroundColor: statusColor(r.status) + "22", borderRadius: 0, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: statusColor(r.status) + "44" }}>
                    <Text style={{ color: statusColor(r.status), fontSize: 12, fontWeight: "700" }}>{r.status}</Text>
                  </View>
                </View>
              ))}
            </SectionCard>
          )}

          {/* School Info */}
          <SectionCard title="School Info" icon={School}>
            {[
              ["School", profile?.school?.name ?? user?.school ?? "—"],
              ["City", profile?.school?.city ?? "—"],
              ["Grade", user?.grade ?? "—"],
              ["Member since", profile?.createdAt ? format(new Date(profile.createdAt), "MMM yyyy") : "—"],
            ].map(([label, value]) => (
              <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>{label}</Text>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14, flex: 1, textAlign: "right" }}>{value}</Text>
              </View>
            ))}
          </SectionCard>

          {/* Custom Requests */}
          <SectionCard title="Content Requests" icon={ClipboardList} iconColor={colors.accent}>
            <TouchableOpacity
              onPress={() => setShowRequestForm(true)}
              style={{ backgroundColor: colors.accent + "18", borderRadius: 0, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.accent + "40", marginBottom: 12 }}
            >
              <Plus size={15} color={colors.accent} />
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 14 }}>Request Missing Content</Text>
            </TouchableOpacity>
            {(myRequests ?? []).slice(0, 3).map((r: any) => (
              <View key={r.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>{r.type} — {r.subject}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{r.chapter}</Text>
                </View>
                <View style={{ backgroundColor: statusColor(r.status) + "22", borderRadius: 0, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: statusColor(r.status) + "44" }}>
                  <Text style={{ color: statusColor(r.status), fontSize: 11, fontWeight: "700" }}>{r.status}</Text>
                </View>
              </View>
            ))}
            {(myRequests?.length ?? 0) === 0 && (
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", paddingVertical: 8 }}>No requests submitted yet</Text>
            )}
          </SectionCard>

          {/* Quick access */}
          <SectionCard title="Quick Access" icon={Settings}>
            {actions.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.route as any)}
                style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 0, backgroundColor: colors.inputBg, marginBottom: 8 }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 0, backgroundColor: colors.primary + "18", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                  <item.icon size={18} color={colors.primary} />
                </View>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15, flex: 1 }}>{item.label}</Text>
                <ChevronRight size={18} color={colors.muted} />
              </TouchableOpacity>
            ))}

            {/* Change Password */}
            <TouchableOpacity
              onPress={() => setShowChangePwd(true)}
              style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 0, backgroundColor: colors.inputBg, marginBottom: 8 }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 0, backgroundColor: colors.warning + "18", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                <Lock size={18} color={colors.warning} />
              </View>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15, flex: 1 }}>Change Password</Text>
              <ChevronRight size={18} color={colors.muted} />
            </TouchableOpacity>
          </SectionCard>

          {/* Admin panel */}
          {isAdmin && (
            <TouchableOpacity
              onPress={() => router.push("/(admin)/" as any)}
              style={{ backgroundColor: colors.primary + "18", borderRadius: 0, padding: 18, alignItems: "center", borderWidth: 1.5, borderColor: colors.primary + "60", flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 16 }}
            >
              <Shield size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 16 }}>Admin Panel</Text>
            </TouchableOpacity>
          )}

          {/* Sign out */}
          <TouchableOpacity
            onPress={async () => {
              try { await api.post("/auth/logout"); } catch {}
              await logout();
              router.replace("/(auth)/login");
            }}
            style={{ backgroundColor: colors.danger + "18", borderRadius: 0, padding: 18, alignItems: "center", borderWidth: 1.5, borderColor: colors.danger + "40", marginBottom: 40, flexDirection: "row", justifyContent: "center", gap: 10 }}
          >
            <LogOut size={20} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: "800", fontSize: 16 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={{ flex: 1, backgroundColor: "#000000bb", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 28 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                  <X size={22} color={colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Name */}
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 8 }}>FULL NAME</Text>
              <TextInput
                value={editName} onChangeText={setEditName}
                placeholder="Your full name" placeholderTextColor={colors.muted}
                style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 14, color: colors.text, borderWidth: 1, borderColor: editName ? colors.primary : colors.border, marginBottom: 20, fontSize: 15 }}
              />

              {/* Grade — 8 to 12 */}
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 10 }}>GRADE (CLASS)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {GRADES.map(g => (
                    <TouchableOpacity key={g} onPress={() => setEditGrade(g)}
                      style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 0, backgroundColor: editGrade === g ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: editGrade === g ? colors.primary : colors.border }}>
                      <Text style={{ color: editGrade === g ? "#fff" : colors.textMuted, fontWeight: "700", fontSize: 14 }}>Class {g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Section — A to E */}
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 10 }}>SECTION</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
                {SECTIONS.map(s => (
                  <TouchableOpacity key={s} onPress={() => setEditSection(s)}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 0, alignItems: "center", backgroundColor: editSection === s ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: editSection === s ? colors.primary : colors.border }}>
                    <Text style={{ color: editSection === s ? "#fff" : colors.textMuted, fontSize: 16, fontWeight: "900" }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => editProfileMutation.mutate()}
                disabled={!editName.trim() || !editGrade || !editSection || editProfileMutation.isPending}
                style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 12, opacity: !editName.trim() || !editGrade || !editSection ? 0.5 : 1 }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{editProfileMutation.isPending ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowEditProfile(false)} style={{ borderRadius: 0, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal visible={showChangePwd} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={{ flex: 1, backgroundColor: "#000000bb", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 28 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Change Password</Text>
                <TouchableOpacity onPress={() => setShowChangePwd(false)}>
                  <X size={22} color={colors.muted} />
                </TouchableOpacity>
              </View>
              {[
                ["Current Password", currentPwd, setCurrentPwd, "••••••••"],
                ["New Password", newPwd, setNewPwd, "Min 8 chars"],
                ["Confirm New Password", confirmPwd, setConfirmPwd, "Retype new password"],
              ].map(([label, val, setter, ph]: any) => (
                <View key={label}>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>{label}</Text>
                  <TextInput
                    value={val} onChangeText={setter}
                    placeholder={ph} placeholderTextColor={colors.muted}
                    secureTextEntry
                    style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 16, fontSize: 15 }}
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={() => {
                  if (newPwd !== confirmPwd) { Toast.show({ type: "error", text1: "Passwords do not match" }); return; }
                  changePwdMutation.mutate();
                }}
                disabled={!currentPwd || !newPwd || !confirmPwd || changePwdMutation.isPending}
                style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 12, opacity: !currentPwd || !newPwd ? 0.5 : 1 }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{changePwdMutation.isPending ? "Changing..." : "Change Password"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowChangePwd(false)} style={{ borderRadius: 0, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Token Renewal Modal ── */}
      <Modal visible={showRenewalForm} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={{ flex: 1, backgroundColor: "#000000bb", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 28 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Request Renewal</Text>
                <TouchableOpacity onPress={() => setShowRenewalForm(false)}>
                  <X size={22} color={colors.muted} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>Select Plan</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {PLANS.map((p) => (
                  <TouchableOpacity key={p.key} onPress={() => setRenewalPlan(p.key)}
                    style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 0, backgroundColor: renewalPlan === p.key ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: renewalPlan === p.key ? colors.primary : colors.border }}>
                    <Text style={{ color: renewalPlan === p.key ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "700" }}>{p.label}</Text>
                    <Text style={{ color: renewalPlan === p.key ? "#ffffffaa" : colors.muted, fontSize: 11, textAlign: "center" }}>{p.days}d</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>Note (optional)</Text>
              <TextInput
                value={renewalNote} onChangeText={setRenewalNote}
                placeholder="Any payment method preference..."
                placeholderTextColor={colors.muted} multiline numberOfLines={3}
                style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 20, height: 80, textAlignVertical: "top" }}
              />
              <TouchableOpacity
                onPress={() => renewalMutation.mutate()}
                disabled={!renewalPlan || renewalMutation.isPending}
                style={{ backgroundColor: colors.primary, borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 12, opacity: !renewalPlan ? 0.5 : 1 }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{renewalMutation.isPending ? "Submitting..." : "Submit Request"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowRenewalForm(false)} style={{ borderRadius: 0, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Custom Request Modal ── */}
      <Modal visible={showRequestForm} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={{ flex: 1, backgroundColor: "#000000bb", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: 28 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Request Content</Text>
                <TouchableOpacity onPress={() => setShowRequestForm(false)}>
                  <X size={22} color={colors.muted} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 8 }}>Request Type</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {REQUEST_TYPES.map((t) => (
                  <TouchableOpacity key={t} onPress={() => setReqType(t)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 0, backgroundColor: reqType === t ? colors.accent : colors.inputBg, borderWidth: 1, borderColor: reqType === t ? colors.accent : colors.border }}>
                    <Text style={{ color: reqType === t ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "600" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {[["Subject", reqSubject, setReqSubject, "e.g. Mathematics"], ["Chapter", reqChapter, setReqChapter, "e.g. Chapter 3"]].map(([label, val, setter, ph]: any) => (
                <View key={label}>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>{label}</Text>
                  <TextInput value={val} onChangeText={setter} placeholder={ph} placeholderTextColor={colors.muted}
                    style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 14 }} />
                </View>
              ))}
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>Additional Note</Text>
              <TextInput value={reqNote} onChangeText={setReqNote} placeholder="Describe what you need..." placeholderTextColor={colors.muted} multiline numberOfLines={3}
                style={{ backgroundColor: colors.inputBg, borderRadius: 0, padding: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 20, height: 80, textAlignVertical: "top" }} />
              <TouchableOpacity
                onPress={() => requestMutation.mutate()}
                disabled={!reqSubject || !reqChapter || requestMutation.isPending}
                style={{ backgroundColor: colors.accent, borderRadius: 0, padding: 16, alignItems: "center", marginBottom: 12, opacity: !reqSubject || !reqChapter ? 0.5 : 1 }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{requestMutation.isPending ? "Submitting..." : "Submit Request"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowRequestForm(false)} style={{ borderRadius: 0, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
