"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { useAuth } from "@clerk/nextjs";
import {
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Plus,
  CalendarCheck2,
  Sparkles,
} from "lucide-react";
import { CollectionCard } from "@/components/posts/collection-card";
import { PostCollectionFilters, type DateRange, type SortDir } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL = 30 * 1000;

export default function PublishedPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();

  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

  const [collections, setCollections] = useState<PostCollectionResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeSearchRef = useRef("");
  const activeProviderUserIdsRef = useRef<string[]>([]);
  const activePlatformRef = useRef<string | undefined>(undefined);
  const activeDateRangeRef = useRef<DateRange | undefined>(undefined);
  const activeSortDirRef = useRef<SortDir>("desc");
  const loadingRef = useRef(false);
  const needsRefreshRef = useRef(false);
  const skipNextPageEffectRef = useRef(false);

  const loadCollections = useCallback(
    async (page: number, isManualRefresh = false) => {
      if (loadingRef.current && !isManualRefresh) return;
      loadingRef.current = true;
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const search = activeSearchRef.current;
      const providerUserIds = activeProviderUserIdsRef.current;
      const platform = activePlatformRef.current;
      const dateRange = activeDateRangeRef.current;
      const sortDir = activeSortDirRef.current;

      try {
        const res = await fetchPostCollectionsApi(
          getToken,
          page - 1,
          "published",
          search || undefined,
          providerUserIds.length > 0 ? providerUserIds : undefined,
          platform,
          sortDir,
          dateRange
        );
        setCollections(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setLastRefresh(new Date());
        needsRefreshRef.current = false;
      } catch {
        setError("Unable to load published collections. Please try again.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [getToken]
  );

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (skipNextPageEffectRef.current) {
      skipNextPageEffectRef.current = false;
      return;
    }
    loadCollections(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) loadCollections(currentPage, true);
      else needsRefreshRef.current = true;
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && needsRefreshRef.current) {
        loadCollections(currentPage, true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleFiltersChange = useCallback(
    (
      search: string,
      providerUserIds: string[],
      platform?: string,
      dateRange?: DateRange,
      sortDir?: SortDir
    ) => {
      activeSearchRef.current = search;
      activeProviderUserIdsRef.current = providerUserIds;
      activePlatformRef.current = platform;
      activeDateRangeRef.current = dateRange;
      activeSortDirRef.current = sortDir ?? "desc";

      if (currentPage !== 1) {
        skipNextPageEffectRef.current = true;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        router.replace(`?${params.toString()}`, { scroll: false });
      }

      loadCollections(1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, searchParams, router]
  );

  const formatLastRefresh = () => {
    const diffMins = Math.floor((Date.now() - lastRefresh.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    return `${diffMins} mins ago`;
  };

  const isEmpty = collections.length === 0 && !loading;

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight">
                  Published Posts
                </h1>
                <p className="text-xs text-muted-foreground">
                  {loading && collections.length === 0
                    ? "Loading…"
                    : totalElements === 0
                    ? "No posts published yet"
                    : `${totalElements} post${totalElements !== 1 ? "s" : ""} published`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground/70">
                Refreshed {formatLastRefresh()}
              </span>

              <button
                onClick={() => loadCollections(currentPage, true)}
                disabled={isRefreshing}
                className="h-8 w-8 rounded-lg bg-secondary hover:bg-secondary/70 disabled:opacity-50 transition-all flex items-center justify-center"
                title="Refresh"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground",
                    isRefreshing && "animate-spin"
                  )}
                />
              </button>

              <button
                onClick={() => router.push("/schedule-post")}
                className="hidden sm:flex items-center gap-1.5 h-8 px-4 rounded-lg bg-accent text-accent-foreground hover:opacity-90 active:scale-95 transition-all text-xs font-semibold shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                New Post
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="border-b border-border/50 bg-background/60">
        <div className="px-4 sm:px-6 py-3">
          <PostCollectionFilters onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-5 sm:py-8 pb-24 sm:pb-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => loadCollections(currentPage)}
                className="text-xs underline mt-1 hover:no-underline opacity-80"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading && collections.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCollectionCard key={i} />
            ))}
          </div>
        ) : !isEmpty ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-3 mb-8">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/published-posts/${collection.id}`}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState onCreatePost={() => router.push("/schedule-post")} />
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => router.push("/schedule-post")}
        className="sm:hidden fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
        aria-label="New Post"
      >
        <Plus className="h-6 w-6" />
      </button>
    </main>
  );
}

function SkeletonCollectionCard() {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-emerald-400/40 via-teal-400/40 to-cyan-400/40" />
      <div className="flex items-center justify-between px-4 pt-3">
        <Skeleton className="h-5 w-16 rounded-lg" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="px-4 pt-2.5 pb-2 space-y-2">
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <div className="px-4 pb-2">
        <Skeleton className="h-7 w-44 rounded-xl" />
      </div>
      <div className="px-4 pb-3">
        <Skeleton className="w-[150px] h-[150px] rounded-xl" />
      </div>
      <div className="px-4">
        <div className="h-px bg-border/40" />
      </div>
      <div className="px-4 pt-3 pb-2.5">
        <Skeleton className="h-3 w-16 rounded mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex justify-between items-center">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-3.5 w-16 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-7">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.03] flex items-center justify-center border border-emerald-500/10 shadow-sm">
          <CalendarCheck2 className="w-8 h-8 text-emerald-500/60" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-md">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl border border-border/20 scale-125 opacity-40" />
        <div className="absolute inset-0 rounded-3xl border border-border/10 scale-150 opacity-20" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
        Nothing published yet
      </h3>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-sm">
        Once your scheduled posts go live across platforms, they&apos;ll
        appear here automatically.
      </p>

      <button
        onClick={onCreatePost}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm font-semibold text-sm"
      >
        <Plus className="h-4 w-4" />
        Schedule Your First Post
      </button>

      <p className="mt-4 text-xs text-muted-foreground/50">
        Posts go out automatically — no need to stay online.
      </p>
    </div>
  );
}
