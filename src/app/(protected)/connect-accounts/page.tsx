"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/connect-accounts/link-new-account-section";
import ConnectedAccountsSection from "@/components/connect-accounts/connected-accounts-section";
import {
  Link2,
  PlugZap,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";

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
    <div className="min-h-screen w-full bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Connect Accounts"
        description="Manage channel access for this workspace."
        icon={<Link2 size={16} />}
        actions={
          canWrite ? (
            <Button
              size="sm"
              className="hidden rounded-lg px-3.5 sm:inline-flex"
              onClick={() =>
                document
                  .getElementById("connect-platforms")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              <PlugZap size={15} />
              Add account
            </Button>
          ) : undefined
        }
      />

      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-6">
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-5">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h2 className="max-w-2xl text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
                  Keep every publishing channel connected from one workspace.
                </h2>
                <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  Add new platforms, review active connections, and keep publishing access stable without jumping between provider dashboards.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                    <ShieldCheck size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))]">
                      Security
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground))]">
                      Access tokens stay encrypted and can be removed the moment credentials change.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                    <RefreshCw size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-4 text-[hsl(var(--foreground-muted))]">
                      Reliability
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground))]">
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

          <div>
            <ConnectedAccountsSection
              canWrite={canWrite}
              header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
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
