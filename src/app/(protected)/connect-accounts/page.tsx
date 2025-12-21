"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/connect-accounts/link-new-account-section";
import InfoCard from "@/components/connect-accounts/info-card";
import ConnectedAccountsSection from "@/components/connect-accounts/connected-accounts-section";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "lucide-react";



export default function ManageAccountsPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {

    const provider = params.get("provider");
    const status = params.get("status");
    const reason = params.get("reason");

    if (!provider || !status) {
      return;
    }

    const providerName =
      provider.charAt(0).toUpperCase() + provider.slice(1);

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

        <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Link className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                  Connect Accounts
                </h1>

                <p className="text-sm text-muted-foreground">&nbsp;&nbsp;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
     
        <LinkNewAccountSection />
        <Separator className="my-8"/>
        <ConnectedAccountsSection />
    </div>
  );
}
