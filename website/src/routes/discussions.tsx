import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  MessageCircle,
  Plus,
  X,
  ChevronRight,
  ArrowLeft,
  Send,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LockOverlay } from "@/components/ui/LockOverlay";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore, getTokenState } from "@/stores/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/discussions")({
  head: () => ({
    meta: [
      { title: "Discussions — StudyHub" },
      { name: "description", content: "Join subject discussions with peers." },
    ],
  }),
  component: DiscussionsPage,
});

function DiscussionsPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [threads, setThreads] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(false);

  const { user, token } = useAuthStore();
  const tokenState = getTokenState(token);
  const hasAccess = tokenState === "active" || user?.role === "admin" || user?.role === "teacher";

  // Active thread view
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  // New thread modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [formSubject, setFormSubject] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchThreads = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/discussions");
      const data = res.data || [];
      setThreads(data);
      const uniqueSubjects = ["All", ...Array.from(new Set(data.map((d: any) => d.subject))) as string[]];
      setSubjects(uniqueSubjects);
    } catch (err) {
      console.error("Failed to load discussions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const openThread = async (thread: any) => {
    setActiveThread(thread);
    try {
      const res = await api.get(`/discussions/${thread.id}/replies`);
      setReplies(res.data || []);
    } catch (err) {
      console.error("Failed to load replies:", err);
    }
  };

  const closeThread = () => {
    setActiveThread(null);
    setReplies([]);
    setReplyBody("");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setIsSendingReply(true);
    try {
      await api.post(`/discussions/${activeThread.id}/replies`, { body: replyBody });
      setReplyBody("");
      const res = await api.get(`/discussions/${activeThread.id}/replies`);
      setReplies(res.data || []);
      // Update reply count in list
      setThreads((prev) => prev.map((t) => t.id === activeThread.id ? { ...t, replyCount: (t.replyCount || 0) + 1 } : t));
      setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send reply.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post("/discussions", { subject: formSubject, title: formTitle, body: formBody });
      setShowNewModal(false);
      setFormSubject("");
      setFormTitle("");
      setFormBody("");
      fetchThreads();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create thread.");
    } finally {
      setIsCreating(false);
    }
  };

  const filtered = threads
    .filter((d) => subjectFilter === "All" ? true : d.subject === subjectFilter)
    .filter((d) => search ? d.title.toLowerCase().includes(search.toLowerCase()) || d.author?.toLowerCase().includes(search.toLowerCase()) : true);

  // Thread detail view
  if (activeThread) {
    return (
      <AppShell>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
          {/* Thread Header */}
          <div className="mb-4 flex items-center gap-3">
            <button onClick={closeThread} className="flex items-center gap-2 text-sm font-medium text-[#5a7095] hover:text-[#0e2a4d]">
              <ArrowLeft className="h-4 w-4" />
              Back to discussions
            </button>
          </div>

          <div className="glass-card mb-4 p-5 shrink-0">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6fed] to-[#38bdf8]">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="inline-block rounded-md bg-[#2f6fed]/8 px-2 py-0.5 text-xs font-semibold text-[#2f6fed]">
                  {activeThread.subject}
                </span>
                <h1 className="mt-1 font-[family-name:var(--font-heading)] text-xl font-bold text-[#0e2a4d]">
                  {activeThread.title}
                </h1>
                {activeThread.body && (
                  <p className="mt-2 text-sm text-[#5a7095]">{activeThread.body}</p>
                )}
                <p className="mt-2 text-xs text-[#5a7095]">
                  by {activeThread.author} · {formatDate(activeThread.createdAt)} · {replies.length} replies
                </p>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
            {replies.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#5a7095]">No replies yet. Be the first to reply!</p>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f6fed]/10 text-[#2f6fed] font-bold text-xs">
                      {(reply.author || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0e2a4d]">{reply.author}</span>
                        <span className="text-xs text-[#5a7095]">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#0e2a4d]/80 whitespace-pre-wrap">{reply.body}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={repliesEndRef} />
          </div>

          {/* Reply Input */}
          {hasAccess ? (
            <form onSubmit={handleSendReply} className="flex items-center gap-3 shrink-0">
              <input
                type="text"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 rounded-xl border border-[#2f6fed]/20 bg-white/80 px-4 py-3 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
              />
              <button
                type="submit"
                disabled={isSendingReply || !replyBody.trim()}
                className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSendingReply ? "Sending..." : "Reply"}
              </button>
            </form>
          ) : (
            <p className="shrink-0 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
              Activate an access token to participate in discussions.
            </p>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6fed] to-[#38bdf8]">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Discussions</h1>
            <p className="text-sm text-[#5a7095]">{filtered.length} threads</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a7095]" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-[#2f6fed]/15 bg-white/60 py-2.5 pl-9 pr-4 text-sm text-[#0e2a4d] placeholder:text-[#5a7095]/50 outline-none ring-[#2f6fed] transition-all focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/15"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-[#2f6fed]/15 bg-white/60 px-4 py-2.5 text-sm text-[#0e2a4d] outline-none"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {hasAccess && (
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Thread
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[#5a7095]">Loading discussions...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No discussions yet" message="Start a conversation once threads are opened." />
      ) : (
        <div className="space-y-3">
          {filtered.map((thread) => (
            <div
              key={thread.id}
              className="glass-card relative cursor-pointer overflow-hidden p-5 transition-all duration-300 hover:glass-card-hover"
              onClick={() => hasAccess && openThread(thread)}
            >
              {!hasAccess && <LockOverlay />}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-md bg-[#2f6fed]/8 px-2 py-0.5 text-xs font-medium text-[#2f6fed]">
                      {thread.subject}
                    </span>
                    {thread.grade && (
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#5a7095]">
                        Class {thread.grade}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-[family-name:var(--font-heading)] text-sm font-semibold text-[#0e2a4d]">
                    {thread.title}
                  </h3>
                  {thread.body && (
                    <p className="mt-1 text-xs text-[#5a7095] line-clamp-2">{thread.body}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-[#5a7095]">
                    <span>by {thread.author}</span>
                    <span>{formatDate(thread.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/60 px-3 py-2 text-xs font-medium text-[#5a7095]">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {thread.replyCount ?? 0}
                  </div>
                  {hasAccess && <ChevronRight className="h-4 w-4 text-[#5a7095]" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Thread Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e2a4d]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#2f6fed]/15 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-50 border-b border-[#2f6fed]/10 px-6 py-4">
              <h3 className="font-bold text-[#0e2a4d] text-lg">Start a new thread</h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#5a7095] hover:text-[#0e2a4d]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Subject</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="What do you want to discuss?"
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0e2a4d]">Body (optional)</label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Add more context..."
                  rows={3}
                  className="w-full rounded-xl border border-[#2f6fed]/20 px-3 py-2 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/10"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 rounded-xl border border-[#2f6fed]/15 py-2 text-sm font-semibold text-[#5a7095] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-xl gradient-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isCreating ? "Posting..." : "Post Thread"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
