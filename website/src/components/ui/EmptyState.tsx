import { Inbox } from "lucide-react";

export function EmptyState({ title = "Nothing here yet", message = "Content will appear once it's uploaded." }: { title?: string; message?: string }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f6fed]/8 text-[#2f6fed]">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-[#0e2a4d]">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-[#5a7095]">{message}</p>
    </div>
  );
}
