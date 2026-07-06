import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ClipboardList, Search, Calendar, Clock, AlertCircle, Plus, Edit2, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { differenceInDays, parseISO, format } from "date-fns";
import { School } from "@/lib/api-types";

export const Route = createFileRoute("/homework")({
  head: () => ({
    meta: [{ title: "Homework — StudyHub" }, { name: "description", content: "Manage your homework and assignments." }],
  }),
  component: HomeworkPage,
});

function HomeworkPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [homework, setHomework] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // Admin Filter States
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  // CRUD Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDue, setFormDue] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formGrade, setFormGrade] = useState("10");
  const [formSection, setFormSection] = useState("A");
  const [formTargetSchoolId, setFormTargetSchoolId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHomework = async () => {
    setIsLoading(true);
    setError("");
    try {
      let url = "/homework";
      if (selectedSchoolId) url += `?schoolId=${selectedSchoolId}`;
      const res = await api.get(url);
      setHomework(res.data.data || []);
      
      const uniqueSubjects = ["All", ...Array.from(new Set((res.data.data || []).map((h: any) => h.subject))) as string[]];
      setSubjects(uniqueSubjects);
    } catch (err: any) {
      setError("Failed to load homework assignments.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      api.get("/schools")
        .then(res => {
          setSchools(res.data);
          if (res.data.length > 0 && !selectedSchoolId) {
            setSelectedSchoolId(res.data[0].id);
          }
        })
        .catch(err => console.error(err));
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchHomework();
  }, [selectedSchoolId]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete assignment "${title}"?`)) return;
    try {
      await api.delete(`/homework/${id}`);
      fetchHomework();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormSubject("");
    setFormDesc("");
    setFormDue(format(new Date(), "yyyy-MM-dd"));
    setFormGrade("10");
    setFormSection("A");
    setFormTargetSchoolId(selectedSchoolId || user?.school_id || "");
    setShowModal(true);
  };

  const openEditModal = (hw: any) => {
    setEditingId(hw.id);
    setFormTitle(hw.title);
    setFormSubject(hw.subject);
    setFormDesc(hw.description);
    setFormDue(hw.dueAt ? hw.dueAt.substring(0, 10) : format(new Date(), "yyyy-MM-dd"));
    setFormGrade(hw.grade || "10");
    setFormSection(hw.section || "A");
    setFormTargetSchoolId(selectedSchoolId || user?.school_id || "");
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
      targetSchoolId: formTargetSchoolId || null
    };

    try {
      if (editingId) {
        await api.put(`/homework/${editingId}`, payload);
      } else {
        await api.post("/homework", payload);
      }
      setShowModal(false);
      fetchHomework();
    } catch (err: any) {
      alert(err.response?.data?.error || "Save assignment failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = homework
    .filter((h) => (subjectFilter === "All" ? true : h.subject === subjectFilter))
    .filter((h) =>
      search ? h.title.toLowerCase().includes(search.toLowerCase()) || h.subject.toLowerCase().includes(search.toLowerCase()) : true,
    );

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6fed] to-[#5b8def]">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Homework</h1>
            <p className="text-sm text-[#5a7095]">{filtered.length} assignments</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin School Filter */}
          {isAdmin && schools.length > 0 && (
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="rounded-xl border border-[#2f6fed]/15 bg-white px-4 py-2 text-sm text-[#0e2a4d] outline-none"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a7095]" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-xl border border-[#2f6fed]/15 bg-white/60 py-2 pl-9 pr-4 text-sm text-[#0e2a4d] placeholder:text-[#5a7095]/50 outline-none transition-all focus:border-[#2f6fed]"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-[#2f6fed]/15 bg-white/60 px-4 py-2 text-sm text-[#0e2a4d] outline-none"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Admin Add Homework */}
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Homework
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#5a7095]">Loading assignments...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No assignments yet" message="Homework will appear here once uploaded." />
      ) : (
        <div className="space-y-3">
          {filtered.map((hw) => {
            const daysUntil = differenceInDays(parseISO(hw.dueAt || hw.due_at), new Date());
            const urgencyClass =
              daysUntil < 2 ? "text-red-600" : daysUntil < 5 ? "text-amber-600" : "text-emerald-600";
            const urgencyLabel = daysUntil < 0 ? "Overdue" : daysUntil === 0 ? "Due today" : daysUntil === 1 ? "Due tomorrow" : `${daysUntil} days left`;

            return (
              <div key={hw.id} className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition-all duration-300 hover:glass-card-hover">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2f6fed]/8 text-[#2f6fed]">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[#0e2a4d]">{hw.title}</h3>
                    <p className="mt-1 text-xs text-[#5a7095]">
                      <span className="font-semibold">{hw.subject}</span> · {hw.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${urgencyClass}`}>
                        <Calendar className="h-3.5 w-3.5" />
                        {urgencyLabel} · Due {formatDate(hw.dueAt || hw.due_at)}
                      </div>
                      <div className="text-xs font-semibold text-[#2f6fed] bg-blue-50 px-2 py-0.5 rounded">
                        Class {hw.grade}{hw.section || ""}
                      </div>
                      {hw.assignedBy && (
                        <div className="flex items-center gap-1.5 text-xs text-[#5a7095]">
                          <Clock className="h-3.5 w-3.5" />
                          Assigned by {hw.assignedBy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEditModal(hw)}
                        className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hw.id, hw.title)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">{editingId ? "Edit Homework" : "Add Homework"}</h3>
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
                  placeholder="Calculus Limits Exercises"
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Mathematics"
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Description</label>
                <textarea
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Solve questions 1 to 15 on page 42."
                  rows={3}
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Due Date (YYYY-MM-DD)</label>
                <input
                  type="text"
                  required
                  value={formDue}
                  onChange={(e) => setFormDue(e.target.value)}
                  placeholder={format(new Date(), "yyyy-MM-dd")}
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>

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
                    {["A", "B", "C", "D", "E"].map((s) => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
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
                  className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : "Save Homework"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
