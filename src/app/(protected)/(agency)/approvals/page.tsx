"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { CheckCheck, RefreshCw } from "lucide-react";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { Button } from "@/components/ui/button";
import { CollectionCard } from "@/components/posts/collection-card";
import { PostCollectionFilters, type SortDir } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const pageClassName = "min-h-screen bg-[var(--ds-background-200)]";
const surfaceClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const subtleButtonClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";

function QueuePill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] px-2.5 py-1 text-label-12 text-[var(--ds-blue-700)]">
      {children}
    </span>
  );
}

function InlineNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] p-4">
      <p className="text-heading-16 text-[var(--ds-gray-1000)]">{title}</p>
      <div className="mt-1 text-copy-14 text-[var(--ds-red-700)]">{children}</div>
    </section>
  );
}

function Sk({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-[var(--ds-gray-200)]", className)} />;
}

function ApprovalsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <section key={index} className={cn(surfaceClassName, "overflow-hidden")}>
          <div className="flex items-center justify-between border-b border-[var(--ds-gray-400)] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Sk className="h-6 w-16 rounded-md" />
              <Sk className="h-6 w-20 rounded-full" />
            </div>
            <Sk className="h-6 w-20 rounded-full" />
          </div>

          <div className="flex gap-3 px-3 py-3">
            <div className="min-w-0 flex-1">
              <Sk className="h-4 w-full rounded-md" />
              <Sk className="mt-2 h-4 w-4/5 rounded-md" />
              <Sk className="mt-4 h-3 w-32 rounded-md" />
              <div className="mt-4 flex gap-1.5">
                <Sk className="h-7 w-7 rounded-md" />
                <Sk className="h-7 w-7 rounded-md" />
                <Sk className="h-7 w-7 rounded-md" />
              </div>
            </div>
            <Sk className="h-[156px] w-[104px] rounded-md" />
          </div>

          <div className="flex items-center justify-between border-t border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2.5">
            <Sk className="h-3 w-28 rounded-md" />
            <Sk className="h-3 w-10 rounded-md" />
          </div>
        </section>
      ))}
    </div>
  );
}

export default function ApprovalsPage() {
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
          "review",
          search || undefined,
          providerUserIds.length > 0 ? providerUserIds : undefined,
          platform,
          sortDir
        );
        setCollections(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch {
        setError("Unable to load the approval queue. Please try again.");
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
    <main className={pageClassName}>
      <ProtectedPageHeader
        title="Approvals"
        description="Review pending content and move approved work into the publishing queue."
        icon={<CheckCheck className="h-4 w-4" />}
        actions={
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => loadCollections(currentPage, true)}
            disabled={isRefreshing}
            aria-label="Refresh approvals"
            title="Refresh"
            className={cn("h-9 w-9 rounded-md", subtleButtonClassName)}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          </Button>
        }
      />

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-label-14 text-[var(--ds-gray-900)] sm:px-6">
          <QueuePill>
            {loading && collections.length === 0
              ? "Loading queue"
              : totalElements === 0
              ? "No approvals waiting"
              : `${totalElements} pending`}
          </QueuePill>
        </div>
      </div>

      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
        <div className="px-4 py-3 sm:px-6">
          <PostCollectionFilters
            onFiltersChange={handleFiltersChange}
            hidePeriod
            appearance="geist"
          />
        </div>
      </div>

      <div className="px-4 py-6 pb-24 sm:px-6 sm:pb-10">
        {error && (
          <div className="mb-6">
            <InlineNotice title={error}>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadCollections(currentPage)}
                  className={cn("rounded-md", subtleButtonClassName)}
                >
                  Retry
                </Button>
              </div>
            </InlineNotice>
          </div>
        )}

        {loading && collections.length === 0 ? (
          <ApprovalsGridSkeleton />
        ) : !isEmpty ? (
          <>
            <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/drafts/${collection.id}`}
                  appearance="geist"
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={cn("mt-8 px-4 py-4", surfaceClassName)}>
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
          <section className={cn("px-6 py-12 text-center", surfaceClassName)}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
              <CheckCheck className="h-5 w-5 text-[var(--ds-gray-900)]" />
            </div>
            <p className="mt-4 text-heading-16 text-[var(--ds-gray-1000)]">Approval queue is clear</p>
            <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
              New editor submissions will appear here as they enter review.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
