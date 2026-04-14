"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  CalendarClock,
  FileImage,
  FileText,
  FolderOpen,
  LibraryBig,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  UpsertWorkspaceLibraryBundleRequest,
  UpsertWorkspaceLibraryItemRequest,
  WorkspaceLibraryBundle,
  WorkspaceLibraryItem,
  WorkspaceLibraryItemStatus,
  WorkspaceLibraryItemType,
  WorkspaceLibraryMedia,
  WorkspaceLibraryPostCollectionType,
  WorkspaceLibrarySnippetTarget,
  WorkspaceLibraryResponse,
} from "@/model/WorkspaceLibrary";
import { getPresignedUrl } from "@/service/presignUrl";
import { uploadToS3 } from "@/service/uploadToS3";
import {
  createWorkspaceLibraryBundleApi,
  createWorkspaceLibraryItemApi,
  deleteWorkspaceLibraryBundleApi,
  deleteWorkspaceLibraryItemApi,
  getWorkspaceLibraryApi,
  updateWorkspaceLibraryBundleApi,
  updateWorkspaceLibraryItemApi,
} from "@/service/workspaceLibrary";
import { useRole } from "@/hooks/useRole";

const ITEM_TYPES: WorkspaceLibraryItemType[] = ["MEDIA_ASSET", "SNIPPET", "TEMPLATE"];
const ITEM_STATUSES: WorkspaceLibraryItemStatus[] = ["DRAFT", "APPROVED", "ARCHIVED"];
const POST_COLLECTION_TYPES: WorkspaceLibraryPostCollectionType[] = ["IMAGE", "VIDEO", "TEXT"];
const SNIPPET_TARGETS: WorkspaceLibrarySnippetTarget[] = ["CAPTION", "FIRST_COMMENT"];
const FILTER_ALL = "ALL";

const pageClassName = "min-h-screen bg-[var(--ds-background-200)]";
const sectionCardClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const sectionHeaderClassName = "border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3";
const nestedCardClassName = "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
const nestedPanelClassName = "rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]";
const dashedPanelClassName =
  "rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
const emptyStateClassName =
  "rounded-lg border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-6 text-copy-14 text-[var(--ds-gray-900)]";
const noticeClassName = "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-4";
const sectionTitleClassName = "text-heading-16 text-[var(--ds-gray-1000)]";
const sectionDescriptionClassName = "mt-1 text-copy-13 text-[var(--ds-gray-900)]";
const labelClassName = "text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]";
const itemTitleClassName = "text-label-14 text-[var(--ds-gray-1000)]";
const bodyTextClassName = "text-copy-14 text-[var(--ds-gray-900)]";
const quietTextClassName = "text-copy-12 text-[var(--ds-gray-900)]";
const buttonFocusClassName =
  "focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const outlineButtonClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";
const primaryButtonClassName =
  "bg-[hsl(var(--accent))] !text-white shadow-none hover:bg-[hsl(var(--accent-hover))]";
const ghostButtonClassName =
  "text-[var(--ds-gray-900)] shadow-none hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]";
const destructiveButtonClassName =
  "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)] shadow-none hover:border-[var(--ds-red-300)] hover:bg-[var(--ds-red-100)]";
const tabsListClassName =
  "grid w-full max-w-md grid-cols-2 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-1 text-[var(--ds-gray-900)]";
const tabsTriggerClassName =
  "rounded-md text-label-14 text-[var(--ds-gray-900)] data-[state=active]:bg-[var(--ds-background-100)] data-[state=active]:text-[var(--ds-gray-1000)] data-[state=active]:shadow-none";
const inputClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-900)] shadow-none focus-visible:border-[hsl(var(--accent))] focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const selectClassName =
  "flex h-10 w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-sm text-[var(--ds-gray-1000)] shadow-none outline-none transition-[border-color,box-shadow,background-color] focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]";
const checkboxClassName =
  "border-[var(--ds-gray-500)] data-[state=checked]:border-[hsl(var(--accent))] data-[state=checked]:bg-[hsl(var(--accent))] data-[state=checked]:text-white";
const searchIconClassName =
  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ds-gray-900)]";
const iconBadgeClassName =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]";
const listRowClassName = "flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3";

interface ItemEditorState {
  itemType: WorkspaceLibraryItemType;
  status: WorkspaceLibraryItemStatus;
  name: string;
  folderName: string;
  description: string;
  body: string;
  snippetTarget: WorkspaceLibrarySnippetTarget;
  postCollectionType: WorkspaceLibraryPostCollectionType;
  tagsInput: string;
  usageNotes: string;
  internalNotes: string;
  expiresAtInput: string;
  platformConfigsText: string;
}

