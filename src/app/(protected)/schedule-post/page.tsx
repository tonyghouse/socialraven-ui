"use client";

import ScheduledPostsList from "@/components/scheduled-posts-list";
import { Calendar } from "lucide-react";
import PostForm from "@/components/post-form";
import { ConnectedAccount } from "@/model/ConnectedAccount";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import { postConnectedAccountsApi } from "@/service/schedulePost";
import { Platform } from "@/model/Platform";
import { SchedulePost } from "@/model/SchedulePost";
import { Upload, X } from "lucide-react";
import { Twitter, Linkedin, Facebook, Instagram, Youtube } from "lucide-react";
import { PostConnectedAccountsList } from "@/components/post-connected-accounts-list";
import { PostPlatformSelector } from "@/components/post-platform-selector";

export default function ScheduledPostsPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);

  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const { isLoaded, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    load();
  }, [isLoaded, platform]);

  async function load() {
    try {
      setLoadingAccounts(true);
      const data = await fetchConnectedAccountsApi(getToken, platform);
      setConnectedAccounts(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingAccounts(false);
    }
  }

  const toggleAccount = (providerUserId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(providerUserId) ? prev.filter((x) => x !== providerUserId) : [...prev, providerUserId]
    );
  };

  return (
    <main className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-balance">Schedule Post</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Plan and manage your social media content in advance
        </p>
      </div>

      {/* Schedule Form */}
      <Card className="p-6 w-full mx-auto space-y-6">
        <PostPlatformSelector platform={platform} setPlatform={setPlatform} />

        <PostConnectedAccountsList
          accounts={connectedAccounts}
          selectedAccountIds={selectedAccountIds}
          toggleAccount={toggleAccount}
          loading={loadingAccounts}
        />
        <PostForm connectedAccounts={connectedAccounts} selectedAccountIds={selectedAccountIds} setSelectedAccountIds={setSelectedAccountIds}  />
      </Card>
    </main>
  );
}
