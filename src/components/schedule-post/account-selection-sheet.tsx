"use client";

import { useState, useMemo, useRef, useId } from "react";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { PostType } from "@/model/PostType";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Search, X, Check, Users } from "lucide-react";
import { getImageUrl } from "@/service/getImageUrl";
import { getInitials } from "@/service/getInitials";

// ── constants ──────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  facebook:  "Facebook",
  instagram: "Instagram",
  x:         "X / Twitter",
  linkedin:  "LinkedIn",
  youtube:   "YouTube",
  threads:   "Threads",
  tiktok:    "TikTok",
};

// Brand colours for the platform icon badge
const PLATFORM_ICON_STYLES: Record<string, string> = {
  facebook:  "bg-[#1877F2] text-white border-[#1877F2]/30",
  instagram: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white border-transparent",
  x:         "bg-black text-white border-black/20",
  linkedin:  "bg-[#0A66C2] text-white border-[#0A66C2]/30",
  youtube:   "bg-[#FF0000] text-white border-[#FF0000]/30",
  threads:   "bg-black text-white border-black/20",
  tiktok:    "bg-black text-white border-black/20",
};

// ── AccountChip ────────────────────────────────────────────────────────────────

function AccountChip({
  acc,
  isSelected,
  isAllowed,
  onToggle,
}: {
  acc: ConnectedAccount;
  isSelected: boolean;
  isAllowed: boolean;
  onToggle: (id: string) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon =
    PLATFORM_ICONS[acc.platform] ??
    PLATFORM_ICONS[(acc.platform as string)?.toUpperCase()];
  const url = getImageUrl(acc.profilePicLink);
  const platformLabel = PLATFORM_LABELS[acc.platform] ?? acc.platform;
  const label = `${acc.username} on ${platformLabel}`;
  const disabledReason = !isAllowed ? "Not supported for this post type" : undefined;
  const iconStyle =
    PLATFORM_ICON_STYLES[acc.platform.toLowerCase()] ??
    "bg-surface-raised text-foreground border-border-subtle";

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        aria-label={disabledReason ? `${label} — ${disabledReason}` : label}
        aria-disabled={!isAllowed}
        onClick={() => isAllowed && onToggle(acc.providerUserId)}
        disabled={!isAllowed}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={cn(
          "relative flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 transition-[border-color,background-color,box-shadow] duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/35 focus-visible:ring-offset-2",
          "w-[72px]",
          isSelected
            ? "border-[hsl(var(--accent))]/30 bg-surface-raised shadow-sm"
            : "border-border-subtle bg-surface hover:border-[hsl(var(--accent))]/20 hover:bg-surface-raised",
          !isAllowed && "opacity-40 cursor-not-allowed",
        )}
      >
        {/* Selected checkmark badge */}
        {isSelected && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--accent))] shadow-sm"
          >
            <Check className="w-2.5 h-2.5 text-accent-foreground" strokeWidth={3} />
          </span>
        )}

        {/* Avatar + platform icon */}
        <div className="relative">
          <Avatar className="w-9 h-9">
            {url && !imgErr ? (
              <AvatarImage src={url} alt="" onError={() => setImgErr(true)} />
            ) : null}
            <AvatarFallback className="bg-surface-raised text-[10px] font-semibold text-foreground">
              {getInitials(acc.username)}
            </AvatarFallback>
          </Avatar>
          {Icon && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border flex items-center justify-center shadow-sm",
                iconStyle,
              )}
            >
              <Icon className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Username */}
        <span className="text-[10px] font-medium text-foreground leading-tight text-center w-full truncate">
          {acc.username}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50",
            "animate-in fade-in-0 zoom-in-95 duration-150",
          )}
        >
          <div className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl shadow-xl",
            "bg-popover border border-border-subtle text-popover-foreground",
            "w-max min-w-[140px] max-w-[200px]",
          )}>
            {/* Profile image */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-9 h-9">
                {url && !imgErr ? (
                  <AvatarImage src={url} alt="" />
                ) : null}
                <AvatarFallback className="bg-surface-raised text-[10px] font-semibold text-foreground">
                  {getInitials(acc.username)}
                </AvatarFallback>
              </Avatar>
              {/* Platform icon badge */}
              {Icon && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border flex items-center justify-center shadow-sm",
                    iconStyle,
                  )}
                >
                  <Icon className="w-2.5 h-2.5" />
                </span>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-popover-foreground leading-tight truncate">
                {acc.username}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {platformLabel}
              </p>
              {disabledReason && (
                <p className="text-[10px] text-destructive leading-tight mt-0.5">
                  {disabledReason}
                </p>
              )}
            </div>
          </div>

          {/* Caret */}
          <span
            aria-hidden="true"
            className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-border"
          />
          <span
            aria-hidden="true"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-[-1px] border-[5px] border-transparent border-t-popover"
          />
        </div>
      )}
    </div>
  );
}

