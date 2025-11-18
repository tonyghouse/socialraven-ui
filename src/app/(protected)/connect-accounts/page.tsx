"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LinkNewAccountSection from "@/components/LinkNewAccountSection";
import InfoCard from "@/components/InfoCard";
import ConnectedAccountsSection from "@/components/ConnectedAccountsSection";


export default function ManageAccountsPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = params.get("linkedin");
    if (status === "success") {
      toast("LinkedIn connected!", {
        description: "LinkedIn connected!",
        action: { label: "X", onClick: () => console.log("X") },
      });
      router.replace("/connect-accounts");
    }
    if (status === "error") {
      toast("LinkedIn connection failed!");
      router.replace("/connect-accounts");
    }
  }, [params, router]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <ConnectedAccountsSection />
        <LinkNewAccountSection />
        <InfoCard />
      </div>
    </div>
  );
}
