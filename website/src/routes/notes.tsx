import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { BookOpen, Search, Eye, ArrowLeft, Folder, FileText, Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LockOverlay } from "@/components/ui/LockOverlay";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore, getTokenState } from "@/stores/auth";
import { api } from "@/lib/api";
import { School } from "@/lib/api-types";
import { SecureFileViewer } from "@/components/ui/SecureFileViewer";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [{ title: "Notes — StudyHub" }],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { user, token } = useAuthStore();
  const tokenState = getTokenState(token);
  const userRole = user?.role?.toLowerCase();
  const hasAccess = tokenState === "active" || userRole === "admin" || userRole === "teacher";
  const isAdmin = userRole === "admin";
  const isStudent = userRole === "student";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  // Navigation State
  const [viewLevel, setViewLevel] = useState<"classes" | "subjects" | "files">("classes");
  const [selectedClass, setSelectedClass] = useState<{ grade: string, section: string | null } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Viewer State
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerVisible, setViewerVisible] = useState(false);

  // Admin filter
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  const handleViewFile = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
    setViewerVisible(true);
  };

  useEffect(() => {
    if (isAdmin) {
      api.get("/admin/schools").then(res => {
        setSchools(res.data || []);
        if (res.data?.length > 0) setSelectedSchoolId(res.data[0].id);
      }).catch(console.error);
    } else {
      setSelectedSchoolId(user?.schoolId || "");
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (!selectedSchoolId) return;
    if (viewLevel === "classes" || viewLevel === "subjects") {
      fetchCatalog();
    } else if (viewLevel === "files" && selectedClass && selectedSubject) {
      fetchFiles();
    }
  }, [selectedSchoolId, viewLevel, selectedClass, selectedSubject]);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/catalog?schoolId=${selectedSchoolId}`);
      setCatalog(res.data || []);
    } catch {
      setError("Failed to load folders.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/notes?type=Note&schoolId=${selectedSchoolId}&grade=${selectedClass?.grade}&section=${selectedClass?.section || ""}&subject=${selectedSubject}`);
      setNotes(res.data.data || []);
    } catch {
      setError("Failed to load files.");
    } finally {
      setIsLoading(false);
    }
  };

  // Derived Views
  const uniqueClasses = Array.from(new Set(catalog.map(c => JSON.stringify({ grade: c.grade, section: c.section }))))
    .map(s => JSON.parse(s))
    .filter(c => isAdmin || c.grade === user?.grade)
    .sort((a, b) => parseInt(a.grade) - parseInt(b.grade));

  const subjectsForClass = catalog.filter(c => c.grade === selectedClass?.grade && c.section === selectedClass?.section);

  return (
    <AppShell>
      <div className="relative mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0e2a4d] font-[family-name:var(--font-heading)]">Notes & Resources</h1>
          <p className="mt-1 text-sm font-medium text-[#5a7095]">Browse structured notes, materials, and guides.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
             <label className="text-sm font-bold text-[#0e2a4d]">School:</label>
             <select value={selectedSchoolId} onChange={(e) => {
               setSelectedSchoolId(e.target.value);
               setViewLevel("classes");
               setSelectedClass(null);
               setSelectedSubject(null);
             }} className="rounded-xl border border-[#2f6fed]/15 bg-white px-3 py-2 text-sm text-[#0e2a4d] outline-none">
               {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
          </div>
        )}
      </div>

      <div className="relative min-h-[500px]">
        <LockOverlay isLocked={!hasAccess} message="Active StudyHub license required to access notes." />

        <div className="mb-6 flex items-center gap-3 bg-white p-3 rounded-xl border border-[#2f6fed]/15 shadow-sm">
           {viewLevel === "subjects" && (
             <button onClick={() => { setViewLevel("classes"); setSelectedClass(null); setSelectedSubject(null); }} className="p-2 hover:bg-slate-100 rounded-lg text-[#5a7095] transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </button>
           )}
           {viewLevel === "files" && (
             <button onClick={() => { setViewLevel("subjects"); setSelectedSubject(null); }} className="p-2 hover:bg-slate-100 rounded-lg text-[#5a7095] transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </button>
           )}
           
           <div className="font-semibold text-[#0e2a4d] flex items-center gap-2 text-sm sm:text-base">
              {viewLevel === "classes" && "All Classes"}
              {viewLevel === "subjects" && selectedClass && `Class ${selectedClass.grade}${selectedClass.section ? ` Sec ${selectedClass.section}` : ' (All Subjects)'}`}
              {viewLevel === "files" && selectedSubject && (
                <>
                  <span className="opacity-60 hidden sm:inline">Class {selectedClass?.grade} /</span>
                  <span>{selectedSubject} Notes</span>
                </>
              )}
           </div>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">{error}</div>}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : viewLevel === "classes" ? (
          // --- CLASSES FOLDER VIEW ---
          uniqueClasses.length === 0 ? (
            <EmptyState icon={Folder} title="No classes found" description="There are no structured notes available for this school yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uniqueClasses.map((c, idx) => {
                const subCount = catalog.filter(x => x.grade === c.grade && x.section === c.section).length;
                return (
                  <div key={idx} onClick={() => { setSelectedClass(c); setViewLevel("subjects"); }} className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-[#2f6fed] hover:shadow-lg hover:shadow-[#2f6fed]/10">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-3xl -mr-4 -mt-4 transition-colors group-hover:bg-[#2f6fed]/5" />
                    <div className="flex items-start justify-between mb-4">
                      <div className="rounded-xl bg-slate-100 p-3 text-slate-700 transition-colors group-hover:bg-[#2f6fed] group-hover:text-white">
                        <Folder className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0e2a4d]">
                      CLASS {c.grade} {c.section ? `SEC ${c.section}` : ''}
                    </h3>
                    <div className="mt-4 space-y-1 text-sm font-medium text-[#5a7095]">
                      <p>All Subjects</p>
                      <p>{subCount} folders inside</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : viewLevel === "subjects" ? (
          // --- SUBJECTS FOLDER VIEW ---
          subjectsForClass.length === 0 ? (
            <EmptyState icon={Folder} title="No subjects found" description="There are no subjects defined for this class." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjectsForClass.map((sub, idx) => (
                <div key={idx} onClick={() => { setSelectedSubject(sub.subject); setViewLevel("files"); }} className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-[#2f6fed] hover:shadow-lg hover:shadow-[#2f6fed]/10">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-3xl -mr-4 -mt-4 transition-colors group-hover:bg-[#2f6fed]/5" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-700 transition-colors group-hover:bg-[#2f6fed] group-hover:text-white">
                      <Folder className="h-6 w-6 fill-current opacity-20" />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold uppercase tracking-tight text-[#0e2a4d] line-clamp-2">
                    {sub.subject} NOTES
                  </h3>
                  <div className="mt-4 space-y-1.5 text-sm font-medium text-[#5a7095]">
                    <p>Item Count - {sub.itemCount}</p>
                    <p>Latest Update: {sub.latestUpdate ? formatDate(sub.latestUpdate) : 'Never'}</p>
                    <p className="pt-2 text-xs font-bold uppercase tracking-wider text-emerald-600">Status - Active</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // --- FILES VIEW ---
          notes.length === 0 ? (
            <EmptyState icon={FileText} title="Empty Folder" description="No files have been uploaded to this section yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-100 bg-white transition-all hover:border-[#2f6fed]/30 hover:shadow-xl hover:shadow-[#2f6fed]/5">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0e2a4d] line-clamp-2">{note.title}</h3>
                    <p className="mt-1 text-sm font-medium text-[#5a7095]">{note.chapter}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-[#5a7095]">
                      <span>{formatDate(note.createdAt)}</span>
                      <span>By {note.uploader}</span>
                    </div>
                  </div>
                  <div className="flex border-t-2 border-slate-100 bg-slate-50/50 p-2">
                    <button onClick={() => handleViewFile(note.fileUrl, note.title)} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-[#2f6fed] hover:bg-white hover:shadow-sm transition-all">
                      <Eye className="h-4 w-4" /> View Note
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <SecureFileViewer url={viewerUrl} title={viewerTitle} visible={viewerVisible} onClose={() => setViewerVisible(false)} />
    </AppShell>
  );
}
