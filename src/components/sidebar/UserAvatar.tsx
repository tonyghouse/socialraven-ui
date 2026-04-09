"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { type ElementType } from "react";
import {
  Crown,
  Eye,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { usePlan } from "@/hooks/usePlan";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PlanType } from "@/model/Plan";
import { WorkspaceRole } from "@/model/Workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_BADGE: Record<
  WorkspaceRole,
  { label: string; icon: ElementType; tone: string }
> = {
  OWNER: { label: "Owner", icon: Crown, tone: "text-[var(--ds-blue-700)] bg-[var(--ds-blue-100)]" },
  ADMIN: { label: "Admin", icon: ShieldCheck, tone: "text-[var(--ds-blue-700)] bg-[var(--ds-blue-100)]" },
  EDITOR: { label: "Editor", icon: Users, tone: "text-[var(--ds-gray-1000)] bg-[var(--ds-gray-100)]" },
  READ_ONLY: { label: "Read only", icon: Eye, tone: "text-[var(--ds-gray-1000)] bg-[var(--ds-gray-100)]" },
};

const PLAN_LABELS: Partial<Record<PlanType, string>> = {
  INFLUENCER_TRIAL: "Influencer Trial",
  INFLUENCER_BASE: "Influencer",
  INFLUENCER_PRO: "Influencer Pro",
  AGENCY_TRIAL: "Agency Trial",
  AGENCY_BASE: "Agency",
  AGENCY_PRO: "Agency Pro",
  AGENCY_CUSTOM: "Agency Custom",
};

export function UserAvatar({
  size = "md",
  collapsed = false,
}: {
  size?: "sm" | "md";
  collapsed?: boolean;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role } = useRole();
  const { plan, isInfluencer } = usePlan();
  const { workspaces } = useWorkspace();

  const avatarSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Your account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email";
  const badge = resolveBadge({ isInfluencer, plan, role, workspaces });
  const BadgeIcon = badge.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-xl transition-colors hover:bg-[var(--ds-gray-100)]",
            collapsed ? "justify-center px-0 py-1" : "px-2 py-2"
          )}
          aria-label={collapsed ? "Open account menu" : undefined}
        >
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "User avatar"}
              className={cn(avatarSize, "shrink-0 rounded-xl object-cover")}
            />
          ) : (
            <div
              className={cn(
                avatarSize,
                "flex shrink-0 items-center justify-center rounded-xl bg-[var(--ds-blue-100)] text-label-12 text-[var(--ds-blue-700)]"
              )}
            >
              {initials}
            </div>
          )}

          {!collapsed ? (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-label-13 text-[var(--ds-gray-1000)]">{fullName}</p>
              <p className="mt-0.5 truncate text-label-12 text-[var(--ds-gray-900)]">{email}</p>
            </div>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align="start"
        sideOffset={10}
        className="w-[17rem] rounded-2xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-2 shadow-none"
      >
        <div className="space-y-2">
          <div className="rounded-xl bg-[var(--ds-gray-100)] p-2.5">
            <div className="flex items-start gap-3">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-blue-100)] text-label-12 text-[var(--ds-blue-700)]">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-label-13 text-[var(--ds-gray-1000)]">{fullName}</p>
                <p className="mt-0.5 truncate text-label-12 text-[var(--ds-gray-900)]">{email}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label-12",
                  badge.tone
                )}
              >
                <BadgeIcon className="h-3 w-3 shrink-0" />
                {badge.label}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                <Settings className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-13 text-[var(--ds-gray-1000)]">Profile</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-red-100)] hover:text-[var(--ds-red-700)]"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] transition-colors group-hover:text-[var(--ds-red-700)]">
                <LogOut className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-label-13 text-[var(--ds-gray-1000)]">Sign out</p>
              </div>
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function resolveBadge({
  isInfluencer,
  plan,
  role,
  workspaces,
}: {
  isInfluencer: boolean;
  plan: PlanType | null;
  role: WorkspaceRole;
  workspaces: Array<{ role: WorkspaceRole }>;
}) {
  if (isInfluencer) {
    return {
      label: plan ? (PLAN_LABELS[plan] ?? "Influencer") : "Influencer",
      icon: Sparkles,
      tone: "text-[var(--ds-blue-700)] bg-[var(--ds-blue-100)]",
    };
  }

  if (role === "OWNER" || role === "READ_ONLY") {
    return ROLE_BADGE[role];
  }

  const teamRoles = [
    ...new Set(
      workspaces
        .map((workspace) => workspace.role)
        .filter((workspaceRole): workspaceRole is "ADMIN" | "EDITOR" => (
          workspaceRole === "ADMIN" || workspaceRole === "EDITOR"
        ))
    ),
  ];
  const hasAdmin = teamRoles.includes("ADMIN");
  const hasEditor = teamRoles.includes("EDITOR");

  if (hasAdmin && hasEditor) {
    return {
      label: "Admin / Editor",
      icon: ShieldCheck,
      tone: "text-[var(--ds-blue-700)] bg-[var(--ds-blue-100)]",
    };
  }

  if (hasAdmin) {
    return ROLE_BADGE.ADMIN;
  }

  return ROLE_BADGE.EDITOR;
}
