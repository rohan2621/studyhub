import { cn } from "@/lib/utils";
import React from "react";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)} {...props} />;
}

function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={cn("glass-card overflow-hidden p-5", className)}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <SkeletonText lines={2} />
      <div className="mt-6 flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };
