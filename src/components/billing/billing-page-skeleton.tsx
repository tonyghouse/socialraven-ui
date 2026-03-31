import {
  MetricCardSkeleton,
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingPageSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-36" descriptionWidth="w-72" actions={1} />

      <div className="space-y-5 px-4 py-6 sm:px-6">
        <SurfaceSkeleton
          header={<SurfaceHeaderSkeleton titleWidth="w-28" descriptionWidth="w-56" />}
          bodyClassName="space-y-4"
        >
          <Skeleton className="h-[88px] w-full rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </SurfaceSkeleton>

        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>

        <SurfaceSkeleton
          header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-48" />}
          bodyClassName="space-y-3"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[72px] w-full rounded-xl" />
          ))}
        </SurfaceSkeleton>
      </div>
    </main>
  );
}
