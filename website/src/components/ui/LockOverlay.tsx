import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function LockOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-[#eaf1ff]/70 backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f6fed]/10">
        <Lock className="h-5 w-5 text-[#2f6fed]" />
      </div>
      <p className="mt-3 text-sm font-medium text-[#0e2a4d]">Unlock to view full content</p>
      <Link
        to="/profile"
        className="mt-2 text-xs font-medium text-[#2f6fed] hover:underline"
      >
        Get access token
      </Link>
    </div>
  );
}
