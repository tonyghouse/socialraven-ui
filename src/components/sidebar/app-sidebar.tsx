"use client";

import {
  Calendar,
  LayoutDashboard,
  CalendarCheck2,
  Cable,
  Menu,
  X,
  LineChart,
  ChevronLeft,
  Send,
  CalendarX2,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useRef, useEffect } from "react";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule Post", url: "/schedule-post", icon: Send },
  { title: "Scheduled Posts", url: "/scheduled-posts", icon: Calendar },
  { title: "Published Posts", url: "/published-posts", icon: CalendarCheck2 },
  { title: "Failed Posts", url: "/failed-posts", icon: CalendarX2 },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Connect Accounts", url: "/connect-accounts", icon: Cable },
];

// ── Shared avatar + dropdown ──────────────────────────────────────────────────
function UserAvatar({
  size = "md",
  collapsed = false,
}: {
  size?: "sm" | "md";
  collapsed?: boolean;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 transition w-full`}
      >
        {/* Avatar image or initials fallback */}
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User avatar"}
            className={`${avatarSize} rounded-xl object-cover shrink-0`}
          />
        ) : (
          <div
            className={`${avatarSize} rounded-xl bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent shrink-0`}
          >
            {initials}
          </div>
        )}

        {/* Name + email — hide when sidebar is collapsed */}
        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground/80 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-foreground/50 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-14 left-0 w-52 bg-white rounded-xl shadow-lg border border-foreground/10 p-2 space-y-1 z-50">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 text-sm text-foreground/80 transition"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 text-sm text-red-500 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────
export function AppSidebar() {
  const { isSignedIn } = useUser();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <>
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 w-full bg-white/70 backdrop-blur-xl border-b border-foreground/10 shadow-sm rounded-b-xl px-4">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-2 hover:bg-black/5 rounded-xl transition"
          >
            {isDrawerOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="/SocialRavenLogo.svg"
              alt="SocialRaven logo"
              className="h-6 w-6"
            />
            <span className="font-medium text-[15px] text-foreground/80 tracking-tight">
              SocialRaven
            </span>
          </Link>

          {/* Avatar in top-bar (no name/email, just photo) */}
          {isSignedIn && <UserAvatar size="sm" collapsed />}
        </div>

        {/* Overlay */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`
            fixed top-16 left-0
            h-[calc(100vh-4rem)] w-64
            bg-white/75 backdrop-blur-xl
            border-r border-foreground/10
            rounded-r-xl shadow-lg
            z-50 flex flex-col
            transition-transform duration-300
            ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <nav className="flex-1 px-3 py-5 space-y-1">
            {items.map(({ title, url, icon: Icon }) => (
              <Link
                key={title}
                href={url}
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-foreground/70 hover:bg-black/5 hover:text-accent transition-all"
              >
                <Icon className="h-5 w-5 text-foreground/50" />
                {title}
              </Link>
            ))}
          </nav>

          {/* User section at bottom of drawer */}
          {isSignedIn && (
            <div className="px-3 py-4 border-t border-foreground/10">
              <UserAvatar size="md" collapsed={false} />
            </div>
          )}
        </div>
      </>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div
      className={`
        h-[calc(100vh-1rem)] m-2 flex flex-col
        rounded-xl bg-white/60 backdrop-blur-2xl
        border border-foreground/10
        shadow-[0_8px_30px_-20px_rgba(0,0,0,0.18)]
        transition-all duration-500
        ${isCollapsed ? "w-20" : "w-56"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-foreground/10">
        {!isCollapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2">
              <img
                src="/SocialRavenLogo.svg"
                alt="SocialRaven logo"
                className="h-6 w-6"
              />
              <span className="font-medium text-[15px] text-foreground/80 tracking-tight">
                SocialRaven
              </span>
            </Link>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-xl hover:bg-black/5 transition"
            >
              <ChevronLeft className="h-4 w-4 text-foreground/50" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <Link href="/dashboard">
              <img
                src="/SocialRavenLogo.svg"
                alt="SocialRaven logo"
                className="h-6 w-6"
              />
            </Link>
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-xl hover:bg-black/5 transition"
            >
              <ChevronLeft className="h-4 w-4 text-foreground/50 rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map(({ title, url, icon: Icon }) => (
          <Link
            key={title}
            href={url}
            title={isCollapsed ? title : undefined}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl
              text-sm text-foreground/70
              hover:bg-black/5 hover:text-accent transition-all
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <Icon className="h-5 w-5 text-foreground/50" />
            {!isCollapsed && <span>{title}</span>}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-foreground/10">
        <UserAvatar size="md" collapsed={isCollapsed} />
      </div>
    </div>
  );
}