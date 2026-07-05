import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, Plus, X, Check, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/custom-requests")({
  head: () => ({
    meta: [
      { title: "Custom Requests — StudyHub" },
      { name: "description", content: "Request notes, homework solutions, and past papers." },
    ],
  }),
  component: CustomRequestsPage,
});

const REQUEST_TYPES = [
  { value: "Note", label: "Note" },
  { value: "Homework", label: "Homework" },
  { value: "PastPaper", label: "Past Paper (PYQ)" },
  { value: "TopperNote", label: "Topper Note" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  Open: { label: "Open", color: "bg-blue-100 text-blue-700", Icon: Clock },
  Fulfilled: { label: "Fulfilled", color: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2 },
  Closed: { label: "Closed", color: "bg-slate-100 text-slate-600", Icon: XCircle },
};

function CustomRequestsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState("Note");
  const [formSubject, setFormSubject] = useState("");
  const [formChapter, setFormChapter] = useState("");
  const [formNote, setFormNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(isAdmin ? "/admin/custom-requests" : "/custom-requests/my");
      setRequests(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/custom-requests", {
        type: formType,
        subject: formSubject,
        chapter: formChapter,
        note: formNote,
      });
      setMessage({ type: "success", text: "Request submitted successfully! We'll get back to you soon." });
      setShowModal(false);
      setFormType("Note");
      setFormSubject("");
      setFormChapter("");
      setFormNote("");
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to submit request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/custom-requests/${id}`, { status });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update status." });
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">
                {isAdmin ? "All Requests" : "My Requests"}
              </h1>
              <p className="text-sm text-[#5a7095]">
                {isAdmin ? "Manage all custom content requests" : "Request specific study materials from your school"}
              </p>
            </div>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-purple-500/20 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Request
            </button>
          )}
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`flex items-center gap-3 rounded-xl border p-4 ${message.type === "success" ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-800" : "border-red-500/20 bg-red-500/8 text-red-800"}`}>
            {message.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
            <button className="ml-auto opacity-70 hover:opacity-100" onClick={() => setMessage(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-[#5a7095]">Loading requests...</div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            message={isAdmin ? "No custom requests submitted." : "Submit a request for notes, homework, or past papers you need."}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Open;
              const StatusIcon = statusCfg.Icon;
              return (
                <div key={req.id} className="glass-card p-5 transition-all duration-300 hover:glass-card-hover">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block rounded-md bg-[#8b5cf6]/10 px-2 py-0.5 text-xs font-semibold text-[#8b5cf6]">
                          {REQUEST_TYPES.find(t => t.value === req.type)?.label || req.type}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${statusCfg.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                      <h3 className="mt-2 font-[family-name:var(--font-heading)] text-sm font-semibold text-[#0e2a4d]">
                        {req.subject}{req.chapter ? ` · ${req.chapter}` : ""}
                      </h3>
                      {req.note && (
                        <p className="mt-1 text-xs text-[#5a7095]">{req.note}</p>
                      )}
                      <p className="mt-2 text-xs text-[#5a7095]/60">{formatDate(req.createdAt)}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 ml-4">
                        {req.status !== "Fulfilled" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "Fulfilled")}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        {req.status === "Open" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "Closed")}
                            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
                <h3 className="font-bold text-[#0e2a4d] text-lg">New Content Request</h3>
                <button onClick={() => setShowModal(false)} className="text-[#5a7095] hover:text-[#0e2a4d]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Request Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                  >
                    {REQUEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Chapter / Topic</label>
                  <input
                    type="text"
                    required
                    value={formChapter}
                    onChange={(e) => setFormChapter(e.target.value)}
                    placeholder="e.g. Thermodynamics"
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Additional Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Any additional context or preferences..."
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
