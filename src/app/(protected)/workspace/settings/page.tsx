"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceInvitation, WorkspaceMember, WorkspaceResponse, WorkspaceRole } from "@/model/Workspace";
import { getMembersApi, removeMemberApi, updateMemberRoleApi } from "@/service/member";
import { getInvitationsApi, revokeInvitationApi, sendInviteApi } from "@/service/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, UserPlus, Mail, Users, Clock, Info, ChevronDown, Check, Building2, Plus, X, ShieldCheck, Eye, Shield, RefreshCw, ArchiveRestore, AlertTriangle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { createWorkspaceApi, deleteWorkspaceApi, getDeletedWorkspacesApi, restoreWorkspaceApi, updateWorkspaceApi } from "@/service/workspace";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Tab = "team" | "invitations";

type LoadDataOptions = {
  silent?: boolean;
  syncWorkspaceList?: boolean;
};

const ROLE_OPTIONS: WorkspaceRole[] = ["ADMIN", "MEMBER", "VIEWER"];

const ROLE_ORDER: Record<WorkspaceRole, number> = {
  OWNER: 0,
  ADMIN: 1,
  MEMBER: 2,
  VIEWER: 3,
};

function roleBadgeClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "ADMIN":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "MEMBER":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "VIEWER":
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

function avatarBgClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "bg-amber-100 text-amber-700";
    case "ADMIN":
      return "bg-blue-100 text-blue-700";
    case "MEMBER":
      return "bg-emerald-100 text-emerald-700";
    case "VIEWER":
      return "bg-slate-100 text-slate-500";
  }
}

