"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { X, CloudUpload, Loader2, Save } from "lucide-react";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PlatformConfigs } from "@/model/PostCollection";
import type { MediaResponse } from "@/model/MediaResponse";
import { updatePostCollectionApi } from "@/service/updatePostCollectionApi";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { localToUTC } from "@/lib/timeUtil";
import {
  approvalUpdateSuccessMessage,
  confirmApprovalLockIfNeeded,
} from "@/lib/approval-lock";
import MediaUploader from "./media-uploader";
import ScheduleDateTimePicker from "./date-time-picker";
import PlatformCharLimits from "./platform-char-limits";
import MediaValidationPanel from "./media-validation-panel";
import PlatformConfigsPanel from "./platform-configs-panel";
import { cn } from "@/lib/utils";
import { getCharErrors, PLATFORM_DISPLAY_NAMES } from "@/lib/platformLimits";
import {
  validateMediaFiles,
  validateMediaSync,
  getEffectiveMaxFiles,
  getMostRestrictivePlatform,
  MediaValidationError,
} from "@/lib/mediaValidation";

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

interface Props {
  collection: PostCollectionResponse;
  connectedAccounts: ConnectedAccount[];
  selectedIds: string[];
  collectionId: string;
  onSuccess: (updated: PostCollectionResponse) => void;
}

const MAX_CHARS = 2200;

