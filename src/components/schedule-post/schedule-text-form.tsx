"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import ScheduleDateTimePicker from "./date-time-picker";
import { Input } from "../ui/input";
import { localToUTC } from "@/lib/timeUtil";

interface Props {
  connectedAccounts: ConnectedAccount[];
  selectedIds: string[];
  resetSelection: () => void;
  postType: "TEXT";
}

export default function ScheduleTextForm({ connectedAccounts, selectedIds, resetSelection }: Props) {
    const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoaded, getToken } = useAuth();

  async function submit() {
    if (!content || !date || !time || selectedIds.length === 0) {
      toast.error("All fields mandatory");
      return;
    }

    setLoading(true);
    try {
      await postConnectedAccountsApi(
        getToken,
        {
        title,
        description: content,
        postType: "TEXT",
        media: [],
        connectedAccounts: connectedAccounts.filter(a => selectedIds.includes(a.providerUserId)),
        scheduledTime: localToUTC(date, time)
      });

      toast.success("Text post scheduled ✓");
      setContent("");
      resetSelection();
      setDate("");
      setTime("");

    } catch { toast.error("Failed to schedule"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <textarea
        placeholder="Description"
        className="w-full p-3 rounded-xl border min-h-48"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} />

      <Button onClick={submit} disabled={loading} className="w-full h-11">
        {loading ? "Scheduling..." : "Schedule Text Post"}
      </Button>
    </div>
  );
}
