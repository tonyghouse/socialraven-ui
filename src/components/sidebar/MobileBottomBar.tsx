"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight as ArrowsLeftRight,
  BarChart3 as ChartBar,
  Building2 as Buildings,
  Calendar,
  CalendarCheck,
  Check,
  CreditCard,
  Ellipsis as DotsThreeOutline,
  FilePen as NotePencil,
  History as ClockCounterClockwise,
  Home,
  LogOut as SignOut,
  Plug,
  Send as PaperPlaneTilt,
  User,
} from "lucide-react";
import type { LucideIcon as Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRole } from "@/hooks/useRole";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

// ─────────────────────────────────────────────────────────────────────────────

export function MobileBottomBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { canWrite, isOwner } = useRole();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();

  const drawerItems = [
    { title: "Analytics",        url: "/analytics",         icon: ChartBar },
    { title: "Drafts",           url: "/drafts",            icon: NotePencil },
    { title: "Published Posts",  url: "/published-posts",   icon: CalendarCheck },
    { title: "Connect Accounts", url: "/connect-accounts",  icon: Plug },
    { title: "Workspace Settings", url: "/workspace/settings", icon: Buildings },
    ...(isOwner ? [{ title: "Billing & Plans", url: "/billing", icon: CreditCard }] : []),
  ];

  const isMoreActive = drawerItems.some((item) =>
    pathname.startsWith(item.url)
  );

  return (
    <>
      <div
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-[195] transition-all duration-200",
          drawerOpen
            ? "pointer-events-auto bg-black/40"
            : "pointer-events-none bg-transparent"
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-x-2.5 z-[210] overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-lg",
          "transition-all duration-200 ease-out",
          drawerOpen
            ? "pointer-events-auto bottom-[72px] translate-y-0 opacity-100"
            : "pointer-events-none bottom-[64px] translate-y-2 opacity-0"
        )}
      >
        <div className="flex justify-center border-b border-[hsl(var(--border-subtle))] py-2">
          <div className="h-1 w-7 rounded-full bg-[hsl(var(--foreground-subtle))]/30" />
        </div>

        <div className="space-y-1 px-2 py-2">
          {drawerItems.map(({ title, url, icon: Icon }) => {
            const isActive = pathname.startsWith(url);
            return (
              <Link
                key={url}
                href={url}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex h-9 items-center gap-2.5 rounded-lg border px-3 text-[13px] font-medium transition-[background-color,color,border-color] duration-150",
                  isActive
                    ? "border-[hsl(var(--accent))]/15 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    : "border-transparent text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                    isActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground-muted))]"
                  )}
                >
                  <Icon size={16} />
                </div>
                {title}
              </Link>
            );
          })}
        </div>

        <div className="mx-4 border-t border-[hsl(var(--border-subtle))]" />

        {workspaces.length > 0 && (
          <div className="px-2 py-2">
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
              Workspace
            </p>
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setDrawerOpen(false);
                  if (activeWorkspace?.id !== w.id) switchWorkspace(w);
                }}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-lg border px-3 text-[13px] font-medium transition-[background-color,color,border-color] duration-150",
                  activeWorkspace?.id === w.id
                    ? "border-[hsl(var(--accent))]/15 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    : "border-transparent text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                    activeWorkspace?.id === w.id ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground-muted))]"
                  )}
                >
                  <ArrowsLeftRight size={16} />
                </div>
                <span className="flex-1 truncate text-left">{w.name}</span>
                {activeWorkspace?.id === w.id && (
                  <Check size={14} className="shrink-0 text-accent" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mx-4 border-t border-[hsl(var(--border-subtle))]" />

        <div className="px-2 py-2">
          <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
            Appearance
          </p>
          <ThemeSwitcher align="start" className="w-full justify-between" />
        </div>

        <div className="mx-4 border-t border-[hsl(var(--border-subtle))]" />

        <div className="px-2 py-2">
          <Link
            href="/profile"
            onClick={() => setDrawerOpen(false)}
            className="flex h-9 items-center gap-2.5 rounded-lg border border-transparent px-3 text-[13px] font-medium text-[hsl(var(--foreground-muted))] transition-[background-color,color,border-color] duration-150 hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-foreground"
          >
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded-md object-cover"
              />
            ) : (
              <User size={16} className="shrink-0" />
            )}
            <span className="flex-1 truncate">
              {user?.firstName} {user?.lastName}
            </span>
          </Link>

          <button
            onClick={() => {
              setDrawerOpen(false);
              signOut();
            }}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 text-[13px] font-medium text-[hsl(var(--foreground-muted))] transition-[background-color,color,border-color] duration-150 hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-foreground"
          >
            <SignOut size={16} className="shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[200] border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]",
          "pb-[max(env(safe-area-inset-bottom),0px)]"
        )}
      >
        <div className="mx-auto flex h-14 max-w-lg items-stretch px-1.5">
          <NavTab
            url="/dashboard"
            title="Dashboard"
            icon={Home}
            isActive={
              pathname === "/dashboard" || pathname.startsWith("/dashboard/")
            }
          />

          <NavTab
            url="/scheduled-posts"
            title="Scheduled"
            icon={ClockCounterClockwise}
            isActive={pathname.startsWith("/scheduled-posts")}
          />

          <div className="flex flex-1 items-center justify-center">
            {canWrite ? (
              <Link
                href="/schedule-post"
                aria-label="Schedule Post"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent text-white transition-transform duration-150 active:scale-95",
                  pathname.startsWith("/schedule-post") && "shadow-[0_0_0_1px_rgba(94,106,210,0.18)]"
                )}
              >
                <PaperPlaneTilt size={16} className="text-white" />
              </Link>
            ) : (
              <div
                aria-label="Schedule Post (view only)"
                title="Viewers cannot create posts"
                className={cn(
                  "flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] opacity-60"
                )}
              >
                <PaperPlaneTilt size={16} className="text-[hsl(var(--foreground-subtle))]" />
              </div>
            )}
          </div>

          <NavTab
            url="/calendar"
            title="Calendar"
            icon={Calendar}
            isActive={pathname.startsWith("/calendar")}
          />

          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="More navigation"
            className={cn(
              "relative flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95",
              isMoreActive || drawerOpen
                ? "text-accent"
                : "text-[hsl(var(--foreground-muted))]"
            )}
          >
            <span
              className={cn(
                "absolute top-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-b-full bg-accent transition-all duration-200",
                isMoreActive || drawerOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              )}
            />
            <DotsThreeOutline size={18} />
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isMoreActive || drawerOpen
                  ? "text-accent"
                  : "text-[hsl(var(--foreground-muted))]"
              )}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

// ── NavTab ────────────────────────────────────────────────────────────────────

function NavTab({
  url,
  title,
  icon: Icon,
  isActive,
}: {
  url: string;
  title: string;
  icon: Icon;
  isActive: boolean;
}) {
  return (
    <Link
      href={url}
      className={cn(
        "relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-95",
        isActive ? "text-accent" : "text-[hsl(var(--foreground-muted))]"
      )}
    >
      <span
        className={cn(
          "absolute top-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-b-full bg-accent",
          "transition-all duration-200",
          isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        )}
      />

      <Icon size={18} />
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          isActive ? "text-accent" : "text-[hsl(var(--foreground-muted))]"
        )}
      >
        {title}
      </span>
    </Link>
  );
}
