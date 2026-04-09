"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";
import type {
  PostCollectionActivityTimelineEntryResponse,
  PostCollectionApprovalDiffItemResponse,
  PostCollectionResponse,
} from "@/model/PostCollectionResponse";
import { downloadPostCollectionApprovalLogApi } from "@/service/reviewPostCollectionApi";

function formatTimestamp(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function ActionButton({
  appearance = "default",
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-label-13 transition-colors disabled:pointer-events-none disabled:opacity-50",
        isGeist
          ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))]/30 hover:bg-[hsl(var(--surface-raised))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  appearance = "default",
  variant = "neutral",
  children,
}: {
  appearance?: "default" | "geist";
  variant?: "neutral" | "accent" | "warning" | "danger" | "success";
  children: ReactNode;
}) {
  const variants =
    appearance === "geist"
      ? {
          neutral: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
          accent: "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
          warning: "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
          danger: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
          success: "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]",
        }
      : {
          neutral: "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]",
          accent: "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]",
          warning: "border-[hsl(var(--warning))]/18 bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
          danger: "border-[hsl(var(--destructive))]/18 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
          success: "border-[hsl(var(--success))]/18 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
        };

  return (
    <span className={cn("inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-label-12", variants[variant])}>
      {children}
    </span>
  );
}

function Notice({
  appearance = "default",
  title,
  variant = "accent",
  children,
}: {
  appearance?: "default" | "geist";
  title: ReactNode;
  variant?: "accent" | "warning" | "danger";
  children: ReactNode;
}) {
  const variants =
    appearance === "geist"
      ? {
          accent: "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
          warning: "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]",
          danger: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
        }
      : {
          accent: "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/8 text-[hsl(var(--foreground))]",
          warning: "border-[hsl(var(--warning))]/18 bg-[hsl(var(--warning))]/8 text-[hsl(var(--foreground))]",
          danger: "border-[hsl(var(--destructive))]/18 bg-[hsl(var(--destructive))]/8 text-[hsl(var(--foreground))]",
        };

  return (
    <div className={cn("rounded-xl border p-4 shadow-sm", variants[variant])}>
      <div className="space-y-1">
        <p className="text-label-14">{title}</p>
        <div className="text-label-14 leading-6">{children}</div>
      </div>
    </div>
  );
}

