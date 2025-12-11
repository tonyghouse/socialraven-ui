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
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  instagram: Instagram,
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
};

// Helpers
const getInitials = (username: string) => {
  if (!username) return "?";
  return username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const needsProxy = ["linkedin.com", "licdn.com"];
  const requiresProxy = needsProxy.some((d) => url.includes(d));
  return requiresProxy ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url;
};

function AccountItem({
  acc,
  isSelected,
  toggle,
}: {
  acc: ConnectedAccount;
  isSelected: boolean;
  toggle: (id: string) => void;
}) {
  const Icon = PLATFORM_ICONS[acc.platform];
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(acc.profilePicLink);
  const initials = getInitials(acc.username);

  return (
    <Tooltip>
     
        {/* Make the entire clickable area a vertical stack (avatar + label) so tooltip still works */}
        <button
          onClick={() => toggle(acc.providerUserId)}
          className="relative flex flex-col items-center flex-shrink-0 w-14 group"
          aria-pressed={isSelected}
        >
          <Avatar
            className={cn(
              "w-12 h-12 transition-all",
              isSelected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "ring-2 ring-transparent hover:ring-primary/30"
            )}
          >
            {imageUrl && !imageError && (
              <AvatarImage
                src={imageUrl}
                alt={acc.username}
                onError={() => setImageError(true)}
              />
            )}
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Selected check badge */}
          {isSelected && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-background">
              <Check className="w-3 h-3" />
            </div>
          )}

          <TooltipTrigger asChild>
          {/* Username + small platform icon under avatar */}
          <div className="mt-1 flex items-center gap-1 max-w-full">
            {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
            <span
              className="text-xs text-muted-foreground truncate"
              style={{ maxWidth: "64px" }}
            >
              {acc.username}
            </span>
          </div>
          </TooltipTrigger>
        </button>

      {/* Tooltip still shows full username + platform */}
      <TooltipContent className="px-3 py-2 text-sm shadow-md">
        <p className="font-medium">{acc.username}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 capitalize">
          {Icon && <Icon className="w-3 h-3" />} {acc.platform}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isScrollable = scrollWidth > clientWidth;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        setShowScrollIndicator(isScrollable && !isAtEnd);
      }
    };

    checkScroll();
    const scrollEl = scrollRef.current;
    scrollEl?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      scrollEl?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [accounts]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Select Accounts</label>

      {loading && <p className="text-sm text-muted-foreground">Loading accounts...</p>}
      {!loading && accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">No connected accounts found.</p>
      )}

      <div className="relative border rounded-lg px-3 py-2">
        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto scrollbar-hide pr-6 py-1"
        >
          <TooltipProvider delayDuration={200}>
            {accounts.map((acc) => (
              <AccountItem
                key={acc.providerUserId}
                acc={acc}
                isSelected={selectedAccountIds.includes(acc.providerUserId)}
                toggle={toggleAccount}
              />
            ))}
          </TooltipProvider>
        </div>

        {/* Gradient fade and scroll indicator */}
        {showScrollIndicator && (
          <>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white via-white/80 to-transparent" />
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shadow-sm">
              <ChevronRight className="w-4 h-4 text-gray-600 animate-pulse" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
