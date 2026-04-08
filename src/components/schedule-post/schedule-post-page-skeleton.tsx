import { Skeleton } from "@/components/ui/skeleton";

export function SchedulePostPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0 space-y-2">
            <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-72 rounded-md ${skeletonClassName}`} />
          </div>
          <Skeleton className={`h-8 w-24 rounded-full ${skeletonClassName}`} />
        </div>
      </div>

      <div className="space-y-4 px-4 py-6 sm:px-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <section
            key={index}
            className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
          >
            <div className="flex items-center gap-4 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4">
              <Skeleton className={`h-8 w-8 rounded-lg ${skeletonClassName}`} />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-3 w-64 rounded-md ${skeletonClassName}`} />
              </div>
              <Skeleton className={`h-6 w-16 rounded-full ${skeletonClassName}`} />
            </div>
            <div className="space-y-4 px-6 py-5">
              {index === 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((__, itemIndex) => (
                    <Skeleton
                      key={itemIndex}
                      className={`h-32 rounded-xl ${skeletonClassName}`}
                    />
                  ))}
                </div>
              ) : index === 1 ? (
                <>
                  <Skeleton className={`h-10 w-full rounded-md ${skeletonClassName}`} />
                  <div className="flex gap-2 overflow-hidden">
                    {Array.from({ length: 5 }).map((__, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
                        <Skeleton className={`h-16 w-[72px] rounded-xl ${skeletonClassName}`} />
                        <Skeleton className={`mx-auto h-2.5 w-10 rounded ${skeletonClassName}`} />
                      </div>
                    ))}
                  </div>
                </>
              ) : index === 2 ? (
                <>
                  <Skeleton className={`h-40 w-full rounded-xl ${skeletonClassName}`} />
                  <Skeleton className={`h-32 w-full rounded-xl ${skeletonClassName}`} />
                  <Skeleton className={`h-48 w-full rounded-xl ${skeletonClassName}`} />
                </>
              ) : (
                <>
                  <Skeleton className={`h-36 w-full rounded-xl ${skeletonClassName}`} />
                  <div className="flex gap-2">
                    <Skeleton className={`h-11 flex-1 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-11 flex-1 rounded-md ${skeletonClassName}`} />
                  </div>
                </>
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
