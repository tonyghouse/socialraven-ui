import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Skeleton className={`h-4 w-44 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-56 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className={`h-9 w-9 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-24 rounded-md ${skeletonClassName}`} />
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className={`h-3 w-24 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-8 w-12 rounded-md ${skeletonClassName}`} />
                </div>
                <Skeleton className={`h-9 w-9 rounded-lg ${skeletonClassName}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--ds-gray-400)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Skeleton className={`h-7 w-7 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
                </div>
                <Skeleton className={`h-8 w-16 rounded-md ${skeletonClassName}`} />
              </div>
              <div className="divide-y divide-[var(--ds-gray-400)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3.5 px-5 py-3.5">
                    <Skeleton className={`h-9 w-9 rounded-lg ${skeletonClassName}`} />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className={`h-4 w-3/4 rounded-md ${skeletonClassName}`} />
                      <Skeleton className={`h-3 w-1/4 rounded-md ${skeletonClassName}`} />
                    </div>
                    <Skeleton className={`h-6 w-14 rounded-full ${skeletonClassName}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[var(--ds-gray-400)] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className={`h-7 w-7 rounded-md ${skeletonClassName}`} />
                      <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                    </div>
                    <Skeleton className={`h-8 w-16 rounded-md ${skeletonClassName}`} />
                  </div>
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 3 }).map((__, rowIndex) => (
                      <div key={rowIndex} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <Skeleton className={`h-3 w-24 rounded-md ${skeletonClassName}`} />
                          <Skeleton className={`h-3 w-10 rounded-md ${skeletonClassName}`} />
                        </div>
                        <Skeleton className={`h-2 w-full rounded-full ${skeletonClassName}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-[var(--ds-gray-400)] px-5 py-4">
                  <Skeleton className={`h-7 w-7 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-3 p-5">
                  {Array.from({ length: index === 2 ? 4 : 3 }).map((__, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                      <Skeleton className={`h-8 w-8 rounded-md ${skeletonClassName}`} />
                      <div className="flex-1 space-y-2">
                        <Skeleton className={`h-4 w-2/3 rounded-md ${skeletonClassName}`} />
                        <Skeleton className={`h-3 w-1/3 rounded-md ${skeletonClassName}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
