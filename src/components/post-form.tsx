"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { postConnectedAccountsApi } from "@/service/schedulePost"
import type { ConnectedAccount } from "@/model/ConnectedAccount"
import type { SchedulePost } from "@/model/SchedulePost"
import PostDetailsForm from "./post-details-form"
import MediaUploader from "./media-uploader"
import ScheduleDateTimePicker from "./date-time-picker"
import { useAuth } from "@clerk/nextjs"
import { PostMedia } from "@/model/PostMedia"
import { getPresignedUrl } from "@/service/presignUrl"
import { uploadToS3 } from "@/service/uploadToS3"

interface PostFormProps {
  connectedAccounts: ConnectedAccount[]
  selectedAccountIds: string[]
  setSelectedAccountIds: React.Dispatch<React.SetStateAction<string[]>>
}

export default function PostForm({ connectedAccounts, selectedAccountIds, setSelectedAccountIds }: PostFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { getToken, isLoaded } = useAuth();

  const handleSubmit = async (e: any) => {
  e.preventDefault();

  if (!description || !date || !time || selectedAccountIds.length === 0) {
    toast.error("Please fill all required fields");
    return;
  }

  const scheduledTime = new Date(`${date}T${time}`).toISOString();
  const selectedAccounts = connectedAccounts.filter(a => selectedAccountIds.includes(a.providerUserId));

  setSubmitting(true);

  try {
    const media = [];

    for (const file of files) {
      // 1. get presigned URL
      const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);

      // 2. upload directly to S3
      await uploadToS3(uploadUrl, file);

      // 3. push metadata (not binary)
      media.push({
        fileName: file.name,
        mimeType: file.type,
        fileUrl,
        fileKey,
        size: file.size,
      });
    }

    const payload: SchedulePost = {
      title,
      description,
      media,
      connectedAccounts: selectedAccounts,
      scheduledTime,
    };

    await postConnectedAccountsApi(getToken, payload);
    toast.success("Post scheduled!");

    // reset
    setTitle("");
    setDescription("");
    setFiles([]);
    setDate("");
    setTime("");
    setSelectedAccountIds([]);

  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setSubmitting(false);
  }
};


  return (
    <form className="w-full max-w-3xl" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-8 shadow-sm">
          <PostDetailsForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
          />

          <div className="border-t border-border/40 pt-8">
            <MediaUploader files={files} setFiles={setFiles} />
          </div>

          <div className="border-t border-border/40 pt-8">
            <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />
          </div>
        </div>

        <Button
          disabled={submitting}
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-primary-foreground font-semibold h-12 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              Scheduling...
            </span>
          ) : (
            "Schedule Post"
          )}
        </Button>
    </form>
  )
}
