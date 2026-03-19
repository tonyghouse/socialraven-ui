"use client";

import { useState, useMemo, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { ConnectedAccount } from "@/model/ConnectedAccount";
import type { PostType } from "@/model/PostType";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import { getImageUrl } from "@/service/getImageUrl";
import { getInitials } from "@/service/getInitials";

// ── constants ──────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X / Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  threads: "Threads",
  tiktok: "TikTok",
};

// ── StackedAvatar ──────────────────────────────────────────────────────────────

function StackedAvatar({ acc }: { acc: ConnectedAccount }) {
  const [imgErr, setImgErr] = useState(false);
  const url = getImageUrl(acc.profilePicLink);
  return (
    <Avatar className="w-8 h-8 border-2 border-background">
      {url && !imgErr ? (
        <AvatarImage
          src={url}
          alt={acc.username}
          onError={() => setImgErr(true)}
        />
      ) : null}
      <AvatarFallback className="text-[10px] font-semibold bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
        {getInitials(acc.username)}
      </AvatarFallback>
    </Avatar>
  );
}

// ── AccountRow ─────────────────────────────────────────────────────────────────

function AccountRow({
  acc,
  isSelected,
  isAllowed,
  toggle,
}: {
  acc: ConnectedAccount;
  isSelected: boolean;
  isAllowed: boolean;
  toggle: (id: string) => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const Icon =
    PLATFORM_ICONS[acc.platform] ??
    PLATFORM_ICONS[(acc.platform as string)?.toUpperCase()];
  const url = getImageUrl(acc.profilePicLink);

  return (
    <button
      type="button"
      onClick={() => isAllowed && toggle(acc.providerUserId)}
      disabled={!isAllowed}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left",
        isSelected
          ? "border-accent bg-secondary"
          : "border-border bg-card hover:bg-muted",
        !isAllowed && "opacity-40 cursor-not-allowed",
      )}
    >
      {/* Avatar + platform badge */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-9 h-9">
          {url && !imgErr ? (
            <AvatarImage
              src={url}
              alt={acc.username}
              onError={() => setImgErr(true)}
            />
          ) : null}
          <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
            {getInitials(acc.username)}
          </AvatarFallback>
        </Avatar>
        {Icon && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
            <Icon className="w-2.5 h-2.5 text-foreground" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">
            {acc.username}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {PLATFORM_LABELS[acc.platform] ?? acc.platform}
          {!isAllowed && " · Not supported for this post type"}
        </span>
      </div>

      {/* Checkbox */}
      <div
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150",
          isSelected
            ? "bg-accent border-accent"
            : "border-border bg-background",
        )}
      >
        {isSelected && (
          <Check className="w-3 h-3 text-accent-foreground" strokeWidth={3} />
        )}
      </div>
    </button>
  );
}

// ── AccountSelector ────────────────────────────────────────────────────────────

export interface AccountSelectorProps {
  postType: PostType;
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
  const [open, setOpen] = useState(false);
  // Staged — only committed to parent on "Apply"
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // ── open / close ────────────────────────────────────────────────────────────

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setPendingIds([...selectedAccountIds]);
      setSearch("");
    }
    setOpen(isOpen);
  }

  function handleApply() {
    onChange(pendingIds);
    setOpen(false);
  }

  // ── filtered data ────────────────────────────────────────────────────────────

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

  // ── staged toggles ───────────────────────────────────────────────────────────

  const toggleAccount = useCallback((id: string) => {
    setPendingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // ── derived ──────────────────────────────────────────────────────────────────

  const selectedAccounts = useMemo(
    () => accounts.filter((a) => selectedAccountIds.includes(a.providerUserId)),
    [accounts, selectedAccountIds],
  );
  const selectedPlatforms = useMemo(
    () => [...new Set(selectedAccounts.map((a) => a.platform))],
    [selectedAccounts],
  );
  const hasSelection = selectedAccountIds.length > 0;

  const pendingAccounts = useMemo(
    () => accounts.filter((a) => pendingIds.includes(a.providerUserId)),
    [accounts, pendingIds],
  );
  const pendingPlatforms = useMemo(
    () => [...new Set(pendingAccounts.map((a) => a.platform))],
    [pendingAccounts],
  );
  const hasPending = pendingIds.length > 0;

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {/* ── Trigger / summary ── */}
      <Dialog.Trigger asChild>
        <button
          type="button"
          disabled={loading}
          className={cn(
            "w-full rounded-xl border transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            hasSelection
              ? "border-accent bg-secondary hover:bg-muted"
              : "border-dashed border-border hover:border-accent hover:bg-muted",
            loading && "opacity-60 cursor-not-allowed",
          )}
        >
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ))}
            </div>
          ) : !hasSelection ? (
            /* Empty state */
            <div className="flex items-center gap-3.5 px-4 py-5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Select accounts
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Choose the social profiles to publish this post to
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ) : (
            /* Populated state */
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex -space-x-2.5 flex-shrink-0">
                {selectedAccounts.slice(0, 4).map((acc) => (
                  <StackedAvatar key={acc.providerUserId} acc={acc} />
                ))}
                {selectedAccounts.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      +{selectedAccounts.length - 4}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {selectedAccountIds.length} account
                  {selectedAccountIds.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedPlatforms
                    .map((p) => PLATFORM_LABELS[p] ?? p)
                    .join(" · ")}
                </p>
              </div>
              <span className="text-xs font-semibold text-accent flex-shrink-0 px-2.5 py-1 rounded-lg bg-secondary">
                Edit
              </span>
            </div>
          )}
        </button>
      </Dialog.Trigger>

      {/* ── Modal ── */}
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal panel */}
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100vw-2rem)] max-w-[560px]",
            "bg-background border border-border rounded-2xl shadow-2xl",
            "flex flex-col",
            "max-h-[85vh]",
            "focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-200",
          )}
        >
          {/* ── Header ── */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-start justify-between gap-3 pr-1">
              <div>
                <Dialog.Title className="text-base font-bold text-foreground leading-tight">
                  Select Accounts
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                  {pendingIds.length > 0
                    ? `${pendingIds.length} of ${accounts.length} selected — click Apply to confirm`
                    : "Choose the accounts to publish to"}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Search */}
            <div className="relative mt-3.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts…"
                className="pl-9 h-9 text-sm bg-muted border-border focus-visible:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
            <div className="space-y-2">
              {filteredAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {q
                      ? "No accounts match your search"
                      : "No connected accounts found"}
                  </p>
                </div>
              ) : (
                filteredAccounts.map((acc) => (
                  <AccountRow
                    key={acc.providerUserId}
                    acc={acc}
                    isSelected={pendingIds.includes(acc.providerUserId)}
                    isAllowed={!!acc.allowedFormats?.includes(postType)}
                    toggle={toggleAccount}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-border bg-muted rounded-b-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {hasPending
                    ? `${pendingIds.length} account${pendingIds.length !== 1 ? "s" : ""} selected`
                    : "No accounts selected"}
                </p>
                {hasPending && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    Across {pendingPlatforms.length} platform
                    {pendingPlatforms.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {hasPending && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingIds([])}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  disabled={!hasPending}
                  className="h-8 px-5 text-xs font-semibold"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
