"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  Calendar,
  LineChart,
  MoreHorizontal,
  CalendarCheck2,
  CalendarX2,
  Cable,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

// ── Items that live inside the More drawer ────────────────────────────────────
const drawerItems = [
  { title: "Published Posts", url: "/published-posts", icon: CalendarCheck2 },
  { title: "Failed Posts", url: "/failed-posts", icon: CalendarX2 },
  { title: "Connect Accounts", url: "/connect-accounts", icon: Cable },
];

// ─────────────────────────────────────────────────────────────────────────────

export function MobileBottomBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  const isMoreActive = drawerItems.some((item) =>
    pathname.startsWith(item.url)
  );

  return (
    <>
      {/* ─── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-[195] transition-all duration-300",
          drawerOpen
            ? "bg-black/20 backdrop-blur-[2px] pointer-events-auto"
            : "bg-transparent backdrop-blur-none pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* ─── More Drawer ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed left-3 right-3 z-[210]",
          "rounded-2xl overflow-hidden",
          "bg-white/92 backdrop-blur-2xl",
          "border border-foreground/[0.07]",
          "shadow-[0_-4px_32px_-8px_rgba(15,23,42,0.15),0_2px_8px_-2px_rgba(15,23,42,0.08)]",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          drawerOpen
            ? "bottom-[72px] opacity-100 translate-y-0 pointer-events-auto"
            : "bottom-[64px] opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-2.5">
          <div className="w-9 h-[3.5px] rounded-full bg-foreground/12" />
        </div>

        {/* Nav items */}
        <div className="px-2 pb-1 space-y-px">
          {drawerItems.map(({ title, url, icon: Icon }) => {
            const isActive = pathname.startsWith(url);
            return (
              <Link
                key={url}
                href={url}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl",
                  "text-[14px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-accent/[0.09] text-accent"
                    : "text-foreground/60 hover:bg-black/[0.04] hover:text-foreground/85"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? "text-accent" : "text-foreground/38"
                  )}
                />
                {title}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 my-1 border-t border-foreground/[0.07]" />

        {/* Profile & Sign Out */}
        <div className="px-2 pb-3 space-y-px">
          <Link
            href="/profile"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14px] font-medium text-foreground/60 hover:bg-black/[0.04] hover:text-foreground/85 transition-colors duration-150"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="h-5 w-5 rounded-lg object-cover shrink-0"
              />
            ) : (
              <User className="h-[18px] w-[18px] shrink-0 text-foreground/38" />
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
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors duration-150"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      {/* ─── Bottom Nav Bar ────────────────────────────────────────────────── */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[200]",
          "h-16",
          "bg-white/80 backdrop-blur-2xl",
          "border-t border-foreground/[0.08]",
          "shadow-[0_-1px_0_rgba(15,23,42,0.04)]"
        )}
      >
        <div className="flex items-stretch h-full max-w-lg mx-auto px-1">
          {/* Dashboard */}
          <NavTab
            url="/dashboard"
            title="Dashboard"
            icon={LayoutDashboard}
            isActive={
              pathname === "/dashboard" || pathname.startsWith("/dashboard/")
            }
          />

          {/* Scheduled Posts */}
          <NavTab
            url="/scheduled-posts"
            title="Scheduled"
            icon={Calendar}
            isActive={pathname.startsWith("/scheduled-posts")}
          />

          {/* ── FAB ── */}
          <div className="flex-1 flex items-center justify-center">
            <Link
              href="/schedule-post"
              aria-label="Schedule Post"
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "w-[52px] h-[52px] rounded-[16px]",
                "bg-accent",
                "shadow-[0_4px_16px_-2px_rgba(59,130,246,0.45)]",
                "transition-all duration-150 active:scale-90 active:shadow-none",
                pathname.startsWith("/schedule-post") && "opacity-85"
              )}
            >
              <Send className="h-[19px] w-[19px] text-white" />
              <span className="text-[9.5px] font-semibold text-white/80 leading-none -mt-0.5">
                Post
              </span>
            </Link>
          </div>

          {/* Analytics */}
          <NavTab
            url="/analytics"
            title="Analytics"
            icon={LineChart}
            isActive={pathname.startsWith("/analytics")}
          />

          {/* More */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="More navigation"
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-1 h-full",
              "transition-all duration-150 active:scale-90",
              isMoreActive || drawerOpen
                ? "text-accent"
                : "text-foreground/38"
            )}
          >
            <MoreHorizontal className="h-[22px] w-[22px]" />
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isMoreActive || drawerOpen
                  ? "text-accent"
                  : "text-foreground/35"
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
  icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <Link
      href={url}
      className={cn(
        "relative flex-1 flex flex-col items-center justify-center gap-1 h-full",
        "transition-all duration-150 active:scale-90",
        isActive ? "text-accent" : "text-foreground/38"
      )}
    >
      {/* Top active pill */}
      <span
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] w-5 rounded-b-full bg-accent",
          "transition-all duration-200",
          isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        )}
      />

      <Icon className="h-[22px] w-[22px]" />
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          isActive ? "text-accent" : "text-foreground/35"
        )}
      >
        {title}
      </span>
    </Link>
  );
}
