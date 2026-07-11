import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  title: string;
  description: string;
  iconEmoji: string;
  xpReward: number;
  isEarned: boolean;
  earnedAt?: string;
  className?: string;
}

export function AchievementBadge({
  title,
  description,
  iconEmoji,
  xpReward,
  isEarned,
  earnedAt,
  className,
}: AchievementBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "group relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300",
              isEarned 
                ? "bg-card border-primary/20 hover:border-primary/50 hover:shadow-md cursor-default" 
                : "bg-muted/30 border-dashed border-muted-foreground/30 cursor-not-allowed opacity-70",
              className
            )}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
              <span 
                className={cn(
                  "text-3xl transition-transform duration-300",
                  isEarned ? "group-hover:scale-110" : "grayscale filter"
                )}
              >
                {iconEmoji}
              </span>
              
              {!isEarned && (
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-background shadow-sm">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="text-center space-y-0.5">
              <p className="text-sm font-semibold leading-tight line-clamp-1">{title}</p>
              <p className="text-xs text-muted-foreground font-medium">+{xpReward} XP</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] text-center p-3 space-y-1.5">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {isEarned && earnedAt && (
            <p className="text-[10px] text-primary pt-1 font-medium border-t border-border/50 mt-2">
              Earned on {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
          {!isEarned && (
            <p className="text-[10px] text-muted-foreground pt-1 font-medium border-t border-border/50 mt-2 flex items-center justify-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Locked
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
