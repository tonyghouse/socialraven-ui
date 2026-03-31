import {
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function RecoveryDraftPageSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-32" descriptionWidth="w-80" actions={1} />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <SurfaceSkeleton
            header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-56" />}
            bodyClassName="space-y-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-7 w-72 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </SurfaceSkeleton>

          <SurfaceSkeleton
            header={<SurfaceHeaderSkeleton titleWidth="w-24" descriptionWidth="w-40" />}
            bodyClassName="space-y-3"
          >
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </SurfaceSkeleton>
        </div>
      </div>
    </main>
  );
}
