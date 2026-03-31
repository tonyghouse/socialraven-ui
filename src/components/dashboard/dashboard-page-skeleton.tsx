import {
  CollectionCardSkeleton,
  MetricCardSkeleton,
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-44" descriptionWidth="w-60" />

      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <SurfaceSkeleton
              header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-20" />}
              bodyClassName="p-0"
            >
              <div className="divide-y divide-[hsl(var(--border-subtle))]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3.5 px-5 py-3.5">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/4 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </SurfaceSkeleton>

            <div className="grid gap-5 md:grid-cols-2">
              <CollectionCardSkeleton tone="accent" />
              <CollectionCardSkeleton tone="success" />
            </div>
          </div>

          <div className="space-y-5">
            <SurfaceSkeleton
              header={<SurfaceHeaderSkeleton titleWidth="w-24" descriptionWidth="w-36" />}
              bodyClassName="space-y-4"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-3 w-24 rounded-md" />
                    <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </SurfaceSkeleton>

            <SurfaceSkeleton
              header={<SurfaceHeaderSkeleton titleWidth="w-28" descriptionWidth="w-32" />}
              bodyClassName="space-y-3"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <Skeleton className="h-3 w-1/3 rounded-md" />
                  </div>
                </div>
              ))}
            </SurfaceSkeleton>
          </div>
        </div>
      </div>
    </main>
  );
}
