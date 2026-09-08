// Generic skeleton primitives + page-level skeletons

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-lg ${className}`} />
  );
}

// ---- Dashboard Skeleton ----
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border-2 border-neutral-100 bg-white space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      {/* Today section */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border-2 border-neutral-100 bg-white flex gap-4 items-center">
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      {/* Recent notes */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border-2 border-neutral-100 bg-white space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Notes List Skeleton (Archive) ----
export function NoteListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-xl" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-5 rounded-2xl border-2 border-neutral-100 bg-white space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Courses Skeleton ----
export function CourseListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 rounded-2xl border-2 border-neutral-100 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Note detail / review card skeleton ----
export function CardSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-2/3" />
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-1/2" : "w-full"}`} />
      ))}
    </div>
  );
}
