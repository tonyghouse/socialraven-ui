"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { useAuth } from "@clerk/nextjs";
import { uploadToS3 } from "@/service/uploadToS3";
import { getPresignedUrl } from "@/service/presignUrl";
import MediaUploader from "./media-uploader";
import ScheduleDateTimePicker from "../date-time-picker";
import { Input } from "../ui/input";
import { localToUTC } from "@/lib/timeUtil";

interface Props {
  connectedAccounts: ConnectedAccount[];
  selectedIds: string[];
  resetSelection: () => void;
  postType: "VIDEO";
}

export default function ScheduleVideoForm({ connectedAccounts, selectedIds, resetSelection }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoaded, getToken } = useAuth();

  async function submit() {
    if (!description || !date || !time || selectedIds.length === 0 || files.length === 0) {
      toast.error("All fields required");
      return;
    }

    setLoading(true);
    try {
      let media = [];
      for (const file of files) {
        if (!file.type.startsWith("video")) continue;
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        media.push({ fileName: file.name, mimeType: file.type, fileUrl, fileKey, size: file.size });
      }

      await postConnectedAccountsApi(
        getToken,
        {
        title,
        description,
        postType: "VIDEO",
        media,
        connectedAccounts: connectedAccounts.filter(a => selectedIds.includes(a.providerUserId)),
        scheduledTime: localToUTC(date, time)
      });

      toast.success("Video scheduled!");
      setFiles([]);
      setDescription("");
      resetSelection();
      setDate("");
      setTime("");

    } catch { toast.error("Video upload failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <Input placeholder="Title"
        className="w-full p-3 rounded-xl border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}/>
      <textarea
        placeholder="Description"
        className="w-full p-3 rounded-xl border"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <MediaUploader files={files} setFiles={setFiles} />

      <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime}/>

      <Button onClick={submit} disabled={loading} className="w-full h-11">
        {loading ? "Scheduling..." : "Schedule Video Post"}
      </Button>
    </div>
  );
}
