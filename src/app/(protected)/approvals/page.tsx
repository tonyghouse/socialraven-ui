"use client";

import AtlassianButton from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { CheckCheck, RefreshCw } from "lucide-react";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { CollectionCard } from "@/components/posts/collection-card";
import { CollectionListPageSkeleton } from "@/components/posts/collection-page-skeletons";
import { PostCollectionFilters, type SortDir } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { cn } from "@/lib/utils";

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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Approvals"
        description="Review pending content and move approved work into the publishing queue."
        icon={<CheckCheck className="h-4 w-4" />}
        actions={
          <AtlassianButton
            appearance="subtle"
            onClick={() => loadCollections(currentPage, true)}
            isDisabled={isRefreshing}
            title="Refresh"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          </AtlassianButton>
        }
      />

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm leading-5 text-[hsl(var(--foreground-muted))] sm:px-6">
          <Lozenge appearance="inprogress">
            {loading && collections.length === 0
              ? "Loading queue"
              : totalElements === 0
              ? "No approvals waiting"
              : `${totalElements} pending`}
          </Lozenge>
        </div>
      </div>

      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
        <div className="px-4 py-3 sm:px-6">
          <PostCollectionFilters onFiltersChange={handleFiltersChange} hidePeriod />
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
          <CollectionListPageSkeleton titleWidth="w-24" descriptionWidth="w-72" tone="neutral" />
        ) : !isEmpty ? (
          <>
            <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  href={`/drafts/${collection.id}`}
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
          <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-12 text-center shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]">
              <CheckCheck className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
            </div>
            <p className="mt-4 text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">Approval queue is clear</p>
            <p className="mt-1 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              New editor submissions will appear here as they enter review.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
