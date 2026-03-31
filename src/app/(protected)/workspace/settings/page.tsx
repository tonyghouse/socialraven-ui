"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  ArchiveRestore,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Eye,
  FolderKanban,
  History,
  Info,
  LayoutPanelTop,
  Mail,
  PencilLine,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2 as Trash,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceResponse,
  WorkspaceRole,
} from "@/model/Workspace";
import {
  getMembersApi,
  removeMemberApi,
  updateMemberRoleApi,
} from "@/service/member";
import {
  getInvitationsApi,
  revokeInvitationApi,
  sendInviteApi,
} from "@/service/invitation";
import { Button } from "@/components/ui/button";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import {
  createWorkspaceApi,
  deleteWorkspaceApi,
  getDeletedWorkspacesApi,
  restoreWorkspaceApi,
  updateWorkspaceApi,
} from "@/service/workspace";
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

const surfaceClass =
  "rounded-xl border border-slate-200/80 bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08),0_0_0_1px_rgba(9,30,66,0.02)] dark:border-white/10 dark:bg-[hsl(var(--surface))] dark:shadow-none";
const raisedSurfaceClass =
  "rounded-xl border border-slate-200/80 bg-[hsl(var(--surface-raised))] shadow-[0_1px_1px_rgba(9,30,66,0.04)] dark:border-white/10 dark:bg-[hsl(var(--surface-raised))] dark:shadow-none";
const subtleTextClass = "text-slate-600 dark:text-[#9fadbc]";
const dividerClass = "border-slate-200/80 dark:border-white/10";
const atlBlueTextClass = "text-[#0c66e4] dark:text-[#85b8ff]";
const sectionIconBadgeClass =
  "border border-slate-200/80 bg-[hsl(var(--surface-raised))] text-[hsl(var(--accent))] dark:border-white/10 dark:bg-[hsl(var(--surface-raised))] dark:text-[#85b8ff]";
const neutralIconBadgeClass =
  "border border-slate-200/80 bg-[hsl(var(--surface-raised))] text-slate-700 dark:border-white/10 dark:bg-[hsl(var(--surface-raised))] dark:text-[#c7d1db]";
const dangerIconBadgeClass =
  "border border-[#f5c2c7] bg-[#fff1f2] text-[#ae2e24] dark:border-[#5d1f1a] dark:bg-[#2b1917] dark:text-[#fd9891]";
const pillClass =
  "inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-[#c7d1db]";

function roleLabel(role: WorkspaceRole) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function roleBadgeClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]";
    case "ADMIN":
      return "border-[#b3d4ff] bg-[#e9f2ff] text-[#0c66e4] dark:border-[#2c4f7c] dark:bg-[#1b2638] dark:text-[#85b8ff]";
    case "MEMBER":
      return "border-[#c6f0d3] bg-[#eafbf0] text-[#216e4e] dark:border-[#295f4e] dark:bg-[#1f2e28] dark:text-[#7ee2b8]";
    case "VIEWER":
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-[#9fadbc]";
  }
}

function avatarToneClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "bg-[hsl(var(--accent))]/12 text-[hsl(var(--accent))]";
    case "ADMIN":
      return "bg-[#deebff] text-[#0c66e4] dark:bg-[#1b2638] dark:text-[#85b8ff]";
    case "MEMBER":
      return "bg-[#dcfff1] text-[#216e4e] dark:bg-[#1f2e28] dark:text-[#7ee2b8]";
    case "VIEWER":
      return "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-[#9fadbc]";
  }
}

const ROLE_CONTEXT: Record<
  WorkspaceRole,
  {
    icon: React.ElementType;
    title: string;
    description: string;
  }
