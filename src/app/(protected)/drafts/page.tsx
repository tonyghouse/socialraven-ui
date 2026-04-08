"use client";

import { type ButtonHTMLAttributes, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { BookOpen, FileText, Plus, RefreshCw } from "lucide-react";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { CollectionCard } from "@/components/posts/collection-card";
import { PostCollectionFilters, type SortDir } from "@/components/posts/post-collection-filters";
import { Pagination } from "@/components/generic/pagination";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { DraftsPageSkeleton } from "@/components/drafts/drafts-page-skeleton";
import { cn } from "@/lib/utils";

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
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
  iconOnly?: boolean;
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
            Refresh the list to try loading your drafts again.
          </p>
        </div>
        <ActionButton onClick={onRetry}>Retry</ActionButton>
      </div>
    </div>
  );
}

export default function DraftsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();

  const currentPage = Number.parseInt(searchParams.get("page") ?? "1", 10);

  const [collections, setCollections] = useState<PostCollectionResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
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

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

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

    void loadCollections(currentPage);
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

      void loadCollections(1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, searchParams, router]
  );

  if (loading && collections.length === 0) {
    return <DraftsPageSkeleton />;
  }

  const isEmpty = collections.length === 0 && !loading;
  const collectionSummary =
    totalElements === 0 ? "No drafts" : `${totalElements} saved`;

  return (
    <main className={pageClassName}>
      <ProtectedPageHeader
        title="Drafts"
        description="Review saved draft collections and continue editing when ready."
        icon={<BookOpen className="h-4 w-4" />}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95"
        actions={
          <>
            <ActionButton
              iconOnly
              onClick={() => void loadCollections(currentPage, true)}
              disabled={isRefreshing}
              aria-label="Refresh drafts"
              title="Refresh drafts"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
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
          <StatusBadge variant={totalElements === 0 ? "neutral" : "accent"}>
            {collectionSummary}
          </StatusBadge>
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
        {error ? (
          <div className="mb-6">
            <ErrorNotice message={error} onRetry={() => void loadCollections(currentPage)} />
          </div>
        ) : null}

        {!isEmpty ? (
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

            {totalPages > 1 ? (
              <div className="mt-8 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 py-4 shadow-sm">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  appearance="geist"
                />
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState onCreatePost={() => router.push("/schedule-post")} />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]/95 p-3 backdrop-blur-sm sm:hidden">
        <ActionButton
          tone="primary"
          onClick={() => router.push("/schedule-post")}
          className="w-full"
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
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-title-16 text-[var(--ds-gray-1000)]">No drafts yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-label-14 leading-6 text-[var(--ds-gray-900)]">
        Save work-in-progress posts as drafts. When you&apos;re ready,
        schedule them across all your platforms with a single click.
      </p>
      <div className="mt-6 flex justify-center">
        <ActionButton tone="primary" onClick={onCreatePost}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Create Your First Draft</span>
          </span>
        </ActionButton>
      </div>
    </div>
  );
}
