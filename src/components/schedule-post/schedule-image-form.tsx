"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { PlatformConfigs } from "@/model/PostCollection";
import MediaUploader from "./media-uploader";
import ScheduleDateTimePicker from "./date-time-picker";
import PlatformCharLimits from "./platform-char-limits";
import MediaValidationPanel from "./media-validation-panel";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { useAuth } from "@clerk/nextjs";
import { localToUTC } from "@/lib/timeUtil";
import PlatformConfigsPanel from "./platform-configs-panel";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import { getCharErrors, PLATFORM_DISPLAY_NAMES } from "@/lib/platformLimits";
import {
  validateMediaFiles,
  validateMediaSync,
  getEffectiveMaxFiles,
  getMostRestrictivePlatform,
  MediaValidationError,
} from "@/lib/mediaValidation";

interface Props {
  connectedAccounts: ConnectedAccount[];
  selectedIds: string[];
  resetSelection: () => void;
  postType: "IMAGE";
  initialDate?: string;
  initialTime?: string;
}

const MAX_CHARS = 2200;

export default function ScheduleImageForm({
  connectedAccounts,
  selectedIds,
  resetSelection,
  initialDate = "",
  initialTime = "",
}: Props) {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [mediaErrors, setMediaErrors] = useState<MediaValidationError[]>([]);
  const [validatingMedia, setValidatingMedia] = useState(false);
  const { getToken } = useAuth();

  const selectedAccounts = connectedAccounts.filter((a) => selectedIds.includes(a.providerUserId));
  const selectedPlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform.toLowerCase()))],
    [selectedAccounts]
  );

  // Character limit tracking
  const charCount = description.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;
  const platformCharErrors = getCharErrors(selectedPlatforms, charCount);
  const hasAnyCharError = overLimit || platformCharErrors.length > 0;

  // Effective max files for the uploader (most restrictive platform)
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

  // Sync media errors update immediately (no flicker)
  const syncMediaErrors = useMemo(
    () => validateMediaSync(files, selectedPlatforms, "IMAGE"),
    [files, selectedPlatforms]
  );

  // Async validation (dimensions + aspect ratio) — runs when files or platforms change
  useEffect(() => {
    if (files.length === 0 || selectedPlatforms.length === 0) {
      setMediaErrors([]);
      setValidatingMedia(false);
      return;
    }
    setValidatingMedia(true);
    validateMediaFiles(files, selectedPlatforms, "IMAGE")
      .then(({ errors }) => setMediaErrors(errors))
      .catch(() => setMediaErrors([]))
      .finally(() => setValidatingMedia(false));
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    files.map((f) => f.name + f.size).join(","),
    selectedPlatforms.join(","),
  ]);

  // Combined errors (sync shown immediately, async fills in after a moment)
  const allMediaErrors = mediaErrors.length > 0 ? mediaErrors : syncMediaErrors;
  const hasMediaErrors = allMediaErrors.length > 0;

  async function submit() {
    setShowErrors(true);

    if (!description.trim())     { toast.error("Please write a caption for your post"); return; }
    if (files.length === 0)       { toast.error("Please upload at least one image");     return; }
    if (!date || !time)           { toast.error("Please select a date and time");         return; }
    if (selectedIds.length === 0) { toast.error("Please select at least one account");   return; }

    // Platform character limit check
    if (platformCharErrors.length > 0) {
      const err = platformCharErrors[0];
      const name = PLATFORM_DISPLAY_NAMES[err.platform] ?? err.platform;
      const over = err.current - err.limit;
      toast.error(`${name} limit exceeded — remove ${over.toLocaleString()} character${over === 1 ? "" : "s"} to continue`);
      return;
    }
    if (overLimit) {
      toast.error(`Caption exceeds ${MAX_CHARS.toLocaleString()} characters`);
      return;
    }

    // Run full media validation one final time before upload
    const { errors: finalMediaErrors } = await validateMediaFiles(files, selectedPlatforms, "IMAGE");
    if (finalMediaErrors.length > 0) {
      setMediaErrors(finalMediaErrors);
      toast.error(`Fix ${finalMediaErrors.length} media issue${finalMediaErrors.length !== 1 ? "s" : ""} before scheduling`);
      return;
    }

    setLoading(true);
    try {
      const media = [];
      for (const file of files) {
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        media.push({ fileName: file.name, mimeType: file.type, fileUrl, fileKey, size: file.size });
      }

      await postConnectedAccountsApi(getToken, {
        title: "",
        description,
        postType: "IMAGE",
        media,
        connectedAccounts: selectedAccounts,
        scheduledTime: localToUTC(date, time),
        platformConfigs,
      });

      toast.success("Image post scheduled successfully!");
      resetSelection();
      setFiles([]);
      setDescription("");
      setDate("");
      setTime("");
      setPlatformConfigs({});
      setShowErrors(false);
      setMediaErrors([]);
    } catch {
      toast.error("Upload failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Caption */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Caption</label>
          <span
            className={cn(
              "text-xs font-mono tabular-nums transition-colors",
              overLimit ? "text-red-500 font-semibold" : nearLimit ? "text-amber-500" : "text-muted-foreground"
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

      {/* Media upload */}
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
        <MediaUploader
          files={files}
          setFiles={setFiles}
          accept="image/*"
          label={files.length === 0 ? "Upload Images" : "Add More Images"}
          maxFiles={effectiveMaxFiles}
          maxFilesLabel={restrictivePlatformLabel}
        />

        {/* Media validation panel */}
        {selectedPlatforms.length > 0 && (
          <MediaValidationPanel
            platforms={selectedPlatforms}
            postType="IMAGE"
            errors={allMediaErrors}
            validating={validatingMedia}
            hasFiles={files.length > 0}
          />
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Platform-specific configs */}
      <PlatformConfigsPanel
        selectedAccounts={selectedAccounts}
        configs={platformConfigs}
        onChange={setPlatformConfigs}
        showErrors={showErrors}
        postType="IMAGE"
      />

      {selectedAccounts.length > 0 && <div className="border-t border-border/60" />}

      {/* Schedule */}
      <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

      {/* Submit */}
      <Button
        onClick={submit}
        disabled={loading || selectedIds.length === 0 || hasAnyCharError || hasMediaErrors || validatingMedia}
        className="w-full h-11 font-semibold gap-2 text-sm"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading & Scheduling...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Schedule Post
          </>
        )}
      </Button>

      {selectedIds.length === 0 && (
        <p className="text-xs text-center text-muted-foreground -mt-2">
          Select at least one account above to enable scheduling.
        </p>
      )}
    </div>
  );
}
