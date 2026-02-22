"use client";

import {
  Calendar,
  LayoutDashboard,
  CalendarCheck2,
  Cable,
  LineChart,
  ChevronLeft,
  Send,
  CalendarX2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UserAvatar } from "./UserAvatar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule Post", url: "/schedule-post", icon: Send },
  { title: "Scheduled Posts", url: "/scheduled-posts", icon: Calendar },
  { title: "Published Posts", url: "/published-posts", icon: CalendarCheck2 },
  { title: "Failed Posts", url: "/failed-posts", icon: CalendarX2 },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Connect Accounts", url: "/connect-accounts", icon: Cable },
];

// ── Main sidebar ──────────────────────────────────────────────────────────────
export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

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