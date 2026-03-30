"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { useAuth } from "@clerk/nextjs";
import { RefreshCw, CheckCircle2, Plus, CalendarCheck2 } from "lucide-react";
import { CollectionCard } from "@/components/posts/collection-card";
import { PostCollectionFilters, type DateRange, type SortDir } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
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
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Published Posts"
        description="Review delivered content and revisit published collections."
        icon={<CheckCircle2 className="h-4 w-4" />}
        actions={
          <>
            <AtlassianButton
              appearance="subtle"
              onClick={() => loadCollections(currentPage, true)}
              isDisabled={isRefreshing}
              title="Refresh"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            </AtlassianButton>
            <div className="hidden sm:block">
              <AtlassianButton appearance="primary" onClick={() => router.push("/schedule-post")}>
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Post</span>
                </span>
              </AtlassianButton>
            </div>
          </>
        }
      />

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <Lozenge appearance="success">Refreshed {formatLastRefresh()}</Lozenge>
          <Lozenge appearance="default">
            {loading && collections.length === 0
              ? "Loading published posts"
              : totalElements === 0
              ? "Nothing published yet"
              : `${totalElements} published`}
          </Lozenge>
        </div>
      </div>

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
        <div className="px-4 py-3 sm:px-6">
          <PostCollectionFilters onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      <div className="px-4 py-6 pb-24 sm:px-6 sm:pb-10">
        {error && (
          <div className="mb-6">
            <SectionMessage appearance="error" title={error}>
              <div className="mt-3">
                <AtlassianButton appearance="subtle" onClick={() => loadCollections(currentPage)}>
                  Retry
                </AtlassianButton>
              </div>
            </SectionMessage>
          </div>
        )}

        {loading && collections.length === 0 ? (
          <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCollectionCard key={i} />
            ))}
          </div>
        ) : !isEmpty ? (
          <>
            <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/published-posts/${collection.id}`}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 p-3 backdrop-blur-sm sm:hidden">
        <AtlassianButton
          appearance="primary"
          onClick={() => router.push("/schedule-post")}
          shouldFitContainer
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </span>
        </AtlassianButton>
      </div>
    </main>
  );
}

function SkeletonCollectionCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
      <div className="h-[3px] bg-[hsl(var(--success))]" />
      <div className="flex items-center justify-between px-5 pt-4">
        <Skeleton className="h-5 w-16 rounded-lg" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2 px-5 pb-3 pt-3">
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <div className="px-5 pb-3">
        <Skeleton className="h-7 w-44 rounded-xl" />
      </div>
      <div className="px-5 pb-4">
        <Skeleton className="h-[180px] w-[180px] rounded-xl" />
      </div>
      <div className="px-5">
        <div className="h-px bg-border/40" />
      </div>
      <div className="px-5 py-3.5">
        <Skeleton className="mb-3 h-3 w-16 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/40 bg-[hsl(var(--surface-raised))] px-5 py-3">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-3.5 w-16 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-16 text-center shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
        <CalendarCheck2 className="h-5 w-5 text-[hsl(var(--success))]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--foreground))]">
        Nothing published yet
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--foreground-muted))]">
        Once your scheduled posts go live across platforms, they&apos;ll
        appear here automatically.
      </p>
      <div className="mt-6 flex justify-center">
        <AtlassianButton appearance="primary" onClick={onCreatePost}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Schedule Your First Post</span>
          </span>
        </AtlassianButton>
      </div>
      <p className="mt-4 text-xs text-[hsl(var(--foreground-subtle))]">
        Posts go out automatically — no need to stay online.
      </p>
    </div>
  );
}
