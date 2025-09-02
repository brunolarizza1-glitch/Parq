import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
};

// Card Skeleton
const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("p-4 bg-card rounded-lg border", className)}>
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
};

// List Item Skeleton
const SkeletonListItem = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-4 p-4", className)}>
      <Skeleton className="h-12 w-12 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
};

// Map Skeleton
const SkeletonMap = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative bg-muted rounded-lg", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          <div className="w-8 h-8 bg-current rounded-full opacity-20 animate-bounce"></div>
        </div>
      </div>
      {/* Fake map pins */}
      <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary/30 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-primary/30 rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-primary/30 rounded-full animate-pulse delay-700"></div>
    </div>
  );
};

export { Skeleton, SkeletonCard, SkeletonListItem, SkeletonMap };