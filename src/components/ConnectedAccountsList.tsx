"use client";

import { Instagram, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";

export default function ConnectedAccountsList({ accounts }: { accounts: ConnectedAccount[] }) {
  const getPlatformIcon = (platform: string) => {
    const map: Record<string, any> = {
      instagram: Instagram,
      twitter: Twitter,
      linkedin: Linkedin,
      facebook: Facebook,
      youtube: Youtube,
    };
    return map[platform] || Instagram;
  };

  const getPlatformColor = (platform: string) => {
    const map: Record<string, string> = {
      instagram: "text-pink-500",
      twitter: "text-black",
      linkedin: "text-blue-600",
      facebook: "text-blue-500",
      youtube: "text-red-600",
    };
    return map[platform] || "text-gray-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {accounts.map((account) => {
        const Icon = getPlatformIcon(account.platform);
        const color = getPlatformColor(account.platform);

        return (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-50 to-purple-50 group-hover:from-cyan-100 group-hover:to-purple-100">
                {/* <Icon className={`h-5 w-5 ${color}`} /> */}
              </div>

              <div>
                <p className="font-medium capitalize">{account.platform}</p>
                <p className="text-sm text-muted-foreground">{account.username}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
