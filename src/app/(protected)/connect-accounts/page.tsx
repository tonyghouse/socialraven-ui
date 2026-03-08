"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/connect-accounts/link-new-account-section";
import ConnectedAccountsSection from "@/components/connect-accounts/connected-accounts-section";
import { Link2 } from "lucide-react";

export default function ManageAccountsPage() {
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
  }, [params]);

  return (
    <div className="w-full min-h-screen">
      {/* Sticky page header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                Connect Accounts
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your social media account connections
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Add a platform */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-1">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            Add a Platform
          </span>
          <div className="flex-1 h-px bg-foreground/8" />
        </div>
      </div>
      <LinkNewAccountSection />

      {/* Section: Connected accounts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            Connected Accounts
          </span>
          <div className="flex-1 h-px bg-foreground/8" />
        </div>
      </div>
      <ConnectedAccountsSection />
    </div>
  );
}
