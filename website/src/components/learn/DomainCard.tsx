import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DomainCardProps {
  emoji: string;
  name: string;
  description: string;
  courseCount: number;
  progressPercentage?: number;
  className?: string;
  onClick?: () => void;
}

export function DomainCard({
  emoji,
  name,
  description,
  courseCount,
  progressPercentage,
  className,
  onClick,
}: DomainCardProps) {
  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all hover:shadow-md hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl transition-transform group-hover:scale-110">
            {emoji}
          </div>
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            {courseCount} {courseCount === 1 ? "Course" : "Courses"}
          </div>
        </div>
        <CardTitle className="mt-4 text-xl">{name}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {progressPercentage !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
