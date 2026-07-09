import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Shield, Users, Key, School as SchoolIcon,
  RefreshCw, Trash2, Plus, X, Check, AlertCircle,
  Megaphone, Sparkles, History, ClipboardList, Pin,
  CheckCircle2, XCircle, Clock, BookOpen, Download,
  Coins, BarChart3, HelpCircle, Edit2, Eye, Award,
  GraduationCap
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — StudyHub" },
      { name: "description", content: "Administrative settings, license distribution, and school configuration." }
    ]
  }),
  component: AdminPage,
});

type AdminTab = "stats" | "users" | "classes" | "schools" | "notes" | "homework" | "announcements" | "requests" | "renewals" | "tokens" | "audit" | "releases";

function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    } else if (user.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!user || user.role !== "admin") {
    return (
      <AppShell>
        <div className="py-12 text-center text-[#5a7095]">Redirecting...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Admin Portal</h1>
            <p className="text-sm text-[#5a7095]">Manage users, content, assignments, schools, and settings.</p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`flex items-center gap-3 rounded-xl border p-4 ${message.type === "success" ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-800" : "border-red-500/20 bg-red-500/8 text-red-800"}`}>
            {message.type === "success" ? <Check className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
            <button className="ml-auto opacity-70 hover:opacity-100" onClick={() => setMessage(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#2f6fed]/15 pb-px overflow-x-auto">
          {([
            { id: "stats", label: "Stats & Reports", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "classes", label: "Classes", icon: GraduationCap },
            { id: "schools", label: "Schools", icon: SchoolIcon },
            { id: "notes", label: "Notes", icon: BookOpen },
            { id: "homework", label: "Homework", icon: ClipboardList },
            { id: "announcements", label: "Announcements", icon: Megaphone },
            { id: "requests", label: "Custom Requests", icon: Sparkles },
            { id: "renewals", label: "Renewals", icon: RefreshCw },
            { id: "tokens", label: "Tokens", icon: Key },
            { id: "releases", label: "App Releases", icon: Download },
            { id: "audit", label: "Audit Log", icon: ClipboardList },
          ] as { id: AdminTab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${activeTab === id ? "border-[#2f6fed] text-[#2f6fed]" : "border-transparent text-[#5a7095] hover:text-[#0e2a4d]"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === "stats" && <StatsTab setMessage={setMessage} />}
        {activeTab === "users" && <UsersTab setMessage={setMessage} />}
        {activeTab === "classes" && <ClassesTab />}
        {activeTab === "schools" && <SchoolsTab setMessage={setMessage} />}
        {activeTab === "notes" && <NotesTab setMessage={setMessage} />}
        {activeTab === "homework" && <HomeworkTab setMessage={setMessage} />}
        {activeTab === "announcements" && <AnnouncementsTab setMessage={setMessage} />}
        {activeTab === "requests" && <RequestsTab setMessage={setMessage} />}
        {activeTab === "renewals" && <RenewalsTab setMessage={setMessage} />}
        {activeTab === "tokens" && <TokensTab setMessage={setMessage} />}
        { activeTab === "audit" && <AuditLogTab /> }
        { activeTab === "releases" && <AppReleasesTab setMessage={setMessage} /> }
      </div>
    </AppShell>
  );
}

// ── Stats Tab ──────────────────────────────────────────────────────
function StatsTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Revenue Adjustment State
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState("");
  const [revenueReason, setRevenueReason] = useState("");
  const [isSubmittingRevenue, setIsSubmittingRevenue] = useState(false);

  const fetchStats = () => {
    api.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRevenue(true);
    try {
      await api.post("/admin/revenue-adjustments", {
        amount: Number(revenueAmount),
        reason: revenueReason
      });
      setMessage({ type: "success", text: "Revenue adjusted successfully!" });
      setShowRevenueModal(false);
      setRevenueAmount("");
      setRevenueReason("");
      fetchStats();
    } catch {
      setMessage({ type: "error", text: "Failed to adjust revenue." });
    } finally {
      setIsSubmittingRevenue(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const res = await api.get("/admin/export/users", { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `studyhub-users-${new Date().toISOString().substring(0, 10)}.csv`;
      link.click();
      setMessage({ type: "success", text: "Users report exported successfully." });
    } catch {
      setMessage({ type: "error", text: "Export failed." });
    }
  };

  const handleExportPayments = async () => {
    try {
      const res = await api.get("/admin/export/payments", { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `studyhub-payments-${new Date().toISOString().substring(0, 10)}.csv`;
      link.click();
      setMessage({ type: "success", text: "Payments report exported successfully." });
    } catch {
      setMessage({ type: "error", text: "Export failed." });
    }
  };

  if (isLoading) return <div className="py-8 text-center text-[#5a7095]">Loading stats...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "from-blue-500 to-sky-500" },
          { label: "Active Tokens", value: stats?.activeTokens, icon: Key, color: "from-emerald-500 to-teal-500" },
          { label: "Total Revenue", value: `Rs. ${stats?.totalRevenue || 0}`, icon: Coins, color: "from-amber-500 to-yellow-500" },
          { label: "Active Schools", value: stats?.totalSchools, icon: SchoolIcon, color: "from-indigo-500 to-purple-500" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card p-5 flex items-center justify-between border border-[#2f6fed]/15">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-semibold text-[#5a7095] uppercase">{item.label}</p>
                  {item.label === "Total Revenue" && (
                    <button 
                      onClick={() => setShowRevenueModal(true)}
                      className="text-xs bg-[#2f6fed]/10 text-[#2f6fed] hover:bg-[#2f6fed]/20 px-2 py-0.5 rounded transition-colors"
                      title="Adjust Revenue"
                    >
                      Modify
                    </button>
                  )}
                </div>
                <p className="mt-1 text-2xl font-bold text-[#0e2a4d]">{item.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-[#2f6fed]/15 space-y-4">
          <h3 className="font-bold text-[#0e2a4d] text-base">License Status Summary</h3>
          <div className="space-y-2 text-sm text-[#0e2a4d]">
            <div className="flex justify-between border-b pb-1"><span>Tokens Expired</span><span className="font-bold text-red-500">{stats?.expiredTokens || 0}</span></div>
            <div className="flex justify-between border-b pb-1"><span>Expiring within 7 days</span><span className="font-bold text-amber-500">{stats?.tokensExpiringIn7Days || 0}</span></div>
            <div className="flex justify-between border-b pb-1"><span>New Registrations (This Month)</span><span className="font-bold text-emerald-600">{stats?.newUsersThisMonth || 0}</span></div>
            <div className="flex justify-between"><span>Pending Content Requests</span><span className="font-bold text-[#2f6fed]">{stats?.pendingRequests || 0}</span></div>
          </div>
        </div>

        <div className="glass-card p-6 border border-[#2f6fed]/15 space-y-4">
          <h3 className="font-bold text-[#0e2a4d] text-base">Administrative Reports</h3>
          <p className="text-xs text-[#5a7095]">Download CSV audits for active system users and license payment records.</p>
          <div className="flex gap-3">
            <button onClick={handleExportUsers} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#2f6fed]/15 bg-white py-3 text-sm font-semibold text-[#2f6fed] hover:bg-[#2f6fed]/5 transition-all">
              <Download className="h-4 w-4" /> Users List CSV
            </button>
            <button onClick={handleExportPayments} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#2f6fed]/15 bg-white py-3 text-sm font-semibold text-[#2f6fed] hover:bg-[#2f6fed]/5 transition-all">
              <Download className="h-4 w-4" /> Revenue/Payment CSV
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Adjustment Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#0e2a4d]">Adjust Total Revenue</h3>
            <p className="mt-1 text-sm text-[#5a7095]">Add a positive or negative amount to correct the total revenue.</p>
            <form onSubmit={handleRevenueSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0e2a4d]">Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  value={revenueAmount}
                  onChange={e => setRevenueAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#2f6fed]/20 bg-[#f8fbff] px-4 py-2 text-[#0e2a4d] outline-none transition-all focus:border-[#2f6fed]"
                  placeholder="e.g. 500 or -500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0e2a4d]">Reason</label>
                <input
                  type="text"
                  required
                  value={revenueReason}
                  onChange={e => setRevenueReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#2f6fed]/20 bg-[#f8fbff] px-4 py-2 text-[#0e2a4d] outline-none transition-all focus:border-[#2f6fed]"
                  placeholder="e.g. Cash payment received"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevenueModal(false)}
                  className="flex-1 rounded-xl border border-[#2f6fed]/20 py-2 font-semibold text-[#5a7095] hover:bg-[#f8fbff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevenue}
                  className="flex-1 rounded-xl bg-[#2f6fed] py-2 font-semibold text-white hover:bg-[#2257c2] disabled:opacity-50"
                >
                  {isSubmittingRevenue ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ──────────────────────────────────────────────────────
function UsersTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [plan, setPlan] = useState("OneMonth");
  const [amount, setAmount] = useState("500");
  const [channel, setChannel] = useState("eSewa");
  const [isIssuing, setIsIssuing] = useState(false);

  // User creation form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"Teacher" | "Admin">("Teacher");
  const [createGrade, setCreateGrade] = useState("");
  const [createSchoolId, setCreateSchoolId] = useState("");
  const [schools, setSchools] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/users?pageSize=50${search ? `&search=${search}` : ""}`);
      setUsers(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
    api.get("/admin/schools").then(res => {
      setSchools(res.data || []);
      if (res.data?.length > 0) setCreateSchoolId(res.data[0].id);
    }).catch(console.error);
  }, [search]);

  const handleResetDevice = async (tokenId: string, userName: string) => {
    if (!confirm(`Reset device binding for ${userName}?`)) return;
    try {
      await api.post(`/admin/tokens/${tokenId}/reset-device`);
      setMessage({ type: "success", text: `Device reset for ${userName}.` });
      fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed." });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Permanently delete user "${userName}"?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage({ type: "success", text: `"${userName}" deleted.` });
      fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed." });
    }
  };

  const handleIssueToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      const res = await api.post("/admin/tokens", { userId: selectedUser.id, plan, amount: parseFloat(amount), channel });
      setMessage({ type: "success", text: `Token generated! Code: ${res.data.code}` });
      setShowTokenModal(false);
      fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed." });
    } finally { setIsIssuing(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post("/admin/users", {
        name: createName,
        email: createEmail,
        password: createPassword,
        role: createRole,
        schoolId: createSchoolId,
        grade: createGrade || null
      });
      setMessage({ type: "success", text: `User "${createName}" created.` });
      setShowCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to create user." });
    } finally { setIsCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80 rounded-xl border border-[#2f6fed]/15 bg-white/60 px-4 py-2 text-sm text-[#0e2a4d] outline-none transition-all focus:border-[#2f6fed]"
          />
          <button onClick={fetchUsers} className="rounded-xl border border-[#2f6fed]/15 bg-white px-4 py-2 text-sm font-semibold text-[#0e2a4d] hover:bg-slate-50">Refresh</button>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20">
          <Plus className="h-4 w-4" /> Add Staff (Teacher/Admin)
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[#2f6fed]/15 bg-white/80 backdrop-blur-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#2f6fed]/10 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-[#5a7095]">
              <th className="px-6 py-4">Name / Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">School</th>
              <th className="px-6 py-4">Subscription</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2f6fed]/5 text-sm text-[#0e2a4d]">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#5a7095]">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#5a7095]">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/30">
                <td className="px-6 py-4"><div className="font-semibold">{u.name}</div><div className="text-xs text-[#5a7095]">{u.email}</div></td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${u.role === "Admin" ? "bg-red-100 text-red-700" : u.role === "Teacher" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>{u.role}</span>
                </td>
                <td className="px-6 py-4 font-medium">{u.grade ? `Class ${u.grade}${u.section || ""}` : "—"}</td>
                <td className="px-6 py-4 text-xs text-[#5a7095] max-w-xs truncate">{u.school?.name || "—"}</td>
                <td className="px-6 py-4">
                  {u.activeToken ? (
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-600 uppercase">{u.activeToken.plan}</span>
                      <div className="text-[#5a7095] mt-0.5">Expires: {new Date(u.activeToken.expiresAt).toLocaleDateString()}</div>
                    </div>
                  ) : u.role === "Student" ? (
                    <span className="text-xs font-medium text-red-500">No active plan</span>
                  ) : (
                    <span className="text-xs text-[#5a7095]">Unlimited</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.role === "Student" && (
                      <button onClick={() => { setSelectedUser(u); setShowTokenModal(true); }} className="flex items-center gap-1 rounded-lg bg-[#2f6fed]/8 px-2.5 py-1.5 text-xs font-semibold text-[#2f6fed] hover:bg-[#2f6fed]/15">
                        <Key className="h-3.5 w-3.5" /> Issue Plan
                      </button>
                    )}
                    {u.activeToken && (
                      <button onClick={() => handleResetDevice(u.activeToken.id, u.name)} title="Reset Device" className="rounded-lg bg-orange-50 p-1.5 text-orange-600 hover:bg-orange-100">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    {u.role !== "Admin" && (
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">Add staff user</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Name</label>
                <input type="text" required value={createName} onChange={(e) => setCreateName(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]" placeholder="Dr. Rita Roy" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Email</label>
                <input type="email" required value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]" placeholder="rita@school.edu" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Password</label>
                <input type="password" required value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Role</label>
                  <select value={createRole} onChange={(e) => setCreateRole(e.target.value as any)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]">
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Target Grade (optional)</label>
                  <input type="text" value={createGrade} onChange={(e) => setCreateGrade(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]" placeholder="10" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">School</label>
                <select value={createSchoolId} onChange={(e) => setCreateSchoolId(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]">
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60">{isCreating ? "Saving..." : "Create User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">Issue Plan: {selectedUser?.name}</h3>
              <button onClick={() => setShowTokenModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            <form onSubmit={handleIssueToken} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Plan</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]">
                  {["OneWeek", "OneMonth", "TwoMonths", "ThreeMonths", "SixMonths", "OneYear"].map((p) => (
                    <option key={p} value={p}>{p.replace(/([A-Z])/g, " $1").trim()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Amount (Rs.)</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Channel</label>
                <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]">
                  {["eSewa", "Khalti", "WhatsApp", "Cash", "Bank"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTokenModal(false)} className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isIssuing} className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60">{isIssuing ? "Generating..." : "Generate Code"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Classes Tab ────────────────────────────────────────────────────
function ClassesTab() {
  const [roster, setRoster] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  useEffect(() => {
    api.get("/admin/schools")
      .then(res => {
        setSchools(res.data || []);
        if (res.data?.length > 0) setSchoolId(res.data[0].id);
      })
      .catch(console.error);
  }, []);

  const fetchRoster = () => {
    if (!schoolId) return;
    setIsLoading(true);
    api.get(`/admin/class-roster?schoolId=${schoolId}`)
      .then(res => setRoster(res.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRoster();
  }, [schoolId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-bold text-[#0e2a4d]">Select School:</label>
        <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="rounded-xl border border-[#2f6fed]/15 bg-white px-3 py-2 text-sm text-[#0e2a4d] outline-none">
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-[#5a7095]">Loading class lists...</div>
      ) : roster.length === 0 ? (
        <div className="py-8 text-center text-[#5a7095]">No students found for this school.</div>
      ) : (
        <div className="space-y-3">
          {roster.map((item) => {
            const classKey = item.classLabel;
            const isExpanded = expandedClass === classKey;
            return (
              <div key={classKey} className="glass-card border border-[#2f6fed]/15 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setExpandedClass(isExpanded ? null : classKey)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#2f6fed]" />
                    <span className="font-bold text-[#0e2a4d] text-base">{item.classLabel}</span>
                    <span className="rounded-full bg-[#2f6fed]/8 px-2.5 py-0.5 text-xs font-semibold text-[#2f6fed]">{item.studentCount} students</span>
                  </div>
                  <span className="text-xs text-[#2f6fed] font-semibold">{isExpanded ? "Collapse" : "Expand Roster"}</span>
                </button>
                {isExpanded && (
                  <div className="px-6 py-4 border-t border-[#2f6fed]/5 bg-white/40">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b text-xs font-bold uppercase tracking-wider text-[#5a7095]">
                          <th className="py-2">Name</th>
                          <th className="py-2">Email</th>
                          <th className="py-2 text-right">Access Token</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs text-[#0e2a4d]">
                        {item.students.map((std: any) => (
                          <tr key={std.id} className="hover:bg-slate-50/30">
                            <td className="py-3 font-semibold">{std.name}</td>
                            <td className="py-3 text-[#5a7095]">{std.email}</td>
                            <td className="py-3 text-right">
                              <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${std.hasActiveToken ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                {std.hasActiveToken ? "Active" : "No Plan"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Schools Tab ────────────────────────────────────────────────────
function SchoolsTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [schools, setSchools] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCity, setSchoolCity] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchSchools = async () => {
    try { const res = await api.get("/admin/schools"); setSchools(res.data || []); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSchools(); }, []);

  const openAdd = () => {
    setEditingSchool(null);
    setSchoolName("");
    setSchoolCity("");
    setSchoolLogo("");
    setShowModal(true);
  };

  const openEdit = (school: any) => {
    setEditingSchool(school);
    setSchoolName(school.name);
    setSchoolCity(school.city);
    setSchoolLogo(school.logoUrl || "");
    setShowModal(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      if (editingSchool) {
        await api.put(`/admin/schools/${editingSchool.id}`, { name: schoolName, city: schoolCity, logoUrl: schoolLogo });
        setMessage({ type: "success", text: `School "${schoolName}" updated.` });
      } else {
        await api.post("/admin/schools", { name: schoolName, city: schoolCity, logoUrl: schoolLogo });
        setMessage({ type: "success", text: `School "${schoolName}" created.` });
      }
      setShowModal(false);
      fetchSchools();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Operation failed." });
    } finally { setIsCreating(false); }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/admin/schools/${id}/toggle`);
      fetchSchools();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#0e2a4d] text-lg">Schools ({schools.length})</h3>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20">
          <Plus className="h-4 w-4" /> Add School
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((s) => (
          <div key={s.id} className="glass-card p-5 border border-[#2f6fed]/15">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-[#0e2a4d]">{s.name}</h4>
                <p className="text-xs text-[#5a7095] mt-0.5">{s.city}</p>
              </div>
              <button
                onClick={() => handleToggle(s.id)}
                className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
              >
                {s.isActive ? "Active" : "Disabled"}
              </button>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-[#5a7095]">
              <span>{s.userCount || s.studentCount || 0} users</span>
              <button onClick={() => openEdit(s)} className="text-[#2f6fed] hover:underline">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">{editingSchool ? "Edit School" : "Add School"}</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">School Name</label>
                <input type="text" required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">City</label>
                <input type="text" required value={schoolCity} onChange={(e) => setSchoolCity(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Logo URL (optional)</label>
                <input type="text" value={schoolLogo} onChange={(e) => setSchoolLogo(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60">{isCreating ? "Saving..." : "Save School"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Notes Tab ──────────────────────────────────────────────────────
// Custom Note definition matching back-end payload structure
function NotesTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);

  // Note Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formChapter, setFormChapter] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formGrade, setFormGrade] = useState("10");
  const [formSection, setFormSection] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formType, setFormType] = useState("Note");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Catalog Modal States
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catGrade, setCatGrade] = useState("10");
  const [catSection, setCatSection] = useState("");
  const [catSubject, setCatSubject] = useState("");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      let url = "/notes?type=Note";
      if (selectedSchoolId) url += `&schoolId=${selectedSchoolId}`;
      const res = await api.get(url);
      setNotes(res.data.data || []);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch notes." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalog = async () => {
    if (!selectedSchoolId) return;
    try {
      const res = await api.get(`/catalog?schoolId=${selectedSchoolId}`);
      setCatalog(res.data || []);
    } catch {
      console.error("Failed to fetch catalog");
    }
  };

  useEffect(() => {
    api.get("/admin/schools")
      .then(res => {
        setSchools(res.data || []);
        if (res.data?.length > 0) setSelectedSchoolId(res.data[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchNotes();
      fetchCatalog();
    }
  }, [selectedSchoolId]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete note "${title}"?`)) return;
    try {
      await api.delete(`/notes/${id}`);
      setMessage({ type: "success", text: "Note deleted successfully." });
      fetchNotes();
    } catch {
      setMessage({ type: "error", text: "Failed to delete note." });
    }
  };

  const handleDeleteCatalog = async (id: string) => {
    if (!confirm("Delete this section/subject? Note: You cannot delete a section that has uploaded files.")) return;
    try {
      await api.delete(`/catalog/${id}`);
      setMessage({ type: "success", text: "Section deleted successfully." });
      fetchCatalog();
    } catch (e: any) {
      setMessage({ type: "error", text: e.response?.data?.error || "Failed to delete section." });
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormTitle("");
    setFormChapter("");
    setFormFileUrl("");
    setFormType("Note");
    
    // Auto-select first available catalog entry if any
    if (catalog.length > 0) {
      setFormGrade(catalog[0].grade);
      setFormSection(catalog[0].section || "");
      setFormSubject(catalog[0].subject);
    } else {
      setFormGrade("10");
      setFormSection("");
      setFormSubject("");
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setFormFileUrl(res.data.url);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to upload file." });
      console.error(err);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const openEdit = (n: any) => {
    setEditingId(n.id);
    setFormTitle(n.title);
    setFormSubject(n.subject);
    setFormChapter(n.chapter);
    setFormFileUrl(n.fileUrl || "");
    setFormGrade(n.grade || "10");
    setFormSection(n.section || "");
    setFormType(n.type || "Note");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      title: formTitle,
      subject: formSubject,
      chapter: formChapter,
      fileUrl: formFileUrl,
      grade: formGrade,
      section: formSection || null,
      type: formType,
      targetSchoolId: selectedSchoolId || null
    };

    try {
      if (editingId) {
        await api.put(`/notes/${editingId}`, payload);
      } else {
        await api.post("/notes", payload);
      }
      setShowModal(false);
      fetchNotes();
      fetchCatalog();
      setMessage({ type: "success", text: "Note saved." });
    } catch {
      setMessage({ type: "error", text: "Failed to save note." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCat(true);
    try {
      await api.post("/catalog", {
        schoolId: selectedSchoolId,
        grade: catGrade,
        section: catSection || null,
        subject: catSubject
      });
      setMessage({ type: "success", text: "Section added to catalog." });
      setCatSubject("");
      fetchCatalog();
    } catch (e: any) {
      setMessage({ type: "error", text: e.response?.data?.error || "Failed to add section." });
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const availableGrades = Array.from(new Set(catalog.map(c => c.grade)));
  const availableSections = Array.from(new Set(catalog.filter(c => c.grade === formGrade).map(c => c.section || "")));
  const availableSubjects = Array.from(new Set(catalog.filter(c => c.grade === formGrade && (c.section || "") === formSection).map(c => c.subject)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-[#0e2a4d]">Filter School:</label>
          <select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)} className="rounded-xl border border-[#2f6fed]/15 bg-white px-3 py-2 text-sm text-[#0e2a4d] outline-none">
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatalogModal(true)} className="flex items-center gap-2 rounded-xl border border-[#2f6fed]/15 bg-white px-4 py-2 text-sm font-semibold text-[#2f6fed] hover:bg-[#2f6fed]/5">
            <Plus className="h-4 w-4" /> Manage Sections
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20">
            <Plus className="h-4 w-4" /> Add Note
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[#2f6fed]/15 bg-white/80">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-[#5a7095]">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Class Target</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-[#0e2a4d]">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-[#5a7095]">Loading notes...</td></tr>
            ) : notes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-[#5a7095]">No notes found.</td></tr>
            ) : notes.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50/30">
                <td className="px-6 py-4 font-semibold">{n.title}</td>
                <td className="px-6 py-4">{n.subject} <span className="text-xs text-[#5a7095]">{n.chapter}</span></td>
                <td className="px-6 py-4 font-medium text-xs">Class {n.grade}{n.section || " (All)"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${n.type === "TopperNote" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {n.type === "TopperNote" ? "Topper Note" : "Standard Note"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(n)} className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(n.id, n.title)} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">{editingId ? "Edit Note" : "Add Note"}</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {catalog.length === 0 && !editingId && (
                <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm border border-amber-200">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  No classes/subjects configured for this school. Please "Manage Sections" first.
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Grade</label>
                  <select required value={formGrade} onChange={(e) => { setFormGrade(e.target.value); setFormSection(""); setFormSubject(""); }} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                    <option value="">Select Grade</option>
                    {editingId ? (
                      ["8", "9", "10", "11", "12"].map(g => <option key={g} value={g}>Class {g}</option>)
                    ) : (
                      availableGrades.map(g => <option key={g as string} value={g as string}>Class {g as string}</option>)
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Section</label>
                  <select value={formSection} onChange={(e) => { setFormSection(e.target.value); setFormSubject(""); }} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                    {editingId ? (
                      <>
                        <option value="">All</option>
                        {["A", "B", "C", "D", "E"].map(s => <option key={s} value={s}>Section {s}</option>)}
                      </>
                    ) : (
                      <>
                        {availableSections.length > 0 ? (
                          availableSections.map(s => <option key={s as string} value={s as string}>{s ? `Section ${s}` : 'All Sections'}</option>)
                        ) : (
                          <option value="">All</option>
                        )}
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject</label>
                {editingId ? (
                   <input type="text" required value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
                ) : (
                  <select required value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                    <option value="">Select Subject</option>
                    {availableSubjects.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                  </select>
                )}
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Chapter</label>
                <input type="text" required value={formChapter} onChange={(e) => setFormChapter(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Title</label>
                <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">File</label>
                {formFileUrl ? (
                  <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-200">
                    <span className="text-sm truncate max-w-[200px] text-green-700 font-semibold">File attached</span>
                    <button type="button" onClick={() => setFormFileUrl("")} className="text-xs bg-white border border-red-200 text-red-500 rounded px-2 py-1 hover:bg-red-50">Remove</button>
                  </div>
                ) : (
                  <input type="file" required={!editingId} onChange={handleFileUpload} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
                )}
                {isUploadingFile && <p className="text-xs text-[#2f6fed] mt-1 font-semibold">Uploading...</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Note Type</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                  <option value="Note">Standard Note</option>
                  <option value="TopperNote">Topper Note</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting || isUploadingFile || (!editingId && catalog.length === 0)} className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Saving..." : "Save Note"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Sections / Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">Manage Class Sections & Subjects</h3>
              <button onClick={() => setShowCatalogModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add New Section */}
                <div>
                  <h4 className="font-bold text-sm text-[#0e2a4d] mb-4 pb-2 border-b">Add New Subject Folder</h4>
                  <form onSubmit={handleAddCatalog} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#0e2a4d]">Grade</label>
                        <select required value={catGrade} onChange={(e) => setCatGrade(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                          {["8", "9", "10", "11", "12"].map(g => <option key={g} value={g}>Class {g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#0e2a4d]">Section</label>
                        <select value={catSection} onChange={(e) => setCatSection(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                          <option value="">All</option>
                          {["A", "B", "C", "D", "E"].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#0e2a4d]">Subject Name</label>
                      <input type="text" required placeholder="e.g. Physics" value={catSubject} onChange={(e) => setCatSubject(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
                    </div>
                    <button type="submit" disabled={isSubmittingCat} className="w-full rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60">
                      {isSubmittingCat ? "Adding..." : "Add Folder"}
                    </button>
                  </form>
                </div>
                
                {/* Existing Catalog */}
                <div>
                  <h4 className="font-bold text-sm text-[#0e2a4d] mb-4 pb-2 border-b">Existing Folders</h4>
                  {catalog.length === 0 ? (
                    <p className="text-sm text-[#5a7095]">No folders configured yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {catalog.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm">
                          <div>
                            <p className="font-semibold text-[#0e2a4d]">{c.subject}</p>
                            <p className="text-xs text-[#5a7095]">Class {c.grade}{c.section ? ` Sec ${c.section}` : ' (All)'} • {c.itemCount || 0} items</p>
                          </div>
                          <button onClick={() => handleDeleteCatalog(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg" title="Delete Folder">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border-t border-[#2f6fed]/10 px-6 py-4 flex justify-end">
               <button onClick={() => setShowCatalogModal(false)} className="rounded-xl border border-[#2f6fed]/15 px-6 py-2 text-sm font-semibold text-[#0e2a4d] hover:bg-white">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// ── Homework Tab ───────────────────────────────────────────────────
function HomeworkTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Homework Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDue, setFormDue] = useState("");
  const [formGrade, setFormGrade] = useState("10");
  const [formSection, setFormSection] = useState("A");
  const [formAttachmentUrl, setFormAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submissions Modal
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedHw, setSelectedHw] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  const fetchHomework = async () => {
    setIsLoading(true);
    try {
      let url = "/homework";
      if (selectedSchoolId) url += `?schoolId=${selectedSchoolId}`;
      const res = await api.get(url);
      setHomeworks(res.data.data || []);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch homework." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    api.get("/admin/schools")
      .then(res => {
        setSchools(res.data || []);
        if (res.data?.length > 0) setSelectedSchoolId(res.data[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSchoolId) fetchHomework();
  }, [selectedSchoolId]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete assignment "${title}"?`)) return;
    try {
      await api.delete(`/homework/${id}`);
      setMessage({ type: "success", text: "Assignment deleted." });
      fetchHomework();
    } catch {
      setMessage({ type: "error", text: "Failed to delete homework." });
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormTitle("");
    setFormSubject("");
    setFormDesc("");
    setFormDue(new Date().toISOString().substring(0, 10));
    setFormGrade("10");
    setFormSection("A");
    setFormAttachmentUrl("");
    setShowModal(true);
  };

  const openEdit = (h: any) => {
    setEditingId(h.id);
    setFormTitle(h.title);
    setFormSubject(h.subject);
    setFormDesc(h.description || "");
    setFormDue(h.dueAt ? h.dueAt.substring(0, 10) : new Date().toISOString().substring(0, 10));
    setFormGrade(h.grade || "10");
    setFormSection(h.section || "A");
    setFormAttachmentUrl(h.attachmentUrl || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      title: formTitle,
      subject: formSubject,
      description: formDesc,
      dueAt: new Date(formDue).toISOString(),
      grade: formGrade,
      section: formSection,
      attachmentUrl: formAttachmentUrl || null,
      targetSchoolId: selectedSchoolId || null
    };

    try {
      if (editingId) {
        await api.put(`/homework/${editingId}`, payload);
      } else {
        await api.post("/homework", payload);
      }
      setShowModal(false);
      fetchHomework();
      setMessage({ type: "success", text: "Homework assignment saved." });
    } catch {
      setMessage({ type: "error", text: "Failed to save homework." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmissions = async (hw: any) => {
    setSelectedHw(hw);
    setShowSubmissionsModal(true);
    try {
      const res = await api.get(`/homework/${hw.id}/submissions`);
      setSubmissions(res.data || []);
    } catch {
      console.error("Submissions load error");
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    setIsGrading(true);
    try {
      await api.post(`/homework/submissions/${submissionId}/grade`, { grade: gradingScore });
      setMessage({ type: "success", text: "Submission graded successfully." });
      setGradingSubmissionId(null);
      setGradingScore("");
      // Refresh submissions
      const res = await api.get(`/homework/${selectedHw.id}/submissions`);
      setSubmissions(res.data || []);
    } catch {
      setMessage({ type: "error", text: "Grading failed." });
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-[#0e2a4d]">Filter School:</label>
          <select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)} className="rounded-xl border border-[#2f6fed]/15 bg-white px-3 py-2 text-sm text-[#0e2a4d] outline-none">
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20">
          <Plus className="h-4 w-4" /> Add Homework
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[#2f6fed]/15 bg-white/80">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-[#5a7095]">
              <th className="px-6 py-4">Homework Title</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Class & Section</th>
              <th className="px-6 py-4 text-right">Submissions</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-[#0e2a4d]">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#5a7095]">Loading homework...</td></tr>
            ) : homeworks.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#5a7095]">No homework tasks found.</td></tr>
            ) : homeworks.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50/30">
                <td className="px-6 py-4 font-semibold">{h.title}</td>
                <td className="px-6 py-4">{h.subject}</td>
                <td className="px-6 py-4 font-semibold text-xs text-[#5a7095]">{new Date(h.dueAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold text-xs">Class {h.grade}{h.section}</td>
                <td className="px-6 py-4 text-right font-bold text-[#2f6fed]">
                  <button onClick={() => openSubmissions(h)} className="flex items-center gap-1 ml-auto text-xs bg-slate-100 hover:bg-slate-200 text-[#0e2a4d] px-2 py-1 rounded">
                    <Eye className="h-3.5 w-3.5" /> {h.submissionCount || 0} Submissions
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(h)} className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(h.id, h.title)} className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submissions Viewer Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">Submissions: {selectedHw?.title}</h3>
              <button onClick={() => setShowSubmissionsModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            <div className="p-6 max-h-[450px] overflow-y-auto space-y-4">
              {submissions.length === 0 ? (
                <div className="py-8 text-center text-[#5a7095]">No submissions found.</div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
                      <div>
                        <p className="text-sm font-semibold text-[#0e2a4d]">{sub.student.name}</p>
                        <p className="text-xs text-[#5a7095]">{sub.student.email}</p>
                        <p className="text-[10px] text-[#5a7095]/70 mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#2f6fed] hover:underline font-semibold bg-blue-50 px-2 py-1 rounded">
                          <Eye className="h-3.5 w-3.5" /> View Solution
                        </a>
                        <div className="text-right">
                          {sub.grade ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Graded: {sub.grade}</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">Not Graded</span>
                          )}
                          <div className="mt-1">
                            {gradingSubmissionId === sub.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Grade (e.g. A)"
                                  value={gradingScore}
                                  onChange={(e) => setGradingScore(e.target.value)}
                                  className="w-20 rounded border border-[#2f6fed]/30 px-1 py-0.5 text-xs outline-none"
                                />
                                <button onClick={() => handleGradeSubmission(sub.id)} disabled={isGrading} className="bg-[#2f6fed] text-white px-2 py-0.5 rounded text-[10px] font-bold">Save</button>
                                <button onClick={() => setGradingSubmissionId(null)} className="text-[#5a7095] text-[10px]">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => { setGradingSubmissionId(sub.id); setGradingScore(sub.grade || ""); }} className="text-xs text-[#2f6fed] hover:underline font-semibold">Grade</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Homework Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">{editingId ? "Edit Homework" : "Add Homework"}</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Title</label>
                <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject</label>
                <input type="text" required value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Description</label>
                <textarea required rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Due Date</label>
                <input type="date" required value={formDue} onChange={(e) => setFormDue(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Grade</label>
                  <select value={formGrade} onChange={(e) => setFormGrade(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                    {["8", "9", "10", "11", "12"].map(g => <option key={g} value={g}>Class {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Section</label>
                  <select value={formSection} onChange={(e) => setFormSection(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none">
                    {["A", "B", "C", "D", "E"].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Attachment URL (optional)</label>
                <input type="text" value={formAttachmentUrl} onChange={(e) => setFormAttachmentUrl(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Saving..." : "Save Homework"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Announcements Tab ──────────────────────────────────────────────
function AnnouncementsTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTarget, setFormTarget] = useState("AllSchools");
  const [formSchoolId, setFormSchoolId] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetch = async () => {
    try { const res = await api.get("/announcements"); setItems(res.data || []); } catch (e) { console.error(e); }
  };
  useEffect(() => {
    fetch();
    api.get("/schools").then(res => setSchools(res.data || [])).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/announcements", { title: formTitle, body: formBody, target: formTarget, schoolId: formTarget === "SpecificSchool" ? formSchoolId || null : null, isPinned: formPinned });
      setMessage({ type: "success", text: "Announcement published." });
      setShowModal(false); setFormTitle(""); setFormBody(""); fetch();
    } catch (err: any) { setMessage({ type: "error", text: err.response?.data?.error || "Failed." }); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/announcements/${id}`); setMessage({ type: "success", text: "Deleted." }); fetch(); }
    catch (err: any) { setMessage({ type: "error", text: err.response?.data?.error || "Failed." }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#0e2a4d] text-lg">Announcements ({items.length})</h3>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20">
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? <p className="py-8 text-center text-sm text-[#5a7095]">No announcements yet.</p> : items.map((a) => (
          <div key={a.id} className={`glass-card flex items-start justify-between p-4 ${a.isPinned ? "border-l-4 border-l-amber-400" : ""}`}>
            <div>
              <div className="flex items-center gap-2">
                {a.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500" />}
                <span className="text-xs font-semibold text-[#2f6fed] bg-[#2f6fed]/8 rounded px-2 py-0.5">{a.target}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#0e2a4d]">{a.title}</p>
              <p className="mt-0.5 text-xs text-[#5a7095] line-clamp-2">{a.body}</p>
              <p className="mt-1 text-xs text-[#5a7095]/60">{formatDate(a.createdAt)}</p>
            </div>
            <button onClick={() => handleDelete(a.id, a.title)} className="ml-4 shrink-0 rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">New Announcement</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-[#5a7095]" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div><label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Title</label><input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10" /></div>
              <div><label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Body</label><textarea required rows={4} value={formBody} onChange={(e) => setFormBody(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10" /></div>
              <div><label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Target</label><select value={formTarget} onChange={(e) => setFormTarget(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"><option value="AllSchools">All Schools</option><option value="SpecificSchool">Specific School</option></select></div>
              {formTarget === "SpecificSchool" && <div><label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">School</label><select value={formSchoolId} onChange={(e) => setFormSchoolId(e.target.value)} className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"><option value="">Select school</option>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formPinned} onChange={(e) => setFormPinned(e.target.checked)} className="h-4 w-4 accent-[#2f6fed]" /><span className="text-sm font-medium text-[#0e2a4d]">Pin to top</span></label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Publishing..." : "Publish"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Requests Tab ────────────────────────────────────────────
function RequestsTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetch = async () => {
    try { const res = await api.get("/admin/custom-requests"); setRequests(res.data?.data || res.data || []); } catch (e) { console.error(e); }
  };
  useEffect(() => { fetch(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try { await api.patch(`/custom-requests/${id}`, { status }); setMessage({ type: "success", text: `Request marked ${status}.` }); fetch(); }
    catch (err: any) { setMessage({ type: "error", text: err.response?.data?.error || "Failed." }); }
  };

  const filtered = statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-[#0e2a4d] text-lg">All Custom Requests ({filtered.length})</h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#2f6fed]/15 bg-white/60 px-3 py-2 text-sm text-[#0e2a4d] outline-none">
          <option value="all">All</option>
          <option value="Open">Open</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[#2f6fed]/15 bg-white/80">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead><tr className="border-b border-[#2f6fed]/10 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-[#5a7095]"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Subject / Chapter</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#2f6fed]/5 text-sm">
            {filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[#5a7095]">No requests.</td></tr> : filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/30">
                <td className="px-4 py-3 text-xs"><div className="font-semibold text-[#0e2a4d]">{r.user?.name || "—"}</div><div className="text-[#5a7095]">{r.user?.email || ""}</div></td>
                <td className="px-4 py-3"><span className="rounded-md bg-[#8b5cf6]/10 px-2 py-0.5 text-xs font-semibold text-[#8b5cf6]">{r.type}</span></td>
                <td className="px-4 py-3 text-xs text-[#0e2a4d]">{r.subject}{r.chapter ? ` · ${r.chapter}` : ""}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${r.status === "Fulfilled" ? "bg-emerald-100 text-emerald-700" : r.status === "Closed" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#5a7095]">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.status !== "Fulfilled" && <button onClick={() => handleStatus(r.id, "Fulfilled")} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Fulfill</button>}
                    {r.status === "Open" && <button onClick={() => handleStatus(r.id, "Closed")} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">Close</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Renewals Tab ───────────────────────────────────────────────────
function RenewalsTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [renewals, setRenewals] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const fetch = async () => {
    try {
      let url = "/tokens/renewal";
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      setRenewals(res.data || []);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetch(); }, [statusFilter]);

  const handleStatus = async (id: string, status: string) => {
    try { await api.patch(`/tokens/renewal/${id}`, { status }); setMessage({ type: "success", text: `Request ${status}.` }); fetch(); }
    catch (err: any) { setMessage({ type: "error", text: err.response?.data?.error || "Failed." }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-[#0e2a4d] text-lg">Token Renewal Requests ({renewals.length})</h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#2f6fed]/15 bg-white/60 px-3 py-2 text-sm text-[#0e2a4d] outline-none">
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button onClick={fetch} className="rounded-xl border border-[#2f6fed]/15 bg-white px-3 py-2 text-sm font-semibold text-[#0e2a4d] hover:bg-slate-50">Refresh</button>
      </div>
      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[#2f6fed]/15 bg-white/80">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead><tr className="border-b border-[#2f6fed]/10 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-[#5a7095]"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Note</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#2f6fed]/5 text-sm">
            {renewals.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[#5a7095]">No renewal requests.</td></tr> : renewals.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/30">
                <td className="px-4 py-3 text-xs"><div className="font-semibold text-[#0e2a4d]">{r.user?.name || "—"}</div><div className="text-[#5a7095]">{r.user?.email || ""}</div></td>
                <td className="px-4 py-3"><span className="text-xs font-semibold text-[#2f6fed]">{r.plan}</span></td>
                <td className="px-4 py-3 text-xs text-[#5a7095] max-w-xs truncate">{r.note || "—"}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${r.status === "Approved" ? "bg-emerald-100 text-emerald-700" : r.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#5a7095]">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {r.status === "Pending" && (
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleStatus(r.id, "Approved")} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Approve</button>
                      <button onClick={() => handleStatus(r.id, "Rejected")} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Audit Log Tab ──────────────────────────────────────────────────
function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.get("/admin/audit-logs?pageSize=50")
      .then(res => setLogs(res.data?.data || res.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[#0e2a4d] text-lg">Audit Log (last 50)</h3>
      {isLoading ? (
        <p className="py-8 text-center text-sm text-[#5a7095]">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#5a7095]">No audit log entries.</p>
      ) : (
        <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-[#2f6fed]/15 bg-white/80">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead><tr className="border-b border-[#2f6fed]/10 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-[#5a7095]"><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Date</th></tr></thead>
            <tbody className="divide-y divide-[#2f6fed]/5 text-sm">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/30">
                  <td className="px-4 py-3 text-xs font-semibold text-[#0e2a4d]">{log.actorId || "System"}</td>
                  <td className="px-4 py-3"><span className="rounded-md bg-[#2f6fed]/8 px-2 py-0.5 text-xs font-semibold text-[#2f6fed]">{log.action}</span></td>
                  <td className="px-4 py-3 text-xs text-[#5a7095]">{log.meta || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5a7095]">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -- App Releases Tab ------------------------------------------------
function AppReleasesTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [releases, setReleases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    versionCode: 1,
    versionName: '1.0.0',
    releaseNotes: '',
    isMandatory: false,
    file: null as File | null
  });

  const fetchReleases = () => {
    setIsLoading(true);
    api.get('/api/appreleases')
      .then(res => setReleases(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setMessage({ type: 'error', text: 'Please select an APK file.' });
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('versionCode', formData.versionCode.toString());
    data.append('versionName', formData.versionName);
    data.append('releaseNotes', formData.releaseNotes);
    data.append('isMandatory', formData.isMandatory.toString());
    data.append('file', formData.file);

    try {
      await api.post('/api/appreleases', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'App release uploaded successfully!' });
      setShowModal(false);
      fetchReleases();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data || 'Failed to upload release.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this release? This cannot be undone.")) return;
    
    try {
      await api.delete(`/api/appreleases/${id}`);
      setMessage({ type: 'success', text: 'App release deleted successfully.' });
      fetchReleases();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.response?.data || 'Failed to delete release.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0e2a4d]">App Releases</h2>
          <p className="text-sm text-[#5a7095]">Manage OTA (Over-The-Air) updates for the mobile app.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2f6fed] to-[#0a4bbd] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" /> Upload Release
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-[#5a7095]">Loading releases...</div>
      ) : releases.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2f6fed]/10">
            <Download className="h-8 w-8 text-[#2f6fed]" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-[#0e2a4d]">No releases yet</h3>
          <p className="mt-2 text-sm text-[#5a7095]">Upload your first APK to distribute the app.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map((release) => (
            <div key={release.id} className="glass-card flex items-center justify-between p-4 border border-[#2f6fed]/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0e2a4d]">v{release.versionName}</span>
                  <span className="rounded bg-[#2f6fed]/10 px-2 py-0.5 text-xs font-semibold text-[#2f6fed]">Code: {release.versionCode}</span>
                  {release.isMandatory && (
                    <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">Mandatory</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#5a7095] max-w-3xl truncate">{release.releaseNotes}</p>
                <p className="mt-1 text-xs text-[#5a7095]/60">Uploaded {formatDate(release.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${(api.defaults.baseURL || '').replace(/\/api\/?$/, '').replace(/\/$/, '')}${release.fileUrl}`}
                  download
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
                <button
                  onClick={() => handleDelete(release.id)}
                  className="flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete Release"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-[#0e2a4d] mb-4">Upload App Release</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0e2a4d]">APK File</label>
                <input
                  type="file"
                  accept=".apk"
                  required
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-[#2f6fed] focus:outline-none focus:ring-1 focus:ring-[#2f6fed]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0e2a4d]">Version Name (e.g. 1.0.1)</label>
                  <input
                    type="text"
                    required
                    value={formData.versionName}
                    onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-[#2f6fed] focus:outline-none focus:ring-1 focus:ring-[#2f6fed]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0e2a4d]">Version Code (e.g. 2)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.versionCode}
                    onChange={(e) => setFormData({ ...formData, versionCode: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-[#2f6fed] focus:outline-none focus:ring-1 focus:ring-[#2f6fed]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0e2a4d]">Release Notes</label>
                <textarea
                  required
                  value={formData.releaseNotes}
                  onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-[#2f6fed] focus:outline-none focus:ring-1 focus:ring-[#2f6fed] h-24 resize-none"
                  placeholder="What's new in this version?"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMandatory"
                  checked={formData.isMandatory}
                  onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#2f6fed] focus:ring-[#2f6fed]"
                />
                <label htmlFor="isMandatory" className="text-sm text-gray-700">
                  Force users to update to this version
                </label>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#2f6fed] to-[#0a4bbd] py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <>Uploading... <RefreshCw className="h-4 w-4 animate-spin" /></>
                  ) : (
                    'Upload & Publish'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tokens Tab ──────────────────────────────────────────────────────
function TokensTab({ setMessage }: { setMessage: (m: any) => void }) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokens = () => {
    setIsLoading(true);
    api.get("/admin/tokens")
      .then(res => setTokens(res.data))
      .catch(err => {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load tokens." });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this token?")) return;
    try {
      await api.post(`/admin/tokens/${id}/revoke`);
      setMessage({ type: "success", text: "Token revoked successfully." });
      fetchTokens();
    } catch {
      setMessage({ type: "error", text: "Failed to revoke token." });
    }
  };

  const handleResetDevice = async (id: string) => {
    if (!confirm("Are you sure you want to reset the device for this token?")) return;
    try {
      await api.post(`/admin/tokens/${id}/reset-device`);
      setMessage({ type: "success", text: "Device reset successfully." });
      fetchTokens();
    } catch {
      setMessage({ type: "error", text: "Failed to reset device." });
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-[#5a7095]">Loading tokens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0e2a4d]">All Tokens</h2>
        <button onClick={fetchTokens} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#5a7095] hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[#5a7095]">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Expires At</th>
                <th className="px-6 py-4 font-semibold">Device ID</th>
                <th className="px-6 py-4 font-semibold">Location (IP)</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#5a7095]">No tokens generated yet.</td>
                </tr>
              ) : (
                tokens.map(token => (
                  <tr key={token.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-medium text-[#0e2a4d]">{token.code}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0e2a4d]">{token.userName}</div>
                      <div className="text-xs text-[#5a7095]">{token.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {["OneWeek", "OneMonth", "TwoMonths", "ThreeMonths", "SixMonths", "OneYear"][token.plan] || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {token.status === 0 && <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"><Clock className="h-3 w-3" /> Unused</span>}
                      {token.status === 1 && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Active</span>}
                      {token.status === 2 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"><AlertCircle className="h-3 w-3" /> Expired</span>}
                      {token.status === 3 && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" /> Revoked</span>}
                    </td>
                    <td className="px-6 py-4 text-[#5a7095]">
                      {token.expiresAt ? formatDate(token.expiresAt) : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {token.deviceId ? (
                        <div className="flex items-center gap-1.5 max-w-[120px] truncate" title={token.deviceId}>
                          <span className="truncate text-xs font-mono">{token.deviceId}</span>
                        </div>
                      ) : (
                        <span className="text-[#5a7095] italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[#5a7095]">
                      {token.ipAddress || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {token.deviceId && (
                          <button
                            onClick={() => handleResetDevice(token.id)}
                            className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                            title="Reset Device"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {token.status !== 3 && (
                          <button
                            onClick={() => handleRevoke(token.id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Revoke Token"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

