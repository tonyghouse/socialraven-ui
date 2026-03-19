"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  CalendarDays,
  Globe,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import { useAuth } from "@clerk/nextjs";

export type DateRange = "today" | "week" | "month";
export type SortDir = "asc" | "desc";

interface PostCollectionFiltersProps {
  onFiltersChange: (
    search: string,
    providerUserIds: string[],
    platform?: string,
    dateRange?: DateRange,
    sortDir?: SortDir
  ) => void;
  hidePeriod?: boolean;
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

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  threads: "Threads",
};

const ALL_PLATFORMS = [
  "instagram",
  "x",
  "linkedin",
  "facebook",
  "youtube",
  "tiktok",
  "threads",
] as const;

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

// Shared dropdown trigger style
function DropdownButton({
  label,
  icon,
  active,
  open,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 px-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
        active
          ? "bg-primary/10 border-primary/40 text-primary"
          : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {icon}
      <span>{label}</span>
      <ChevronDown
        className={cn("h-3 w-3 flex-shrink-0 transition-transform", open && "rotate-180")}
      />
    </button>
  );
}

export function PostCollectionFilters({ onFiltersChange, hidePeriod = false }: PostCollectionFiltersProps) {
  const { getToken } = useAuth();

  // Account filter popover state
  const [accountOpen, setAccountOpen] = useState(false);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Platform dropdown
  const [platformOpen, setPlatformOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | undefined>();

  // Period dropdown
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

  // Sort
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Search
  const [search, setSearch] = useState("");

  const dataFetchedRef = useRef(false);
  const hasMountedRef = useRef(false);
  const callbackRef = useRef(onFiltersChange);
  useEffect(() => { callbackRef.current = onFiltersChange; });

  const computedProviderUserIds = useMemo(() => Array.from(selectedAccountIds), [selectedAccountIds]);

  const providerIdsKey = computedProviderUserIds.join(",");
  const accountFilterCount = selectedAccountIds.size;

  // Debounced callback
  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    const ids = providerIdsKey ? providerIdsKey.split(",") : [];
    const timer = setTimeout(() => {
      callbackRef.current(search, ids, selectedPlatform, selectedDateRange, sortDir);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, providerIdsKey, selectedPlatform, selectedDateRange, sortDir]);

  // Fetch accounts when account popover opens
  useEffect(() => {
    if (!accountOpen || dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    setLoadingFilters(true);
    fetchAllConnectedAccountsApi(getToken)
      .then((a) => { setAccounts(a); })
      .catch(() => {})
      .finally(() => setLoadingFilters(false));
  }, [accountOpen, getToken]);

  const toggleAccount = (id: string) =>
    setSelectedAccountIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const clearAccounts = () => { setSelectedAccountIds(new Set()); };

  const platformLabel = selectedPlatform ? PLATFORM_LABELS[selectedPlatform] ?? selectedPlatform : "All Platforms";
  const periodLabel = selectedDateRange
    ? DATE_RANGE_OPTIONS.find((d) => d.value === selectedDateRange)?.label ?? "Period"
    : "All Time";

  return (
    <div className="flex flex-col gap-3">
      {/* Single row — horizontally scrollable on mobile so everything stays on one line */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search collections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "h-9 pl-9 pr-8 rounded-lg border text-sm text-foreground placeholder:text-muted-foreground",
              "bg-background border-border/60 w-44 sm:w-72",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            )}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Platform dropdown */}
        <Popover open={platformOpen} onOpenChange={setPlatformOpen}>
          <PopoverTrigger asChild>
            <div>
              <DropdownButton
                label={platformLabel}
                icon={<Globe className="h-3.5 w-3.5 flex-shrink-0" />}
                active={!!selectedPlatform}
                open={platformOpen}
                onClick={() => setPlatformOpen((v) => !v)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-52 p-1 shadow-lg">
            {/* All Platforms option */}
            <button
              onClick={() => { setSelectedPlatform(undefined); setPlatformOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                !selectedPlatform ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
              )}
            >
              <Globe className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1 font-medium">All Platforms</span>
              {!selectedPlatform && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
            </button>

            <div className="h-px bg-border/50 my-1" />

            {ALL_PLATFORMS.map((p) => {
              const Icon = PLATFORM_ICONS[p];
              const isSelected = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => { setSelectedPlatform(p); setPlatformOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  {Icon && <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", isSelected ? "text-primary" : PLATFORM_COLORS[p])} />}
                  <span className="flex-1 font-medium">{PLATFORM_LABELS[p]}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {/* Period dropdown — hidden for pages without scheduledTime (e.g. drafts) */}
        {!hidePeriod && <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
          <PopoverTrigger asChild>
            <div>
              <DropdownButton
                label={periodLabel}
                icon={<CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />}
                active={!!selectedDateRange}
                open={periodOpen}
                onClick={() => setPeriodOpen((v) => !v)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-1 shadow-lg">
            <button
              onClick={() => { setSelectedDateRange(undefined); setPeriodOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                !selectedDateRange ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
              )}
            >
              <span className="flex-1 font-medium">All Time</span>
              {!selectedDateRange && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
            </button>

            <div className="h-px bg-border/50 my-1" />

            {DATE_RANGE_OPTIONS.map(({ value, label }) => {
              const isSelected = selectedDateRange === value;
              return (
                <button
                  key={value}
                  onClick={() => { setSelectedDateRange(value); setPeriodOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <span className="flex-1 font-medium">{label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>}

        {/* Accounts filter */}
        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "relative h-9 px-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
                accountFilterCount > 0
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Accounts</span>
              {accountFilterCount > 0 && (
                <span className="h-[18px] min-w-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                  {accountFilterCount}
                </span>
              )}
              <ChevronDown className={cn("h-3 w-3 transition-transform", accountOpen && "rotate-180")} />
            </button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-72 p-0 shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <span className="text-sm font-semibold text-foreground">Filter by account</span>
              {accountFilterCount > 0 && (
                <button onClick={clearAccounts} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                  Clear all
                </button>
              )}
            </div>

            {loadingFilters ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground px-4">No connected accounts found.</div>
            ) : (
              <ScrollArea className="max-h-[320px]">
                <div className="p-2 space-y-1">
                  {accounts.length > 0 && (
                    <>
                      <p className="px-2 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Accounts</p>
                      {accounts.map((account) => {
                        const Icon = PLATFORM_ICONS[account.platform];
                        const isSelected = selectedAccountIds.has(account.providerUserId);
                        const platformColor = PLATFORM_COLORS[account.platform] ?? "text-muted-foreground";
                        return (
                          <button key={account.providerUserId} onClick={() => toggleAccount(account.providerUserId)}
                            className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left", isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground")}>
                            {Icon && <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", isSelected ? "text-primary" : platformColor)} />}
                            <span className="flex-1 truncate font-medium">{account.username}</span>
                            <span className="text-[11px] text-muted-foreground capitalize">{account.platform}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
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

        {/* Sort toggle */}
        <button
          onClick={() => setSortDir((prev) => (prev === "desc" ? "asc" : "desc"))}
          title={sortDir === "desc" ? "Newest first — click for oldest first" : "Oldest first — click for newest first"}
          className={cn(
            "h-9 px-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
            "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>{sortDir === "desc" ? "Newest" : "Oldest"}</span>
        </button>

        {/* Clear all active filters */}
        {(selectedPlatform || selectedDateRange || accountFilterCount > 0) && (
          <button
            onClick={() => {
              setSelectedPlatform(undefined);
              setSelectedDateRange(undefined);
              clearAccounts();
            }}
            className="h-9 px-3 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {selectedAccountIds.size > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from(selectedAccountIds).map((uid) => {
            const account = accounts.find((a) => a.providerUserId === uid);
            if (!account) return null;
            const Icon = PLATFORM_ICONS[account.platform];
            return (
              <span key={uid} className="inline-flex items-center gap-1.5 h-7 pl-2 pr-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
                {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
                {account.username}
                <button onClick={() => toggleAccount(uid)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
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
