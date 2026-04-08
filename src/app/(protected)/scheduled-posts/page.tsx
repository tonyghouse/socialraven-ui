"use client";

import { type ButtonHTMLAttributes, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { useAuth } from "@clerk/nextjs";
import { RefreshCw, CalendarDays, Plus } from "lucide-react";
import { CollectionCard } from "@/components/posts/collection-card";
import { ScheduledPostsPageSkeleton } from "@/components/posts/scheduled-posts-page-skeleton";
import { PostCollectionFilters, type DateRange, type SortDir } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL = 30 * 1000;
const pageClassName = "min-h-screen bg-[var(--ds-background-200)]";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

const badgeVariants = {
  neutral: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  accent: "border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]",
  danger: "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]",
} as const;

function ActionButton({
  tone = "secondary",
  iconOnly = false,
  fullWidth = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
  iconOnly?: boolean;
  fullWidth?: boolean;
}) {
  const toneClassName =
    tone === "primary"
      ? "border-transparent bg-[var(--ds-blue-600)] text-white hover:bg-[var(--ds-blue-700)]"
      : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

  const sizeClassName = iconOnly ? "h-9 w-9 px-0" : "h-9 px-3.5 text-label-14";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-50",
        toneClassName,
        sizeClassName,
        focusRingClassName,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: keyof typeof badgeVariants;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-label-12",
        badgeVariants[variant]
      )}
    >
      {children}
    </span>
  );
}

function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StatusBadge variant="danger">Error</StatusBadge>
            <p className="text-label-14 text-[var(--ds-red-700)]">{message}</p>
          </div>
          <p className="text-copy-12 text-[var(--ds-red-700)]">
            Refresh the queue to try loading your scheduled collections again.
          </p>
        </div>
        <ActionButton onClick={onRetry}>Retry</ActionButton>
      </div>
    </div>
  );
}

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
          "scheduled",
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

  if (loading && collections.length === 0) {
    return <ScheduledPostsPageSkeleton />;
  }

  const isEmpty = collections.length === 0 && !loading;

  return (
    <main className={pageClassName}>
      <ProtectedPageHeader
        title="Scheduled Posts"
        description="Manage the publishing queue across your connected channels."
        icon={<CalendarDays className="h-4 w-4" />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={
          <>
            <ActionButton
              iconOnly
              onClick={() => void loadCollections(currentPage, true)}
              disabled={isRefreshing}
              aria-label="Refresh scheduled posts"
              title="Refresh queue"
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5",
                  isRefreshing && "animate-spin"
                )}
              />
            </ActionButton>
            <div className="hidden sm:block">
              <ActionButton tone="primary" onClick={() => router.push("/schedule-post")}>
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Post</span>
                </span>
              </ActionButton>
            </div>
          </>
        }
      />

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <StatusBadge variant="accent">Refreshed {formatLastRefresh()}</StatusBadge>
          <StatusBadge>
            {loading && collections.length === 0
              ? "Loading queue"
              : totalElements === 0
              ? "No posts queued"
              : `${totalElements} queued`}
          </StatusBadge>
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="px-4 py-3 sm:px-6">
          <PostCollectionFilters onFiltersChange={handleFiltersChange} appearance="geist" />
        </div>
      </div>

      <div className="px-4 py-6 pb-24 sm:px-6 sm:pb-10">
        {error && (
          <div className="mb-6">
            <ErrorNotice message={error} onRetry={() => void loadCollections(currentPage)} />
          </div>
        )}

        {!isEmpty ? (
          <>
            <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/scheduled-posts/${collection.id}`}
                  appearance="geist"
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-4 shadow-sm">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  appearance="geist"
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState onCreatePost={() => router.push("/schedule-post")} />
        )}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 p-3 backdrop-blur-sm sm:hidden">
        <ActionButton
          tone="primary"
          onClick={() => router.push("/schedule-post")}
          fullWidth
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </span>
        </ActionButton>
      </div>
    </main>
  );
}

function EmptyState({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]">
          <CalendarDays className="h-5 w-5" />
        </div>
        <h3 className="text-title-16 text-[var(--ds-gray-1000)]">
          Nothing scheduled yet
        </h3>
        <p className="mt-2 text-label-14 leading-6 text-[var(--ds-gray-900)]">
          Create a scheduled post to start your queue.
        </p>
        <div className="mt-5">
          <ActionButton tone="primary" onClick={onCreatePost}>
            <span className="inline-flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
