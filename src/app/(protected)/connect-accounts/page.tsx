"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/connect-accounts/link-new-account-section";
import ConnectedAccountsSection from "@/components/connect-accounts/connected-accounts-section";
import { Link2, ShieldCheck, Sparkles } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";

function SectionLabel({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="hidden sm:block h-px w-10 bg-border/80 mt-4 shrink-0" />
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          {eyebrow}
        </p>
        <div className="space-y-1">
          <h2 className="text-lg font-medium tracking-tight text-foreground">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.05),_transparent_24%),linear-gradient(180deg,_rgba(248,250,252,0.9),_rgba(255,255,255,1))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0))]" />

      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-white/90 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)]">
              <Link2 className="h-4 w-4 text-foreground/80" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-base font-medium tracking-tight text-foreground sm:text-lg">
                Connect Accounts
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Manage your social media account connections
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pt-8">
        <section className="overflow-hidden rounded-[28px] border border-border/70 bg-white/88 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Account Access
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-[2rem]">
                  Keep every publishing channel in one place.
                </h2>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  Link your workspace accounts, review active connections, and keep scheduling access reliable across every supported platform.
                </p>
              </div>
            </div>
            <div
              className={cn(
                "grid gap-3 sm:grid-cols-2 lg:min-w-[340px]",
                canWrite ? "lg:max-w-[420px]" : "lg:max-w-[220px]"
              )}
            >
              <div className="rounded-2xl border border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.9))] px-4 py-3.5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Security
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/80">
                  Tokens stay encrypted and can be refreshed or removed at any time.
                </p>
              </div>
              {canWrite && (
                <div className="rounded-2xl border border-border/70 bg-[linear-gradient(180deg,rgba(239,246,255,0.75),rgba(255,255,255,0.92))] px-4 py-3.5">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Workspace Access
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/80">
                    Add new platform connections here without leaving the workspace.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {canWrite && (
          <section className="space-y-3">
            <SectionLabel
              eyebrow="Add A Platform"
              title="Start a new connection"
              description="Choose a provider to authorize another account. Available platforms stay actionable, while upcoming ones remain visible without crowding the flow."
            />
            <LinkNewAccountSection />
          </section>
        )}

        <section className="space-y-3">
          <SectionLabel
            eyebrow="Connected Accounts"
            title="Review and maintain active connections"
            description="Monitor linked profiles, refresh account state, and reconnect or remove access when credentials change."
          />
          <ConnectedAccountsSection canWrite={canWrite} />
        </section>
      </div>
    </div>
  );
}
