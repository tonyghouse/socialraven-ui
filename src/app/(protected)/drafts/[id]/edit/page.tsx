"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Pencil,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  CloudUpload,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { useWorkspace } from "@/context/WorkspaceContext";
import { usePlan } from "@/hooks/usePlan";
import { useRole } from "@/hooks/useRole";
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { updatePostCollectionApi } from "@/service/updatePostCollectionApi";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { localToUTC } from "@/lib/timeUtil";
import {
  approvalUpdateSuccessMessage,
  confirmApprovalLockIfNeeded,
} from "@/lib/approval-lock";
import { getCharErrors, PLATFORM_DISPLAY_NAMES, validatePlatformConfigs } from "@/lib/platformLimits";
import {
  validateMediaFiles,
  validateMediaSync,
  getEffectiveMaxFiles,
  getMostRestrictivePlatform,
  MediaValidationError,
} from "@/lib/mediaValidation";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { PlatformConfigs } from "@/model/PostCollection";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import MediaUploader from "@/components/schedule-post/media-uploader";
import PlatformCharLimits from "@/components/schedule-post/platform-char-limits";
import MediaValidationPanel from "@/components/schedule-post/media-validation-panel";
import PlatformConfigsPanel from "@/components/schedule-post/platform-configs-panel";
import { WorkspaceApprovalMode } from "@/model/Workspace";
import {
  approvalModeDescription,
  approvalModeLabel,
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
import { LibraryComposerPanel } from "@/components/workspace-library/library-composer-panel";
import { SelectedLibraryAssets } from "@/components/workspace-library/selected-library-assets";
import {
  DraftDetailActionButton,
  DraftDetailBadge,
} from "@/components/drafts/draft-detail-primitives";
import { DraftDateTimePicker } from "@/components/drafts/draft-date-time-picker";
import { DraftEditPageSkeleton } from "@/components/drafts/draft-edit-page-skeleton";

/* ── Config ── */

const TYPE_CONFIG: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string; description: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className:
      "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
    description:
      "Edit your caption, add or remove images, and configure platform-specific settings.",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className:
      "border-[var(--ds-teal-200)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-700)]",
    description:
      "Edit your description, replace or add videos, and configure platform-specific settings.",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className:
      "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
    description: "Edit your content and configure platform-specific settings.",
  },
};

