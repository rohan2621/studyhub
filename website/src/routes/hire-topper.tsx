import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GraduationCap, Users, Calendar, MessageSquare, Send, Check, X, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/hire-topper")({
  head: () => ({
    meta: [
      { title: "Hire Topper — StudyHub" },
      { name: "description", content: "Hire topper students of your section to teach you." },
    ],
  }),
  component: HireTopperPage,
});

function HireTopperPage() {
  const { user } = useAuthStore();
  const isTopper = user?.role === "toppercontributor";

  const [toppers, setToppers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoadingToppers, setIsLoadingToppers] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Hire Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTopper, setSelectedTopper] = useState<any>(null);
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchToppers = async () => {
    if (isTopper) return; // Toppers don't need to hire other toppers
    setIsLoadingToppers(true);
    try {
      const res = await api.get("/hire/toppers");
      setToppers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingToppers(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await api.get("/hire/requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchToppers();
    fetchRequests();
  }, [user]);

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopper) return;
    setIsSubmitting(true);
    try {
      await api.post("/hire", {
        topperId: selectedTopper.id,
        subject: formSubject,
        message: formMessage,
      });
      setMessage({ type: "success", text: `Tutoring offer sent to ${selectedTopper.name}!` });
      setShowModal(false);
      setFormSubject("");
      setFormMessage("");
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to submit request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    try {
      await api.post(`/hire/${requestId}/respond`, { accept });
      setMessage({ type: "success", text: `Request ${accept ? "accepted" : "declined"} successfully!` });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to respond to request." });
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">
              {isTopper ? "Tutoring Offers Received" : "Hire Section Topper"}
            </h1>
            <p className="text-sm text-[#5a7095]">
              {isTopper 
                ? "Help your peers with difficult subjects and earn rewards." 
                : "Select a high-performing student in your section to help you study."}
            </p>
          </div>
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

        {/* Topper selection grid for students */}
        {!isTopper && (
          <div>
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">
              Available Toppers in your Section
            </h2>
            {isLoadingToppers ? (
              <div className="py-8 text-center text-[#5a7095]">Loading toppers...</div>
            ) : toppers.length === 0 ? (
              <EmptyState title="No toppers found" message="No topper contributors are currently registered in your section." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {toppers.map((topper) => (
                  <div key={topper.id} className="glass-card p-5 space-y-4 flex flex-col justify-between transition-all duration-300 hover:glass-card-hover">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f6fed]/10 text-[#2f6fed] font-bold text-lg">
                        {topper.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0e2a4d]">{topper.name}</h3>
                        <p className="text-xs text-[#5a7095]">{topper.email}</p>
                        <span className="inline-block mt-1 rounded bg-[#2f6fed]/8 px-2 py-0.5 text-[10px] font-bold text-[#2f6fed]">
                          Class {topper.grade}{topper.section} Topper
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedTopper(topper); setShowModal(true); }}
                      className="w-full rounded-xl gradient-primary py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
                    >
                      Hire for Tutoring
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tutoring Offers / History Section */}
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">
            {isTopper ? "Tutoring Invitations" : "Tutoring Request History"}
          </h2>
          {isLoadingRequests ? (
            <div className="py-8 text-center text-[#5a7095]">Loading requests...</div>
          ) : requests.length === 0 ? (
            <EmptyState 
              title={isTopper ? "No tutoring invitations yet" : "No requests sent yet"} 
              message={isTopper ? "New study invites from your section peers will appear here." : "Hire a topper above to start tutoring."} 
            />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:glass-card-hover">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-block rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-xs font-semibold border border-purple-200">
                        {req.subject}
                      </span>
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold border ${
                        req.status === "Accepted" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : req.status === "Declined" 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-[#5a7095]/60 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(req.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-[#0e2a4d]">
                      {isTopper 
                        ? `Offered by: ${req.student.name} (${req.student.email})` 
                        : `Topper: ${req.topper.name} (${req.topper.email})`}
                    </p>
                    <p className="text-xs text-[#5a7095] leading-relaxed italic">
                      "{req.message}"
                    </p>
                  </div>

                  {/* Accept/Decline options for toppers */}
                  {isTopper && req.status === "Pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRespond(req.id, true)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, false)}
                        className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <X className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hire Modal */}
        {showModal && selectedTopper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
                <h3 className="font-bold text-[#0e2a4d] text-lg">Hire {selectedTopper.name}</h3>
                <button onClick={() => setShowModal(false)} className="text-[#5a7095] hover:text-[#0e2a4d]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleHireSubmit} className="p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Science, Mathematics"
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Describe what chapters or topics you need help with..."
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
                    className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmitting ? "Sending offer..." : "Send Request"}
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
