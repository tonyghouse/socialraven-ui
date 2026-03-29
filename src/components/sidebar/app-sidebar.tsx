"use client";

import {
  Buildings,
  Calendar,
  CalendarCheck,
  CaretLeft,
  ChartBar,
  ClockCounterClockwise,
  CreditCard,
  House,
  NotePencil,
  PaperPlaneTilt,
  PlugsConnected,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRole } from "@/hooks/useRole";
import { usePlan } from "@/hooks/usePlan";
import { WorkspaceManageSheet } from "./WorkspaceManageSheet";

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const { canWrite, isOwner } = useRole();
  const { isInfluencer } = usePlan();
  // Agency owners get the full workspace management panel; everyone else gets the switcher
  const showManagePanel = !isInfluencer && isOwner;

  const navGroups = [
    {
      label: null,
      items: [
        { title: "Dashboard", url: "/dashboard", icon: House },
      ],
    },
    {
      label: "Content",
      items: [
        ...(canWrite ? [{ title: "Schedule Post", url: "/schedule-post", icon: PaperPlaneTilt }] : []),
        { title: "Calendar", url: "/calendar", icon: Calendar },
        { title: "Scheduled Posts", url: "/scheduled-posts", icon: ClockCounterClockwise },
        { title: "Drafts", url: "/drafts", icon: NotePencil },
        { title: "Published Posts", url: "/published-posts", icon: CalendarCheck },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Analytics", url: "/analytics", icon: ChartBar },
      ],
    },
    {
      label: "Accounts",
      items: [
        { title: "Connect Accounts", url: "/connect-accounts", icon: PlugsConnected },
        { title: "Workspace Settings", url: "/workspace/settings", icon: Buildings },
        ...(isOwner ? [{ title: "Billing & Plans", url: "/billing", icon: CreditCard }] : []),
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col shrink-0 z-30",
        "h-[calc(100vh-1rem)] m-2",
        "rounded-2xl bg-white/70 backdrop-blur-2xl",
        "border border-foreground/[0.07]",
        "shadow-[0_2px_24px_-8px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.75)]",
        "transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isCollapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* ─── Header ──────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center border-b border-foreground/[0.07]",
          isCollapsed
            ? "flex-col gap-2 px-0 pt-5 pb-4 items-center"
            : "flex-row justify-between px-4 h-16"
        )}
      >
        <NextLink
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0"
        >
          <img
            src="/SocialRavenLogo.svg"
            alt="SocialRaven"
            className="h-7 w-7 shrink-0"
          />
          {!isCollapsed && (
            <span className="font-semibold text-[14.5px] text-foreground/80 tracking-tight whitespace-nowrap">
              SocialRaven
            </span>
          )}
        </NextLink>

        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground/60 hover:bg-black/[0.05] transition-colors shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CaretLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* ─── Workspace Switcher / Manage Panel ───────────────────────────── */}
      <div
        className={cn(
          "px-2 pt-2 pb-1 border-b border-foreground/[0.07]",
          isCollapsed && "flex justify-center"
        )}
      >
        {showManagePanel
          ? <WorkspaceManageSheet collapsed={isCollapsed} />
          : <WorkspaceSwitcher collapsed={isCollapsed} />
        }
      </div>

      {/* ─── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <TooltipProvider delayDuration={300}>
          <div className="space-y-4">
            {navGroups.map(({ label, items }, groupIdx) => (
              <div key={groupIdx} className="space-y-px">
                {/* Section label (expanded) or divider (collapsed) */}
                {label && (
                  <div className="pb-1">
                    {!isCollapsed ? (
                      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-foreground/30 select-none">
                        {label}
                      </p>
                    ) : (
                      <div className="mx-3 border-t border-foreground/[0.07]" />
                    )}
                  </div>
                )}

                {items.map(({ title, url, icon: Icon }) => {
                  const isActive =
                    pathname === url || pathname.startsWith(url + "/");
                  const linkEl = (
                    <NextLink
                      key={url}
                      href={url}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl",
                        "text-[13.5px] font-medium leading-none",
                        "transition-colors duration-150 group",
                        isCollapsed
                          ? "justify-center py-3 px-0"
                          : "px-3 py-[11px]",
                        isActive
                          ? "bg-accent/[0.09] text-accent"
                          : "text-foreground/55 hover:bg-black/[0.04] hover:text-foreground/80"
                      )}
                    >
                      {/* Left active bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[18px] w-[3px] rounded-r-full bg-accent" />
                      )}

                      <Icon
                        className={cn(
                          "h-[17px] w-[17px] shrink-0 transition-colors duration-150",
                          isActive
                            ? "text-accent"
                            : "text-foreground/38 group-hover:text-foreground/60"
                        )}
                      />

                      {!isCollapsed && (
                        <span className="truncate">{title}</span>
                      )}
                    </NextLink>
                  );

                  if (!isCollapsed) return <div key={url}>{linkEl}</div>;

                  return (
                    <Tooltip key={url}>
                      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {title}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </nav>

      {/* ─── User ────────────────────────────────────────── */}
      <div
        className={cn(
          "px-2 py-3 border-t border-foreground/[0.07]",
          isCollapsed && "flex justify-center"
        )}
      >
        <UserAvatar size="md" collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
