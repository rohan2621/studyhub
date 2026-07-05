import React, { useEffect } from "react";
import { X, ShieldAlert } from "lucide-react";

interface Props {
  visible: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

export function SecureFileViewer({ visible, url, title, onClose }: Props) {
  useEffect(() => {
    if (!visible) return;

    // 1. Prevent Right Click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent Keyboard Copy / Print / Save / Inspect
    const preventShortcuts = (e: KeyboardEvent) => {
      // Ctrl+S, Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
      }
      // Ctrl+P, Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
      }
      // Ctrl+Shift+I, F12 (Inspect Element)
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") || e.key === "F12") {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
      }
    };

    // 3. Prevent Drag and Drop
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventShortcuts);
    document.addEventListener("dragstart", preventDrag);

    // Hide scrollbar on body
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventShortcuts);
      document.removeEventListener("dragstart", preventDrag);
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  if (!visible || !url) return null;

  // Google Docs viewer wraps PDFs into a flat web preview with toolbar controls hidden
  const isPdf = url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf");
  const viewerUrl = isPdf
    ? `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
    : url;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e2a4d]/95 backdrop-blur-md">
      {/* Print Blocker Stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { display: none !important; }
          }
          .no-select {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
        `
      }} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2f6fed]/15 bg-white px-6 py-4 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#0e2a4d] text-base">
              {title}
            </h3>
            <p className="text-xs text-[#5a7095]/80 font-medium">
              StudyHub Protected Viewer · Downloads and Print are strictly disabled
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-100 bg-slate-50 p-2 text-[#5a7095] transition-all hover:bg-slate-100 hover:text-[#0e2a4d]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Viewer Frame Container */}
      <div className="relative flex-1 bg-[#0b1b30] no-select">
        {/* Anti-screenshot Watermark overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-12 select-none opacity-20">
          <div className="flex justify-between">
            <span className="text-white text-xs font-semibold tracking-widest uppercase">STUDYHUB SECURE DISPLAY</span>
            <span className="text-white text-xs font-semibold tracking-widest uppercase">STUDYHUB SECURE DISPLAY</span>
          </div>
          <div className="flex justify-center items-center flex-1">
            <span className="text-white text-4xl font-extrabold tracking-widest rotate-12 opacity-30 select-none">
              PROTECTED COPY - NO DOWNLOAD
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white text-xs font-semibold tracking-widest uppercase">STUDYHUB SECURE DISPLAY</span>
            <span className="text-white text-xs font-semibold tracking-widest uppercase">STUDYHUB SECURE DISPLAY</span>
          </div>
        </div>

        {/* Clear transparent click shield overlay to prevent selecting or right-clicking elements inside iframe */}
        <div className="absolute inset-0 z-20 bg-transparent" />

        {isPdf ? (
          <iframe
            src={viewerUrl}
            title={title}
            className="h-full w-full border-none select-none no-select"
            style={{ pointerEvents: "none" }}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-8">
            <img
              src={viewerUrl}
              alt={title}
              loading="lazy"
              width="800"
              height="800"
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl pointer-events-none select-none no-select"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
