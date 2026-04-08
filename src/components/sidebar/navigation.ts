import {
  BarChart3 as ChartBar,
  BriefcaseBusiness,
  Building2 as Buildings,
  Calendar,
  CalendarCheck,
  CheckCheck,
  CreditCard,
  FilePen as NotePencil,
  History as ClockCounterClockwise,
  Home,
  LibraryBig,
  Plug,
  Send as PaperPlaneTilt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export type SidebarNavFlags = {
  canWrite: boolean;
  canSeeAgencyOps: boolean;
  canSeeApprovalQueue: boolean;
  isOwner: boolean;
  canManageAssetLibrary: boolean;
};

export function getSidebarNavGroups({
  canWrite,
  canSeeAgencyOps,
  canSeeApprovalQueue,
  isOwner,
  canManageAssetLibrary,
}: SidebarNavFlags): SidebarNavGroup[] {
  return [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home },
        { title: "Analytics", url: "/analytics", icon: ChartBar },
      ],
    },
    {
      label: "Publishing",
      items: [
        ...(canWrite ? [{ title: "Schedule Post", url: "/schedule-post", icon: PaperPlaneTilt }] : []),
        { title: "Calendar", url: "/calendar", icon: Calendar },
        { title: "Scheduled Posts", url: "/scheduled-posts", icon: ClockCounterClockwise },
        { title: "Drafts", url: "/drafts", icon: NotePencil },
        { title: "Published Posts", url: "/published-posts", icon: CalendarCheck },
        ...(canSeeApprovalQueue ? [{ title: "Approvals", url: "/approvals", icon: CheckCheck }] : []),
        ...(canManageAssetLibrary ? [{ title: "Asset Library", url: "/asset-library", icon: LibraryBig }] : []),
        ...(canSeeAgencyOps ? [{ title: "Agency Ops", url: "/agency-ops", icon: BriefcaseBusiness }] : []),
      ],
    },
    {
      label: "Workspace",
      items: [
        { title: "Connect Accounts", url: "/connect-accounts", icon: Plug },
        { title: "Workspace Settings", url: "/workspace/settings", icon: Buildings },
        ...(isOwner ? [{ title: "Billing & Plans", url: "/billing", icon: CreditCard }] : []),
      ],
    },
  ];
}

export function getMobilePrimaryItems(flags: SidebarNavFlags) {
  const groups = getSidebarNavGroups(flags);

  return [
    groups[0].items[0],
    groups[1].items.find((item) => item.url === "/scheduled-posts"),
    groups[1].items.find((item) => item.url === "/calendar"),
  ].filter((item): item is SidebarNavItem => Boolean(item));
}

export function getMobileDrawerGroups(flags: SidebarNavFlags) {
  return getSidebarNavGroups(flags).map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.url !== "/dashboard" &&
        item.url !== "/scheduled-posts" &&
        item.url !== "/calendar"
    ),
  })).filter((group) => group.items.length > 0);
}

export function isSidebarItemActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}
