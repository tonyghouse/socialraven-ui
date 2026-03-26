"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Crown, ShieldCheck, Users, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { usePlan } from "@/hooks/usePlan";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceRole } from "@/model/Workspace";
import { PlanType } from "@/model/Plan";

// ─── badge configs ───────────────────────────────────────────────────────────

const ROLE_BADGE: Record<
  WorkspaceRole,
  { label: string; icon: React.ElementType; bg: string; text: string; border: string }
> = {
  OWNER:  { label: "Owner",  icon: Crown,       bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200/80"  },
  ADMIN:  { label: "Admin",  icon: ShieldCheck, bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200/80"    },
  MEMBER: { label: "Member", icon: Users,       bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80" },
  VIEWER: { label: "Viewer", icon: Eye,         bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200/80"   },
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
  let badge: { label: string; icon: React.ElementType; bg: string; text: string; border: string };

  if (isInfluencer) {
    badge = {
      label: plan ? (PLAN_LABELS[plan] ?? "Influencer") : "Influencer",
      icon: Sparkles,
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200/80",
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
      bg: hasAdmin ? "bg-blue-50" : "bg-emerald-50",
      text: hasAdmin ? "text-blue-700" : "text-emerald-700",
      border: hasAdmin ? "border-blue-200/80" : "border-emerald-200/80",
    };
  }

  const BadgeIcon = badge.icon;

  return (
    <div ref={ref} className="relative">
      {/* ─── Trigger ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-black/[0.05] transition-colors w-full"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User avatar"}
            className={`${avatarSize} rounded-xl object-cover shrink-0`}
          />
        ) : (
          <div
            className={`${avatarSize} rounded-xl bg-accent/15 flex items-center justify-center text-xs font-semibold text-accent shrink-0`}
          >
            {initials}
          </div>
        )}

        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-medium text-foreground/75 truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11.5px] text-foreground/40 truncate leading-tight mt-0.5">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        )}
      </button>

      {/* ─── Dropdown ────────────────────────────────────── */}
      {open && (
        <div className="absolute bottom-[calc(100%+6px)] left-0 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_-8px_rgba(15,23,42,0.18),0_2px_8px_-2px_rgba(15,23,42,0.08)] border border-foreground/[0.08] overflow-hidden z-[300]">

          {/* ── Identity header ── */}
          <div className="px-3 pt-3 pb-2.5 border-b border-foreground/[0.07]">
            <div className="flex items-center gap-2.5">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-xs font-semibold text-accent shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground/80 truncate leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-foreground/40 truncate leading-tight mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>

            {/* Role / plan badge */}
            <div className="mt-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-[3px] rounded-lg text-[11px] font-medium border",
                  badge.bg, badge.text, badge.border
                )}
              >
                <BadgeIcon className="h-3 w-3 shrink-0" />
                {badge.label}
              </span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="p-1.5 space-y-px">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-black/[0.05] text-[13px] font-medium text-foreground/70 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-foreground/40" />
              Profile &amp; Settings
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-[13px] font-medium text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
