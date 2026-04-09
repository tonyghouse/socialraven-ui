import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type PageHeaderSkeletonProps = {
  titleWidth?: string;
  descriptionWidth?: string;
  actions?: number;
  showIcon?: boolean;
};

export function PageHeaderSkeleton({
  titleWidth = "w-40",
  descriptionWidth = "w-64",
  actions = 2,
  showIcon = true,
}: PageHeaderSkeletonProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
      <div className="flex h-[3.625rem] items-center justify-between gap-3 px-4 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showIcon ? (
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-[hsl(var(--surface-raised))]" />
          ) : null}
          <div className="min-w-0 space-y-2">
            <Skeleton className={cn("h-[1.125rem] rounded-md", titleWidth)} />
            <Skeleton className={cn("h-3 rounded-md", descriptionWidth)} />
          </div>
        </div>

        {actions > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            {Array.from({ length: actions }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "h-8 rounded-lg",
                  index === actions - 1 ? "w-20" : "w-8"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

type SurfaceSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  bodyClassName?: string;
  header?: React.ReactNode;
};

export function SurfaceSkeleton({
  className,
  bodyClassName,
  header,
  children,
  ...props
}: SurfaceSkeletonProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_0.0625rem_0.125rem_rgb(0 0 0 / 0.08)]",
        className
      )}
      {...props}
    >
      {header}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function SurfaceHeaderSkeleton({
  titleWidth = "w-28",
  descriptionWidth = "w-56",
  actionWidth,
}: {
  titleWidth?: string;
  descriptionWidth?: string;
  actionWidth?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/70 px-5 py-4 dark:bg-[hsl(var(--surface-sunken))]">
      <div className="space-y-2">
        <Skeleton className={cn("h-4 rounded-md", titleWidth)} />
        <Skeleton className={cn("h-3 rounded-md", descriptionWidth)} />
      </div>
      {actionWidth ? <Skeleton className={cn("h-8 rounded-lg", actionWidth)} /> : null}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-[0_0.0625rem_0.125rem_rgb(0 0 0 / 0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-8 w-14 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

export function CollectionCardSkeleton({ tone = "accent" }: { tone?: "accent" | "success" | "neutral" }) {
  const toneClass =
    tone === "success"
      ? "bg-[hsl(var(--success))]"
      : tone === "neutral"
      ? "bg-[hsl(var(--foreground-subtle))]"
      : "bg-[hsl(var(--accent))]";

  return (
    <SurfaceSkeleton className="overflow-hidden" bodyClassName="p-0">
      <div className={cn("h-[0.1875rem]", toneClass)} />
      <div className="flex items-center justify-between px-5 pt-4">
        <Skeleton className="h-5 w-16 rounded-lg" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2 px-5 pb-3 pt-3">
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <div className="px-5 pb-3">
        <Skeleton className="h-7 w-44 rounded-xl" />
      </div>
      <div className="px-5 pb-4">
        <Skeleton className="h-[11.25rem] w-[11.25rem] rounded-xl" />
      </div>
      <div className="px-5">
        <div className="h-px bg-[hsl(var(--border-subtle))]" />
      </div>
      <div className="px-5 py-3.5">
        <Skeleton className="mb-3 h-3 w-16 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-3.5 w-16 rounded" />
      </div>
    </SurfaceSkeleton>
  );
}

export function DetailSectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <SurfaceSkeleton
      header={<SurfaceHeaderSkeleton titleWidth="w-24" descriptionWidth="w-40" />}
      bodyClassName="space-y-3"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4 rounded-md"
          style={{ width: `${100 - index * 8}%` }}
        />
      ))}
    </SurfaceSkeleton>
  );
}

export function StepSectionSkeleton({ withLargeBody = false }: { withLargeBody?: boolean }) {
  return (
    <SurfaceSkeleton
      header={<SurfaceHeaderSkeleton titleWidth="w-32" descriptionWidth="w-56" />}
      bodyClassName="space-y-3"
    >
      <Skeleton className="h-10 w-full rounded-xl" />
      {withLargeBody ? <Skeleton className="h-32 w-full rounded-xl" /> : null}
    </SurfaceSkeleton>
  );
}

export function InlineBadgeRowSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-24 rounded-full" />
      ))}
    </div>
  );
}

export function Repeated<T>({
  items,
  render,
}: {
  items: T[];
  render: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={index}>{render(item, index)}</Fragment>
      ))}
    </>
  );
}
