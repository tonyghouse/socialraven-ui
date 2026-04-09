import { Skeleton } from "@/components/ui/skeleton";

export function CalendarPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className={`h-8 w-8 rounded-lg ${skeletonClassName}`} />
            <div className="space-y-2">
              <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-3 w-72 rounded-md ${skeletonClassName}`} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className={`h-7 w-28 rounded-full ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-28 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-32 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-28 rounded-md ${skeletonClassName}`} />
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-2.5 sm:px-6">
        <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className={`h-7 w-20 rounded-full ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-40 rounded-md ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-24 rounded-md ${skeletonClassName}`} />
          <Skeleton className={`ml-auto h-7 w-32 rounded-full ${skeletonClassName}`} />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex h-full min-h-[40rem] flex-col overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
          <div className="grid grid-cols-7 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className={`h-3 w-10 rounded-md ${skeletonClassName}`} />
            ))}
          </div>

          <div className="grid flex-1 grid-cols-7 gap-3 p-5">
            {Array.from({ length: 35 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[6.75rem] rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3"
              >
                <Skeleton className={`mb-3 h-4 w-6 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-7 w-full rounded-lg ${skeletonClassName}`} />
                <Skeleton className={`mt-2 h-7 w-5/6 rounded-lg ${skeletonClassName}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
