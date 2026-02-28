"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, SlidersHorizontal, X, Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fetchAccountGroupsApi } from "@/service/accountGroups";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { AccountGroup } from "@/model/AccountGroup";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { useAuth } from "@clerk/nextjs";

interface PostCollectionFiltersProps {
  onFiltersChange: (search: string, providerUserIds: string[]) => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "text-pink-500",
  x: "text-neutral-700 dark:text-neutral-300",
  linkedin: "text-sky-600",
  facebook: "text-blue-600",
  youtube: "text-red-600",
  threads: "text-neutral-700 dark:text-neutral-300",
  tiktok: "text-neutral-700 dark:text-neutral-300",
};

export function PostCollectionFilters({
  onFiltersChange,
}: PostCollectionFiltersProps) {
  const { getToken } = useAuth();

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(
    new Set()
  );
  const [loadingFilters, setLoadingFilters] = useState(false);

  const dataFetchedRef = useRef(false);
  const hasMountedRef = useRef(false);
  const callbackRef = useRef(onFiltersChange);
  useEffect(() => {
    callbackRef.current = onFiltersChange;
  });

  // Resolve all selected providerUserIds (from groups + individual accounts)
  const computedProviderUserIds = useMemo(() => {
    const ids = new Set<string>(selectedAccountIds);
    for (const gid of selectedGroupIds) {
      const group = groups.find((g) => g.id === gid);
      if (group) group.accountIds.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [selectedGroupIds, selectedAccountIds, groups]);

  // Stable string key for dep comparison
  const providerIdsKey = computedProviderUserIds.join(",");

  const activeFilterCount = selectedGroupIds.size + selectedAccountIds.size;

  // Fire callback (with 300ms debounce for search changes, immediate for account changes)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const ids = providerIdsKey ? providerIdsKey.split(",") : [];
    const timer = setTimeout(() => {
      callbackRef.current(search, ids);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, providerIdsKey]);

  // Fetch groups + accounts once when popover first opens
  useEffect(() => {
    if (!isOpen || dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    setLoadingFilters(true);
    Promise.all([
      fetchAccountGroupsApi(getToken),
      fetchAllConnectedAccountsApi(getToken),
    ])
      .then(([g, a]) => {
        setGroups(g);
        setAccounts(a);
      })
      .catch(() => {
        /* silently fail — filters just won't populate */
      })
      .finally(() => setLoadingFilters(false));
  }, [isOpen, getToken]);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearAll = () => {
    setSelectedGroupIds(new Set());
    setSelectedAccountIds(new Set());
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "h-9 pl-9 pr-8 rounded-lg border text-sm text-foreground placeholder:text-muted-foreground",
            "bg-background border-border/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "transition-all w-64 sm:w-80"
          )}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "relative h-9 px-3.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2",
              activeFilterCount > 0
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-[18px] min-w-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-0 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-sm font-semibold text-foreground">
              Filter by account
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>

          {loadingFilters ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : groups.length === 0 && accounts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground px-4">
              No connected accounts found.
            </div>
          ) : (
            <ScrollArea className="max-h-[320px]">
              <div className="p-2 space-y-1">
                {/* Account Groups */}
                {groups.length > 0 && (
                  <>
                    <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Account Groups
                    </p>
                    {groups.map((group) => {
                      const isSelected = selectedGroupIds.has(group.id);
                      return (
                        <button
                          key={group.id}
                          onClick={() => toggleGroup(group.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/60 text-foreground"
                          )}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0 ring-1 ring-black/10"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="flex-1 truncate font-medium">
                            {group.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {group.accountIds.length}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Individual Accounts */}
                {accounts.length > 0 && (
                  <>
                    <p className="px-2 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Accounts
                    </p>
                    {accounts.map((account) => {
                      const Icon = PLATFORM_ICONS[account.platform];
                      const isSelected = selectedAccountIds.has(
                        account.providerUserId
                      );
                      const platformColor =
                        PLATFORM_COLORS[account.platform] ??
                        "text-muted-foreground";
                      return (
                        <button
                          key={account.providerUserId}
                          onClick={() => toggleAccount(account.providerUserId)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/60 text-foreground"
                          )}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "h-3.5 w-3.5 flex-shrink-0",
                                isSelected ? "text-primary" : platformColor
                              )}
                            />
                          )}
                          <span className="flex-1 truncate font-medium">
                            {account.username}
                          </span>
                          <span className="text-[11px] text-muted-foreground capitalize">
                            {account.platform}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from(selectedGroupIds).map((gid) => {
            const group = groups.find((g) => g.id === gid);
            if (!group) return null;
            return (
              <span
                key={gid}
                className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary"
              >
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                {group.name}
                <button
                  onClick={() => toggleGroup(gid)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${group.name} filter`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
          {Array.from(selectedAccountIds).map((uid) => {
            const account = accounts.find((a) => a.providerUserId === uid);
            if (!account) return null;
            const Icon = PLATFORM_ICONS[account.platform];
            return (
              <span
                key={uid}
                className="inline-flex items-center gap-1.5 h-7 pl-2 pr-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary"
              >
                {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
                {account.username}
                <button
                  onClick={() => toggleAccount(uid)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${account.username} filter`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
