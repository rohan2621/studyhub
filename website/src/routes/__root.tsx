import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-sans)] text-black">
      <div className="w-full max-w-md border border-black bg-white p-6 sm:p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-7xl font-extrabold font-[family-name:var(--font-heading)] text-black">404</h1>
        <h2 className="mt-4 text-xl font-bold">Page not found</h2>
        <p className="mt-2 text-sm text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="saas-button"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Route error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-sans)] text-black">
      <div className="w-full max-w-md border border-black bg-white p-6 sm:p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-xl font-extrabold tracking-tight font-[family-name:var(--font-heading)]">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm text-gray-600 font-medium">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="saas-button"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-black bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-50"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "StudyHub" },
        {
          name: "description",
          content:
            "StudyHub — Notes, homework, past papers, and more for students.",
        },
        { name: "author", content: "StudyHub" },
        { property: "og:title", content: "StudyHub" },
        {
          property: "og:description",
          content:
            "StudyHub — Notes, homework, past papers, and more for students.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:site", content: "@StudyHub" },
        { name: "twitter:title", content: "StudyHub" },
        {
          name: "twitter:description",
          content:
            "StudyHub — Notes, homework, past papers, and more for students.",
        },
        { property: "og:image", content: "/logo.png" },
        { name: "twitter:image", content: "/logo.png" },
      ],
      links: [
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "icon", type: "image/png", href: "/logo.png" },
        { rel: "apple-touch-icon", href: "/logo.png" },
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "name": "StudyHub",
                "url": "https://studyhub.com/"
              },
              {
                "@type": "Organization",
                "name": "StudyHub",
                "url": "https://studyhub.com/",
                "logo": "https://studyhub.com/logo.png",
                "sameAs": [
                  "https://twitter.com/StudyHub",
                  "https://facebook.com/StudyHub"
                ]
              }
            ]
          }),
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function GlobalLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Force remove any dark class on mount
    if (typeof window !== "undefined") {
      window.document.documentElement.classList.remove("dark");
    }

    // Start fade-out after a brief display
    const fadeTimer = setTimeout(() => setFadeOut(true), 600);
    // Remove from DOM after transition completes
    const removeTimer = setTimeout(() => setVisible(false), 1100);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="relative flex flex-col items-center p-6 text-center">
        {/* Spinning loader ring */}
        <div
          className="h-14 w-14 animate-spin rounded-full border-[3px] border-gray-200 border-t-black"
        />

        {/* Brand logo */}
        <div className="flex flex-col items-center justify-center">
          <img src="/logo.png?v=12" alt="StudyHub Icon" width="61" height="61" loading="eager" className="mt-5 h-[61px] w-[61px] select-none dark:invert" />
          <p className="mt-2 text-[11px] font-bold tracking-[0.15em] uppercase select-none text-black">
            StudyHub
          </p>
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoader />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
