import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { useAuthStore, getTokenState } from "@/stores/auth";
import { api } from "@/lib/api";
import { Lock, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AppShell({ children, requireAuth = true }: AppShellProps) {
  const { user, token, setToken, isHydrated } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tokenState = getTokenState(token);
  const isAdmin = user?.role === "admin";
  const isRestricted = !["/dashboard", "/profile", "/login", "/signup", "/"].includes(pathname);

  useEffect(() => {
    if (isHydrated && requireAuth) {
      if (!user) {
        navigate({ to: "/login", search: { redirect: pathname } });
      } else if (user.role === "admin") {
        // Admin users should always be on /admin — redirect if they land elsewhere
        if (!pathname.startsWith("/admin")) {
          navigate({ to: "/admin" });
        }
      } else if (user.role === "student") {
        // Sync token state globally in case they activated on another device
        api.get("/tokens/me")
          .then(res => {
            if (res.data.hasActiveToken) {
              setToken({
                id: res.data.id,
                code: res.data.code,
                user_id: user.id,
                plan: res.data.plan.toLowerCase() as any,
                issued_at: new Date().toISOString(),
                expires_at: res.data.expiresAt,
                status: "active",
                device_id: res.data.deviceBound ? "bound" : null,
                is_device_permanent: res.data.isDevicePermanent,
                can_bind_permanent: res.data.canBindPermanent
              });
            } else {
              setToken(null);
            }
          })
          .catch(console.error);
      }
    }
  }, [isHydrated, requireAuth, user?.id, user?.role, navigate, pathname]);

  const isLockedOut = requireAuth && user && !isAdmin && tokenState !== "active" && isRestricted;

  if (!isHydrated) {
    return null;
  }

  if (requireAuth && !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black font-[family-name:var(--font-sans)]">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[60] bg-black text-white px-4 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        Skip to content
      </a>
      {requireAuth && (
        <>
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-black bg-white z-30 flex items-center px-4 justify-between">
             <div className="font-extrabold text-xl font-[family-name:var(--font-heading)] flex items-center gap-2">
                <img src="/logo.png?v=12" alt="StudyHub" className="h-6 w-6 dark:invert" />
                StudyHub
             </div>
             <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
               <SheetTrigger asChild>
                 <button className="p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
                   <Menu className="h-6 w-6 text-black" />
                 </button>
               </SheetTrigger>
               <SheetContent side="left" className="p-0 w-64 border-r border-black font-[family-name:var(--font-sans)]">
                 <Sidebar className="flex h-full w-full flex-col bg-white text-black" onNavigate={() => setMobileMenuOpen(false)} />
               </SheetContent>
             </Sheet>
          </div>
        </>
      )}
      <main id="main-content" tabIndex={-1} className={`flex-1 min-w-0 p-4 sm:p-6 md:p-8 outline-none ${requireAuth ? "lg:ml-64 pt-20 lg:pt-8" : ""}`}>
        {isLockedOut ? (
          <div className="flex h-full min-h-[70vh] flex-col items-center justify-center w-full max-w-2xl mx-auto mt-4 px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-[#2f6fed]/5 border border-slate-100 p-8 sm:p-16 text-center w-full transition-all duration-300 hover:shadow-3xl hover:shadow-[#2f6fed]/10">
              {/* Background Glows */}
              <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[#2f6fed]/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#2f6fed]/10 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#2f6fed] to-[#0e2a4d] shadow-[0_0_40px_rgba(47,111,237,0.3)] transition-transform duration-500 hover:scale-110 hover:rotate-3">
                  <Lock className="h-10 w-10 text-white" />
                </div>
                <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0e2a4d]">
                  Access Restricted
                </h2>
                <p className="mb-10 max-w-lg text-base sm:text-lg text-[#5a7095] leading-relaxed">
                  You need an active access token to view this content. Please activate your token or purchase a plan to unlock full access to your study materials.
                </p>
                <button
                  onClick={() => navigate({ to: "/profile" })}
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#0e2a4d] px-8 py-4 text-base font-bold text-white transition-all hover:scale-105 hover:bg-[#1a4175] hover:shadow-xl hover:shadow-[#0e2a4d]/20 active:scale-95"
                >
                  <span>Activate Token</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