const PLATFORM_BADGE_STYLES: Record<string, string> = {
  facebook:  "border-[#1877F2]/20 bg-[#1877F2]/10 text-[#1877F2]",
  instagram: "border-[#C13584]/20 bg-[#C13584]/10 text-[#A62E69]",
  x:         "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  linkedin:  "border-[#0A66C2]/20 bg-[#0A66C2]/10 text-[#0A66C2]",
  youtube:   "border-[#FF0000]/20 bg-[#FF0000]/10 text-[#D60000]",
  threads:   "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
  tiktok:    "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", x: "X",
  linkedin: "LinkedIn", youtube: "YouTube", threads: "Threads", tiktok: "TikTok",
};
const DEFAULT_APPROVAL_OVERRIDE = "DEFAULT";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

/* ── Helpers ── */

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function toLocalTimeString(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

/* ── Accordion StepCard ── */

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
            ? "border-[var(--ds-blue-200)] shadow-[0_0_0_0.0625rem_var(--ds-blue-200)]"
            : complete
              ? "border-[var(--ds-gray-500)]"
              : "border-[var(--ds-gray-400)]",
      )}
    >
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

        {canToggle && (
          <div className="flex flex-shrink-0 items-center gap-1.5 text-[var(--ds-gray-900)]">
            {!isOpen && (
              <DraftDetailBadge variant="subtle" className="hidden gap-1.5 sm:inline-flex">
                <Pencil className="w-2.5 h-2.5" />
                Edit
              </DraftDetailBadge>
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
          isOpen ? "max-h-[624.9375rem] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Continue button ── */

function ContinueBtn({ onClick, disabled = false, label = "Continue" }: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="mt-5 flex justify-end">
      <DraftDetailActionButton
        tone="primary"
        onClick={onClick}
        disabled={disabled}
        className="min-w-[11rem]"
      >
        <span className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </DraftDetailActionButton>
    </div>
  );
}

/* ── Page ── */

export default function DraftEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getToken, isLoaded } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { isAgency } = usePlan();
  const { canManageApprovalRules } = useRole();

  /* ── Load state ── */
  const [collection, setCollection]   = useState<PostCollectionResponse | null>(null);
  const [allAccounts, setAllAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  /* ── Form state ── */
  const [description, setDescription]         = useState("");
  const [keepMediaKeys, setKeepMediaKeys]     = useState<string[]>([]);
  const [newFiles, setNewFiles]               = useState<File[]>([]);
  const [selectedLibraryAssets, setSelectedLibraryAssets] = useState<ComposerLibraryAsset[]>([]);
  const [date, setDate]                       = useState("");
  const [time, setTime]                       = useState("");
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});
  const [approvalModeOverrideInput, setApprovalModeOverrideInput] = useState<
    WorkspaceApprovalMode | typeof DEFAULT_APPROVAL_OVERRIDE
  >(DEFAULT_APPROVAL_OVERRIDE);

  /* ── Submission state ── */
  const [saving, setSaving]                   = useState(false);
  const [showErrors, setShowErrors]           = useState(false);
  const [mediaErrors, setMediaErrors]         = useState<MediaValidationError[]>([]);
  const [validatingMedia, setValidatingMedia] = useState(false);

  /* ── Accordion state ── */
  const [activeStep, setActiveStep]   = useState(2);
  const [reachedStep, setReachedStep] = useState(2);

  function goToStep(n: number) {
    setActiveStep(n);
    setReachedStep((prev) => Math.max(prev, n));
  }

  function toggleStep(n: number) {
    setActiveStep((prev) => (prev === n ? -1 : n));
  }

  /* ── Load data ── */
  useEffect(() => {
    if (!isLoaded) return;
    async function load() {
      try {
        setLoading(true);
        const [coll, accounts] = await Promise.all([
          fetchPostCollectionByIdApi(getToken, id),
          fetchAllConnectedAccountsApi(getToken),
        ]);
        if (coll.overallStatus === "IN_REVIEW") {
          router.replace(`/drafts/${id}`);
          return;
        }
        if (
          coll.overallStatus !== "DRAFT" &&
          coll.overallStatus !== "CHANGES_REQUESTED" &&
          coll.overallStatus !== "APPROVED"
        ) {
          router.replace(`/scheduled-posts/${id}`);
          return;
        }
        setCollection(coll);
        setAllAccounts(accounts);
        const existingIds = coll.posts
          .map((p) => p.connectedAccount?.providerUserId)
          .filter(Boolean) as string[];
        setSelectedIds(existingIds);

        // Initialize form state from collection
        const scheduledDate = coll.scheduledTime ? new Date(coll.scheduledTime) : null;
        setDescription(coll.description ?? "");
        setDate(scheduledDate ? toLocalDateString(scheduledDate) : "");
        setTime(scheduledDate ? toLocalTimeString(scheduledDate) : "");
        setPlatformConfigs((coll.platformConfigs ?? {}) as PlatformConfigs);
        setKeepMediaKeys(coll.media.map((m) => m.fileKey));
        setSelectedLibraryAssets([]);
        setApprovalModeOverrideInput(coll.approvalModeOverride ?? DEFAULT_APPROVAL_OVERRIDE);
      } catch {
        setError("Failed to load draft.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoaded]);

  /* ── Derived values ── */
  const selectedAccounts = useMemo(
    () => allAccounts.filter((a) => selectedIds.includes(a.providerUserId)),
    [allAccounts, selectedIds],
  );

  const selectedPlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform.toLowerCase()))],
    [selectedAccounts],
  );

  const postType = collection?.postCollectionType ?? "TEXT";

  const MAX_CHARS = postType === "VIDEO" ? 5000 : 2200;
  const charCount = description.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;
  const platformCharErrors = getCharErrors(selectedPlatforms, charCount);
  const hasAnyCharError = overLimit || platformCharErrors.length > 0;

  const effectiveMaxFiles = useMemo(
    () => postType !== "TEXT" ? getEffectiveMaxFiles(selectedPlatforms, postType as "IMAGE" | "VIDEO") : 0,
    [selectedPlatforms, postType],
  );
  const restrictivePlatform = useMemo(
    () => postType !== "TEXT" ? getMostRestrictivePlatform(selectedPlatforms, postType as "IMAGE" | "VIDEO") : null,
    [selectedPlatforms, postType],
  );
  const restrictivePlatformLabel = restrictivePlatform
    ? (PLATFORM_DISPLAY_NAMES[restrictivePlatform] ?? restrictivePlatform)
    : undefined;

  const keptMedia = collection
    ? collection.media.filter((m) => keepMediaKeys.includes(m.fileKey))
    : [];
  const keptCount = keptMedia.length;
  const slotsForNew = Math.max(0, effectiveMaxFiles - keptCount - selectedLibraryAssets.length);
  const pseudoLibraryFiles = useMemo(
    () => buildPseudoFilesFromLibraryAssets(selectedLibraryAssets),
    [selectedLibraryAssets],
  );
  const hasMedia = keptCount + newFiles.length + selectedLibraryAssets.length > 0;

  const syncMediaErrors = useMemo(
    () =>
      postType !== "TEXT"
        ? validateMediaSync(
            [...newFiles, ...pseudoLibraryFiles],
            selectedPlatforms,
            postType as "IMAGE" | "VIDEO"
          )
        : [],
    [newFiles, pseudoLibraryFiles, selectedPlatforms, postType],
  );

  useEffect(() => {
    if (postType === "TEXT" || newFiles.length === 0 || selectedPlatforms.length === 0) {
      setMediaErrors([]); setValidatingMedia(false); return;
    }
    setValidatingMedia(true);
    validateMediaFiles(newFiles, selectedPlatforms, postType as "IMAGE" | "VIDEO")
      .then(({ errors }) => setMediaErrors(errors))
      .catch(() => setMediaErrors([]))
      .finally(() => setValidatingMedia(false));
  }, [newFiles, selectedPlatforms, postType]);

  const allMediaErrors = mediaErrors.length > 0 ? mediaErrors : syncMediaErrors;
  const effectiveApprovalMode = resolveWorkspaceApprovalMode(activeWorkspace, {
    approvalModeOverride:
      approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE
        ? null
        : approvalModeOverrideInput,
    providerUserIds: selectedIds,
    postType: collection?.postCollectionType ?? "TEXT",
  });

  const step3Complete = description.trim().length > 0 && (postType === "TEXT" || hasMedia);

  /* ── Summaries ── */
  const selectedPlatformKeys = [...new Set(
    allAccounts
      .filter((a) => selectedIds.includes(a.providerUserId))
      .map((a) => a.platform.toLowerCase()),
  )];

  const typeCfg = TYPE_CONFIG[postType] ?? TYPE_CONFIG.TEXT;
  const TypeIcon = typeCfg.Icon;

  const step1Summary = (
    <span className="flex items-center gap-1.5 text-label-14 text-[var(--ds-gray-1000)]">
      <TypeIcon className="h-3.5 w-3.5 text-[var(--ds-blue-700)]" />
      {typeCfg.label}
    </span>
  );

  const step2Summary = (
    <span className="flex items-center gap-2 flex-wrap">
      <span className="text-label-14 text-[var(--ds-blue-700)]">{selectedIds.length}</span>
      <span className="text-copy-12 text-[var(--ds-gray-900)]">{selectedIds.length === 1 ? "account" : "accounts"}</span>
      {selectedPlatformKeys.slice(0, 3).map((p) => (
        <span
          key={p}
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-1 text-label-12",
            PLATFORM_BADGE_STYLES[p] ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
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
      <span className="truncate font-medium max-w-[10rem] sm:max-w-[16.25rem]">
        {description.trim().slice(0, 60)}{description.trim().length > 60 ? "…" : ""}
      </span>
      {postType !== "TEXT" && (keptCount + newFiles.length + selectedLibraryAssets.length) > 0 && (
        <span className="flex-shrink-0 text-copy-12 text-[var(--ds-gray-900)]">
          · {keptCount + newFiles.length + selectedLibraryAssets.length} {postType === "IMAGE" ? "image" : "video"}{(keptCount + newFiles.length + selectedLibraryAssets.length) !== 1 ? "s" : ""}
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
      toast.error(`"${item.name}" does not match this draft's content type.`);
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
    const relevantItems = filterRelevantBundleItems(bundle, postType as "IMAGE" | "VIDEO" | "TEXT");
    if (relevantItems.length === 0) {
      toast.error("This bundle does not contain usable items for this draft.");
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

  /* ── Save ── */
  async function save() {
    if (!collection) return;

    setShowErrors(true);
    if (!description.trim()) { toast.error("Please write a caption"); return; }
    if (postType !== "TEXT" && !hasMedia) { toast.error("Please keep, upload, or attach at least one file"); return; }
    if (selectedIds.length === 0) { toast.error("Please select at least one account"); return; }
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
    if (postType !== "TEXT" && newFiles.length > 0) {
      const { errors: finalErrors } = await validateMediaFiles(newFiles, selectedPlatforms, postType as "IMAGE" | "VIDEO");
      if (finalErrors.length > 0) {
        setMediaErrors(finalErrors);
        toast.error(`Fix ${finalErrors.length} media issue${finalErrors.length !== 1 ? "s" : ""} before saving`);
        return;
      }
    }
    const acknowledgeApprovalLock = collection.approvalLocked;
    if (!confirmApprovalLockIfNeeded(acknowledgeApprovalLock)) {
      return;
    }
    setSaving(true);
    try {
      const uploadedMedia = selectedLibraryAssets.map((asset) => ({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileUrl: asset.fileUrl ?? "",
        fileKey: asset.fileKey,
        size: asset.size ?? 0,
      }));
      for (const file of newFiles) {
        if (postType === "VIDEO" && !file.type.startsWith("video/")) continue;
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        uploadedMedia.push({ fileName: file.name, mimeType: file.type, fileUrl, fileKey, size: file.size });
      }
      const payload: Parameters<typeof updatePostCollectionApi>[2] = {
        description,
        platformConfigs,
        keepMediaKeys,
        newMedia: uploadedMedia,
        connectedAccounts: selectedAccounts,
        acknowledgeApprovalLock: acknowledgeApprovalLock || undefined,
        approvalModeOverride:
          approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE
            ? undefined
            : approvalModeOverrideInput,
        clearApprovalModeOverride:
          approvalModeOverrideInput === DEFAULT_APPROVAL_OVERRIDE &&
          collection.approvalModeOverride !== null,
      };
      if (date && time) payload.scheduledTime = localToUTC(date, time);
      const updated = await updatePostCollectionApi(getToken, id, payload);
      toast.success(approvalUpdateSuccessMessage(updated, "Draft updated."));
      router.push(`/drafts/${id}`);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Render states ── */
  if (loading) return <DraftEditPageSkeleton />;
  if (error || !collection) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--ds-background-200)] p-6">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)]">
            <AlertCircle className="h-7 w-7 text-[var(--ds-red-700)]" />
          </div>
          <h3 className="mb-1 text-title-18 text-[var(--ds-gray-1000)]">Draft not found</h3>
          <p className="mb-6 text-label-14 leading-6 text-[var(--ds-gray-900)]">
            {error ?? "This draft couldn't be loaded. It may have been deleted."}
          </p>
          <DraftDetailActionButton tone="primary" onClick={() => router.push(`/drafts/${id}`)}>
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Draft</span>
            </span>
          </DraftDetailActionButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]">
      <ProtectedPageHeader
        title="Edit Draft"
        description={collection.description || "Untitled Draft"}
        icon={<Pencil className="h-4 w-4" />}
        leading={
          <DraftDetailActionButton compact onClick={() => router.push(`/drafts/${id}`)}>
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </span>
          </DraftDetailActionButton>
        }
        actions={
          <div className="hidden sm:block">
            <DraftDetailBadge variant="accent">
              {selectedIds.length} {selectedIds.length === 1 ? "account" : "accounts"}
            </DraftDetailBadge>
          </div>
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
                  "inline-flex items-center rounded-full border px-2 py-1 text-label-12",
                  PLATFORM_BADGE_STYLES[p] ?? "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                )}
              >
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-5 pb-8 sm:px-5">
        <div className="mb-4 rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", typeCfg.className)}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-title-18 text-[var(--ds-gray-1000)]">{typeCfg.label} draft</p>
                <p className="mt-1 max-w-2xl text-label-14 leading-6 text-[var(--ds-gray-900)]">{typeCfg.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DraftDetailBadge variant="subtle">Draft</DraftDetailBadge>
              <DraftDetailBadge variant={postType === "TEXT" ? "neutral" : "accent"}>{typeCfg.label}</DraftDetailBadge>
            </div>
          </div>
        </div>

        <div className="space-y-4">

        {/* ── Step 1: Content Type (locked, starts collapsed) ── */}
        <StepCard
          step={1}
          title="Content Type"
          description="Post type is locked and cannot be changed after creation."
          complete={true}
          isOpen={activeStep === 1}
          onToggle={() => toggleStep(1)}
          summary={step1Summary}
        >
          <div className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border",
                typeCfg.className
              )}
            >
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">{typeCfg.label} Post</p>
              <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">Format is fixed for this draft</p>
            </div>
            <DraftDetailBadge variant="neutral" className="gap-1.5">
              <Lock className="h-3 w-3" />
              Locked
            </DraftDetailBadge>
          </div>
        </StepCard>

        {/* ── Step 2: Select Accounts ── */}
        <StepCard
          step={2}
          title="Select Accounts"
          description="Choose which social profiles this draft will be published to."
          complete={selectedIds.length > 0}
          locked={reachedStep < 2}
          isOpen={activeStep === 2}
          onToggle={reachedStep >= 2 ? () => toggleStep(2) : undefined}
          summary={step2Summary}
        >
          <AccountSelector
            postType={collection.postCollectionType}
            accounts={allAccounts}
            selectedAccountIds={selectedIds}
            onChange={setSelectedIds}
            loading={false}
          />
          {selectedIds.length > 0 && (
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
              ? "Write a caption, manage images, and configure platform settings."
              : "Write a description, manage your video, and configure platform settings."
          }
          complete={step3Complete}
          locked={reachedStep < 3}
          isOpen={activeStep === 3}
          onToggle={reachedStep >= 3 ? () => toggleStep(3) : undefined}
          summary={step3Summary}
        >
          {isAgency ? (
            <div className="mb-6">
              <LibraryComposerPanel
                postType={postType as "IMAGE" | "VIDEO" | "TEXT"}
                onApplyItem={handleApplyLibraryItem}
                onApplyBundle={handleApplyLibraryBundle}
              />
            </div>
          ) : null}

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
                "min-h-[8.75rem] w-full resize-none rounded-xl border p-4 text-label-14 leading-relaxed",
                "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]",
                "resize-none min-h-[8.75rem] transition-all duration-200",
                "placeholder:text-[var(--ds-gray-900)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]",
                overLimit || platformCharErrors.length > 0
                  ? "border-[var(--ds-red-500)]"
                  : "focus:border-[var(--ds-blue-600)]",
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {selectedPlatforms.length > 0 && (
              <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} />
            )}
          </div>

          {/* Media section — IMAGE / VIDEO only */}
          {postType !== "TEXT" && (
            <div className="space-y-2 mt-6">
              <div className="flex items-center justify-between">
                <label className="text-label-14 text-[var(--ds-gray-1000)]">
                  {postType === "IMAGE" ? "Images" : "Video"}
                </label>
                {selectedPlatforms.length > 0 && (
                  <span className="text-copy-12 text-[var(--ds-gray-900)]">
                    Max {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""}
                    {restrictivePlatformLabel ? ` (${restrictivePlatformLabel} limit)` : ""}
                  </span>
                )}
              </div>

              {/* Existing kept media thumbnails */}
              {keptMedia.length > 0 && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-copy-12 text-[var(--ds-gray-900)]">
                    <CloudUpload className="w-3.5 h-3.5" />
                    Existing media — click × to remove
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    {keptMedia.map((m) => (
                      <div
                        key={m.fileKey}
                        className="group relative h-28 w-28 overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm"
                      >
                        {m.mimeType.startsWith("video/") ? (
                          <video
                            src={m.fileUrl}
                            className="w-full h-full object-contain"
                            muted
                          />
                        ) : (
                          <Image
                            src={m.fileUrl}
                            alt={m.fileName}
                            fill
                            className="object-contain"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setKeepMediaKeys((prev) => prev.filter((k) => k !== m.fileKey))}
                            className={cn(
                              "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-md transition-colors",
                              "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-red-200)] hover:bg-[var(--ds-red-100)] hover:text-[var(--ds-red-700)]",
                              focusRingClassName,
                            )}
                          >
                            <X className="h-3 w-3" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New file uploader */}
              {slotsForNew > 0 && (
                <MediaUploader
                  files={newFiles}
                  setFiles={setNewFiles}
                  accept={postType === "IMAGE" ? "image/*" : "video/*"}
                  label={newFiles.length === 0
                    ? `Add New ${postType === "IMAGE" ? "Images" : "Video"}`
                    : postType === "IMAGE" ? "Add More Images" : "Add Another Video"}
                  maxFiles={slotsForNew}
                  maxFilesLabel={restrictivePlatformLabel}
                />
              )}
              {isAgency ? (
                <SelectedLibraryAssets
                  assets={selectedLibraryAssets}
                  onRemove={(fileKey) =>
                    setSelectedLibraryAssets((current) =>
                      current.filter((asset) => asset.fileKey !== fileKey)
                    )
                  }
                />
              ) : null}
              {slotsForNew === 0 && newFiles.length === 0 && (
                <p className="text-copy-12 text-[var(--ds-gray-900)]">
                  Maximum {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""} reached. Remove an existing file to add new ones.
                </p>
              )}

              {selectedPlatforms.length > 0 && (
                <MediaValidationPanel
                  platforms={selectedPlatforms}
                  postType={postType as "IMAGE" | "VIDEO"}
                  errors={allMediaErrors}
                  validating={validatingMedia}
                  hasFiles={hasMedia}
                />
              )}
            </div>
          )}

          {/* Platform configs */}
          {selectedAccounts.length > 0 && (
            <div className="mt-6 border-t border-[var(--ds-gray-400)] pt-6">
              <PlatformConfigsPanel
                selectedAccounts={selectedAccounts}
                configs={platformConfigs}
                onChange={setPlatformConfigs}
                showErrors={showErrors}
                postType={postType as "IMAGE" | "VIDEO" | "TEXT"}
              />
            </div>
          )}

          <ContinueBtn
            onClick={() => goToStep(4)}
            disabled={!step3Complete || hasAnyCharError}
            label="Continue to Schedule"
          />
        </StepCard>

        {/* ── Step 4: Schedule & Save ── */}
        <StepCard
          step={4}
          title="Schedule & Save"
          description="Optionally set a schedule time, then save your draft."
          complete={false}
          locked={reachedStep < 4}
          isOpen={activeStep === 4}
          onToggle={reachedStep >= 4 ? () => toggleStep(4) : undefined}
          summary={step4Summary ?? undefined}
        >
          <DraftDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

          {isAgency ? (
            <div className="mt-4 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-4">
              <p className="text-label-14 text-[var(--ds-gray-1000)]">
                Effective approval mode
              </p>
              <p className="mt-1 text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                {approvalModeLabel(effectiveApprovalMode)}. {approvalModeDescription(effectiveApprovalMode)}
              </p>

              {canManageApprovalRules ? (
                <div className="mt-4 space-y-2">
                  <label className="text-copy-12 font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-900)]">
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
                      "flex h-10 w-full rounded-md border px-3 text-sm transition-colors",
                      "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]",
                      focusRingClassName,
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
          ) : null}

          <div className="mt-6">
            <DraftDetailActionButton
              tone="primary"
              onClick={save}
              disabled={saving || selectedIds.length === 0 || hasAnyCharError || validatingMedia}
              fullWidth
              className="h-11 text-label-14"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </span>
            </DraftDetailActionButton>
          </div>
        </StepCard>

        </div>
      </div>
    </main>
  );
}
