import { Skeleton } from "@/components/ui/skeleton";

export function PostDetailPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0 space-y-2">
            <Skeleton className={`h-4 w-56 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-44 rounded-md ${skeletonClassName}`} />
          </div>
          <Skeleton className={`h-6 w-24 rounded-full ${skeletonClassName}`} />
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
          <Skeleton className={`h-4 w-4 rounded-sm ${skeletonClassName}`} />
          <Skeleton className={`h-4 w-20 rounded-md ${skeletonClassName}`} />
          <Skeleton className={`h-4 w-4 rounded-sm ${skeletonClassName}`} />
          <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
              <div className={`h-0.5 w-full ${skeletonClassName}`} />
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className={`h-6 w-6 rounded-lg ${skeletonClassName}`} />
                    <Skeleton className={`h-4 w-36 rounded-md ${skeletonClassName}`} />
                  </div>
                  <Skeleton className={`h-6 w-20 rounded-full ${skeletonClassName}`} />
                </div>
                <div className="space-y-4 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className={`h-10 w-10 rounded-full ${skeletonClassName}`} />
                    <div className="flex-1 space-y-2">
                      <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                      <Skeleton className={`h-3 w-20 rounded-md ${skeletonClassName}`} />
                    </div>
                  </div>
                  <Skeleton className={`aspect-video w-full rounded-xl ${skeletonClassName}`} />
                  <div className="space-y-2">
                    {[100, 82, 60].map((width, index) => (
                      <Skeleton
                        key={index}
                        className={`h-3 rounded-md ${skeletonClassName}`}
                        style={{ width: `${width}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className={`h-8 w-8 rounded-xl ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-16 rounded-md ${skeletonClassName}`} />
              </div>
              <div className="space-y-2.5">
                {[100, 93, 86, 97, 79].map((width, index) => (
                  <Skeleton
                    key={index}
                    className={`h-3.5 rounded-md ${skeletonClassName}`}
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <Skeleton className={`h-8 w-8 rounded-xl ${skeletonClassName}`} />
                  <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-3">
                  {index === 0 ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-3">
                      <Skeleton className={`h-12 w-12 rounded-full ${skeletonClassName}`} />
                      <div className="flex-1 space-y-2">
                        <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                        <Skeleton className={`h-3 w-20 rounded-md ${skeletonClassName}`} />
                      </div>
                    </div>
                  ) : index === 1 ? (
                    <>
                      <div className="space-y-1.5">
                        <Skeleton className={`h-3 w-16 rounded-md ${skeletonClassName}`} />
                        <Skeleton className={`h-4 w-44 rounded-md ${skeletonClassName}`} />
                        <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
                      </div>
                      <Skeleton className={`h-9 w-full rounded-xl ${skeletonClassName}`} />
                    </>
                  ) : (
                    Array.from({ length: 3 }).map((__, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="flex items-center justify-between border-b border-[var(--ds-gray-400)] py-2 last:border-b-0"
                      >
                        <Skeleton className={`h-3 w-16 rounded-md ${skeletonClassName}`} />
                        <Skeleton className={`h-3 w-20 rounded-md ${skeletonClassName}`} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Skeleton className={`h-8 w-8 rounded-xl ${skeletonClassName}`} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-3 w-40 rounded-md ${skeletonClassName}`} />
                </div>
                <Skeleton className={`h-4 w-4 rounded-sm ${skeletonClassName}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
