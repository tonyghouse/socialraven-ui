"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useAuth } from "@clerk/nextjs";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

function DiffValue({ item, value }: { item: PostCollectionApprovalDiffItemResponse; value: string }) {
  if (item.valueType === "json") {
    return (
      <pre className="whitespace-pre-wrap rounded-lg bg-[hsl(var(--surface-raised))] px-3 py-2 text-xs leading-5 text-[hsl(var(--foreground-muted))]">
        {value}
      </pre>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground-muted))]">
      {value}
    </p>
  );
}

function timelineCategoryAppearance(category: PostCollectionActivityTimelineEntryResponse["category"]) {
  switch (category) {
    case "SYSTEM":
      return "inprogress";
    case "VERSION":
      return "default";
    default:
      return "new";
  }
}

export function ApprovalSafetyPanel({ collection }: { collection: PostCollectionResponse }) {
  const { getToken } = useAuth();
  const [exporting, setExporting] = useState(false);
  const hasReminderState =
    collection.overallStatus === "IN_REVIEW" &&
    (collection.nextApprovalReminderAt ||
      (collection.approvalReminderAttemptCount ?? 0) > 0 ||
      collection.approvalEscalatedAt);
  const hasDiff = collection.approvedDiff?.hasChanges;
  const activityTimeline = collection.activityTimeline ?? [];
  const shouldRender =
    collection.approvalLocked || hasReminderState || hasDiff || activityTimeline.length > 0;

  if (!shouldRender) {
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
    <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Approval Safety</p>
          {activityTimeline.length > 0 && (
            <AtlassianButton appearance="subtle" isDisabled={exporting} onClick={handleExportApprovalLog}>
              <span className="inline-flex items-center gap-1.5">
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>{exporting ? "Exporting..." : "Export Approval Log"}</span>
              </span>
            </AtlassianButton>
          )}
        </div>
      </div>

      <div className="space-y-5 px-5 py-4">
        {collection.approvalLocked && (
          <SectionMessage appearance="information" title="Locked after approval">
            <p className="text-sm">
              This content was locked on {formatTimestamp(collection.approvalLockedAt)}. Material edits require
              an explicit confirmation and will move the collection back into review.
            </p>
          </SectionMessage>
        )}

        {hasReminderState && (
          <div className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Reminder status</p>
              {collection.approvalEscalatedAt ? (
                <Lozenge appearance="moved">Escalated</Lozenge>
              ) : (
                <Lozenge appearance="inprogress">Pending</Lozenge>
              )}
            </div>
            <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
              Reminder attempts: {collection.approvalReminderAttemptCount ?? 0}
            </p>
            {collection.lastApprovalReminderSentAt && (
              <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                Last reminder: {formatTimestamp(collection.lastApprovalReminderSentAt)}
              </p>
            )}
            {collection.nextApprovalReminderAt && !collection.approvalEscalatedAt && (
              <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                Next reminder: {formatTimestamp(collection.nextApprovalReminderAt)}
              </p>
            )}
            {collection.approvalEscalatedAt && (
              <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                Escalated: {formatTimestamp(collection.approvalEscalatedAt)}
              </p>
            )}
          </div>
        )}

        {hasDiff && collection.approvedDiff && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Approved vs current diff</p>
              <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                Comparing approved version #{collection.approvedDiff.approvedVersionNumber} with current version #
                {collection.approvedDiff.currentVersionNumber}.
              </p>
            </div>

            {collection.approvedDiff.changes.map((item) => (
              <div
                key={`${item.field}-${item.label}`}
                className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-3"
              >
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.label}</p>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
                      Approved
                    </p>
                    <DiffValue item={item} value={item.beforeValue} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
                      Current
                    </p>
                    <DiffValue item={item} value={item.afterValue} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activityTimeline.length > 0 && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Activity timeline</p>
              <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                Unified audit stream for approvals, content revisions, reminders, escalations, and scheduling.
              </p>
            </div>

            <div className="space-y-3">
              {activityTimeline.map((entry) => (
                <div
                  key={entry.eventKey}
                  className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{entry.label}</p>
                      <Lozenge appearance={timelineCategoryAppearance(entry.category)}>{entry.category}</Lozenge>
                      {entry.actorType === "CLIENT_REVIEWER" && (
                        <Lozenge appearance="new">Client reviewer</Lozenge>
                      )}
                      {entry.actorType === "SYSTEM" && <Lozenge appearance="inprogress">System</Lozenge>}
                      {entry.versionNumber !== null && entry.versionNumber !== undefined && (
                        <Lozenge appearance="default">Version #{entry.versionNumber}</Lozenge>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                      {formatTimestamp(entry.createdAt)}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
                    {entry.actorDisplayName}
                  </p>

                  {(entry.fromStatus || entry.toStatus) && (
                    <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                      {(entry.fromStatus ?? "Unknown").replaceAll("_", " ")} to{" "}
                      {(entry.toStatus ?? "Unknown").replaceAll("_", " ")}
                    </p>
                  )}

                  {entry.scheduledTime && (
                    <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                      Scheduled for {formatTimestamp(entry.scheduledTime)}
                    </p>
                  )}

                  {entry.note && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[hsl(var(--foreground-muted))]">
                      {entry.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
