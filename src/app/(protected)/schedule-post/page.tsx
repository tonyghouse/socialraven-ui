"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarClock, CheckCircle2, Zap, ChevronDown, ChevronUp,
  ImageIcon, Video, Type, Pencil, Send, Loader2, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PostType } from "@/model/PostType";
import { PlatformConfigs } from "@/model/PostCollection";
import { localToUTC } from "@/lib/timeUtil";
import { getCharErrors, PLATFORM_DISPLAY_NAMES, validatePlatformConfigs } from "@/lib/platformLimits";
import {
  validateMediaFiles,
  validateMediaSync,
  getEffectiveMaxFiles,
  getMostRestrictivePlatform,
  MediaValidationError,
} from "@/lib/mediaValidation";
import { cn } from "@/lib/utils";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useRole } from "@/hooks/useRole";

import PostTypeSelector from "@/components/schedule-post/post-type-selector";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import MediaUploader from "@/components/schedule-post/media-uploader";
import ScheduleDateTimePicker from "@/components/schedule-post/date-time-picker";
import PlatformCharLimits from "@/components/schedule-post/platform-char-limits";
import MediaValidationPanel from "@/components/schedule-post/media-validation-panel";
import PlatformConfigsPanel from "@/components/schedule-post/platform-configs-panel";

// ── Post type meta ─────────────────────────────────────────────────────────────

const POST_TYPE_META: Record<PostType, { label: string; Icon: React.ElementType; description: string }> = {
  IMAGE: { label: "Image",  Icon: ImageIcon, description: "Photos, graphics & carousels" },
  VIDEO: { label: "Video",  Icon: Video,     description: "Reels, clips & short-form videos" },
  TEXT:  { label: "Text",   Icon: Type,      description: "Updates, threads & announcements" },
};

// ── Platform badge colours ────────────────────────────────────────────────────

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
  linkedin: "LinkedIn", youtube: "YouTube",    threads: "Threads", tiktok: "TikTok",
};

// ── Accordion step card ────────────────────────────────────────────────────────

