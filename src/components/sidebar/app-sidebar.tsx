"use client"

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
} from "lucide-react"
import Link from "next/link"
import { UserButton, useUser } from "@clerk/nextjs"

import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
    {
    title: "Schedule Post",
    url: "/schedule-post",
    icon: Send,
  },
  //     {
  //   title: "Schedule Multi Post",
  //   url: "/schedule-multi-post",
  //   icon: Send,
  // },
  {
    title: "Scheduled Posts",
    url: "/scheduled-posts",
    icon: Calendar,
  },
  {
    title: "Published Posts",
    url: "/published-posts",
    icon: CalendarCheck2,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: LineChart,
  },
  {
    title: "Connect Accounts",
    url: "/connect-accounts",
    icon: Cable,
  },
]

export function AppSidebar() {
  const { isSignedIn, user } = useUser()
  const isMobile = useIsMobile()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (isMobile) {
    return (
      <>
        <div className="flex items-center  justify-between h-16 w-full bg-background border-b border-sidebar-border px-4">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-2 hover:bg-sidebar-accent rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isDrawerOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </button>

                 <Link className="flex items-center gap-2 group" href="/dashboard">
          <MessageSquareCode className="h-6 w-6 text-primary" />

          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
            SocialRaven
          </span>

          <Badge
            variant="outline"
            className="border-red-500 text-red-600 px-1.5 py-0 text-xs leading-none rounded-md"
          >
            Beta
          </Badge>
        </Link>

          {isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-lg",
                },
              }}
            />
          )}
        </div>

        {isDrawerOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsDrawerOpen(false)} />}
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-sidebar-border shadow-lg transform transition-transform duration-300 z-50 ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-1 px-2 py-4 overflow-y-auto h-full">
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const IconComponent = item.icon
                return (
                  <li key={item.title}>
                    <Link
                      href={item.url}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors group"
                    >
                      <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </>
    )
  }

  return (
    <div
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ${isCollapsed ? "w-16" : "w-52"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-3 px-4 py-4 border-b border-sidebar-border`}
      >
        {!isCollapsed && (
          <Link href="/dashboard" className="flex-1 min-w-0 flex items-center gap-2">
            <MessageSquareCode className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-base font-bold tracking-tight bg-primary bg-clip-text text-transparent truncate">
              Social Raven
            </span>
          </Link>
        )}
        {isCollapsed && <MessageSquareCode className="h-5 w-5 text-primary" />}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={`h-4 w-4 text-foreground transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const IconComponent = item.icon
            return (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors group"
                  title={isCollapsed ? item.title : undefined}
                >
                  <IconComponent className="h-4 w-4 text-primary flex-shrink-0 group-hover:text-primary transition-colors" />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border px-2 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          {isSignedIn ? (
            <div
              className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} w-full group cursor-pointer min-w-0`}
            >
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-lg",
                  },
                }}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate group-hover:text-primary transition-colors">
                    {user?.firstName || "User"} {user?.lastName || ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              )}
            </div>
          ) : (
            <Link href="/sign-in" className="w-full">
              <Button className="w-full bg-gradient-to-r from-primary to-primary/70 text-white hover:from-primary hover:to-primary/70 transition-all duration-300 rounded-lg font-medium">
                {isCollapsed ? "Sign In" : "Sign In"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
