import { Lightbulb, ArrowRight, BookOpen, Repeat, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RecommendationType = "NextLesson" | "ReviewWeakTopic" | "SpacedRepetition" | "NewCourse";

interface RecommendationCardProps {
  type: RecommendationType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const configMap = {
  NextLesson: {
    icon: PlayCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    defaultAction: "Continue Learning"
  },
  ReviewWeakTopic: {
    icon: BookOpen,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    defaultAction: "Review Topic"
  },
  SpacedRepetition: {
    icon: Repeat,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    defaultAction: "Practice Now"
  },
  NewCourse: {
    icon: Lightbulb,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    defaultAction: "Explore Course"
  },
};

export function RecommendationCard({
  type,
  title,
  description,
  actionText,
  onAction,
  className,
}: RecommendationCardProps) {
  const config = configMap[type];
  const Icon = config.icon;

  return (
    <Card className={cn("overflow-hidden border transition-all hover:shadow-md", config.border, className)}>
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", config.bg, config.color)}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recommended
            </span>
          </div>
          <h4 className="text-base font-semibold leading-tight">{title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        
        <Button 
          onClick={onAction}
          className={cn("w-full sm:w-auto shrink-0 mt-2 sm:mt-0")}
          variant="secondary"
        >
          {actionText || config.defaultAction}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
