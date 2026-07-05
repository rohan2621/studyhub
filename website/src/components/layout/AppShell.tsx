import { type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { useAuthStore, getTokenState } from "@/stores/auth";
import { Lock } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AppShell({ children, requireAuth = true }: AppShellProps) {
  const { user, token, isHydrated } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tokenState = getTokenState(token);
  const isAdmin = user?.role === "admin";
  const isRestricted = !["/dashboard", "/profile", "/login", "/signup", "/"].includes(pathname);

  useEffect(() => {
    if (isHydrated && requireAuth) {
      if (!user) {
        navigate({ to: "/login", search: { redirect: pathname } });
      }
    }
  }, [isHydrated, requireAuth, user, navigate, pathname]);

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
      {requireAuth && <Sidebar />}
      <main id="main-content" tabIndex={-1} className={`flex-1 p-8 outline-none ${requireAuth ? "ml-64" : ""}`}>
        {isLockedOut ? (
          <div className="flex h-full min-h-[70vh] flex-col items-center justify-center border border-black bg-white p-12 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center border border-black bg-gray-50">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
              Access Restricted
            </h2>
            <p className="mb-8 max-w-md text-base text-gray-600">
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
