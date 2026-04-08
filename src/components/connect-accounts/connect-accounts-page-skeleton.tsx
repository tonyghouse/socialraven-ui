import { Skeleton } from "@/components/ui/skeleton";

export function ConnectAccountsPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen w-full bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className={`h-8 w-8 rounded-lg ${skeletonClassName}`} />
            <div className="space-y-2">
              <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-3 w-56 rounded-md ${skeletonClassName}`} />
            </div>
          </div>
          <Skeleton className={`hidden h-9 w-28 rounded-md sm:block ${skeletonClassName}`} />
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className={`h-5 w-72 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-4 w-full max-w-[42rem] rounded-md ${skeletonClassName}`} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-4"
                >
                  <Skeleton className={`h-8 w-8 rounded-md ${skeletonClassName}`} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className={`h-3 w-20 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-4 w-full rounded-md ${skeletonClassName}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
          <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-8 w-24 rounded-md ${skeletonClassName}`} />
            </div>
          </div>

          <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className={`h-10 w-10 rounded-lg ${skeletonClassName}`} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className={`h-4 w-24 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-3 w-20 rounded-md ${skeletonClassName}`} />
                  </div>
                </div>
                <Skeleton className={`mt-4 h-9 w-full rounded-md ${skeletonClassName}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
