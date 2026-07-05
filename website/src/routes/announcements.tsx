import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Megaphone, Pin, Plus, Trash2, X, Check, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — StudyHub" },
      { name: "description", content: "School announcements and updates." },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTarget, setFormTarget] = useState<"AllSchools" | "SpecificSchool" | "SpecificClass">("AllSchools");
  const [formPinned, setFormPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [schools, setSchools] = useState<any[]>([]);
  const [formSchoolId, setFormSchoolId] = useState("");
  const [formGrade, setFormGrade] = useState("10");
  const [formSection, setFormSection] = useState("");

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    if (isAdmin) {
      api.get("/schools").then(res => setSchools(res.data || [])).catch(console.error);
    }
  }, [isAdmin]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete announcement "${title}"?`)) return;
    try {
      await api.delete(`/announcements/${id}`);
      setMessage({ type: "success", text: "Announcement deleted." });
      fetchAnnouncements();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Delete failed." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/announcements", {
        title: formTitle,
        body: formBody,
        target: formTarget,
        schoolId: (formTarget === "SpecificSchool" || formTarget === "SpecificClass") ? formSchoolId || null : null,
        isPinned: formPinned,
        grade: formTarget === "SpecificClass" ? formGrade : null,
        section: formTarget === "SpecificClass" ? formSection || null : null,
      });
      setMessage({ type: "success", text: "Announcement created." });
      setShowModal(false);
      setFormTitle("");
      setFormBody("");
      setFormGrade("10");
      setFormSection("");
      fetchAnnouncements();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to create announcement." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#f97316]">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Announcements</h1>
              <p className="text-sm text-[#5a7095]">{announcements.length} announcements</p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Announcement
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
          <div className="py-12 text-center text-[#5a7095]">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <EmptyState title="No announcements yet" message="Announcements from your school will appear here." />
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`glass-card p-5 transition-all duration-300 hover:glass-card-hover ${ann.isPinned ? "border-l-4 border-l-amber-400" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {ann.isPinned && (
                        <Pin className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                        ann.target === "AllSchools"
                          ? "bg-[#2f6fed]/8 text-[#2f6fed]"
                          : ann.target === "SpecificClass"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-purple-50 text-purple-700"
                      }`}>
                        {ann.target === "AllSchools"
                          ? "All Schools"
                          : ann.target === "SpecificClass"
                          ? `Class ${ann.grade}${ann.section || ""}`
                          : "This School"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-[family-name:var(--font-heading)] text-base font-semibold text-[#0e2a4d]">
                      {ann.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#5a7095] leading-relaxed">{ann.body}</p>
                    <p className="mt-2 text-xs text-[#5a7095]/60">{formatDate(ann.createdAt)}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(ann.id, ann.title)}
                      className="ml-4 shrink-0 rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
                <h3 className="font-bold text-[#0e2a4d] text-lg">New Announcement</h3>
                <button onClick={() => setShowModal(false)} className="text-[#5a7095] hover:text-[#0e2a4d]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Exam schedule update"
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Body</label>
                  <textarea
                    required
                    rows={4}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    placeholder="Write the announcement details..."
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Target</label>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value as any)}
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                  >
                    <option value="AllSchools">All Schools</option>
                    <option value="SpecificSchool">Specific School</option>
                    <option value="SpecificClass">Specific Class</option>
                  </select>
                </div>
                {(formTarget === "SpecificSchool" || formTarget === "SpecificClass") && schools.length > 0 && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">School</label>
                    <select
                      value={formSchoolId}
                      onChange={(e) => setFormSchoolId(e.target.value)}
                      className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                    >
                      <option value="">Select school</option>
                      {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                {formTarget === "SpecificClass" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Grade (Class)</label>
                      <select
                        value={formGrade}
                        onChange={(e) => setFormGrade(e.target.value)}
                        className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                      >
                        {["8", "9", "10", "11", "12"].map((g) => (
                          <option key={g} value={g}>Class {g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Section</label>
                      <select
                        value={formSection}
                        onChange={(e) => setFormSection(e.target.value)}
                        className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                      >
                        <option value="">All Sections</option>
                        {["A", "B", "C", "D", "E"].map((s) => (
                          <option key={s} value={s}>Section {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-[#2f6fed]/20 accent-[#2f6fed]"
                  />
                  <span className="text-sm font-medium text-[#0e2a4d]">Pin to top</span>
                </label>
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
                    className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isSubmitting ? "Publishing..." : "Publish"}
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
