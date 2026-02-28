"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Layers,
  Plus,
  CalendarDays,
} from "lucide-react";
import { CollectionCard } from "@/components/posts/collection-card";
import { PostCollectionFilters } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL = 30 * 1000;

export default function ScheduledPostsPage() {
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

  // Filter state — stored in refs so loadCollections closure always reads latest
  const activeSearchRef = useRef("");
  const activeProviderUserIdsRef = useRef<string[]>([]);

  const loadingRef = useRef(false);
  const needsRefreshRef = useRef(false);

  // Tracks whether the upcoming [currentPage] effect was triggered by a filter change
  // (to avoid double-loading when we navigate to page=1 after filter change)
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

      try {
        const res = await fetchPostCollectionsApi(
          getToken,
          page - 1,
          "scheduled",
          search || undefined,
          providerUserIds.length > 0 ? providerUserIds : undefined
        );
        setCollections(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setLastRefresh(new Date());
        needsRefreshRef.current = false;
      } catch {
        setError("Unable to load collections. Please try again.");
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

  // Load on URL page change
  useEffect(() => {
    if (skipNextPageEffectRef.current) {
      skipNextPageEffectRef.current = false;
      return;
    }
    loadCollections(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Auto-refresh
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

  // Called by PostCollectionFilters when search or account selection changes
  const handleFiltersChange = useCallback(
    (search: string, providerUserIds: string[]) => {
      activeSearchRef.current = search;
      activeProviderUserIdsRef.current = providerUserIds;

      // If not already on page 1, navigate there and skip the resulting page effect
      if (currentPage !== 1) {
        skipNextPageEffectRef.current = true;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        router.replace(`?${params.toString()}`, { scroll: false });
      }

      // Always load immediately with the updated filters from page 1
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
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Layers className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight">
                  Scheduled Posts
                </h1>
                <p className="text-xs text-muted-foreground">
                  {loading && collections.length === 0
                    ? "Loading…"
                    : `${totalElements} collection${totalElements !== 1 ? "s" : ""} scheduled`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground">
                Updated {formatLastRefresh()}
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
                className="hidden sm:flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs font-semibold shadow-sm"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <PostCollectionFilters onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-12 w-12 rounded-2xl bg-primary/[0.08] flex items-center justify-center mb-4 border border-border/20">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Loading collections…
            </p>
          </div>
        ) : !isEmpty ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/scheduled-posts/${collection.id}`}
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
    </main>
  );
}

function EmptyState({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/[0.08] to-primary/[0.03] flex items-center justify-center border border-border/30">
          <CalendarDays className="w-8 h-8 text-muted-foreground/60" />
        </div>
        <div className="absolute inset-0 rounded-3xl border border-border/20 scale-125 opacity-40" />
        <div className="absolute inset-0 rounded-3xl border border-border/10 scale-150 opacity-25" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
        No scheduled posts yet
      </h3>

      <p className="text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
        Schedule your content once and publish to all your platforms
        simultaneously. Each campaign appears here as a collection.
      </p>

      <button
        onClick={onCreatePost}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm font-semibold text-sm"
      >
        <Plus className="h-4 w-4" />
        Schedule Your First Post
      </button>
    </div>
  );
}
