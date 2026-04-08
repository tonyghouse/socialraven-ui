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
import { WorkspaceApprovalMode } from "@/model/Workspace";
import {
  approvalModeDescription,
  approvalModeLabel,
  canDirectScheduleForMode,
  resolveWorkspaceApprovalMode,
} from "@/lib/approval-workflow";
import type { ComposerLibraryAsset } from "@/lib/workspace-library";
import {
  appendTextBlock,
  applyFirstCommentSnippet,
  buildComposerLibraryAssets,
  buildPseudoFilesFromLibraryAssets,
  dedupeLibraryAssets,
  filterRelevantBundleItems,
  mergePlatformConfigs,
} from "@/lib/workspace-library";
import type { WorkspaceLibraryBundle, WorkspaceLibraryItem } from "@/model/WorkspaceLibrary";

import PostTypeSelector from "@/components/schedule-post/post-type-selector";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import MediaUploader from "@/components/schedule-post/media-uploader";
import ScheduleDateTimePicker from "@/components/schedule-post/date-time-picker";
import PlatformCharLimits from "@/components/schedule-post/platform-char-limits";
import MediaValidationPanel from "@/components/schedule-post/media-validation-panel";
import PlatformConfigsPanel from "@/components/schedule-post/platform-configs-panel";
import { LibraryComposerPanel } from "@/components/workspace-library/library-composer-panel";
import { SelectedLibraryAssets } from "@/components/workspace-library/selected-library-assets";

// ── Post type meta ─────────────────────────────────────────────────────────────

const POST_TYPE_META: Record<PostType, { label: string; Icon: React.ElementType; description: string }> = {
  IMAGE: { label: "Image",  Icon: ImageIcon, description: "Photos, graphics & carousels" },
  VIDEO: { label: "Video",  Icon: Video,     description: "Reels, clips & short-form videos" },
  TEXT:  { label: "Text",   Icon: Type,      description: "Updates, threads & announcements" },
};

// ── Platform badge colours ────────────────────────────────────────────────────

