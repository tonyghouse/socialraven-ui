"use client";

import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

// PLATFORM META
const PLATFORM_META: Record<
  string,
  { label: string; icon: any; accent: string }
> = {
  x: { label: "X", icon: Twitter, accent: "text-foreground/80" },
  linkedin: { label: "LinkedIn", icon: Linkedin, accent: "text-accent" },
  youtube: { label: "YouTube", icon: Youtube, accent: "text-red-500" },
  instagram: { label: "Instagram", icon: Instagram, accent: "text-pink-500" },
};

const ORDER = ["x", "linkedin", "youtube", "instagram"];

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
              frosted-border depth-ring
              rounded-[24px]
              bg-white/65 backdrop-blur-xl
              p-5 transition-all
            "
          >
            {/* HEADER */}
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`h-5 w-5 ${accent}`} />
              <p className="font-semibold text-foreground">{label}</p>
            </div>

            {/* EMPTY STATE */}
            {items.length === 0 ? (
              <div
                className="
                  frosted-border depth-ring
                  h-40 rounded-2xl 
                  bg-white/50 backdrop-blur-xl
                  border border-foreground/10
                  flex items-center justify-center
                "
              >
                <p className="text-sm text-muted-foreground italic">
                  No accounts connected
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">

                {items.map((acc) => (
                  <div
                    key={acc.providerUserId}
                    className="
                      frosted-border depth-ring
                      flex items-center gap-3 p-3
                      rounded-2xl
                      bg-white/70 backdrop-blur-xl
                      border border-foreground/10
                      hover:bg-foreground/5 
                      transition-all
                    "
                  >
                    {/* Avatar */}
                    <Avatar>
                      <AvatarImage src={acc.profilePicLink || ""} />
                      <AvatarFallback className="text-xs">?</AvatarFallback>
                    </Avatar>

                    {/* Username */}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{acc.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {acc.platform}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
