export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800 ${className}`}
    />
  );
}

export function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <SkeletonLine className="h-5 w-32" />
      <SkeletonLine className="mt-3 h-3 w-full" />
      <SkeletonLine className="mt-2 h-3 w-2/3" />
      <SkeletonLine className="mt-4 h-3 w-20" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <SkeletonLine className="h-4 w-full" />
      <SkeletonLine className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function ActivityRowSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <SkeletonLine className="mt-1 h-2 w-2 rounded-full" />
      <div className="flex-1">
        <SkeletonLine className="h-3 w-3/4" />
        <SkeletonLine className="mt-1.5 h-3 w-16" />
      </div>
    </div>
  );
}