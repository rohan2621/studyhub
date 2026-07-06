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
  }, [isHydrated, requireAuth, user?.id, navigate, pathname]);

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
          <div className="flex h-full min-h-[70vh] flex-col items-center justify-center border border-black bg-white p-6 sm:p-12 text-center w-full max-w-md mx-auto mt-10">
            <div className="mb-6 flex h-20 w-20 items-center justify-center border border-black bg-gray-50">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-extrabold tracking-tight">
              Access Restricted
            </h2>
            <p className="mb-8 max-w-md text-sm sm:text-base text-gray-600">
              You need an active access token to view this content. Please activate your token or purchase a plan to unlock full access to StudyHub.
            </p>
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="saas-button"
            >
              Activate Token
            </button>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
