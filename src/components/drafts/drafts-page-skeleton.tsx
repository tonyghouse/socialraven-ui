import { Skeleton } from "@/components/ui/skeleton";

export function DraftsPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Skeleton className={`h-4 w-20 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-64 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className={`h-9 w-9 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`hidden h-9 w-24 rounded-md sm:block ${skeletonClassName}`} />
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="px-4 py-2.5 sm:px-6">
          <Skeleton className={`h-6 w-24 rounded-full ${skeletonClassName}`} />
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="flex gap-2 overflow-hidden px-4 py-3 sm:px-6">
          <Skeleton className={`h-9 w-44 rounded-lg ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-32 rounded-lg ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-28 rounded-lg ${skeletonClassName}`} />
          <Skeleton className={`hidden h-9 w-24 rounded-lg md:block ${skeletonClassName}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 px-4 py-6 pb-24 sm:px-6 sm:pb-10 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[var(--ds-gray-400)] px-4 py-3">
              <div className="flex gap-2">
                <Skeleton className={`h-5 w-14 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-5 w-16 rounded-full ${skeletonClassName}`} />
              </div>
              <Skeleton className={`h-5 w-20 rounded-full ${skeletonClassName}`} />
            </div>
            <div className="flex gap-3 px-4 py-4">
              <div className="space-y-2.5">
                <Skeleton className={`h-[9.75rem] w-[6.5rem] rounded-md ${skeletonClassName}`} />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className={`h-4 w-5/6 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-4 w-2/3 rounded-md ${skeletonClassName}`} />
                </div>
                <Skeleton className={`h-3 w-24 rounded-md ${skeletonClassName}`} />
                <div className="space-y-2">
                  <Skeleton className={`h-3 w-20 rounded-md ${skeletonClassName}`} />
                  <div className="flex gap-2">
                    <Skeleton className={`h-8 w-8 rounded-full ${skeletonClassName}`} />
                    <Skeleton className={`h-8 w-8 rounded-full ${skeletonClassName}`} />
                    <Skeleton className={`h-8 w-8 rounded-full ${skeletonClassName}`} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
              <Skeleton className={`h-3.5 w-28 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-3.5 w-16 rounded-md ${skeletonClassName}`} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
