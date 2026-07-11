import { useState } from "react";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

export function FlipCard({ frontContent, backContent, className }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={cn("group w-full cursor-pointer [perspective:1000px]", className)} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={cn(
          "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        )}
      >
        {/* Front */}
        <div 
          className={cn(
            "absolute inset-0 h-full w-full [backface-visibility:hidden]",
            "rounded-xl border bg-card text-card-foreground shadow-sm",
            "flex flex-col items-center justify-center p-6 text-center"
          )}
        >
          {frontContent}
        </div>
        
        {/* Back */}
        <div 
          className={cn(
            "absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-xl border border-primary/20 bg-primary/5 text-card-foreground shadow-sm",
            "flex flex-col items-center justify-center p-6 text-center"
          )}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
}
