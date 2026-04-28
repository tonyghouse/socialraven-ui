import {
  BarChart3 as ChartBar,
  Calendar,
  CalendarCheck,
  CreditCard,
  FilePen as NotePencil,
  History as ClockCounterClockwise,
  Home,
  Plug,
  Send as PaperPlaneTilt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarNavItem = {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  matchUrl?: string;
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

const DASHBOARD_URL = "/dashboard";

const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: DASHBOARD_URL,
        icon: Home,
        matchUrl: DASHBOARD_URL,
      },
      { id: "analytics", title: "Analytics", url: DASHBOARD_URL, icon: ChartBar },
    ],
  },
  {
    label: "Publishing",
    items: [
      { id: "schedule-post", title: "Schedule Post", url: DASHBOARD_URL, icon: PaperPlaneTilt },
      { id: "calendar", title: "Calendar", url: DASHBOARD_URL, icon: Calendar },
      { id: "scheduled-posts", title: "Scheduled Posts", url: DASHBOARD_URL, icon: ClockCounterClockwise },
      { id: "drafts", title: "Drafts", url: DASHBOARD_URL, icon: NotePencil },
      { id: "published-posts", title: "Published Posts", url: DASHBOARD_URL, icon: CalendarCheck },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "connect-accounts", title: "Connect Accounts", url: DASHBOARD_URL, icon: Plug },
      { id: "billing", title: "Billing & Plans", url: DASHBOARD_URL, icon: CreditCard },
    ],
  },
];

export function getSidebarNavGroups() {
  return SIDEBAR_NAV_GROUPS;
}

export function getMobilePrimaryItems() {
  const groups = getSidebarNavGroups();

  return [
    groups[0]?.items.find((item) => item.id === "dashboard"),
    groups[1]?.items.find((item) => item.id === "scheduled-posts"),
    groups[1]?.items.find((item) => item.id === "calendar"),
  ].filter((item): item is SidebarNavItem => Boolean(item));
}

export function getMobileDrawerGroups() {
  return getSidebarNavGroups()
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.id !== "dashboard" &&
          item.id !== "scheduled-posts" &&
          item.id !== "calendar"
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export function getScheduleItem() {
  return getSidebarNavGroups()
    .flatMap((group) => group.items)
    .find((item) => item.id === "schedule-post");
}

export function isSidebarItemActive(pathname: string, item: SidebarNavItem) {
  if (!item.matchUrl) {
    return false;
  }

  return pathname === item.matchUrl || pathname.startsWith(`${item.matchUrl}/`);
}
