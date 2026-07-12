import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Award,
  ClipboardList,
  FileText,
  CalendarDays,
  MessageSquare,
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  Bell,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Upload,
  GraduationCap,
  Brain,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore, getTokenState, getTokenDaysRemaining } from "@/stores/auth";
import { api } from "@/lib/api";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyHub" },
      { name: "description", content: "Your StudyHub dashboard." },
    ],
  }),
  component: DashboardPage,
});

const featureCards = [
  { label: "Learn", to: "/learn", icon: Brain, gradient: "from-[#10b981] to-[#34d399]", desc: "Master new skills" },
  { label: "Notes", to: "/notes", icon: BookOpen, gradient: "from-[#2f6fed] to-[#5b8def]", desc: "Browse & download" },
  { label: "Topper Notes", to: "/topper-notes", icon: Award, gradient: "from-[#f5b843] to-[#f0c060]", desc: "Top-ranked notes" },
  { label: "Hire Topper", to: "/hire-topper", icon: GraduationCap, gradient: "from-[#8b5cf6] to-[#a855f7]", desc: "Get private tutoring" },
  { label: "Homework", to: "/homework", icon: ClipboardList, gradient: "from-[#38bdf8] to-[#7dd3fc]", desc: "Assignments & due dates" },
  { label: "Past Papers", to: "/past-papers", icon: FileText, gradient: "from-[#5b8def] to-[#2f6fed]", desc: "Previous exams" },
  { label: "Timetable", to: "/timetable", icon: CalendarDays, gradient: "from-[#38bdf8] to-[#5b8def]", desc: "Weekly schedule" },
  { label: "Discussions", to: "/discussions", icon: MessageSquare, gradient: "from-[#2f6fed] to-[#38bdf8]", desc: "Ask & answer" },
  { label: "Announcements", to: "/announcements", icon: Megaphone, gradient: "from-[#f59e0b] to-[#f97316]", desc: "School updates" },
  { label: "My Requests", to: "/custom-requests", icon: Sparkles, gradient: "from-[#8b5cf6] to-[#6366f1]", desc: "Request content" },
];

