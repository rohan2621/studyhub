import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, AlertTriangle, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/download")({
  component: DownloadPage,
});

function DownloadPage() {
  const [latestRelease, setLatestRelease] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/api/appreleases/latest")
      .then(res => setLatestRelease(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black font-[family-name:var(--font-sans)]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-black bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png?v=12" alt="StudyHub" width="38" height="38" loading="eager" className="h-[38px] w-[38px] dark:invert" />
            <span className="font-bold text-lg tracking-tight">StudyHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <div className="text-center mb-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-black mb-6 shadow-xl">
            <Smartphone className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-[family-name:var(--font-heading)]">
            Download StudyHub for Android
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get the official StudyHub app directly from us. Follow the simple installation guide below to get started.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-black overflow-hidden shadow-sm">
          <div className="p-8 md:p-12 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Latest Release</h2>
              {isLoading ? (
                <p className="text-gray-500">Checking for latest version...</p>
              ) : latestRelease ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-bold">
                      v{latestRelease.versionName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(latestRelease.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 max-w-md">
                    {latestRelease.releaseNotes}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No releases available yet.</p>
              )}
            </div>

            {latestRelease && (
              <a
                href={latestRelease.fileUrl.startsWith('http') ? latestRelease.fileUrl : `${(api.defaults.baseURL || '').replace(/\/api\/?$/, '').replace(/\/$/, '')}${latestRelease.fileUrl}`}
                download
                className="shrink-0 flex items-center gap-3 rounded-xl bg-black px-8 py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95"
              >
                <Download className="h-6 w-6" />
                Download APK
              </a>
            )}
          </div>

          <div className="bg-gray-50 p-8 md:p-12">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              How to Install (Sideloading)
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white font-bold">1</div>
                <div>
                  <h4 className="font-bold text-lg">Download the File</h4>
                  <p className="text-gray-600">Tap the Download APK button above. Your browser might warn you about downloading files. Tap <strong>"Download anyway"</strong>.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white font-bold">2</div>
                <div>
                  <h4 className="font-bold text-lg">Open the APK</h4>
                  <p className="text-gray-600">Once downloaded, tap <strong>"Open"</strong> on the browser notification, or find the file in your device's <strong>Downloads</strong> folder and tap it.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white font-bold">3</div>
                <div>
                  <h4 className="font-bold text-lg">Allow Unknown Sources</h4>
                  <p className="text-gray-600">If prompted, tap <strong>"Settings"</strong> and toggle on <strong>"Allow from this source"</strong> for your browser. Then press back.</p>
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>Android asks this for any app not downloaded from the Play Store. This is completely normal and safe for the official StudyHub app.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Install & Open</h4>
                  <p className="text-gray-600">Tap <strong>"Install"</strong>. Once finished, you're ready to use StudyHub!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
