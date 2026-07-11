import { Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiStatusBadgeProps {
  isAvailable: boolean;
  className?: string;
}

export function AiStatusBadge({ isAvailable, className }: AiStatusBadgeProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
        isAvailable 
          ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20" 
          : "bg-muted text-muted-foreground border border-border",
        className
      )}
    >
      {isAvailable ? (
        <>
          <Sparkles className="h-3 w-3" />
          <span>AI Powered</span>
        </>
      ) : (
        <>
          <Clock className="h-3 w-3" />
          <span>Coming Soon</span>
        </>
      )}
    </div>
  );
}
