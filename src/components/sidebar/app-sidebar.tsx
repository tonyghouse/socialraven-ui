"use client";

import {
  BarChart3 as ChartBar,
  BriefcaseBusiness,
  Building2 as Buildings,
  Calendar,
  CalendarCheck,
  CheckCheck,
  ChevronLeft as CaretLeft,
  CreditCard,
  FilePen as NotePencil,
  Home,
  LibraryBig,
  Plug,
  Send as PaperPlaneTilt,
  History as ClockCounterClockwise,
} from "lucide-react";
import type { LucideIcon as Icon } from "lucide-react";

import Image from "next/image";
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
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { canWrite, canSeeAgencyOps, canSeeApprovalQueue, isOwner, canManageAssetLibrary } = useRole();

  const navGroups = [
    {
      label: null,
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Content",
      items: [
        ...(canWrite ? [{ title: "Schedule Post", url: "/schedule-post", icon: PaperPlaneTilt }] : []),
        ...(canWrite || canManageAssetLibrary ? [{ title: "Asset Library", url: "/asset-library", icon: LibraryBig }] : []),
        ...(canSeeAgencyOps ? [{ title: "Agency Ops", url: "/agency-ops", icon: BriefcaseBusiness }] : []),
        ...(canSeeApprovalQueue ? [{ title: "Approvals", url: "/approvals", icon: CheckCheck }] : []),
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
        { title: "Connect Accounts", url: "/connect-accounts", icon: Plug },
        { title: "Workspace Settings", url: "/workspace/settings", icon: Buildings },
        ...(isOwner ? [{ title: "Billing & Plans", url: "/billing", icon: CreditCard }] : []),
      ],
    },
  ];

  const navItemBase =
    "group relative flex items-center gap-2.5 rounded-lg border text-sm font-medium leading-5 transition-[background-color,color,border-color,box-shadow] duration-150";
  const navItemActive =
    "border-[hsl(var(--accent))]/15 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] shadow-xs";
  const navItemIdle =
    "border-transparent text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]";

  return (
    <aside
      className={cn(
        "relative z-30 flex h-screen shrink-0 flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]",
        "transition-[width] duration-200 ease-out",
        isCollapsed ? "w-[68px]" : "w-[228px]"
      )}
    >
      <div
        className={cn(
          "relative border-b border-[hsl(var(--border-subtle))]",
          isCollapsed ? "px-2 py-2.5" : "px-2.5 py-2.5"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "flex-col gap-3" : "justify-between gap-3"
          )}
        >
          <NextLink
            href="/dashboard"
            className={cn(
              "group flex min-w-0 items-center rounded-xl border border-transparent transition-colors",
              isCollapsed
                ? "justify-center p-1 hover:bg-[hsl(var(--surface-raised))]"
                : "flex-1 gap-2 px-1 py-1 hover:bg-[hsl(var(--surface-raised))]"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-xs">
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven"
                width={24}
                height={24}
                className="h-4 w-4 shrink-0"
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-5 text-[hsl(var(--foreground))]">
                  SocialRaven
                </p>
              </div>
            )}
          </NextLink>

          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent text-[hsl(var(--foreground-subtle))] transition-colors",
              "hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground-muted))]"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CaretLeft
              size={16}
              className={cn(
                "transition-transform duration-200",
                isCollapsed && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-b border-[hsl(var(--border-subtle))]",
          isCollapsed ? "px-2 py-2.5" : "px-2.5 py-2.5"
        )}
      >
        <div
          className={cn(
            "rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-sunken))]",
            isCollapsed ? "flex justify-center px-2 py-2" : "p-2"
          )}
        >
          <WorkspaceSwitcher collapsed={isCollapsed} />
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto",
          isCollapsed ? "px-2 py-3" : "px-2.5 py-3"
        )}
      >
        <TooltipProvider delayDuration={300}>
          <div className="space-y-3.5">
            {navGroups.map(({ label, items }, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {label && (
                  <div className="pb-0.5">
                    {!isCollapsed ? (
                      <p className="px-2.5 text-xs font-medium leading-4 text-[hsl(var(--foreground-subtle))]">
                        {label}
                      </p>
                    ) : (
                      <div className="mx-auto w-6 border-t border-[hsl(var(--border-subtle))]" />
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
                        navItemBase,
                        isCollapsed
                          ? "h-8 justify-center px-0"
                          : "h-8 px-2",
                        isActive
                          ? navItemActive
                          : navItemIdle
                      )}
                    >
                      {isActive && (
                        <span
                          className={cn(
                            "absolute rounded-full bg-[hsl(var(--accent))]",
                            isCollapsed
                              ? "top-1 h-1 w-3 left-1/2 -translate-x-1/2"
                              : "left-1 top-1/2 h-4 w-1 -translate-y-1/2"
                          )}
                        />
                      )}

                      <div
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-md transition-colors duration-150",
                          isCollapsed ? "h-6 w-6" : "h-5 w-5",
                          isActive
                            ? "bg-white/70 text-[hsl(var(--accent))] dark:bg-[hsl(var(--surface))]"
                            : "text-[hsl(var(--foreground-muted))] group-hover:text-[hsl(var(--foreground))]"
                        )}
                      >
                        <Icon size={16} />
                      </div>

                      {!isCollapsed && (
                        <div className="min-w-0 flex-1">
                          <span className="truncate">
                            {title}
                          </span>
                        </div>
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

      <div
        className={cn(
          "border-t border-[hsl(var(--border-subtle))]",
          isCollapsed ? "px-2 py-2.5" : "px-2.5 py-2.5"
        )}
      >
        <div
          className={cn(
            "rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-sunken))]",
            isCollapsed
              ? "flex flex-col items-center gap-1.5 p-1.5"
              : "space-y-1.5 p-1.5"
          )}
        >
          <ThemeSwitcher
            compact={isCollapsed}
            align={isCollapsed ? "end" : "start"}
            className={cn("w-full", isCollapsed ? "w-10" : "justify-between")}
          />
          <UserAvatar size="md" collapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
