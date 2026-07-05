import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, KeyRound, Monitor, Clock, Send, RefreshCw, Check, AlertCircle, X, History } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore, getTokenState, getTokenDaysRemaining } from "@/stores/auth";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — StudyHub" },
      { name: "description", content: "Manage your account and access token." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, token, deviceId, logout, setToken, setAccessToken } = useAuthStore();
  const tokenState = getTokenState(token);
  const daysLeft = getTokenDaysRemaining(token);


  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Token activation
  const [activateCode, setActivateCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isBinding, setIsBinding] = useState(false);

  // Token renewal request
  const [renewalPlan, setRenewalPlan] = useState("OneMonth");
  const [renewalReason, setRenewalReason] = useState("");
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [isRequestingRenewal, setIsRequestingRenewal] = useState(false);
  const [renewalRequests, setRenewalRequests] = useState<any[]>([]);

  // Profile editing
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<any>(null);

  const schoolName = profileData?.school?.name
    || (typeof user?.school === "string" ? user.school : (user?.school as any)?.name)
    || user?.school_name
    || "—";

  useEffect(() => {
    if (user) {
      setIsLoadingProfile(true);
      api.get("/profile")
        .then(res => setProfileData(res.data))
        .catch(console.error)
        .finally(() => setIsLoadingProfile(false));

      api.get("/tokens/renewal/my")
        .then(res => setRenewalRequests(res.data?.data || res.data || []))
        .catch(console.error);

      if (String(user.role || "").toLowerCase() === "student") {
        api.get("/tokens/me")
          .then(res => setTokenStatus(res.data))
          .catch(console.error);
      }
    }
  }, [user]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateCode.trim()) return;
    setIsActivating(true);
    setMessage(null);
    try {
      const res = await api.post("/tokens/activate", { code: activateCode.trim() });
      setToken(res.data?.token || null);
      if (res.data?.accessToken) setAccessToken(res.data.accessToken);
      setMessage({ type: "success", text: "Token activated successfully! Your access is now unlocked." });
      setActivateCode("");
      
      // Refresh token status
      api.get("/tokens/me")
        .then(res => setTokenStatus(res.data))
        .catch(console.error);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Invalid or already-used token code." });
    } finally {
      setIsActivating(false);
    }
  };

  const handleActivatePending = async () => {
    if (!tokenStatus?.pendingCode) return;
    setIsActivating(true);
    setMessage(null);
    try {
      const res = await api.post("/tokens/activate", { code: tokenStatus.pendingCode });
      setToken(res.data?.token || null);
      if (res.data?.accessToken) setAccessToken(res.data.accessToken);
      setMessage({ type: "success", text: "Token activated successfully! Your access is now unlocked." });
      
      // Refresh token status
      api.get("/tokens/me")
        .then(res => setTokenStatus(res.data))
        .catch(console.error);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to activate pending token." });
    } finally {
      setIsActivating(false);
    }
  };

  const handleBindPermanent = async () => {
    setIsBinding(true);
    setMessage(null);
    try {
      const res = await api.post("/tokens/bind-permanent");
      setToken({
        ...token!,
        is_device_permanent: true,
        can_bind_permanent: false,
        device_id: res.data.deviceId
      });
      setMessage({ type: "success", text: "Device bound permanently to your account! You can now access it on any network." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to bind device permanently." });
    } finally {
      setIsBinding(false);
    }
  };

  const handleRenewalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestingRenewal(true);
    setMessage(null);
    try {
      await api.post("/tokens/renewal", { plan: renewalPlan, note: renewalReason });
      setMessage({ type: "success", text: "Renewal request submitted. Your admin will review it shortly." });
      setShowRenewalForm(false);
      setRenewalReason("");
      // Refresh renewal requests
      const res = await api.get("/tokens/renewal/my");
      setRenewalRequests(res.data?.data || res.data || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to submit renewal request." });
    } finally {
      setIsRequestingRenewal(false);
    }
  };

  const planLabel = (plan: string) => {
    const map: Record<string, string> = {
      OneWeek: "1 Week", OneMonth: "1 Month", TwoMonths: "2 Months",
      ThreeMonths: "3 Months", SixMonths: "6 Months", OneYear: "1 Year",
      "1m": "1 Month", "3m": "3 Months", "6m": "6 Months", "1y": "1 Year",
    };
    return map[plan] || plan;
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-black bg-black">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-black">Profile</h1>
          <p className="text-sm text-gray-500 font-medium">Account and token settings</p>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`mb-4 flex items-center gap-3 border p-4 ${message.type === "success" ? "border-black bg-gray-50 text-black" : "border-red-500 bg-white text-red-600"}`}>
          {message.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span className="text-sm font-bold">{message.text}</span>
          <button className="ml-auto opacity-70 hover:opacity-100" onClick={() => setMessage(null)}>
            <X className="h-4 w-4 text-black" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Account Info */}
          <div className="glass-card p-6">
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold text-black">Account</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", value: user?.name || "—" },
                { label: "Email", value: user?.email || "—" },
                { label: "School", value: schoolName },
                { label: "Grade", value: user?.grade ? `Class ${user.grade} ${user.section || ""}` : "—" },
                { label: "Role", value: user?.role ? (typeof user.role === 'number' ? ["Student", "Teacher", "TopperContributor", "Admin"][user.role] : String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1).toLowerCase()) : "—" },
                { label: "Joined", value: (user?.createdAt || user?.created_at) ? formatDate(user.createdAt || user.created_at!) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="mb-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">{label}</label>
                  <p className="mt-1 text-sm font-semibold text-black">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Device */}
          <div className="glass-card p-6">
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold text-black">Device</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-black bg-gray-50 text-black">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">Current device</p>
                <p className="mt-0.5 text-xs font-[family-name:var(--font-mono)] font-semibold text-gray-500">{deviceId || "Not registered"}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium leading-relaxed text-gray-600">
              Your access token is locked to this device. If you switch devices, contact your school admin to reset the device lock.
            </p>
            {token && token.can_bind_permanent && (
              <button
                onClick={handleBindPermanent}
                disabled={isBinding}
                className="saas-button w-full mt-4"
              >
                <Monitor className="mr-2 h-4 w-4" />
                {isBinding ? "Registering..." : "Register Device Permanently"}
              </button>
            )}
          </div>

          {/* Token Activation (if no active token) */}
          {String(user?.role || "").toLowerCase() === "student" && tokenState !== "active" && (
            <div className="space-y-6">
              {tokenStatus?.hasPendingToken && (
                <div className="border border-black bg-white p-5 text-sm">
                  <div className="flex items-center gap-2 font-bold text-black">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Pending Token Found
                  </div>
                  <p className="mt-2 text-xs text-gray-600 font-medium leading-relaxed">
                    You have an unused token waiting: <span className="font-[family-name:var(--font-mono)] font-bold text-black tracking-wider">{tokenStatus.pendingCode}</span> ({planLabel(tokenStatus.pendingPlan)} Plan).
                  </p>
                  <button
                    onClick={handleActivatePending}
                    disabled={isActivating}
                    className="saas-button mt-4"
                  >
                    <Send className="mr-2 h-3 w-3" />
                    {isActivating ? "Activating..." : "Activate Pending Token"}
                  </button>
                </div>
              )}

              <div className="glass-card p-6">
                <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold text-black">Activate Token</h2>
                <p className="mb-4 text-sm font-medium text-gray-600">
                  Enter your access token code provided by your school admin to unlock full access.
                </p>
                <form onSubmit={handleActivate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={activateCode}
                    onChange={(e) => setActivateCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SH-XXXX-YYYY"
                    className="saas-input flex-1 font-[family-name:var(--font-mono)] tracking-widest uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isActivating || !activateCode.trim()}
                    className="saas-button"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isActivating ? "Activating..." : "Activate"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Token Renewal Requests */}
          {String(user?.role || "").toLowerCase() === "student" && renewalRequests.length > 0 && (
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-black" />
                <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-black">Renewal Requests</h2>
              </div>
              <div className="space-y-3">
                {renewalRequests.map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between border border-gray-200 bg-white px-4 py-3 text-sm">
                    <div>
                      <span className={`inline-block border px-2 py-0.5 text-xs font-bold ${req.status === "Approved" ? "border-green-600 text-green-700 bg-green-50" : req.status === "Rejected" ? "border-red-600 text-red-700 bg-red-50" : "border-black text-black bg-gray-50"}`}>
                        {req.status}
                      </span>
                      <p className="mt-2 text-xs font-semibold text-gray-500">{formatDate(req.createdAt)}</p>
                    </div>
                    {req.reason && <p className="text-xs font-medium text-gray-600 max-w-[150px] truncate">{req.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Access Token Card */}
          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-black" />
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-black">Access Token</h2>
            </div>

            {tokenState === "active" ? (
              <div className="space-y-5">
                <div className="border border-green-600 bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                    <div className="h-2 w-2 animate-pulse bg-green-600" />
                    Token active
                  </div>
                  <p className="mt-1 text-xs font-semibold text-green-700">{daysLeft} days remaining</p>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Token code</label>
                  <p className="mt-1 font-[family-name:var(--font-mono)] text-sm font-bold text-black">{token?.code}</p>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Plan</label>
                  <p className="mt-1 text-sm font-bold text-black">{token?.plan ? planLabel(token.plan) : "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-gray-500">Expires</label>
                  <p className="mt-1 text-sm font-bold text-black">{token ? formatDate(token.expires_at) : "—"}</p>
                </div>
                {daysLeft <= 7 && (
                  <div className="pt-2">
                    {!showRenewalForm ? (
                      <button
                        onClick={() => setShowRenewalForm(true)}
                        className="saas-button-outline w-full"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request renewal
                      </button>
                    ) : (
                      <form onSubmit={handleRenewalRequest} className="space-y-3">
                        <textarea
                          value={renewalReason}
                          onChange={(e) => setRenewalReason(e.target.value)}
                          placeholder="Why do you need a renewal? (optional)"
                          rows={3}
                          className="saas-input w-full"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowRenewalForm(false)} className="saas-button-outline flex-1 text-xs">Cancel</button>
                          <button type="submit" disabled={isRequestingRenewal} className="saas-button flex-1 text-xs">
                            {isRequestingRenewal ? "..." : "Submit"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border border-black bg-gray-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <Clock className="h-4 w-4" />
                    {tokenState === "expired" ? "Token expired" : "No active token"}
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-600 leading-relaxed">
                    {tokenState === "expired"
                      ? "Your access expired. Activate a new token or request renewal."
                      : "Contact your admin to purchase a plan and receive an access token."}
                  </p>
                </div>

                <div className="border border-black bg-white p-5">
                  <h3 className="mb-4 text-sm font-bold tracking-widest uppercase text-black">Buy a Package</h3>
                  <p className="mb-4 text-xs font-medium text-gray-600 leading-relaxed">
                    Message us directly on WhatsApp or Instagram to purchase an access token and unlock all study materials!
                  </p>
                  <div className="space-y-3">
                    <a
                      href="https://wa.me/9779800000000" // Replace with actual WhatsApp number
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-black bg-[#25d366] px-4 py-3 text-white transition-transform hover:-translate-y-0.5"
                    >
                      <span className="font-bold text-sm">Message on WhatsApp</span>
                      <span className="font-bold">→</span>
                    </a>
                    <a
                      href="https://instagram.com/studyhub" // Replace with actual Instagram profile
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-black bg-[#e1306c] px-4 py-3 text-white transition-transform hover:-translate-y-0.5"
                    >
                      <span className="font-bold text-sm">DM on Instagram</span>
                      <span className="font-bold">→</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full saas-button-outline border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
          >
            Log out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
