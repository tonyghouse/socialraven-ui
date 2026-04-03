"use client";

import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import type {
  PostCollectionApprovalDiffItemResponse,
  PostCollectionResponse,
  PostCollectionVersionResponse,
} from "@/model/PostCollectionResponse";

function formatTimestamp(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatVersionEvent(event: PostCollectionVersionResponse["versionEvent"]) {
  switch (event) {
    case "CREATED":
      return "created";
    case "UPDATED":
      return "saved changes";
    case "SUBMITTED":
      return "submitted for review";
    case "RESUBMITTED":
      return "resubmitted";
    case "STEP_APPROVED":
      return "completed an approval step";
    case "APPROVED":
      return "approved";
    case "CHANGES_REQUESTED":
      return "requested changes";
    case "REAPPROVAL_REQUIRED":
      return "triggered reapproval";
    case "SCHEDULED_DIRECT":
      return "scheduled directly";
    case "RECOVERY_CREATED":
      return "created a recovery draft";
    default:
      return String(event).replaceAll("_", " ").toLowerCase();
  }
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

export function ApprovalSafetyPanel({ collection }: { collection: PostCollectionResponse }) {
  const hasReminderState =
    collection.overallStatus === "IN_REVIEW" &&
    (collection.nextApprovalReminderAt ||
      (collection.approvalReminderAttemptCount ?? 0) > 0 ||
      collection.approvalEscalatedAt);
  const hasDiff = collection.approvedDiff?.hasChanges;
  const versions = collection.versionHistory ?? [];
  const shouldRender =
    collection.approvalLocked || hasReminderState || hasDiff || versions.length > 0;

  if (!shouldRender) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-3.5">
        <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Approval Safety</p>
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

        {versions.length > 0 && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Version history</p>
              <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                Every material save and workflow transition is recorded here.
              </p>
            </div>

            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Version #{version.versionNumber}
                      </p>
                      <Lozenge appearance={version.draft ? "default" : "success"}>
                        {version.reviewStatus.replaceAll("_", " ")}
                      </Lozenge>
                    </div>
                    <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                      {formatTimestamp(version.createdAt)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
                    {version.actorDisplayName} {formatVersionEvent(version.versionEvent)}.
                  </p>
                  {version.scheduledTime && (
                    <p className="mt-1 text-xs text-[hsl(var(--foreground-subtle))]">
                      Scheduled for {formatTimestamp(version.scheduledTime)}
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