function StepCard({
  step,
  title,
  description,
  children,
  complete = false,
  locked = false,
  isOpen,
  onToggle,
  summary,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  complete?: boolean;
  locked?: boolean;
  isOpen: boolean;
  onToggle?: () => void;
  summary?: React.ReactNode;
}) {
  const canToggle = !!onToggle && !locked;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-surface shadow-sm transition-[border-color,box-shadow,opacity] duration-200",
        locked
          ? "border-border-subtle opacity-55"
          : complete && isOpen
            ? "border-[hsl(var(--accent))]/30 shadow-md"
            : complete
              ? "border-[hsl(var(--border))]"
              : "border-border-subtle",
      )}
    >
      {/* ── Header ── */}
      <button
        type="button"
        disabled={!canToggle}
        onClick={canToggle ? onToggle : undefined}
        className={cn(
          "w-full flex items-center gap-4 border-b border-border-subtle bg-surface-raised px-5 py-4 text-left transition-colors duration-150",
          canToggle
            ? "cursor-pointer hover:bg-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/35 focus-visible:ring-inset"
            : "cursor-default",
        )}
      >
        {/* Step indicator */}
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold transition-colors duration-200",
            complete
              ? "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
              : "border-border-subtle bg-surface text-foreground-muted",
          )}
        >
          {complete
            ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--accent))]" />
            : <span>{step}</span>
          }
        </div>

        {/* Title / summary */}
        <div className="flex-1 min-w-0">
          {!isOpen && complete && summary ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
              <span className="text-muted-foreground/40">·</span>
              {summary}
            </div>
          ) : (
            <>
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
            </>
          )}
        </div>

        {/* Edit hint + chevron */}
        {canToggle && (
            <div className="flex-shrink-0 flex items-center gap-1.5 text-muted-foreground">
              {!isOpen && (
              <span className="hidden items-center gap-1 rounded-md border border-border-subtle bg-surface px-2 py-0.5 text-[10px] font-medium text-foreground-muted sm:flex">
                <Pencil className="w-2.5 h-2.5" />
                Edit
              </span>
            )}
            {isOpen
              ? <ChevronUp  className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </div>
        )}
      </button>

      {/* ── Body ── */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Continue button ────────────────────────────────────────────────────────────

function ContinueBtn({ onClick, disabled = false, label = "Continue" }: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/35",
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground shadow-sm hover:bg-[hsl(var(--accent-hover))]",
        )}
      >
        {label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScheduledPostCollectionPage() {
  const { isLoaded, getToken } = useAuth();
  const searchParams = useSearchParams();
  const { activeWorkspace } = useWorkspace();
  const { canPublishPosts } = useRole();

  const initialDate = searchParams.get("date") ?? "";
  const initialTime = searchParams.get("time") ?? "";

  // ── Core selections ──────────────────────────────────────────────────────────
  const [postType, setPostType]   = useState<PostType | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [description, setDescription] = useState("");
  const [files, setFiles]             = useState<File[]>([]);
  const [date, setDate]               = useState(initialDate);
  const [time, setTime]               = useState(initialTime);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});

  // ── Submission state ─────────────────────────────────────────────────────────
  const [submitLoading, setSubmitLoading] = useState(false);
  const [draftLoading,  setDraftLoading]  = useState(false);
  const [showErrors,    setShowErrors]    = useState(false);
  const [mediaErrors,   setMediaErrors]   = useState<MediaValidationError[]>([]);
  const [validatingMedia, setValidatingMedia] = useState(false);

  // ── Accordion state ──────────────────────────────────────────────────────────
  const [activeStep,   setActiveStep]   = useState(1);
  const [reachedStep,  setReachedStep]  = useState(1);

  function goToStep(n: number) {
    setActiveStep(n);
    setReachedStep((prev) => Math.max(prev, n));
  }

  function toggleStep(n: number) {
    setActiveStep((prev) => (prev === n ? -1 : n)); // -1 = all collapsed
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const selectedAccounts = useMemo(
    () => connectedAccounts.filter((a) => selectedAccountIds.includes(a.providerUserId)),
    [connectedAccounts, selectedAccountIds],
  );

  const selectedPlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform.toLowerCase()))],
    [selectedAccounts],
  );

  const MAX_CHARS    = postType === "VIDEO" ? 5000 : 2200;
  const charCount    = description.length;
  const nearLimit    = charCount > MAX_CHARS * 0.85;
  const overLimit    = charCount > MAX_CHARS;
  const platformCharErrors  = getCharErrors(selectedPlatforms, charCount);
  const hasAnyCharError     = overLimit || platformCharErrors.length > 0;

  const effectiveMaxFiles = useMemo(
    () => postType && postType !== "TEXT" ? getEffectiveMaxFiles(selectedPlatforms, postType) : 0,
    [selectedPlatforms, postType],
  );
  const restrictivePlatform = useMemo(
    () => postType && postType !== "TEXT" ? getMostRestrictivePlatform(selectedPlatforms, postType) : null,
    [selectedPlatforms, postType],
  );
  const restrictivePlatformLabel = restrictivePlatform
    ? (PLATFORM_DISPLAY_NAMES[restrictivePlatform] ?? restrictivePlatform)
    : undefined;

  const syncMediaErrors = useMemo(
    () => (postType && postType !== "TEXT" ? validateMediaSync(files, selectedPlatforms, postType) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files.map((f) => f.name + f.size).join(","), selectedPlatforms.join(","), postType],
  );

  useEffect(() => {
    if (!postType || postType === "TEXT" || files.length === 0 || selectedPlatforms.length === 0) {
      setMediaErrors([]);
      setValidatingMedia(false);
      return;
    }
    setValidatingMedia(true);
    validateMediaFiles(files, selectedPlatforms, postType)
      .then(({ errors }) => setMediaErrors(errors))
      .catch(() => setMediaErrors([]))
      .finally(() => setValidatingMedia(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.map((f) => f.name + f.size).join(","), selectedPlatforms.join(","), postType]);

  const allMediaErrors = mediaErrors.length > 0 ? mediaErrors : syncMediaErrors;
  const hasMediaErrors = allMediaErrors.length > 0;

  // ── Completeness flags ───────────────────────────────────────────────────────
  const step1Complete = postType !== null;
  const step2Complete = postType !== null && selectedAccountIds.length > 0;
  const step3Complete = postType !== null && description.trim().length > 0 && (postType === "TEXT" || files.length > 0);
  const step4Complete = !!date && !!time;
  const canDirectSchedule =
    activeWorkspace?.approvalMode === "NONE" ||
    (activeWorkspace?.approvalMode === "OPTIONAL" && canPublishPosts);
  const submitActionLabel = canDirectSchedule ? "Schedule" : "Submit for Review";
  const step4Title = canDirectSchedule ? "Schedule & Publish" : "Schedule & Review";
  const step4Description = canDirectSchedule
    ? "Set when your post should go live, or save it as a draft."
    : "Set when your post should go live, then send it into the approval workflow.";

  // ── Load accounts ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded) loadData();
  }, [isLoaded]);

  async function loadData() {
    try {
      setAccountsLoading(true);
      setConnectedAccounts(await fetchAllConnectedAccountsApi(getToken));
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load accounts");
    } finally {
      setAccountsLoading(false);
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handlePostTypeChange(type: PostType) {
    setPostType(type);
    setSelectedAccountIds([]);
    setDescription("");
    setFiles([]);
    setPlatformConfigs({});
    setMediaErrors([]);
    setShowErrors(false);
    // Reset progress and advance to step 2
    setReachedStep(2);
    setActiveStep(2);
  }

  function resetAll() {
    setPostType(null);
    setSelectedAccountIds([]);
    setDescription("");
    setFiles([]);
    setDate(initialDate);
    setTime(initialTime);
    setPlatformConfigs({});
    setShowErrors(false);
    setMediaErrors([]);
    setActiveStep(1);
    setReachedStep(1);
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function submit() {
    setShowErrors(true);

    if (!postType)                         { toast.error("Please choose a content type");             return; }
    if (!description.trim())             { toast.error("Please write a caption");                     return; }
    if (postType !== "TEXT" && files.length === 0) { toast.error("Please upload at least one file"); return; }
    if (!date || !time)                  { toast.error("Please select a date and time");              return; }
    if (selectedAccountIds.length === 0) { toast.error("Please select at least one account");        return; }

    if (platformCharErrors.length > 0) {
      const { platform, current, limit } = platformCharErrors[0];
      const over = current - limit;
      toast.error(`${PLATFORM_DISPLAY_NAMES[platform] ?? platform} limit exceeded — remove ${over.toLocaleString()} char${over === 1 ? "" : "s"}`);
      return;
    }
    if (overLimit) { toast.error(`Caption exceeds ${MAX_CHARS.toLocaleString()} characters`); return; }

    if (postType === "VIDEO") {
      const cfgErrors = validatePlatformConfigs(selectedPlatforms, platformConfigs, "VIDEO");
      if (cfgErrors.length > 0) { toast.error(cfgErrors[0].message); return; }
    }

    if (postType !== "TEXT") {
      const { errors: finalErrors } = await validateMediaFiles(files, selectedPlatforms, postType);
      if (finalErrors.length > 0) {
        setMediaErrors(finalErrors);
        toast.error(`Fix ${finalErrors.length} media issue${finalErrors.length !== 1 ? "s" : ""} before scheduling`);
        return;
      }
    }

    setSubmitLoading(true);
    try {
      const media = [];
      for (const file of files) {
        if (postType === "VIDEO" && !file.type.startsWith("video/")) continue;
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        media.push({ fileName: file.name, mimeType: file.type, fileUrl, fileKey, size: file.size });
      }

      if (postType !== "TEXT" && media.length === 0) { toast.error("No valid files found"); return; }

      const response = await postConnectedAccountsApi(getToken, {
        description,
        postType,
        media,
        connectedAccounts: selectedAccounts,
        scheduledTime: localToUTC(date, time),
        platformConfigs,
      });

      toast.success(
        response.overallStatus === "IN_REVIEW"
          ? `${POST_TYPE_META[postType].label} post submitted for review.`
          : `${POST_TYPE_META[postType].label} post scheduled successfully!`
      );
      resetAll();
    } catch {
      toast.error("Upload failed. Please check your connection and try again.");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function saveDraft() {
    if (!postType)          { toast.error("Please choose a content type");                 return; }
    if (!description.trim()) { toast.error("Please write a caption before saving as draft"); return; }
    if (hasAnyCharError)      { toast.error("Fix character limit errors before saving");     return; }

    setDraftLoading(true);
    try {
      const media = [];
      for (const file of files) {
        if (postType === "VIDEO" && !file.type.startsWith("video/")) continue;
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        media.push({ fileName: file.name, mimeType: file.type, fileUrl, fileKey, size: file.size });
      }

      await postConnectedAccountsApi(getToken, {
        description,
        postType,
        media,
        connectedAccounts: selectedAccounts,
        platformConfigs,
        isDraft: true,
      });

      toast.success("Draft saved! You can schedule it later from Drafts.");
      resetAll();
    } catch {
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setDraftLoading(false);
    }
  }

  // ── Summaries ─────────────────────────────────────────────────────────────────
  const selectedCount = selectedAccountIds.length;

  const selectedPlatformKeys = [...new Set(
    connectedAccounts
      .filter((a) => selectedAccountIds.includes(a.providerUserId))
      .map((a) => a.platform.toLowerCase()),
  )];

  const step1Summary = postType ? (
    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
      {React.createElement(POST_TYPE_META[postType].Icon, {
        className: "w-3.5 h-3.5 text-primary",
      })}
      {POST_TYPE_META[postType].label}
    </span>
  ) : null;

  const step2Summary = (
    <span className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold text-primary">{selectedCount}</span>
      <span className="text-xs text-muted-foreground">{selectedCount === 1 ? "account" : "accounts"}</span>
      {selectedPlatformKeys.slice(0, 3).map((p) => (
        <span key={p} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", PLATFORM_BADGE_STYLES[p] ?? "bg-muted text-foreground border-border")}>
          {PLATFORM_LABELS[p] ?? p}
        </span>
      ))}
      {selectedPlatformKeys.length > 3 && (
        <span className="text-[10px] text-muted-foreground">+{selectedPlatformKeys.length - 3}</span>
      )}
    </span>
  );

  const step3Summary = (
    <span className="flex items-center gap-2 text-sm text-foreground">
      <span className="font-medium truncate max-w-[160px] sm:max-w-[260px]">
        {description.trim().slice(0, 60)}{description.trim().length > 60 ? "…" : ""}
      </span>
          {postType && postType !== "TEXT" && files.length > 0 && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          · {files.length} {postType === "IMAGE" ? "image" : "video"}{files.length !== 1 ? "s" : ""}
        </span>
      )}
    </span>
  );

  const step4Summary = date && time ? (
    <span className="text-sm font-medium text-foreground">
      {new Date(`${date}T${time}`).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })}
    </span>
  ) : null;

  return (
    <div className="min-h-screen bg-background">

      <ProtectedPageHeader
        title="Schedule Post"
        description={
          initialDate && initialTime
            ? `Pre-filled from calendar · ${initialDate} at ${initialTime}`
            : "Create once and publish across connected platforms."
        }
        icon={<CalendarClock className="h-4 w-4" />}
        actions={
          selectedCount > 0 ? (
            <div className="flex flex-shrink-0 items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-3 py-1.5 text-xs font-semibold text-foreground">
              <Zap className="w-3 h-3" />
              {selectedCount} {selectedCount === 1 ? "account" : "accounts"}
            </div>
          ) : undefined
        }
      />

      {selectedPlatformKeys.length > 0 && (
        <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-2.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-foreground-muted">Posting to:</span>
            {selectedPlatformKeys.map((p) => (
              <span key={p} className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", PLATFORM_BADGE_STYLES[p] ?? "border-border-subtle bg-surface-raised text-foreground")}>
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Steps ── */}
      <div className="space-y-4 px-4 py-6 sm:px-6">

        {/* ── Step 1: Content Type ── */}
        <StepCard
          step={1}
          title="Content Type"
          description="Choose the format for this post."
          complete={step1Complete}
          isOpen={activeStep === 1}
          onToggle={() => toggleStep(1)}
          summary={step1Summary ?? undefined}
        >
          <PostTypeSelector postType={postType} setPostType={handlePostTypeChange} />
        </StepCard>

        {/* ── Step 2: Select Accounts ── */}
        <StepCard
          step={2}
          title="Select Accounts"
          description="Choose which social profiles this post will be published to."
          complete={step2Complete}
          locked={reachedStep < 2}
          isOpen={activeStep === 2}
          onToggle={reachedStep >= 2 ? () => toggleStep(2) : undefined}
          summary={step2Summary}
        >
          <AccountSelector
            postType={postType}
            accounts={connectedAccounts}
            selectedAccountIds={selectedAccountIds}
            onChange={setSelectedAccountIds}
            loading={accountsLoading}
          />
          {selectedCount > 0 && (
            <ContinueBtn onClick={() => goToStep(3)} />
          )}
        </StepCard>

        {/* ── Step 3: Compose ── */}
        <StepCard
          step={3}
          title="Compose"
          description={
            postType === "TEXT"
              ? "Write your post content and configure platform settings."
              : postType === "IMAGE"
              ? "Write a caption, upload images, and configure platform settings."
              : "Write a description, upload your video, and configure platform settings."
          }
          complete={step3Complete}
          locked={reachedStep < 3}
          isOpen={activeStep === 3}
          onToggle={reachedStep >= 3 ? () => toggleStep(3) : undefined}
          summary={step3Summary}
        >
          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                {postType === "TEXT" ? "Content" : "Caption"}
              </label>
              <span className={cn(
                "text-xs font-mono tabular-nums transition-colors",
                overLimit ? "text-red-500 font-semibold" : nearLimit ? "text-amber-500" : "text-muted-foreground",
              )}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
            <textarea
              placeholder={
                postType === "TEXT"
                  ? "Write your post content here. You can use emoji, hashtags, and mentions."
                  : postType === "VIDEO"
                  ? "Write a description for your video. Include relevant keywords, hashtags, and a call to action."
                  : "Write your post caption here. You can use emoji, hashtags, and mentions."
              }
              className={cn(
                "min-h-[160px] w-full resize-none rounded-lg border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground transition-[border-color,box-shadow,background-color] duration-150",
                "placeholder:text-foreground-subtle",
                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/20",
                overLimit || platformCharErrors.length > 0
                  ? "border-destructive/60 focus:border-destructive"
                  : "border-border-subtle focus:border-[hsl(var(--accent))]",
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {selectedPlatforms.length > 0 && (
              <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} />
            )}
          </div>

          {/* Media upload — IMAGE / VIDEO only */}
          {postType && postType !== "TEXT" && (
            <div className="space-y-2 mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  {postType === "IMAGE" ? "Images" : "Video"}
                </label>
                {selectedPlatforms.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Max {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""}
                    {restrictivePlatformLabel ? ` (${restrictivePlatformLabel} limit)` : ""}
                  </span>
                )}
              </div>
              <MediaUploader
                files={files}
                setFiles={setFiles}
                accept={postType === "IMAGE" ? "image/*" : "video/*"}
                label={files.length === 0
                  ? `Upload ${postType === "IMAGE" ? "Images" : "Video"}`
                  : postType === "IMAGE" ? "Add More Images" : "Add Another Video"}
                maxFiles={effectiveMaxFiles}
                maxFilesLabel={restrictivePlatformLabel}
              />
              {selectedPlatforms.length > 0 && (
                <MediaValidationPanel
                  platforms={selectedPlatforms}
                  postType={postType}
                  errors={allMediaErrors}
                  validating={validatingMedia}
                  hasFiles={files.length > 0}
                />
              )}
            </div>
          )}

          {/* Platform-specific settings */}
          {postType && selectedAccounts.length > 0 && (
            <div className="mt-6 border-t border-border-subtle pt-6">
              <PlatformConfigsPanel
                selectedAccounts={selectedAccounts}
                configs={platformConfigs}
                onChange={setPlatformConfigs}
                showErrors={showErrors}
                postType={postType}
              />
            </div>
          )}

          <ContinueBtn
            onClick={() => goToStep(4)}
            disabled={!step3Complete || hasAnyCharError}
            label="Continue to Schedule"
          />
        </StepCard>

        {/* ── Step 4: Schedule & Publish ── */}
        <StepCard
          step={4}
          title={step4Title}
          description={step4Description}
          complete={step4Complete}
          locked={reachedStep < 4}
          isOpen={activeStep === 4}
          onToggle={reachedStep >= 4 ? () => toggleStep(4) : undefined}
          summary={step4Summary ?? undefined}
        >
          <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

          <div className="flex gap-2 mt-6">
            <Button
              onClick={saveDraft}
              disabled={draftLoading || submitLoading || hasAnyCharError || validatingMedia}
              variant="outline"
              className="flex-1 h-11 font-semibold gap-2 text-sm"
              size="lg"
            >
              {draftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Save Draft
            </Button>
            <Button
              onClick={submit}
              disabled={submitLoading || draftLoading || selectedAccountIds.length === 0 || hasAnyCharError || (postType !== "TEXT" && hasMediaErrors) || validatingMedia}
              className="flex-1 h-11 font-semibold gap-2 text-sm"
              size="lg"
            >
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitActionLabel}
            </Button>
          </div>

          {selectedAccountIds.length === 0 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Select an account to {canDirectSchedule ? "schedule" : "submit for review"}, or save as draft to finish later.
            </p>
          )}
        </StepCard>

      </div>
    </div>
  );
}