> = {
  OWNER: {
    icon: ShieldCheck,
    title: "Owner",
    description: "Owns workspace administration, access, and lifecycle controls.",
  },
  ADMIN: {
    icon: BadgeCheck,
    title: "Admin",
    description: "Manages teammates, invitations, and workspace updates.",
  },
  MEMBER: {
    icon: Users,
    title: "Member",
    description: "Collaborates in the workspace without admin privileges.",
  },
  VIEWER: {
    icon: Eye,
    title: "Viewer",
    description: "Has read-only visibility into workspace activity.",
  },
};

function formatDisplayDate(date: string | undefined) {
  if (!date) return "Recently";
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

function SectionHeader({
  title,
  description,
  action,
  icon: Icon = LayoutPanelTop,
  iconBadgeClass = sectionIconBadgeClass,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  iconBadgeClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between",
        dividerClass
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconBadgeClass
          )}
        >
          <Icon size={17} />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold leading-5 text-slate-900 dark:text-[#f1f5f9]">
            {title}
          </h2>
          <p className={cn("text-xs leading-4", subtleTextClass)}>{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center dark:border-white/10 dark:bg-white/5",
        dividerClass
      )}
    >
      <p className="text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">{title}</p>
      <p className={cn("mt-1 text-xs leading-4", subtleTextClass)}>{description}</p>
    </div>
  );
}

function roleHeadingClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "text-[hsl(var(--accent))]";
    case "ADMIN":
      return "text-[#0c66e4] dark:text-[#85b8ff]";
    case "MEMBER":
      return "text-[#216e4e] dark:text-[#7ee2b8]";
    case "VIEWER":
      return "text-slate-600 dark:text-[#9fadbc]";
  }
}

function roleContextAccentClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/8 text-[hsl(var(--accent))]";
    case "ADMIN":
      return "border-[#b3d4ff] bg-[#e9f2ff] text-[#0c66e4] dark:border-[#2c4f7c] dark:bg-[#1b2638] dark:text-[#85b8ff]";
    case "MEMBER":
      return "border-[#c6f0d3] bg-[#eafbf0] text-[#216e4e] dark:border-[#295f4e] dark:bg-[#1f2e28] dark:text-[#7ee2b8]";
    case "VIEWER":
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-[#9fadbc]";
  }
}

