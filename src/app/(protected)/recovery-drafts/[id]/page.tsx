"use client";

import { useAuth } from "@clerk/nextjs";
import { AlertCircle, ArrowLeft, CopyPlus, Loader2, RefreshCcw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { type ButtonHTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { createRecoveryDraftApi } from "@/service/createRecoveryDraftApi";
import { RecoveryDraftPageSkeleton } from "@/components/recovery-drafts/recovery-draft-page-skeleton";
import { cn } from "@/lib/utils";

const pageClassName =
  "min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]";
const surfaceClassName =
  "rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
const insetSurfaceClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

function ActionButton({
  tone = "secondary",
  fullWidth = false,
  className,
  type = "button",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
  fullWidth?: boolean;
}) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[hsl(var(--accent))] !text-white hover:bg-[hsl(var(--accent-hover))]"
      : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3.5 text-label-14 transition-colors disabled:pointer-events-none disabled:opacity-50",
        toneClassName,
        fullWidth && "w-full",
        focusRingClassName,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ToneBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-12",
        className
      )}
    >
      {children}
    </span>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: "red" | "amber";
  title: string;
  children: ReactNode;
}) {
  const toneClassName =
    tone === "red"
      ? "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]"
      : "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]";

  return (
    <div className={cn("rounded-2xl border px-5 py-4 shadow-sm", toneClassName)}>
      <p className="text-label-14">{title}</p>
      <div className="mt-1 text-copy-14 leading-6">{children}</div>
    </div>
  );
}

export default function RecoveryDraftPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();

  const [collection, setCollection] = useState<PostCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchPostCollectionByIdApi(getToken, id);
        if (data.recoveryCollectionId) {
          router.replace(`/drafts/${data.recoveryCollectionId}/edit`);
          return;
        }
        setCollection(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load recovery details.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [getToken, id, isLoaded, router]);

  async function handleCreateRecoveryDraft() {
    if (!collection) return;
    setCreating(true);
    try {
      const recoveryDraft = await createRecoveryDraftApi(getToken, collection.id);
      toast.success("Recovery draft created.");
      router.push(`/drafts/${recoveryDraft.id}/edit`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create recovery draft.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <RecoveryDraftPageSkeleton />;
  }

  if (error || !collection) {
    return (
      <main className={cn(pageClassName, "px-4 py-5 sm:px-5")}>
        <div className="mx-auto max-w-3xl">
          <Notice tone="red" title="Recovery Draft">
            <p>{error ?? "Recovery details are unavailable."}</p>
          </Notice>
        </div>
      </main>
    );
  }

  const canRecover = (collection.failedChannelCount ?? 0) > 0;
  const publishedChannelCount = collection.publishedChannelCount ?? 0;
  const failedChannelCount = collection.failedChannelCount ?? 0;
  const isPartialRecovery = collection.overallStatus === "PARTIAL_SUCCESS";
  const partialRecoveryReady = !isPartialRecovery || collection.failureState === "RECOVERY_REQUIRED" || Boolean(collection.recoveryCollectionId);
  const issueSummary = collection.failureReasonSummary?.trim()
    || "This collection could not be published to one or more selected channels. Create a recovery draft to correct the content or media and schedule it again.";

  return (
    <main className={pageClassName}>
      <ProtectedPageHeader
        title="Recovery Draft"
        description="Create a fresh draft from this collection, correct the content or media, and schedule it again."
        icon={<RefreshCcw className="h-4 w-4" />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={(
          <ActionButton onClick={() => router.back()}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </ActionButton>
        )}
      />

      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-5">
        {(!canRecover || !partialRecoveryReady) && (
          <Notice tone="amber" title="Recovery unavailable">
            <p>
              {!canRecover
                ? "This collection does not have any failed channels, so a recovery draft cannot be created."
                : "Recovery for failed channels is not available yet. SocialRaven will expose this once internal review marks it as needing user attention."}
            </p>
          </Notice>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className={cn(surfaceClassName, "p-5")}>
            <div className="flex flex-wrap items-center gap-2">
              <ToneBadge className="border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]">
                Failed Collection
              </ToneBadge>
              <ToneBadge className="border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]">
                {collection.postCollectionType}
              </ToneBadge>
              <ToneBadge className="border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                Collection #{collection.id}
              </ToneBadge>
            </div>

            <h2 className="mt-4 text-title-20 text-[var(--ds-gray-1000)]">
              {isPartialRecovery ? "Some channels still need attention" : "Publish issue detected"}
            </h2>
            <p className="mt-2 text-copy-14 leading-6 text-[var(--ds-gray-900)]">
              {issueSummary}
            </p>

            {(publishedChannelCount > 0 || failedChannelCount > 0) && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--ds-green-200)] bg-[var(--ds-green-100)] p-4">
                  <p className="text-label-12 uppercase tracking-[0.18em] text-[var(--ds-green-700)]">
                    Published Channels
                  </p>
                  <p className="mt-2 text-[1.5rem] font-semibold leading-none text-[var(--ds-green-700)]">
                    {publishedChannelCount}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] p-4">
                  <p className="text-label-12 uppercase tracking-[0.18em] text-[var(--ds-amber-700)]">
                    Failed Channels
                  </p>
                  <p className="mt-2 text-[1.5rem] font-semibold leading-none text-[var(--ds-amber-700)]">
                    {failedChannelCount}
                  </p>
                </div>
              </div>
            )}

            <div className={cn(insetSurfaceClassName, "mt-6 p-4")}>
              <p className="text-label-12 uppercase tracking-[0.18em] text-[var(--ds-gray-900)]">
                Original content
              </p>
              <p className="mt-3 whitespace-pre-wrap text-copy-14 leading-6 text-[var(--ds-gray-1000)]">
                {collection.description?.trim() || "No description provided."}
              </p>
            </div>
          </section>

          <aside className={cn(surfaceClassName, "p-5")}>
            <h3 className="text-label-12 uppercase tracking-[0.18em] text-[var(--ds-gray-900)]">
              Next step
            </h3>
            <p className="mt-3 text-copy-14 leading-6 text-[var(--ds-gray-900)]">
              {isPartialRecovery
                ? "We&apos;ll create a new draft with the same content, media, and platform settings, but only for the failed channels. You can edit it before scheduling."
                : "We&apos;ll create a new draft with the same content, media, platform settings, and connected accounts. You can edit it before scheduling."}
            </p>

            <div className="mt-6 space-y-3">
              <div className={cn(insetSurfaceClassName, "p-4")}>
                <p className="text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                  Reminder attempts sent
                </p>
                <p className="mt-2 text-[1.5rem] font-semibold leading-none text-[var(--ds-gray-1000)]">
                  {collection.recoveryNotificationAttemptCount ?? 0}
                </p>
              </div>

              <ActionButton
                tone="primary"
                fullWidth
                disabled={!canRecover || !partialRecoveryReady || creating}
                onClick={handleCreateRecoveryDraft}
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CopyPlus className="h-3.5 w-3.5" />}
                Create Recovery Draft
              </ActionButton>
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] px-4 py-3 text-[var(--ds-amber-700)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-copy-14 leading-6">
                Creating the recovery draft stops reminder emails for this collection.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
