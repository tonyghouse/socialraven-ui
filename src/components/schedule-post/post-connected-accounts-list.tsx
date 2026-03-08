"use client";

import { ConnectedAccount } from "@/model/ConnectedAccount";
import { Check, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { PostType } from "@/model/PostType";
import { PLATFORM_ICONS } from "../generic/platform-icons";
import { getImageUrl } from "@/service/getImageUrl";
import { getInitials } from "@/service/getInitials";
import { Skeleton } from "@/components/ui/skeleton";

function AccountItem({
  acc,
  isSelected,
  toggle,
  postType,
}: {
  acc: ConnectedAccount;
  isSelected: boolean;
  toggle: (id: string) => void;
  postType: PostType;
}) {
  const Icon = PLATFORM_ICONS[acc.platform] ?? PLATFORM_ICONS[acc.platform?.toUpperCase()];
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(acc.profilePicLink);
  const initials = getInitials(acc.username);
  const isAllowed = acc.allowedFormats?.includes(postType);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => { if (isAllowed) toggle(acc.providerUserId); }}
          disabled={!isAllowed}
          aria-pressed={isSelected}
          aria-disabled={!isAllowed}
          className={cn(
            "relative flex flex-col items-center flex-shrink-0 w-16 gap-1.5 group focus-visible:outline-none",
            !isAllowed && "cursor-not-allowed"
          )}
        >
          <div className="relative">
            <Avatar
              className={cn(
                "w-12 h-12 transition-all duration-200",
                isSelected
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : isAllowed
                    ? "ring-2 ring-transparent group-hover:ring-primary/30"
                    : "ring-2 ring-transparent",
                !isAllowed && "opacity-40 grayscale"
              )}
            >
              {imageUrl && !imageError && (
                <AvatarImage
                  src={imageUrl}
                  alt={acc.username}
                  onError={() => setImageError(true)}
                />
              )}
              <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Platform badge */}
            {Icon && (
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center shadow-sm",
                !isAllowed && "opacity-40 grayscale"
              )}>
                <Icon className="w-3 h-3 text-foreground" />
              </div>
            )}

            {/* Selected check */}
            {isSelected && isAllowed && (
              <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-background z-10">
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
              </div>
            )}
          </div>

          <span
            className={cn(
              "text-xs text-muted-foreground text-center leading-tight",
              !isAllowed && "opacity-40"
            )}
            style={{ maxWidth: "64px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {acc.username}
          </span>
        </button>
      </TooltipTrigger>

      <TooltipContent className="px-3 py-2 text-sm shadow-lg max-w-[200px]">
        <p className="font-semibold">{acc.username}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 capitalize">
          {Icon && <Icon className="w-3 h-3" />}
          {acc.platform}
        </div>
        {!isAllowed && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">
            Not available for {postType.toLowerCase()} posts
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function PostConnectedAccountsList({
  postType,
  accounts,
  selectedAccountIds,
  toggleAccount,
  loading,
}: {
  postType: PostType;
  accounts: ConnectedAccount[];
  selectedAccountIds: string[];
  toggleAccount: (id: string) => void;
  loading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    function check() {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowScrollHint(scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth - 10);
    }
    check();
    const el = scrollRef.current;
    el?.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => { el?.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, [accounts]);

  const selectedCount  = selectedAccountIds.length;
  const availableCount = accounts.filter((a) => a.allowedFormats?.includes(postType)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">Select Accounts</label>
        {selectedCount > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {selectedCount} of {availableCount} selected
          </span>
        )}
      </div>

      {loading && (
        <div className="flex gap-4 py-2 px-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="w-10 h-3 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <div className="flex items-center justify-center py-8 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No connected accounts found.</p>
        </div>
      )}

      {!loading && accounts.length > 0 && (
        <div className="relative border border-border rounded-xl bg-card/50">
          <div
            ref={scrollRef}
            className="flex items-start gap-3 overflow-x-auto scrollbar-hide px-4 py-4 pr-10"
          >
            <TooltipProvider delayDuration={300}>
              {accounts.map((acc) => (
                <AccountItem
                  key={acc.providerUserId}
                  acc={acc}
                  isSelected={selectedAccountIds.includes(acc.providerUserId)}
                  toggle={toggleAccount}
                  postType={postType}
                />
              ))}
            </TooltipProvider>
          </div>

          {showScrollHint && (
            <>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-card to-transparent rounded-r-xl" />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card border border-border shadow-md flex items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
