"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceInvitation, WorkspaceMember, WorkspaceRole } from "@/model/Workspace";
import { getMembersApi, removeMemberApi, updateMemberRoleApi } from "@/service/member";
import { getInvitationsApi, revokeInvitationApi, sendInviteApi } from "@/service/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, Mail, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "members" | "invitations";

const ROLE_OPTIONS: WorkspaceRole[] = ["ADMIN", "MEMBER", "VIEWER"];

function roleBadgeColor(role: WorkspaceRole) {
  switch (role) {
    case "OWNER": return "bg-amber-100 text-amber-800";
    case "ADMIN": return "bg-blue-100 text-blue-800";
    case "MEMBER": return "bg-green-100 text-green-800";
    case "VIEWER": return "bg-gray-100 text-gray-700";
  }
}

export default function WorkspaceSettingsPage() {
  const { getToken } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      alert(e.message ?? "Failed to update role");
    }
  }

  async function handleRemove(userId: string) {
    if (!workspaceId) return;
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await removeMemberApi(getToken, workspaceId, userId);
      await loadData();
    } catch (e: any) {
      alert(e.message ?? "Failed to remove member");
    }
  }

  async function handleRevokeInvitation(token: string) {
    if (!confirm("Revoke this invitation?")) return;
    try {
      await revokeInvitationApi(getToken, token);
      await loadData();
    } catch (e: any) {
      alert(e.message ?? "Failed to revoke invitation");
    }
  }

  if (!activeWorkspace) {
    return <div className="p-8 text-muted-foreground">No active workspace.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-1">{activeWorkspace.name}</h1>
      <p className="text-sm text-muted-foreground mb-6">Workspace settings</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {(["members", "invitations"] as Tab[]).map((t) => (
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
            {t === "members" ? (
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Members</span>
            ) : (
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Invitations</span>
            )}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Members tab */}
      {!loading && tab === "members" && (
        <div>
          {isAdminOrOwner && (
            <div className="mb-4">
              {!showInviteForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowInviteForm(true); setInviteSuccess(false); }}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite member
                </Button>
              ) : (
                <div className="border rounded-xl p-4 space-y-3 mb-4">
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
                          <SelectItem key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</SelectItem>
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
                <p className="text-xs text-green-600 mt-1">Invitation sent!</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate text-muted-foreground">{m.userId}</p>
                </div>
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
                          {r.charAt(0) + r.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", roleBadgeColor(m.role))}>
                    {m.role.charAt(0) + m.role.slice(1).toLowerCase()}
                  </span>
                )}
                {isAdminOrOwner && m.role !== "OWNER" && (
                  <button
                    onClick={() => handleRemove(m.userId)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No members yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Invitations tab */}
      {!loading && tab === "invitations" && (
        <div className="space-y-2">
          {invitations.map((inv) => (
            <div
              key={inv.token}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{inv.invitedEmail}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  Expires {new Date(inv.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", roleBadgeColor(inv.role))}>
                {inv.role.charAt(0) + inv.role.slice(1).toLowerCase()}
              </span>
              {isAdminOrOwner && (
                <button
                  onClick={() => handleRevokeInvitation(inv.token)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
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
  );
}
