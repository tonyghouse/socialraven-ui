import {
  MetricCardSkeleton,
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSettingsPageSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-44" descriptionWidth="w-72" actions={1} />

      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_320px]">
          <div className="space-y-5">
            <SurfaceSkeleton
              header={<SurfaceHeaderSkeleton titleWidth="w-36" descriptionWidth="w-56" />}
              bodyClassName="grid gap-3 md:grid-cols-2"
            >
              <Skeleton className="h-10 w-full rounded-lg md:col-span-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </SurfaceSkeleton>

            <SurfaceSkeleton
              header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-44" />}
              bodyClassName="grid gap-3 lg:grid-cols-2"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </SurfaceSkeleton>
          </div>

          <div className="space-y-5">
            <MetricCardSkeleton />
            <SurfaceSkeleton
              header={<SurfaceHeaderSkeleton titleWidth="w-28" descriptionWidth="w-40" />}
              bodyClassName="space-y-3"
            >
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </SurfaceSkeleton>
          </div>
        </div>
      </div>
    </main>
  );
}

export function WorkspaceSelectPageSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-lg sm:p-6">
        <div className="mb-6 text-center">
          <Skeleton className="mx-auto mb-3 h-10 w-10 rounded-xl" />
          <Skeleton className="mx-auto h-5 w-40 rounded-md" />
          <Skeleton className="mx-auto mt-2 h-4 w-36 rounded-md" />
        </div>

        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border-subtle))] px-4 py-3"
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>

        <Skeleton className="mt-4 h-10 w-full rounded-lg" />
      </div>
    </main>
  );
}

export function NoWorkspacePageSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md text-center">
        <Skeleton className="mx-auto mb-6 h-10 w-10 rounded-xl" />
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-5 w-40 rounded-md" />
        <Skeleton className="mx-auto mt-2 h-4 w-72 rounded-md" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="mx-auto h-4 w-20 rounded-md" />
        </div>
      </div>
    </main>
  );
}