// ── AccountSelector ────────────────────────────────────────────────────────────

export interface AccountSelectorProps {
  postType: PostType | null;
  accounts: ConnectedAccount[];
  selectedAccountIds: string[];
  onChange: (ids: string[]) => void;
  loading: boolean;
}

export function AccountSelector({
  postType,
  accounts,
  selectedAccountIds,
  onChange,
  loading,
}: AccountSelectorProps) {
  const [search, setSearch] = useState("");
  const searchId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = search.toLowerCase().trim();

  const filteredAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          q === "" ||
          a.username.toLowerCase().includes(q) ||
          a.platform.toLowerCase().includes(q) ||
          (PLATFORM_LABELS[a.platform] ?? "").toLowerCase().includes(q),
      ),
    [accounts, q],
  );

  function toggleAccount(id: string) {
    onChange(
      selectedAccountIds.includes(id)
        ? selectedAccountIds.filter((x) => x !== id)
        : [...selectedAccountIds, id],
    );
  }

  const selectedCount = selectedAccountIds.length;

  // ── loading skeletons ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label="Loading accounts"
        aria-busy="true"
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[72px] px-3 py-2.5"
          >
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="w-10 h-2.5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ── empty (no connected accounts) ───────────────────────────────────────────

  if (accounts.length === 0) {
    return (
      <div className="flex items-center gap-3 py-4 text-muted-foreground">
        <Users className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm">No connected accounts found.</p>
      </div>
    );
  }

  // ── main ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* Search bar */}
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search accounts
        </label>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          id={searchId}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search accounts…"
          autoComplete="off"
          className="h-9 border-border-subtle bg-surface pl-9 pr-9 text-sm focus-visible:border-[hsl(var(--accent))] focus-visible:bg-background"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Horizontal scroll row */}
      <div
        ref={scrollRef}
        role="group"
        aria-label={`Select accounts — ${selectedCount} selected`}
        className={cn(
          "flex gap-2 overflow-x-auto rounded-xl border border-border-subtle bg-surface p-3 pb-2",
          // thin, cross-browser scrollbar
          "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
          // hide scrollbar on touch devices (still scrollable)
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
        )}
      >
        {filteredAccounts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 px-1">
            {q ? "No accounts match your search." : "No accounts available."}
          </p>
        ) : (
          filteredAccounts.map((acc) => (
            <AccountChip
              key={acc.providerUserId}
              acc={acc}
              isSelected={selectedAccountIds.includes(acc.providerUserId)}
              isAllowed={postType ? !!acc.allowedFormats?.includes(postType) : false}
              onToggle={toggleAccount}
            />
          ))
        )}
      </div>

      {/* Selection summary */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between pt-0.5" aria-live="polite" aria-atomic="true">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
            {selectedCount === 1 ? "account" : "accounts"} selected
          </p>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Clear all
          </button>
        </div>
      )}

    </div>
  );
}
