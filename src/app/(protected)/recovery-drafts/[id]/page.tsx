"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, ArrowLeft, CopyPlus, Loader2, RefreshCcw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { createRecoveryDraftApi } from "@/service/createRecoveryDraftApi";
import { Skeleton } from "@/components/ui/skeleton";
import { RecoveryDraftPageSkeleton } from "@/components/recovery-drafts/recovery-draft-page-skeleton";

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
      <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionMessage appearance="error" title="Recovery Draft">
            <p>{error ?? "Recovery details are unavailable."}</p>
          </SectionMessage>
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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Recovery Draft"
        description="Create a fresh draft from this collection, correct the content or media, and schedule it again."
        icon={<RefreshCcw className="h-4 w-4" />}
        actions={(
          <AtlassianButton appearance="subtle" onClick={() => router.back()}>
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </span>
          </AtlassianButton>
        )}
      />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {(!canRecover || !partialRecoveryReady) && (
          <SectionMessage appearance="warning" title="Recovery unavailable">
            <p>
              {!canRecover
                ? "This collection does not have any failed channels, so a recovery draft cannot be created."
                : "Recovery for failed channels is not available yet. SocialRaven will expose this once internal review marks it as needing user attention."}
            </p>
          </SectionMessage>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <Lozenge appearance="removed">Failed Collection</Lozenge>
              <Lozenge appearance="moved">{collection.postCollectionType}</Lozenge>
              <Lozenge appearance="default">Collection #{collection.id}</Lozenge>
            </div>

            <h2 className="mt-4 text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
              {isPartialRecovery ? "Some channels still need attention" : "Publish issue detected"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
              {issueSummary}
            </p>

            {(publishedChannelCount > 0 || failedChannelCount > 0) && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Published Channels
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-900">
                    {publishedChannelCount}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Failed Channels
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-amber-900">
                    {failedChannelCount}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--foreground-subtle))]">
                Original content
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[hsl(var(--foreground))]">
                {collection.description?.trim() || "No description provided."}
              </p>
            </div>
          </section>

          <aside className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[0_1px_2px_rgb(0 0 0 / 0.08)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--foreground-subtle))]">
              Next step
            </h3>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--foreground-muted))]">
              {isPartialRecovery
                ? "We&apos;ll create a new draft with the same content, media, and platform settings, but only for the failed channels. You can edit it before scheduling."
                : "We&apos;ll create a new draft with the same content, media, platform settings, and connected accounts. You can edit it before scheduling."}
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                  Reminder attempts sent
                </p>
                <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">
                  {collection.recoveryNotificationAttemptCount ?? 0}
                </p>
              </div>

              <AtlassianButton
                appearance="primary"
                isDisabled={!canRecover || !partialRecoveryReady || creating}
                onClick={handleCreateRecoveryDraft}
                shouldFitContainer
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CopyPlus className="h-3.5 w-3.5" />}
                  <span>Create Recovery Draft</span>
                </span>
              </AtlassianButton>
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-sm leading-6">
                Creating the recovery draft stops reminder emails for this collection.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