export default function EditImageForm({
  collection,
  connectedAccounts,
  selectedIds,
  collectionId,
  onSuccess,
}: Props) {
  const { getToken } = useAuth();
  const isScheduled = collection.overallStatus === "SCHEDULED";
  const isDraft =
    collection.overallStatus === "DRAFT" ||
    collection.overallStatus === "CHANGES_REQUESTED" ||
    collection.overallStatus === "APPROVED";

  const scheduledDate = collection.scheduledTime ? new Date(collection.scheduledTime) : null;

  const [description, setDescription] = useState(collection.description ?? "");
  const [date, setDate] = useState(scheduledDate ? toLocalDateString(scheduledDate) : "");
  const [time, setTime] = useState(scheduledDate ? toLocalTimeString(scheduledDate) : "");
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>(
    (collection.platformConfigs ?? {}) as PlatformConfigs
  );
  const [keepMediaKeys, setKeepMediaKeys] = useState<string[]>(
    collection.media.map((m) => m.fileKey)
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [mediaErrors, setMediaErrors] = useState<MediaValidationError[]>([]);
  const [validatingMedia, setValidatingMedia] = useState(false);

  const selectedAccounts = connectedAccounts.filter((a) =>
    selectedIds.includes(a.providerUserId)
  );
  const selectedPlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform.toLowerCase()))],
    [selectedAccounts]
  );

  // Character tracking
  const charCount = description.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;
  const platformCharErrors = getCharErrors(selectedPlatforms, charCount);
  const hasAnyCharError = overLimit || platformCharErrors.length > 0;

  const effectiveMaxFiles = useMemo(
    () => getEffectiveMaxFiles(selectedPlatforms, "IMAGE"),
    [selectedPlatforms]
  );
  const restrictivePlatform = useMemo(
    () => getMostRestrictivePlatform(selectedPlatforms, "IMAGE"),
    [selectedPlatforms]
  );
  const restrictivePlatformLabel = restrictivePlatform
    ? PLATFORM_DISPLAY_NAMES[restrictivePlatform] ?? restrictivePlatform
    : undefined;

  // Remaining media slots after accounting for kept existing media
  const keptCount = keepMediaKeys.length;
  const slotsForNew = Math.max(0, effectiveMaxFiles - keptCount);

  const syncMediaErrors = useMemo(
    () => validateMediaSync(newFiles, selectedPlatforms, "IMAGE"),
    [newFiles, selectedPlatforms]
  );

  useEffect(() => {
    if (newFiles.length === 0 || selectedPlatforms.length === 0) {
      setMediaErrors([]);
      setValidatingMedia(false);
      return;
    }
    setValidatingMedia(true);
    validateMediaFiles(newFiles, selectedPlatforms, "IMAGE")
      .then(({ errors }) => setMediaErrors(errors))
      .catch(() => setMediaErrors([]))
      .finally(() => setValidatingMedia(false));
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    newFiles.map((f) => f.name + f.size).join(","),
    selectedPlatforms.join(","),
  ]);

  const allMediaErrors = mediaErrors.length > 0 ? mediaErrors : syncMediaErrors;
  const hasMediaErrors = allMediaErrors.length > 0;

  const totalMediaCount = keptCount + newFiles.length;
  const hasMedia = totalMediaCount > 0;

  function removeExisting(fileKey: string) {
    setKeepMediaKeys((prev) => prev.filter((k) => k !== fileKey));
  }

  async function submit() {
    setShowErrors(true);

    if (!description.trim()) {
      toast.error("Please write a caption for your post");
      return;
    }
    if (!hasMedia) {
      toast.error("Please keep or upload at least one image");
      return;
    }
    if (isScheduled && (!date || !time)) {
      toast.error("Please select a date and time");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Please select at least one account");
      return;
    }
    if (platformCharErrors.length > 0) {
      const err = platformCharErrors[0];
      const name = PLATFORM_DISPLAY_NAMES[err.platform] ?? err.platform;
      const over = err.current - err.limit;
      toast.error(
        `${name} limit exceeded — remove ${over.toLocaleString()} character${over === 1 ? "" : "s"} to continue`
      );
      return;
    }
    if (overLimit) {
      toast.error(`Caption exceeds ${MAX_CHARS.toLocaleString()} characters`);
      return;
    }
    if (newFiles.length > 0) {
      const { errors: finalMediaErrors } = await validateMediaFiles(
        newFiles,
        selectedPlatforms,
        "IMAGE"
      );
      if (finalMediaErrors.length > 0) {
        setMediaErrors(finalMediaErrors);
        toast.error(
          `Fix ${finalMediaErrors.length} media issue${finalMediaErrors.length !== 1 ? "s" : ""} before saving`
        );
        return;
      }
    }
    const acknowledgeApprovalLock = collection.approvalLocked;
    if (!confirmApprovalLockIfNeeded(acknowledgeApprovalLock)) {
      return;
    }

    setLoading(true);
    try {
      // Upload new files to S3
      const uploadedMedia = [];
      for (const file of newFiles) {
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(
          file,
          getToken
        );
        await uploadToS3(uploadUrl, file);
        uploadedMedia.push({
          fileName: file.name,
          mimeType: file.type,
          fileUrl,
          fileKey,
          size: file.size,
        });
      }

      const payload: Parameters<typeof updatePostCollectionApi>[2] = {
        description,
        platformConfigs,
        keepMediaKeys,
        newMedia: uploadedMedia,
        connectedAccounts: selectedAccounts,
        acknowledgeApprovalLock: acknowledgeApprovalLock || undefined,
      };

      if (isScheduled) {
        payload.scheduledTime = localToUTC(date, time);
      }

      const updated = await updatePostCollectionApi(getToken, collectionId, payload);
      toast.success(approvalUpdateSuccessMessage(updated, "Post updated successfully!"));
      onSuccess(updated);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Existing media that's still kept
  const keptMedia: MediaResponse[] = collection.media.filter((m) =>
    keepMediaKeys.includes(m.fileKey)
  );

  return (
    <div className="space-y-6">
      {/* Caption */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Caption</label>
          <span
            className={cn(
              "text-xs font-mono tabular-nums transition-colors",
              overLimit
                ? "text-red-500 font-semibold"
                : nearLimit
                ? "text-amber-500"
                : "text-muted-foreground"
            )}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
        <textarea
          placeholder="Write your post caption here. You can use emoji, hashtags, and mentions."
          className={cn(
            "w-full p-4 rounded-xl border text-sm bg-background text-foreground leading-relaxed",
            "resize-none min-h-[140px] transition-all duration-200",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            overLimit || platformCharErrors.length > 0
              ? "border-red-400 focus:border-red-400"
              : "border-border focus:border-primary"
          )}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {selectedPlatforms.length > 0 && (
          <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} />
        )}
      </div>

      {/* Media */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Images</label>
          {selectedPlatforms.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Max {effectiveMaxFiles} image{effectiveMaxFiles !== 1 ? "s" : ""}
              {restrictivePlatformLabel ? ` (${restrictivePlatformLabel} limit)` : ""}
            </span>
          )}
        </div>

        {/* Existing media thumbnails */}
        {keptMedia.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
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
                      onClick={() => removeExisting(m.fileKey)}
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
            accept="image/*"
            label={newFiles.length === 0 ? "Add New Images" : "Add More Images"}
            maxFiles={slotsForNew}
            maxFilesLabel={restrictivePlatformLabel}
          />
        )}
        {slotsForNew === 0 && newFiles.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Maximum {effectiveMaxFiles} image{effectiveMaxFiles !== 1 ? "s" : ""} reached. Remove an existing image to add new ones.
          </p>
        )}

        {selectedPlatforms.length > 0 && (
          <MediaValidationPanel
            platforms={selectedPlatforms}
            postType="IMAGE"
            errors={allMediaErrors}
            validating={validatingMedia}
            hasFiles={newFiles.length > 0}
          />
        )}
      </div>

      <div className="border-t border-border/60" />

      {/* Platform configs */}
      <PlatformConfigsPanel
        selectedAccounts={selectedAccounts}
        configs={platformConfigs}
        onChange={setPlatformConfigs}
        showErrors={showErrors}
        postType="IMAGE"
      />

      {selectedAccounts.length > 0 && <div className="border-t border-border/60" />}

      {/* Schedule time */}
      {isScheduled || isDraft ? (
        <ScheduleDateTimePicker
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
        />
      ) : (
        <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Scheduled time is locked — this collection has already started publishing.
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={submit}
        disabled={
          loading ||
          selectedIds.length === 0 ||
          hasAnyCharError ||
          hasMediaErrors ||
          validatingMedia
        }
        className="w-full h-11 font-semibold gap-2 text-sm"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving Changes...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}
