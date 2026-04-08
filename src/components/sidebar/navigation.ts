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
import { modeAllows, type AppMode, type ModeTag } from "@/lib/app-mode";

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
  mode: AppMode;
  canWrite: boolean;
  canSeeAgencyOps: boolean;
  canSeeApprovalQueue: boolean;
  isOwner: boolean;
  canManageAssetLibrary: boolean;
};

type SidebarNavItemConfig = SidebarNavItem & {
  tag: ModeTag;
  visible?: (flags: SidebarNavFlags) => boolean;
};

const SIDEBAR_NAV_GROUPS: Array<{
  label: string;
  items: SidebarNavItemConfig[];
}> = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home, tag: "both" },
      { title: "Analytics", url: "/analytics", icon: ChartBar, tag: "both" },
    ],
  },
  {
    label: "Publishing",
    items: [
      {
        title: "Schedule Post",
        url: "/schedule-post",
        icon: PaperPlaneTilt,
        tag: "both",
        visible: (flags) => flags.canWrite,
      },
      { title: "Calendar", url: "/calendar", icon: Calendar, tag: "both" },
      { title: "Scheduled Posts", url: "/scheduled-posts", icon: ClockCounterClockwise, tag: "both" },
      { title: "Drafts", url: "/drafts", icon: NotePencil, tag: "both" },
      { title: "Published Posts", url: "/published-posts", icon: CalendarCheck, tag: "both" },
      {
        title: "Approvals",
        url: "/approvals",
        icon: CheckCheck,
        tag: "agency",
        visible: (flags) => flags.canSeeApprovalQueue,
      },
      {
        title: "Asset Library",
        url: "/asset-library",
        icon: LibraryBig,
        tag: "agency",
        visible: (flags) => flags.canManageAssetLibrary,
      },
      {
        title: "Agency Ops",
        url: "/agency-ops",
        icon: BriefcaseBusiness,
        tag: "agency",
        visible: (flags) => flags.canSeeAgencyOps,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Connect Accounts", url: "/connect-accounts", icon: Plug, tag: "both" },
      { title: "Workspace Settings", url: "/workspace/settings", icon: Buildings, tag: "agency" },
      {
        title: "Billing & Plans",
        url: "/billing",
        icon: CreditCard,
        tag: "both",
        visible: (flags) => flags.isOwner,
      },
    ],
  },
];

export function getSidebarNavGroups({
  mode,
  canWrite,
  canSeeAgencyOps,
  canSeeApprovalQueue,
  isOwner,
  canManageAssetLibrary,
}: SidebarNavFlags): SidebarNavGroup[] {
  const flags = {
    mode,
    canWrite,
    canSeeAgencyOps,
    canSeeApprovalQueue,
    isOwner,
    canManageAssetLibrary,
  };

  return SIDEBAR_NAV_GROUPS
    .map((group) => ({
      label: group.label,
      items: group.items
        .filter((item) => modeAllows(item.tag, mode))
        .filter((item) => (item.visible ? item.visible(flags) : true))
        .map(({ tag: _tag, visible: _visible, ...item }) => item),
    }))
    .filter((group) => group.items.length > 0);
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