function DiffValue({
  item,
  value,
  appearance = "default",
}: {
  item: PostCollectionApprovalDiffItemResponse;
  value: string;
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";

  if (item.valueType === "json") {
    return (
      <pre
        className={cn(
          "whitespace-pre-wrap rounded-lg px-3 py-2 text-xs leading-5",
          isGeist
            ? "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
            : "bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
        )}
      >
        {value}
      </pre>
    );
  }

  return (
    <p className={cn("whitespace-pre-wrap text-sm leading-6", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
      {value}
    </p>
  );
}

function timelineCategoryVariant(category: PostCollectionActivityTimelineEntryResponse["category"]) {
  switch (category) {
    case "SYSTEM":
      return "accent";
    case "VERSION":
      return "neutral";
    default:
      return "warning";
  }
}

export function ApprovalSafetyPanel({
  collection,
  appearance = "default",
}: {
  collection: PostCollectionResponse;
  appearance?: "default" | "geist";
}) {
  const { getToken } = useAuth();
  const { isAgency } = usePlan();
  const [exporting, setExporting] = useState(false);
  const isGeist = appearance === "geist";

  const hasReminderState =
    collection.overallStatus === "IN_REVIEW" &&
    (collection.nextApprovalReminderAt ||
      (collection.approvalReminderAttemptCount ?? 0) > 0 ||
      collection.approvalEscalatedAt);
  const hasDiff = collection.approvedDiff?.hasChanges;
  const activityTimeline = collection.activityTimeline ?? [];
  const shouldRender =
    collection.approvalLocked || hasReminderState || hasDiff || activityTimeline.length > 0;

  if (!isAgency || !shouldRender) {
    return null;
  }

  async function handleExportApprovalLog() {
    setExporting(true);
    try {
      const blob = await downloadPostCollectionApprovalLogApi(getToken, collection.id);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `post-collection-${collection.id}-approval-log.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to export the approval log.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm",
        isGeist
          ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_0.0625rem_0.125rem_rgb(0_0_0_/_0.08)]"
      )}
    >
      <div
        className={cn(
          "px-5 py-4",
          isGeist
            ? "border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
            : "border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn("text-sm font-semibold leading-5", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
            Approval Safety
          </p>
          {activityTimeline.length > 0 ? (
            <ActionButton appearance={appearance} disabled={exporting} onClick={handleExportApprovalLog}>
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span>{exporting ? "Exporting..." : "Export Approval Log"}</span>
            </ActionButton>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 px-5 py-4">
        {collection.approvalLocked ? (
          <Notice appearance={appearance} title="Locked after approval" variant="accent">
            <p>
              This content was locked on {formatTimestamp(collection.approvalLockedAt)}. Material edits require
              an explicit confirmation and will move the collection back into review.
            </p>
          </Notice>
        ) : null}

        {hasReminderState ? (
          <div
            className={cn(
              "rounded-lg border px-4 py-3",
              isGeist
                ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
                Reminder status
              </p>
              <StatusBadge
                appearance={appearance}
                variant={collection.approvalEscalatedAt ? "danger" : "accent"}
              >
                {collection.approvalEscalatedAt ? "Escalated" : "Pending"}
              </StatusBadge>
            </div>
            <p className={cn("mt-2 text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
              Reminder attempts: {collection.approvalReminderAttemptCount ?? 0}
            </p>
            {collection.lastApprovalReminderSentAt ? (
              <p className={cn("mt-1 text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                Last reminder: {formatTimestamp(collection.lastApprovalReminderSentAt)}
              </p>
            ) : null}
            {collection.nextApprovalReminderAt && !collection.approvalEscalatedAt ? (
              <p className={cn("mt-1 text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                Next reminder: {formatTimestamp(collection.nextApprovalReminderAt)}
              </p>
            ) : null}
            {collection.approvalEscalatedAt ? (
              <p className={cn("mt-1 text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                Escalated: {formatTimestamp(collection.approvalEscalatedAt)}
              </p>
            ) : null}
          </div>
        ) : null}

        {hasDiff && collection.approvedDiff ? (
          <div className="space-y-3">
            <div>
              <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
                Approved vs current diff
              </p>
              <p className={cn("mt-1 text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                Comparing approved version #{collection.approvedDiff.approvedVersionNumber} with current version #
                {collection.approvedDiff.currentVersionNumber}.
              </p>
            </div>

            {collection.approvedDiff.changes.map((item) => (
              <div
                key={`${item.field}-${item.label}`}
                className={cn(
                  "rounded-lg border px-4 py-3",
                  isGeist
                    ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                    : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]"
                )}
              >
                <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
                  {item.label}
                </p>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className={cn("mb-1 text-xs font-medium uppercase tracking-[0.04em]", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                      Approved
                    </p>
                    <DiffValue item={item} value={item.beforeValue} appearance={appearance} />
                  </div>
                  <div>
                    <p className={cn("mb-1 text-xs font-medium uppercase tracking-[0.04em]", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                      Current
                    </p>
                    <DiffValue item={item} value={item.afterValue} appearance={appearance} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activityTimeline.length > 0 ? (
          <div className="space-y-3">
            <div>
              <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
                Activity timeline
              </p>
              <p className={cn("mt-1 text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                Unified audit stream for approvals, content revisions, reminders, escalations, and scheduling.
              </p>
            </div>

            <div className="space-y-3">
              {activityTimeline.map((entry) => (
                <div
                  key={entry.eventKey}
                  className={cn(
                    "rounded-lg border px-4 py-3",
                    isGeist
                      ? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]"
                      : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn("text-sm font-medium", isGeist ? "text-[var(--ds-gray-1000)]" : "text-[hsl(var(--foreground))]")}>
                        {entry.label}
                      </p>
                      <StatusBadge appearance={appearance} variant={timelineCategoryVariant(entry.category)}>
                        {entry.category}
                      </StatusBadge>
                      {entry.actorType === "CLIENT_REVIEWER" ? (
                        <StatusBadge appearance={appearance} variant="warning">
                          Client reviewer
                        </StatusBadge>
                      ) : null}
                      {entry.actorType === "SYSTEM" ? (
                        <StatusBadge appearance={appearance} variant="accent">
                          System
                        </StatusBadge>
                      ) : null}
                      {entry.versionNumber !== null && entry.versionNumber !== undefined ? (
                        <StatusBadge appearance={appearance}>Version #{entry.versionNumber}</StatusBadge>
                      ) : null}
                    </div>
                    <p className={cn("text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                      {formatTimestamp(entry.createdAt)}
                    </p>
                  </div>

                  <p className={cn("mt-2 text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
                    {entry.actorDisplayName}
                  </p>

                  {entry.fromStatus || entry.toStatus ? (
                    <p className={cn("mt-1 text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                      {(entry.fromStatus ?? "Unknown").replaceAll("_", " ")} to{" "}
                      {(entry.toStatus ?? "Unknown").replaceAll("_", " ")}
                    </p>
                  ) : null}

                  {entry.scheduledTime ? (
                    <p className={cn("mt-1 text-xs", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-subtle))]")}>
                      Scheduled for {formatTimestamp(entry.scheduledTime)}
                    </p>
                  ) : null}

                  {entry.note ? (
                    <p className={cn("mt-2 whitespace-pre-wrap text-sm", isGeist ? "text-[var(--ds-gray-900)]" : "text-[hsl(var(--foreground-muted))]")}>
                      {entry.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
