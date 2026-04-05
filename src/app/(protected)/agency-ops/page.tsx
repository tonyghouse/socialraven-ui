"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import Link from "next/link";
import { type ComponentType, useEffect, useRef, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const surfaceClassName =
  "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]";

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
      return "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]";
    case "OVERDUE":
      return "border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
    default:
      return "border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/8 text-[hsl(var(--accent))]";
  }
}

function toneForSeverity(severity: AgencyOpsPublishRiskItem["severity"]) {
  switch (severity) {
    case "HIGH":
      return "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]";
    case "MEDIUM":
      return "border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
    default:
      return "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]";
  }
}

function toneForHealth(status: AgencyOpsWorkspaceHealth["healthStatus"]) {
  switch (status) {
    case "CRITICAL":
      return "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]";
    case "WATCH":
      return "border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
    default:
      return "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]";
  }
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
  tone: string;
}) {
  return (
    <section className={cn(surfaceClassName, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">
            {value}
          </p>
          <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">{detail}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
            tone
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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={cn(surfaceClassName, "h-32 animate-pulse bg-[hsl(var(--surface-raised))]")} />
          ))}
        </div>
        <div className={cn(surfaceClassName, "h-24 animate-pulse bg-[hsl(var(--surface-raised))]")} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className={cn(surfaceClassName, "h-[420px] animate-pulse bg-[hsl(var(--surface-raised))]")} />
          <div className="space-y-6">
            <div className={cn(surfaceClassName, "h-52 animate-pulse bg-[hsl(var(--surface-raised))]")} />
            <div className={cn(surfaceClassName, "h-52 animate-pulse bg-[hsl(var(--surface-raised))]")} />
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
      <main className="min-h-screen bg-[hsl(var(--background))]">
        <ProtectedPageHeader
          title="Agency Ops"
          description="Cross-workspace approvals, workload, and publish risk."
          icon={<BriefcaseBusiness className="h-4 w-4" />}
        />
        <div className="px-4 py-6 sm:px-6">
          <SectionMessage appearance="warning" title="Approval workflow access required">
            This portfolio view is only available to teammates who can work inside approval queues.
          </SectionMessage>
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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Agency Ops"
        description="Run the full client portfolio from one queue instead of workspace by workspace."
        icon={<BriefcaseBusiness className="h-4 w-4" />}
        actions={
          <AtlassianButton
            appearance="subtle"
            onClick={() => load(true)}
            isDisabled={refreshing}
            title="Refresh"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </AtlassianButton>
        }
      />

      <div className="space-y-6 px-4 py-6 pb-24 sm:px-6 sm:pb-10">
        {error && (
          <SectionMessage appearance="error" title={error}>
            <div className="mt-3">
              <AtlassianButton appearance="subtle" onClick={() => load()}>
                Retry
              </AtlassianButton>
            </div>
          </SectionMessage>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Pending Queue"
                value={data.summary.pendingApprovalCount}
                detail={`${data.summary.workspaceCount} accessible workspaces in scope`}
                icon={Clock3}
                tone="border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/8 text-[hsl(var(--accent))]"
              />
              <StatCard
                title="Overdue Reviews"
                value={data.summary.overdueApprovalCount}
                detail={`${data.overdueQueue.length} items need follow-up in this slice`}
                icon={AlertTriangle}
                tone="border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"
              />
              <StatCard
                title="Escalations"
                value={data.summary.escalatedApprovalCount}
                detail="Filtered items already beyond reminder thresholds"
                icon={ShieldAlert}
                tone="border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]"
              />
              <StatCard
                title="Publish Risk"
                value={data.summary.atRiskPublishCount}
                detail="Upcoming delivery risk in the current portfolio slice"
                icon={Users2}
                tone="border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
              />
            </div>

            <section className={cn(surfaceClassName, "p-4")}>
              <div className="flex flex-wrap items-center gap-2 border-b border-[hsl(var(--border-subtle))] pb-4">
                <Lozenge appearance="inprogress">{data.queue.length} queue items</Lozenge>
                <Lozenge appearance="new">{data.publishRisk.length} risk items</Lozenge>
                <Lozenge appearance="moved">{data.summary.approverCount} active approvers</Lozenge>
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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
              <section className={surfaceClassName}>
                <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Cross-Workspace Approval Queue</h2>
                    <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
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
                  <div className="divide-y divide-[hsl(var(--border-subtle))]">
                    {data.queue.map((item) => (
                      <Link
                        key={item.collectionId}
                        href={detailHref(item)}
                        className="block px-5 py-4 transition-colors hover:bg-[hsl(var(--surface-raised))]/70"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                                {item.description || "Untitled content"}
                              </p>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                                  toneForAttention(item.attentionStatus)
                                )}
                              >
                                {item.attentionStatus.toLowerCase()}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                              {item.workspaceName}
                              {item.companyName ? ` · ${item.companyName}` : ""} · {item.channelCount ?? 0} channel
                              {(item.channelCount ?? 0) === 1 ? "" : "s"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[hsl(var(--foreground-subtle))]">
                              <span>Scheduled: {formatDateTime(item.scheduledTime)}</span>
                              <span>Submitted: {formatDateTime(item.reviewSubmittedAt)}</span>
                              {item.nextApprovalStage && <span>Stage: {item.nextApprovalStage.replace("_", " ")}</span>}
                              {item.platforms.length > 0 && <span>Platforms: {item.platforms.join(", ")}</span>}
                            </div>
                          </div>

                          <div className="shrink-0 text-sm text-[hsl(var(--foreground-muted))]">
                            {relativeScheduleLabel(item.scheduledTime)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <div className="space-y-6">
                <section className={surfaceClassName}>
                  <div className="border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                    <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Overdue Review Board</h2>
                    <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                      Items already beyond reminder timing or already escalated.
                    </p>
                  </div>

                  {data.overdueQueue.length === 0 ? (
                    <EmptyPanel title="No overdue reviews" description="Reminder and escalation thresholds are currently under control." compact />
                  ) : (
                    <div className="divide-y divide-[hsl(var(--border-subtle))]">
                      {data.overdueQueue.slice(0, 6).map((item) => (
                        <Link
                          key={item.collectionId}
                          href={detailHref(item)}
                          className="block px-5 py-4 transition-colors hover:bg-[hsl(var(--surface-raised))]/70"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                                {item.description || "Untitled content"}
                              </p>
                              <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">
                                {item.workspaceName} · {formatDateTime(item.scheduledTime)}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                toneForAttention(item.attentionStatus)
                              )}
                            >
                              {item.attentionStatus.toLowerCase()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                <section className={surfaceClassName}>
                  <div className="border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                    <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Approver Workload</h2>
                    <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                      Estimated review load per approver across the current portfolio snapshot.
                    </p>
                  </div>

                  {data.workload.length === 0 ? (
                    <EmptyPanel title="No active review load" description="Eligible approvers have no pending work right now." compact />
                  ) : (
                    <div className="divide-y divide-[hsl(var(--border-subtle))]">
                      {data.workload.map((item) => (
                        <div key={item.userId} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                                {item.displayName}
                              </p>
                              <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">
                                {item.workspaceCount} workspaces · next due {formatDateTime(item.nextDueAt)}
                              </p>
                            </div>
                            <div className="flex gap-2 text-[11px] font-medium">
                              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-2 py-0.5 text-[hsl(var(--foreground-muted))]">
                                {item.pendingApprovalCount} pending
                              </span>
                              {item.overdueApprovalCount > 0 && (
                                <span className="rounded-full border border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/10 px-2 py-0.5 text-[hsl(var(--warning))]">
                                  {item.overdueApprovalCount} overdue
                                </span>
                              )}
                              {item.escalatedApprovalCount > 0 && (
                                <span className="rounded-full border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 px-2 py-0.5 text-[hsl(var(--destructive))]">
                                  {item.escalatedApprovalCount} escalated
                                </span>
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
              <div className="border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Upcoming Publish Risk</h2>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                  Approval bottlenecks and delivery failures that could miss a client publish window.
                </p>
              </div>

              {data.publishRisk.length === 0 ? (
                <EmptyPanel
                  title="No publish risk for the current filter set"
                  description="The filtered portfolio slice does not show near-term approval or recovery risk."
                />
              ) : (
                <div className="divide-y divide-[hsl(var(--border-subtle))]">
                  {data.publishRisk.map((item) => (
                    <Link
                      key={`${item.riskType}-${item.collectionId}`}
                      href={detailHref(item)}
                      className="block px-5 py-4 transition-colors hover:bg-[hsl(var(--surface-raised))]/70"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                              {item.description || "Untitled content"}
                            </p>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                                toneForSeverity(item.severity)
                              )}
                            >
                              {item.severity.toLowerCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                            {item.workspaceName}
                            {item.companyName ? ` · ${item.companyName}` : ""} · {item.riskType.replaceAll("_", " ").toLowerCase()}
                          </p>
                          <p className="mt-2 text-sm text-[hsl(var(--foreground))]">{item.reason}</p>
                        </div>
                        <div className="shrink-0 text-sm text-[hsl(var(--foreground-muted))]">
                          {relativeScheduleLabel(item.scheduledTime)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className={surfaceClassName}>
              <div className="border-b border-[hsl(var(--border-subtle))] px-5 py-4">
                <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Workspace Health</h2>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
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
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-[hsl(var(--border-subtle))] text-left text-[hsl(var(--foreground-subtle))]">
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
                          className="border-b border-[hsl(var(--border-subtle))] last:border-b-0"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-[hsl(var(--foreground))]">{item.workspaceName}</p>
                              {item.companyName && (
                                <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">{item.companyName}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[hsl(var(--foreground))]">{item.pendingApprovalCount}</td>
                          <td className="px-4 py-4 text-[hsl(var(--foreground))]">{item.overdueApprovalCount}</td>
                          <td className="px-4 py-4 text-[hsl(var(--foreground))]">{item.escalatedApprovalCount}</td>
                          <td className="px-4 py-4 text-[hsl(var(--foreground))]">{item.changesRequestedCount}</td>
                          <td className="px-4 py-4 text-[hsl(var(--foreground))]">{item.atRiskPublishCount}</td>
                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                                toneForHealth(item.healthStatus)
                              )}
                            >
                              {item.healthStatus.toLowerCase()}
                            </span>
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
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
        {label}
      </p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 bg-[hsl(var(--surface))]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
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
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
        <BriefcaseBusiness className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
      </div>
      <p className="mt-4 text-sm font-semibold text-[hsl(var(--foreground))]">{title}</p>
      <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">{description}</p>
    </div>
  );
}
