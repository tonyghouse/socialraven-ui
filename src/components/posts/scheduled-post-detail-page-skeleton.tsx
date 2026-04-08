import { Skeleton } from "@/components/ui/skeleton";

const skeletonClassName = "bg-[var(--ds-gray-300)]";
const surfaceClassName =
  "overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";

export function ScheduledPostDetailPageSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0 space-y-2">
            <Skeleton className={`h-4 w-56 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-40 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="hidden gap-2 sm:flex">
            <Skeleton className={`h-9 w-20 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-20 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-24 rounded-md ${skeletonClassName}`} />
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
          <Skeleton className={`h-4 w-4 rounded-sm ${skeletonClassName}`} />
          <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
        </div>
      </div>

      <div className="space-y-5 px-4 py-6 pb-24 sm:px-6 sm:pb-8">
        <div className={surfaceClassName}>
          <Skeleton className={`h-[3px] w-full rounded-none ${skeletonClassName}`} />
          <div className="space-y-4 px-6 pt-6 pb-5">
            <div className="flex flex-wrap items-start gap-3">
              <Skeleton className={`h-7 min-w-0 flex-1 rounded-md ${skeletonClassName}`} />
              <div className="flex flex-wrap gap-2">
                <Skeleton className={`h-6 w-16 rounded-full ${skeletonClassName}`} />
                <Skeleton className={`h-6 w-24 rounded-full ${skeletonClassName}`} />
                <Skeleton className={`h-6 w-20 rounded-full ${skeletonClassName}`} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className={`h-9 w-56 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-8 w-28 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-8 w-32 rounded-md ${skeletonClassName}`} />
              <div className="flex gap-1.5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className={`h-7 w-7 rounded-lg ${skeletonClassName}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={surfaceClassName}>
                <div className="flex items-center gap-2.5 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-3.5">
                  <Skeleton className={`h-8 w-8 rounded-xl ${skeletonClassName}`} />
                  <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-3 p-5">
                  {index === 2 ? (
                    <Skeleton className={`aspect-video w-full rounded-xl ${skeletonClassName}`} />
                  ) : index === 3 ? (
                    <>
                      <div className="flex items-center divide-x divide-[var(--ds-gray-400)]">
                        <div className="flex-1 space-y-2 pr-4 text-center">
                          <Skeleton className={`mx-auto h-7 w-10 rounded-md ${skeletonClassName}`} />
                          <Skeleton className={`mx-auto h-3 w-12 rounded-md ${skeletonClassName}`} />
                        </div>
                        <div className="flex-1 space-y-2 pl-4 text-center">
                          <Skeleton className={`mx-auto h-7 w-10 rounded-md ${skeletonClassName}`} />
                          <Skeleton className={`mx-auto h-3 w-16 rounded-md ${skeletonClassName}`} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((__, rowIndex) => (
                          <div key={rowIndex} className="flex items-center gap-2.5">
                            <Skeleton className={`h-6 w-6 rounded-lg ${skeletonClassName}`} />
                            <Skeleton className={`h-4 flex-1 rounded-md ${skeletonClassName}`} />
                            <Skeleton className={`h-3 w-12 rounded-md ${skeletonClassName}`} />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    Array.from({ length: 4 }).map((__, rowIndex) => (
                      <Skeleton
                        key={rowIndex}
                        className={`h-4 rounded-md ${skeletonClassName}`}
                        style={{ width: `${rowIndex === 0 ? 90 : rowIndex === 1 ? 76 : rowIndex === 2 ? 68 : 52}%` }}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="min-w-0 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={surfaceClassName}>
                <Skeleton className={`h-[3px] w-full rounded-none ${skeletonClassName}`} />
                <div className="space-y-4 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className={`h-9 w-9 rounded-xl ${skeletonClassName}`} />
                    <Skeleton className={`h-4 flex-1 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-3 w-16 rounded-md ${skeletonClassName}`} />
                  </div>
                  <Skeleton className={`mx-auto aspect-video max-w-sm rounded-xl ${skeletonClassName}`} />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((__, chipIndex) => (
                      <Skeleton
                        key={chipIndex}
                        className={`h-9 rounded-full ${skeletonClassName}`}
                        style={{ width: `${chipIndex === 0 ? 108 : chipIndex === 1 ? 132 : chipIndex === 2 ? 118 : chipIndex === 3 ? 124 : 110}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
