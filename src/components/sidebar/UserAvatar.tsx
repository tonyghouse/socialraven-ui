"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect, type ElementType } from "react";
import {
  Crown,
  Eye,
  Settings,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { usePlan } from "@/hooks/usePlan";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceRole } from "@/model/Workspace";
import { PlanType } from "@/model/Plan";

// ─── badge configs ───────────────────────────────────────────────────────────

const ROLE_BADGE: Record<
  WorkspaceRole,
  { label: string; icon: ElementType; tone: string }
> = {
  OWNER:  { label: "Owner",  icon: Crown,       tone: "text-accent" },
  ADMIN:  { label: "Admin",  icon: ShieldCheck, tone: "text-accent" },
  MEMBER: { label: "Member", icon: Users,       tone: "text-[hsl(var(--foreground-muted))]" },
  VIEWER: { label: "Viewer", icon: Eye,         tone: "text-[hsl(var(--foreground-muted))]" },
};

const PLAN_LABELS: Partial<Record<PlanType, string>> = {
  INFLUENCER_TRIAL: "Influencer Trial",
  INFLUENCER_BASE:  "Influencer",
  INFLUENCER_PRO:   "Influencer Pro",
  AGENCY_TRIAL:     "Agency Trial",
  AGENCY_BASE:      "Agency",
  AGENCY_PRO:       "Agency Pro",
  AGENCY_CUSTOM:    "Agency Custom",
};

// ─── component ───────────────────────────────────────────────────────────────

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const avatarSize = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  // Build badge config
  let badge: { label: string; icon: ElementType; tone: string };

  if (isInfluencer) {
    badge = {
      label: plan ? (PLAN_LABELS[plan] ?? "Influencer") : "Influencer",
      icon: Sparkles,
      tone: "text-accent",
    };
  } else if (role === "OWNER" || role === "VIEWER") {
    // No change for owners and viewers
    badge = ROLE_BADGE[role];
  } else {
    // Teammate: collect unique ADMIN/MEMBER roles across all workspaces
    const teamRoles = [
      ...new Set(
        workspaces
          .map((w) => w.role)
          .filter((r): r is "ADMIN" | "MEMBER" => r === "ADMIN" || r === "MEMBER")
      ),
    ];
    const hasAdmin = teamRoles.includes("ADMIN");
    const hasMember = teamRoles.includes("MEMBER");
    const parts: string[] = [];
    if (hasAdmin) parts.push("Admin");
    if (hasMember) parts.push("Member");
    badge = {
      label: parts.join(" / ") || ROLE_BADGE[role].label,
      icon: hasAdmin ? ShieldCheck : Users,
      tone: hasAdmin ? "text-accent" : "text-[hsl(var(--foreground-muted))]",
    };
  }

  const BadgeIcon = badge.icon;

  return (
    <div ref={ref} className="relative">
      {/* ─── Trigger ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-[hsl(var(--surface-raised))]",
          collapsed && "justify-center px-0"
        )}
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User avatar"}
            className={`${avatarSize} shrink-0 rounded-lg object-cover`}
          />
        ) : (
          <div
            className={`${avatarSize} flex shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-medium text-accent`}
          >
            {initials}
          </div>
        )}

        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="truncate text-sm font-medium tracking-[-0.005em] text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="mt-0.5 truncate text-xs text-[hsl(var(--foreground-muted))]">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        )}
      </button>

      {/* ─── Dropdown ────────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            "absolute bottom-[calc(100%+8px)] z-[300] w-60 overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-lg",
            collapsed ? "left-0" : "left-0"
          )}
        >
          <div className="border-b border-[hsl(var(--border-subtle))] px-3 py-3">
            <div className="flex items-center gap-2.5">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-medium text-accent">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium tracking-[-0.005em] text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="mt-0.5 truncate text-xs text-[hsl(var(--foreground-muted))]">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            <div className="mt-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-2 py-1 text-xs font-medium",
                  badge.tone
                )}
              >
                <BadgeIcon size={12} className="shrink-0" />
                {badge.label}
              </span>
            </div>
          </div>

          <div className="p-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex h-8 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--surface-raised))] hover:text-foreground"
            >
              <Settings size={16} className="shrink-0" />
              Profile &amp; Settings
            </Link>
            <button
              onClick={() => signOut()}
              className="flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-sm font-medium text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--surface-raised))] hover:text-foreground"
            >
              <LogOut size={16} className="shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
