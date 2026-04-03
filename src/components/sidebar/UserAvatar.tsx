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
  EDITOR: { label: "Editor", icon: Users,       tone: "text-[hsl(var(--foreground-muted))]" },
  READ_ONLY: { label: "Read Only", icon: Eye,      tone: "text-[hsl(var(--foreground-muted))]" },
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
  } else if (role === "OWNER" || role === "READ_ONLY") {
    // No change for owners and read-only users
    badge = ROLE_BADGE[role];
  } else {
    // Teammate: collect unique ADMIN/EDITOR roles across all workspaces
    const teamRoles = [
      ...new Set(
        workspaces
          .map((w) => w.role)
          .filter((r): r is "ADMIN" | "EDITOR" => r === "ADMIN" || r === "EDITOR")
      ),
    ];
    const hasAdmin = teamRoles.includes("ADMIN");
    const hasEditor = teamRoles.includes("EDITOR");
    const parts: string[] = [];
    if (hasAdmin) parts.push("Admin");
    if (hasEditor) parts.push("Editor");
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
    "group flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm transition-[background-color,border-color,color] duration-150";

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
            <p className="truncate text-sm font-medium leading-5 text-foreground">
              {fullName}
            </p>
            <p className="mt-0.5 truncate text-xs leading-4 text-[hsl(var(--foreground-muted))]">
              {email}
            </p>
          </div>
        )}
      </button>

      {/* ─── Dropdown ────────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            "absolute bottom-[calc(100%+8px)] z-[300] w-56 overflow-hidden rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-[0_8px_24px_rgba(9,30,66,0.14)]",
            collapsed ? "left-0" : "left-0"
          )}
          role="menu"
        >
          <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-2.5 py-2.5">
            <div className="flex items-start gap-2.5">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-[hsl(var(--border-subtle))]"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-medium text-accent ring-1 ring-[hsl(var(--accent))]/10">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-5 text-foreground">
                  {fullName}
                </p>
                <p className="mt-0.5 truncate text-xs leading-4 text-[hsl(var(--foreground-muted))]">
                  {email}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2 py-0.5 text-xs font-medium leading-4",
                      badge.tone
                    )}
                  >
                    <BadgeIcon size={12} className="shrink-0" />
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--surface-sunken))]/45 p-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className={cn(
                actionItemClassName,
                "text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface))] hover:text-foreground"
              )}
              role="menuitem"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))] transition-colors group-hover:text-[hsl(var(--accent))]">
                <Settings size={15} className="shrink-0" />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-foreground">
                Profile &amp; Settings
              </span>
            </Link>

            <button
              onClick={() => signOut()}
              className={cn(
                actionItemClassName,
                "mt-1 text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--destructive))]/20 hover:bg-[hsl(var(--destructive))]/[0.08] hover:text-[hsl(var(--destructive))]"
              )}
              role="menuitem"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-muted))] transition-colors group-hover:border-[hsl(var(--destructive))]/20 group-hover:text-[hsl(var(--destructive))]">
                <LogOut size={15} className="shrink-0" />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium leading-5">
                Sign out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
