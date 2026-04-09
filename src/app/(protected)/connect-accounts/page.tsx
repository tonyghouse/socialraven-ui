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
import { usePlan } from "@/hooks/usePlan";
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
  const { isAgency } = usePlan();
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

      <main className="px-4 py-5 sm:px-5 sm:py-6">
        <section className="space-y-5">
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

            {canWrite && isAgency && <ClientConnectionHandoffSection />}
        </section>
      </main>
    </div>
  );
}
