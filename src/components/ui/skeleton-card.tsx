import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function TeamCardSkeleton({ className }: SkeletonCardProps) {
  return (
    <div className={cn("team-card animate-pulse", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-4 w-4 rounded" />
      </div>
      <div className="skeleton h-6 w-3/4 mb-2" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-14 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="skeleton h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function WidgetSkeleton({ className }: SkeletonCardProps) {
  return (
    <div className={cn("widget-card animate-pulse", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="space-y-3">
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1">
        <div className="skeleton h-4 w-1/3 mb-2" />
        <div className="skeleton h-3 w-2/3" />
      </div>
      <div className="skeleton h-4 w-12" />
    </div>
  );
}
