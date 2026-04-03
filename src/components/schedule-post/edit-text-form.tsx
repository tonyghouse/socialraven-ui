"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Save } from "lucide-react";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import type { PlatformConfigs } from "@/model/PostCollection";
import { updatePostCollectionApi } from "@/service/updatePostCollectionApi";
import { localToUTC } from "@/lib/timeUtil";
import ScheduleDateTimePicker from "./date-time-picker";
import PlatformCharLimits from "./platform-char-limits";
import PlatformConfigsPanel from "./platform-configs-panel";
import { cn } from "@/lib/utils";
import { getCharErrors, PLATFORM_DISPLAY_NAMES } from "@/lib/platformLimits";

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

export default function EditTextForm({
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
    collection.overallStatus === "CHANGES_REQUESTED";

  const scheduledDate = collection.scheduledTime ? new Date(collection.scheduledTime) : null;

  const [content, setContent] = useState(collection.description ?? "");
  const [date, setDate] = useState(scheduledDate ? toLocalDateString(scheduledDate) : "");
  const [time, setTime] = useState(scheduledDate ? toLocalTimeString(scheduledDate) : "");
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>(
    (collection.platformConfigs ?? {}) as PlatformConfigs
  );
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const selectedAccounts = connectedAccounts.filter((a) =>
    selectedIds.includes(a.providerUserId)
  );
  const selectedPlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform.toLowerCase()))],
    [selectedAccounts]
  );

  const charCount = content.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;
  const platformCharErrors = getCharErrors(selectedPlatforms, charCount);
  const hasAnyCharError = overLimit || platformCharErrors.length > 0;

  async function submit() {
    setShowErrors(true);

    if (!content.trim()) {
      toast.error("Please write your post content");
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
      toast.error(`Content exceeds the ${MAX_CHARS.toLocaleString()} character limit`);
      return;
    }

    setLoading(true);
    try {
      const payload: Parameters<typeof updatePostCollectionApi>[2] = {
        description: content,
        platformConfigs,
        connectedAccounts: selectedAccounts,
      };

      if (isScheduled) {
        payload.scheduledTime = localToUTC(date, time);
      }

      const updated = await updatePostCollectionApi(getToken, collectionId, payload);
      toast.success("Post updated successfully!");
      onSuccess(updated);
    } catch {
      toast.error("Failed to save. Please try again.");
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
            "resize-none min-h-[160px] transition-all duration-200",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            overLimit || platformCharErrors.length > 0
              ? "border-red-400 focus:border-red-400"
              : "border-border focus:border-primary"
          )}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {selectedPlatforms.length > 0 && (
          <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} />
        )}
      </div>

      <div className="border-t border-border/60" />

      <PlatformConfigsPanel
        selectedAccounts={selectedAccounts}
        configs={platformConfigs}
        onChange={setPlatformConfigs}
        showErrors={showErrors}
        postType="TEXT"
      />

      {selectedAccounts.length > 0 && <div className="border-t border-border/60" />}

      {isScheduled || isDraft ? (
        <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />
      ) : (
        <div className="rounded-xl bg-muted/40 border border-border/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Scheduled time is locked — this collection has already started publishing.
          </p>
        </div>
      )}

      <Button
        onClick={submit}
        disabled={loading || selectedIds.length === 0 || hasAnyCharError}
        className="w-full h-11 font-semibold gap-2 text-sm"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
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
