import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileText, Search, Eye, Calendar, Plus, Edit2, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LockOverlay } from "@/components/ui/LockOverlay";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore, getTokenState } from "@/stores/auth";
import { api } from "@/lib/api";
import { School } from "@/lib/api-types";
import { SecureFileViewer } from "@/components/ui/SecureFileViewer";

export const Route = createFileRoute("/past-papers")({
  head: () => ({
    meta: [{ title: "Past Papers — StudyHub" }, { name: "description", content: "Browse and download past exam papers." }],
  }),
  component: PastPapersPage,
});

function PastPapersPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [papers, setPapers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>(["All"]);
  const [years, setYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerVisible, setViewerVisible] = useState(false);

  const handleViewFile = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
    setViewerVisible(true);
  };

  const { user, token } = useAuthStore();
  const tokenState = getTokenState(token);
  const hasAccess = tokenState === "active" || user?.role === "admin" || user?.role === "teacher";
  const isAdmin = user?.role === "admin";

  // Admin Filter States
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  // CRUD Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubject, setFormSubject] = useState("");
  const [formYear, setFormYear] = useState("2024");
  const [formTerm, setFormTerm] = useState("First");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formGrade, setFormGrade] = useState("10");
  const [formSection, setFormSection] = useState("");
  const [formTargetSchoolId, setFormTargetSchoolId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPapers = async () => {
    setIsLoading(true);
    setError("");
    try {
      let url = "/past-papers";
      if (selectedSchoolId) url += `?schoolId=${selectedSchoolId}`;
      const res = await api.get(url);
      const data = res.data || [];
      setPapers(data);
      
      const uniqueSubjects = ["All", ...Array.from(new Set(data.map((p: any) => p.subject))) as string[]];
      setSubjects(uniqueSubjects);
      
      const uniqueYears = Array.from(new Set(data.map((p: any) => p.year))) as number[];
      setYears(uniqueYears.sort((a, b) => b - a));
    } catch (err: any) {
      setError("Failed to load past papers.");
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
    fetchPapers();
  }, [selectedSchoolId]);

  const handleDelete = async (id: string, subject: string) => {
    if (!confirm(`Are you sure you want to delete ${subject} exam paper?`)) return;
    try {
      await api.delete(`/past-papers/${id}`);
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormSubject("");
    setFormYear("2024");
    setFormTerm("First");
    setFormFileUrl("");
    setFormGrade("10");
    setFormSection("");
    setFormTargetSchoolId(selectedSchoolId || user?.school_id || "");
    setShowModal(true);
  };

  const openEditModal = (paper: any) => {
    setEditingId(paper.id);
    setFormSubject(paper.subject);
    setFormYear(String(paper.year));
    setFormTerm(paper.term);
    setFormFileUrl(paper.fileUrl || "");
    setFormGrade(paper.grade || "10");
    setFormSection(paper.section || "");
    setFormTargetSchoolId(selectedSchoolId || user?.school_id || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      subject: formSubject,
      year: parseInt(formYear) || 2024,
      term: formTerm,
      fileUrl: formFileUrl,
      grade: formGrade || null,
      section: formSection || null,
      targetSchoolId: formTargetSchoolId || null
    };

    try {
      if (editingId) {
        await api.put(`/past-papers/${editingId}`, payload);
      } else {
        await api.post("/past-papers", payload);
      }
      setShowModal(false);
      fetchPapers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Save past paper failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = papers
    .filter((p) => (subjectFilter === "All" ? true : p.subject === subjectFilter))
    .filter((p) => (search ? p.subject.toLowerCase().includes(search.toLowerCase()) || p.term.toLowerCase().includes(search.toLowerCase()) : true));

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5b8def] to-[#2f6fed]">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Past Papers</h1>
            <p className="text-sm text-[#5a7095]">{filtered.length} papers available</p>
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
              placeholder="Search papers..."
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

          {/* Admin Add Past Paper */}
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Paper
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#5a7095]">Loading exam archives...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No past papers yet" message="Past papers will appear here once uploaded." />
      ) : (
        years.map((year) => {
          const yearPapers = filtered.filter((p) => p.year === year);
          if (yearPapers.length === 0) return null;
          return (
            <div key={year} className="mb-6">
              <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">{year}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {yearPapers.map((paper) => (
                  <div key={paper.id} className="glass-card relative overflow-hidden p-5 transition-all duration-300 hover:glass-card-hover">
                    {!hasAccess && <LockOverlay />}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block rounded-md bg-[#2f6fed]/8 px-2 py-0.5 text-xs font-semibold text-[#2f6fed]">
                          {paper.subject}
                        </span>
                        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-sm font-semibold text-[#0e2a4d]">
                          {paper.term} Exam
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#5a7095]">
                          <span className="font-semibold text-[#2f6fed]">
                            {paper.grade ? `Class ${paper.grade}${paper.section || ""}` : "All Classes"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[#5a7095]">
                        <Calendar className="h-3.5 w-3.5" />
                        {paper.year}
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(paper)}
                              className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(paper.id, paper.subject)}
                              className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {hasAccess && paper.fileUrl && (
                          <button
                            onClick={() => handleViewFile(paper.fileUrl, `${paper.subject} (${paper.year} ${paper.term})`)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#2f6fed]/8 px-3 py-1.5 text-xs font-semibold text-[#2f6fed] hover:bg-[#2f6fed]/15 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">{editingId ? "Edit Past Paper" : "Add Past Paper"}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#5a7095] hover:text-[#0e2a4d]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Science"
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Year</label>
                <input
                  type="number"
                  required
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  placeholder="2024"
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Term</label>
                <select
                  value={formTerm}
                  onChange={(e) => setFormTerm(e.target.value)}
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                >
                  <option value="First">First Term</option>
                  <option value="Second">Second Term</option>
                  <option value="Third">Third Term</option>
                  <option value="Final">Final Exam</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">File URL</label>
                <input
                  type="text"
                  required
                  value={formFileUrl}
                  onChange={(e) => setFormFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
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
                    <option value="">All Classes</option>
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
                  {isSubmitting ? "Saving..." : "Save Paper"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SecureFileViewer
        visible={viewerVisible}
        url={viewerUrl}
        title={viewerTitle}
        onClose={() => setViewerVisible(false)}
      />
    </AppShell>
  );
}