const PLATFORM_BADGE_STYLES: Record<string, string> = {
  facebook:  "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  instagram: "border-[var(--ds-pink-200)] bg-[var(--ds-pink-100)] text-[var(--ds-pink-700)]",
  x:         "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  linkedin:  "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  youtube:   "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
  threads:   "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  tiktok:    "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", x: "X",
  linkedin: "LinkedIn", youtube: "YouTube",    threads: "Threads", tiktok: "TikTok",
};
const DEFAULT_APPROVAL_OVERRIDE = "DEFAULT";
const pageClassName = "min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]";
const insetSurfaceClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

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
        "overflow-hidden rounded-2xl border bg-[var(--ds-background-100)] shadow-sm transition-[border-color,box-shadow,opacity] duration-200",
        locked
          ? "border-[var(--ds-gray-400)] opacity-60"
          : complete && isOpen
            ? "border-[var(--ds-blue-200)] shadow-[0_0_0_1px_var(--ds-blue-200)]"
            : complete
              ? "border-[var(--ds-gray-500)]"
              : "border-[var(--ds-gray-400)]",
      )}
    >
      {/* ── Header ── */}
      <button
        type="button"
        disabled={!canToggle}
        onClick={canToggle ? onToggle : undefined}
        className={cn(
          "flex w-full items-center gap-4 border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-5 py-4 text-left transition-colors duration-150",
          canToggle
            ? cn("cursor-pointer hover:bg-[var(--ds-gray-200)]", focusRingClassName)
            : "cursor-default",
        )}
      >
        {/* Step indicator */}
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-label-12 transition-colors duration-200",
            complete
              ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
              : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]",
          )}
        >
          {complete
            ? <CheckCircle2 className="h-4 w-4 text-[var(--ds-blue-700)]" />
            : <span>{step}</span>
          }
        </div>

        {/* Title / summary */}
        <div className="flex-1 min-w-0">
          {!isOpen && complete && summary ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-copy-12 text-[var(--ds-gray-900)]">{title}</span>
              <span className="text-[var(--ds-gray-700)]">·</span>
              {summary}
            </div>
          ) : (
            <>
              <h2 className="text-label-14 text-[var(--ds-gray-1000)]">{title}</h2>
              <p className="mt-1 text-copy-12 leading-5 text-[var(--ds-gray-900)]">{description}</p>
            </>
          )}
        </div>

        {/* Edit hint + chevron */}
        {canToggle && (
            <div className="flex flex-shrink-0 items-center gap-1.5 text-[var(--ds-gray-900)]">
              {!isOpen && (
              <span className="hidden items-center gap-1 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-2.5 py-1 text-label-12 text-[var(--ds-gray-1000)] sm:flex">
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
    <div className="mt-5 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-4 py-2 text-label-14 transition-colors duration-150",
          focusRingClassName,
          disabled
            ? "cursor-not-allowed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
            : "border-transparent bg-[var(--ds-blue-600)] text-white hover:bg-[var(--ds-blue-700)]",
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
  const { canManageApprovalRules, canPublishPosts } = useRole();

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
  const [selectedLibraryAssets, setSelectedLibraryAssets] = useState<ComposerLibraryAsset[]>([]);
  const [date, setDate]               = useState(initialDate);
  const [time, setTime]               = useState(initialTime);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});
  const [approvalModeOverrideInput, setApprovalModeOverrideInput] = useState<
    WorkspaceApprovalMode | typeof DEFAULT_APPROVAL_OVERRIDE
  >(DEFAULT_APPROVAL_OVERRIDE);

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
  const availableUploadSlots = Math.max(0, effectiveMaxFiles - selectedLibraryAssets.length);
  const restrictivePlatform = useMemo(
    () => postType && postType !== "TEXT" ? getMostRestrictivePlatform(selectedPlatforms, postType) : null,
    [selectedPlatforms, postType],
  );
  const restrictivePlatformLabel = restrictivePlatform
    ? (PLATFORM_DISPLAY_NAMES[restrictivePlatform] ?? restrictivePlatform)
    : undefined;
  const totalMediaCount = files.length + selectedLibraryAssets.length;
  const pseudoLibraryFiles = useMemo(
    () => buildPseudoFilesFromLibraryAssets(selectedLibraryAssets),
    [selectedLibraryAssets],
  );

  const syncMediaErrors = useMemo(
    () => (
      postType && postType !== "TEXT"
        ? validateMediaSync([...files, ...pseudoLibraryFiles], selectedPlatforms, postType)
        : []
    ),
    [files, pseudoLibraryFiles, postType, selectedPlatforms],
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
  }, [files, postType, selectedPlatforms]);

  const allMediaErrors = mediaErrors.length > 0 ? mediaErrors : syncMediaErrors;
  const hasMediaErrors = allMediaErrors.length > 0;

  // ── Completeness flags ───────────────────────────────────────────────────────
  const step1Complete = postType !== null;
  const step2Complete = postType !== null && selectedAccountIds.length > 0;
  const step3Complete =
    postType !== null && description.trim().length > 0 && (postType === "TEXT" || totalMediaCount > 0);
  const step4Complete = !!date && !!time;
  const effectiveApprovalMode = resolveWorkspaceApprovalMode(activeWorkspace, {
    approvalModeOverride:
      approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE
        ? null
        : approvalModeOverrideInput,
    providerUserIds: selectedAccountIds,
    postType,
  });
  const canDirectSchedule = canDirectScheduleForMode(
    effectiveApprovalMode,
    canPublishPosts
  );
  const submitActionLabel = canDirectSchedule ? "Schedule" : "Submit for Review";
  const step4Title = canDirectSchedule ? "Schedule & Publish" : "Schedule & Review";
  const step4Description = canDirectSchedule
    ? "Set when your post should go live, or save it as a draft."
    : "Set when your post should go live, then send it into the approval workflow.";

  // ── Load accounts ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

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

    void loadData();
  }, [getToken, isLoaded]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handlePostTypeChange(type: PostType) {
    setPostType(type);
    setSelectedAccountIds([]);
    setDescription("");
    setFiles([]);
    setSelectedLibraryAssets([]);
    setPlatformConfigs({});
    setApprovalModeOverrideInput(DEFAULT_APPROVAL_OVERRIDE);
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
    setSelectedLibraryAssets([]);
    setDate(initialDate);
    setTime(initialTime);
    setPlatformConfigs({});
    setApprovalModeOverrideInput(DEFAULT_APPROVAL_OVERRIDE);
    setShowErrors(false);
    setMediaErrors([]);
    setActiveStep(1);
    setReachedStep(1);
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  function applyLibrarySnippet(item: WorkspaceLibraryItem) {
    if (!item.body?.trim()) {
      toast.error("This snippet does not contain any content.");
      return;
    }

    if (item.snippetTarget === "FIRST_COMMENT") {
      const result = applyFirstCommentSnippet(platformConfigs, selectedPlatforms, item.body);
      if (result.appliedPlatforms.length === 0) {
        toast.error("Select Facebook or Instagram accounts before applying a first-comment snippet.");
        return;
      }
      setPlatformConfigs(result.platformConfigs);
      toast.success(`Applied "${item.name}" to first comments.`);
      return;
    }

    setDescription((current) => appendTextBlock(current, item.body));
    toast.success(`Applied snippet "${item.name}".`);
  }

  function applyLibraryTemplate(item: WorkspaceLibraryItem) {
    if (item.postCollectionType !== postType) {
      toast.error(`"${item.name}" does not match the selected content type.`);
      return false;
    }

    if (
      item.body?.trim() &&
      description.trim() &&
      description.trim() !== item.body.trim() &&
      !window.confirm("Replace the current caption with this template's body content?")
    ) {
      return false;
    }

    if (item.body?.trim()) {
      setDescription(item.body.trim());
    }
    setPlatformConfigs((current) => mergePlatformConfigs(current, item.platformConfigs));
    toast.success(`Applied template "${item.name}".`);
    return true;
  }

  function applyLibraryAssets(item: WorkspaceLibraryItem) {
    const assets = buildComposerLibraryAssets(item);
    if (assets.length === 0) {
      toast.error("This asset does not contain reusable media.");
      return;
    }
    setSelectedLibraryAssets((current) => dedupeLibraryAssets(current, assets));
    toast.success(`Added ${assets.length} reusable asset${assets.length === 1 ? "" : "s"} from "${item.name}".`);
  }

  async function handleApplyLibraryItem(item: WorkspaceLibraryItem) {
    if (!postType) {
      return;
    }
    if (item.itemType === "SNIPPET") {
      applyLibrarySnippet(item);
      return;
    }
    if (item.itemType === "TEMPLATE") {
      applyLibraryTemplate(item);
      return;
    }
    applyLibraryAssets(item);
  }

  async function handleApplyLibraryBundle(bundle: WorkspaceLibraryBundle) {
    if (!postType) {
      return;
    }
    const relevantItems = filterRelevantBundleItems(bundle, postType);
    if (relevantItems.length === 0) {
      toast.error("This bundle does not contain usable items for the current composer.");
      return;
    }

    let appliedCount = 0;
    let templateApplied = false;
    for (const item of relevantItems) {
      if (item.itemType === "TEMPLATE") {
        if (templateApplied) {
          continue;
        }
        if (applyLibraryTemplate(item)) {
          templateApplied = true;
          appliedCount += 1;
        }
        continue;
      }
      if (item.itemType === "SNIPPET") {
        applyLibrarySnippet(item);
        appliedCount += 1;
        continue;
      }
      applyLibraryAssets(item);
      appliedCount += 1;
    }

    if (appliedCount > 0) {
      toast.success(`Applied ${appliedCount} bundle item${appliedCount === 1 ? "" : "s"} from "${bundle.name}".`);
    }
  }

  async function submit() {
    setShowErrors(true);

    if (!postType)                         { toast.error("Please choose a content type");             return; }
    if (!description.trim())             { toast.error("Please write a caption");                     return; }
    if (postType !== "TEXT" && totalMediaCount === 0) { toast.error("Please upload or attach at least one file"); return; }
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
      const media = selectedLibraryAssets.map((asset) => ({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileUrl: asset.fileUrl ?? "",
        fileKey: asset.fileKey,
        size: asset.size ?? 0,
      }));
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
        approvalModeOverride:
          approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE
            ? undefined
            : approvalModeOverrideInput,
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
      const media = selectedLibraryAssets.map((asset) => ({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileUrl: asset.fileUrl ?? "",
        fileKey: asset.fileKey,
        size: asset.size ?? 0,
      }));
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
        approvalModeOverride:
          approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE
            ? undefined
            : approvalModeOverrideInput,
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
    <span className="flex items-center gap-1.5 text-label-14 text-[var(--ds-gray-1000)]">
      {React.createElement(POST_TYPE_META[postType].Icon, {
        className: "h-3.5 w-3.5 text-[var(--ds-blue-700)]",
      })}
      {POST_TYPE_META[postType].label}
    </span>
  ) : null;

  const step2Summary = (
    <span className="flex items-center gap-2 flex-wrap">
      <span className="text-label-14 text-[var(--ds-blue-700)]">{selectedCount}</span>
      <span className="text-copy-12 text-[var(--ds-gray-900)]">{selectedCount === 1 ? "account" : "accounts"}</span>
      {selectedPlatformKeys.slice(0, 3).map((p) => (
        <span
          key={p}
          className={cn(
            "rounded-full border px-1.5 py-0.5 text-label-12",
            PLATFORM_BADGE_STYLES[p]
            ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
          )}
        >
          {PLATFORM_LABELS[p] ?? p}
        </span>
      ))}
      {selectedPlatformKeys.length > 3 && (
        <span className="text-copy-12 text-[var(--ds-gray-900)]">+{selectedPlatformKeys.length - 3}</span>
      )}
    </span>
  );

  const step3Summary = (
    <span className="flex items-center gap-2 text-label-14 text-[var(--ds-gray-1000)]">
      <span className="truncate max-w-[160px] sm:max-w-[260px]">
        {description.trim().slice(0, 60)}{description.trim().length > 60 ? "…" : ""}
      </span>
          {postType && postType !== "TEXT" && totalMediaCount > 0 && (
        <span className="shrink-0 text-copy-12 text-[var(--ds-gray-900)]">
          · {totalMediaCount} {postType === "IMAGE" ? "image" : "video"}{totalMediaCount !== 1 ? "s" : ""}
        </span>
      )}
    </span>
  );

  const step4Summary = date && time ? (
    <span className="text-label-14 text-[var(--ds-gray-1000)]">
      {new Date(`${date}T${time}`).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })}
    </span>
  ) : null;

  return (
    <div className={pageClassName}>

      <ProtectedPageHeader
        title="Schedule Post"
        description={
          initialDate && initialTime
            ? `Pre-filled from calendar · ${initialDate} at ${initialTime}`
            : "Create once and publish across connected platforms."
        }
        icon={<CalendarClock className="h-4 w-4" />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={
          selectedCount > 0 ? (
            <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-1.5 text-copy-12 text-[var(--ds-gray-1000)]">
              <Zap className="w-3 h-3" />
              {selectedCount} {selectedCount === 1 ? "account" : "accounts"}
            </div>
          ) : undefined
        }
      />

      {selectedPlatformKeys.length > 0 && (
        <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-copy-12 text-[var(--ds-gray-900)]">Posting to:</span>
            {selectedPlatformKeys.map((p) => (
              <span
                key={p}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-label-12",
                  PLATFORM_BADGE_STYLES[p]
                  ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                )}
              >
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
            appearance="geist"
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
          <div className="mb-6">
            <LibraryComposerPanel
              postType={postType}
              onApplyItem={handleApplyLibraryItem}
              onApplyBundle={handleApplyLibraryBundle}
              appearance="geist"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-14 text-[var(--ds-gray-1000)]">
                {postType === "TEXT" ? "Content" : "Caption"}
              </label>
              <span className={cn(
                "text-copy-12 font-mono tabular-nums transition-colors",
                overLimit
                  ? "font-semibold text-[var(--ds-red-700)]"
                  : nearLimit
                    ? "text-[var(--ds-amber-700)]"
                    : "text-[var(--ds-gray-900)]",
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
                "min-h-[160px] w-full resize-none rounded-xl border bg-[var(--ds-background-100)] px-4 py-3 text-copy-14 leading-6 text-[var(--ds-gray-1000)] transition-[border-color,box-shadow,background-color] duration-150",
                "placeholder:text-[var(--ds-gray-900)]",
                focusRingClassName,
                overLimit || platformCharErrors.length > 0
                  ? "border-[var(--ds-red-300)]"
                  : "border-[var(--ds-gray-400)] focus:border-[var(--ds-blue-600)]",
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {selectedPlatforms.length > 0 && (
              <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} appearance="geist" />
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
              {availableUploadSlots > 0 ? (
                <MediaUploader
                  files={files}
                  setFiles={setFiles}
                  accept={postType === "IMAGE" ? "image/*" : "video/*"}
                  label={files.length === 0
                    ? `Upload ${postType === "IMAGE" ? "Images" : "Video"}`
                    : postType === "IMAGE" ? "Add More Images" : "Add Another Video"}
                  maxFiles={availableUploadSlots}
                  maxFilesLabel={restrictivePlatformLabel}
                  appearance="geist"
                />
              ) : (
                <p className="text-copy-12 text-[var(--ds-gray-900)]">
                  Maximum {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""} reached. Remove a library asset to upload more files.
                </p>
              )}
              <SelectedLibraryAssets
                assets={selectedLibraryAssets}
                onRemove={(fileKey) =>
                  setSelectedLibraryAssets((current) =>
                    current.filter((asset) => asset.fileKey !== fileKey)
                  )
                }
                appearance="geist"
              />
              {selectedPlatforms.length > 0 && (
                <MediaValidationPanel
                  platforms={selectedPlatforms}
                  postType={postType}
                  errors={allMediaErrors}
                  validating={validatingMedia}
                  hasFiles={totalMediaCount > 0}
                  appearance="geist"
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
              appearance="geist"
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
          <ScheduleDateTimePicker
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
            appearance="geist"
          />

          <div className={cn(insetSurfaceClassName, "mt-4 p-4")}>
            <div className="space-y-1">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">Effective approval mode</p>
              <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                {approvalModeLabel(effectiveApprovalMode)}. {approvalModeDescription(effectiveApprovalMode)}
              </p>
            </div>

            {canManageApprovalRules ? (
              <div className="mt-4 space-y-2">
                <label className="text-label-12 uppercase tracking-wide text-[var(--ds-gray-900)]">
                  Campaign override
                </label>
                <select
                  value={approvalModeOverrideInput}
                  onChange={(event) =>
                    setApprovalModeOverrideInput(
                      event.target.value as WorkspaceApprovalMode | typeof DEFAULT_APPROVAL_OVERRIDE
                    )
                  }
                  className={cn(
                    "flex h-10 w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] transition-colors",
                    focusRingClassName
                  )}
                >
                  <option value={DEFAULT_APPROVAL_OVERRIDE}>Use workspace rules</option>
                  <option value="NONE">No approval required</option>
                  <option value="OPTIONAL">Optional approval</option>
                  <option value="REQUIRED">Required approval</option>
                  <option value="MULTI_STEP">Multi-step approval</option>
                </select>
                <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                  Campaign overrides beat account and content-type rules for this collection only.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                Approval is resolved automatically from workspace policy, account rules, and content type.
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={saveDraft}
              disabled={draftLoading || submitLoading || hasAnyCharError || validatingMedia}
              variant="outline"
              className="h-11 flex-1 gap-2 border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-label-14 text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
              size="lg"
            >
              {draftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Save Draft
            </Button>
            <Button
              onClick={submit}
              disabled={submitLoading || draftLoading || selectedAccountIds.length === 0 || hasAnyCharError || (postType !== "TEXT" && hasMediaErrors) || validatingMedia}
              className="h-11 flex-1 gap-2 border-transparent bg-[var(--ds-blue-600)] text-label-14 text-white shadow-none hover:bg-[var(--ds-blue-700)]"
              size="lg"
            >
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitActionLabel}
            </Button>
          </div>

          {selectedAccountIds.length === 0 && (
            <p className="mt-2 text-center text-copy-12 text-[var(--ds-gray-900)]">
              Select an account to {canDirectSchedule ? "schedule" : "submit for review"}, or save as draft to finish later.
            </p>
          )}
        </StepCard>

      </div>
    </div>
  );
}
