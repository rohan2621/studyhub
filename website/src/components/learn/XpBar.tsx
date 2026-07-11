import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface XpBarProps {
  currentXp: number;
  nextLevelXp: number;
  level: number;
  levelName: string;
  className?: string;
  showDetails?: boolean;
}

export function XpBar({
  currentXp,
  nextLevelXp,
  level,
  levelName,
  className,
  showDetails = true,
}: XpBarProps) {
  // Prevent division by zero
  const progressPercentage = nextLevelXp > 0 ? (currentXp / nextLevelXp) * 100 : 100;

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
          <Trophy className="absolute h-10 w-10 opacity-20 text-primary" />
          <span className="relative z-10">{level}</span>
        </div>
        
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{levelName}</span>
            {showDetails && (
              <span className="text-xs text-muted-foreground font-medium">
                {currentXp} / {nextLevelXp} XP
              </span>
            )}
          </div>
          <Progress value={progressPercentage} className="h-2 bg-muted">
            {/* If we needed a custom filled color we would do it here or inside Progress component */}
          </Progress>
        </div>
      </div>
    </div>
  );
}
