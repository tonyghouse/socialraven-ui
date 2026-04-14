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
  WorkspaceApprovalRule,
  WorkspaceInvitation,
  WorkspaceApprovalMode,
  WorkspaceMember,
  WorkspaceResponse,
  WorkspaceRole,
} from "@/model/Workspace";
import { PostType } from "@/model/PostType";
import { ConnectedAccount } from "@/model/ConnectedAccount";
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
import { fetchAllConnectedAccountsApi } from "@/service/allConnectedAccounts";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  APPROVAL_MODE_METADATA,
  approvalModeDescription,
  approvalModeLabel as getApprovalModeLabel,
} from "@/lib/approval-workflow";

type Tab = "team" | "invitations";
type ScopedApprovalModeInput = WorkspaceApprovalMode | "DEFAULT";

type LoadDataOptions = {
  silent?: boolean;
  syncWorkspaceList?: boolean;
};

const ROLE_OPTIONS: WorkspaceRole[] = ["ADMIN", "EDITOR", "READ_ONLY"];
const CONTENT_TYPE_RULE_TYPES: PostType[] = ["IMAGE", "VIDEO", "TEXT"];
const APPROVAL_MODE_OPTIONS: Array<{
  value: WorkspaceApprovalMode;
  label: string;
  description: string;
}> = (Object.entries(APPROVAL_MODE_METADATA) as Array<
  [WorkspaceApprovalMode, { label: string; description: string }]
>).map(([value, metadata]) => ({
  value,
  label: metadata.label,
  description: metadata.description,
}));

const ROLE_ORDER: Record<WorkspaceRole, number> = {
  OWNER: 0,
  ADMIN: 1,
  EDITOR: 2,
  READ_ONLY: 3,
};

const surfaceClass =
  "rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
const raisedSurfaceClass =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] shadow-none";
const subtleTextClass = "text-[var(--ds-gray-900)]";
const dividerClass = "border-[var(--ds-gray-400)]";
const accentTextClass = "text-[var(--ds-plum-700)]";
const sectionIconBadgeClass =
  "border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
const neutralIconBadgeClass =
  "border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
const dangerIconBadgeClass =
  "border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]";
const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1.5 text-copy-12 font-medium text-[var(--ds-gray-900)]";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const secondaryButtonClassName = cn(
  "h-8 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] shadow-none transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] disabled:pointer-events-none disabled:opacity-50",
  focusRingClassName
);
const primaryButtonClassName = cn(
  "h-8 rounded-md border border-transparent bg-[hsl(var(--accent))] px-3 text-label-14 text-white shadow-none transition-colors hover:bg-[hsl(var(--accent-hover))] disabled:pointer-events-none disabled:opacity-50",
  focusRingClassName
);
const ghostButtonClassName = cn(
  "h-8 rounded-md px-2.5 text-label-14 text-[var(--ds-gray-900)] shadow-none transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)] disabled:pointer-events-none disabled:opacity-50",
  focusRingClassName
);
const destructiveButtonClassName = cn(
  "h-8 rounded-md border border-transparent bg-[var(--ds-red-600)] px-3 text-label-14 text-white shadow-none transition-colors hover:bg-[var(--ds-red-700)] disabled:pointer-events-none disabled:opacity-50",
  focusRingClassName
);
const destructiveGhostButtonClassName = cn(
  "h-8 rounded-md px-2.5 text-label-14 text-[var(--ds-gray-900)] shadow-none transition-colors hover:bg-[var(--ds-red-100)] hover:text-[var(--ds-red-700)] disabled:pointer-events-none disabled:opacity-50",
  focusRingClassName
);
const inputClassName = cn(
  "h-9 rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-900)] shadow-none",
  focusRingClassName,
  "focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]"
);
const selectTriggerClassName = cn(
  "rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none transition-colors hover:border-[var(--ds-gray-500)] data-[placeholder]:text-[var(--ds-gray-900)]",
  focusRingClassName,
  "focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
);
const selectContentClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-lg shadow-black/[0.04]";
const selectItemClassName =
  "focus:bg-[var(--ds-gray-100)] focus:text-[var(--ds-gray-1000)]";
const checkboxClassName =
  "rounded-[0.375rem] border-[var(--ds-gray-500)] bg-[var(--ds-background-100)] text-white focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] data-[state=checked]:border-[hsl(var(--accent))] data-[state=checked]:bg-[hsl(var(--accent))]";
const subtlePanelClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-3";
const dashedNoticeClassName =
  "rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 text-copy-12 text-[var(--ds-gray-900)]";
const infoPanelClassName =
  "rounded-xl border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] px-4 py-3";
const warningPanelClassName =
  "rounded-xl border border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] px-4 py-3";
