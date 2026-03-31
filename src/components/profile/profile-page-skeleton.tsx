import {
  DetailSectionSkeleton,
  MetricCardSkeleton,
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePageSkeleton() {
  return (
    <main className="min-h-screen w-full bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-24" descriptionWidth="w-80" actions={0} />

      <div className="flex w-full flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <SurfaceSkeleton
          header={<SurfaceHeaderSkeleton titleWidth="w-20" descriptionWidth="w-56" />}
          bodyClassName="grid gap-3 px-3 py-3 sm:px-4 xl:grid-cols-[240px_minmax(0,1fr)]"
        >
          <div className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-4">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="w-full space-y-2 text-center">
                <Skeleton className="mx-auto h-4 w-28 rounded-md" />
                <Skeleton className="mx-auto h-3 w-40 rounded-md" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>

          <div className="grid gap-3">
            <DetailSectionSkeleton rows={4} />
            <DetailSectionSkeleton rows={5} />
          </div>
        </SurfaceSkeleton>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <SurfaceSkeleton
            header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-44" />}
            bodyClassName="grid gap-3 md:grid-cols-2"
          >
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </SurfaceSkeleton>

          <SurfaceSkeleton
            header={<SurfaceHeaderSkeleton titleWidth="w-28" descriptionWidth="w-40" />}
            bodyClassName="space-y-3"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </SurfaceSkeleton>
        </div>
      </div>
    </main>
  );
}
