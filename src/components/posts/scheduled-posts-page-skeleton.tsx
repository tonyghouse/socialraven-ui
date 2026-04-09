import { Skeleton } from "@/components/ui/skeleton";

export function ScheduledPostsPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-80 rounded-md ${skeletonClassName}`} />
          </div>
          <div className="hidden gap-2 sm:flex">
            <Skeleton className={`h-9 w-9 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-9 w-24 rounded-md ${skeletonClassName}`} />
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <Skeleton className={`h-6 w-28 rounded-full ${skeletonClassName}`} />
          <Skeleton className={`h-6 w-24 rounded-full ${skeletonClassName}`} />
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,minmax(0,max-content))]">
          <Skeleton className={`h-9 w-full rounded-lg ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-36 rounded-lg ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-36 rounded-lg ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-32 rounded-lg ${skeletonClassName}`} />
          <Skeleton className={`h-9 w-28 rounded-lg ${skeletonClassName}`} />
        </div>
      </div>

      <div className="px-4 py-6 pb-24 sm:px-6 sm:pb-10">
        <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <section
              key={index}
              className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
            >
              <div className="h-[0.1875rem] bg-[var(--ds-blue-500)]" />
              <div className="flex items-center justify-between px-5 pt-4">
                <Skeleton className={`h-5 w-16 rounded-lg ${skeletonClassName}`} />
                <Skeleton className={`h-5 w-20 rounded-full ${skeletonClassName}`} />
              </div>
              <div className="space-y-2 px-5 pb-3 pt-3">
                <Skeleton className={`h-5 w-4/5 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-full rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-2/3 rounded-md ${skeletonClassName}`} />
              </div>
              <div className="px-5 pb-3">
                <Skeleton className={`h-7 w-44 rounded-xl ${skeletonClassName}`} />
              </div>
              <div className="px-5 pb-4">
                <Skeleton className={`h-[11.25rem] w-[11.25rem] rounded-xl ${skeletonClassName}`} />
              </div>
              <div className="px-5">
                <div className="h-px bg-[var(--ds-gray-400)]" />
              </div>
              <div className="px-5 py-3.5">
                <Skeleton className={`mb-3 h-3 w-16 rounded ${skeletonClassName}`} />
                <div className="flex gap-2">
                  <Skeleton className={`h-8 w-8 rounded-xl ${skeletonClassName}`} />
                  <Skeleton className={`h-8 w-8 rounded-xl ${skeletonClassName}`} />
                  <Skeleton className={`h-8 w-8 rounded-xl ${skeletonClassName}`} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-3">
                <Skeleton className={`h-3.5 w-32 rounded ${skeletonClassName}`} />
                <Skeleton className={`h-3.5 w-16 rounded ${skeletonClassName}`} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
