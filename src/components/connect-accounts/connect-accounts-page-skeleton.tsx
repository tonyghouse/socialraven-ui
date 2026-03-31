import {
  PageHeaderSkeleton,
  SurfaceHeaderSkeleton,
  SurfaceSkeleton,
} from "@/components/layout/page-skeleton-primitives";
import { Skeleton } from "@/components/ui/skeleton";

export function ConnectAccountsPageSkeleton() {
  return (
    <main className="min-h-screen w-full bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-40" descriptionWidth="w-72" actions={1} />

      <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <SurfaceSkeleton bodyClassName="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-72 rounded-md" />
            <Skeleton className="h-3 w-full max-w-[42rem] rounded-md" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-4"
              >
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </SurfaceSkeleton>

        <SurfaceSkeleton
          header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-48" />}
          bodyClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="mt-4 h-9 w-full rounded-lg" />
            </div>
          ))}
        </SurfaceSkeleton>
      </div>
    </main>
  );
}
