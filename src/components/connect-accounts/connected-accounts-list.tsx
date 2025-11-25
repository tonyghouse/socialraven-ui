"use client";

import { Instagram, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

// PLATFORM CONFIG
const PLATFORM_META: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  x: { label: "X", icon: Twitter, color: "text-black" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  youtube: { label: "YouTube", icon: Youtube, color: "text-red-600" },
  instagram: { label: "Instagram", icon: Instagram, color: "text-pink-500" },
  // facebook: { label: "Facebook", icon: Facebook, color: "text-blue-500" },
};

const ORDER = ["x", "linkedin", "youtube", "instagram"];

export default function ConnectedAccountsList({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) {
  // Group accounts by platform
  const grouped = ORDER.reduce((acc, key) => {
    acc[key] = accounts.filter((a) => a.platform === key);
    return acc;
  }, {} as Record<string, ConnectedAccount[]>);

  return (
    <div className="space-y-4">
      {ORDER.map((platformKey) => {
        const { label, icon: Icon, color } = PLATFORM_META[platformKey];
        const items = grouped[platformKey];

        return (
          <div
            key={platformKey}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
          >
            {/* STRIP HEADER */}
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <p className="font-semibold">{label}</p>
            </div>

            {/* ACCOUNTS LIST OR EMPTY STATE */}
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No account connected
              </p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {items.map((acc) => (
                  <div
                    key={acc.providerUserId}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition w-52"
                  >
                    {/* PROFILE PIC */}

                    {acc.profilePicLink ? (
                      <Avatar>
                        <AvatarImage
                          src={acc.profilePicLink}
                          alt={`${acc.username} profile`}
                        />
                        <AvatarFallback>X</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar>
                        <AvatarImage
                          src="https://github.com/evilrabbit.png"
                          alt="@evilrabbit"
                        />
                        <AvatarFallback>X</AvatarFallback>
                      </Avatar>
                    )}

                    {/* TEXT SECTION */}
                    <div className="min-w-0">
                      <p className="font-medium truncate text-ellipsis overflow-hidden">
                        {acc.username}
                      </p>
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
