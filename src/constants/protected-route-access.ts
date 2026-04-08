import type { ModeTag } from "@/lib/app-mode";

type ProtectedRouteAccessRule = {
  pathname: string;
  matcher: RegExp;
  tag: ModeTag;
};

const PROTECTED_ROUTE_ACCESS_RULES: ProtectedRouteAccessRule[] = [
  { pathname: "/agency-ops", matcher: /^\/agency-ops(?:\/.*)?$/, tag: "agency" },
  { pathname: "/analytics", matcher: /^\/analytics(?:\/.*)?$/, tag: "both" },
  { pathname: "/approvals", matcher: /^\/approvals(?:\/.*)?$/, tag: "agency" },
  { pathname: "/asset-library", matcher: /^\/asset-library(?:\/.*)?$/, tag: "agency" },
  { pathname: "/billing", matcher: /^\/billing(?:\/.*)?$/, tag: "both" },
  { pathname: "/calendar", matcher: /^\/calendar(?:\/.*)?$/, tag: "both" },
  { pathname: "/client-reports", matcher: /^\/client-reports(?:\/.*)?$/, tag: "agency" },
  { pathname: "/connect-accounts", matcher: /^\/connect-accounts(?:\/.*)?$/, tag: "both" },
  { pathname: "/dashboard", matcher: /^\/dashboard(?:\/.*)?$/, tag: "both" },
  { pathname: "/drafts", matcher: /^\/drafts(?:\/.*)?$/, tag: "both" },
  { pathname: "/no-workspace", matcher: /^\/no-workspace(?:\/.*)?$/, tag: "both" },
  { pathname: "/posts/[id]", matcher: /^\/posts\/[^/]+(?:\/.*)?$/, tag: "both" },
  { pathname: "/profile", matcher: /^\/profile(?:\/.*)?$/, tag: "both" },
  { pathname: "/published-posts", matcher: /^\/published-posts(?:\/.*)?$/, tag: "both" },
  { pathname: "/recovery-drafts/[id]", matcher: /^\/recovery-drafts\/[^/]+(?:\/.*)?$/, tag: "both" },
  { pathname: "/schedule-post", matcher: /^\/schedule-post(?:\/.*)?$/, tag: "both" },
  { pathname: "/scheduled-posts", matcher: /^\/scheduled-posts(?:\/.*)?$/, tag: "both" },
  { pathname: "/workspace-select", matcher: /^\/workspace-select(?:\/.*)?$/, tag: "agency" },
  { pathname: "/workspace/settings", matcher: /^\/workspace\/settings(?:\/.*)?$/, tag: "agency" },
];

export function resolveProtectedRouteTag(pathname: string): ModeTag {
  return (
    PROTECTED_ROUTE_ACCESS_RULES.find((rule) => rule.matcher.test(pathname))?.tag ??
    "both"
  );
}
