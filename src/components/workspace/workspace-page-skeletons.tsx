import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSettingsPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
      <header className="sticky top-0 z-20 border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
              <Skeleton className={`h-4 w-4 rounded-md ${skeletonClassName}`} />
            </div>
            <div className="min-w-0 space-y-2">
              <Skeleton className={`h-4 w-44 rounded-md ${skeletonClassName}`} />
              <Skeleton className={`h-3 w-64 rounded-md ${skeletonClassName}`} />
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Skeleton className={`h-8 w-32 rounded-md ${skeletonClassName}`} />
            <Skeleton className={`h-8 w-24 rounded-md ${skeletonClassName}`} />
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
              <div className="flex items-start gap-3 border-b border-[var(--ds-gray-400)] px-4 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)]">
                  <Skeleton className={`h-4 w-4 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-2">
                  <Skeleton className={`h-4 w-36 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-3 w-48 rounded-md ${skeletonClassName}`} />
                </div>
              </div>
              <div className="space-y-3 p-4">
                <Skeleton className={`h-10 w-full rounded-xl ${skeletonClassName}`} />
                <Skeleton className={`h-8 w-32 rounded-md ${skeletonClassName}`} />
                <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
                  <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`mt-2 h-4 w-40 rounded-md ${skeletonClassName}`} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
              <div className="flex items-start gap-3 border-b border-[var(--ds-gray-400)] px-4 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)]">
                  <Skeleton className={`h-4 w-4 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-2">
                  <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-3 w-56 rounded-md ${skeletonClassName}`} />
                </div>
              </div>
              <div className="space-y-4 p-4">
                <Skeleton className={`h-10 w-full rounded-md ${skeletonClassName}`} />
                <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className={`h-4 w-44 rounded-md ${skeletonClassName}`} />
                      <Skeleton className={`h-3 w-52 rounded-md ${skeletonClassName}`} />
                    </div>
                    <Skeleton className={`h-4 w-4 rounded ${skeletonClassName}`} />
                  </div>
                </div>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-3"
                  >
                    <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`mt-2 h-3 w-full rounded-md ${skeletonClassName}`} />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Skeleton className={`h-8 w-28 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-8 w-20 rounded-md ${skeletonClassName}`} />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--ds-gray-400)] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)]">
                    <Skeleton className={`h-4 w-4 rounded-md ${skeletonClassName}`} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-3 w-44 rounded-md ${skeletonClassName}`} />
                  </div>
                </div>
                <Skeleton className={`h-8 w-28 rounded-md ${skeletonClassName}`} />
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
                  <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <Skeleton className={`h-9 w-full rounded-md ${skeletonClassName}`} />
                    <Skeleton className={`h-9 w-full rounded-md ${skeletonClassName}`} />
                  </div>
                </div>

                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className={`h-10 w-10 rounded-full ${skeletonClassName}`} />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className={`h-4 w-36 rounded-md ${skeletonClassName}`} />
                        <Skeleton className={`h-3 w-48 rounded-md ${skeletonClassName}`} />
                      </div>
                      <Skeleton className={`h-8 w-24 rounded-md ${skeletonClassName}`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
              <div className="flex items-start gap-3 border-b border-[var(--ds-gray-400)] px-4 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                  <Skeleton className={`h-4 w-4 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="space-y-2">
                  <Skeleton className={`h-4 w-36 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`h-3 w-40 rounded-md ${skeletonClassName}`} />
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
                  <Skeleton className={`h-4 w-40 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`mt-2 h-3 w-44 rounded-md ${skeletonClassName}`} />
                </div>
                <div className="rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] p-4">
                  <Skeleton className={`h-4 w-28 rounded-md ${skeletonClassName}`} />
                  <Skeleton className={`mt-3 h-8 w-36 rounded-md ${skeletonClassName}`} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export function WorkspaceSelectPageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-background-200)_100%)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-sm sm:p-6">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] shadow-sm">
              <Skeleton className={`h-7 w-7 rounded-lg ${skeletonClassName}`} />
            </div>
          </div>
          <Skeleton className={`mx-auto h-6 w-40 rounded-md ${skeletonClassName}`} />
          <Skeleton className={`mx-auto mt-2 h-4 w-36 rounded-md ${skeletonClassName}`} />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3"
            >
              <Skeleton className={`h-9 w-9 rounded-lg ${skeletonClassName}`} />
              <div className="flex-1 space-y-2">
                <Skeleton className={`h-4 w-32 rounded-md ${skeletonClassName}`} />
                <Skeleton className={`h-3 w-16 rounded-md ${skeletonClassName}`} />
              </div>
              <Skeleton className={`h-4 w-4 rounded-full ${skeletonClassName}`} />
            </div>
          ))}
        </div>

        <Skeleton className={`mt-4 h-10 w-full rounded-md ${skeletonClassName}`} />
      </div>
    </main>
  );
}

export function NoWorkspacePageSkeleton() {
  const skeletonClassName = "bg-[var(--ds-gray-300)]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-background-200)_100%)] p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
            <Skeleton className={`h-7 w-7 rounded-lg ${skeletonClassName}`} />
          </div>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)]">
            <Skeleton className={`h-8 w-8 rounded-full ${skeletonClassName}`} />
          </div>
        </div>
        <Skeleton className={`mx-auto h-6 w-40 rounded-md ${skeletonClassName}`} />
        <Skeleton className={`mx-auto mt-3 h-4 w-72 rounded-md ${skeletonClassName}`} />
        <Skeleton className={`mx-auto mt-2 h-4 w-60 rounded-md ${skeletonClassName}`} />
        <div className="mt-8 space-y-3">
          <Skeleton className={`h-11 w-full rounded-md ${skeletonClassName}`} />
          <Skeleton className={`h-11 w-full rounded-md ${skeletonClassName}`} />
          <Skeleton className={`mx-auto h-4 w-20 rounded-md ${skeletonClassName}`} />
        </div>
      </div>
    </main>
  );
}
