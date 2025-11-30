"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import MediaUploader from "./media-uploader";
import ScheduleDateTimePicker from "../date-time-picker";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import { useAuth } from "@clerk/nextjs";
import { Input } from "../ui/input";
import { localToUTC } from "@/lib/timeUtil";

interface Props {
  connectedAccounts: ConnectedAccount[];
  selectedIds: string[];
  resetSelection: () => void;
  postType: "IMAGE";
}

export default function ScheduleImageForm({ connectedAccounts, selectedIds, resetSelection }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
   const { isLoaded, getToken } = useAuth();

  async function submit() {
    if (!description || !date || !time || files.length === 0 || selectedIds.length === 0) {
      toast.error("Fill all required fields");
      return;
    }

    setLoading(true);
    try {
      let media = [];
      for (const file of files) {
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        media.push({ fileName: file.name, mimeType: file.type, fileUrl, fileKey, size: file.size });
      }

      await postConnectedAccountsApi(getToken,
        {
        title,
        description,
        postType: "IMAGE",
        media,
        connectedAccounts: connectedAccounts.filter(a => selectedIds.includes(a.providerUserId)),
        scheduledTime: localToUTC(date, time)
      });

      toast.success("Image post scheduled!");
      resetSelection();
      setFiles([]);
      setDescription("");
      setDate("");
      setTime("");

    } catch (e) { toast.error("Upload failed"); }
    finally { setLoading(false); }
  }



// usage

  return (
    <div className="space-y-6">
       {/* <Input placeholder="Title"
        className="w-full p-3 rounded-xl border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}/> */}
      <textarea
        placeholder="Description"
        className="w-full p-3 rounded-xl border min-h-48"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <MediaUploader files={files} setFiles={setFiles} />

      <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

      <Button onClick={submit} disabled={loading} className="w-full h-11">
        {loading ? "Scheduling..." : "Schedule Image Post"}
      </Button>
    </div>
  );
}
