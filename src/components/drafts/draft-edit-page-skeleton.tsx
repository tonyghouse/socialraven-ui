import { Skeleton } from "@/components/ui/skeleton";

export function DraftEditPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className={`h-8 w-16 rounded-md ${skeletonClassName}`} />
            <div className="space-y-2">
              <Skeleton className={`h-4 w-36 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-3 w-56 rounded-md ${skeletonClassName}`} />
            </div>
          </div>
          <Skeleton className={`hidden h-6 w-28 rounded-full sm:block ${skeletonClassName}`} />
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className={`h-6 w-16 rounded-full ${skeletonClassName}`} />
          <Skeleton className={`h-6 w-20 rounded-full ${skeletonClassName}`} />
          <Skeleton className={`h-6 w-24 rounded-full ${skeletonClassName}`} />
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        <div className="mb-5 rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Skeleton className={`h-10 w-10 rounded-xl ${skeletonClassName}`} />
              <div className="space-y-2">
                <Skeleton className={`h-5 w-32 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-80 max-w-full rounded-md ${skeletonClassName}`} />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className={`h-6 w-16 rounded-full ${skeletonClassName}`} />
              <Skeleton className={`h-6 w-16 rounded-full ${skeletonClassName}`} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
            >
              <div className="flex items-start gap-4 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4">
                <Skeleton className={`h-8 w-8 rounded-lg ${skeletonClassName}`} />
                <div className="flex-1 space-y-2">
                  <Skeleton className={`h-4 w-36 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-3 w-64 max-w-full rounded-md ${skeletonClassName}`} />
                </div>
              </div>
              <div className="space-y-3 px-5 py-5">
                <Skeleton className={`h-10 w-full rounded-xl ${skeletonClassName}`} />
                {index >= 2 && <Skeleton className={`h-20 w-full rounded-xl ${skeletonClassName}`} />}
                {index === 3 && <Skeleton className={`h-40 w-full rounded-xl ${skeletonClassName}`} />}
                {index === 4 && <Skeleton className={`h-11 w-full rounded-md ${skeletonClassName}`} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
