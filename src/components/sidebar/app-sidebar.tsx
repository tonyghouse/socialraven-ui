"use client";

import {
  Calendar,
  LayoutDashboard,
  CalendarCheck2,
  MessageSquareCode,
  Cable,
  Menu,
  X,
  LineChart,
  ChevronLeft,
  Send,
} from "lucide-react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule Post", url: "/schedule-post", icon: Send },
  { title: "Scheduled Posts", url: "/scheduled-posts", icon: Calendar },
  { title: "Published Posts", url: "/published-posts", icon: CalendarCheck2 },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Connect Accounts", url: "/connect-accounts", icon: Cable },
];

export function AppSidebar() {
  const { isSignedIn, user } = useUser();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  /* ================= MOBILE ================= */
  if (isMobile) {
    return (
      <>
        <div
          className="
            flex items-center justify-between h-16 w-full
            bg-white/70 backdrop-blur-xl
            border-b border-foreground/10
            shadow-sm rounded-b-xl
            px-4
          "
        >
          {/* Mobile toggle */}
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

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <MessageSquareCode className="h-6 w-6 text-foreground/70" />
            <span className="font-semibold text-foreground/70">
              SocialRaven
            </span>
            <Badge
              variant="outline"
              className="border-red-500 text-red-600 text-[0.6rem] rounded-md px-1"
            >
              Beta
            </Badge>
          </Link>

          {/* Profile */}
          {isSignedIn && (
            <UserButton
              appearance={{ elements: { avatarBox: "w-9 h-9 rounded-xl" } }}
            />
          )}
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
            z-50 transition-transform duration-300
            ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <nav className="px-3 py-5 space-y-1">
            {items.map(({ title, url, icon: Icon }) => (
              <Link
                key={title}
                href={url}
                onClick={() => setIsDrawerOpen(false)}
                className="
                  flex items-center gap-3
                  px-4 py-3 rounded-xl
                  text-sm text-foreground/70
                  hover:bg-black/5 hover:text-accent
                  transition-all
                "
              >
                <Icon className="h-5 w-5 text-foreground/50" />
                {title}
              </Link>
            ))}
          </nav>
        </div>
      </>
    );
  }

  /* ================= DESKTOP ================= */
  return (
    <div
      className={`
        h-[calc(100vh-1rem)]
        m-2
        flex flex-col
        rounded-xl
        bg-white/60 backdrop-blur-2xl
        border border-foreground/10
        shadow-[0_8px_30px_-20px_rgba(0,0,0,0.18)]
        transition-all duration-500

        ${isCollapsed ? "w-20" : "w-56"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-foreground/10">
        {!isCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <MessageSquareCode className="h-6 w-6 text-foreground/70" />
            <span className="font-semibold text-foreground/70">
              SocialRaven
            </span>
            <Badge
              variant="outline"
              className="border-red-500 text-red-600 text-[0.6rem] rounded-md px-1"
            >
              Beta
            </Badge>
          </Link>
        ) : (
          <MessageSquareCode className="h-6 w-6 text-foreground/60 mx-auto" />
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl hover:bg-black/5 transition"
        >
          <ChevronLeft
            className={`h-4 w-4 text-foreground/50 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map(({ title, url, icon: Icon }) => (
          <Link
            key={title}
            href={url}
            title={isCollapsed ? title : undefined}
            className={`
              flex items-center gap-3
              px-4 py-3 rounded-xl
              text-sm text-foreground/70
              hover:bg-black/5 hover:text-accent
              transition-all
              ${isCollapsed && "justify-center"}
            `}
          >
            <Icon className="h-5 w-5 text-foreground/50" />
            {!isCollapsed && <span>{title}</span>}
          </Link>
        ))}
      </nav>

      {/* USER */}
      <div className="border-t border-foreground/10 px-4 py-5">
        {isSignedIn ? (
          <div
            className={`flex items-center gap-3 ${
              isCollapsed && "justify-center"
            }`}
          >
            <UserButton
              appearance={{ elements: { avatarBox: "w-10 h-10 rounded-xl" } }}
            />
            {!isCollapsed && (
              <div className="w-56">
                <p className="text-sm font-medium text-foreground/80 overflow-hidden whitespace-nowrap text-ellipsis">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-foreground/50 overflow-hidden whitespace-nowrap text-ellipsis">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
          </div>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full rounded-xl bg-primary text-white hover:bg-accent transition-all">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
