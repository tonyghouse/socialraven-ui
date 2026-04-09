import { Skeleton } from "@/components/ui/skeleton";

export function DraftDetailPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Skeleton className={`h-4 w-56 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-52 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="hidden gap-2 sm:flex">
            <Skeleton className={`h-9 w-16 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-20 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-28 rounded-md ${skeletonClassName}`} />
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className={`h-6 w-16 rounded-full ${skeletonClassName}`} />
          <Skeleton className={`h-6 w-20 rounded-full ${skeletonClassName}`} />
          <Skeleton className={`h-6 w-28 rounded-full ${skeletonClassName}`} />
        </div>
      </div>

      <div className="px-4 py-6 pb-24 sm:px-6 sm:pb-8">
        <div className="grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
              >
                <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4">
                  <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-3 px-5 py-4">
                  {Array.from({ length: index === 2 ? 1 : 3 }).map((__, rowIndex) => (
                    <Skeleton
                      key={rowIndex}
                      className={`h-4 ${index === 2 ? "w-full aspect-video rounded-xl" : "w-full rounded-md"} ${skeletonClassName}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
              <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className={`h-10 w-10 rounded-lg ${skeletonClassName}`} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className={`h-4 w-48 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-3 w-64 rounded-md ${skeletonClassName}`} />
                  </div>
                  <Skeleton className={`h-9 w-24 rounded-md ${skeletonClassName}`} />
                </div>
              </div>
              <div className="space-y-4 px-5 py-5">
                <Skeleton className={`h-24 w-full rounded-xl ${skeletonClassName}`} />
                <Skeleton className={`h-14 w-full rounded-xl ${skeletonClassName}`} />
                <Skeleton className={`h-40 w-full rounded-xl ${skeletonClassName}`} />
              </div>
            </div>

            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
              >
                <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4">
                  <Skeleton className={`h-4 w-36 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-3 px-5 py-4">
                  <Skeleton className={`h-20 w-full rounded-xl ${skeletonClassName}`} />
                  <Skeleton className={`h-12 w-full rounded-xl ${skeletonClassName}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
