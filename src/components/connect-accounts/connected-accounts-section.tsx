"use client";

import { RefreshCw, LayoutGrid, FolderOpen, ShieldCheck } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import AppleSkeleton from "../generic/AppleSkelton";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import ConnectedAccountsGrid from "./connect-accounts-grid";
import { deleteConnectedAccountApi } from "@/service/deleteConnectedAccountApi";
import AccountGroupsManager from "./account-groups-manager";

type Tab = "accounts" | "groups";

export default function ConnectedAccountsSection() {
  const { getToken, isLoaded } = useAuth();

  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab>("accounts");

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

  useEffect(() => {
    if (!isLoaded) return;
    loadAccounts();
  }, [isLoaded, loadAccounts]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAccounts();
      toast.success("Accounts refreshed");
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

  const handleReconnect = async (acc: ConnectedAccount) => {
    toast("Opening reconnect flow...", {
      icon: <RefreshCw className="w-4 h-4" />,
    });
    window.open(`/api/auth/${acc.platform}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-foreground/8 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-snug">
              Connect multiple accounts to schedule posts across all platforms at once.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your tokens are securely encrypted and stored at rest.
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-foreground/10 text-sm hover:bg-foreground/4 transition-all flex-shrink-0 shadow-sm disabled:opacity-50"
          title="Refresh accounts"
          aria-label="Refresh accounts"
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-foreground/50 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline text-xs font-medium text-foreground/60">
            Refresh
          </span>
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-0.5 p-1 rounded-xl bg-foreground/5 w-fit">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "accounts"
              ? "bg-white shadow-[0_1px_6px_rgba(0,0,0,0.08)] text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          By Platform
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "groups"
              ? "bg-white shadow-[0_1px_6px_rgba(0,0,0,0.08)] text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Groups
          {connectedAccounts.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-accent/12 text-accent text-[10px] font-semibold px-1">
              {connectedAccounts.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <AppleSkeleton className="h-[10rem] w-full" />
          <AppleSkeleton className="h-[10rem] w-full" />
          <AppleSkeleton className="h-[10rem] w-full" />
          <AppleSkeleton className="h-[10rem] w-full" />
        </div>
      ) : activeTab === "accounts" ? (
        <ConnectedAccountsGrid
          accounts={connectedAccounts}
          onRemove={handleRemove}
          onReconnect={handleReconnect}
        />
      ) : (
        <AccountGroupsManager accounts={connectedAccounts} />
      )}
    </div>
  );
}
