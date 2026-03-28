"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { PlatformConfigs } from "@/model/PostCollection";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import ScheduleDateTimePicker from "./date-time-picker";
import { localToUTC } from "@/lib/timeUtil";
import PlatformConfigsPanel from "./platform-configs-panel";
import PlatformCharLimits from "./platform-char-limits";
import { cn } from "@/lib/utils";
import { Send, Loader2, BookOpen } from "lucide-react";
import {
  getCharErrors,
  PLATFORM_DISPLAY_NAMES,
} from "@/lib/platformLimits";

interface Props {
  connectedAccounts: ConnectedAccount[];
  selectedIds: string[];
  resetSelection: () => void;
  postType: "TEXT";
  initialDate?: string;
  initialTime?: string;
}

const MAX_CHARS = 2200;

export default function ScheduleTextForm({
  connectedAccounts,
  selectedIds,
  resetSelection,
  initialDate = "",
  initialTime = "",
}: Props) {
  const [content, setContent] = useState("");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { getToken } = useAuth();

  const selectedAccounts = connectedAccounts.filter((a) => selectedIds.includes(a.providerUserId));
  const selectedPlatforms = [...new Set(selectedAccounts.map((a) => a.platform.toLowerCase()))];

  const charCount = content.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;

  // Real-time per-platform char errors (drives live UI feedback)
  const platformCharErrors = getCharErrors(selectedPlatforms, charCount);
  const hasAnyCharError = overLimit || platformCharErrors.length > 0;

  async function submit() {
    setShowErrors(true);

    if (!content.trim()) { toast.error("Please write your post content"); return; }
    if (!date || !time)  { toast.error("Please select a date and time");  return; }
    if (selectedIds.length === 0) { toast.error("Please select at least one account"); return; }

    if (platformCharErrors.length > 0) {
      const err = platformCharErrors[0];
      const name = PLATFORM_DISPLAY_NAMES[err.platform] ?? err.platform;
      const over = err.current - err.limit;
      toast.error(`${name} limit exceeded — remove ${over.toLocaleString()} character${over === 1 ? "" : "s"} to continue`);
      return;
    }

    if (overLimit) {
      toast.error(`Content exceeds the ${MAX_CHARS.toLocaleString()} character limit`);
      return;
    }

    setLoading(true);
    try {
      await postConnectedAccountsApi(getToken, {
        description: content,
        postType: "TEXT",
        media: [],
        connectedAccounts: selectedAccounts,
        scheduledTime: localToUTC(date, time),
        platformConfigs,
      });
      toast.success("Text post scheduled successfully!");
      setContent("");
      resetSelection();
      setDate("");
      setTime("");
      setPlatformConfigs({});
      setShowErrors(false);
    } catch {
      toast.error("Failed to schedule post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft() {
    if (!content.trim()) { toast.error("Please write your post content before saving as draft"); return; }
    if (overLimit || platformCharErrors.length > 0) {
      toast.error("Fix character limit errors before saving");
      return;
    }

    setDraftLoading(true);
    try {
      await postConnectedAccountsApi(getToken, {
        description: content,
        postType: "TEXT",
        media: [],
        connectedAccounts: selectedAccounts,
        platformConfigs,
        isDraft: true,
      });
      toast.success("Draft saved! You can schedule it later from Drafts.");
      setContent("");
      resetSelection();
      setDate("");
      setTime("");
      setPlatformConfigs({});
      setShowErrors(false);
    } catch {
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setDraftLoading(false);
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

        {/* Per-platform character limit indicator */}
        {selectedPlatforms.length > 0 && (
          <PlatformCharLimits platforms={selectedPlatforms} charCount={charCount} />
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
        postType="TEXT"
      />

      {selectedAccounts.length > 0 && <div className="border-t border-border/60" />}

      {/* Schedule */}
      <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

      {/* Submit */}
      <div className="flex gap-2">
        <Button
          onClick={saveDraft}
          disabled={draftLoading || loading || hasAnyCharError}
          variant="outline"
          className="flex-1 h-11 font-semibold gap-2 text-sm"
          size="lg"
        >
          {draftLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BookOpen className="w-4 h-4" />
          )}
          Save Draft
        </Button>
        <Button
          onClick={submit}
          disabled={loading || draftLoading || selectedIds.length === 0 || hasAnyCharError}
          className="flex-1 h-11 font-semibold gap-2 text-sm"
          size="lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Schedule
        </Button>
      </div>

      {selectedIds.length === 0 && (
        <p className="text-xs text-center text-muted-foreground -mt-2">
          Select an account to schedule, or save as draft to finish later.
        </p>
      )}
    </div>
  );
}
