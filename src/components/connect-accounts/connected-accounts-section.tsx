"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import ConnectedAccountsGrid from "./connect-accounts-grid";
import { deleteConnectedAccountApi } from "@/service/deleteConnectedAccountApi";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ConnectButton,
  connectSectionHeaderClassName,
  connectSurfaceClassName,
} from "@/components/connect-accounts/connect-accounts-primitives";

interface PendingConfirm {
  description: string;
  onConfirm: () => void;
}

export default function ConnectedAccountsSection({
  canWrite = true,
  header,
}: {
  canWrite?: boolean;
  header?: ReactNode;
}) {
  const { getToken, isLoaded } = useAuth();

  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

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
    setPendingConfirm({
      description: `Remove account ${acc.username}? This will disconnect it from Social Raven.`,
      onConfirm: () => {
        setPendingConfirm(null);
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
      },
    });
  };

  const handleReconnect = async (acc: ConnectedAccount) => {
    toast("Opening reconnect flow...", {
      icon: <RefreshCw size={16} />,
    });
    const workspaceId = localStorage.getItem("activeWorkspaceId");
    const url = workspaceId
      ? `/api/auth/${acc.platform}?workspaceId=${workspaceId}`
      : `/api/auth/${acc.platform}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <ConfirmDialog
        open={!!pendingConfirm}
        description={pendingConfirm?.description ?? ""}
        confirmLabel="Remove"
        destructive
        onConfirm={() => pendingConfirm?.onConfirm()}
        onCancel={() => setPendingConfirm(null)}
      />
      <section className={connectSurfaceClassName}>
        <div className={connectSectionHeaderClassName}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {header ? <div className="min-w-0 flex-1">{header}</div> : <div />}
            <ConnectButton
              type="button"
              compact
              onClick={handleRefresh}
              className="shrink-0"
              title="Refresh accounts"
              aria-label="Refresh accounts"
              disabled={refreshing}
            >
              <RefreshCw
                size={12}
                className={refreshing ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </ConnectButton>
          </div>

        </div>

        {loading ? (
          <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[208px] w-full rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-300)]"
              />
            ))}
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            <ConnectedAccountsGrid
              accounts={connectedAccounts}
              onRemove={canWrite ? handleRemove : undefined}
              onReconnect={canWrite ? handleReconnect : undefined}
              canWrite={canWrite}
            />
          </div>
        )}
      </section>
    </>
  );
}