function roleLabel(role: WorkspaceRole) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function RoleGroupHeading({ role, count }: { role: WorkspaceRole; count: number }) {
  const colors: Record<WorkspaceRole, string> = {
    OWNER: "text-amber-700",
    ADMIN: "text-blue-700",
    MEMBER: "text-emerald-700",
    VIEWER: "text-slate-500",
  };
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <span className={cn("text-sm font-medium tracking-tight", colors[role])}>
        {role === "VIEWER" ? "Viewers" : `${roleLabel(role)}s`}
      </span>
      <span className="text-xs text-muted-foreground">·</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

const ROLE_CONTEXT: Record<WorkspaceRole, { icon: React.ElementType; bg: string; border: string; iconColor: string; textColor: string; label: string; description: string }> = {
  OWNER: {
    icon: ShieldCheck,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    textColor: "text-amber-900",
    label: "You are the Owner",
    description: "You have full control over this workspace — invite members, manage roles, rename the workspace, and create new workspaces.",
  },
  ADMIN: {
    icon: Shield,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-500",
    textColor: "text-blue-900",
    label: "You are an Admin",
    description: "You can rename this workspace, invite members, and remove non-owner members. Role assignment is restricted to the Owner.",
  },
  MEMBER: {
    icon: Eye,
    bg: "bg-muted/60",
    border: "border-border",
    iconColor: "text-muted-foreground",
    textColor: "text-foreground",
    label: "You are a Member",
    description: "You can view the team list but cannot invite, remove, or change roles. Contact an Admin or Owner to make changes.",
  },
  VIEWER: {
    icon: Eye,
    bg: "bg-muted/60",
    border: "border-border",
    iconColor: "text-muted-foreground",
    textColor: "text-foreground",
    label: "You are a Viewer",
    description: "You have read-only access to this workspace. Contact an Admin or Owner to request elevated permissions.",
  },
};

function RoleContextBanner({ role }: { role: WorkspaceRole }) {
  const ctx = ROLE_CONTEXT[role];
  const Icon = ctx.icon;
  return (
    <div className={cn("flex items-start gap-3 rounded-[22px] border px-4 py-3.5", ctx.bg, ctx.border)}>
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", ctx.iconColor)} />
      <div className="text-sm">
        <p className={cn("font-medium", ctx.textColor)}>{ctx.label}</p>
        <p className={cn("text-[13px] leading-relaxed", ctx.textColor, "opacity-80")}>{ctx.description}</p>
      </div>
    </div>
  );
}

function formatDisplayDate(date: string | undefined) {
  if (!date) return "recently";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function membersEqual(a: WorkspaceMember[], b: WorkspaceMember[]) {
  if (a.length !== b.length) return false;
  return a.every((member, index) => {
    const other = b[index];
    return (
      member.userId === other.userId &&
      member.role === other.role &&
      member.joinedAt === other.joinedAt &&
      member.firstName === other.firstName &&
      member.lastName === other.lastName &&
      member.email === other.email
    );
  });
}

function invitationsEqual(a: WorkspaceInvitation[], b: WorkspaceInvitation[]) {
  if (a.length !== b.length) return false;
  return a.every((invite, index) => {
    const other = b[index];
    return (
      invite.token === other.token &&
      invite.workspaceId === other.workspaceId &&
      invite.invitedEmail === other.invitedEmail &&
      invite.role === other.role &&
      invite.invitedBy === other.invitedBy &&
      invite.expiresAt === other.expiresAt &&
      invite.acceptedAt === other.acceptedAt &&
      invite.createdAt === other.createdAt
    );
  });
}

function workspacesEqual(a: WorkspaceResponse[], b: WorkspaceResponse[]) {
  if (a.length !== b.length) return false;
  return a.every((workspace, index) => {
    const other = b[index];
    return (
      workspace.id === other.id &&
      workspace.name === other.name &&
      workspace.companyName === other.companyName &&
      workspace.ownerUserId === other.ownerUserId &&
      workspace.logoS3Key === other.logoS3Key &&
      workspace.role === other.role &&
      workspace.createdAt === other.createdAt &&
      workspace.updatedAt === other.updatedAt &&
      workspace.deletedAt === other.deletedAt
    );
  });
}

export default function WorkspaceSettingsPage() {
  const { getToken } = useAuth();
  const { activeWorkspace, workspaces, switchWorkspace, refresh } = useWorkspace();
  const { isInfluencer } = usePlan();

  const [tab, setTab] = useState<Tab>("team");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [deletedWorkspaces, setDeletedWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Workspace switcher
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Create workspace
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [createWorkspaceBusy, setCreateWorkspaceBusy] = useState(false);
  const [createWorkspaceError, setCreateWorkspaceError] = useState<string | null>(null);
  const [isEditingWorkspaceName, setIsEditingWorkspaceName] = useState(false);
  const [workspaceNameInput, setWorkspaceNameInput] = useState("");
  const [renameWorkspaceBusy, setRenameWorkspaceBusy] = useState(false);

  // Confirm dialog
  const [pendingConfirm, setPendingConfirm] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [restoreBusyId, setRestoreBusyId] = useState<string | null>(null);

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const workspaceId = activeWorkspace?.id;
  const myRole = activeWorkspace?.role;
  const isAdminOrOwner = myRole === "OWNER" || myRole === "ADMIN";
  const isOwner = myRole === "OWNER";
  const canDeleteWorkspace = isAdminOrOwner && !isInfluencer && !activeWorkspace?.id.startsWith("personal_");

  const loadData = useCallback(async ({ silent = false, syncWorkspaceList = false }: LoadDataOptions = {}) => {
    if (silent) setRefreshing(true);
    else {
      setLoading(true);
      setError(null);
    }

    try {
      const requests: [
        Promise<WorkspaceMember[]>,
        Promise<WorkspaceInvitation[]>,
        Promise<WorkspaceResponse[]>,
        Promise<void> | null,
      ] = [
        workspaceId ? getMembersApi(getToken, workspaceId) : Promise.resolve([]),
        workspaceId && isAdminOrOwner ? getInvitationsApi(getToken, workspaceId) : Promise.resolve([]),
        getDeletedWorkspacesApi(getToken).catch(() => []),
        syncWorkspaceList ? refresh() : null,
      ];

      const [m, inv, deleted] = await Promise.all(requests);

      setMembers((current) => (membersEqual(current, m as WorkspaceMember[]) ? current : (m as WorkspaceMember[])));
      setInvitations((current) =>
        invitationsEqual(current, inv as WorkspaceInvitation[]) ? current : (inv as WorkspaceInvitation[])
      );
      setDeletedWorkspaces((current) =>
        workspacesEqual(current, deleted) ? current : deleted
      );
      setLastRefreshedAt(new Date());
    } catch (e: any) {
      if (!silent) {
        setError(e.message ?? "Failed to load");
      }
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, [getToken, isAdminOrOwner, refresh, workspaceId]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    setWorkspaceNameInput(activeWorkspace?.name ?? "");
    setIsEditingWorkspaceName(false);
  }, [activeWorkspace?.id, activeWorkspace?.name]);

  // Auto-refresh every 15s while the page is visible
  useEffect(() => {
    if (!workspaceId) return;
    const interval = setInterval(() => {
      if (!document.hidden) loadData({ silent: true, syncWorkspaceList: true });
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData({ silent: true, syncWorkspaceList: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadData, workspaceId]);

  const refreshLabel = useMemo(() => {
    if (!lastRefreshedAt) return "Waiting for first sync";
    const secondsAgo = Math.max(0, Math.floor((Date.now() - lastRefreshedAt.getTime()) / 1000));
    if (secondsAgo < 5) return "Updated just now";
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `Updated ${minutesAgo}m ago`;
  }, [lastRefreshedAt]);

  async function handleCreateWorkspace() {
    if (!newWorkspaceName.trim()) return;
    setCreateWorkspaceBusy(true);
    setCreateWorkspaceError(null);
    try {
      const ws = await createWorkspaceApi(getToken, { name: newWorkspaceName.trim() });
      setNewWorkspaceName("");
      setShowCreateWorkspace(false);
      await refresh();
      switchWorkspace(ws);
    } catch (e: any) {
      setCreateWorkspaceError(e.message ?? "Failed to create workspace");
    } finally {
      setCreateWorkspaceBusy(false);
    }
  }

  async function handleRenameWorkspace() {
    if (!workspaceId || !isAdminOrOwner || !workspaceNameInput.trim()) return;
    const trimmedName = workspaceNameInput.trim();
    if (trimmedName === activeWorkspace?.name) {
      setIsEditingWorkspaceName(false);
      return;
    }

    setRenameWorkspaceBusy(true);
    try {
      await updateWorkspaceApi(getToken, workspaceId, { name: trimmedName });
      await refresh();
      await loadData({ silent: true, syncWorkspaceList: true });
      setIsEditingWorkspaceName(false);
      toast.success("Workspace name updated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update workspace name");
    } finally {
      setRenameWorkspaceBusy(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !workspaceId) return;
    setInviteBusy(true);
    setInviteError(null);
    setInviteSuccess(false);
    try {
      await sendInviteApi(getToken, {
        email: inviteEmail.trim(),
        role: inviteRole,
        workspaceIds: [workspaceId],
      });
      setInviteSuccess(true);
      setInviteEmail("");
      setShowInviteForm(false);
      await loadData({ silent: true, syncWorkspaceList: true });
    } catch (e: any) {
      setInviteError(e.message ?? "Failed to send invite");
    } finally {
      setInviteBusy(false);
    }
  }

  async function handleRoleChange(userId: string, role: WorkspaceRole) {
    if (!workspaceId) return;
    try {
      await updateMemberRoleApi(getToken, workspaceId, userId, role);
      await loadData({ silent: true, syncWorkspaceList: true });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update role");
    }
  }

  function handleRemove(userId: string) {
    if (!workspaceId) return;
    setPendingConfirm({
      title: "Remove member?",
      description: "This will remove the member from the workspace.",
      onConfirm: async () => {
        setPendingConfirm(null);
        try {
          await removeMemberApi(getToken, workspaceId, userId);
          await loadData({ silent: true, syncWorkspaceList: true });
        } catch (e: any) {
          toast.error(e.message ?? "Failed to remove member");
        }
      },
    });
  }

  function handleRevokeInvitation(token: string) {
    setPendingConfirm({
      title: "Revoke invitation?",
      description: "The invited user will no longer be able to join using this link.",
      onConfirm: async () => {
        setPendingConfirm(null);
        try {
          await revokeInvitationApi(getToken, token);
          await loadData({ silent: true, syncWorkspaceList: true });
        } catch (e: any) {
          toast.error(e.message ?? "Failed to revoke invitation");
        }
      },
    });
  }

  async function handleRestoreWorkspace(workspace: WorkspaceResponse) {
    setRestoreBusyId(workspace.id);
    try {
      await restoreWorkspaceApi(getToken, workspace.id);
      await loadData({ silent: true, syncWorkspaceList: true });
      toast.success(`Restored ${workspace.name}`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to restore workspace");
    } finally {
      setRestoreBusyId(null);
    }
  }

  async function handleDeleteWorkspace() {
    if (!workspaceId || !activeWorkspace) return;
    setDeleteBusy(true);
    try {
      await deleteWorkspaceApi(getToken, workspaceId);
      setDeleteDialogOpen(false);
      setDeleteConfirmValue("");
      await Promise.all([loadData({ silent: true, syncWorkspaceList: true }), refresh()]);
      toast.success(`${activeWorkspace.name} moved to deleted workspaces`);

      const remaining = workspaces.filter((ws) => ws.id !== workspaceId);
      if (remaining.length > 0) {
        localStorage.setItem("activeWorkspaceId", remaining[0].id);
        localStorage.setItem("activeWorkspaceRole", remaining[0].role);
        window.location.href = "/dashboard";
      } else {
        localStorage.removeItem("activeWorkspaceId");
        localStorage.removeItem("activeWorkspaceRole");
        window.location.href = "/workspace/settings";
      }
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete workspace");
    } finally {
      setDeleteBusy(false);
    }
  }

  if (!activeWorkspace && !loading) {
    return (
      <div className="w-full px-4 py-6 md:px-8 md:py-8">
        <div className="w-full space-y-6">
          <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-white to-slate-50/90 p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.22)]">
            <h1 className="text-[28px] font-medium tracking-[-0.03em] text-slate-900">Workspace Settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              No active workspace is selected. You can still review and restore deleted workspaces below.
            </p>
          </div>

          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <div className="mb-4">
              <h2 className="text-lg font-medium tracking-[-0.02em] text-slate-900">Deleted workspaces</h2>
              <p className="mt-1 text-sm text-slate-500">
                Restore archived workspaces if your team needs access again.
              </p>
            </div>

            {deletedWorkspaces.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-sm text-slate-500">
                No deleted workspaces are available to restore.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {deletedWorkspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex items-start justify-between gap-4 rounded-[22px] border border-slate-200/80 bg-slate-50/60 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-slate-900">{workspace.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Deleted {formatDisplayDate(workspace.deletedAt)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreWorkspace(workspace)}
                      disabled={restoreBusyId === workspace.id}
                      className="h-8 rounded-full px-3"
                    >
                      <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" />
                      {restoreBusyId === workspace.id ? "Restoring…" : "Restore"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (!activeWorkspace) {
    return <div className="p-8 text-muted-foreground">Loading workspace settings…</div>;
  }

  const workspaceName = isInfluencer ? "main" : activeWorkspace.name;

  // Group members by role, sorted
  const sortedMembers = [...members].sort(
    (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]
  );
  const groupedMembers = sortedMembers.reduce<Record<WorkspaceRole, WorkspaceMember[]>>(
    (acc, m) => {
      if (!acc[m.role]) acc[m.role] = [];
      acc[m.role].push(m);
      return acc;
    },
    {} as Record<WorkspaceRole, WorkspaceMember[]>
  );
  const roleGroups: WorkspaceRole[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];

  return (
    <>
    <ConfirmDialog
      open={!!pendingConfirm}
      title={pendingConfirm?.title}
      description={pendingConfirm?.description ?? ""}
      confirmLabel="Confirm"
      destructive
      onConfirm={() => pendingConfirm?.onConfirm()}
      onCancel={() => setPendingConfirm(null)}
    />
    {deleteDialogOpen && activeWorkspace && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Delete workspace?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                This removes access immediately for the whole team. To confirm, type <strong>{activeWorkspace.name}</strong>.
              </p>
            </div>
          </div>
          <Input
            value={deleteConfirmValue}
            onChange={(e) => setDeleteConfirmValue(e.target.value)}
            placeholder={activeWorkspace.name}
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-2">
            The workspace will move to deleted workspaces and can be restored later by an admin or owner.
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmValue("");
              }}
              disabled={deleteBusy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteWorkspace}
              disabled={deleteBusy || deleteConfirmValue.trim() !== activeWorkspace.name}
            >
              {deleteBusy ? "Deleting…" : "Delete workspace"}
            </Button>
          </div>
        </div>
      </div>
    )}
    <div className="w-full px-4 py-6 md:px-8 md:py-8">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.4),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(226,232,240,0.9),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.94))] p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-white/90" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-slate-500 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                SETTINGS
              </div>
              <h1 className="mt-4 text-[32px] font-medium leading-none tracking-[-0.05em] text-slate-950 md:text-[40px]">
                {workspaceName}
              </h1>
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Active workspace
              </p>
              <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-600">
                Manage workspace name, members, roles, invites, and access.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[420px]">
              <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Active workspace</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/[0.04] text-slate-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-slate-900">{workspaceName}</p>
                    <p className="text-xs text-slate-500">{roleLabel(myRole ?? "VIEWER")} access</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/80 bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Sync status</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                      <span className={cn("h-2 w-2 rounded-full bg-emerald-500 transition-opacity", refreshing && "animate-pulse")} />
                      <span>{refreshing ? "Syncing changes…" : refreshLabel}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => loadData({ silent: true, syncWorkspaceList: true })}
                    disabled={loading || refreshing}
                    title="Refresh"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:opacity-40"
                  >
                    <RefreshCw className={cn("h-4 w-4", (loading || refreshing) && "animate-spin")} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.22)] backdrop-blur-xl md:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium tracking-[-0.02em] text-slate-900">Workspace</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Switch workspaces, rename the current workspace, and manage access.
                    </p>
                  </div>

                  {isInfluencer ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>main</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setSwitcherOpen((o) => !o)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <span className="max-w-48 truncate">{workspaceName}</span>
                          <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", switcherOpen && "rotate-180")} />
                        </button>
                        {switcherOpen && (
                          <div className="absolute left-0 top-full z-50 mt-2 min-w-56 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/95 py-1 shadow-[0_18px_48px_-18px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                            {workspaces.map((ws: WorkspaceResponse) => (
                              <button
                                key={ws.id}
                                onClick={() => {
                                  switchWorkspace(ws);
                                  setSwitcherOpen(false);
                                }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                              >
                                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="flex-1 truncate">{ws.name}</span>
                                {ws.id === activeWorkspace.id && (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowCreateWorkspace(true);
                            setCreateWorkspaceError(null);
                          }}
                          className="h-9 rounded-full px-4"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          New workspace
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {showCreateWorkspace && (
                  <div className="max-w-md rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Create workspace</p>
                        <p className="mt-1 text-xs text-slate-500">Keep names short and client-friendly.</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowCreateWorkspace(false);
                          setNewWorkspaceName("");
                        }}
                        className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-3">
                      <Input
                        placeholder="Workspace name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                        autoFocus
                        className="h-10 rounded-2xl border-slate-200 bg-white"
                      />
                      {createWorkspaceError && <p className="text-xs text-destructive">{createWorkspaceError}</p>}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCreateWorkspace}
                          disabled={!newWorkspaceName.trim() || createWorkspaceBusy}
                          className="h-9 rounded-full px-4"
                        >
                          {createWorkspaceBusy ? "Creating…" : "Create"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowCreateWorkspace(false);
                            setNewWorkspaceName("");
                          }}
                          className="h-9 rounded-full px-4"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isAdminOrOwner && (
                  <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Display name</p>
                        <p className="mt-1 text-sm text-slate-500">
                          The workspace name appears across navigation, team views, and invitations.
                        </p>
                      </div>
                      {!isEditingWorkspaceName && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingWorkspaceName(true)}
                          className="h-8 rounded-full px-3.5"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Rename
                        </Button>
                      )}
                    </div>

                    <div className="mt-4">
                      {isEditingWorkspaceName ? (
                        <div className="space-y-3">
                          <Input
                            value={workspaceNameInput}
                            onChange={(e) => setWorkspaceNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameWorkspace();
                              if (e.key === "Escape") {
                                setWorkspaceNameInput(activeWorkspace.name);
                                setIsEditingWorkspaceName(false);
                              }
                            }}
                            autoFocus
                            className="h-10 rounded-2xl border-slate-200 bg-white text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={handleRenameWorkspace}
                              disabled={!workspaceNameInput.trim() || renameWorkspaceBusy || workspaceNameInput.trim() === activeWorkspace.name}
                              className="h-9 rounded-full px-4"
                            >
                              {renameWorkspaceBusy ? "Saving…" : "Save changes"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setWorkspaceNameInput(activeWorkspace.name);
                                setIsEditingWorkspaceName(false);
                              }}
                              disabled={renameWorkspaceBusy}
                              className="h-9 rounded-full px-4"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[20px] border border-white/80 bg-white/90 px-4 py-3">
                          <p className="text-[13px] text-slate-500">Current name</p>
                          <p className="mt-1 truncate text-[17px] font-medium tracking-[-0.02em] text-slate-900">
                            {activeWorkspace.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
          </section>

          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.22)] backdrop-blur-xl md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium tracking-[-0.02em] text-slate-900">People</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Manage who can access the workspace and what level of control they get.
                  </p>
                </div>
                <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-100/80 p-1">
                  {(["team", ...(!isInfluencer ? ["invitations"] : [])] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-all",
                        tab === t
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      {t === "team" ? <Users className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      <span>{t === "team" ? "Team" : "Invitations"}</span>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                        {t === "team" ? members.length : invitations.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {myRole && <div className="mt-5"><RoleContextBanner role={myRole} /></div>}

              {isInfluencer && (
                <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-blue-200/80 bg-blue-50/90 px-4 py-3.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Influencer plan</p>
                    <p className="mt-1 leading-6 text-blue-800/85">
                      Your account uses one workspace named <strong>main</strong>. Team invitations and multi-workspace controls are available on Agency plans.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-[22px] border border-slate-200/80 bg-slate-100/70" />
                  ))}
                </div>
              )}
              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

              {!loading && tab === "team" && (
                <div className="mt-5">
                  {isAdminOrOwner && !isInfluencer && (
                    <div className="mb-5">
                      {!showInviteForm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowInviteForm(true);
                            setInviteSuccess(false);
                          }}
                          className="h-9 rounded-full px-4"
                        >
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                          Add teammate
                        </Button>
                      ) : (
                        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">Invite by email</p>
                              <p className="mt-1 text-xs text-slate-500">Use a work email and assign the lightest role that fits.</p>
                            </div>
                            <button
                              onClick={() => setShowInviteForm(false)}
                              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <Input
                              placeholder="colleague@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                              autoFocus
                              className="h-10 flex-1 rounded-2xl border-slate-200 bg-white"
                            />
                            <Select
                              value={inviteRole}
                              onValueChange={(v) => setInviteRole(v as WorkspaceRole)}
                            >
                              <SelectTrigger className="h-10 w-full rounded-2xl border-slate-200 bg-white sm:w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((r) => (
                                  <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {inviteError && <p className="mt-2 text-xs text-destructive">{inviteError}</p>}
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" onClick={handleInvite} disabled={!inviteEmail.trim() || inviteBusy} className="h-9 rounded-full px-4">
                              {inviteBusy ? "Sending…" : "Send invite"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowInviteForm(false)} className="h-9 rounded-full px-4">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      {inviteSuccess && (
                        <p className="mt-2 text-xs text-emerald-600">Invitation sent.</p>
                      )}
                    </div>
                  )}

                  {members.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm text-slate-500">
                      No members yet.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {roleGroups.map((role) => {
                        const group = groupedMembers[role];
                        if (!group || group.length === 0) return null;
                        return (
                          <div key={role}>
                            <RoleGroupHeading role={role} count={group.length} />
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                              {group.map((m) => {
                                const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ");
                                const initials = (
                                  (m.firstName?.[0] ?? "") + (m.lastName?.[0] ?? "")
                                ).toUpperCase() || (m.email?.[0]?.toUpperCase() ?? "?");

                                return (
                                  <div
                                    key={m.userId}
                                    className="flex items-center gap-3 rounded-[22px] border border-slate-200/80 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50"
                                  >
                                    <div className={cn(
                                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                                      avatarBgClass(m.role)
                                    )}>
                                      {initials}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className={cn("truncate text-[15px] text-slate-900", fullName ? "font-medium" : "italic text-slate-500")}>
                                        {fullName || "Unknown"}
                                      </p>
                                      {m.email && (
                                        <p className="truncate text-[13px] text-slate-500">{m.email}</p>
                                      )}
                                      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                                        {m.userId}
                                      </p>
                                    </div>

                                    {isOwner && m.role !== "OWNER" ? (
                                      <Select
                                        value={m.role}
                                        onValueChange={(v) => handleRoleChange(m.userId, v as WorkspaceRole)}
                                      >
                                        <SelectTrigger className="h-8 w-28 rounded-full border-slate-200 bg-white text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ROLE_OPTIONS.map((r) => (
                                            <SelectItem key={r} value={r} className="text-xs">
                                              {roleLabel(r)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <span className={cn(
                                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                                        roleBadgeClass(m.role)
                                      )}>
                                        {roleLabel(m.role)}
                                      </span>
                                    )}

                                    {isAdminOrOwner && m.role !== "OWNER" && (
                                      <button
                                        onClick={() => handleRemove(m.userId)}
                                        className="ml-1 rounded-full p-2 text-slate-400 transition-colors hover:bg-white hover:text-destructive"
                                        title="Remove member"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {!loading && tab === "invitations" && (
                <div className="mt-5">
                  {invitations.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center text-sm text-slate-500">
                      No pending invitations.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {invitations.map((inv) => (
                        <div
                          key={inv.token}
                          className="flex items-center gap-3 rounded-[22px] border border-slate-200/80 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-medium text-slate-900">{inv.invitedEmail}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[13px] text-slate-500">
                              <Clock className="h-3 w-3" />
                              Expires {new Date(inv.expiresAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", roleBadgeClass(inv.role))}>
                            {roleLabel(inv.role)}
                          </span>
                          {isAdminOrOwner && (
                            <button
                              onClick={() => handleRevokeInvitation(inv.token)}
                              className="ml-1 rounded-full p-2 text-slate-400 transition-colors hover:bg-white hover:text-destructive"
                              title="Revoke invitation"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </section>

          {!loading && isAdminOrOwner && !isInfluencer && (
            <div className="space-y-5">
              <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.22)] backdrop-blur-xl">
                <div>
                  <h2 className="text-lg font-medium tracking-[-0.02em] text-slate-900">Deleted workspaces</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Restore archived workspaces without leaving this page.
                  </p>
                </div>

                {deletedWorkspaces.length === 0 ? (
                  <div className="mt-4 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-sm text-slate-500">
                    No deleted workspaces.
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {deletedWorkspaces.map((workspace) => (
                      <div key={workspace.id} className="rounded-[22px] border border-slate-200/80 bg-slate-50/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-medium text-slate-900">{workspace.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Deleted {formatDisplayDate(workspace.deletedAt)}
                            </p>
                            <p className="mt-1 text-[11px] capitalize text-slate-400">
                              Your access: {workspace.role.toLowerCase()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreWorkspace(workspace)}
                            disabled={restoreBusyId === workspace.id}
                            className="h-8 rounded-full px-3"
                          >
                            <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" />
                            {restoreBusyId === workspace.id ? "Restoring…" : "Restore"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {canDeleteWorkspace && (
                <section className="rounded-[28px] border border-red-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(254,242,242,0.92))] p-5 shadow-[0_12px_36px_-24px_rgba(127,29,29,0.18)]">
                  <h2 className="text-lg font-medium tracking-[-0.02em] text-slate-900">Danger zone</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Delete this workspace for everyone. Access is removed immediately, and the workspace can still be restored later.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="mt-4 h-10 rounded-full px-4"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete workspace
                  </Button>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
