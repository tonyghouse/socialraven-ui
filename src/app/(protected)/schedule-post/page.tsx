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
import { PostConnectedAccountsList } from "@/components/schedule-post/post-connected-accounts-list";
import ScheduleImageForm from "@/components/schedule-post/schedule-image-form";
import ScheduleVideoForm from "@/components/schedule-post/schedule-video-form";
import ScheduleTextForm from "@/components/schedule-post/schedule-text-form";

export default function ScheduledPostsPage() {
  const { isLoaded, getToken } = useAuth();

  const [postType, setPostType] = useState<PostType>("IMAGE");
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded) loadAccounts();
  }, [isLoaded]);

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
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Schedule Post
                </h1>

                <p className="text-sm text-muted-foreground">&nbsp;&nbsp;</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="backdrop-blur-2xl border-border/40 p-6 rounded-3xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)] space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Step 1 → Post Type */}
        <PostTypeSelector postType={postType} setPostType={setPostType} />

        {/* Step 2 → Account Selection */}
        <PostConnectedAccountsList
          postType={postType}
          accounts={connectedAccounts}
          selectedAccountIds={selectedAccountIds}
          toggleAccount={(id: string) =>
            setSelectedAccountIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
