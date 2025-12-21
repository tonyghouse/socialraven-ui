"use client";

import { Check, RefreshCw } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import AppleSkeleton from "../generic/AppleSkelton";
import InfoCard from "./info-card";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import ConnectedAccountsGrid from "./connect-accounts-grid";
import { deleteConnectedAccountApi } from "@/service/deleteConnectedAccountApi";

/**
 * ConnectedAccountsSection (improved)
 * - shows header + InfoCard
 * - compact Apple skeleton while loading
 * - refresh button
 * - optimistic remove and reconnect handlers (wire to your APIs)
 */
export default function ConnectedAccountsSection() {
  const { getToken, isLoaded } = useAuth();

  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const accounts = await fetchConnectedAccountsApi(getToken, null);
      setConnectedAccounts(accounts ?? []);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // initial + reload when auth ready
  useEffect(() => {
    if (!isLoaded) return;
    loadAccounts();
  }, [isLoaded, loadAccounts]);

  // Refresh handler (manual)
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAccounts();
      toast.success("Connected accounts loaded");
    } catch {
      // handled in loadAccounts
    } finally {
      setRefreshing(false);
    }
  };

const handleRemove = async (acc: ConnectedAccount) => {
  const ok = window.confirm(
    `Remove account ${acc.username}? This will disconnect it from Social Raven.`
  );
  if (!ok) return;

  toast.promise(
    (async () => {
      await deleteConnectedAccountApi(getToken, acc.providerUserId);

      // remove ONLY after backend confirms
      setConnectedAccounts((prev) =>
        prev.filter((a) => a.providerUserId !== acc.providerUserId)
      );
    })(),
    {
      loading: "Removing…",
      success: "Account removed",
      error: "Failed to remove",
    }
  );
};


  // Reconnect handler — open connect route or refresh token flow
  const handleReconnect = async (acc: ConnectedAccount) => {
    // If you have a reconnect URL, open it. Otherwise, attempt a simple refresh.
    // Example: window.open(`/connect/${acc.platform}`, "_blank")
    toast("Opening reconnect flow...", { icon: <RefreshCw className="w-4 h-4" /> });
    // TODO: replace with your actual reconnect route
    const connectUrl = `/api/auth/${acc.platform}`;
    window.open(connectUrl, "_blank");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 my-6 p-4  rounded-lg frosted-border depth-soft">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-sm text-foreground"> Connect multiple accounts to schedule posts across all platforms at once.
        Your accounts are securely encrypted and stored.</h2>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-foreground/10 text-sm hover:bg-white/80 transition"
            title="Refresh accounts"
            aria-label="Refresh accounts"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline text-foreground/80">Refresh</span>
          </button>
        </div>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <AppleSkeleton className="h-[10rem] w-full" />
          <AppleSkeleton className="h-[10rem] w-full" />
          <AppleSkeleton className="h-[10rem] w-full" />
          <AppleSkeleton className="h-[10rem] w-full" />
        </div>
      ) : (
        // Use the platform grid wrapper. The wrapper accepts onRemove/onReconnect props.
        <ConnectedAccountsGrid
          accounts={connectedAccounts}
          onRemove={handleRemove}
          onReconnect={handleReconnect}
        />
      )}
    </div>
  );
}