function DashboardPage() {

  const { user, token } = useAuthStore();
  const tokenState = getTokenState(token);
  const daysLeft = getTokenDaysRemaining(token);
  const navigate = useNavigate();

  const [feed, setFeed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBinding, setIsBinding] = useState(false);

  const handleBindPermanent = async () => {
    setIsBinding(true);
    try {
      await api.post("/tokens/bind-permanent");
      const { setToken } = useAuthStore.getState();
      if (token) {
        setToken({
          ...token,
          is_device_permanent: true,
          can_bind_permanent: false
        });
      }
      toast.success("Device bound permanently! You can now access StudyHub on this device from any network.");
    } catch (err: any) {
      console.error("Binding device error:", err);
      toast.error(err.response?.data?.error || "Failed to bind device permanently.");
    } finally {
      setIsBinding(false);
    }
  };

  useEffect(() => {
    api.get("/feed")
      .then((res) => setFeed(res.data))
      .catch((err) => console.error("Feed error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/search", search: { q: searchQuery.trim() } });
    }
  };

  const schoolName = user?.school_name || "";

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d]">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-[#5a7095]">
              Welcome back, {user?.name || "Student"}{schoolName ? ` · ${schoolName}` : ""}{feed?.classLabel ? ` · ${feed.classLabel}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/learn/progress" className="hidden md:flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-2 hover:bg-emerald-100 transition-colors">
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                L3
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700">250 XP</p>
                <p className="text-[10px] text-emerald-600">Learner</p>
              </div>
            </Link>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a7095]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, homework, papers..."
                className="w-full md:w-72 rounded-xl border border-[#2f6fed]/15 bg-white/60 py-2.5 pl-9 pr-4 text-sm text-[#0e2a4d] placeholder:text-[#5a7095]/50 outline-none ring-[#2f6fed] transition-all focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/15"
              />
            </div>
          </form>
        </div>
        </div>

        {/* Token / Access Banner */}
        {tokenState !== "active" && user?.role === "student" && (
          <div className="rounded-xl border border-[#f5b843]/20 bg-[#f5b843]/8 px-4 sm:px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] font-semibold text-[#0e2a4d]">
                  {tokenState === "expired" ? "Your access expired" : "Unlock full access"}
                </h3>
                <p className="mt-0.5 text-sm text-[#5a7095]">
                  {tokenState === "expired"
                    ? "Renew your token to continue downloading notes and submitting homework."
                    : "Contact us to choose a plan and receive your access token."}
                </p>
              </div>
              <Link
                to="/profile"
                className="shrink-0 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl"
              >
                {tokenState === "expired" ? "Renew" : "Get token"}
              </Link>
            </div>
          </div>
        )}

        {/* Active token badge */}
        {tokenState === "active" && user?.role === "student" && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-2.5 text-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-700">Token active</span>
            <span className="text-emerald-600/70">· {daysLeft} days remaining</span>
          </div>
        )}

        {/* Permanent Device Lock Prompt */}
        {tokenState === "active" && user?.role === "student" && !token?.is_device_permanent && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/8 px-4 sm:px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] font-semibold text-indigo-900 flex items-center gap-1.5">
                  <span>🔒 Secure Device Lock</span>
                </h3>
                <p className="mt-0.5 text-sm text-[#5a7095]">
                  Would you like to lock this browser as your permanent device? Once locked, you can access your StudyHub notes and homework from this device on any network (home, mobile data, school, etc.).
                </p>
              </div>
              <button
                onClick={handleBindPermanent}
                disabled={isBinding}
                className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-xl disabled:opacity-50"
              >
                {isBinding ? "Locking..." : "Make Permanent"}
              </button>
            </div>
          </div>
        )}

        {/* Pinned Announcements */}
        {!isLoading && feed?.pinnedAnnouncements?.length > 0 && (
          <div className="space-y-2">
            {feed.pinnedAnnouncements.map((ann: any) => (
              <div key={ann.id} className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-50/60 px-5 py-3">
                <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-[#0e2a4d]">{ann.title}</p>
                  <p className="mt-0.5 text-xs text-[#5a7095]">{ann.body}</p>
                </div>
                <Link to="/announcements" className="ml-auto shrink-0 text-xs font-medium text-amber-600 hover:underline">View all</Link>
              </div>
            ))}
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.to}
                className="glass-card group flex items-center gap-3 p-4 transition-all duration-300 hover:glass-card-hover"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[#0e2a4d]">{card.label}</h3>
                  <p className="text-xs text-[#5a7095]">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning Widget */}
            <div className="glass-card p-4 sm:p-6 border-l-4 border-l-[#10b981]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[#10b981]" />
                  <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">
                    Continue Learning
                  </h2>
                </div>
                <Link to="/learn" className="text-xs font-medium text-[#10b981] hover:underline">Go to Hub</Link>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#10b981]/15 bg-[#10b981]/5 px-4 py-3 hover:bg-[#10b981]/10 transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0e2a4d]">Python Programming for Beginners</p>
                  <p className="text-xs text-[#5a7095]">Lesson 3: Control Flow</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-[#10b981] rounded-full" style={{ width: "40%" }} />
                  </div>
                  <Link to="/learn/courses/python-beginners/lessons/control-flow" className="rounded-lg bg-[#10b981] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#059669] transition-colors">
                    Resume
                  </Link>
                </div>
              </div>
            </div>

            {/* Upcoming Homework */}
            <div className="glass-card p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2f6fed]" />
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">
                  Upcoming assignments
                </h2>
              </div>
              <Link to="/homework" className="text-xs font-medium text-[#2f6fed] hover:underline">View all</Link>
            </div>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-[#5a7095]">Loading...</p>
            ) : !feed?.upcomingHomework?.length ? (
              <p className="rounded-xl bg-white/40 px-4 py-8 text-center text-sm text-[#5a7095]">No upcoming assignments.</p>
            ) : (
              <div className="space-y-3">
                {feed.upcomingHomework.slice(0, 5).map((hw: any) => {
                  const urgencyColor =
                    hw.urgency === "red" ? "bg-red-100 text-red-700" :
                      hw.urgency === "amber" ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700";
                  const urgencyLabel =
                    hw.daysUntilDue < 0 ? "Overdue" :
                      hw.daysUntilDue === 0 ? "Due today" :
                        hw.daysUntilDue === 1 ? "1 day" : `${hw.daysUntilDue} days`;
                  return (
                    <div key={hw.id} className="flex items-center justify-between rounded-xl border border-[#2f6fed]/8 bg-white/50 px-4 py-3 transition-colors hover:bg-white/80">
                      <div>
                        <p className="text-sm font-medium text-[#0e2a4d]">{hw.title}</p>
                        <p className="text-xs text-[#5a7095]">{hw.subject} · Class {hw.grade}{hw.section}</p>
                      </div>
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${urgencyColor}`}>{urgencyLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Trending Notes */}
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#f5b843]" />
                  <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-[#0e2a4d]">Trending notes</h2>
                </div>
                <Link to="/notes" className="text-xs font-medium text-[#2f6fed] hover:underline">See all</Link>
              </div>
              {isLoading ? (
                <p className="py-4 text-center text-sm text-[#5a7095]">Loading...</p>
              ) : !feed?.trendingNotes?.length ? (
                <p className="py-4 text-center text-sm text-[#5a7095]">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {feed.trendingNotes.slice(0, 3).map((note: any) => (
                    <div key={note.id} className="flex items-center justify-between rounded-xl border border-[#2f6fed]/8 bg-white/50 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-[#0e2a4d] line-clamp-1">{note.title}</p>
                        <p className="text-xs text-[#5a7095]">{note.subject}</p>
                      </div>
                      <span className="ml-2 shrink-0 text-xs font-semibold text-[#2f6fed]">{note.upvotes} ↑</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Submissions */}
            {!isLoading && feed?.pendingSubmissions?.length > 0 && (
              <div className="glass-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-[#0e2a4d]">Pending submissions</h2>
                </div>
                <div className="space-y-2">
                  {feed.pendingSubmissions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="font-medium text-[#0e2a4d] line-clamp-1">{sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom request shortcut */}
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
                <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-[#0e2a4d]">Custom request</h2>
              </div>
              <p className="mb-4 text-xs text-[#5a7095]">Can't find what you need? Request a specific note, homework, or past paper.</p>
              <Link
                to="/custom-requests"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#8b5cf6]/20 bg-white/60 px-4 py-2 text-sm font-medium text-[#8b5cf6] transition-all hover:bg-[#8b5cf6]/5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                New request
              </Link>
              {!isLoading && feed?.openCustomRequests > 0 && (
                <p className="mt-2 text-xs text-[#5a7095]">{feed.openCustomRequests} open request{feed.openCustomRequests > 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-[#2f6fed]" />
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">Recent uploads</h2>
            </div>
            <Link to="/notes" className="text-xs font-medium text-[#2f6fed] hover:underline">View all notes</Link>
          </div>
          {isLoading ? (
            <p className="py-6 text-center text-sm text-[#5a7095]">Loading...</p>
          ) : !feed?.recentUploads?.length ? (
            <p className="py-6 text-center text-sm text-[#5a7095]">Nothing uploaded yet. New content will appear here.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {feed.recentUploads.map((item: any) => (
                <div key={item.id} className="rounded-xl border border-[#2f6fed]/8 bg-white/50 p-4 transition-all hover:bg-white/80">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${item.type === "TopperNote" ? "bg-amber-100 text-amber-700" : "bg-[#2f6fed]/8 text-[#2f6fed]"}`}>
                    {item.type === "TopperNote" ? "Topper Note" : "Note"}
                  </span>
                  <p className="mt-2 text-sm font-medium text-[#0e2a4d] line-clamp-2">{item.title}</p>
                  <p className="mt-1 text-xs text-[#5a7095]">{item.subject}</p>
                  {item.uploader && <p className="mt-1 text-xs text-[#5a7095]/60">by {item.uploader}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
