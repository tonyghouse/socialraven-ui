"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { PlatformConfigs } from "@/model/PostCollection";
import MediaUploader from "./media-uploader";
import ScheduleDateTimePicker from "./date-time-picker";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { useAuth } from "@clerk/nextjs";
import { localToUTC } from "@/lib/timeUtil";
import PlatformConfigsPanel from "./platform-configs-panel";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";

interface Props {
  connectedAccounts: ConnectedAccount[];
  selectedIds: string[];
  resetSelection: () => void;
  postType: "IMAGE";
}

const MAX_CHARS = 2200;

export default function ScheduleImageForm({ connectedAccounts, selectedIds, resetSelection }: Props) {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({});
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const selectedAccounts = connectedAccounts.filter((a) => selectedIds.includes(a.providerUserId));
  const charCount = description.length;
  const nearLimit  = charCount > MAX_CHARS * 0.85;
  const overLimit  = charCount > MAX_CHARS;

  async function submit() {
    if (!description.trim())      { toast.error("Please write a caption for your post"); return; }
    if (files.length === 0)        { toast.error("Please upload at least one image");     return; }
    if (!date || !time)            { toast.error("Please select a date and time");         return; }
    if (selectedIds.length === 0)  { toast.error("Please select at least one account");   return; }
    if (overLimit)                 { toast.error(`Caption exceeds ${MAX_CHARS.toLocaleString()} characters`); return; }

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
              overLimit  ? "text-red-500 font-semibold"  :
              nearLimit  ? "text-amber-500"               : "text-muted-foreground"
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
            overLimit ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary"
          )}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Media upload */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Images</label>
        <MediaUploader
          files={files}
          setFiles={setFiles}
          accept="image/*"
          label={files.length === 0 ? "Upload Images" : "Add More Images"}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Platform-specific configs */}
      <PlatformConfigsPanel
        selectedAccounts={selectedAccounts}
        configs={platformConfigs}
        onChange={setPlatformConfigs}
      />

      {selectedAccounts.length > 0 && <div className="border-t border-border/60" />}

      {/* Schedule */}
      <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

      {/* Submit */}
      <Button
        onClick={submit}
        disabled={loading || selectedIds.length === 0 || overLimit}
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
