"use client";

import Image from "next/image";
import NextLink from "next/link";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";

import { getSidebarNavGroups, isSidebarItemActive } from "./navigation";
import { UserAvatar } from "./UserAvatar";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    canScrollUp: false,
    canScrollDown: false,
  });
  const scrollAreaRef = useRef<HTMLElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { canWrite, canSeeAgencyOps, canSeeApprovalQueue, isOwner, canManageAssetLibrary } = useRole();

  const navGroups = getSidebarNavGroups({
    canWrite,
    canSeeAgencyOps,
    canSeeApprovalQueue,
    isOwner,
    canManageAssetLibrary,
  });

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    const scrollContent = scrollContentRef.current;

    if (!scrollArea) {
      return;
    }

    const syncScrollState = () => {
      const { scrollTop, clientHeight, scrollHeight } = scrollArea;
      const threshold = 8;
      const hasOverflow = scrollHeight - clientHeight > threshold;

      setScrollState((prevState) => {
        const nextState = {
          hasOverflow,
          canScrollUp: hasOverflow && scrollTop > threshold,
          canScrollDown: hasOverflow && scrollTop + clientHeight < scrollHeight - threshold,
        };

        if (
          prevState.hasOverflow === nextState.hasOverflow &&
          prevState.canScrollUp === nextState.canScrollUp &&
          prevState.canScrollDown === nextState.canScrollDown
        ) {
          return prevState;
        }

        return nextState;
      });
    };

    syncScrollState();
    scrollArea.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(syncScrollState)
      : null;

    resizeObserver?.observe(scrollArea);
    if (scrollContent) {
      resizeObserver?.observe(scrollContent);
    }

    return () => {
      scrollArea.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
      resizeObserver?.disconnect();
    };
  }, [
    canManageAssetLibrary,
    canSeeAgencyOps,
    canSeeApprovalQueue,
    canWrite,
    isCollapsed,
    isOwner,
  ]);

  return (
    <aside
      className={cn(
        "relative z-30 flex h-screen shrink-0 flex-col border-r border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]",
        "transition-[width] duration-200 ease-out",
        isCollapsed ? "w-[72px]" : "w-[236px]"
      )}
    >
      <div className={cn("px-2.5 pb-1.5 pt-2.5", isCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
          <NextLink
            href="/dashboard"
            className={cn(
              "group flex min-w-0 items-center rounded-xl transition-colors hover:bg-[var(--ds-gray-100)]",
              isCollapsed ? "w-full justify-center px-0 py-1" : "flex-1 gap-2.5 px-2 py-1.5"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)]">
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven"
                width={20}
                height={20}
                className="h-5 w-5 shrink-0"
              />
            </div>

            {!isCollapsed ? (
              <div className="min-w-0">
                <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">SocialRaven</p>
              </div>
            ) : null}
          </NextLink>

          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform duration-200", isCollapsed && "rotate-180")}
            />
          </button>
        </div>

        <div className={cn("mt-2.5", isCollapsed && "flex justify-center")}>
          <WorkspaceSwitcher collapsed={isCollapsed} />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <nav
          ref={scrollAreaRef}
          className={cn("geist-scrollbar h-full overflow-y-auto px-2.5 pb-3 pt-2", isCollapsed && "px-2")}
        >
          <TooltipProvider delayDuration={250}>
            <div ref={scrollContentRef} className="space-y-4">
              {navGroups.map((group) => (
                <section key={group.label} className="space-y-1.5">
                  {!isCollapsed ? (
                    <p className="px-3 text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                      {group.label}
                    </p>
                  ) : null}

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = isSidebarItemActive(pathname, item.url);
                      const link = (
                        <NextLink
                          href={item.url}
                          className={cn(
                            "group flex items-center rounded-xl text-label-13 transition-colors",
                            isCollapsed
                              ? "h-10 justify-center px-0"
                              : "h-10 gap-2.5 px-3",
                            isActive
                              ? "bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
                              : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
                          )}
                        >
                          <div
                            className={cn(
                              "flex shrink-0 items-center justify-center rounded-lg transition-colors",
                              isCollapsed ? "h-7 w-7" : "h-7 w-7",
                              isActive
                                ? "bg-[var(--ds-background-100)] text-[var(--ds-blue-700)]"
                                : "text-[var(--ds-gray-900)] group-hover:bg-[var(--ds-background-100)] group-hover:text-[var(--ds-gray-1000)]"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </div>

                          {!isCollapsed ? (
                            <div className="min-w-0 flex-1">
                              <span className="truncate">{item.title}</span>
                            </div>
                          ) : null}
                        </NextLink>
                      );

                      if (!isCollapsed) {
                        return <div key={item.url}>{link}</div>;
                      }

                      return (
                        <Tooltip key={item.url}>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            sideOffset={8}
                            className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none"
                          >
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </TooltipProvider>
        </nav>

        <div
          className={cn(
            "sidebar-scroll-fade sidebar-scroll-fade-top",
            scrollState.hasOverflow && scrollState.canScrollUp ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "sidebar-scroll-fade sidebar-scroll-fade-bottom",
            scrollState.hasOverflow && scrollState.canScrollDown ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        >
          <div className="sidebar-scroll-cue">
            <span className="sidebar-scroll-cue-line sidebar-scroll-cue-line-left" />
            <span className="sidebar-scroll-cue-line sidebar-scroll-cue-line-right" />
          </div>
        </div>
      </div>

      <div className={cn("border-t border-[var(--ds-gray-400)] px-2.5 py-2.5", isCollapsed && "px-2")}>
        <div className="space-y-1.5">
          <div className={cn(isCollapsed && "flex justify-center")}>
            <ThemeSwitcher
              compact={isCollapsed}
              align={isCollapsed ? "center" : "start"}
              className={cn(
                isCollapsed
                  ? "h-9 w-9 rounded-xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
                  : "rounded-xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
              )}
            />
          </div>
          <UserAvatar size="md" collapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
