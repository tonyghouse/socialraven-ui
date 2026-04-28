"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Ellipsis, LogOut, Settings, Send as PaperPlaneTilt } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import {
  getMobileDrawerGroups,
  getMobilePrimaryItems,
  getScheduleItem,
  isSidebarItemActive,
  type SidebarNavItem,
} from "./navigation";

export function MobileBottomBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  const primaryItems = getMobilePrimaryItems();
  const drawerGroups = getMobileDrawerGroups();
  const scheduleItem = getScheduleItem();
  const isMoreActive = drawerGroups.some((group) =>
    group.items.some((item) => isSidebarItemActive(pathname, item))
  );
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  return (
    <>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] rounded-t-[1.75rem] border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5 shadow-none"
        >
          <SheetHeader className="space-y-1 pr-10 text-left">
            <SheetTitle className="text-heading-20 text-[var(--ds-gray-1000)]">
              App menu
            </SheetTitle>
            <SheetDescription className="text-copy-14 text-[var(--ds-gray-900)]">
              Navigate the dashboard shell while the rest of the app stays in testing.
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
                      key={item.id}
                      item={item}
                      active={isSidebarItemActive(pathname, item)}
                      onNavigate={() => setDrawerOpen(false)}
                    />
                  ))}
                </div>
              </section>
            ))}

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
                href="/dashboard"
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
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">Profile</p>
                  <p className="mt-0.5 truncate text-label-12 text-[var(--ds-gray-900)]">
                    {user?.primaryEmailAddress?.emailAddress ?? "Manage your account"}
                  </p>
                </div>
                <Settings className="h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  signOut({ redirectUrl: "/sign-in" });
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--ds-gray-900)] transition-colors hover:bg-[var(--ds-red-100)] hover:text-[var(--ds-red-700)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">Logout</p>
                  <p className="mt-0.5 truncate text-label-12 text-[var(--ds-gray-900)]">
                    End this session
                  </p>
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
            {scheduleItem ? (
              <Link
                href={scheduleItem.url}
                aria-label={scheduleItem.title}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ds-blue-600)] text-white transition-transform duration-150 active:scale-95"
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
                ? "text-[var(--ds-blue-700)]"
                : "text-[var(--ds-gray-900)]"
            )}
            aria-label="Open app menu"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                drawerOpen || isMoreActive
                  ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
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
  item?: SidebarNavItem;
  pathname: string;
}) {
  if (!item) {
    return <div />;
  }

  const isActive = isSidebarItemActive(pathname, item);

  return (
    <Link
      href={item.url}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl transition-colors",
        isActive ? "text-[var(--ds-blue-700)]" : "text-[var(--ds-gray-900)]"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
          isActive
            ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
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
  item,
  active,
  onNavigate,
}: {
  item: SidebarNavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.url}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        active
          ? "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]"
          : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          active
            ? "bg-[var(--ds-background-100)] text-[var(--ds-blue-700)]"
            : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
        )}
      >
        <item.icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-label-14">{item.title}</p>
      </div>
    </Link>
  );
}

function shortLabel(title: string) {
  switch (title) {
    case "Scheduled Posts":
      return "Scheduled";
    case "Schedule Post":
      return "Create";
    default:
      return title;
  }
}
