"use client";

import { Check } from "lucide-react";
import ConnectedAccountsList from "./connected-accounts-list";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { fetchConnectedAccountsApi } from "@/service/connectedAccounts";
import InfoCard from "./info-card";

export default function ConnectedAccountsSection() {
  const { getToken, isLoaded } = useAuth();

  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) return;
    loadAccounts();
  }, [isLoaded]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await fetchConnectedAccountsApi(getToken, null);
      setConnectedAccounts(accounts);
    } catch (err: any) {
      toast.error(err.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? <Skeleton className="h-[20rem] w-full" /> : ""}
      {connectedAccounts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-foreground">
              Connected Accounts
            </h2>
          </div>
           <InfoCard />

          <ConnectedAccountsList accounts={connectedAccounts} />
        </div>
      )}
    </>
  );
}
