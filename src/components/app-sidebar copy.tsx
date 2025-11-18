import { Calendar, Home, Inbox, LucideGitGraph, Settings, MessageSquareCode, GitGraphIcon } from 'lucide-react';
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home
  },
  {
    title: "Scheduled Posts",
    url: "/scheduled-posts",
    icon: Calendar
  },
  {
    title: "Published Posts",
    url: "/published-posts",
    icon: Inbox
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: GitGraphIcon
  },
  {
    title: "Connect Accounts",
    url: "/connect-accounts",
    icon: Settings
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isSignedIn, user } = useUser();
  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-muted">
      <SidebarHeader className="border-b border-gray-200 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link className="flex items-center gap-3 group" href="/dashboard">
                  <MessageSquareCode className="h-full w-full text-primary " />
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Social Raven
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

       <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-5 w-5 text-primary group-hover:text-primary transition-colors" />
                       <span className="text-sm font-normal group-hover:text-foreground transition-colors">
                      {item.title}
                    </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              {isSignedIn ? (
                <div className="flex items-center gap-3 w-full group cursor-pointer">
                <SidebarMenuButton asChild>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9 rounded-lg",
                        },
                      }}
                    />
                   
                  </SidebarMenuButton>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {user?.firstName || "User"} {" "} {user?.lastName || ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
              ) : (
                <Link href="/sign-in" className="w-full">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/70 text-white hover:from-primary hover:to-primary/70 transition-all duration-300 rounded-lg font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail className="bg-gradient-to-b from-primary/0 via-primary/5 to-primary/0" />
    </Sidebar>
  );
}
