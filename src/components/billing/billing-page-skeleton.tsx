import { type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function Sk({ className }: { className?: string }) {
  return <Skeleton className={`bg-[var(--ds-gray-200)] ${className ?? ""}`} />;
}

function SectionSkeleton({
  titleWidth,
  descriptionWidth,
  children,
}: {
  titleWidth: string;
  descriptionWidth: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none">
      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4">
        <div className="space-y-2">
          <Sk className={`h-4 rounded-md ${titleWidth}`} />
          <Sk className={`h-3 rounded-md ${descriptionWidth}`} />
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  );
}

export function BillingPageSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--ds-background-200)]">
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

      <div className="space-y-5 px-4 py-6 sm:px-6">
        <SectionSkeleton titleWidth="w-28" descriptionWidth="w-64">
          <Sk className="h-[88px] w-full rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Sk className="h-20 w-full rounded-xl" />
            <Sk className="h-20 w-full rounded-xl" />
            <Sk className="h-20 w-full rounded-xl" />
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth="w-20" descriptionWidth="w-60">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4 shadow-none"
              >
                <div className="space-y-3">
                  <Sk className="h-5 w-24 rounded-md" />
                  <Sk className="h-4 w-full rounded-md" />
                  <Sk className="h-4 w-5/6 rounded-md" />
                  <Sk className="h-9 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </SectionSkeleton>

        <SectionSkeleton titleWidth="w-24" descriptionWidth="w-40">
          <Sk className="h-[72px] w-full rounded-xl" />
          <div className="overflow-hidden rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="border-b border-[var(--ds-gray-400)] px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <Sk className="h-4 w-40 rounded-md" />
                    <Sk className="h-3 w-28 rounded-md" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Sk className="h-6 w-16 rounded-full" />
                    <Sk className="h-4 w-20 rounded-md" />
                    <Sk className="h-4 w-4 rounded-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionSkeleton>
      </div>
    </main>
  );
}
