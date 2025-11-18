"use client";

import Link from "next/link";
import { Facebook, Instagram, Link2, Linkedin, Twitter, Youtube } from "lucide-react";
import { ConnectedAccountCount } from "@/model/ConnectedAccountCount";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { fetchConnectedAccountCountsApi } from "@/service/connectedAccountCounts";
import { Platform } from "@/model/Platform";

export default function LinkNewAccountSection() {
  const [connectedAccountCounts, setConnectedAccountCounts] = useState<
    ConnectedAccountCount[]
  >([]);
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    loadConnectedAccountCounts();
  }, [isLoaded]);

  const loadConnectedAccountCounts = async () => {
    try {
      const result: ConnectedAccountCount[] =
        await fetchConnectedAccountCountsApi(getToken);
      setConnectedAccountCounts(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to load connected account counts");
    }
  };

  const filterCount = (platform: Platform) => {
    return (
      connectedAccountCounts.find((item) => item.platform === platform)
        ?.count || 0
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Link New Account
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link href="/api/auth/linkedin">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-blue-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Linkedin className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-center">Linkedin</span>

            {filterCount("linkedin") > 0 && (
              <span className="text-xs text-primary font-medium">
                {filterCount("linkedin")} connected
              </span>
            )}
          </button>
        </Link>

        <Link href="/connect-accounts/later">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-violet-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Instagram className="h-6 w-6 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-center">Instagram</span>

            
              <span className="text-xs text-primary font-medium">
                {filterCount("instagram")} connected
              </span>
          </button>
        </Link>

          <Link href="/connect-accounts/later">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-primary hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Twitter className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-center">Twitter/X</span>

            
              <span className="text-xs text-primary font-medium">
                {filterCount("twitter")} connected
              </span>
         
          </button>
        </Link>


          <Link href="/connect-accounts/later">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-blue-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Facebook className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-center">Facebook</span>

            
              <span className="text-xs text-primary font-medium">
                {filterCount("facebook")} connected
              </span>
           
          </button>
        </Link>

                <Link href="/connect-accounts/later">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-red-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Youtube className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-center">Youtube</span>

            
              <span className="text-xs text-primary font-medium">
                {filterCount("youtube")} connected
              </span>
            
          </button>
        </Link>




      </div>
    </div>
  );
}