const dangerPanelClassName =
  "rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)]";
const DEFAULT_RULE_VALUE = "DEFAULT";

function roleLabel(role: WorkspaceRole) {
  switch (role) {
    case "READ_ONLY":
      return "Read Only";
    case "EDITOR":
      return "Editor";
    case "ADMIN":
      return "Admin";
    case "OWNER":
      return "Owner";
  }
}

function roleGroupLabel(role: WorkspaceRole) {
  switch (role) {
    case "READ_ONLY":
      return "Read-only teammates";
    case "EDITOR":
      return "Editors";
    case "ADMIN":
      return "Admins";
    case "OWNER":
      return "Owners";
  }
}

function roleBadgeClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
    case "ADMIN":
      return "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
    case "EDITOR":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "READ_ONLY":
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
  }
}

function approvalModeLabel(mode: WorkspaceApprovalMode) {
  return getApprovalModeLabel(mode);
}

function avatarToneClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
    case "ADMIN":
      return "bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
    case "EDITOR":
      return "bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "READ_ONLY":
      return "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
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
  EDITOR: {
    icon: Users,
    title: "Editor",
    description: "Creates and manages content without admin privileges.",
  },
  READ_ONLY: {
    icon: Eye,
    title: "Read Only",
    description: "Has read-only visibility into workspace activity.",
  },
};

function formatDisplayDate(date: string | undefined) {
  if (!date) return "Recently";
  return new Date(date).toLocaleString(undefined, {
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
      workspace.companyId === other.companyId &&
      workspace.name === other.name &&
      workspace.companyName === other.companyName &&
      workspace.companyLogoS3Key === other.companyLogoS3Key &&
      workspace.logoS3Key === other.logoS3Key &&
      workspace.role === other.role &&
      workspace.approvalMode === other.approvalMode &&
      workspace.autoScheduleAfterApproval === other.autoScheduleAfterApproval &&
      workspace.ownerFinalApprovalRequired === other.ownerFinalApprovalRequired &&
      workspace.approverUserIds.join(",") === other.approverUserIds.join(",") &&
      workspace.publisherUserIds.join(",") === other.publisherUserIds.join(",") &&
      serializeApprovalRules(workspace.approvalRules) === serializeApprovalRules(other.approvalRules) &&
      workspace.capabilities.join(",") === other.capabilities.join(",") &&
      workspace.createdAt === other.createdAt &&
      workspace.updatedAt === other.updatedAt &&
      workspace.deletedAt === other.deletedAt
    );
  });
}

function serializeApprovalRules(rules: WorkspaceApprovalRule[]) {
  return [...rules]
    .map((rule) => ({
      scopeType: rule.scopeType,
      scopeValue: rule.scopeValue,
      approvalMode: rule.approvalMode,
    }))
    .sort((left, right) =>
      `${left.scopeType}:${left.scopeValue}:${left.approvalMode}`.localeCompare(
        `${right.scopeType}:${right.scopeValue}:${right.approvalMode}`
      )
    )
    .map((rule) => `${rule.scopeType}:${rule.scopeValue}:${rule.approvalMode}`)
    .join("|");
}

function sortStringValues(values: string[]) {
  return [...values].sort().join(",");
}

function memberDisplayLabel(member: WorkspaceMember) {
  return [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email || member.userId;
}

function buildApprovalRulePayload(
  accountRuleModes: Record<string, ScopedApprovalModeInput>,
  contentTypeRuleModes: Record<PostType, ScopedApprovalModeInput>
) {
  const accountRules = Object.entries(accountRuleModes)
    .filter(([, approvalMode]) => approvalMode !== DEFAULT_RULE_VALUE)
    .map(([scopeValue, approvalMode]) => ({
      scopeType: "ACCOUNT" as const,
      scopeValue,
      approvalMode: approvalMode as WorkspaceApprovalMode,
    }));

  const contentTypeRules = CONTENT_TYPE_RULE_TYPES.filter(
    (contentType) => contentTypeRuleModes[contentType] !== DEFAULT_RULE_VALUE
  ).map((contentType) => ({
    scopeType: "CONTENT_TYPE" as const,
    scopeValue: contentType,
    approvalMode: contentTypeRuleModes[contentType] as WorkspaceApprovalMode,
  }));

  return [...accountRules, ...contentTypeRules];
}

function buildContentTypeRuleModes(rules: WorkspaceApprovalRule[]) {
  return CONTENT_TYPE_RULE_TYPES.reduce<Record<PostType, ScopedApprovalModeInput>>(
    (acc, contentType) => {
      acc[contentType] =
        rules.find(
          (rule) =>
            rule.scopeType === "CONTENT_TYPE" && rule.scopeValue === contentType
        )?.approvalMode ?? DEFAULT_RULE_VALUE;
      return acc;
    },
    {
      IMAGE: DEFAULT_RULE_VALUE,
      VIDEO: DEFAULT_RULE_VALUE,
      TEXT: DEFAULT_RULE_VALUE,
    }
  );
}

function buildAccountRuleModes(
  providerUserIds: string[],
  rules: WorkspaceApprovalRule[]
) {
  return providerUserIds.reduce<Record<string, ScopedApprovalModeInput>>((acc, providerUserId) => {
    acc[providerUserId] =
      rules.find(
        (rule) => rule.scopeType === "ACCOUNT" && rule.scopeValue === providerUserId
      )?.approvalMode ?? DEFAULT_RULE_VALUE;
    return acc;
  }, {});
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
          <h2 className="text-label-14 font-semibold leading-5 text-[var(--ds-gray-1000)]">
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
        "rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-8 text-center",
        dividerClass
      )}
    >
      <p className="text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">{title}</p>
      <p className={cn("mt-1 text-xs leading-4", subtleTextClass)}>{description}</p>
    </div>
  );
}

function roleHeadingClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "text-[var(--ds-plum-700)]";
    case "ADMIN":
      return "text-[var(--ds-plum-700)]";
    case "EDITOR":
      return "text-[var(--ds-green-700)]";
    case "READ_ONLY":
      return "text-[var(--ds-gray-900)]";
  }
}

function roleContextAccentClass(role: WorkspaceRole) {
  switch (role) {
    case "OWNER":
      return "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
    case "ADMIN":
      return "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]";
    case "EDITOR":
      return "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]";
    case "READ_ONLY":
      return "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]";
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
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
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
  const [approvalModeInput, setApprovalModeInput] = useState<WorkspaceApprovalMode>("OPTIONAL");
  const [autoScheduleAfterApprovalInput, setAutoScheduleAfterApprovalInput] = useState(true);
  const [editorApproverIds, setEditorApproverIds] = useState<string[]>([]);
  const [editorPublisherIds, setEditorPublisherIds] = useState<string[]>([]);
  const [contentTypeRuleModes, setContentTypeRuleModes] = useState<
    Record<PostType, ScopedApprovalModeInput>
  >({
    IMAGE: DEFAULT_RULE_VALUE,
    VIDEO: DEFAULT_RULE_VALUE,
    TEXT: DEFAULT_RULE_VALUE,
  });
  const [accountRuleModes, setAccountRuleModes] = useState<
    Record<string, ScopedApprovalModeInput>
  >({});
  const [savingApprovalRules, setSavingApprovalRules] = useState(false);

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
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("EDITOR");
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
          Promise<ConnectedAccount[]>,
          Promise<void> | null,
        ] = [
          workspaceId ? getMembersApi(getToken, workspaceId) : Promise.resolve([]),
          workspaceId && isAdminOrOwner
            ? getInvitationsApi(getToken, workspaceId)
            : Promise.resolve([]),
          getDeletedWorkspacesApi(getToken).catch(() => []),
          workspaceId ? fetchAllConnectedAccountsApi(getToken).catch(() => []) : Promise.resolve([]),
          syncWorkspaceList ? refresh() : null,
        ];

        const [m, inv, deleted, accounts] = await Promise.all(requests);

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
        setConnectedAccounts((current) =>
          JSON.stringify(current) === JSON.stringify(accounts) ? current : accounts
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
    const workspaceApprovalRules = activeWorkspace?.approvalRules ?? [];
    const accountRuleIds = Array.from(
      new Set([
        ...connectedAccounts.map((account) => account.providerUserId),
        ...workspaceApprovalRules
          .filter((rule) => rule.scopeType === "ACCOUNT")
          .map((rule) => rule.scopeValue),
      ])
    );
    setApprovalModeInput(activeWorkspace?.approvalMode ?? "OPTIONAL");
    setAutoScheduleAfterApprovalInput(activeWorkspace?.autoScheduleAfterApproval ?? true);
    setEditorApproverIds(activeWorkspace?.approverUserIds ?? []);
    setEditorPublisherIds(activeWorkspace?.publisherUserIds ?? []);
    setContentTypeRuleModes(buildContentTypeRuleModes(workspaceApprovalRules));
    setAccountRuleModes(buildAccountRuleModes(accountRuleIds, workspaceApprovalRules));
  }, [
    activeWorkspace?.approvalMode,
    activeWorkspace?.autoScheduleAfterApproval,
    activeWorkspace?.approvalRules,
    activeWorkspace?.approverUserIds,
    activeWorkspace?.id,
    activeWorkspace?.publisherUserIds,
    connectedAccounts,
  ]);

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

  async function handleSaveApprovalRules() {
    if (!workspaceId || !isAdminOrOwner) return;
    setSavingApprovalRules(true);
    try {
      await updateWorkspaceApi(getToken, workspaceId, {
        approvalMode: approvalModeInput,
        autoScheduleAfterApproval: autoScheduleAfterApprovalInput,
        approverUserIds: editorApproverIds,
        publisherUserIds: editorPublisherIds,
        approvalRules: buildApprovalRulePayload(accountRuleModes, contentTypeRuleModes),
      });
      await refresh();
      await loadData({ silent: true, syncWorkspaceList: true });
      toast.success("Approval workflow updated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update approval workflow");
    } finally {
      setSavingApprovalRules(false);
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
  const sortedConnectedAccounts = [...connectedAccounts].sort((left, right) =>
    `${left.platform}:${left.username}:${left.providerUserId}`.localeCompare(
      `${right.platform}:${right.username}:${right.providerUserId}`
    )
  );
  const editorMembers = sortedMembers.filter((member) => member.role === "EDITOR");
  const defaultApproverMembers = sortedMembers.filter(
    (member) => member.role === "OWNER" || member.role === "ADMIN"
  );
  const defaultPublisherMembers = defaultApproverMembers;
  const activeApprovalMode = activeWorkspace?.approvalMode ?? "OPTIONAL";
  const activeAutoScheduleAfterApproval = activeWorkspace?.autoScheduleAfterApproval ?? true;
  const activeApproverUserIds = activeWorkspace?.approverUserIds ?? [];
  const activePublisherUserIds = activeWorkspace?.publisherUserIds ?? [];
  const approvalRulesPayload = buildApprovalRulePayload(accountRuleModes, contentTypeRuleModes);
  const activeApprovalRuleSignature = serializeApprovalRules(activeWorkspace?.approvalRules ?? []);
  const currentApprovalRuleSignature = approvalRulesPayload
    .map((rule) => `${rule.scopeType}:${rule.scopeValue}:${rule.approvalMode}`)
    .sort()
    .join("|");
  const approvalRulesDirty =
    approvalModeInput !== activeApprovalMode ||
    autoScheduleAfterApprovalInput !== activeAutoScheduleAfterApproval ||
    sortStringValues(editorApproverIds) !== sortStringValues(activeApproverUserIds) ||
    sortStringValues(editorPublisherIds) !== sortStringValues(activePublisherUserIds) ||
    currentApprovalRuleSignature !== activeApprovalRuleSignature;
  const groupedMembers = sortedMembers.reduce<Record<WorkspaceRole, WorkspaceMember[]>>(
    (acc, member) => {
      if (!acc[member.role]) acc[member.role] = [];
      acc[member.role].push(member);
      return acc;
    },
    {} as Record<WorkspaceRole, WorkspaceMember[]>
  );
  const roleGroups: WorkspaceRole[] = ["OWNER", "ADMIN", "EDITOR", "READ_ONLY"];

  if (!activeWorkspace && !loading) {
    return (
      <div className="w-full px-5 py-5 md:px-6 md:py-6">
          <div className="space-y-5">
          <div className="space-y-2">
            <p className={cn("text-xs", subtleTextClass)}>Workspace settings</p>
            <h1 className="text-title-20 leading-6 text-[var(--ds-gray-1000)]">
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
                          <p className="truncate text-label-14 font-medium text-[var(--ds-gray-1000)]">
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
                          className={secondaryButtonClassName}
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
    return (
      <div className="p-8 text-label-14 text-[var(--ds-gray-900)]">
        Loading workspace settings...
      </div>
    );
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
          <div className="w-full max-w-md rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-lg shadow-black/[0.06]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] text-[var(--ds-red-700)]">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h2 className="text-label-14 font-semibold leading-5 text-[var(--ds-gray-1000)]">
                  Delete workspace?
                </h2>
                <p className={cn("text-sm leading-5", subtleTextClass)}>
                  This removes access for the whole team immediately. Type{" "}
                  <span className="font-medium text-[var(--ds-gray-1000)]">
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
                className={inputClassName}
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
                className={secondaryButtonClassName}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteWorkspace}
                disabled={deleteBusy || deleteConfirmValue.trim() !== activeWorkspace.name}
                className={destructiveButtonClassName}
              >
                {deleteBusy ? "Deleting..." : "Delete workspace"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProtectedPageHeader
        title={`Manage ${workspaceName}`}
        description={activeWorkspace.companyName
          ? `Company: ${activeWorkspace.companyName}`
          : "Administer members, invitations, and workspace controls."}
        icon={<FolderKanban className="h-4 w-4" />}
        actions={
          <>
            <div
              className={cn(
                "hidden items-center gap-2 rounded-md border bg-[var(--ds-background-100)] px-3 py-2 text-xs font-medium leading-4 shadow-sm md:inline-flex",
                dividerClass
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-[var(--ds-green-600)]",
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
              className={secondaryButtonClassName}
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

      <div className="w-full px-5 py-5 md:px-6 md:py-6">
        <div className="space-y-5">
          {error && (
            <div className="rounded-xl border border-[var(--ds-red-200)] bg-[var(--ds-red-100)] px-4 py-3 text-label-14 text-[var(--ds-red-700)]">
              {error}
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[21.25rem_minmax(0,1fr)]">
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
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]">
                        <BriefcaseBusiness size={18} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
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
                            "flex h-10 w-full items-center justify-between rounded-xl border bg-[var(--ds-background-100)] px-3 text-sm transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]",
                            dividerClass,
                            focusRingClassName
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <BriefcaseBusiness size={16} className={accentTextClass} />
                            <span className="truncate text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
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
                          <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-1 shadow-lg shadow-black/[0.04]">
                            {workspaces.map((ws) => (
                              <button
                                key={ws.id}
                                type="button"
                                onClick={() => {
                                  switchWorkspace(ws);
                                  setSwitcherOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors hover:bg-[var(--ds-gray-100)]",
                                  focusRingClassName
                                )}
                              >
                                <BriefcaseBusiness size={16} className={accentTextClass} />
                                <span className="flex-1 truncate text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
                                  {ws.name}
                                </span>
                                {ws.id === activeWorkspace.id && (
                                  <Check size={14} className="text-[var(--ds-plum-700)]" />
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
                          className={secondaryButtonClassName}
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
                          <p className="text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
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
                          className={cn(
                            "rounded-md p-1 text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]",
                            focusRingClassName
                          )}
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
                        className={inputClassName}
                      />

                      {createWorkspaceError && (
                        <p className="text-label-14 text-[var(--ds-red-700)]">{createWorkspaceError}</p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCreateWorkspace}
                          disabled={!newWorkspaceName.trim() || createWorkspaceBusy}
                          className={primaryButtonClassName}
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
                          className={ghostButtonClassName}
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
                          <p className="text-label-14 font-medium text-[var(--ds-gray-1000)]">
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
                            className={secondaryButtonClassName}
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
                            className={inputClassName}
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
                              className={primaryButtonClassName}
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
                              className={ghostButtonClassName}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={subtlePanelClassName}>
                          <p className={cn("text-xs", subtleTextClass)}>Current name</p>
                          <p className="mt-1 text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
                            {activeWorkspace.name}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={cn(raisedSurfaceClass, "space-y-4 p-4")}>
                    <div className="space-y-1">
                      <p className="text-label-14 font-medium text-[var(--ds-gray-1000)]">
                        Approval workflow
                      </p>
                      <p className={cn("text-sm", subtleTextClass)}>
                        Configure the default review mode, scoped approval rules, and editor capability overlays.
                      </p>
                    </div>

                    {isAdminOrOwner ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                            Review mode
                          </p>
                          <Select
                            value={approvalModeInput}
                            onValueChange={(value) => setApprovalModeInput(value as WorkspaceApprovalMode)}
                          >
                            <SelectTrigger className={cn(selectTriggerClassName, "h-10")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={selectContentClassName}>
                              {APPROVAL_MODE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className={selectItemClassName}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className={cn("text-xs leading-4", subtleTextClass)}>
                            {APPROVAL_MODE_OPTIONS.find((option) => option.value === approvalModeInput)?.description}
                          </p>
                        </div>

                        <div className={subtlePanelClassName}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-label-14 font-medium text-[var(--ds-gray-1000)]">
                                Auto-schedule after final approval
                              </p>
                              <p className={cn("text-xs leading-4", subtleTextClass)}>
                                When enabled, final approval immediately adds approved content to the publishing queue. When disabled, approved content stays locked in an approved state until a publisher activates the schedule.
                              </p>
                            </div>
                            <Checkbox
                              checked={autoScheduleAfterApprovalInput}
                              onCheckedChange={(checked) =>
                                setAutoScheduleAfterApprovalInput(checked === true)
                              }
                              className={checkboxClassName}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                            Default approvers
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {defaultApproverMembers.length > 0 ? (
                              defaultApproverMembers.map((member) => (
                                <span key={member.userId} className={pillClass}>
                                  {memberDisplayLabel(member)}
                                  <span className="text-[0.6875rem] text-[var(--ds-gray-900)]">
                                    {roleLabel(member.role)}
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className={cn("text-xs", subtleTextClass)}>
                                Owners and admins automatically inherit approval rights.
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                              Editor approvers
                            </p>
                            <p className={cn("text-xs leading-4", subtleTextClass)}>
                              Grant selected editors the ability to approve posts in the review queue.
                            </p>
                          </div>

                          {editorMembers.length === 0 ? (
                            <div className={dashedNoticeClassName}>
                              Invite or assign editors first to grant extra approver capability.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {editorMembers.map((member) => {
                                const checked = editorApproverIds.includes(member.userId);
                                const label = memberDisplayLabel(member);

                                return (
                                  <label
                                    key={member.userId}
                                    className={cn(
                                      "flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                                      checked
                                        ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)]"
                                        : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
                                    )}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(nextChecked) => {
                                        setEditorApproverIds((current) =>
                                          nextChecked
                                            ? [...current, member.userId].filter(
                                                (value, index, array) => array.indexOf(value) === index
                                              )
                                            : current.filter((value) => value !== member.userId)
                                        );
                                      }}
                                      className={cn("mt-0.5", checkboxClassName)}
                                    />
                                    <div className="space-y-1">
                                      <p className="text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
                                        {label}
                                      </p>
                                      <p className={cn("text-xs leading-4", subtleTextClass)}>
                                        Can approve pending review items. Publishing still follows the effective rule for each campaign.
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                            Default publishers
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {defaultPublisherMembers.length > 0 ? (
                              defaultPublisherMembers.map((member) => (
                                <span key={member.userId} className={pillClass}>
                                  {memberDisplayLabel(member)}
                                  <span className="text-[0.6875rem] text-[var(--ds-gray-900)]">
                                    {roleLabel(member.role)}
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className={cn("text-xs", subtleTextClass)}>
                                Owners and admins automatically inherit publishing rights.
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                              Editor publishers
                            </p>
                            <p className={cn("text-xs leading-4", subtleTextClass)}>
                              Grant selected editors direct scheduling rights when a campaign resolves to optional approval.
                            </p>
                          </div>

                          {editorMembers.length === 0 ? (
                            <div className={dashedNoticeClassName}>
                              Invite or assign editors first to grant extra publisher capability.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {editorMembers.map((member) => {
                                const checked = editorPublisherIds.includes(member.userId);
                                const label = memberDisplayLabel(member);

                                return (
                                  <label
                                    key={member.userId}
                                    className={cn(
                                      "flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors",
                                      checked
                                        ? "border-[var(--ds-green-200)] bg-[var(--ds-green-100)]"
                                        : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
                                    )}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(nextChecked) => {
                                        setEditorPublisherIds((current) =>
                                          nextChecked
                                            ? [...current, member.userId].filter(
                                                (value, index, array) => array.indexOf(value) === index
                                              )
                                            : current.filter((value) => value !== member.userId)
                                        );
                                      }}
                                      className={cn("mt-0.5", checkboxClassName)}
                                    />
                                    <div className="space-y-1">
                                      <p className="text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
                                        {label}
                                      </p>
                                      <p className={cn("text-xs leading-4", subtleTextClass)}>
                                        Can schedule directly when the effective rule for a campaign is optional approval.
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                              Content-type rules
                            </p>
                            <p className={cn("text-xs leading-4", subtleTextClass)}>
                              Override the workspace default for image, video, or text campaigns.
                            </p>
                          </div>
                          <div className="space-y-2">
                            {CONTENT_TYPE_RULE_TYPES.map((contentType) => (
                              <div
                                key={contentType}
                                className="grid gap-2 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3 sm:grid-cols-[8.125rem_minmax(0,1fr)]"
                              >
                                <div>
                                  <p className="text-label-14 font-medium text-[var(--ds-gray-1000)]">
                                    {contentType.charAt(0) + contentType.slice(1).toLowerCase()}
                                  </p>
                                  <p className={cn("text-xs leading-4", subtleTextClass)}>
                                    Use a stricter rule when this content type needs extra review.
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <Select
                                    value={contentTypeRuleModes[contentType]}
                                    onValueChange={(value) =>
                                      setContentTypeRuleModes((current) => ({
                                        ...current,
                                        [contentType]: value as ScopedApprovalModeInput,
                                      }))
                                    }
                                  >
                                    <SelectTrigger className={cn(selectTriggerClassName, "h-10")}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={selectContentClassName}>
                                      <SelectItem
                                        value={DEFAULT_RULE_VALUE}
                                        className={selectItemClassName}
                                      >
                                        Use workspace default
                                      </SelectItem>
                                      {APPROVAL_MODE_OPTIONS.map((option) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                          className={selectItemClassName}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className={cn("text-xs leading-4", subtleTextClass)}>
                                    {contentTypeRuleModes[contentType] === DEFAULT_RULE_VALUE
                                      ? "No content-type override. The workspace default will apply unless a campaign or account rule is stricter."
                                      : approvalModeDescription(
                                          contentTypeRuleModes[contentType] as WorkspaceApprovalMode
                                        )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                              Account rules
                            </p>
                            <p className={cn("text-xs leading-4", subtleTextClass)}>
                              Apply stricter or looser approval modes for specific client accounts. When a campaign targets multiple ruled accounts, the strictest matching rule wins.
                            </p>
                          </div>

                          {sortedConnectedAccounts.length === 0 ? (
                            <div className={dashedNoticeClassName}>
                              Connect at least one social account in this workspace before adding account-specific approval rules.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {sortedConnectedAccounts.map((account) => (
                                <div
                                  key={account.providerUserId}
                                  className="grid gap-2 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 py-3 sm:grid-cols-[minmax(0,1fr)_13.75rem]"
                                >
                                  <div className="min-w-0 space-y-1">
                                    <p className="truncate text-label-14 font-medium text-[var(--ds-gray-1000)]">
                                      {account.username || account.providerUserId}
                                    </p>
                                    <p className={cn("text-xs leading-4", subtleTextClass)}>
                                      {account.platform} account · {account.providerUserId}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Select
                                      value={accountRuleModes[account.providerUserId] ?? DEFAULT_RULE_VALUE}
                                      onValueChange={(value) =>
                                        setAccountRuleModes((current) => ({
                                          ...current,
                                          [account.providerUserId]: value as ScopedApprovalModeInput,
                                        }))
                                      }
                                    >
                                      <SelectTrigger className={cn(selectTriggerClassName, "h-10")}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className={selectContentClassName}>
                                        <SelectItem
                                          value={DEFAULT_RULE_VALUE}
                                          className={selectItemClassName}
                                        >
                                          Use workspace default
                                        </SelectItem>
                                        {APPROVAL_MODE_OPTIONS.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className={selectItemClassName}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <p className={cn("text-xs leading-4", subtleTextClass)}>
                                      {(accountRuleModes[account.providerUserId] ?? DEFAULT_RULE_VALUE) === DEFAULT_RULE_VALUE
                                        ? "No account-specific override. Content type or workspace rules will apply."
                                        : approvalModeDescription(
                                            accountRuleModes[account.providerUserId] as WorkspaceApprovalMode
                                          )}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className={infoPanelClassName}>
                          <p className="text-label-14 font-medium text-[var(--ds-gray-1000)]">
                            Rule precedence
                          </p>
                          <p className={cn("mt-1 text-xs leading-4", subtleTextClass)}>
                            Campaign override set by an approval-rule manager beats account rules. Account rules beat content-type rules. Content-type rules beat the workspace default.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveApprovalRules}
                            disabled={savingApprovalRules || !approvalRulesDirty}
                            className={primaryButtonClassName}
                          >
                            {savingApprovalRules ? "Saving..." : "Save workflow"}
                          </Button>
                          {approvalRulesDirty && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setApprovalModeInput(activeWorkspace.approvalMode);
                                setAutoScheduleAfterApprovalInput(
                                  activeWorkspace.autoScheduleAfterApproval
                                );
                                setEditorApproverIds(activeWorkspace.approverUserIds);
                                setEditorPublisherIds(activeWorkspace.publisherUserIds);
                                setContentTypeRuleModes(
                                  buildContentTypeRuleModes(activeWorkspace.approvalRules)
                                );
                                setAccountRuleModes(
                                  buildAccountRuleModes(
                                    Array.from(
                                      new Set([
                                        ...sortedConnectedAccounts.map(
                                          (account) => account.providerUserId
                                        ),
                                        ...activeWorkspace.approvalRules
                                          .filter((rule) => rule.scopeType === "ACCOUNT")
                                          .map((rule) => rule.scopeValue),
                                      ])
                                    ),
                                    activeWorkspace.approvalRules
                                  )
                                );
                              }}
                              disabled={savingApprovalRules}
                              className={ghostButtonClassName}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={subtlePanelClassName}>
                          <p className={cn("text-xs", subtleTextClass)}>Current mode</p>
                          <p className="mt-1 text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
                            {approvalModeLabel(activeWorkspace.approvalMode)}
                          </p>
                          <p className={cn("mt-1 text-xs leading-4", subtleTextClass)}>
                            {approvalModeDescription(activeWorkspace.approvalMode)}
                          </p>
                        </div>
                        <div className={subtlePanelClassName}>
                          <p className={cn("text-xs", subtleTextClass)}>Auto-schedule policy</p>
                          <p className="mt-1 text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
                            {activeWorkspace.autoScheduleAfterApproval
                              ? "Approved content schedules automatically"
                              : "Approved content waits for a publisher to activate the schedule"}
                          </p>
                        </div>
                        {activeWorkspace.approverUserIds.length > 0 && (
                          <div>
                            <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                              Extra editor approvers
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {activeWorkspace.approverUserIds.map((userId) => {
                                const member = editorMembers.find((item) => item.userId === userId);
                                const label = member ? memberDisplayLabel(member) : userId;

                                return (
                                  <span key={userId} className={pillClass}>
                                    {label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {activeWorkspace.publisherUserIds.length > 0 && (
                          <div>
                            <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                              Extra editor publishers
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {activeWorkspace.publisherUserIds.map((userId) => {
                                const member = editorMembers.find((item) => item.userId === userId);
                                const label = member ? memberDisplayLabel(member) : userId;

                                return (
                                  <span key={userId} className={pillClass}>
                                    {label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {activeWorkspace.approvalRules.length > 0 && (
                          <div className="space-y-2">
                            <p className={cn("text-xs font-medium uppercase tracking-[0.06em]", subtleTextClass)}>
                              Scoped rules
                            </p>
                            <div className="space-y-2">
                              {activeWorkspace.approvalRules
                                .slice()
                                .sort((left, right) =>
                                  `${left.scopeType}:${left.scopeValue}`.localeCompare(
                                    `${right.scopeType}:${right.scopeValue}`
                                  )
                                )
                                .map((rule) => (
                                  <div key={rule.id} className={cn(raisedSurfaceClass, "px-3 py-3")}>
                                    <p className="text-label-14 font-medium text-[var(--ds-gray-1000)]">
                                      {rule.scopeType === "ACCOUNT"
                                        ? `Account: ${sortedConnectedAccounts.find(
                                            (account) => account.providerUserId === rule.scopeValue
                                          )?.username || rule.scopeValue}`
                                        : `${rule.scopeValue.charAt(0) + rule.scopeValue.slice(1).toLowerCase()} content`}
                                    </p>
                                    <p className={cn("mt-1 text-xs leading-4", subtleTextClass)}>
                                      {approvalModeLabel(rule.approvalMode)}. {approvalModeDescription(rule.approvalMode)}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {myRole && <RoleContextPanel role={myRole} />}

                  {isInfluencer && (
                    <div className={warningPanelClassName}>
                      <div className="flex items-start gap-3">
                        <Info size={16} className={cn("mt-0.5", accentTextClass)} />
                        <div className="space-y-1">
                          <p className="text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
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
                  <div className="inline-flex rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-1">
                    {(["team", ...(!isInfluencer ? ["invitations"] : [])] as Tab[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTab(item)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-medium leading-4 transition-colors",
                          tab === item
                            ? "bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-sm"
                            : cn(
                                subtleTextClass,
                                "hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]"
                              ),
                          focusRingClassName
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
                        <p className="text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
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
                          className={secondaryButtonClassName}
                        >
                          <UserPlus size={16} />
                          Add teammate
                        </Button>
                      )}
                    </div>

                    {showInviteForm && (
                      <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem]">
                          <Input
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                            autoFocus
                            className={inputClassName}
                          />
                          <Select
                            value={inviteRole}
                            onValueChange={(value) => setInviteRole(value as WorkspaceRole)}
                          >
                            <SelectTrigger className={cn(selectTriggerClassName, "h-9")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={selectContentClassName}>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem
                                  key={role}
                                  value={role}
                                  className={selectItemClassName}
                                >
                                  {roleLabel(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {inviteError && (
                          <p className="text-label-14 text-[var(--ds-red-700)]">{inviteError}</p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleInvite}
                            disabled={!inviteEmail.trim() || inviteBusy}
                            className={primaryButtonClassName}
                          >
                            {inviteBusy ? "Sending..." : "Send invite"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowInviteForm(false)}
                            className={ghostButtonClassName}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {inviteSuccess && (
                      <p className="text-label-14 text-[var(--ds-green-700)]">
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
                          "h-28 animate-pulse rounded-xl border bg-[var(--ds-gray-100)]",
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
                                {roleGroupLabel(role)}
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
                                            "truncate text-label-14 leading-5",
                                            fullName
                                              ? "font-medium text-[var(--ds-gray-1000)]"
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
                                          <SelectTrigger
                                            className={cn(selectTriggerClassName, "h-8 w-[8.25rem]")}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className={selectContentClassName}>
                                            {ROLE_OPTIONS.map((roleOption) => (
                                              <SelectItem
                                                key={roleOption}
                                                value={roleOption}
                                                className={selectItemClassName}
                                              >
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
                                          className={destructiveGhostButtonClassName}
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
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]">
                            <Mail size={18} />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
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
                              className={destructiveGhostButtonClassName}
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
                              <p className="truncate text-label-14 font-medium leading-5 text-[var(--ds-gray-1000)]">
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
                              className={secondaryButtonClassName}
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
                <section className={dangerPanelClassName}>
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
                        className={destructiveButtonClassName}
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
