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
import { cn } from "@/lib/utils";

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

              return (
                <Tooltip key={acc.providerUserId}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleAccount(acc.providerUserId)}
                      className="relative flex-shrink-0 w-12 h-12 rounded-full group"
                    >
                      <div className="relative flex-shrink-0 w-12 h-12 rounded-full">
                        {/* fallback circle ALWAYS EXISTS behind image */}
                        <div
                          className={cn(
                            "absolute inset-0 rounded-full",
                            selected
                              ? "border-primary ring-2 ring-primary border-[0.1rem]"
                              : "border-[0.1rem] border-primary hover:border-primary/50"
                          )}
                        />

                        {/* image sits on top → disappears only if broken */}
                        {acc.profilePicLink && (
                          <img
                            src={acc.profilePicLink}
                            className="absolute inset-0 w-full h-full rounded-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            } // hides ONLY this img
                          />
                        )}
                      </div>

                      {/* Tick indicator */}
                      {selected && (
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center shadow">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>

                  {/* Tooltip with username + provider */}
                  <TooltipContent className="px-3 py-2 text-sm shadow-md">
                    <p className="font-medium">{acc.username}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
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
