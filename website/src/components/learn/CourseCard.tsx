import { Clock, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

interface CourseCardProps {
  title: string;
  tagline: string;
  difficulty: DifficultyLevel;
  estimatedHours: number;
  lessonCount: number;
  coverImageUrl?: string;
  progressPercentage?: number;
  isEnrolled?: boolean;
  className?: string;
  onAction?: () => void;
  onClick?: () => void;
}

const difficultyColors: Record<DifficultyLevel, string> = {
  Beginner: "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400",
  Intermediate: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400",
  Advanced: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:text-orange-400",
  Expert: "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400",
};

export function CourseCard({
  title,
  tagline,
  difficulty,
  estimatedHours,
  lessonCount,
  coverImageUrl,
  progressPercentage = 0,
  isEnrolled = false,
  className,
  onAction,
  onClick,
}: CourseCardProps) {
  return (
    <Card 
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      {coverImageUrl && (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img 
            src={coverImageUrl} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}
      
      <CardHeader className={cn("flex-1", coverImageUrl ? "pt-4" : "")}>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary" className={cn("font-medium", difficultyColors[difficulty])}>
            {difficulty}
          </Badge>
          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {estimatedHours}h
            </span>
            <span className="flex items-center">
              <BookOpen className="mr-1 h-3 w-3" />
              {lessonCount}
            </span>
          </div>
        </div>
        <h3 className="line-clamp-2 text-xl font-semibold leading-tight">{title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground mt-2">{tagline}</p>
      </CardHeader>

      <CardFooter className="flex-col items-stretch gap-4 border-t bg-muted/20 p-4">
        {isEnrolled ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>{progressPercentage === 100 ? "Completed" : "In Progress"}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        ) : null}
        
        <Button 
          variant={isEnrolled ? (progressPercentage === 100 ? "outline" : "default") : "default"} 
          className="w-full justify-between"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
        >
          {isEnrolled 
            ? (progressPercentage === 100 ? "Review Course" : "Continue Learning") 
            : "Enroll Now"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
