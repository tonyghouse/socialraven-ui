"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/connect-accounts/link-new-account-section";
import InfoCard from "@/components/connect-accounts/info-card";
import ConnectedAccountsSection from "@/components/connect-accounts/connected-accounts-section";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";



export default function ManageAccountsPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {

    const provider = params.get("provider");
    const status = params.get("status");

    if (!provider || !status) {
      return;
    }

    const providerName =
      provider.charAt(0).toUpperCase() + provider.slice(1);

    if (status === "success") {
      console.log(`🎉 Showing toast for: ${providerName}`);
      toast(`${providerName} connected!`, {
        description: `${providerName} account successfully connected.`,
      });
    }

    if (status === "error") {
      console.log(`⚠️ Error toast for: ${providerName}`);
      toast(`${providerName} connection failed!`);
    }
    router.replace("/connect-accounts");

  }, [params]);




  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
     
        <LinkNewAccountSection />
        <Separator className="my-8"/>
        <ConnectedAccountsSection />
    </div>
  );
}