function RoleContextPanel({ role }: { role: WorkspaceRole }) {
  const context = ROLE_CONTEXT[role];
  const Icon = context.icon;

  return (
    <div className={cn(raisedSurfaceClass, "p-4")}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border",
            roleContextAccentClass(role)
          )}
        >
          <Icon size={16} />
        </div>
        <div className="space-y-1">
          <p className={cn("text-sm font-medium leading-5", roleHeadingClass(role))}>
            {context.title}
          </p>
          <p className={cn("text-xs leading-4", subtleTextClass)}>{context.description}</p>
        </div>
      </div>
    </div>
  );
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

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [createWorkspaceBusy, setCreateWorkspaceBusy] = useState(false);
  const [createWorkspaceError, setCreateWorkspaceError] = useState<string | null>(null);
  const [isEditingWorkspaceName, setIsEditingWorkspaceName] = useState(false);
  const [workspaceNameInput, setWorkspaceNameInput] = useState("");
  const [renameWorkspaceBusy, setRenameWorkspaceBusy] = useState(false);

  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [restoreBusyId, setRestoreBusyId] = useState<string | null>(null);

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
  const canDeleteWorkspace =
    isAdminOrOwner && !isInfluencer && !activeWorkspace?.id.startsWith("personal_");

  const loadData = useCallback(
    async ({ silent = false, syncWorkspaceList = false }: LoadDataOptions = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
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
          workspaceId && isAdminOrOwner
            ? getInvitationsApi(getToken, workspaceId)
            : Promise.resolve([]),
          getDeletedWorkspacesApi(getToken).catch(() => []),
          syncWorkspaceList ? refresh() : null,
        ];

        const [m, inv, deleted] = await Promise.all(requests);

        setMembers((current) =>
          membersEqual(current, m as WorkspaceMember[]) ? current : (m as WorkspaceMember[])
        );
        setInvitations((current) =>
          invitationsEqual(current, inv as WorkspaceInvitation[])
            ? current
            : (inv as WorkspaceInvitation[])
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
    },
    [getToken, isAdminOrOwner, refresh, workspaceId]
  );

  useEffect(() => {
    loadData();
  }, [loadData, workspaceId]);

  useEffect(() => {
    setWorkspaceNameInput(activeWorkspace?.name ?? "");
    setIsEditingWorkspaceName(false);
  }, [activeWorkspace?.id, activeWorkspace?.name]);

  useEffect(() => {
    if (!workspaceId) return;
    const interval = setInterval(() => {
      if (!document.hidden) loadData({ silent: true, syncWorkspaceList: true });
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData, workspaceId]);

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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-workspace-switcher]")) {
        setSwitcherOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const refreshLabel = useMemo(() => {
    if (!lastRefreshedAt) return "Waiting for first sync";
    const secondsAgo = Math.max(
      0,
      Math.floor((Date.now() - lastRefreshedAt.getTime()) / 1000)
    );
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
      description: "This removes the member from the workspace immediately.",
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
      description: "The recipient will no longer be able to join with this invite.",
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

  const workspaceName = activeWorkspace
    ? isInfluencer
      ? "main"
      : activeWorkspace.name
    : "";

  const sortedMembers = [...members].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  const groupedMembers = sortedMembers.reduce<Record<WorkspaceRole, WorkspaceMember[]>>(
    (acc, member) => {
      if (!acc[member.role]) acc[member.role] = [];
      acc[member.role].push(member);
      return acc;
    },
    {} as Record<WorkspaceRole, WorkspaceMember[]>
  );
  const roleGroups: WorkspaceRole[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];

  if (!activeWorkspace && !loading) {
    return (
      <div className="w-full px-6 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
          <div className="space-y-2">
            <p className={cn("text-xs", subtleTextClass)}>Workspace settings</p>
            <h1 className="text-lg font-semibold leading-6 text-slate-900 dark:text-[#f1f5f9]">
              No active workspace selected
            </h1>
            <p className={cn("max-w-2xl text-sm leading-5", subtleTextClass)}>
              You can still restore deleted workspaces below. Once a workspace is active,
              team access and naming controls will appear here.
            </p>
          </div>

          <section className={surfaceClass}>
            <SectionHeader
              title="Deleted workspaces"
              description="Restore archived workspaces if your team needs access again."
              icon={ArchiveRestore}
            />
            <div className="p-4">
              {deletedWorkspaces.length === 0 ? (
                <EmptyState
                  title="No deleted workspaces"
                  description="Archived workspaces will appear here when they can be restored."
                />
              ) : (
                <div className="grid gap-4">
                  {deletedWorkspaces.map((workspace) => (
                    <div key={workspace.id} className={cn(raisedSurfaceClass, "p-4")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground dark:text-[#f3f4f6]">
                            {workspace.name}
                          </p>
                          <p className={cn("mt-1 text-sm", subtleTextClass)}>
                            Deleted {formatDisplayDate(workspace.deletedAt ?? undefined)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreWorkspace(workspace)}
                          disabled={restoreBusyId === workspace.id}
                          className="h-8 rounded-md border-slate-300 px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-[#c7d1db] dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <ArchiveRestore size={16} />
                          {restoreBusyId === workspace.id ? "Restoring..." : "Restore"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!activeWorkspace) {
    return <div className="p-8 text-sm text-[hsl(var(--foreground-muted))]">Loading workspace settings...</div>;
  }

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold leading-5 text-slate-900 dark:text-[#f1f5f9]">
                  Delete workspace?
                </h2>
                <p className={cn("text-sm leading-5", subtleTextClass)}>
                  This removes access for the whole team immediately. Type{" "}
                  <span className="font-medium text-slate-900 dark:text-[#f1f5f9]">
                    {activeWorkspace.name}
                  </span>{" "}
                  to confirm.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Input
                value={deleteConfirmValue}
                onChange={(e) => setDeleteConfirmValue(e.target.value)}
                placeholder={activeWorkspace.name}
                autoFocus
                className="h-9"
              />
              <p className={cn("text-xs", subtleTextClass)}>
                The workspace moves to deleted workspaces and can be restored later by an
                admin or owner.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
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
                {deleteBusy ? "Deleting..." : "Delete workspace"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProtectedPageHeader
        title={`Manage ${workspaceName}`}
        description="Administer members, invitations, and workspace controls."
        icon={<FolderKanban className="h-4 w-4" />}
        actions={
          <>
            <div
              className={cn(
                "hidden items-center gap-2 rounded-md border bg-white/80 px-3 py-2 text-xs font-medium leading-4 shadow-sm backdrop-blur-sm md:inline-flex dark:bg-white/5",
                dividerClass
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-[#1f845a]",
                  refreshing && "animate-pulse"
                )}
              />
              <span className={subtleTextClass}>
                {refreshing ? "Syncing workspace..." : refreshLabel}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData({ silent: true, syncWorkspaceList: true })}
              disabled={loading || refreshing}
              className="h-8 rounded-md border-slate-300 bg-white/80 px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-[#c7d1db] dark:hover:bg-white/10 dark:hover:text-white"
            >
              <RefreshCw
                size={16}
                className={cn((loading || refreshing) && "animate-spin")}
              />
              Refresh
            </Button>
          </>
        }
      />

      <div className="w-full px-6 py-6 md:px-8 md:py-8">
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-[#f5c2c7] bg-[#fff4f5] px-4 py-3 text-sm text-[#ae2e24] dark:border-[#5d1f1a] dark:bg-[#2b1917] dark:text-[#fd9891]">
              {error}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-4">
              <section className={surfaceClass}>
                <SectionHeader
                  title="Workspace profile"
                  description="Switch, create, and rename workspaces."
                  icon={BriefcaseBusiness}
                />
                <div className="space-y-3 p-4">
                  {isInfluencer ? (
                    <div className={cn(raisedSurfaceClass, "flex items-center gap-3 p-4")}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#cce0ff] bg-[#e9f2ff] text-[#0c66e4] dark:border-[#2c4f7c] dark:bg-[#1b2638] dark:text-[#85b8ff]">
                        <BriefcaseBusiness size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                          main
                        </p>
                        <p className={cn("text-xs leading-4", subtleTextClass)}>
                          One workspace on the Influencer plan.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative" data-workspace-switcher>
                        <button
                          type="button"
                          onClick={() => setSwitcherOpen((open) => !open)}
                          className={cn(
                            "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm transition-colors hover:bg-slate-50 dark:bg-[#161a22] dark:hover:bg-white/5",
                            dividerClass,
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <BriefcaseBusiness size={16} className={atlBlueTextClass} />
                            <span className="truncate text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                              {workspaceName}
                            </span>
                          </span>
                          <ChevronDown
                            size={16}
                            className={cn(
                              subtleTextClass,
                              "transition-transform",
                              switcherOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {switcherOpen && (
                          <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_32px_rgba(9,30,66,0.18)] dark:border-white/10 dark:bg-[#161a22] dark:shadow-none">
                            {workspaces.map((ws) => (
                              <button
                                key={ws.id}
                                type="button"
                                onClick={() => {
                                  switchWorkspace(ws);
                                  setSwitcherOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                              >
                                <BriefcaseBusiness size={16} className={atlBlueTextClass} />
                                <span className="flex-1 truncate text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                                  {ws.name}
                                </span>
                                {ws.id === activeWorkspace.id && (
                                  <Check size={14} className="text-[hsl(var(--accent))]" />
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
                            setShowCreateWorkspace((current) => !current);
                            setCreateWorkspaceError(null);
                          }}
                          className="h-8 rounded-md border-slate-300 px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-[#c7d1db] dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Plus size={16} />
                          New workspace
                        </Button>
                      )}
                    </div>
                  )}

                  {showCreateWorkspace && (
                    <div className={cn(raisedSurfaceClass, "space-y-3 p-4")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                            Create workspace
                          </p>
                          <p className={cn("text-xs leading-4", subtleTextClass)}>
                            Add another workspace.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateWorkspace(false);
                            setNewWorkspaceName("");
                          }}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <Input
                        placeholder="Workspace name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                        autoFocus
                        className="h-9"
                      />

                      {createWorkspaceError && (
                        <p className="text-sm text-destructive">{createWorkspaceError}</p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCreateWorkspace}
                          disabled={!newWorkspaceName.trim() || createWorkspaceBusy}
                        >
                          {createWorkspaceBusy ? "Creating..." : "Create"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowCreateWorkspace(false);
                            setNewWorkspaceName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {isAdminOrOwner && (
                    <div className={cn(raisedSurfaceClass, "space-y-3 p-4")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-[#f1f5f9]">
                            Display name
                          </p>
                          <p className={cn("text-sm", subtleTextClass)}>
                            Update the name shown across the app.
                          </p>
                        </div>
                        {!isEditingWorkspaceName && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingWorkspaceName(true)}
                            className="h-8 rounded-md border-slate-300 px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-[#c7d1db] dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            <PencilLine size={16} />
                            Rename
                          </Button>
                        )}
                      </div>

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
                            className="h-9"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleRenameWorkspace}
                              disabled={
                                !workspaceNameInput.trim() ||
                                renameWorkspaceBusy ||
                                workspaceNameInput.trim() === activeWorkspace.name
                              }
                            >
                              {renameWorkspaceBusy ? "Saving..." : "Save changes"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setWorkspaceNameInput(activeWorkspace.name);
                                setIsEditingWorkspaceName(false);
                              }}
                              disabled={renameWorkspaceBusy}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-[hsl(var(--surface-raised))] px-3 py-3 dark:border-white/10 dark:bg-[hsl(var(--surface-raised))]">
                          <p className={cn("text-xs", subtleTextClass)}>Current name</p>
                          <p className="mt-1 text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                            {activeWorkspace.name}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {myRole && <RoleContextPanel role={myRole} />}

                  {isInfluencer && (
                    <div className="rounded-xl px-4 py-3 [border:1px_solid_#cce0ff] [background:linear-gradient(180deg,#f7fbff_0%,#edf4ff_100%)] dark:[border-color:#2c4f7c] dark:[background:#1b2638]">
                      <div className="flex items-start gap-3">
                        <Info size={16} className={cn("mt-0.5", atlBlueTextClass)} />
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                            Influencer plan
                          </p>
                          <p className={cn("text-xs leading-4", subtleTextClass)}>
                            Team invites and multiple workspaces require Agency.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

            </div>

            <section className={surfaceClass}>
              <SectionHeader
                title="Access control"
                description="Members and invitations."
                icon={Users}
                action={
                  <div className="inline-flex rounded-lg border border-slate-200 bg-[hsl(var(--surface-raised))] p-1 dark:border-white/10 dark:bg-[hsl(var(--surface-raised))]">
                    {(["team", ...(!isInfluencer ? ["invitations"] : [])] as Tab[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTab(item)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-medium leading-4 transition-colors",
                          tab === item
                            ? "bg-[hsl(var(--surface))] text-slate-900 shadow-sm dark:bg-[hsl(var(--surface))] dark:text-white"
                            : cn(subtleTextClass, "hover:text-slate-900 dark:hover:text-white")
                        )}
                      >
                        {item === "team" ? "Team" : "Invitations"}
                      </button>
                    ))}
                  </div>
                }
              />

              <div className="space-y-3 p-4">
                {!isInfluencer && isAdminOrOwner && (
                  <div className={cn(raisedSurfaceClass, "space-y-3 p-4")}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                          Invite teammate
                        </p>
                        <p className={cn("text-xs leading-4", subtleTextClass)}>
                          Send a role-based invite.
                        </p>
                      </div>
                      {!showInviteForm && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowInviteForm(true);
                            setInviteSuccess(false);
                          }}
                          className="h-8 rounded-md border-slate-300 px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-[#c7d1db] dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <UserPlus size={16} />
                          Add teammate
                        </Button>
                      )}
                    </div>

                    {showInviteForm && (
                      <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px]">
                          <Input
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                            autoFocus
                            className="h-9"
                          />
                          <Select
                            value={inviteRole}
                            onValueChange={(value) => setInviteRole(value as WorkspaceRole)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {roleLabel(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleInvite}
                            disabled={!inviteEmail.trim() || inviteBusy}
                          >
                            {inviteBusy ? "Sending..." : "Send invite"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowInviteForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {inviteSuccess && (
                      <p className="text-sm text-[#216e4e] dark:text-[#7ee2b8]">
                        Invitation sent.
                      </p>
                    )}
                  </div>
                )}

                {loading ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className={cn(
                          "h-28 animate-pulse rounded-lg border bg-muted/50",
                          dividerClass
                        )}
                      />
                    ))}
                  </div>
                ) : tab === "team" ? (
                  members.length === 0 ? (
                    <EmptyState
                      title="No team members yet"
                      description="Invite teammates to centralize approvals and keep workspace ownership clear."
                    />
                  ) : (
                    <div className="space-y-4">
                      {roleGroups.map((role) => {
                        const group = groupedMembers[role];
                        if (!group?.length) return null;

                        return (
                          <div key={role} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className={cn("text-sm font-semibold leading-5", roleHeadingClass(role))}>
                                {role === "VIEWER" ? "Viewers" : `${roleLabel(role)}s`}
                              </p>
                              <span className={cn("text-xs", subtleTextClass)}>
                                {group.length}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {group.map((member) => {
                                const fullName = [member.firstName, member.lastName]
                                  .filter(Boolean)
                                  .join(" ");
                                const initials =
                                  (
                                    (member.firstName?.[0] ?? "") +
                                    (member.lastName?.[0] ?? "")
                                  ).toUpperCase() ||
                                  (member.email?.[0]?.toUpperCase() ?? "?");

                                return (
                                  <div
                                    key={member.userId}
                                    className={cn(
                                      raisedSurfaceClass,
                                      "flex flex-col gap-3 p-4 lg:flex-row lg:items-center"
                                    )}
                                  >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                      <div
                                        className={cn(
                                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                                          avatarToneClass(member.role)
                                        )}
                                      >
                                        {initials}
                                      </div>

                                      <div className="min-w-0 space-y-1">
                                        <p
                                          className={cn(
                                            "truncate text-sm leading-5",
                                            fullName
                                              ? "font-medium text-slate-900 dark:text-[#f1f5f9]"
                                              : subtleTextClass
                                          )}
                                        >
                                          {fullName || "Unknown user"}
                                        </p>
                                        {member.email && (
                                          <p className={cn("truncate text-xs leading-4", subtleTextClass)}>
                                            {member.email}
                                          </p>
                                        )}
                                        <p className={cn("text-xs", subtleTextClass)}>
                                          Joined {formatDisplayDate(member.joinedAt)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                      {isOwner && member.role !== "OWNER" ? (
                                        <Select
                                          value={member.role}
                                          onValueChange={(value) =>
                                            handleRoleChange(member.userId, value as WorkspaceRole)
                                          }
                                        >
                                          <SelectTrigger className="h-8 w-[132px] rounded-md border-slate-300 bg-white dark:border-white/10 dark:bg-[#161a22]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {ROLE_OPTIONS.map((roleOption) => (
                                              <SelectItem key={roleOption} value={roleOption}>
                                                {roleLabel(roleOption)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <span
                                          className={cn(
                                            "inline-flex h-8 items-center rounded-full border px-2.5 text-xs font-medium",
                                            roleBadgeClass(member.role)
                                          )}
                                        >
                                          {roleLabel(member.role)}
                                        </span>
                                      )}

                                      {isAdminOrOwner && member.role !== "OWNER" && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemove(member.userId)}
                                          className="h-8 rounded-md px-2.5 text-muted-foreground hover:bg-[#ffeceb] hover:text-[#ae2e24] dark:hover:bg-[#2b1917] dark:hover:text-[#fd9891]"
                                        >
                                          <Trash size={16} />
                                          Remove
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : invitations.length === 0 ? (
                  <EmptyState
                    title="No pending invitations"
                    description="New invitations will appear here until they are accepted or revoked."
                  />
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.token}
                        className={cn(
                          raisedSurfaceClass,
                          "flex flex-col gap-3 p-4 lg:flex-row lg:items-center"
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#cce0ff] bg-[#e9f2ff] text-[#0c66e4] dark:border-[#2c4f7c] dark:bg-[#1b2638] dark:text-[#85b8ff]">
                            <Mail size={18} />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                              {invitation.invitedEmail}
                            </p>
                            <p className={cn("flex items-center gap-1 text-xs leading-4", subtleTextClass)}>
                              <History size={14} />
                              Expires{" "}
                              {new Date(invitation.expiresAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex h-8 items-center rounded-full border px-2.5 text-xs font-medium",
                              roleBadgeClass(invitation.role)
                            )}
                          >
                            {roleLabel(invitation.role)}
                          </span>

                          {isAdminOrOwner && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeInvitation(invitation.token)}
                              className="h-8 rounded-md px-2.5 text-muted-foreground hover:bg-[#ffeceb] hover:text-[#ae2e24] dark:hover:bg-[#2b1917] dark:hover:text-[#fd9891]"
                            >
                              <Trash size={16} />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}


              </div>
            </section>
          </div>

          {!loading && isAdminOrOwner && !isInfluencer && (
            <div className="space-y-4">
              <section className={surfaceClass}>
                <SectionHeader
                  title="Deleted workspaces"
                  description="Restore removed workspaces."
                  icon={ArchiveRestore}
                  iconBadgeClass={neutralIconBadgeClass}
                />
                <div className="p-4">
                  {deletedWorkspaces.length === 0 ? (
                    <EmptyState
                      title="No deleted workspaces"
                      description="Restorable workspaces will appear here."
                    />
                  ) : (
                    <div className="grid gap-3">
                      {deletedWorkspaces.map((workspace) => (
                        <div key={workspace.id} className={cn(raisedSurfaceClass, "p-4")}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium leading-5 text-slate-900 dark:text-[#f1f5f9]">
                                {workspace.name}
                              </p>
                              <p className={cn("mt-1 text-xs leading-4", subtleTextClass)}>
                                Deleted {formatDisplayDate(workspace.deletedAt ?? undefined)}
                              </p>
                              <p className={cn("mt-1 text-xs", subtleTextClass)}>
                                Access retained as {roleLabel(workspace.role)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestoreWorkspace(workspace)}
                              disabled={restoreBusyId === workspace.id}
                              className="h-8 rounded-md border-slate-300 px-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-[#c7d1db] dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <ArchiveRestore size={16} />
                              {restoreBusyId === workspace.id ? "Restoring..." : "Restore"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {canDeleteWorkspace && (
                <section className="rounded-xl border border-[#f5c2c7] bg-[#fff7f7] dark:border-[#5d1f1a] dark:bg-[#241716]">
                  <SectionHeader
                    title="Danger zone"
                    description="Delete this workspace."
                    icon={AlertTriangle}
                    iconBadgeClass={dangerIconBadgeClass}
                    action={
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash size={16} />
                        Delete workspace
                      </Button>
                    }
                  />
                  <div className="p-4">
                    <p className={cn("text-xs leading-4", subtleTextClass)}>
                      Deleting removes team access immediately. Restore it later from deleted workspaces.
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
