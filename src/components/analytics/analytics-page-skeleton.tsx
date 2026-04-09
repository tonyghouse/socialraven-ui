import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const pageClassName = "min-h-screen bg-[var(--ds-background-200)]";
const surfaceClassName =
  "overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const dividerClassName = "border-[var(--ds-gray-400)]";

function Sk({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("bg-[var(--ds-gray-200)]", className)}
    />
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <main className={pageClassName}>
      <header className="sticky top-0 z-20 border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Sk className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="min-w-0 space-y-2">
              <Sk className="h-4 w-24 rounded-md" />
              <Sk className="h-3 w-72 rounded-md" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Sk className="h-9 w-40 rounded-lg" />
            <Sk className="h-9 w-32 rounded-lg" />
            <Sk className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <section className={cn(surfaceClassName, "p-4")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Sk className="h-4 w-28 rounded-md" />
              <Sk className="h-4 w-72 rounded-md" />
            </div>
            <div className="space-y-2">
              <Sk className="ml-auto h-3 w-20 rounded-md" />
              <Sk className="h-3 w-28 rounded-md" />
            </div>
          </div>
        </section>

        <section className={surfaceClassName}>
          <div className="p-4">
            <Sk className="h-4 w-36 rounded-md" />
            <Sk className="mt-2 h-4 w-72 rounded-md" />

            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Sk key={index} className="h-10 w-36 rounded-lg" />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <section key={index} className={cn(surfaceClassName, "p-4")}>
              <div className="flex items-center justify-between gap-3">
                <Sk className="h-8 w-8 rounded-lg" />
                <Sk className="h-6 w-16 rounded-full" />
              </div>
              <div className="mt-3">
                <Sk className="h-3 w-20 rounded-md" />
                <Sk className="mt-2 h-8 w-16 rounded-lg" />
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section className={surfaceClassName}>
            <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
              <div className="flex items-center gap-2">
                <Sk className="h-6 w-6 rounded-md" />
                <Sk className="h-4 w-36 rounded-md" />
                <Sk className="h-3 w-36 rounded-md" />
              </div>
            </div>
            <div className="p-5">
              <Sk className="h-[13.75rem] w-full rounded-xl" />
            </div>
          </section>

          <section className={surfaceClassName}>
            <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
              <div className="flex items-center gap-2">
                <Sk className="h-6 w-6 rounded-md" />
                <Sk className="h-4 w-28 rounded-md" />
              </div>
            </div>
            <div className="space-y-4 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Sk className="h-4 w-28 rounded-md" />
                    <Sk className="h-4 w-12 rounded-md" />
                  </div>
                  <Sk className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className={surfaceClassName}>
          <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sk className="h-6 w-6 rounded-md" />
                <Sk className="h-4 w-24 rounded-md" />
              </div>
              <Sk className="h-8 w-52 rounded-lg" />
            </div>
          </div>
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Sk key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
