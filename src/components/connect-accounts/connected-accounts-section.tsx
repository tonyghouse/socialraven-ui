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

  // Optimistic remove — replace with actual API call
  const handleRemove = async (acc: ConnectedAccount) => {
    const ok = window.confirm(
      `Remove account ${acc.username}? This will disconnect it from Social Raven.`
    );
    if (!ok) return;

    // optimistic remove
    const prev = connectedAccounts;
    setConnectedAccounts(prev.filter((a) => a.providerUserId !== acc.providerUserId));
    toast.promise(
      (async () => {
        try {
          // TODO: call your DELETE endpoint here, e.g.
          // await deleteConnectedAccountApi(getToken, acc.providerUserId);
          await new Promise((r) => setTimeout(r, 600)); // simulate
          toast.success("Account removed");
        } catch (e) {
          setConnectedAccounts(prev); // rollback
          throw e;
        }
      })(),
      {
        loading: "Removing…",
        success: "Removed",
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Connected Accounts</h2>
            <p className="text-xs text-muted-foreground">
              Manage social accounts connected to Social Raven
            </p>
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

      {/* Optional Info Card */}
      <InfoCard />

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