interface BundleEditorState {
  name: string;
  description: string;
  campaignLabel: string;
  itemIds: number[];
}

function emptyItemEditor(): ItemEditorState {
  return {
    itemType: "MEDIA_ASSET",
    status: "DRAFT",
    name: "",
    folderName: "",
    description: "",
    body: "",
    snippetTarget: "CAPTION",
    postCollectionType: "IMAGE",
    tagsInput: "",
    usageNotes: "",
    internalNotes: "",
    expiresAtInput: "",
    platformConfigsText: "",
  };
}

function emptyBundleEditor(): BundleEditorState {
  return {
    name: "",
    description: "",
    campaignLabel: "",
    itemIds: [],
  };
}

function formatTimestamp(value?: string | null): string {
  if (!value) {
    return "Not set";
  }
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toLocalDateTimeValue(value?: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function parseTags(value: string): string[] {
  if (!value.trim()) {
    return [];
  }
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function prettyItemType(item: WorkspaceLibraryItem): string {
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
  return WandSparkles;
}

function canShowTemplatePlatformConfigs(editor: ItemEditorState): boolean {
  return editor.itemType === "TEMPLATE";
}

function canShowSnippetTarget(editor: ItemEditorState): boolean {
  return editor.itemType === "SNIPPET";
}

function canShowPostType(editor: ItemEditorState): boolean {
  return editor.itemType !== "SNIPPET";
}

function canShowMedia(editor: ItemEditorState): boolean {
  return editor.itemType === "MEDIA_ASSET";
}

function badgeToneClassName(tone: "neutral" | "accent" | "green" | "amber" | "red"): string {
  switch (tone) {
    case "accent":
      return "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
    case "green":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "amber":
      return "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]";
    case "red":
      return "border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
    default:
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
  }
}

function statusBadgeClassName(status: WorkspaceLibraryItemStatus): string {
  if (status === "APPROVED") {
    return badgeToneClassName("green");
  }
  if (status === "ARCHIVED") {
    return badgeToneClassName("red");
  }
  return badgeToneClassName("neutral");
}

function usableBadgeClassName(item: WorkspaceLibraryItem): string {
  if (item.usable) {
    return badgeToneClassName("accent");
  }
  if (item.status === "ARCHIVED" || item.expired) {
    return badgeToneClassName("red");
  }
  return badgeToneClassName("amber");
}

function itemMatchesQuery(item: WorkspaceLibraryItem, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = [
    item.name,
    item.folderName,
    item.description,
    item.body,
    item.usageNotes,
    item.internalNotes,
    item.status,
    item.itemType,
    item.postCollectionType,
    item.snippetTarget,
    ...item.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function bundleMatchesQuery(bundle: WorkspaceLibraryBundle, query: string): boolean {
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

export function WorkspaceLibraryManager() {
  const { getToken } = useAuth();
  const { canManageAssetLibrary, canWrite } = useRole();
  const [library, setLibrary] = useState<WorkspaceLibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState<string>(FILTER_ALL);
  const [itemStatusFilter, setItemStatusFilter] = useState<string>(FILTER_ALL);
  const [usableOnly, setUsableOnly] = useState(false);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemEditor, setItemEditor] = useState<ItemEditorState>(emptyItemEditor());
  const [existingMedia, setExistingMedia] = useState<WorkspaceLibraryMedia[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [savingItem, setSavingItem] = useState(false);

  const [editingBundleId, setEditingBundleId] = useState<number | null>(null);
  const [bundleEditor, setBundleEditor] = useState<BundleEditorState>(emptyBundleEditor());
  const [savingBundle, setSavingBundle] = useState(false);

  async function loadLibrary(showRefreshing = false) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setLibrary(await getWorkspaceLibraryApi(getToken, false));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load the asset library.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredItems = useMemo(
    () =>
      (library?.items ?? []).filter((item) => {
        if (!itemMatchesQuery(item, normalizedQuery)) {
          return false;
        }
        if (itemTypeFilter !== FILTER_ALL && item.itemType !== itemTypeFilter) {
          return false;
        }
        if (itemStatusFilter !== FILTER_ALL && item.status !== itemStatusFilter) {
          return false;
        }
        if (usableOnly && !item.usable) {
          return false;
        }
        return true;
      }),
    [itemStatusFilter, itemTypeFilter, library, normalizedQuery, usableOnly]
  );

  const filteredBundles = useMemo(
    () => (library?.bundles ?? []).filter((bundle) => bundleMatchesQuery(bundle, normalizedQuery)),
    [library, normalizedQuery]
  );

  function resetItemEditor(nextType?: WorkspaceLibraryItemType) {
    const next = emptyItemEditor();
    if (nextType) {
      next.itemType = nextType;
      next.postCollectionType = nextType === "TEMPLATE" ? "TEXT" : "IMAGE";
    }
    setEditingItemId(null);
    setExistingMedia([]);
    setNewMediaFiles([]);
    setItemEditor(next);
  }

  function resetBundleEditor() {
    setEditingBundleId(null);
    setBundleEditor(emptyBundleEditor());
  }

  function startEditItem(item: WorkspaceLibraryItem) {
    setEditingItemId(item.id);
    setExistingMedia(item.media);
    setNewMediaFiles([]);
    setItemEditor({
      itemType: item.itemType,
      status: item.status,
      name: item.name,
      folderName: item.folderName ?? "",
      description: item.description ?? "",
      body: item.body ?? "",
      snippetTarget: item.snippetTarget ?? "CAPTION",
      postCollectionType: item.postCollectionType ?? "TEXT",
      tagsInput: item.tags.join(", "),
      usageNotes: item.usageNotes ?? "",
      internalNotes: item.internalNotes ?? "",
      expiresAtInput: toLocalDateTimeValue(item.expiresAt),
      platformConfigsText: item.platformConfigs ? JSON.stringify(item.platformConfigs, null, 2) : "",
    });
    setActiveTab("items");
  }

  function startEditBundle(bundle: WorkspaceLibraryBundle) {
    setEditingBundleId(bundle.id);
    setBundleEditor({
      name: bundle.name,
      description: bundle.description ?? "",
      campaignLabel: bundle.campaignLabel ?? "",
      itemIds: bundle.itemIds,
    });
    setActiveTab("bundles");
  }

  function updateItemEditor<K extends keyof ItemEditorState>(key: K, value: ItemEditorState[K]) {
    if (key === "itemType" && value !== "MEDIA_ASSET") {
      setExistingMedia([]);
      setNewMediaFiles([]);
    }
    setItemEditor((current) => {
      const next = { ...current, [key]: value };
      if (key === "itemType") {
        if (value === "SNIPPET") {
          next.postCollectionType = "TEXT";
          next.platformConfigsText = "";
        }
        if (value === "TEMPLATE" && current.itemType === "SNIPPET") {
          next.postCollectionType = "TEXT";
        }
      }
      return next;
    });
  }

  async function submitItem() {
    if (!canManageAssetLibrary) {
      return;
    }

    let platformConfigs: Record<string, any> | null = null;
    if (itemEditor.platformConfigsText.trim()) {
      try {
        const parsed = JSON.parse(itemEditor.platformConfigsText);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          toast.error("Platform settings JSON must be an object.");
          return;
        }
        platformConfigs = parsed;
      } catch {
        toast.error("Platform settings JSON is invalid.");
        return;
      }
    }

    if (!itemEditor.name.trim()) {
      toast.error("Library item name is required.");
      return;
    }

    if (itemEditor.itemType === "MEDIA_ASSET" && existingMedia.length + newMediaFiles.length === 0) {
      toast.error("Media assets require at least one file.");
      return;
    }

    if (itemEditor.itemType === "SNIPPET" && !itemEditor.body.trim()) {
      toast.error("Snippets require content.");
      return;
    }

    if (
      itemEditor.itemType === "TEMPLATE" &&
      !itemEditor.body.trim() &&
      !platformConfigs
    ) {
      toast.error("Templates need body content or platform settings.");
      return;
    }

    setSavingItem(true);
    try {
      const uploadedMedia: WorkspaceLibraryMedia[] = [];
      for (const file of newMediaFiles) {
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUrl(file, getToken);
        await uploadToS3(uploadUrl, file);
        uploadedMedia.push({
          fileName: file.name,
          mimeType: file.type,
          fileKey,
          size: file.size,
          fileUrl,
        });
      }

      const payload: UpsertWorkspaceLibraryItemRequest = {
        itemType: itemEditor.itemType,
        status: itemEditor.status,
        name: itemEditor.name.trim(),
        folderName: itemEditor.folderName.trim() || null,
        description: itemEditor.description.trim() || null,
        body: itemEditor.body.trim() || null,
        snippetTarget: itemEditor.itemType === "SNIPPET" ? itemEditor.snippetTarget : null,
        postCollectionType: itemEditor.itemType === "SNIPPET" ? null : itemEditor.postCollectionType,
        tags: parseTags(itemEditor.tagsInput),
        media:
          itemEditor.itemType === "MEDIA_ASSET"
            ? [...existingMedia, ...uploadedMedia].map((media) => ({
                fileName: media.fileName,
                mimeType: media.mimeType,
                fileKey: media.fileKey,
                size: media.size,
              }))
            : [],
        platformConfigs: itemEditor.itemType === "TEMPLATE" ? platformConfigs : null,
        usageNotes: itemEditor.usageNotes.trim() || null,
        internalNotes: itemEditor.internalNotes.trim() || null,
        expiresAt: itemEditor.expiresAtInput ? new Date(itemEditor.expiresAtInput).toISOString() : null,
      };

      if (editingItemId === null) {
        await createWorkspaceLibraryItemApi(getToken, payload);
        toast.success("Library item created.");
      } else {
        await updateWorkspaceLibraryItemApi(getToken, editingItemId, payload);
        toast.success("Library item updated.");
      }

      resetItemEditor();
      await loadLibrary(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save library item.");
    } finally {
      setSavingItem(false);
    }
  }

  async function deleteItem(item: WorkspaceLibraryItem) {
    if (!canManageAssetLibrary) {
      return;
    }
    if (!window.confirm(`Delete "${item.name}" from the asset library?`)) {
      return;
    }
    try {
      await deleteWorkspaceLibraryItemApi(getToken, item.id);
      if (editingItemId === item.id) {
        resetItemEditor();
      }
      toast.success("Library item deleted.");
      await loadLibrary(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete library item.");
    }
  }

  async function submitBundle() {
    if (!canManageAssetLibrary) {
      return;
    }
    if (!bundleEditor.name.trim()) {
      toast.error("Bundle name is required.");
      return;
    }
    if (bundleEditor.itemIds.length === 0) {
      toast.error("Bundles need at least one library item.");
      return;
    }

    setSavingBundle(true);
    try {
      const payload: UpsertWorkspaceLibraryBundleRequest = {
        name: bundleEditor.name.trim(),
        description: bundleEditor.description.trim() || null,
        campaignLabel: bundleEditor.campaignLabel.trim() || null,
        itemIds: bundleEditor.itemIds,
      };

      if (editingBundleId === null) {
        await createWorkspaceLibraryBundleApi(getToken, payload);
        toast.success("Bundle created.");
      } else {
        await updateWorkspaceLibraryBundleApi(getToken, editingBundleId, payload);
        toast.success("Bundle updated.");
      }

      resetBundleEditor();
      await loadLibrary(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save bundle.");
    } finally {
      setSavingBundle(false);
    }
  }

  async function deleteBundle(bundle: WorkspaceLibraryBundle) {
    if (!canManageAssetLibrary) {
      return;
    }
    if (!window.confirm(`Delete bundle "${bundle.name}"?`)) {
      return;
    }
    try {
      await deleteWorkspaceLibraryBundleApi(getToken, bundle.id);
      if (editingBundleId === bundle.id) {
        resetBundleEditor();
      }
      toast.success("Bundle deleted.");
      await loadLibrary(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete bundle.");
    }
  }

  return (
    <div className={pageClassName}>
      <ProtectedPageHeader
        title="Asset Library"
        description="Manage reusable assets, snippets, templates, tags, expiry dates, and campaign bundles for this workspace."
        icon={<LibraryBig className="h-4 w-4" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadLibrary(true)}
              disabled={refreshing}
              className={cn(outlineButtonClassName, buttonFocusClassName)}
            >
              <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild size="sm" className={cn(primaryButtonClassName, buttonFocusClassName)}>
              <Link href="/schedule-post">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Use In Composer
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {!canManageAssetLibrary && (
          <div className={cn(noticeClassName, bodyTextClassName)}>
            <p className="text-heading-16 text-[var(--ds-gray-1000)]">Browse-only access</p>
            <p className="mt-1">
              You can search approved assets, snippets, templates, and bundles here. Creating or editing library
              content requires the `MANAGE_ASSET_LIBRARY` capability.
            </p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={tabsListClassName}>
            <TabsTrigger value="items" className={cn(tabsTriggerClassName, buttonFocusClassName)}>
              Items
            </TabsTrigger>
            <TabsTrigger value="bundles" className={cn(tabsTriggerClassName, buttonFocusClassName)}>
              Bundles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {canManageAssetLibrary && (
              <section className={sectionCardClassName}>
                <div className={sectionHeaderClassName}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className={sectionTitleClassName}>
                        {editingItemId === null ? "Create Library Item" : "Edit Library Item"}
                      </p>
                      <p className={sectionDescriptionClassName}>
                        Build reusable media assets, snippets, and templates with approval status, tags, and expiry.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ITEM_TYPES.map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateItemEditor("itemType", type)}
                          className={cn(
                            itemEditor.itemType === type
                              ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)] shadow-none hover:bg-[var(--ds-plum-100)] hover:text-[var(--ds-plum-700)]"
                              : outlineButtonClassName,
                            buttonFocusClassName
                          )}
                        >
                          {type === "MEDIA_ASSET" ? "Asset" : type === "SNIPPET" ? "Snippet" : "Template"}
                        </Button>
                      ))}
                      {(editingItemId !== null || itemEditor.name || itemEditor.description || itemEditor.body) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => resetItemEditor()}
                          className={cn(ghostButtonClassName, buttonFocusClassName)}
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className={labelClassName}>Name</span>
                    <Input
                      value={itemEditor.name}
                      onChange={(event) => updateItemEditor("name", event.target.value)}
                      placeholder="Quarterly launch image set"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClassName}>Folder</span>
                    <Input
                      value={itemEditor.folderName}
                      onChange={(event) => updateItemEditor("folderName", event.target.value)}
                      placeholder="Brand / Q2"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClassName}>Status</span>
                    <select
                      value={itemEditor.status}
                      onChange={(event) =>
                        updateItemEditor("status", event.target.value as WorkspaceLibraryItemStatus)
                      }
                      className={selectClassName}
                    >
                      {ITEM_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  {canShowPostType(itemEditor) && (
                    <label className="space-y-2">
                      <span className={labelClassName}>Content Type</span>
                      <select
                        value={itemEditor.postCollectionType}
                        onChange={(event) =>
                          updateItemEditor(
                            "postCollectionType",
                            event.target.value as WorkspaceLibraryPostCollectionType
                          )
                        }
                        className={selectClassName}
                      >
                        {POST_COLLECTION_TYPES.filter((type) =>
                          itemEditor.itemType === "MEDIA_ASSET" ? type !== "TEXT" : true
                        ).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {canShowSnippetTarget(itemEditor) && (
                    <label className="space-y-2">
                      <span className={labelClassName}>Snippet Target</span>
                      <select
                        value={itemEditor.snippetTarget}
                        onChange={(event) =>
                          updateItemEditor("snippetTarget", event.target.value as WorkspaceLibrarySnippetTarget)
                        }
                        className={selectClassName}
                      >
                        {SNIPPET_TARGETS.map((target) => (
                          <option key={target} value={target}>
                            {target}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="space-y-2 lg:col-span-2">
                    <span className={labelClassName}>Description</span>
                    <Textarea
                      value={itemEditor.description}
                      onChange={(event) => updateItemEditor("description", event.target.value)}
                      placeholder="How this library item should be used"
                      className={inputClassName}
                    />
                  </label>
                  {itemEditor.itemType !== "MEDIA_ASSET" && (
                    <label className="space-y-2 lg:col-span-2">
                      <span className={labelClassName}>Body Content</span>
                      <Textarea
                        value={itemEditor.body}
                        onChange={(event) => updateItemEditor("body", event.target.value)}
                        placeholder={
                          itemEditor.itemType === "SNIPPET"
                            ? "Enter the reusable snippet text"
                            : "Enter the default caption or template body"
                        }
                        className={cn("min-h-[8.75rem]", inputClassName)}
                      />
                    </label>
                  )}
                  {canShowTemplatePlatformConfigs(itemEditor) && (
                    <label className="space-y-2 lg:col-span-2">
                      <span className={labelClassName}>Platform Settings JSON</span>
                      <Textarea
                        value={itemEditor.platformConfigsText}
                        onChange={(event) => updateItemEditor("platformConfigsText", event.target.value)}
                        placeholder='{"instagram":{"firstComment":"Comment text"}}'
                        className={cn("min-h-[8.75rem] font-mono", inputClassName)}
                      />
                    </label>
                  )}
                  {canShowMedia(itemEditor) && (
                    <div className="space-y-3 lg:col-span-2">
                      <div>
                        <p className={labelClassName}>Media Files</p>
                        <p className={cn("mt-1", quietTextClassName)}>
                          Upload reusable approved {itemEditor.postCollectionType.toLowerCase()} files for the workspace.
                        </p>
                      </div>

                      {existingMedia.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {existingMedia.map((media) => (
                            <div key={media.fileKey} className={cn("overflow-hidden", nestedCardClassName)}>
                              <div className="relative h-36 bg-[var(--ds-background-100)]">
                                {media.mimeType.startsWith("video/") ? (
                                  <video src={media.fileUrl ?? undefined} className="h-full w-full object-contain" muted />
                                ) : media.fileUrl ? (
                                  <Image src={media.fileUrl} alt={media.fileName} fill className="object-contain" />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <FileImage className="h-6 w-6 text-[var(--ds-gray-900)]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-start justify-between gap-2 px-3 py-3">
                                <div className="min-w-0">
                                  <p className={cn("truncate", itemTitleClassName)}>{media.fileName}</p>
                                  <p className={cn("truncate", quietTextClassName)}>{media.mimeType}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setExistingMedia((current) =>
                                      current.filter((entry) => entry.fileKey !== media.fileKey)
                                    )
                                  }
                                  className={cn(ghostButtonClassName, buttonFocusClassName)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={cn("px-4 py-4", dashedPanelClassName)}>
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
                          <input
                            type="file"
                            accept={itemEditor.postCollectionType === "VIDEO" ? "video/*" : "image/*"}
                            multiple={itemEditor.postCollectionType !== "VIDEO"}
                            className="hidden"
                            onChange={(event) => {
                              const files = Array.from(event.target.files ?? []);
                              setNewMediaFiles((current) =>
                                itemEditor.postCollectionType === "VIDEO"
                                  ? files.slice(0, 1)
                                  : [...current, ...files]
                              );
                              event.currentTarget.value = "";
                            }}
                          />
                          <Plus className="h-5 w-5 text-[var(--ds-plum-700)]" />
                          <p className="text-label-14 text-[var(--ds-gray-1000)]">
                            Upload {itemEditor.postCollectionType === "VIDEO" ? "video" : "image"} asset
                            {itemEditor.postCollectionType === "VIDEO" ? "" : "s"}
                          </p>
                          <p className={quietTextClassName}>
                            Files are uploaded to secure workspace storage and become reusable once approved.
                          </p>
                        </label>

                        {newMediaFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {newMediaFiles.map((file) => (
                              <div
                                key={`${file.name}-${file.size}`}
                                className={cn("flex items-center justify-between px-3 py-2", nestedPanelClassName)}
                              >
                                <div className="min-w-0">
                                  <p className={cn("truncate", itemTitleClassName)}>{file.name}</p>
                                  <p className={quietTextClassName}>{file.type}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setNewMediaFiles((current) =>
                                      current.filter((entry) => entry !== file)
                                    )
                                  }
                                  className={cn(ghostButtonClassName, buttonFocusClassName)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <label className="space-y-2">
                    <span className={labelClassName}>Tags</span>
                    <Input
                      value={itemEditor.tagsInput}
                      onChange={(event) => updateItemEditor("tagsInput", event.target.value)}
                      placeholder="approved, q2, evergreen"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClassName}>Expires At</span>
                    <Input
                      type="datetime-local"
                      value={itemEditor.expiresAtInput}
                      onChange={(event) => updateItemEditor("expiresAtInput", event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClassName}>Usage Notes</span>
                    <Textarea
                      value={itemEditor.usageNotes}
                      onChange={(event) => updateItemEditor("usageNotes", event.target.value)}
                      placeholder="Client-safe usage notes"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClassName}>Internal Notes</span>
                    <Textarea
                      value={itemEditor.internalNotes}
                      onChange={(event) => updateItemEditor("internalNotes", event.target.value)}
                      placeholder="Internal review notes"
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--ds-gray-400)] px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetItemEditor()}
                    className={cn(outlineButtonClassName, buttonFocusClassName)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void submitItem()}
                    disabled={savingItem}
                    className={cn(primaryButtonClassName, buttonFocusClassName)}
                  >
                    {savingItem ? "Saving..." : editingItemId === null ? "Create Item" : "Save Changes"}
                  </Button>
                </div>
              </section>
            )}

            <section className={sectionCardClassName}>
              <div className={sectionHeaderClassName}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={sectionTitleClassName}>Search Library Items</p>
                    <p className={sectionDescriptionClassName}>
                      Filter by type, approval state, tags, notes, or usability.
                    </p>
                  </div>
                  {canManageAssetLibrary && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetItemEditor("MEDIA_ASSET")}
                        className={cn(outlineButtonClassName, buttonFocusClassName)}
                      >
                        New Asset
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetItemEditor("SNIPPET")}
                        className={cn(outlineButtonClassName, buttonFocusClassName)}
                      >
                        New Snippet
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetItemEditor("TEMPLATE")}
                        className={cn(outlineButtonClassName, buttonFocusClassName)}
                      >
                        New Template
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_13.75rem_13.75rem_auto]">
                <div className="relative">
                  <Search className={searchIconClassName} />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search item names, tags, notes, or content"
                    className={cn("pl-9", inputClassName)}
                  />
                </div>
                <select
                  value={itemTypeFilter}
                  onChange={(event) => setItemTypeFilter(event.target.value)}
                  className={selectClassName}
                >
                  <option value={FILTER_ALL}>All types</option>
                  {ITEM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={itemStatusFilter}
                  onChange={(event) => setItemStatusFilter(event.target.value)}
                  className={selectClassName}
                >
                  <option value={FILTER_ALL}>All statuses</option>
                  {ITEM_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-copy-14 text-[var(--ds-gray-1000)]">
                  <Checkbox
                    checked={usableOnly}
                    onCheckedChange={(checked) => setUsableOnly(Boolean(checked))}
                    className={cn(checkboxClassName, buttonFocusClassName)}
                  />
                  <span>Usable only</span>
                </label>
              </div>

              <div className="space-y-4 px-4 pb-4">
                {loading ? (
                  <div className={emptyStateClassName}>Loading library items...</div>
                ) : filteredItems.length === 0 ? (
                  <div className={emptyStateClassName}>No library items match the current filters.</div>
                ) : (
                  filteredItems.map((item) => {
                    const Icon = itemTypeIcon(item);
                    return (
                      <div key={item.id} className={cn("px-4 py-4", nestedCardClassName)}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className={iconBadgeClassName}>
                                <Icon className="h-4 w-4 text-[var(--ds-plum-700)]" />
                              </div>
                              <div>
                                <p className={itemTitleClassName}>{item.name}</p>
                                <p className={quietTextClassName}>{prettyItemType(item)}</p>
                              </div>
                              <Badge variant="outline" className={statusBadgeClassName(item.status)}>
                                {item.status}
                              </Badge>
                              <Badge variant="outline" className={usableBadgeClassName(item)}>
                                {item.usable ? "Usable" : item.expired ? "Expired" : "Not usable"}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {item.folderName && (
                                <Badge variant="outline" className={badgeToneClassName("neutral")}>
                                  <FolderOpen className="mr-1 h-3 w-3" />
                                  {item.folderName}
                                </Badge>
                              )}
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className={badgeToneClassName("neutral")}>
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {item.description && (
                              <p className={bodyTextClassName}>{item.description}</p>
                            )}

                            {item.body && (
                              <p className={cn("whitespace-pre-wrap", bodyTextClassName)}>{item.body}</p>
                            )}

                            {item.itemType === "MEDIA_ASSET" && item.media.length > 0 && (
                              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {item.media.slice(0, 3).map((media) => (
                                  <div key={media.fileKey} className={cn("overflow-hidden", nestedPanelClassName)}>
                                    <div className="relative h-28 bg-[var(--ds-gray-100)]">
                                      {media.mimeType.startsWith("video/") ? (
                                        <video
                                          src={media.fileUrl ?? undefined}
                                          className="h-full w-full object-contain"
                                          muted
                                        />
                                        ) : media.fileUrl ? (
                                          <Image src={media.fileUrl} alt={media.fileName} fill className="object-contain" />
                                        ) : (
                                          <div className="flex h-full items-center justify-center">
                                          <FileImage className="h-5 w-5 text-[var(--ds-gray-900)]" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="px-3 py-2">
                                      <p className={cn("truncate", quietTextClassName)}>{media.fileName}</p>
                                      <p className={cn("truncate", quietTextClassName)}>{media.mimeType}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className={cn("flex flex-wrap gap-4", quietTextClassName)}>
                              <span>Updated {formatTimestamp(item.updatedAt)}</span>
                              {item.expiresAt && (
                                <span className="inline-flex items-center gap-1">
                                  <CalendarClock className="h-3.5 w-3.5" />
                                  Expires {formatTimestamp(item.expiresAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          {canManageAssetLibrary && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => startEditItem(item)}
                                className={cn(outlineButtonClassName, buttonFocusClassName)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void deleteItem(item)}
                                className={cn(destructiveButtonClassName, buttonFocusClassName)}
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="bundles" className="space-y-6">
            {canManageAssetLibrary && (
              <section className={sectionCardClassName}>
                <div className={sectionHeaderClassName}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className={sectionTitleClassName}>
                        {editingBundleId === null ? "Create Bundle" : "Edit Bundle"}
                      </p>
                      <p className={sectionDescriptionClassName}>
                        Group related snippets, templates, and media into campaign-ready bundles.
                      </p>
                    </div>
                    {(editingBundleId !== null || bundleEditor.name || bundleEditor.description) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => resetBundleEditor()}
                        className={cn(ghostButtonClassName, buttonFocusClassName)}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className={labelClassName}>Name</span>
                    <Input
                      value={bundleEditor.name}
                      onChange={(event) =>
                        setBundleEditor((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Spring product launch kit"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClassName}>Campaign Label</span>
                    <Input
                      value={bundleEditor.campaignLabel}
                      onChange={(event) =>
                        setBundleEditor((current) => ({ ...current, campaignLabel: event.target.value }))
                      }
                      placeholder="Spring Launch"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className={labelClassName}>Description</span>
                    <Textarea
                      value={bundleEditor.description}
                      onChange={(event) =>
                        setBundleEditor((current) => ({ ...current, description: event.target.value }))
                      }
                      placeholder="What this bundle is for and when it should be used"
                      className={inputClassName}
                    />
                  </label>
                  <div className="space-y-2 lg:col-span-2">
                    <div>
                      <p className={labelClassName}>Bundle Items</p>
                      <p className={cn("mt-1", quietTextClassName)}>
                        Choose snippets, templates, and assets that belong together for a reusable campaign package.
                      </p>
                    </div>
                    <ScrollArea className="h-72 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                      <div className="space-y-2 p-3">
                        {(library?.items ?? []).map((item) => (
                          <label key={item.id} className={listRowClassName}>
                            <Checkbox
                              checked={bundleEditor.itemIds.includes(item.id)}
                              onCheckedChange={(checked) =>
                                setBundleEditor((current) => ({
                                  ...current,
                                  itemIds: checked
                                    ? [...current.itemIds, item.id]
                                    : current.itemIds.filter((value) => value !== item.id),
                                }))
                              }
                              className={cn(checkboxClassName, buttonFocusClassName)}
                            />
                            <div className="min-w-0">
                              <p className={itemTitleClassName}>{item.name}</p>
                              <p className={quietTextClassName}>{prettyItemType(item)}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline" className={statusBadgeClassName(item.status)}>
                                  {item.status}
                                </Badge>
                                <Badge variant="outline" className={usableBadgeClassName(item)}>
                                  {item.usable ? "Usable" : item.expired ? "Expired" : "Not usable"}
                                </Badge>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--ds-gray-400)] px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetBundleEditor()}
                    className={cn(outlineButtonClassName, buttonFocusClassName)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void submitBundle()}
                    disabled={savingBundle}
                    className={cn(primaryButtonClassName, buttonFocusClassName)}
                  >
                    {savingBundle ? "Saving..." : editingBundleId === null ? "Create Bundle" : "Save Changes"}
                  </Button>
                </div>
              </section>
            )}

            <section className={sectionCardClassName}>
              <div className={sectionHeaderClassName}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={sectionTitleClassName}>Search Bundles</p>
                    <p className={sectionDescriptionClassName}>
                      Browse campaign bundles by label, contents, or related tags.
                    </p>
                  </div>
                  {canManageAssetLibrary && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => resetBundleEditor()}
                      className={cn(outlineButtonClassName, buttonFocusClassName)}
                    >
                      New Bundle
                    </Button>
                  )}
                </div>
              </div>
              <div className="px-4 py-4">
                <div className="relative">
                  <Search className={searchIconClassName} />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search bundle names, labels, items, or tags"
                    className={cn("pl-9", inputClassName)}
                  />
                </div>
              </div>

              <div className="space-y-4 px-4 pb-4">
                {loading ? (
                  <div className={emptyStateClassName}>Loading bundles...</div>
                ) : filteredBundles.length === 0 ? (
                  <div className={emptyStateClassName}>No bundles match the current search.</div>
                ) : (
                  filteredBundles.map((bundle) => (
                    <div key={bundle.id} className={cn("px-4 py-4", nestedCardClassName)}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className={iconBadgeClassName}>
                              <Boxes className="h-4 w-4 text-[var(--ds-plum-700)]" />
                            </div>
                            <div>
                              <p className={itemTitleClassName}>{bundle.name}</p>
                              <p className={quietTextClassName}>
                                {bundle.items.length} library item{bundle.items.length === 1 ? "" : "s"}
                              </p>
                            </div>
                            {bundle.campaignLabel && (
                              <Badge variant="outline" className={badgeToneClassName("neutral")}>
                                {bundle.campaignLabel}
                              </Badge>
                            )}
                          </div>

                          {bundle.description && (
                            <p className={bodyTextClassName}>{bundle.description}</p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {bundle.items.map((item) => (
                              <Badge key={item.id} variant="outline" className={badgeToneClassName("neutral")}>
                                {item.name}
                              </Badge>
                            ))}
                          </div>

                          <div className={cn("flex flex-wrap gap-4", quietTextClassName)}>
                            <span>Updated {formatTimestamp(bundle.updatedAt)}</span>
                          </div>
                        </div>

                        {canManageAssetLibrary && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEditBundle(bundle)}
                              className={cn(outlineButtonClassName, buttonFocusClassName)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void deleteBundle(bundle)}
                              className={cn(destructiveButtonClassName, buttonFocusClassName)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {!canWrite && !canManageAssetLibrary && (
          <div className={cn(noticeClassName, bodyTextClassName)}>
            The composer integration for library assets is available to members who can create or edit content.
          </div>
        )}
      </div>
    </div>
  );
}
