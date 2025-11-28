"use client";

import { Instagram, Twitter, Linkedin, Youtube, Facebook } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

const PLATFORM_META: Record<
  string,
  { label: string; icon: any; accent: string }
> = {
  x: { label: "X / Twitter", icon: Twitter, accent: "text-foreground/80" },
  linkedin: { label: "LinkedIn", icon: Linkedin, accent: "text-accent" },
  youtube: { label: "YouTube", icon: Youtube, accent: "text-red-500" },
  instagram: { label: "Instagram", icon: Instagram, accent: "text-pink-500" },
  facebook: { label: "Facebook", icon: Facebook, accent: "text-blue-700" },
};

const ORDER = ["x", "linkedin", "youtube", "instagram", "facebook"];

export default function ConnectedAccountsList({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) {
  const grouped = ORDER.reduce((acc, key) => {
    acc[key] = accounts.filter((a) => a.platform === key);
    return acc;
  }, {} as Record<string, ConnectedAccount[]>);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {ORDER.map((platformKey) => {
        const { label, icon: Icon, accent } = PLATFORM_META[platformKey];
        const items = grouped[platformKey];

        return (
          <div
            key={platformKey}
            className="
              frosted-border depth-soft
              rounded-[24px]
              bg-white/70 backdrop-blur-xl
              p-5
            "
          >
            {/* HEADER */}
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`h-5 w-5 ${accent}`} />
              <p className="font-semibold text-foreground">{label}</p>
            </div>

            {/* EMPTY BLOCK */}
            {items.length === 0 ? (
              <div
                className="
                  frosted-border depth-soft
                  h-40 rounded-2xl bg-white/60 backdrop-blur-xl 
                  border border-foreground/10
                  flex items-center justify-center
                "
              >
                <p className="text-sm text-muted-foreground italic">
                  No accounts connected
                </p>
              </div>
            ) : (
              <div
                className="
                  space-y-3 
                  max-h-48 overflow-y-auto 
                  pr-2 scrollbar-thin
                "
              >
                {items.slice(0, 2).map((acc) => (
                  <div
                    key={acc.providerUserId}
                    className="
                      frosted-border depth-soft
                      flex items-center gap-3 
                      p-3 rounded-2xl
                      bg-white/70 backdrop-blur-xl 
                      border border-foreground/10
                      hover:bg-foreground/5 transition-all
                      w-full
                    "
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={acc.profilePicLink || ""} />
                      <AvatarFallback className="text-xs">?</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-medium truncate">{acc.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {acc.platform}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Show count if more */}
                {items.length > 2 && (
                  <div className="text-xs text-muted-foreground/80 pt-1">
                    + {items.length - 2} more accounts
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
