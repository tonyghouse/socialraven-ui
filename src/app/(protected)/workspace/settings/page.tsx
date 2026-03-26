"use client";

import { useEffect, useState } from "react";
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
import { Trash2, UserPlus, Mail, Users, Clock, Info, ChevronDown, Check, Building2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { createWorkspaceApi } from "@/service/workspace";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Tab = "team" | "invitations";

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
    <div className="flex items-center gap-2 px-1 mb-2">
      <span className={cn("text-xs font-semibold uppercase tracking-wider", colors[role])}>
        {roleLabel(role)}s
      </span>
      <span className="text-xs text-muted-foreground">·</span>
      <span className="text-xs text-muted-foreground">{count}</span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workspace switcher
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Create workspace
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [createWorkspaceBusy, setCreateWorkspaceBusy] = useState(false);
  const [createWorkspaceError, setCreateWorkspaceError] = useState<string | null>(null);

  // Confirm dialog
  const [pendingConfirm, setPendingConfirm] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);

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

  async function loadData() {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [m, inv] = await Promise.all([
        getMembersApi(getToken, workspaceId),
        isAdminOrOwner ? getInvitationsApi(getToken, workspaceId) : Promise.resolve([]),
      ]);
      setMembers(m);
      setInvitations(inv);
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

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
      await loadData();
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
      await loadData();
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
          await loadData();
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
          await loadData();
        } catch (e: any) {
          toast.error(e.message ?? "Failed to revoke invitation");
        }
      },
    });
  }

  if (!activeWorkspace) {
    return <div className="p-8 text-muted-foreground">No active workspace.</div>;
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
    <div className="w-full p-6 md:p-8 max-w-3xl">
      {/* Page header */}
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Workspace Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage members, roles, and invitations for your workspace.
      </p>

      {/* Workspace selector */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
            Workspace:
          </p>
          {isInfluencer ? (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-muted/40">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">main</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setSwitcherOpen((o) => !o)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">{workspaceName}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", switcherOpen && "rotate-180")} />
                </button>
                {switcherOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 min-w-48 rounded-lg border bg-popover shadow-md py-1">
                    {workspaces.map((ws: WorkspaceResponse) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          switchWorkspace(ws);
                          setSwitcherOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left"
                      >
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{ws.name}</span>
                        {ws.id === activeWorkspace.id && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
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
                  onClick={() => { setShowCreateWorkspace(true); setCreateWorkspaceError(null); }}
                  className="h-9 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> New workspace
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Inline create workspace form */}
        {showCreateWorkspace && (
          <div className="mt-3 border rounded-xl p-4 space-y-3 bg-muted/20 max-w-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">New workspace</p>
              <button onClick={() => { setShowCreateWorkspace(false); setNewWorkspaceName(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Input
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
              autoFocus
            />
            {createWorkspaceError && <p className="text-xs text-destructive">{createWorkspaceError}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim() || createWorkspaceBusy}>
                {createWorkspaceBusy ? "Creating…" : "Create"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowCreateWorkspace(false); setNewWorkspaceName(""); }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Influencer mode notice */}
      {isInfluencer && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-6">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-0.5">Influencer plan — single workspace</p>
            <p className="text-blue-700/80">
              Your plan includes one workspace (<strong>main</strong>). Inviting members and managing invitations are available on Agency plans.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {(["team", ...(!isInfluencer ? ["invitations"] : [])] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "team" ? (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Team
                {members.length > 0 && (
                  <span className="ml-0.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-normal">
                    {members.length}
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Invitations
                {invitations.length > 0 && (
                  <span className="ml-0.5 text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-normal">
                    {invitations.length}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg border bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Team tab */}
      {!loading && tab === "team" && (
        <div>
          {isAdminOrOwner && !isInfluencer && (
            <div className="mb-5">
              {!showInviteForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowInviteForm(true); setInviteSuccess(false); }}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add to team
                </Button>
              ) : (
                <div className="border rounded-xl p-4 space-y-3 mb-4 bg-muted/20">
                  <p className="text-sm font-medium">Invite by email</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                      autoFocus
                      className="flex-1"
                    />
                    <Select
                      value={inviteRole}
                      onValueChange={(v) => setInviteRole(v as WorkspaceRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleInvite} disabled={!inviteEmail.trim() || inviteBusy}>
                      {inviteBusy ? "Sending…" : "Send invite"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowInviteForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {inviteSuccess && (
                <p className="text-xs text-emerald-600 mt-1">Invitation sent!</p>
              )}
            </div>
          )}

          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No members yet.</p>
          ) : (
            <div className="space-y-5">
              {roleGroups.map((role) => {
                const group = groupedMembers[role];
                if (!group || group.length === 0) return null;
                return (
                  <div key={role}>
                    <RoleGroupHeading role={role} count={group.length} />
                    <div className="space-y-1.5">
                      {group.map((m) => {
                        const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ");
                        const initials = (
                          (m.firstName?.[0] ?? "") + (m.lastName?.[0] ?? "")
                        ).toUpperCase() || (m.email?.[0]?.toUpperCase() ?? "?");

                        return (
                          <div
                            key={m.userId}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
                          >
                            {/* Avatar */}
                            <div className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                              avatarBgClass(m.role)
                            )}>
                              {initials}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {fullName ? (
                                  <p className="text-sm font-medium">{fullName}</p>
                                ) : (
                                  <p className="text-sm font-medium text-muted-foreground italic">Unknown</p>
                                )}
                              </div>
                              {m.email && (
                                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                              )}
                              <p className="text-[10px] text-muted-foreground/60 truncate font-mono mt-0.5">
                                {m.userId}
                              </p>
                            </div>

                            {/* Role badge or selector */}
                            {isOwner && m.role !== "OWNER" ? (
                              <Select
                                value={m.role}
                                onValueChange={(v) => handleRoleChange(m.userId, v as WorkspaceRole)}
                              >
                                <SelectTrigger className="w-28 h-7 text-xs">
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
                                "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
                                roleBadgeClass(m.role)
                              )}>
                                {roleLabel(m.role)}
                              </span>
                            )}

                            {/* Remove button */}
                            {isAdminOrOwner && m.role !== "OWNER" && (
                              <button
                                onClick={() => handleRemove(m.userId)}
                                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
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

      {/* Invitations tab */}
      {!loading && tab === "invitations" && (
        <div className="space-y-1.5">
          {invitations.map((inv) => (
            <div
              key={inv.token}
              className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{inv.invitedEmail}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  Expires {new Date(inv.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", roleBadgeClass(inv.role))}>
                {roleLabel(inv.role)}
              </span>
              {isAdminOrOwner && (
                <button
                  onClick={() => handleRevokeInvitation(inv.token)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-1"
                  title="Revoke invitation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {invitations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pending invitations.
            </p>
          )}
        </div>
      )}
    </div>
    </>
  );
}
