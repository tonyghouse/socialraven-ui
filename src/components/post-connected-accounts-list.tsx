import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Platform } from "@/model/Platform";
import type { LucideIcon } from "lucide-react";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  instagram: Instagram,
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
};

export function PostConnectedAccountsList({
  accounts,
  selectedAccountIds,
  toggleAccount,
  loading,
}: {
  accounts: ConnectedAccount[];
  selectedAccountIds: string[];
  toggleAccount: (id: string) => void;
  loading: boolean;
}) {


  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-foreground">
        Select Connected Accounts
      </label>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading accounts...</p>
      )}

      {!loading && accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No accounts found for this platform.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
        {accounts.map((acc) => {
          const Icon = PLATFORM_ICONS[acc.platform];
          return (
            <div
              key={acc.providerUserId}
              onClick={() => toggleAccount(acc.providerUserId)}
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer 
                ${
                  selectedAccountIds.includes(acc.providerUserId)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }
              `}
            >
              <img
                src={acc.profilePicLink || "/placeholder.svg"}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <p className="font-medium truncate max-w-[140px]">
                  {acc.username}
                </p>
                <div className="flex gap-1 text-sm text-muted-foreground">
                  {Icon && <Icon className="w-4 h-4" />} {acc.platform}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}