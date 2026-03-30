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
      <header className="sticky top-0 z-20 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.96)] backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))] shadow-sm">
              <Link2 size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))]">
                Connect Accounts
              </h1>
              <p className="truncate text-xs text-[hsl(var(--foreground-muted))] sm:text-sm">
                Manage channel access for this workspace.
              </p>
            </div>
          </div>

          {canWrite && (
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
          )}
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-6">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] xl:items-stretch">
            <div className="flex h-full flex-col justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-5">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/[0.08] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--accent))]"
                  >
                    Account access
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--foreground-muted))]"
                  >
                    OAuth connections
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h2 className="max-w-2xl text-xl font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))]">
                    Keep every publishing channel connected from one workspace.
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-[hsl(var(--foreground-muted))]">
                    Add new platforms, review active connections, and keep publishing access stable without jumping between provider dashboards.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <div className="inline-flex h-8 items-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-3 text-xs font-medium text-[hsl(var(--foreground-muted))]">
                  Centralized workspace access
                </div>
                <div className="inline-flex h-8 items-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-3 text-xs font-medium text-[hsl(var(--foreground-muted))]">
                  Secure token storage
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="flex h-full items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                  <ShieldCheck size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[hsl(var(--foreground-muted))]">
                    Security
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground))]">
                    Access tokens stay encrypted and can be removed the moment credentials change.
                  </p>
                </div>
              </div>

              <div className="flex h-full items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))]">
                  <RefreshCw size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[hsl(var(--foreground-muted))]">
                    Reliability
                  </p>
                  <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground))]">
                    Refresh active connections and reconnect expired channels without leaving the workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {canWrite && (
            <div id="connect-platforms" className="space-y-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
                  Add platform
                </p>
              </div>
              <LinkNewAccountSection />
            </div>
          )}

          <div>
            <ConnectedAccountsSection
              canWrite={canWrite}
              header={
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
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
