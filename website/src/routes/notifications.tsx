import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X, CheckCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — StudyHub" },
      { name: "description", content: "Your StudyHub notifications." },
    ],
  }),
  component: NotificationsPage,
});

const TYPE_COLORS: Record<string, string> = {
  NewHomework: "bg-blue-100 text-blue-700",
  NewNote: "bg-emerald-100 text-emerald-700",
  NewAnnouncement: "bg-amber-100 text-amber-700",
  TokenExpiring: "bg-orange-100 text-orange-700",
  RequestFulfilled: "bg-purple-100 text-purple-700",
  General: "bg-slate-100 text-slate-600",
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/notifications?pageSize=50");
      setNotifications(res.data?.data || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6fed] to-[#38bdf8]">
              <Bell className="h-5 w-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Notifications</h1>
              <p className="text-sm text-[#5a7095]">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 rounded-xl border border-[#2f6fed]/20 bg-white/60 px-3 py-2 text-sm font-medium text-[#2f6fed] hover:bg-[#2f6fed]/5"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[#5a7095]">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" message="You're all caught up! Notifications will appear here." />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const typeColor = TYPE_COLORS[notif.type] || TYPE_COLORS.General;
              return (
                <div
                  key={notif.id}
                  className={`glass-card flex items-start gap-4 p-4 transition-all duration-200 ${!notif.isRead ? "border-l-4 border-l-[#2f6fed] bg-[#2f6fed]/3" : "opacity-75"}`}
                >
                  <div className={`mt-0.5 shrink-0 rounded-full h-2.5 w-2.5 ${!notif.isRead ? "bg-[#2f6fed]" : "bg-slate-200"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${typeColor}`}>
                        {notif.type?.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#0e2a4d]">{notif.title}</p>
                    {notif.body && <p className="mt-0.5 text-xs text-[#5a7095]">{notif.body}</p>}
                    <p className="mt-1 text-xs text-[#5a7095]/60">{formatDate(notif.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        title="Mark as read"
                        className="rounded-lg bg-[#2f6fed]/8 p-1.5 text-[#2f6fed] hover:bg-[#2f6fed]/15"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title="Delete"
                      className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
