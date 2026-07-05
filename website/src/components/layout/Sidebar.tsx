import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Award,
  ClipboardList,
  FileText,
  CalendarDays,
  MessageSquare,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Shield,
  Megaphone,
  Sparkles,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import { useAuthStore, getTokenState, getTokenDaysRemaining } from "@/stores/auth";
import { api } from "@/lib/api";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Notes", to: "/notes", icon: BookOpen },
  { label: "Topper Notes", to: "/topper-notes", icon: Award },
  { label: "Hire Topper", to: "/hire-topper", icon: GraduationCap },
  { label: "Homework", to: "/homework", icon: ClipboardList },
  { label: "Past Papers", to: "/past-papers", icon: FileText },
  { label: "Timetable", to: "/timetable", icon: CalendarDays },
  { label: "Discussions", to: "/discussions", icon: MessageSquare },
  { label: "Announcements", to: "/announcements", icon: Megaphone },
  { label: "My Requests", to: "/custom-requests", icon: Sparkles },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Profile", to: "/profile", icon: User },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { user, token, logout } = useAuthStore();
  const tokenState = getTokenState(token);
  const daysLeft = getTokenDaysRemaining(token);
  const [schools, setSchools] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    api.get("/schools")
      .then(res => setSchools(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (user) {
      api.get("/notifications?pageSize=1")
        .then(res => {
          setUnreadNotifications(res.data.unreadCount || 0);
        })
        .catch(err => console.error("Error fetching notification count", err));
    }
  }, [user, pathname]); // Re-fetch on path changes so reading notifications clears the badge

  const school = schools.find((s) => s.id === user?.school_id);

  const items = [...navItems];
  if (user?.role === "admin") {
    items.push({ label: "Admin Panel", to: "/admin", icon: Shield });
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-black bg-white text-black font-[family-name:var(--font-sans)]">
      <Link to="/dashboard" className="flex items-center px-6 py-5 border-b border-black">
        <img src="/logo.png?v=12" alt="StudyHub" width="38" height="38" loading="eager" className="h-[38px] w-[38px] dark:invert" />
        
      </Link>

      <nav aria-label="Main Navigation" className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          const isNotifications = item.to === "/notifications";

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center justify-between border px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${isActive
                ? "border-black bg-black text-white"
                : "border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-black"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-black"}`} aria-hidden="true" />
                {item.label}
              </div>
              {isNotifications && unreadNotifications > 0 && (
                <span 
                  className="flex h-5 min-w-[20px] items-center justify-center bg-black px-1 text-[10px] font-bold text-white"
                  aria-label={`${unreadNotifications} unread notifications`}
                >
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black px-4 py-6 bg-gray-50">
        {user?.role !== "admin" && (
          tokenState === "active" ? (
            <div className="mb-4 border border-black bg-white px-3 py-2.5 text-xs" role="status" aria-live="polite">
              <div className="flex items-center gap-2 font-bold text-green-700">
                <div className="h-2 w-2 bg-green-500" aria-hidden="true" />
                Token Active
              </div>
              <div className="mt-1 text-gray-500 font-medium">{daysLeft} days remaining</div>
            </div>
          ) : (
            <div className="mb-4 border border-black bg-white px-3 py-2.5 text-xs" role="alert">
              <div className="font-bold text-red-600">No Active Token</div>
              <Link
                to="/profile"
                className="mt-1 inline-block font-semibold text-black underline hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Unlock access
              </Link>
            </div>
          )
        )}

        {school && (
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-600">
            <GraduationCap className="h-4 w-4 text-black" aria-hidden="true" />
            {school.name}
          </div>
        )}

        <button
          onClick={() => {
            // First navigate to the landing page, then logout
            // This prevents AppShell from catching the unauthenticated state and redirecting to /login
            window.location.href = "/";
            logout();
          }}
          aria-label="Log out"
          className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-200 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          <LogOut className="h-4.5 w-4.5 text-gray-500 group-hover:text-black" aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}








