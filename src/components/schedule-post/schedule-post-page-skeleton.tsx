import {
  PageHeaderSkeleton,
  StepSectionSkeleton,
} from "@/components/layout/page-skeleton-primitives";

export function SchedulePostPageSkeleton() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <PageHeaderSkeleton titleWidth="w-32" descriptionWidth="w-72" actions={1} />

      <div className="space-y-4 px-4 py-6 sm:px-6">
        <StepSectionSkeleton />
        <StepSectionSkeleton />
        <StepSectionSkeleton withLargeBody />
        <StepSectionSkeleton />
      </div>
    </main>
  );
}
