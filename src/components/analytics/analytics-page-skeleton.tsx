import {
  MetricCardSkeleton,
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsPageSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-24" descriptionWidth="w-72" actions={1} />

      <div className="space-y-5 px-4 py-6 sm:px-6">
        <SurfaceSkeleton
          header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-48" />}
          bodyClassName="space-y-4"
        >
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-28 rounded-full" />
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <MetricCardSkeleton key={index} />
            ))}
          </div>
        </SurfaceSkeleton>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <SurfaceSkeleton
            header={<SurfaceHeaderSkeleton titleWidth="w-36" descriptionWidth="w-56" />}
            bodyClassName="space-y-4"
          >
            <Skeleton className="h-64 w-full rounded-xl" />
          </SurfaceSkeleton>

          <SurfaceSkeleton
            header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-40" />}
            bodyClassName="space-y-3"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-10 rounded-md" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </SurfaceSkeleton>
        </div>
      </div>
    </main>
  );
}
