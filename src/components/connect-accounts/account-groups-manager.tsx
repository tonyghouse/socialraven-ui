"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import { AccountGroup } from "@/model/AccountGroup";
import {
  fetchAccountGroupsApi,
  createAccountGroupApi,
  updateAccountGroupApi,
  deleteAccountGroupApi,
  addAccountToGroupApi,
  removeAccountFromGroupApi,
} from "@/service/accountGroups";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Users,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import AppleSkeleton from "../generic/AppleSkelton";

// ── Color palette ─────────────────────────────────────────────────────────────

const GROUP_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f97316", // orange
  "#22c55e", // green
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ef4444", // red
];

function pickNextColor(groups: AccountGroup[]): string {
  const used = new Set(groups.map((g) => g.color));
  for (const c of GROUP_COLORS) {
    if (!used.has(c)) return c;
  }
  return GROUP_COLORS[groups.length % GROUP_COLORS.length];
}

// ── Image / initials helpers ──────────────────────────────────────────────────

const PROXY_DOMAINS = ["linkedin.com", "licdn.com"];

function getImgUrl(url?: string | null): string | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  return PROXY_DOMAINS.some((d) => lower.includes(d))
    ? `/api/proxy-image?url=${encodeURIComponent(url)}`
    : url;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Platform badge styles ─────────────────────────────────────────────────────

const PLATFORM_BADGE: Record<string, string> = {
  x: "bg-slate-100 text-slate-600",
  linkedin: "bg-blue-50 text-blue-700",
  youtube: "bg-red-50 text-red-600",
  instagram: "bg-pink-50 text-pink-600",
  facebook: "bg-blue-50 text-blue-800",
};

function platformLabel(platform: string) {
  return platform === "x" ? "X / Twitter" : platform;
}

// ── AccountMiniRow ────────────────────────────────────────────────────────────

