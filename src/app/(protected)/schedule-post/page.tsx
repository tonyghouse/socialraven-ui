"use client";

import React, { useState, useEffect } from "react";
import { CalendarClock, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PostType } from "@/model/PostType";
import PostTypeSelector from "@/components/schedule-post/post-type-selector";
import { PostConnectedAccountsList } from "@/components/schedule-post/post-connected-accounts-list";
import ScheduleImageForm from "@/components/schedule-post/schedule-image-form";
import ScheduleVideoForm from "@/components/schedule-post/schedule-video-form";
import ScheduleTextForm from "@/components/schedule-post/schedule-text-form";

// ── Step card wrapper ─────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 px-6 py-4 border-b border-border/60 bg-muted/20">
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
          <span className="text-xs font-bold text-primary">{step}</span>
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

// ── Platform name map ─────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", x: "X",
  linkedin: "LinkedIn", youtube: "YouTube", threads: "Threads", tiktok: "TikTok",
};

// ── Page ──────────────────────────────────────────────────────────────────────

const POST_TYPE_DESCRIPTIONS: Record<PostType, string> = {
  IMAGE: "Upload photos or graphics — carousels, infographics, product shots, and more.",
  VIDEO: "Share video content — reels, clips, tutorials, and short-form videos.",
  TEXT:  "Publish text-based updates, threads, articles, or announcements.",
};

export default function ScheduledPostCollectionPage() {
  const { isLoaded, getToken } = useAuth();

  const [postType, setPostType] = useState<PostType>("IMAGE");
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded) loadAccounts();
  }, [isLoaded]);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await fetchAllConnectedAccountsApi(getToken);
      setConnectedAccounts(data);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load connected accounts");
    } finally {
      setLoading(false);
    }
  }

  function handlePostTypeChange(type: PostType) {
    setPostType(type);
    setSelectedAccountIds([]);
  }

  function resetSelection() {
    setSelectedAccountIds([]);
  }

  const selectedCount = selectedAccountIds.length;

  const selectedPlatforms = [...new Set(
    connectedAccounts
      .filter((a) => selectedAccountIds.includes(a.providerUserId))
      .map((a) => a.platform.toLowerCase())
  )];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">
                Schedule Post
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Create once · publish to 7 platforms simultaneously
              </p>
            </div>
            {selectedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary flex-shrink-0">
                <Zap className="w-3 h-3" />
                {selectedCount} account{selectedCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {selectedPlatforms.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <span className="text-xs text-muted-foreground">Posting to:</span>
              {selectedPlatforms.map((p) => (
                <span key={p} className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full text-foreground">
                  {PLATFORM_LABELS[p] ?? p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 py-6 space-y-4">

        {/* Step 1 — Post type */}
        <StepCard
          step={1}
          title="Content Type"
          description="Choose the format for this post."
        >
          <PostTypeSelector postType={postType} setPostType={handlePostTypeChange} />
        </StepCard>

        {/* Step 2 — Account selection */}
        <StepCard
          step={2}
          title="Select Accounts"
          description="Choose which social profiles this post will be published to."
        >
          <PostConnectedAccountsList
            postType={postType}
            accounts={connectedAccounts}
            selectedAccountIds={selectedAccountIds}
            toggleAccount={(id) =>
              setSelectedAccountIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            loading={loading}
          />
        </StepCard>

        {/* Step 3 — Compose & schedule */}
        <StepCard
          step={3}
          title="Compose & Schedule"
          description={POST_TYPE_DESCRIPTIONS[postType]}
        >
          {postType === "IMAGE" && (
            <ScheduleImageForm
              connectedAccounts={connectedAccounts}
              selectedIds={selectedAccountIds}
              resetSelection={resetSelection}
              postType="IMAGE"
            />
          )}
          {postType === "VIDEO" && (
            <ScheduleVideoForm
              connectedAccounts={connectedAccounts}
              selectedIds={selectedAccountIds}
              resetSelection={resetSelection}
              postType="VIDEO"
            />
          )}
          {postType === "TEXT" && (
            <ScheduleTextForm
              connectedAccounts={connectedAccounts}
              selectedIds={selectedAccountIds}
              resetSelection={resetSelection}
              postType="TEXT"
            />
          )}
        </StepCard>

      </div>
    </div>
  );
}
