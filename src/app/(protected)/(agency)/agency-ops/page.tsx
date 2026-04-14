"use client";

import Link from "next/link";
import { type ComponentType, type ReactNode, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Clock3,
  RefreshCw,
  ShieldAlert,
  Users2,
} from "lucide-react";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fetchAgencyOpsApi } from "@/service/agencyOps";
import type {
  AgencyOpsDueWindow,
  AgencyOpsPublishRiskItem,
  AgencyOpsQueueStatusFilter,
  AgencyOpsQueueItem,
  AgencyOpsResponse,
  AgencyOpsWorkspaceHealth,
} from "@/model/AgencyOps";
import { useRole } from "@/hooks/useRole";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const pageClassName = "min-h-screen bg-[var(--ds-background-200)]";
const surfaceClassName =
  "overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const dividerClassName = "border-[var(--ds-gray-400)]";
const subtleButtonClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

const toneClassNames: Record<Tone, string> = {
  neutral:
    "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  info: "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]",
  success:
    "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
  warning:
    "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
  danger: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function relativeScheduleLabel(value: string | null | undefined) {
  if (!value) return "No scheduled time";

  const diffMs = new Date(value).getTime() - Date.now();
  if (diffMs < 0) return "Past due";

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Under 1 hour";
  if (hours < 24) return `In ${hours}h`;

  const days = Math.floor(diffMs / 86_400_000);
  if (days === 1) return "Tomorrow";
  return `In ${days}d`;
}

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function detailHref(item: AgencyOpsQueueItem | AgencyOpsPublishRiskItem) {
  if (
    "riskType" in item &&
    (item.riskType === "RECOVERY_REQUIRED" || item.riskType === "PUBLISH_ESCALATED")
  ) {
    return `/scheduled-posts/${item.collectionId}`;
  }
  return `/drafts/${item.collectionId}`;
}

function toneForAttention(status: AgencyOpsQueueItem["attentionStatus"]) {
  switch (status) {
    case "ESCALATED":
      return "danger";
    case "OVERDUE":
      return "warning";
    default:
      return "info";
  }
}

function toneForSeverity(severity: AgencyOpsPublishRiskItem["severity"]) {
  switch (severity) {
    case "HIGH":
      return "danger";
    case "MEDIUM":
      return "warning";
    default:
      return "neutral";
  }
}

function toneForHealth(status: AgencyOpsWorkspaceHealth["healthStatus"]) {
  switch (status) {
    case "CRITICAL":
      return "danger";
    case "WATCH":
      return "warning";
    default:
      return "success";
  }
}

function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 text-label-12 font-medium shadow-none",
        toneClassNames[tone],
        className
      )}
    >
      {children}
    </Badge>
  );
}

