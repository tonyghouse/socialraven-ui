"use client";

import { useAuth } from "@clerk/nextjs";
import { BookTemplate, Boxes, FileImage, FileText, LibraryBig, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { filterRelevantBundleItems, supportsLibraryItemForPostType } from "@/lib/workspace-library";
import type { PostType } from "@/model/PostType";
import type { WorkspaceLibraryBundle, WorkspaceLibraryItem, WorkspaceLibraryResponse } from "@/model/WorkspaceLibrary";
import { getWorkspaceLibraryApi } from "@/service/workspaceLibrary";

function itemTypeLabel(item: WorkspaceLibraryItem): string {
  if (item.itemType === "MEDIA_ASSET") {
    return item.postCollectionType === "VIDEO" ? "Video Asset" : "Image Asset";
  }
  if (item.itemType === "SNIPPET") {
    return item.snippetTarget === "FIRST_COMMENT" ? "First Comment Snippet" : "Caption Snippet";
  }
  return `${item.postCollectionType ?? "Content"} Template`;
}

function itemTypeIcon(item: WorkspaceLibraryItem) {
  if (item.itemType === "MEDIA_ASSET") {
    return FileImage;
  }
  if (item.itemType === "SNIPPET") {
    return FileText;
  }
  return BookTemplate;
}

function queryMatchesItem(item: WorkspaceLibraryItem, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = [
    item.name,
    item.description,
    item.folderName,
    item.body,
    item.usageNotes,
    item.postCollectionType,
    item.snippetTarget,
    ...item.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function queryMatchesBundle(bundle: WorkspaceLibraryBundle, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = [
    bundle.name,
    bundle.description,
    bundle.campaignLabel,
    ...bundle.items.map((item) => item.name),
    ...bundle.items.flatMap((item) => item.tags),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function LibraryComposerPanel({
  postType,
  onApplyItem,
  onApplyBundle,
}: {
  postType: PostType | null;
  onApplyItem: (item: WorkspaceLibraryItem) => Promise<void> | void;
  onApplyBundle: (bundle: WorkspaceLibraryBundle) => Promise<void> | void;
}) {
  const { getToken } = useAuth();
  const [library, setLibrary] = useState<WorkspaceLibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [applyingKey, setApplyingKey] = useState<string | null>(null);

  async function loadLibrary(showRefreshing = false) {
    try {
      setError(null);
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setLibrary(await getWorkspaceLibraryApi(getToken, true));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load the asset library.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(
    () =>
      (library?.items ?? []).filter(
        (item) =>
          item.usable &&
          supportsLibraryItemForPostType(item, postType) &&
          queryMatchesItem(item, normalizedQuery)
      ),
    [library, normalizedQuery, postType]
  );

  const filteredBundles = useMemo(
    () =>
      (library?.bundles ?? []).filter((bundle) => {
        const relevantItems = filterRelevantBundleItems(bundle, postType);
        return relevantItems.length > 0 && queryMatchesBundle(bundle, normalizedQuery);
      }),
    [library, normalizedQuery, postType]
  );

  async function handleApplyItem(item: WorkspaceLibraryItem) {
    const key = `item-${item.id}`;
    setApplyingKey(key);
    try {
      await onApplyItem(item);
    } finally {
      setApplyingKey(null);
    }
  }

  async function handleApplyBundle(bundle: WorkspaceLibraryBundle) {
    const key = `bundle-${bundle.id}`;
    setApplyingKey(key);
    try {
      await onApplyBundle(bundle);
    } finally {
      setApplyingKey(null);
    }
  }

  return (
    <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
      <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Use The Asset Library</p>
            <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">
              Apply approved snippets, templates, reusable assets, and campaign bundles directly into this post.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadLibrary(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--foreground-subtle))]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search templates, snippets, tags, bundles, or campaign labels"
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="rounded-lg border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-6 text-sm text-[hsl(var(--foreground-muted))]">
            Loading approved library items...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5 px-4 py-4 text-sm text-[hsl(var(--destructive))]">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="items">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items">Items ({filteredItems.length})</TabsTrigger>
              <TabsTrigger value="bundles">Bundles ({filteredBundles.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-6 text-sm text-[hsl(var(--foreground-muted))]">
                  No approved library items match this post type and search.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = itemTypeIcon(item);
                  const applyKey = `item-${item.id}`;
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
                              <Icon className="h-4 w-4 text-[hsl(var(--accent))]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.name}</p>
                              <p className="text-xs text-[hsl(var(--foreground-muted))]">{itemTypeLabel(item)}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {item.folderName && <Badge variant="outline">{item.folderName}</Badge>}
                            {item.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && <Badge variant="outline">+{item.tags.length - 3} tags</Badge>}
                          </div>

                          {item.description && (
                            <p className="text-sm text-[hsl(var(--foreground-muted))]">{item.description}</p>
                          )}

                          {item.body && (
                            <p className="line-clamp-3 whitespace-pre-wrap text-sm text-[hsl(var(--foreground-muted))]">
                              {item.body}
                            </p>
                          )}

                          {item.itemType === "MEDIA_ASSET" && item.media.length > 0 && (
                            <p className="text-xs text-[hsl(var(--foreground-subtle))]">
                              {item.media.length} reusable {item.postCollectionType?.toLowerCase()} file
                              {item.media.length === 1 ? "" : "s"} ready to apply
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleApplyItem(item)}
                          disabled={applyingKey === applyKey}
                        >
                          {applyingKey === applyKey ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="bundles" className="space-y-3">
              {filteredBundles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-6 text-sm text-[hsl(var(--foreground-muted))]">
                  No approved bundles match this post type and search.
                </div>
              ) : (
                filteredBundles.map((bundle) => {
                  const relevantItems = filterRelevantBundleItems(bundle, postType);
                  const applyKey = `bundle-${bundle.id}`;
                  return (
                    <div
                      key={bundle.id}
                      className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))]">
                              <Boxes className="h-4 w-4 text-[hsl(var(--accent))]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{bundle.name}</p>
                              <p className="text-xs text-[hsl(var(--foreground-muted))]">
                                {relevantItems.length} relevant approved item{relevantItems.length === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {bundle.campaignLabel && <Badge variant="outline">{bundle.campaignLabel}</Badge>}
                            {relevantItems.slice(0, 3).map((item) => (
                              <Badge key={item.id} variant="outline">
                                {item.name}
                              </Badge>
                            ))}
                            {relevantItems.length > 3 && (
                              <Badge variant="outline">+{relevantItems.length - 3} more</Badge>
                            )}
                          </div>

                          {bundle.description && (
                            <p className="text-sm text-[hsl(var(--foreground-muted))]">{bundle.description}</p>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleApplyBundle(bundle)}
                          disabled={applyingKey === applyKey}
                        >
                          {applyingKey === applyKey ? "Applying..." : "Apply Bundle"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}

        {!loading && !error && (
          <div className="rounded-lg border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--background))] px-4 py-3 text-xs text-[hsl(var(--foreground-subtle))]">
            <div className="flex items-start gap-2">
              <LibraryBig className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                Only approved, non-expired library items are shown here. Manage the full catalog, tags, expiry dates,
                and campaign bundles from the asset library workspace page.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
