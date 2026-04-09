import {
  CollectionCardSkeleton,
  PageHeaderSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function CollectionListPageSkeleton({
  titleWidth = "w-36",
  descriptionWidth = "w-72",
  tone = "accent",
}: {
  titleWidth?: string;
  descriptionWidth?: string;
  tone?: "accent" | "success" | "neutral";
}) {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth={titleWidth} descriptionWidth={descriptionWidth} />

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-3 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 px-4 py-6 pb-24 sm:px-6 sm:pb-10 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CollectionCardSkeleton key={index} tone={tone} />
        ))}
      </div>
    </main>
  );
}

export function CollectionDetailPageSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-56" descriptionWidth="w-40" actions={3} />

      <div className="px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
          <div className="space-y-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_0.0625rem_0.125rem_rgb(0 0 0 / 0.08)]"
              >
                <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <div className="space-y-3 px-5 py-4">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-[92%] rounded-md" />
                  <Skeleton className="h-4 w-[84%] rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_0.0625rem_0.125rem_rgb(0 0 0 / 0.08)]">
            <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-4 w-56 rounded-md" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
            <div className="space-y-5 px-5 py-5">
              <Skeleton className="h-8 w-48 rounded-md" />
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
