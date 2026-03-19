"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Pencil,
  Image as ImageIcon,
  Video,
  FileText,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import EditImageForm from "@/components/schedule-post/edit-image-form";
import EditVideoForm from "@/components/schedule-post/edit-video-form";
import EditTextForm from "@/components/schedule-post/edit-text-form";
import { toast } from "sonner";

/* ── Config ── */

const TYPE_CONFIG: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string; description: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className:
      "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20",
    description:
      "Edit your caption, add or remove images, and configure platform-specific settings.",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className:
      "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
    description:
      "Edit your description, replace or add videos, and configure platform-specific settings.",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className:
      "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/20",
    description: "Edit your content and configure platform-specific settings.",
  },
};

const PLATFORM_BADGE_STYLES: Record<string, string> = {
  facebook:  "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20",
  instagram: "bg-pink-50 text-pink-600 border-pink-200",
  x:         "bg-foreground/8 text-foreground border-border",
  linkedin:  "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20",
  youtube:   "bg-red-50 text-red-600 border-red-200",
  threads:   "bg-foreground/8 text-foreground border-border",
  tiktok:    "bg-foreground/8 text-foreground border-border",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", x: "X",
  linkedin: "LinkedIn", youtube: "YouTube", threads: "Threads", tiktok: "TikTok",
};

/* ── Step Card ── */

function StepCard({
  step,
  title,
  description,
  children,
  complete,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  complete?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card border rounded-2xl shadow-sm overflow-hidden transition-all duration-300",
        complete ? "border-primary/30" : "border-border"
      )}
    >
      <div className="flex items-start gap-4 px-6 py-4 border-b border-border/60 bg-muted/20">
        <div
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-300",
            complete ? "bg-primary/15" : "bg-muted border border-border/60"
          )}
        >
          {complete ? (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">{step}</span>
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ── Page ── */

export default function DraftEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getToken, isLoaded } = useAuth();

  const [collection, setCollection]     = useState<PostCollectionResponse | null>(null);
  const [allAccounts, setAllAccounts]   = useState<ConnectedAccount[]>([]);
  const [selectedIds, setSelectedIds]   = useState<string[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    async function load() {
      try {
        setLoading(true);
        const [coll, accounts] = await Promise.all([
          fetchPostCollectionByIdApi(getToken, id),
          fetchAllConnectedAccountsApi(getToken),
        ]);
        if (coll.overallStatus !== "DRAFT") {
          router.replace(`/scheduled-posts/${id}`);
          return;
        }
        setCollection(coll);
        setAllAccounts(accounts);
        const existingIds = coll.posts
          .map((p) => p.connectedAccount?.providerUserId)
          .filter(Boolean) as string[];
        setSelectedIds(existingIds);
      } catch {
        setError("Failed to load draft.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoaded]);

  if (loading) return <LoadingSkeleton />;
  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full rounded-2xl bg-card border border-border/60 p-8 shadow-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Draft not found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {error ?? "This draft couldn't be loaded. It may have been deleted."}
          </p>
          <button
            onClick={() => router.push(`/drafts/${id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Draft
          </button>
        </div>
      </div>
    );
  }

  const typeCfg  = TYPE_CONFIG[collection.postCollectionType] ?? TYPE_CONFIG.TEXT;
  const TypeIcon = typeCfg.Icon;

  const selectedPlatforms = [
    ...new Set(
      allAccounts
        .filter((a) => selectedIds.includes(a.providerUserId))
        .map((a) => a.platform.toLowerCase())
    ),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            <button
              onClick={() => router.push(`/drafts/${id}`)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>

            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Pencil className="w-[18px] h-[18px] text-amber-600 dark:text-amber-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">
                Edit Draft
              </h1>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {collection.title || "Untitled Draft"}
              </p>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary flex-shrink-0 border border-primary/20">
                <Zap className="w-3 h-3" />
                {selectedIds.length}{" "}
                {selectedIds.length === 1 ? "account" : "accounts"}
              </div>
            )}
          </div>

          {/* Platform badges row */}
          {selectedPlatforms.length > 0 && (
            <div className="flex items-center gap-1.5 pb-2.5 flex-wrap">
              <span className="text-xs text-muted-foreground">Posting to:</span>
              {selectedPlatforms.map((p) => (
                <span
                  key={p}
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full border",
                    PLATFORM_BADGE_STYLES[p] ?? "bg-muted text-foreground border-border"
                  )}
                >
                  {PLATFORM_LABELS[p] ?? p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Step Cards ── */}
      <div className="px-4 sm:px-6 py-6 space-y-4">

        {/* Step 1 — Content Type (locked) */}
        <StepCard
          step={1}
          title="Content Type"
          description="Post type is locked and cannot be changed after creation."
          complete
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/40">
            <div
              className={cn(
                "h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0",
                typeCfg.className
              )}
            >
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{typeCfg.label} Post</p>
              <p className="text-xs text-muted-foreground">Format is fixed for this draft</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border/50 px-2.5 py-1 rounded-lg">
              <Lock className="h-3 w-3" />
              Locked
            </div>
          </div>
        </StepCard>

        {/* Step 2 — Select Accounts */}
        <StepCard
          step={2}
          title="Select Accounts"
          description="Choose which social profiles this draft will be published to."
          complete={selectedIds.length > 0}
        >
          <AccountSelector
            postType={collection.postCollectionType}
            accounts={allAccounts}
            selectedAccountIds={selectedIds}
            onChange={setSelectedIds}
            loading={false}
          />
        </StepCard>

        {/* Step 3 — Edit Content */}
        <StepCard
          step={3}
          title="Edit Content"
          description={typeCfg.description}
        >
          {collection.postCollectionType === "TEXT" && (
            <EditTextForm
              collection={collection}
              connectedAccounts={allAccounts}
              selectedIds={selectedIds}
              collectionId={id}
              onSuccess={() => {
                toast.success("Draft updated.");
                router.push(`/drafts/${id}`);
              }}
            />
          )}
          {collection.postCollectionType === "IMAGE" && (
            <EditImageForm
              collection={collection}
              connectedAccounts={allAccounts}
              selectedIds={selectedIds}
              collectionId={id}
              onSuccess={() => {
                toast.success("Draft updated.");
                router.push(`/drafts/${id}`);
              }}
            />
          )}
          {collection.postCollectionType === "VIDEO" && (
            <EditVideoForm
              collection={collection}
              connectedAccounts={allAccounts}
              selectedIds={selectedIds}
              collectionId={id}
              onSuccess={() => {
                toast.success("Draft updated.");
                router.push(`/drafts/${id}`);
              }}
            />
          )}
        </StepCard>

      </div>
    </div>
  );
}

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 h-16" />
      <div className="px-4 sm:px-6 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-start gap-4 px-6 py-4 border-b border-border/60 bg-muted/20">
              <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
              </div>
            </div>
            <div className="px-6 py-5 space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              {i === 3 && <Skeleton className="h-32 w-full rounded-xl" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
