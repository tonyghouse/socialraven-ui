"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import AppleSkeleton from "../generic/AppleSkelton";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import ConnectedAccountsGrid from "./connect-accounts-grid";
import { deleteConnectedAccountApi } from "@/service/deleteConnectedAccountApi";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";

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
      <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[hsl(var(--border-subtle))] px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {header ? <div className="min-w-0 flex-1">{header}</div> : <div />}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-9 shrink-0 rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-3 text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]"
              title="Refresh accounts"
              aria-label="Refresh accounts"
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </Button>
          </div>

        </div>

        {loading ? (
          <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-2">
            <AppleSkeleton className="h-[208px] w-full rounded-lg" />
            <AppleSkeleton className="h-[208px] w-full rounded-lg" />
            <AppleSkeleton className="h-[208px] w-full rounded-lg" />
            <AppleSkeleton className="h-[208px] w-full rounded-lg" />
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
