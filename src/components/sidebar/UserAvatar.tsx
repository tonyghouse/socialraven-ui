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
  ChevronRight,
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
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleEscape);
    };
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
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Your account";
  const email = user?.primaryEmailAddress?.emailAddress;
  const actionItemClassName =
    "group flex min-h-11 w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-[background-color,border-color,color,box-shadow] duration-150";

  return (
    <div ref={ref} className="relative">
      {/* ─── Trigger ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
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
            <p className="truncate text-sm font-semibold tracking-[-0.01em] text-foreground">
              {fullName}
            </p>
            <p className="mt-0.5 truncate text-[13px] leading-5 text-[hsl(var(--foreground-muted))]">
              {email}
            </p>
          </div>
        )}
      </button>

      {/* ─── Dropdown ────────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            "absolute bottom-[calc(100%+10px)] z-[300] w-72 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-xl)]",
            collapsed ? "left-0" : "left-0"
          )}
          role="menu"
        >
          <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--foreground-subtle))]">
              Account
            </p>

            <div className="mt-3 flex items-start gap-3">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-[hsl(var(--border-subtle))]"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-semibold text-accent ring-1 ring-[hsl(var(--accent))]/10">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold leading-5 tracking-[-0.01em] text-foreground">
                  {fullName}
                </p>
                <p className="mt-1 truncate text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                  {email}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] px-2.5 py-1 text-[12px] font-semibold leading-4",
                      badge.tone
                    )}
                  >
                    <BadgeIcon size={12} className="shrink-0" />
                    {badge.label}
                  </span>

                  <span className="inline-flex items-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-2 py-1 text-[12px] font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                    Workspace access
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--surface-sunken))]/45 p-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className={cn(
                actionItemClassName,
                "text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface))] hover:text-foreground hover:shadow-[var(--shadow-xs)]"
              )}
              role="menuitem"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))] transition-colors group-hover:text-[hsl(var(--accent))]">
                <Settings size={16} className="shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5 text-foreground">
                  Profile &amp; Settings
                </p>
                <p className="truncate text-[13px] leading-5 text-[hsl(var(--foreground-muted))]">
                  Manage your account, preferences, and workspace details
                </p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-[hsl(var(--foreground-subtle))]" />
            </Link>

            <button
              onClick={() => signOut()}
              className={cn(
                actionItemClassName,
                "mt-1 text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--destructive))]/20 hover:bg-[hsl(var(--destructive))]/[0.08] hover:text-[hsl(var(--destructive))]"
              )}
              role="menuitem"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))] transition-colors group-hover:border-[hsl(var(--destructive))]/20 group-hover:text-[hsl(var(--destructive))]">
                <LogOut size={16} className="shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5">
                  Sign out
                </p>
                <p className="truncate text-[13px] leading-5 text-[hsl(var(--foreground-muted))] group-hover:text-[hsl(var(--destructive))]">
                  End this session on this device
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