function AccountMiniRow({
  acc,
  onRemove,
}: {
  acc: ConnectedAccount;
  onRemove?: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const src = getImgUrl(acc.profilePicLink);
  const badge = PLATFORM_BADGE[acc.platform] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-foreground/[0.03] border border-foreground/6 hover:bg-white/80 hover:border-foreground/10 transition-all duration-150 group">
      <Avatar className="h-8 w-8 flex-shrink-0">
        {!imgErr && src ? (
          <AvatarImage
            src={src}
            alt={acc.username}
            onError={() => setImgErr(true)}
          />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-accent/25 to-accent/10 text-accent text-[11px] font-semibold">
            {getInitials(acc.username)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate text-foreground leading-tight">
          {acc.username}
        </p>
        <span
          className={`inline-block mt-0.5 px-1.5 py-0 text-[10px] font-medium rounded-full capitalize ${badge}`}
        >
          {platformLabel(acc.platform)}
        </span>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all flex-shrink-0"
          aria-label="Remove from group"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── GroupCard ─────────────────────────────────────────────────────────────────

function GroupCard({
  group,
  groupAccounts,
  ungroupedAccounts,
  onRename,
  onDelete,
  onAddAccount,
  onRemoveAccount,
}: {
  group: AccountGroup;
  groupAccounts: ConnectedAccount[];
  ungroupedAccounts: ConnectedAccount[];
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddAccount: (groupId: string, acc: ConnectedAccount) => void;
  onRemoveAccount: (groupId: string, acc: ConnectedAccount) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAddDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAddDropdown]);

  // Keep editName in sync if group name changes externally
  useEffect(() => {
    if (!editing) setEditName(group.name);
  }, [group.name, editing]);

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== group.name) {
      onRename(group.id, trimmed);
    } else {
      setEditName(group.name);
    }
    setEditing(false);
  };

  return (
    <div
      className="rounded-2xl bg-white/85 backdrop-blur-xl border border-foreground/8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col"
      style={{ borderTop: `3px solid ${group.color}` }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: group.color }}
        />

        {editing ? (
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setEditName(group.name);
                  setEditing(false);
                }
              }}
              className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-b border-primary outline-none text-foreground"
            />
            <button
              onClick={commitRename}
              className="p-0.5 text-green-600 hover:text-green-700 flex-shrink-0"
              aria-label="Save name"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEditName(group.name);
                setEditing(false);
              }}
              className="p-0.5 text-muted-foreground hover:text-foreground flex-shrink-0"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {group.name}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {groupAccounts.length}
            </span>
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
            <button
              onClick={() => {
                setEditName(group.name);
                setEditing(true);
              }}
              className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition"
              aria-label="Rename group"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(group.id)}
              className="p-1.5 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition"
              aria-label="Delete group"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Account list */}
      <div className="px-3 pb-4 space-y-1.5 flex-1">
        {groupAccounts.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-foreground/10 rounded-xl bg-foreground/[0.02]">
            No accounts yet — add one below
          </div>
        ) : (
          groupAccounts.map((acc) => (
            <AccountMiniRow
              key={acc.providerUserId}
              acc={acc}
              onRemove={() => onRemoveAccount(group.id, acc)}
            />
          ))
        )}

        {/* Add account dropdown */}
        {ungroupedAccounts.length > 0 && (
          <div className="relative mt-2" ref={dropdownRef}>
            <button
              onClick={() => setShowAddDropdown((v) => !v)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-foreground/12 text-xs text-muted-foreground hover:text-accent hover:border-accent/25 hover:bg-accent/3 transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add account</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  showAddDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showAddDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white/95 backdrop-blur-xl border border-foreground/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-20 overflow-hidden">
                <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest border-b border-foreground/6">
                  Ungrouped accounts
                </div>
                {ungroupedAccounts.map((acc) => (
                  <button
                    key={acc.providerUserId}
                    onClick={() => {
                      onAddAccount(group.id, acc);
                      setShowAddDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-foreground/4 text-left transition"
                  >
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="text-[10px] bg-accent/20 text-accent">
                        {getInitials(acc.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs truncate flex-1">
                      {acc.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize flex-shrink-0">
                      {platformLabel(acc.platform)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── UngroupedAccountRow ───────────────────────────────────────────────────────

function UngroupedAccountRow({
  acc,
  groups,
  onAssign,
}: {
  acc: ConnectedAccount;
  groups: AccountGroup[];
  onAssign: (groupId: string) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const src = getImgUrl(acc.profilePicLink);
  const badge = PLATFORM_BADGE[acc.platform] ?? "bg-gray-100 text-gray-600";

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  return (
    <div
      ref={ref}
      className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/75 border border-foreground/8 hover:bg-white/95 hover:border-foreground/12 transition-all duration-150 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        {!imgErr && src ? (
          <AvatarImage
            src={src}
            alt={acc.username}
            onError={() => setImgErr(true)}
          />
        ) : (
          <AvatarFallback className="text-xs font-semibold bg-accent/20 text-accent">
            {getInitials(acc.username)}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{acc.username}</p>
        <span
          className={`inline-block px-1.5 py-0 text-[10px] font-medium rounded-full capitalize ${badge}`}
        >
          {platformLabel(acc.platform)}
        </span>
      </div>

      {groups.length > 0 && (
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/8 text-accent/70 hover:text-accent hover:bg-accent/15 text-[11px] font-semibold border border-accent/10 transition-all duration-150"
          >
            Assign
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white/95 backdrop-blur-xl border border-foreground/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-20 overflow-hidden">
              <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest border-b border-foreground/6">
                Move to group
              </div>
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    onAssign(g.id);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-foreground/4 text-left transition"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="text-xs truncate">{g.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main: AccountGroupsManager ────────────────────────────────────────────────

export default function AccountGroupsManager({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) {
  const { getToken } = useAuth();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const newGroupInputRef = useRef<HTMLInputElement>(null);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAccountGroupsApi(getToken);
      setGroups(data ?? []);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (creatingGroup) newGroupInputRef.current?.focus();
  }, [creatingGroup]);

  // Derived state
  const groupedIds = new Set(groups.flatMap((g) => g.accountIds));
  const ungroupedAccounts = accounts.filter(
    (a) => !groupedIds.has(a.providerUserId)
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      const color = pickNextColor(groups);
      const newGroup = await createAccountGroupApi(getToken, name, color);
      setGroups((prev) => [...prev, newGroup]);
      setNewGroupName("");
      setCreatingGroup(false);
      toast.success(`Group "${name}" created`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create group");
    }
  };

  const handleRename = async (id: string, name: string) => {
    const group = groups.find((g) => g.id === id);
    if (!group) return;
    const prev = groups;
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, name } : g)));
    try {
      await updateAccountGroupApi(getToken, id, name, group.color);
      toast.success("Group renamed");
    } catch (err: any) {
      setGroups(prev);
      toast.error(err?.message ?? "Failed to rename group");
    }
  };

  const handleDelete = async (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (!group) return;
    const ok = window.confirm(
      `Delete group "${group.name}"? Accounts will become ungrouped.`
    );
    if (!ok) return;
    const prev = groups;
    setGroups((gs) => gs.filter((g) => g.id !== id));
    try {
      await deleteAccountGroupApi(getToken, id);
      toast.success(`Group "${group.name}" deleted`);
    } catch (err: any) {
      setGroups(prev);
      toast.error(err?.message ?? "Failed to delete group");
    }
  };

  const handleAddAccount = async (
    groupId: string,
    acc: ConnectedAccount
  ) => {
    const prev = groups;
    // Optimistic: remove from any existing group, add to target
    setGroups((gs) =>
      gs.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            accountIds: [...g.accountIds, acc.providerUserId],
          };
        }
        return {
          ...g,
          accountIds: g.accountIds.filter((id) => id !== acc.providerUserId),
        };
      })
    );
    try {
      await addAccountToGroupApi(getToken, groupId, acc.providerUserId);
    } catch (err: any) {
      setGroups(prev);
      toast.error(err?.message ?? "Failed to add account to group");
    }
  };

  const handleRemoveAccount = async (
    groupId: string,
    acc: ConnectedAccount
  ) => {
    const prev = groups;
    setGroups((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? {
              ...g,
              accountIds: g.accountIds.filter(
                (id) => id !== acc.providerUserId
              ),
            }
          : g
      )
    );
    try {
      await removeAccountFromGroupApi(getToken, groupId, acc.providerUserId);
    } catch (err: any) {
      setGroups(prev);
      toast.error(err?.message ?? "Failed to remove account from group");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppleSkeleton className="h-52 w-full" />
        <AppleSkeleton className="h-52 w-full" />
        <AppleSkeleton className="h-52 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Account Groups
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {groups.length === 0
              ? "Organize your accounts into named groups"
              : `${groups.length} group${groups.length !== 1 ? "s" : ""} · ${
                  accounts.length - ungroupedAccounts.length
                } of ${accounts.length} accounts grouped`}
          </p>
        </div>

        {!creatingGroup ? (
          <button
            onClick={() => setCreatingGroup(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/15 hover:bg-accent/18 transition-all duration-150 flex-shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Group
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              ref={newGroupInputRef}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateGroup();
                if (e.key === "Escape") {
                  setCreatingGroup(false);
                  setNewGroupName("");
                }
              }}
              placeholder="Group name…"
              className="text-sm px-3 py-1.5 rounded-lg border border-foreground/15 bg-white/90 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 w-36 transition-all"
            />
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Create group"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCreatingGroup(false);
                setNewGroupName("");
              }}
              className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground transition"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Groups grid */}
      {groups.length === 0 ? (
        <div className="py-14 text-center border border-dashed border-foreground/12 rounded-2xl bg-foreground/[0.015]">
          <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold text-foreground/60">
            No groups yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click &ldquo;New Group&rdquo; to organize your accounts
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const groupAccounts = accounts.filter((a) =>
              group.accountIds.includes(a.providerUserId)
            );
            return (
              <GroupCard
                key={group.id}
                group={group}
                groupAccounts={groupAccounts}
                ungroupedAccounts={ungroupedAccounts}
                onRename={handleRename}
                onDelete={handleDelete}
                onAddAccount={handleAddAccount}
                onRemoveAccount={handleRemoveAccount}
              />
            );
          })}
        </div>
      )}

      {/* Ungrouped section */}
      {ungroupedAccounts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Ungrouped
            </span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-foreground/8 text-foreground/50 text-[10px] font-semibold">
              {ungroupedAccounts.length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ungroupedAccounts.map((acc) => (
              <UngroupedAccountRow
                key={acc.providerUserId}
                acc={acc}
                groups={groups}
                onAssign={(groupId) => handleAddAccount(groupId, acc)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All grouped, no ungrouped */}
      {accounts.length > 0 && ungroupedAccounts.length === 0 && groups.length > 0 && (
        <div className="py-4 text-center text-xs text-muted-foreground">
          All accounts are organized into groups
        </div>
      )}
    </div>
  );
}
