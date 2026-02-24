"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPaginatedPostsApi } from "@/service/pagingatedPosts";
import { fetchPostCollectionsApi } from "@/service/fetchPostCollections";
import type { PostResponse } from "@/model/PostResponse";
import type { PostCollectionResponse } from "@/model/PostCollectionResponse";
import { useAuth } from "@clerk/nextjs";
import {
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  Layers,
  Plus,
} from "lucide-react";
import { PostCard } from "@/components/posts/post-card";
import { CollectionCard } from "@/components/posts/collection-card";
import { Pagination } from "@/components/generic/pagination";
import { cn } from "@/lib/utils";

type ViewMode = "posts" | "collections";

const REFRESH_INTERVAL = 30 * 1000;

export default function ScheduledPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();

  const view = (searchParams.get("view") ?? "posts") as ViewMode;
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

  // Posts state
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [postsTotalPages, setPostsTotalPages] = useState(0);
  const [postsTotalElements, setPostsTotalElements] = useState(0);

  // Collections state
  const [collections, setCollections] = useState<PostCollectionResponse[]>([]);
  const [collectionsTotalPages, setCollectionsTotalPages] = useState(0);
  const [collectionsTotalElements, setCollectionsTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPageVisibleRef = useRef(true);
  const needsRefreshRef = useRef(false);
  const loadingRef = useRef(false);

  const loadPosts = useCallback(
    async (page: number, isManualRefresh = false) => {
      if (loadingRef.current && !isManualRefresh) return;
      loadingRef.current = true;
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetchPaginatedPostsApi(getToken, page - 1, "SCHEDULED");
        setPosts(res.content);
        setPostsTotalPages(res.totalPages);
        setPostsTotalElements(res.totalElements);
        setLastRefresh(new Date());
        needsRefreshRef.current = false;
      } catch {
        setError("Unable to load scheduled posts. Please try again.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [getToken]
  );

  const loadCollections = useCallback(
    async (page: number, isManualRefresh = false) => {
      if (loadingRef.current && !isManualRefresh) return;
      loadingRef.current = true;
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetchPostCollectionsApi(getToken, page - 1);
        setCollections(res.content);
        setCollectionsTotalPages(res.totalPages);
        setCollectionsTotalElements(res.totalElements);
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

  const loadCurrent = useCallback(
    (page: number, isManual = false) => {
      if (view === "posts") loadPosts(page, isManual);
      else loadCollections(page, isManual);
    },
    [view, loadPosts, loadCollections]
  );

  const handleManualRefresh = () => loadCurrent(currentPage, true);

  const handleViewChange = (newView: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Load on page / view change
  useEffect(() => {
    loadCurrent(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, view]);

  // Auto-refresh
  useEffect(() => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(() => {
      if (isPageVisibleRef.current) loadCurrent(currentPage, true);
      else needsRefreshRef.current = true;
    }, REFRESH_INTERVAL);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, view]);

  // Page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
      if (!document.hidden && needsRefreshRef.current) loadCurrent(currentPage, true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, view]);

  // Derived values for active view
  const totalPages = view === "posts" ? postsTotalPages : collectionsTotalPages;
  const totalElements = view === "posts" ? postsTotalElements : collectionsTotalElements;
  const isEmpty = view === "posts" ? posts.length === 0 : collections.length === 0;

  const formatLastRefresh = () => {
    const diffMins = Math.floor((Date.now() - lastRefresh.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    return `${diffMins} minutes ago`;
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <h1 className="text-[17px] font-semibold text-foreground tracking-tight leading-tight">
                  Scheduled Posts
                </h1>
                <p className="text-xs text-muted-foreground">
                  {totalElements}{" "}
                  {view === "posts"
                    ? `post${totalElements !== 1 ? "s" : ""}`
                    : `collection${totalElements !== 1 ? "s" : ""}`}{" "}
                  scheduled
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:block text-xs text-muted-foreground">
                Updated {formatLastRefresh()}
              </span>

              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 rounded-lg bg-secondary hover:bg-secondary/70 disabled:opacity-50 transition-all flex items-center justify-center group"
                title="Refresh"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors",
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

          {/* View toggle */}
          <div className="pb-3">
            <div className="inline-flex items-center rounded-xl bg-muted/60 p-1 gap-0.5 border border-border/40">
              <ViewTab
                active={view === "posts"}
                onClick={() => handleViewChange("posts")}
                icon={<LayoutGrid className="h-3.5 w-3.5" />}
                label="Posts"
                count={postsTotalElements}
                isActive={view === "posts"}
              />
              <ViewTab
                active={view === "collections"}
                onClick={() => handleViewChange("collections")}
                icon={<Layers className="h-3.5 w-3.5" />}
                label="Collections"
                count={collectionsTotalElements}
                isActive={view === "collections"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => loadCurrent(currentPage)}
                className="text-xs underline mt-1 hover:no-underline opacity-80"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 border border-border/20">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Loading {view === "posts" ? "scheduled posts" : "collections"}…
            </p>
          </div>
        ) : !isEmpty ? (
          <>
            {/* Posts Grid */}
            {view === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Collections Grid */}
            {view === "collections" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            )}

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
          <EmptyState view={view} onCreatePost={() => router.push("/schedule-post")} />
        )}
      </div>
    </main>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ViewTab({
  active,
  onClick,
  icon,
  label,
  count,
  isActive,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? "bg-background text-foreground shadow-sm border border-border/50"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
      {count > 0 && (
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px] font-semibold min-w-[18px] text-center",
            isActive
              ? "bg-primary/10 text-primary"
              : "bg-muted-foreground/15 text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({
  view,
  onCreatePost,
}: {
  view: ViewMode;
  onCreatePost: () => void;
}) {
  const isCollections = view === "collections";

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/3 flex items-center justify-center border border-border/30">
          {isCollections ? (
            <Layers className="w-8 h-8 text-muted-foreground/60" />
          ) : (
            <Calendar className="w-8 h-8 text-muted-foreground/60" />
          )}
        </div>
        <div className="absolute inset-0 rounded-3xl border border-border/20 scale-125 opacity-40" />
        <div className="absolute inset-0 rounded-3xl border border-border/10 scale-150 opacity-25" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
        {isCollections ? "No collections yet" : "No scheduled posts yet"}
      </h3>

      <p className="text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
        {isCollections
          ? "When you schedule content to multiple platforms, it appears here grouped as a collection."
          : "Schedule your content once and publish to all your platforms simultaneously."}
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