function InlineNotice({
  tone,
  title,
  children,
}: {
  tone: "warning" | "error";
  title: string;
  children: ReactNode;
}) {
  const Icon = tone === "error" ? ShieldAlert : AlertTriangle;
  const toneClassName =
    tone === "error"
      ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)]"
      : "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)]";

  return (
    <section role="alert" className={cn("rounded-xl border p-4", toneClassName)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            tone === "error" ? toneClassNames.danger : toneClassNames.warning
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</p>
          <div className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">{children}</div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  tone: Tone;
}) {
  return (
    <section className={cn(surfaceClassName, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-12 text-[var(--ds-gray-900)]">{title}</p>
          <p className="mt-2 text-heading-32 text-[var(--ds-gray-1000)]">{value}</p>
          <p className="mt-1 text-copy-13 text-[var(--ds-gray-900)]">{detail}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            toneClassNames[tone]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}

function PageSkeleton() {
  return (
    <main className={pageClassName}>
      <div className="space-y-5 px-4 py-5 sm:px-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <section key={index} className={cn(surfaceClassName, "p-4")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20 rounded-md bg-[var(--ds-gray-200)]" />
                  <Skeleton className="h-8 w-16 rounded-lg bg-[var(--ds-gray-200)]" />
                  <Skeleton className="h-4 w-32 rounded-md bg-[var(--ds-gray-200)]" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl bg-[var(--ds-gray-200)]" />
              </div>
            </section>
          ))}
        </div>

        <section className={cn(surfaceClassName, "p-4")}>
          <div className={cn("flex flex-wrap items-center gap-2 pb-4", "border-b", dividerClassName)}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-28 rounded-full bg-[var(--ds-gray-200)]" />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md bg-[var(--ds-gray-200)]" />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
          <section className={surfaceClassName}>
            <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
              <Skeleton className="h-4 w-56 rounded-md bg-[var(--ds-gray-200)]" />
              <Skeleton className="mt-2 h-4 w-72 rounded-md bg-[var(--ds-gray-200)]" />
            </div>
            <div className="space-y-4 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-56 rounded-md bg-[var(--ds-gray-200)]" />
                      <Skeleton className="h-4 w-48 rounded-md bg-[var(--ds-gray-200)]" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded-md bg-[var(--ds-gray-200)]" />
                  </div>
                  {index < 3 ? <div className={cn("h-px", dividerClassName)} /> : null}
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <section key={index} className={surfaceClassName}>
                <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
                  <Skeleton className="h-4 w-40 rounded-md bg-[var(--ds-gray-200)]" />
                  <Skeleton className="mt-2 h-4 w-56 rounded-md bg-[var(--ds-gray-200)]" />
                </div>
                <div className="space-y-3 p-5">
                  {Array.from({ length: 3 }).map((_, itemIndex) => (
                    <Skeleton
                      key={itemIndex}
                      className="h-14 w-full rounded-xl bg-[var(--ds-gray-200)]"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AgencyOpsPage() {
  const { getToken } = useAuth();
  const { canSeeAgencyOps } = useRole();
  const requestSequence = useRef(0);

  const [data, setData] = useState<AgencyOpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaceFilter, setWorkspaceFilter] = useState("ALL");
  const [approverFilter, setApproverFilter] = useState("ALL");
  const [queueStatusFilter, setQueueStatusFilter] = useState<AgencyOpsQueueStatusFilter>("ALL");
  const [dueWindow, setDueWindow] = useState<AgencyOpsDueWindow>("ALL");

  async function load(isManualRefresh = false) {
    const requestId = ++requestSequence.current;
    if (isManualRefresh || data) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetchAgencyOpsApi(getToken, {
        workspaceId: workspaceFilter,
        approverUserId: approverFilter,
        status: queueStatusFilter,
        dueWindow,
        timezone: browserTimeZone(),
      });
      if (requestId !== requestSequence.current) return;
      setData(response);
    } catch {
      if (requestId !== requestSequence.current) return;
      setError("Unable to load the agency operations dashboard. Please try again.");
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceFilter, approverFilter, queueStatusFilter, dueWindow]);

  if (!canSeeAgencyOps) {
    return (
      <main className={pageClassName}>
        <ProtectedPageHeader
          title="Agency Ops"
          description="Cross-workspace approvals, workload, and publish risk."
          icon={<BriefcaseBusiness className="h-4 w-4" />}
        />
        <div className="px-4 py-6 sm:px-6">
          <InlineNotice tone="warning" title="Approval workflow access required">
            This portfolio view is only available to teammates who can work inside approval queues.
          </InlineNotice>
        </div>
      </main>
    );
  }

  if (loading && !data) {
    return (
      <>
        <ProtectedPageHeader
          title="Agency Ops"
          description="Cross-workspace approvals, workload, and publish risk."
          icon={<BriefcaseBusiness className="h-4 w-4" />}
        />
        <PageSkeleton />
      </>
    );
  }

  return (
    <main className={pageClassName}>
      <ProtectedPageHeader
        title="Agency Ops"
        description="Run the full client portfolio from one queue instead of workspace by workspace."
        icon={<BriefcaseBusiness className="h-4 w-4" />}
        actions={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => load(true)}
            disabled={refreshing}
            aria-label="Refresh agency operations"
            title="Refresh"
            className={cn("h-9 w-9 rounded-md", subtleButtonClassName)}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </Button>
        }
      />

      <div className="space-y-5 px-4 py-5 pb-24 sm:px-5 sm:pb-10">
        {error && (
          <InlineNotice tone="error" title={error}>
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => load()}
                className={cn("rounded-md", subtleButtonClassName)}
              >
                Retry
              </Button>
            </div>
          </InlineNotice>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Pending Queue"
                value={data.summary.pendingApprovalCount}
                detail={`${data.summary.workspaceCount} accessible workspaces in scope`}
                icon={Clock3}
                tone="info"
              />
              <StatCard
                title="Overdue Reviews"
                value={data.summary.overdueApprovalCount}
                detail={`${data.overdueQueue.length} items need follow-up in this slice`}
                icon={AlertTriangle}
                tone="warning"
              />
              <StatCard
                title="Escalations"
                value={data.summary.escalatedApprovalCount}
                detail="Filtered items already beyond reminder thresholds"
                icon={ShieldAlert}
                tone="danger"
              />
              <StatCard
                title="Publish Risk"
                value={data.summary.atRiskPublishCount}
                detail="Upcoming delivery risk in the current portfolio slice"
                icon={Users2}
                tone="neutral"
              />
            </div>

            <section className={cn(surfaceClassName, "p-4")}>
              <div className={cn("flex flex-wrap items-center gap-2 pb-4", "border-b", dividerClassName)}>
                <ToneBadge tone="info">{data.queue.length} queue items</ToneBadge>
                <ToneBadge tone="warning">{data.publishRisk.length} risk items</ToneBadge>
                <ToneBadge tone="neutral">{data.summary.approverCount} active approvers</ToneBadge>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FilterSelect
                  label="Client"
                  value={workspaceFilter}
                  onValueChange={setWorkspaceFilter}
                  options={[
                    { value: "ALL", label: "All workspaces" },
                    ...data.workspaces.map((workspace) => ({
                      value: workspace.workspaceId,
                      label: workspace.companyName
                        ? `${workspace.workspaceName} · ${workspace.companyName}`
                        : workspace.workspaceName,
                    })),
                  ]}
                />
                <FilterSelect
                  label="Approver"
                  value={approverFilter}
                  onValueChange={setApproverFilter}
                  options={[
                    { value: "ALL", label: "All approvers" },
                    ...data.approvers.map((approver) => ({
                      value: approver.userId,
                      label: approver.displayName,
                    })),
                  ]}
                />
                <FilterSelect
                  label="Status"
                  value={queueStatusFilter}
                  onValueChange={(value) => setQueueStatusFilter(value as AgencyOpsQueueStatusFilter)}
                  options={[
                    { value: "ALL", label: "All queue states" },
                    { value: "PENDING", label: "Pending" },
                    { value: "OVERDUE", label: "Overdue" },
                    { value: "ESCALATED", label: "Escalated" },
                  ]}
                />
                <FilterSelect
                  label="Due Window"
                  value={dueWindow}
                  onValueChange={(value) => setDueWindow(value as AgencyOpsDueWindow)}
                  options={[
                    { value: "ALL", label: "All dates" },
                    { value: "TODAY", label: "Due today" },
                    { value: "NEXT_24_HOURS", label: "Next 24 hours" },
                    { value: "NEXT_7_DAYS", label: "Next 7 days" },
                    { value: "OVERDUE", label: "Past due" },
                  ]}
                />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
              <section className={surfaceClassName}>
                <div className={cn("flex items-center justify-between px-4 py-3.5", "border-b", dividerClassName)}>
                  <div>
                    <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">Cross-Workspace Approval Queue</h2>
                    <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                      Filter by client, approver, due window, or escalation state without switching workspaces.
                    </p>
                  </div>
                </div>

                {data.queue.length === 0 ? (
                  <EmptyPanel
                    title="No queue items match the current filters"
                    description="Adjust the filters or refresh the snapshot to review a wider portfolio slice."
                  />
                ) : (
                  <div className={cn("divide-y", dividerClassName)}>
                    {data.queue.map((item) => (
                      <Link
                        key={item.collectionId}
                        href={detailHref(item)}
                        className="block px-4 py-3.5 transition-colors hover:bg-[var(--ds-gray-100)]"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                                {item.description || "Untitled content"}
                              </p>
                              <ToneBadge tone={toneForAttention(item.attentionStatus)} className="px-2 py-0.5">
                                {item.attentionStatus.toLowerCase()}
                              </ToneBadge>
                            </div>

                            <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                              {item.workspaceName}
                              {item.companyName ? ` · ${item.companyName}` : ""} · {item.channelCount ?? 0} channel
                              {(item.channelCount ?? 0) === 1 ? "" : "s"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2 text-label-12 text-[var(--ds-gray-900)]">
                              <span>Scheduled: {formatDateTime(item.scheduledTime)}</span>
                              <span>Submitted: {formatDateTime(item.reviewSubmittedAt)}</span>
                              {item.nextApprovalStage && <span>Stage: {item.nextApprovalStage.replace("_", " ")}</span>}
                              {item.platforms.length > 0 && <span>Platforms: {item.platforms.join(", ")}</span>}
                            </div>
                          </div>

                          <div className="shrink-0 text-label-13 text-[var(--ds-gray-900)]">
                            {relativeScheduleLabel(item.scheduledTime)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <div className="space-y-5">
                <section className={surfaceClassName}>
                  <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
                    <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">Overdue Review Board</h2>
                    <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                      Items already beyond reminder timing or already escalated.
                    </p>
                  </div>

                  {data.overdueQueue.length === 0 ? (
                    <EmptyPanel title="No overdue reviews" description="Reminder and escalation thresholds are currently under control." compact />
                  ) : (
                    <div className={cn("divide-y", dividerClassName)}>
                      {data.overdueQueue.slice(0, 6).map((item) => (
                        <Link
                          key={item.collectionId}
                          href={detailHref(item)}
                          className="block px-5 py-4 transition-colors hover:bg-[var(--ds-gray-100)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                                {item.description || "Untitled content"}
                              </p>
                              <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                                {item.workspaceName} · {formatDateTime(item.scheduledTime)}
                              </p>
                            </div>
                            <ToneBadge
                              tone={toneForAttention(item.attentionStatus)}
                              className="shrink-0 px-2 py-0.5 text-label-12"
                            >
                              {item.attentionStatus.toLowerCase()}
                            </ToneBadge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                <section className={surfaceClassName}>
                  <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
                    <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">Approver Workload</h2>
                    <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                      Estimated review load per approver across the current portfolio snapshot.
                    </p>
                  </div>

                  {data.workload.length === 0 ? (
                    <EmptyPanel title="No active review load" description="Eligible approvers have no pending work right now." compact />
                  ) : (
                    <div className={cn("divide-y", dividerClassName)}>
                      {data.workload.map((item) => (
                        <div key={item.userId} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                                {item.displayName}
                              </p>
                              <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">
                                {item.workspaceCount} workspaces · next due {formatDateTime(item.nextDueAt)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <ToneBadge tone="neutral" className="px-2 py-0.5">
                                {item.pendingApprovalCount} pending
                              </ToneBadge>
                              {item.overdueApprovalCount > 0 && (
                                <ToneBadge tone="warning" className="px-2 py-0.5">
                                  {item.overdueApprovalCount} overdue
                                </ToneBadge>
                              )}
                              {item.escalatedApprovalCount > 0 && (
                                <ToneBadge tone="danger" className="px-2 py-0.5">
                                  {item.escalatedApprovalCount} escalated
                                </ToneBadge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>

            <section className={surfaceClassName}>
              <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
                <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">Upcoming Publish Risk</h2>
                <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                  Approval bottlenecks and delivery failures that could miss a client publish window.
                </p>
              </div>

              {data.publishRisk.length === 0 ? (
                <EmptyPanel
                  title="No publish risk for the current filter set"
                  description="The filtered portfolio slice does not show near-term approval or recovery risk."
                />
              ) : (
                <div className={cn("divide-y", dividerClassName)}>
                  {data.publishRisk.map((item) => (
                    <Link
                      key={`${item.riskType}-${item.collectionId}`}
                      href={detailHref(item)}
                      className="block px-5 py-4 transition-colors hover:bg-[var(--ds-gray-100)]"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                              {item.description || "Untitled content"}
                            </p>
                            <ToneBadge tone={toneForSeverity(item.severity)} className="px-2 py-0.5">
                              {item.severity.toLowerCase()}
                            </ToneBadge>
                          </div>
                          <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                            {item.workspaceName}
                            {item.companyName ? ` · ${item.companyName}` : ""} · {item.riskType.replaceAll("_", " ").toLowerCase()}
                          </p>
                          <p className="mt-2 text-copy-14 text-[var(--ds-gray-1000)]">{item.reason}</p>
                        </div>
                        <div className="shrink-0 text-label-13 text-[var(--ds-gray-900)]">
                          {relativeScheduleLabel(item.scheduledTime)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className={surfaceClassName}>
              <div className={cn("px-5 py-4", "border-b", dividerClassName)}>
                <h2 className="text-heading-16 text-[var(--ds-gray-1000)]">Workspace Health</h2>
                <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                  Portfolio roll-up by client workspace so overload and escalation hotspots are obvious.
                </p>
              </div>

              {data.workspaceHealth.length === 0 ? (
                <EmptyPanel
                  title="No workspace hotspots in the current slice"
                  description="The selected filters do not leave any workspace with active approval or publish-risk counts."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={cn("border-b text-left", dividerClassName, "text-label-12 text-[var(--ds-gray-900)]")}>
                        <th className="px-5 py-3 font-medium">Workspace</th>
                        <th className="px-4 py-3 font-medium">Pending</th>
                        <th className="px-4 py-3 font-medium">Overdue</th>
                        <th className="px-4 py-3 font-medium">Escalated</th>
                        <th className="px-4 py-3 font-medium">Changes</th>
                        <th className="px-4 py-3 font-medium">Risk</th>
                        <th className="px-5 py-3 font-medium">Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.workspaceHealth.map((item) => (
                        <tr
                          key={item.workspaceId}
                          className={cn("border-b last:border-b-0", dividerClassName)}
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-label-14 text-[var(--ds-gray-1000)]">{item.workspaceName}</p>
                              {item.companyName && (
                                <p className="mt-1 text-label-12 text-[var(--ds-gray-900)]">{item.companyName}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-label-14 text-[var(--ds-gray-1000)]">{item.pendingApprovalCount}</td>
                          <td className="px-4 py-4 text-label-14 text-[var(--ds-gray-1000)]">{item.overdueApprovalCount}</td>
                          <td className="px-4 py-4 text-label-14 text-[var(--ds-gray-1000)]">{item.escalatedApprovalCount}</td>
                          <td className="px-4 py-4 text-label-14 text-[var(--ds-gray-1000)]">{item.changesRequestedCount}</td>
                          <td className="px-4 py-4 text-label-14 text-[var(--ds-gray-1000)]">{item.atRiskPublishCount}</td>
                          <td className="px-5 py-4">
                            <ToneBadge tone={toneForHealth(item.healthStatus)} className="px-2 py-0.5">
                              {item.healthStatus.toLowerCase()}
                            </ToneBadge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-label-12 text-[var(--ds-gray-900)]">{label}</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "h-10 rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] shadow-none",
            "hover:border-[var(--ds-gray-500)] focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-lg">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-md text-label-14 focus:bg-[var(--ds-gray-100)] focus:text-[var(--ds-gray-1000)]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EmptyPanel({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("px-5 text-center", compact ? "py-8" : "py-12")}>
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
        <BriefcaseBusiness className="h-4 w-4 text-[var(--ds-gray-900)]" />
      </div>
      <p className="mt-4 text-heading-16 text-[var(--ds-gray-1000)]">{title}</p>
      <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">{description}</p>
    </div>
  );
}
