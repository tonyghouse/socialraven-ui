import { type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

function Sk({ className }: { className?: string }) {
  return <Skeleton className={`bg-[var(--ds-gray-200)] ${className ?? ""}`} />;
}

function SectionSkeleton({
  labelWidth,
  titleWidth,
  children,
}: {
  labelWidth: string;
  titleWidth: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full border-t border-[var(--ds-gray-400)] pt-5 sm:pt-6">
      <div className="pb-4">
        <div className="space-y-2">
          <Sk className={`h-3 rounded-md ${labelWidth}`} />
          <Sk className={`h-5 rounded-md ${titleWidth}`} />
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function BillingPageSkeleton() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--ds-background-200)_0%,var(--ds-background-100)_15rem,var(--ds-background-100)_100%)]">
      <div className="sticky top-0 z-20 border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 backdrop-blur-sm">
        <div className="flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Sk className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="min-w-0 space-y-2">
              <Sk className="h-4 w-36 rounded-md" />
              <Sk className="h-3 w-72 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <SectionSkeleton labelWidth="w-24" titleWidth="w-28">
            <Sk className="h-[248px] w-full rounded-2xl sm:h-[220px] lg:h-[164px]" />
            <div className="grid overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] divide-y divide-[var(--ds-gray-400)] md:grid-cols-3 md:divide-x md:divide-y-0">
              <Sk className="h-[116px] rounded-none" />
              <Sk className="h-[116px] rounded-none" />
              <Sk className="h-[116px] rounded-none" />
            </div>
          </SectionSkeleton>

          <SectionSkeleton labelWidth="w-16" titleWidth="w-40">
            <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] md:rounded-none md:border-0">
              <div className="divide-y divide-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-4 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3">
                          <Sk className="h-10 w-10 rounded-xl" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <Sk className="h-5 w-40 rounded-md" />
                            <Sk className="h-4 w-72 rounded-md" />
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Sk className="h-4 w-full rounded-md" />
                          <Sk className="h-4 w-full rounded-md" />
                          <Sk className="h-4 w-full rounded-md" />
                          <Sk className="h-4 w-full rounded-md" />
                        </div>
                      </div>
                      <div className="space-y-3 xl:w-[220px]">
                        <Sk className="h-8 w-28 rounded-md" />
                        <Sk className="h-9 w-full rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionSkeleton>

          <SectionSkeleton labelWidth="w-20" titleWidth="w-24">
            <Sk className="h-[96px] w-full rounded-xl" />
            <Sk className="h-[84px] w-full rounded-xl" />
            <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
              <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
                <Sk className="h-3 w-40 rounded-md" />
              </div>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 border-b border-[var(--ds-gray-400)] px-4 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4 md:items-center">
                    <div className="min-w-0 space-y-2">
                      <Sk className="h-4 w-40 rounded-md" />
                      <Sk className="h-3 w-24 rounded-md" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Sk className="h-4 w-20 rounded-md md:hidden" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:hidden">
                    <Sk className="h-6 w-16 rounded-full" />
                    <Sk className="h-4 w-24 rounded-md" />
                  </div>
                  <div className="hidden items-center gap-3 md:flex md:justify-end">
                    <Sk className="h-6 w-16 rounded-full" />
                    <Sk className="h-4 w-20 rounded-md" />
                    <Sk className="h-4 w-4 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </SectionSkeleton>
        </div>
      </div>
    </main>
  );
}
