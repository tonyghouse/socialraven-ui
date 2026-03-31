"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
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
import { fetchPostCollectionByIdApi } from "@/service/fetchPostCollectionByIdApi";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { updatePostCollectionApi } from "@/service/updatePostCollectionApi";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { localToUTC } from "@/lib/timeUtil";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AccountSelector } from "@/components/schedule-post/account-selection-sheet";
import MediaUploader from "@/components/schedule-post/media-uploader";
import { SchedulePostPageSkeleton } from "@/components/schedule-post/schedule-post-page-skeleton";
import ScheduleDateTimePicker from "@/components/schedule-post/date-time-picker";
import PlatformCharLimits from "@/components/schedule-post/platform-char-limits";
import MediaValidationPanel from "@/components/schedule-post/media-validation-panel";
import PlatformConfigsPanel from "@/components/schedule-post/platform-configs-panel";

/* ── Config ── */

const TYPE_CONFIG: Record<
  string,
  { label: string; Icon: typeof ImageIcon; className: string; description: string }
> = {
  IMAGE: {
    label: "Image",
    Icon: ImageIcon,
    className:
      "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]",
    description:
      "Edit your caption, add or remove images, and configure platform-specific settings.",
  },
  VIDEO: {
    label: "Video",
    Icon: Video,
    className:
      "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]",
    description:
      "Edit your description, replace or add videos, and configure platform-specific settings.",
  },
  TEXT: {
    label: "Text",
    Icon: FileText,
    className:
      "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]",
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
        "overflow-hidden rounded-xl border bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)] transition-[border-color,box-shadow,opacity] duration-200",
        locked
          ? "border-[hsl(var(--border-subtle))] opacity-55"
          : complete && isOpen
            ? "border-[hsl(var(--accent))]/30 shadow-md"
            : complete
              ? "border-[hsl(var(--border))]"
              : "border-[hsl(var(--border-subtle))]",
      )}
    >
      <button
        type="button"
        disabled={!canToggle}
        onClick={canToggle ? onToggle : undefined}
        className={cn(
          "flex w-full items-center gap-4 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-5 py-4 text-left transition-colors duration-150",
          canToggle
            ? "cursor-pointer hover:bg-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/35 focus-visible:ring-inset"
            : "cursor-default",
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border text-xs font-medium leading-4 transition-colors duration-200",
            complete
              ? "border-[hsl(var(--accent))]/18 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
              : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))]",
          )}
        >
          {complete
            ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--accent))]" />
            : <span>{step}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          {!isOpen && complete && summary ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))]">{title}</span>
              <span className="text-[hsl(var(--foreground-subtle))]">·</span>
              {summary}
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">{title}</h2>
              <p className="mt-0.5 text-xs leading-4 text-[hsl(var(--foreground-muted))]">{description}</p>
            </>
          )}
        </div>

        {canToggle && (
          <div className="flex-shrink-0 flex items-center gap-1.5 text-[hsl(var(--foreground-muted))]">
            {!isOpen && (
              <span className="hidden items-center gap-1 rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-2 py-0.5 text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))] sm:flex">
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

/* ── Continue button ── */

function ContinueBtn({ onClick, disabled = false, label = "Continue" }: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="mt-4 flex justify-end">
      <AtlassianButton
        appearance="primary"
        onClick={onClick}
        isDisabled={disabled}
      >
        <span className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </AtlassianButton>
    </div>
  );
}

/* ── Page ── */

export default function DraftEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getToken, isLoaded } = useAuth();

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
  const [date, setDate]                       = useState("");
  const [time, setTime]                       = useState("");
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});

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

        // Initialize form state from collection
        const scheduledDate = coll.scheduledTime ? new Date(coll.scheduledTime) : null;
        setDescription(coll.description ?? "");
        setDate(scheduledDate ? toLocalDateString(scheduledDate) : "");
        setTime(scheduledDate ? toLocalTimeString(scheduledDate) : "");
        setPlatformConfigs((coll.platformConfigs ?? {}) as PlatformConfigs);
        setKeepMediaKeys(coll.media.map((m) => m.fileKey));
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
  const slotsForNew = Math.max(0, effectiveMaxFiles - keptCount);
  const hasMedia = keptCount + newFiles.length > 0;

  const syncMediaErrors = useMemo(
    () => postType !== "TEXT" ? validateMediaSync(newFiles, selectedPlatforms, postType as "IMAGE" | "VIDEO") : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newFiles.map((f) => f.name + f.size).join(","), selectedPlatforms.join(","), postType],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFiles.map((f) => f.name + f.size).join(","), selectedPlatforms.join(","), postType]);

  const allMediaErrors = mediaErrors.length > 0 ? mediaErrors : syncMediaErrors;

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
    <span className="flex items-center gap-1.5 text-sm font-medium leading-5 text-foreground">
      <TypeIcon className="w-3.5 h-3.5 text-primary" />
      {typeCfg.label}
    </span>
  );

  const step2Summary = (
    <span className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium leading-5 text-primary">{selectedIds.length}</span>
      <span className="text-xs leading-4 text-muted-foreground">{selectedIds.length === 1 ? "account" : "accounts"}</span>
      {selectedPlatformKeys.slice(0, 3).map((p) => (
        <span key={p} className={cn("text-xs font-medium leading-4 px-1.5 py-0.5 rounded-full border", PLATFORM_BADGE_STYLES[p] ?? "bg-muted text-foreground border-border")}>
          {PLATFORM_LABELS[p] ?? p}
        </span>
      ))}
      {selectedPlatformKeys.length > 3 && (
        <span className="text-xs leading-4 text-muted-foreground">+{selectedPlatformKeys.length - 3}</span>
      )}
    </span>
  );

  const step3Summary = (
    <span className="flex items-center gap-2 text-sm text-foreground">
      <span className="font-medium truncate max-w-[160px] sm:max-w-[260px]">
        {description.trim().slice(0, 60)}{description.trim().length > 60 ? "…" : ""}
      </span>
      {postType !== "TEXT" && (keptCount + newFiles.length) > 0 && (
        <span className="text-xs text-muted-foreground flex-shrink-0">
          · {keptCount + newFiles.length} {postType === "IMAGE" ? "image" : "video"}{(keptCount + newFiles.length) !== 1 ? "s" : ""}
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

  /* ── Save ── */
  async function save() {
    setShowErrors(true);
    if (!description.trim()) { toast.error("Please write a caption"); return; }
    if (postType !== "TEXT" && !hasMedia) { toast.error("Please keep or upload at least one file"); return; }
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
    setSaving(true);
    try {
      const uploadedMedia = [];
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
      };
      if (date && time) payload.scheduledTime = localToUTC(date, time);
      await updatePostCollectionApi(getToken, id, payload);
      toast.success("Draft updated.");
      router.push(`/drafts/${id}`);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Render states ── */
  if (loading) return <SchedulePostPageSkeleton />;
  if (error || !collection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-6">
        <div className="max-w-sm w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
            <AlertCircle className="h-7 w-7 text-[hsl(var(--destructive))]" />
          </div>
          <h3 className="mb-1 text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Draft not found</h3>
          <p className="mb-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
            {error ?? "This draft couldn't be loaded. It may have been deleted."}
          </p>
          <AtlassianButton appearance="primary" onClick={() => router.push(`/drafts/${id}`)}>
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Draft</span>
            </span>
          </AtlassianButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Edit Draft"
        description={collection.description || "Untitled Draft"}
        icon={<Pencil className="h-4 w-4" />}
        leading={
          <AtlassianButton appearance="subtle" onClick={() => router.push(`/drafts/${id}`)}>
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </span>
          </AtlassianButton>
        }
        actions={
          <div className="hidden sm:block">
            <Lozenge appearance="inprogress">
              {selectedIds.length} {selectedIds.length === 1 ? "account" : "accounts"}
            </Lozenge>
          </div>
        }
      />

      {selectedPlatformKeys.length > 0 && (
        <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-2.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[hsl(var(--foreground-muted))]">Posting to:</span>
            {selectedPlatformKeys.map((p) => (
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
        </div>
      )}

      <div className="px-4 py-6 sm:px-6">
        <div className="mb-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">{typeCfg.label} draft</p>
              <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">{typeCfg.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Lozenge appearance="default">Draft</Lozenge>
              <Lozenge appearance="new">{typeCfg.label}</Lozenge>
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
              <p className="text-sm font-semibold leading-5 text-foreground">{typeCfg.label} Post</p>
              <p className="text-xs leading-4 text-muted-foreground">Format is fixed for this draft</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium leading-4 text-muted-foreground bg-muted border border-border/50 px-2.5 py-1 rounded-lg">
              <Lock className="h-3 w-3" />
              Locked
            </div>
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
          {/* Caption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-5 text-foreground">
                {postType === "TEXT" ? "Content" : "Caption"}
              </label>
              <span className={cn(
                "text-xs font-mono tabular-nums transition-colors",
                overLimit ? "text-red-500 font-medium" : nearLimit ? "text-amber-500" : "text-muted-foreground",
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
                "w-full p-4 rounded-xl border text-sm bg-background text-foreground leading-relaxed",
                "resize-none min-h-[140px] transition-all duration-200",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                overLimit || platformCharErrors.length > 0
                  ? "border-red-400 focus:border-red-400"
                  : "border-border focus:border-primary",
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
                <label className="text-sm font-medium leading-5 text-foreground">
                  {postType === "IMAGE" ? "Images" : "Video"}
                </label>
                {selectedPlatforms.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Max {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""}
                    {restrictivePlatformLabel ? ` (${restrictivePlatformLabel} limit)` : ""}
                  </span>
                )}
              </div>

              {/* Existing kept media thumbnails */}
              {keptMedia.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium leading-4 text-muted-foreground flex items-center gap-1.5">
                    <CloudUpload className="w-3.5 h-3.5" />
                    Existing media — click × to remove
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    {keptMedia.map((m) => (
                      <div
                        key={m.fileKey}
                        className="relative group w-28 h-28 rounded-xl border border-border bg-card overflow-hidden shadow-sm"
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
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/95 shadow-md flex items-center justify-center border border-black/10 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 text-gray-700" strokeWidth={2.5} />
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
              {slotsForNew === 0 && newFiles.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Maximum {effectiveMaxFiles} {postType === "IMAGE" ? "image" : "video"}{effectiveMaxFiles !== 1 ? "s" : ""} reached. Remove an existing file to add new ones.
                </p>
              )}

              {selectedPlatforms.length > 0 && (
                <MediaValidationPanel
                  platforms={selectedPlatforms}
                  postType={postType as "IMAGE" | "VIDEO"}
                  errors={allMediaErrors}
                  validating={validatingMedia}
                  hasFiles={newFiles.length > 0}
                />
              )}
            </div>
          )}

          {/* Platform configs */}
          {selectedAccounts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/60">
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
          <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

          <div className="mt-6">
            <AtlassianButton
              appearance="primary"
              onClick={save}
              isDisabled={saving || selectedIds.length === 0 || hasAnyCharError || validatingMedia}
              shouldFitContainer
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
            </AtlassianButton>
          </div>
        </StepCard>

        </div>
      </div>
    </div>
  );
}

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="sticky top-0 z-10 h-[60px] border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))]/95" />
      <div className="px-4 sm:px-6 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
            <div className="flex items-start gap-4 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-6 py-4">
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
