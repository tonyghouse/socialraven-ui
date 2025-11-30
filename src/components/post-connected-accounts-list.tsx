"use client";

import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Platform } from "@/model/Platform";
import type { LucideIcon } from "lucide-react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  instagram: Instagram,
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
};

// Helper function to get initials from username
const getInitials = (username: string) => {
  if (!username) return "?";
  return username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get proxied or direct image URL
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;

  // List of domains that need proxying due to CORS
  const needsProxy = ["linkedin.com", "licdn.com"];

  // Check if URL needs proxying
  const requiresProxy = needsProxy.some((domain) => url.includes(domain));

  if (requiresProxy) {
    // Use the proxy API route
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  // Return direct URL for other platforms
  return url;
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
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Select Accounts
      </label>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading accounts...</p>
      )}
      {!loading && accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No connected accounts found.
        </p>
      )}

      {/* HORIZONTAL SCROLL WRAPPER */}
      <div className="relative border rounded-lg px-3 py-2">
        {/* Scrollable row */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pr-6 py-1">
          <TooltipProvider delayDuration={200}>
            {accounts.map((acc) => {
              const Icon = PLATFORM_ICONS[acc.platform];
              const selected = selectedAccountIds.includes(acc.providerUserId);
              const [imageError, setImageError] = useState(false);
              const imageUrl = getImageUrl(acc.profilePicLink);
              const initials = getInitials(acc.username);

              return (
                <Tooltip key={acc.providerUserId}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleAccount(acc.providerUserId)}
                      className="relative flex-shrink-0 w-12 h-12 rounded-full group"
                    >
                      <Avatar
                        className={cn(
                          "w-12 h-12 transition-all",
                          selected
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "ring-2 ring-transparent hover:ring-primary/30"
                        )}
                      >
                        {imageUrl && !imageError ? (
                          <AvatarImage
                            src={imageUrl}
                            alt={acc.username}
                            onError={() => setImageError(true)}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Tick indicator */}
                      {selected && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-background">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>

                  {/* Tooltip with username + provider */}
                  <TooltipContent className="px-3 py-2 text-sm shadow-md">
                    <p className="font-medium">{acc.username}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 capitalize">
                      {Icon && <Icon className="w-3 h-3" />} {acc.platform}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>

        {/* RIGHT FADE GRADIENT to show scrollability */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-10 
                        bg-gradient-to-l from-background to-transparent"
        />
      </div>
    </div>
  );
}