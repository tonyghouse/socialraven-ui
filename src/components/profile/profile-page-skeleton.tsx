import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen w-full bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-80 rounded-md ${skeletonClassName}`} />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
          <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 sm:px-5">
            <Skeleton className={`h-4 w-20 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`mt-2 h-3 w-56 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="grid gap-3 px-3 py-3 sm:px-4 xl:grid-cols-[240px_minmax(0,1fr)]">
            <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className={`h-20 w-20 rounded-xl ${skeletonClassName}`} />
                <div className="w-full space-y-2 text-center">
                  <Skeleton className={`mx-auto h-4 w-28 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`mx-auto h-3 w-40 rounded-md ${skeletonClassName}`} />
                </div>
                <Skeleton className={`h-9 w-full rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-9 w-full rounded-md ${skeletonClassName}`} />
              </div>
            </div>

            <div className="grid gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4"
                >
                  <div className="space-y-2">
                    <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-3 w-44 rounded-md ${skeletonClassName}`} />
                  </div>
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: index === 0 ? 4 : 5 }).map((__, rowIndex) => (
                      <Skeleton
                        key={rowIndex}
                        className={`h-10 w-full rounded-md ${skeletonClassName}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
          <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 sm:px-5">
            <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`mt-2 h-3 w-44 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="px-3 py-3 sm:px-4">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className={`h-10 w-10 rounded-lg ${skeletonClassName}`} />
                    <div className="flex-1 space-y-2">
                      <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                      <Skeleton className={`h-3 w-20 rounded-full ${skeletonClassName}`} />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: index === 0 ? 3 : 5 }).map((__, rowIndex) => (
                      <Skeleton
                        key={rowIndex}
                        className={`${index === 0 && rowIndex === 2 ? "h-8" : "h-4"} w-full rounded-md ${skeletonClassName}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
          <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 sm:px-5">
            <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`mt-2 h-3 w-48 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="grid gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
              <div className="flex items-start gap-3">
                <Skeleton className={`mt-1 h-4 w-4 rounded-sm ${skeletonClassName}`} />
                <div className="flex-1 space-y-2">
                  <Skeleton className={`h-4 w-full rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-4 w-[92%] rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-4 w-[80%] rounded-md ${skeletonClassName}`} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3">
              <div className="space-y-3">
                <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
