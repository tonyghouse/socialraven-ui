"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Building2 as Buildings,
  Check,
  Ellipsis,
  LogOut,
  Send as PaperPlaneTilt,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWorkspace } from "@/context/WorkspaceContext";
import { usePlan } from "@/hooks/usePlan";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";

import {
  getMobileDrawerGroups,
  getMobilePrimaryItems,
  getSidebarNavGroups,
  isSidebarItemActive,
} from "./navigation";

export function MobileBottomBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { mode, isInfluencer } = usePlan();
  const { canWrite, canSeeAgencyOps, canSeeApprovalQueue, isOwner, canManageAssetLibrary } = useRole();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();

  const navFlags = {
    mode,
    canWrite,
    canSeeAgencyOps,
    canSeeApprovalQueue,
    isOwner,
    canManageAssetLibrary,
  };
  const primaryItems = getMobilePrimaryItems(navFlags);
  const drawerGroups = getMobileDrawerGroups(navFlags);
  const allGroups = getSidebarNavGroups(navFlags);
  const scheduleItem = allGroups
    .flatMap((group) => group.items)
    .find((item) => item.url === "/schedule-post");
  const isMoreActive = drawerGroups.some((group) =>
    group.items.some((item) => isSidebarItemActive(pathname, item.url))
  );

  return (
    <>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] rounded-t-[1.75rem] border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5 shadow-none"
        >
          <SheetHeader className="space-y-1 pr-10 text-left">
            <SheetTitle className="text-heading-20 text-[var(--ds-gray-1000)]">
              Workspace menu
            </SheetTitle>
            <SheetDescription className="text-copy-14 text-[var(--ds-gray-900)]">
              Navigate, switch workspaces, and manage your account.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-6 overflow-y-auto pr-1">
            {drawerGroups.map((group) => (
              <section key={group.label} className="space-y-2">
                <p className="text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <MobileDrawerLink
                      key={item.url}
                      title={item.title}
                      url={item.url}
                      icon={item.icon}
                      active={isSidebarItemActive(pathname, item.url)}
                      onNavigate={() => setDrawerOpen(false)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {!isInfluencer && workspaces.length > 1 ? (
              <section className="space-y-2">
                <p className="text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                  Workspaces
                </p>
                <div className="space-y-1">
                  {workspaces.map((workspace) => {
                    const isActive = workspace.id === activeWorkspace?.id;

                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          if (!isActive) {
                            switchWorkspace(workspace);
                          }
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                            : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isActive
                              ? "bg-[var(--ds-background-100)] text-[var(--ds-plum-700)]"
                              : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
                          )}
                        >
                          <Buildings className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-label-14">{workspace.name}</p>
                          {workspace.companyName ? (
                            <p
                              className={cn(
                                "mt-0.5 truncate text-label-12",
                                isActive ? "text-[var(--ds-plum-700)]" : "text-[var(--ds-gray-900)]"
                              )}
                            >
                              {workspace.companyName}
                            </p>
                          ) : null}
                        </div>

                        {isActive ? <Check className="h-4 w-4 shrink-0 text-[var(--ds-plum-700)]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="space-y-2">
              <p className="text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                Appearance
              </p>
              <ThemeSwitcher
                align="start"
                className="rounded-2xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
              />
            </section>

            <section className="space-y-2">
              <p className="text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
                Account
              </p>

              <Link
                href="/profile"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
              >
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)] text-label-12 text-[var(--ds-gray-900)]">
                    {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                    {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Your account"}
                  </p>
                  <p className="mt-0.5 truncate text-label-12 text-[var(--ds-gray-900)]">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                <Settings className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-red-100)] hover:text-[var(--ds-red-700)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">Sign out</p>
                </div>
              </button>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <nav className="fixed bottom-0 left-0 right-0 z-[200] border-t border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] pb-[max(env(safe-area-inset-bottom),0)]">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center gap-1 px-2">
          <MobileNavTab item={primaryItems[0]} pathname={pathname} />
          <MobileNavTab item={primaryItems[1]} pathname={pathname} />

          <div className="flex items-center justify-center">
            {canWrite && scheduleItem ? (
              <Link
                href={scheduleItem.url}
                aria-label={scheduleItem.title}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] !text-white transition-transform duration-150 active:scale-95",
                  isSidebarItemActive(pathname, scheduleItem.url) && "ring-2 ring-[var(--ds-plum-200)] ring-offset-2 ring-offset-[var(--ds-background-100)]"
                )}
              >
                <PaperPlaneTilt className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] opacity-60">
                <PaperPlaneTilt className="h-4 w-4" />
              </div>
            )}
          </div>

          <MobileNavTab item={primaryItems[2]} pathname={pathname} />

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl transition-colors",
              drawerOpen || isMoreActive
                ? "text-[var(--ds-plum-700)]"
                : "text-[var(--ds-gray-900)]"
            )}
            aria-label="Open workspace menu"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                drawerOpen || isMoreActive
                  ? "bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                  : "text-[var(--ds-gray-900)]"
              )}
            >
              <Ellipsis className="h-4 w-4" />
            </div>
            <span className="text-label-12 leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function MobileNavTab({
  item,
  pathname,
}: {
  item?: { title: string; url: string; icon: LucideIcon };
  pathname: string;
}) {
  if (!item) {
    return <div />;
  }

  const isActive = isSidebarItemActive(pathname, item.url);

  return (
    <Link
      href={item.url}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl transition-colors",
        isActive ? "text-[var(--ds-plum-700)]" : "text-[var(--ds-gray-900)]"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
          isActive
            ? "bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
            : "text-[var(--ds-gray-900)]"
        )}
      >
        <item.icon className="h-4 w-4" />
      </div>
      <span className="text-label-12 leading-none">{shortLabel(item.title)}</span>
    </Link>
  );
}

function MobileDrawerLink({
  title,
  url,
  icon: Icon,
  active,
  onNavigate,
}: {
  title: string;
  url: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={url}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        active
          ? "bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
          : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          active
            ? "bg-[var(--ds-background-100)] text-[var(--ds-plum-700)]"
            : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-label-14">{title}</p>
      </div>
    </Link>
  );
}

function shortLabel(title: string) {
  switch (title) {
    case "Dashboard":
      return "Home";
    case "Scheduled Posts":
      return "Scheduled";
    default:
      return title;
  }
}
