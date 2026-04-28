"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, LogOut, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { getSidebarNavGroups, isSidebarItemActive, type SidebarNavItem } from "./navigation";

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
  const navGroups = getSidebarNavGroups();

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
  }, [isCollapsed]);

  return (
    <TooltipProvider delayDuration={250}>
      <aside
        className={cn(
          "relative z-30 flex h-screen shrink-0 flex-col border-r border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]",
          "transition-[width] duration-200 ease-out",
          isCollapsed ? "w-[4.375rem]" : "w-[14.5rem]"
        )}
      >
        <div className={cn("px-2 pb-1 pt-2", isCollapsed && "px-1.5")}>
          <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
            <Link
              href="/dashboard"
              className={cn(
                "group flex min-w-0 items-center rounded-xl transition-colors hover:bg-[var(--ds-gray-100)]",
                isCollapsed ? "w-full justify-center px-0 py-1" : "flex-1 gap-2.5 px-2.5 py-1.5"
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
                  <p className="truncate text-base font-semibold tracking-[-0.01em] text-[var(--ds-gray-1000)]">
                    SocialRaven
                  </p>
                </div>
              ) : null}
            </Link>

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
        </div>

        <div className="relative min-h-0 flex-1">
          <nav
            ref={scrollAreaRef}
            className={cn("geist-scrollbar h-full overflow-y-auto px-2 pb-2.5 pt-1.5", isCollapsed && "px-1.5")}
          >
            <div ref={scrollContentRef} className="space-y-3.5">
              {navGroups.map((group) => (
                <section key={group.label} className="space-y-1.5">
                  {!isCollapsed ? (
                    <p className="px-3 text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
                      {group.label}
                    </p>
                  ) : null}

                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarNavLink
                        key={item.id}
                        item={item}
                        isCollapsed={isCollapsed}
                        isActive={isSidebarItemActive(pathname, item)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
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

        <div className={cn("border-t border-[var(--ds-gray-400)] px-2 py-2", isCollapsed && "px-1.5")}>
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
            <SidebarAccountSection collapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function SidebarNavLink({
  item,
  isCollapsed,
  isActive,
}: {
  item: SidebarNavItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const link = (
    <Link
      href={item.url}
      className={cn(
        "group flex items-center rounded-xl text-[0.875rem] font-medium transition-colors",
        isCollapsed ? "h-10 justify-center px-0" : "h-10 gap-2.5 px-3.5",
        isActive
          ? "bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)]"
          : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          isActive
            ? "bg-[var(--ds-background-100)] text-[var(--ds-blue-700)]"
            : "text-[var(--ds-gray-900)] group-hover:bg-[var(--ds-background-100)] group-hover:text-[var(--ds-gray-1000)]"
        )}
      >
        <item.icon className="h-[1.125rem] w-[1.125rem]" />
      </div>

      {!isCollapsed ? (
        <div className="min-w-0 flex-1">
          <span className="truncate">{item.title}</span>
        </div>
      ) : null}
    </Link>
  );

  if (!isCollapsed) {
    return link;
  }

  return (
    <Tooltip>
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
}

function SidebarAccountSection({ collapsed }: { collapsed: boolean }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  return (
    <div className="space-y-1.5">
      <SidebarAccountLink
        collapsed={collapsed}
        href="/dashboard"
        label="Profile"
        description={user?.primaryEmailAddress?.emailAddress ?? "Manage your account"}
        icon={<AvatarPreview imageUrl={user?.imageUrl} initials={initials} />}
      />
      <SidebarAccountButton
        collapsed={collapsed}
        label="Logout"
        description="End this session"
        icon={<LogOut className="h-4 w-4" />}
        onClick={() => signOut({ redirectUrl: "/sign-in" })}
      />
    </div>
  );
}

function SidebarAccountLink({
  collapsed,
  href,
  label,
  description,
  icon,
}: {
  collapsed: boolean;
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-xl transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]",
        collapsed ? "h-10 justify-center px-0 text-[var(--ds-gray-900)]" : "gap-3 px-3 py-2.5 text-[var(--ds-gray-900)]"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
        {collapsed ? <Settings className="h-4 w-4" /> : icon}
      </div>

      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
          <p className="truncate text-label-12 text-[var(--ds-gray-900)]">{description}</p>
        </div>
      ) : null}
    </Link>
  );

  if (!collapsed) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarAccountButton({
  collapsed,
  label,
  description,
  icon,
  onClick,
}: {
  collapsed: boolean;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const content = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-xl text-left transition-colors hover:bg-[var(--ds-red-100)] hover:text-[var(--ds-red-700)]",
        collapsed ? "h-10 justify-center px-0 text-[var(--ds-gray-900)]" : "gap-3 px-3 py-2.5 text-[var(--ds-gray-900)]"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)] text-current">
        {icon}
      </div>

      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">{label}</p>
          <p className="truncate text-label-12 text-[var(--ds-gray-900)]">{description}</p>
        </div>
      ) : null}
    </button>
  );

  if (!collapsed) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function AvatarPreview({
  imageUrl,
  initials,
}: {
  imageUrl?: string;
  initials: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="h-9 w-9 rounded-xl object-cover"
      />
    );
  }

  return <span className="text-label-12">{initials}</span>;
}
