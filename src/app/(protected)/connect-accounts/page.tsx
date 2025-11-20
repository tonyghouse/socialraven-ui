"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/link-new-account-section";
import InfoCard from "@/components/info-card";
import ConnectedAccountsSection from "@/components/connected-accounts-section";
import { Button } from "@/components/ui/button";



export default function ManageAccountsPage() {
  const params = useSearchParams();
  const router = useRouter();

 const [toastShown, setToastShown] = useState(false);

  useEffect(() => {

    const provider = params.get("provider");
    const status = params.get("status");

    if (!provider || !status) {
      return;
    }

    // Prevent double running in React Strict Mode
    if (toastShown) {
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

    // Mark toast as shown BEFORE redirect
    setToastShown(true);
  }, [params]);

  // 👉 Separate redirect effect (will run AFTER toast appears)
  useEffect(() => {
    if (!toastShown) return;
    router.replace("/connect-accounts");
  }, [toastShown]);


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <LinkNewAccountSection />
        <ConnectedAccountsSection />
        <InfoCard />
      </div>
    </div>
  );
}
