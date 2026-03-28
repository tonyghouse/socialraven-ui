"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { useAuth } from "@clerk/nextjs";
import {
  AlertCircle,
  RefreshCw,
  BookOpen,
  Plus,
  FileText,
  Sparkles,
} from "lucide-react";
import { CollectionCard } from "@/components/posts/collection-card";
import { PostCollectionFilters, type SortDir } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function DraftsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();

  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

  const [collections, setCollections] = useState<PostCollectionResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeSearchRef = useRef("");
  const activeProviderUserIdsRef = useRef<string[]>([]);
  const activePlatformRef = useRef<string | undefined>(undefined);
  const activeSortDirRef = useRef<SortDir>("desc");
  const loadingRef = useRef(false);
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
      const sortDir = activeSortDirRef.current;

      try {
        const res = await fetchPostCollectionsApi(
          getToken,
          page - 1,
          "draft",
          search || undefined,
          providerUserIds.length > 0 ? providerUserIds : undefined,
          platform,
          sortDir
        );
        setCollections(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch {
        setError("Unable to load drafts. Please try again.");
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

  const handleFiltersChange = useCallback(
    (
      search: string,
      providerUserIds: string[],
      platform?: string,
      _dateRange?: unknown,
      sortDir?: SortDir
    ) => {
      activeSearchRef.current = search;
      activeProviderUserIdsRef.current = providerUserIds;
      activePlatformRef.current = platform;
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

  const isEmpty = collections.length === 0 && !loading;

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-400/20 to-slate-400/5 flex items-center justify-center flex-shrink-0 border border-slate-400/10">
                <BookOpen className="w-[18px] h-[18px] text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight">
                  Drafts
                </h1>
                <p className="text-xs text-muted-foreground">
                  {loading && collections.length === 0
                    ? "Loading…"
                    : totalElements === 0
                    ? "No drafts saved yet"
                    : `${totalElements} draft${totalElements !== 1 ? "s" : ""} saved`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
          <PostCollectionFilters onFiltersChange={handleFiltersChange} hidePeriod />
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
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !isEmpty ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-3 mb-8">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/drafts/${collection.id}`}
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

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-slate-400/40 via-slate-300/40 to-slate-200/40" />
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
        <Skeleton className="h-7 w-36 rounded-xl" />
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
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-400/10 to-slate-400/[0.03] flex items-center justify-center border border-slate-400/10 shadow-sm">
          <FileText className="w-8 h-8 text-slate-400/60" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-md">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl border border-border/20 scale-125 opacity-40" />
        <div className="absolute inset-0 rounded-3xl border border-border/10 scale-150 opacity-20" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
        No drafts yet
      </h3>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-sm">
        Save work-in-progress posts as drafts. When you&apos;re ready,
        schedule them across all your platforms with a single click.
      </p>

      <button
        onClick={onCreatePost}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm font-semibold text-sm"
      >
        <Plus className="h-4 w-4" />
        Create Your First Draft
      </button>
    </div>
  );
}
