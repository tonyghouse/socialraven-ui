import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function RecoveryDraftPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";
  const surfaceClassName =
    "rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0 space-y-2">
            <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-3 w-80 rounded-md ${skeletonClassName}`} />
          </div>
          <Skeleton className={`h-9 w-20 rounded-md ${skeletonClassName}`} />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className={cn(surfaceClassName, "p-6 space-y-5")}>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className={`h-6 w-28 rounded-full ${skeletonClassName}`} />
              <Skeleton className={`h-6 w-24 rounded-full ${skeletonClassName}`} />
              <Skeleton className={`h-6 w-28 rounded-full ${skeletonClassName}`} />
            </div>
            <Skeleton className={`h-7 w-72 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-4 w-full rounded-md ${skeletonClassName}`} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className={`h-24 w-full rounded-xl ${skeletonClassName}`} />
              <Skeleton className={`h-24 w-full rounded-xl ${skeletonClassName}`} />
            </div>
            <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
              <Skeleton className={`h-3 w-28 rounded-md ${skeletonClassName}`} />
              <div className="mt-3 space-y-2">
                <Skeleton className={`h-4 w-full rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-4/5 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-2/3 rounded-md ${skeletonClassName}`} />
              </div>
            </div>
          </section>

          <aside className={cn(surfaceClassName, "p-6")}>
            <Skeleton className={`h-3 w-20 rounded-md ${skeletonClassName}`} />
            <div className="mt-3 space-y-2">
              <Skeleton className={`h-4 w-full rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-4 w-11/12 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-4 w-4/5 rounded-md ${skeletonClassName}`} />
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
                <Skeleton className={`h-3 w-36 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`mt-2 h-7 w-12 rounded-md ${skeletonClassName}`} />
              </div>
              <Skeleton className={`h-10 w-full rounded-md ${skeletonClassName}`} />
            </div>

            <Skeleton className={`mt-6 h-24 w-full rounded-xl ${skeletonClassName}`} />
          </aside>
        </div>
      </div>
    </main>
  );
}
