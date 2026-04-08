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
  appearance?: "default" | "geist";
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
  appearance = "default",
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  open: boolean;
  onClick: () => void;
  appearance?: "default" | "geist";
}) {
  const isGeist = appearance === "geist";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 px-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
        active
          ? isGeist
            ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
            : "bg-primary/10 border-primary/40 text-primary"
          : isGeist
            ? "bg-[var(--ds-background-100)] border-[var(--ds-gray-400)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
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

export function PostCollectionFilters({
  onFiltersChange,
  hidePeriod = false,
  appearance = "default",
}: PostCollectionFiltersProps) {
  const { getToken } = useAuth();
  const isGeist = appearance === "geist";

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
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none",
              isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
            )}
          />
          <input
            type="text"
            placeholder="Search collections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "h-9 pl-9 pr-8 rounded-lg border text-sm w-44 sm:w-72 transition-all",
              isGeist
                ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)] focus:border-[var(--ds-blue-600)]"
                : "text-foreground placeholder:text-muted-foreground bg-background border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            )}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={cn(
                "absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors",
                isGeist
                  ? "text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
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
                appearance={appearance}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className={cn(
              "w-52 p-1",
              isGeist
                ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-lg"
                : "shadow-lg"
            )}
          >
            {/* All Platforms option */}
            <button
              onClick={() => { setSelectedPlatform(undefined); setPlatformOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                !selectedPlatform
                  ? isGeist
                    ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                    : "bg-primary/10 text-primary"
                  : isGeist
                    ? "hover:bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                    : "hover:bg-muted/60 text-foreground"
              )}
            >
              <Globe
                className={cn(
                  "h-3.5 w-3.5 flex-shrink-0",
                  isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
                )}
              />
              <span className="flex-1 font-medium">All Platforms</span>
              {!selectedPlatform && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
            </button>

            <div
              className={cn(
                "h-px my-1",
                isGeist ? "bg-[var(--ds-gray-400)]" : "bg-border/50"
              )}
            />

            {ALL_PLATFORMS.map((p) => {
              const Icon = PLATFORM_ICONS[p];
              const isSelected = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => { setSelectedPlatform(p); setPlatformOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    isSelected
                      ? isGeist
                        ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                        : "bg-primary/10 text-primary"
                      : isGeist
                        ? "hover:bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                        : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 flex-shrink-0",
                        isSelected
                          ? isGeist
                            ? "text-[var(--ds-blue-700)]"
                            : "text-primary"
                          : PLATFORM_COLORS[p]
                      )}
                    />
                  )}
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
                appearance={appearance}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className={cn(
              "w-44 p-1",
              isGeist
                ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-lg"
                : "shadow-lg"
            )}
          >
            <button
              onClick={() => { setSelectedDateRange(undefined); setPeriodOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                !selectedDateRange
                  ? isGeist
                    ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                    : "bg-primary/10 text-primary"
                  : isGeist
                    ? "hover:bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                    : "hover:bg-muted/60 text-foreground"
              )}
            >
              <span className="flex-1 font-medium">All Time</span>
              {!selectedDateRange && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
            </button>

            <div
              className={cn(
                "h-px my-1",
                isGeist ? "bg-[var(--ds-gray-400)]" : "bg-border/50"
              )}
            />

            {DATE_RANGE_OPTIONS.map(({ value, label }) => {
              const isSelected = selectedDateRange === value;
              return (
                <button
                  key={value}
                  onClick={() => { setSelectedDateRange(value); setPeriodOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    isSelected
                      ? isGeist
                        ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                        : "bg-primary/10 text-primary"
                      : isGeist
                        ? "hover:bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                        : "hover:bg-muted/60 text-foreground"
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
                  ? isGeist
                    ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                    : "bg-primary/10 border-primary/40 text-primary"
                  : isGeist
                    ? "bg-[var(--ds-background-100)] border-[var(--ds-gray-400)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
                    : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Accounts</span>
              {accountFilterCount > 0 && (
                <span
                  className={cn(
                    "h-[18px] min-w-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none",
                    isGeist
                      ? "bg-[var(--ds-blue-600)] text-white"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {accountFilterCount}
                </span>
              )}
              <ChevronDown className={cn("h-3 w-3 transition-transform", accountOpen && "rotate-180")} />
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className={cn(
              "w-72 p-0",
              isGeist
                ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-lg"
                : "shadow-lg"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b",
                isGeist ? "border-[var(--ds-gray-400)]" : "border-border/50"
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  isGeist ? "text-[var(--ds-gray-1000)]" : "text-foreground"
                )}
              >
                Filter by account
              </span>
              {accountFilterCount > 0 && (
                <button
                  onClick={clearAccounts}
                  className={cn(
                    "text-xs transition-colors underline underline-offset-2",
                    isGeist
                      ? "text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Clear all
                </button>
              )}
            </div>

            {loadingFilters ? (
              <div
                className={cn(
                  "py-8 text-center text-sm",
                  isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
                )}
              >
                Loading…
              </div>
            ) : accounts.length === 0 ? (
              <div
                className={cn(
                  "px-4 py-8 text-center text-sm",
                  isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
                )}
              >
                No connected accounts found.
              </div>
            ) : (
              <ScrollArea className="max-h-[320px]">
                <div className="p-2 space-y-1">
                  {accounts.length > 0 && (
                    <>
                      <p
                        className={cn(
                          "px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider",
                          isGeist
                            ? "text-[var(--ds-gray-900)]"
                            : "text-muted-foreground"
                        )}
                      >
                        Accounts
                      </p>
                      {accounts.map((account) => {
                        const Icon = PLATFORM_ICONS[account.platform];
                        const isSelected = selectedAccountIds.has(account.providerUserId);
                        const platformColor = PLATFORM_COLORS[account.platform] ?? "text-muted-foreground";
                        return (
                          <button
                            key={account.providerUserId}
                            onClick={() => toggleAccount(account.providerUserId)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left",
                              isSelected
                                ? isGeist
                                  ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                                  : "bg-primary/10 text-primary"
                                : isGeist
                                  ? "hover:bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                                  : "hover:bg-muted/60 text-foreground"
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={cn(
                                  "h-3.5 w-3.5 flex-shrink-0",
                                  isSelected
                                    ? isGeist
                                      ? "text-[var(--ds-blue-700)]"
                                      : "text-primary"
                                    : platformColor
                                )}
                              />
                            )}
                            <span className="flex-1 truncate font-medium">{account.username}</span>
                            <span
                              className={cn(
                                "text-[11px] capitalize",
                                isGeist
                                  ? "text-[var(--ds-gray-900)]"
                                  : "text-muted-foreground"
                              )}
                            >
                              {account.platform}
                            </span>
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
            isGeist
              ? "bg-[var(--ds-background-100)] border-[var(--ds-gray-400)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
              : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
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
            className={cn(
              "h-9 px-3 rounded-lg border text-xs transition-all flex items-center gap-1.5 flex-shrink-0",
              isGeist
                ? "border-[var(--ds-gray-400)] text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
            )}
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
              <span
                key={uid}
                className={cn(
                  "inline-flex items-center gap-1.5 h-7 pl-2 pr-1.5 rounded-full border text-[11px] font-medium",
                  isGeist
                    ? "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
                    : "bg-primary/10 border-primary/20 text-primary"
                )}
              >
                {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
                {account.username}
                <button
                  onClick={() => toggleAccount(uid)}
                  className={cn(
                    "rounded-full p-0.5 transition-colors",
                    isGeist ? "hover:bg-[var(--ds-blue-200)]" : "hover:bg-primary/20"
                  )}
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
