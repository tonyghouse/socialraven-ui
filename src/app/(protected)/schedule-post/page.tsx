"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PostType } from "@/model/PostType";
import PostTypeSelector from "@/components/schedule-post/post-type-selector";
import { PostConnectedAccountsList } from "@/components/post-connected-accounts-list";
import ScheduleImageForm from "@/components/schedule-post/schedule-image-form";
import ScheduleVideoForm from "@/components/schedule-post/schedule-video-form";
import ScheduleTextForm from "@/components/schedule-post/schedule-text-form";

export default function ScheduledPostsPage() {
  const { isLoaded, getToken } = useAuth();

  const [postType, setPostType] = useState<PostType>("IMAGE");
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isLoaded) loadAccounts(); }, [isLoaded]);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await fetchAllConnectedAccountsApi(getToken);
      setConnectedAccounts(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetSelection() {
    setSelectedAccountIds([]);
  }

  return (
    <main className="px-4 py-6 space-y-6">
      
      {/* ---> Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <div className="rounded-2xl p-3 bg-primary/10 backdrop-blur-sm">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Schedule Post</h1>
        </div>
      </div>

      <Card className="backdrop-blur-2xl border-border/40 p-6 rounded-3xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)] space-y-6">

        {/* Step 1 → Post Type */}
        <PostTypeSelector postType={postType} setPostType={setPostType} />

        {/* Step 2 → Account Selection */}
        <PostConnectedAccountsList
          accounts={connectedAccounts}
          selectedAccountIds={selectedAccountIds}
          toggleAccount={(id: string) =>
            setSelectedAccountIds(prev =>
              prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            )
          }
          loading={loading}
        />

        {/* Step 3 → Render Correct Form */}
        {postType === "IMAGE" && (
          <ScheduleImageForm
            connectedAccounts={connectedAccounts}
            selectedIds={selectedAccountIds}
            resetSelection={resetSelection}
            postType="IMAGE"
          />
        )}

        {postType === "VIDEO" && (
          <ScheduleVideoForm
            connectedAccounts={connectedAccounts}
            selectedIds={selectedAccountIds}
            resetSelection={resetSelection}
            postType="VIDEO"
          />
        )}

        {postType === "TEXT" && (
          <ScheduleTextForm
            connectedAccounts={connectedAccounts}
            selectedIds={selectedAccountIds}
            resetSelection={resetSelection}
            postType="TEXT"
          />
        )}

      </Card>
    </main>
  );
}
