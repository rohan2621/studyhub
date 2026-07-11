import { CheckCircle2, Lock, PlayCircle, FileText, FileCode, CheckSquare, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export type LessonType = "Introduction" | "Concept" | "Practice" | "Assessment" | "Project";
export type LessonStatus = "Locked" | "NotStarted" | "InProgress" | "Completed";

export interface LessonSidebarItem {
  id: string;
  title: string;
  type: LessonType;
  status: LessonStatus;
  durationMinutes: number;
}

interface LessonSidebarProps {
  courseTitle: string;
  lessons: LessonSidebarItem[];
  activeLessonId?: string;
  className?: string;
  onSelectLesson?: (id: string) => void;
}

const getLessonIcon = (type: LessonType) => {
  switch (type) {
    case "Introduction": return PlayCircle;
    case "Concept": return FileText;
    case "Practice": return FileCode;
    case "Assessment": return CheckSquare;
    case "Project": return Presentation;
    default: return FileText;
  }
};

export function LessonSidebar({
  courseTitle,
  lessons,
  activeLessonId,
  className,
  onSelectLesson,
}: LessonSidebarProps) {
  const completedCount = lessons.filter(l => l.status === "Completed").length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className={cn("flex h-full flex-col border-r bg-background", className)}>
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm mb-3 line-clamp-2">{courseTitle}</h2>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount} of {lessons.length} lessons</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {lessons.map((lesson, index) => {
            const Icon = getLessonIcon(lesson.type);
            const isActive = activeLessonId === lesson.id;
            const isLocked = lesson.status === "Locked";
            
            return (
              <button
                key={lesson.id}
                disabled={isLocked}
                onClick={() => !isLocked && onSelectLesson?.(lesson.id)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : isLocked
                      ? "opacity-60 cursor-not-allowed text-muted-foreground"
                      : "hover:bg-muted text-foreground"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {lesson.status === "Completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <span className="line-clamp-2 leading-snug">
                    <span className="text-muted-foreground text-xs mr-2">{index + 1}.</span>
                    {lesson.title}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{lesson.durationMinutes} min</span>
                    {lesson.status === "InProgress" && (
                      <>
                        <span className="mx-1.5">•</span>
                        <span className="text-blue-500 font-medium">In Progress</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
