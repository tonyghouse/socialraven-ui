import {
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function CalendarPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-app-canvas">
      <PageHeaderSkeleton titleWidth="w-40" descriptionWidth="w-72" actions={4} />

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <SurfaceSkeleton
          className="h-full min-h-[640px]"
          header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-48" />}
          bodyClassName="space-y-4"
        >
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-10 rounded-md" />
            ))}
          </div>

          <div className="grid flex-1 grid-cols-7 gap-3">
            {Array.from({ length: 35 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[108px] rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-3"
              >
                <Skeleton className="mb-3 h-4 w-6 rounded-md" />
                <Skeleton className="h-7 w-full rounded-lg" />
                <Skeleton className="mt-2 h-7 w-5/6 rounded-lg" />
              </div>
            ))}
          </div>
        </SurfaceSkeleton>
      </div>
    </div>
  );
}
