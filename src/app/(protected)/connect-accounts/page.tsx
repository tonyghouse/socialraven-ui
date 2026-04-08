"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/connect-accounts/link-new-account-section";
import ConnectedAccountsSection from "@/components/connect-accounts/connected-accounts-section";
import ClientConnectionHandoffSection from "@/components/connect-accounts/client-connection-handoff-section";
import {
  Link2,
  PlugZap,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import {
  ConnectButton,
  connectBodyClassName,
  connectInsetCardClassName,
  connectMetaClassName,
  connectPageClassName,
  connectTitleClassName,
} from "@/components/connect-accounts/connect-accounts-primitives";

export default function ManageAccountsPage() {
  const { canWrite } = useRole();
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const provider = params.get("provider");
    const status = params.get("status");
    const reason = params.get("reason");

    if (!provider || !status) return;

    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

    if (status === "success") {
      toast(`${providerName} connected!`, {
        description: `${providerName} account successfully connected.`,
      });
    }
    if (status === "error") {
      toast(`${providerName} connection failed! Reason: ${reason}`);
    }
    router.replace("/connect-accounts");
  }, [params, router]);

  return (
    <div className={connectPageClassName}>
      <ProtectedPageHeader
        title="Connect Accounts"
        description="Manage channel access for this workspace."
        icon={<Link2 size={16} />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={
          canWrite ? (
            <ConnectButton
              tone="primary"
              className="hidden sm:inline-flex"
              onClick={() =>
                document
                  .getElementById("connect-platforms")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              <PlugZap size={15} />
              Add account
            </ConnectButton>
          ) : undefined
        }
      />

      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-6">
          <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h2 className="max-w-2xl text-heading-20 text-[var(--ds-gray-1000)]">
                  Keep every publishing channel connected from one workspace.
                </h2>
                <p className={connectBodyClassName}>
                  Add new platforms, review active connections, and keep publishing access stable without jumping between provider dashboards.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className={connectInsetCardClassName + " flex items-start gap-3 px-4 py-4"}>
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-700)]">
                    <ShieldCheck size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className={connectMetaClassName}>
                      Security
                    </p>
                    <p className={"mt-1 " + connectTitleClassName}>
                      Access tokens stay encrypted and can be removed the moment credentials change.
                    </p>
                  </div>
                </div>

                <div className={connectInsetCardClassName + " flex items-start gap-3 px-4 py-4"}>
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-blue-700)]">
                    <RefreshCw size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className={connectMetaClassName}>
                      Reliability
                    </p>
                    <p className={"mt-1 " + connectTitleClassName}>
                      Refresh active connections and reconnect expired channels without leaving the workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {canWrite && (
            <div id="connect-platforms" className="space-y-3">
              <div className="space-y-1">
              </div>
              <LinkNewAccountSection />
            </div>
          )}

          {canWrite && <ClientConnectionHandoffSection />}

          <div>
            <ConnectedAccountsSection
              canWrite={canWrite}
              header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className={connectTitleClassName}>
                    Active connections
                  </p>
                </div>
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}
