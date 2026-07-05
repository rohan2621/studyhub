import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarDays, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { School } from "@/lib/api-types";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [{ title: "Timetable — StudyHub" }, { name: "description", content: "View your weekly class schedule." }],
  }),
  component: TimetablePage,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

function TimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // Admin Filter States
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [adminGrade, setAdminGrade] = useState("10");
  const [adminSection, setAdminSection] = useState("A");

  // CRUD Modal States
  const [showModal, setShowModal] = useState(false);
  const [formDay, setFormDay] = useState("Monday");
  const [formPeriod, setFormPeriod] = useState("1");
  const [formSubject, setFormSubject] = useState("");
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("10:00");
  const [formGrade, setFormGrade] = useState("10");
  const [formSection, setFormSection] = useState("A");
  const [formTargetSchoolId, setFormTargetSchoolId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTimetable = async () => {
    setIsLoading(true);
    setError("");
    try {
      let url = "/timetable";
      if (selectedSchoolId) {
        url += `?schoolId=${selectedSchoolId}&grade=${adminGrade}&section=${adminSection}`;
      }
      const res = await api.get(url);
      setTimetable(res.data || []);
    } catch (err: any) {
      setError("Failed to load timetable.");
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
    fetchTimetable();
  }, [selectedSchoolId, adminGrade, adminSection]);

  const handleDelete = async (id: string, subject: string) => {
    if (!confirm(`Are you sure you want to delete the slot for "${subject}"?`)) return;
    try {
      await api.delete(`/timetable/${id}`);
      fetchTimetable();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setFormDay("Monday");
    setFormPeriod("1");
    setFormSubject("");
    setFormStart("09:00");
    setFormEnd("10:00");
    setFormGrade(adminGrade);
    setFormSection(adminSection);
    setFormTargetSchoolId(selectedSchoolId || user?.school_id || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      day: formDay,
      period: parseInt(formPeriod) || 1,
      subject: formSubject,
      startTime: formStart.includes(":") && formStart.split(":").length === 2 ? `${formStart}:00` : formStart,
      endTime: formEnd.includes(":") && formEnd.split(":").length === 2 ? `${formEnd}:00` : formEnd,
      grade: formGrade,
      section: formSection,
      targetSchoolId: formTargetSchoolId || null
    };

    try {
      await api.post("/timetable", payload);
      setShowModal(false);
      fetchTimetable();
    } catch (err: any) {
      alert(err.response?.data?.error || "Save slot failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#38bdf8] to-[#5b8def]">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Timetable</h1>
            <p className="text-sm text-[#5a7095]">
              {isAdmin ? `Class ${adminGrade}${adminSection} schedule` : `Class ${user?.grade || ""}${user?.section || ""} weekly schedule`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Filters */}
          {isAdmin && (
            <>
              {schools.length > 0 && (
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

              <select
                value={adminGrade}
                onChange={(e) => setAdminGrade(e.target.value)}
                className="rounded-xl border border-[#2f6fed]/15 bg-white px-4 py-2 text-sm text-[#0e2a4d] outline-none"
              >
                {["8", "9", "10", "11", "12"].map((g) => (
                  <option key={g} value={g}>Class {g}</option>
                ))}
              </select>

              <select
                value={adminSection}
                onChange={(e) => setAdminSection(e.target.value)}
                className="rounded-xl border border-[#2f6fed]/15 bg-white px-4 py-2 text-sm text-[#0e2a4d] outline-none"
              >
                {["A", "B", "C", "D", "E"].map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Slot
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#5a7095]">Loading schedule...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : timetable.length === 0 ? (
        <EmptyState title="No schedule slots created yet" message="Weekly slots will appear here once added." />
      ) : (
        <div className="glass-card overflow-x-auto p-6 border border-[#2f6fed]/15">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-6 gap-3 mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5a7095] px-2 py-1">Period</div>
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-[#0e2a4d] py-1 bg-slate-50 rounded-lg border border-slate-100">
                  {day}
                </div>
              ))}
            </div>

            {PERIODS.map((period) => (
              <div key={period} className="grid grid-cols-6 gap-3 py-1.5 items-center">
                <div className="flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100/50 py-3 text-xs font-bold text-[#5a7095]">
                  Period {period}
                </div>
                {DAYS.map((day) => {
                  const slot = timetable.find((t) => t.day === day && t.period === period);
                  return (
                    <div
                      key={`${day}-${period}`}
                      className={`relative group rounded-xl px-3 py-3 text-center text-xs font-medium border transition-all ${
                        slot 
                          ? "bg-[#2f6fed]/8 text-[#2f6fed] border-[#2f6fed]/20 hover:bg-[#2f6fed]/12" 
                          : "bg-slate-50/20 text-[#5a7095]/40 border-dashed border-slate-200"
                      }`}
                    >
                      {slot ? (
                        <>
                          <div className="font-semibold text-sm">{slot.subject}</div>
                          <div className="mt-0.5 text-[10px] opacity-80">
                            {slot.startTime ? slot.startTime.substring(0, 5) : ""} – {slot.endTime ? slot.endTime.substring(0, 5) : ""}
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(slot.id, slot.subject)}
                              className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      ) : (
                        "–"
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">Add Timetable Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-[#5a7095] hover:text-[#0e2a4d]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Day</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Period #</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed]"
                  >
                    {PERIODS.map((p) => (
                      <option key={p} value={String(p)}>Period {p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject Name</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Start Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    placeholder="09:00"
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">End Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    placeholder="10:00"
                    className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Target Grade</label>
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
                  <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Target Section</label>
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
                  {isSubmitting ? "Saving..." : "Save Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
