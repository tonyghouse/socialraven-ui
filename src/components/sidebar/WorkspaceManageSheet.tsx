"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2 as Buildings,
  Check,
  ChevronRight as CaretRight,
  Home,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";

interface WorkspaceManageSheetProps {
  collapsed: boolean;
}

export function WorkspaceManageSheet({ collapsed }: WorkspaceManageSheetProps) {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const trigger = collapsed ? (
    <button
      onClick={() => setOpen(true)}
      title="Manage workspaces"
      className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent transition-colors hover:bg-accent/15"
    >
      <Buildings size={16} />
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
        "text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-raised))] hover:text-foreground"
      )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Buildings size={16} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 text-left">
        <span className="mb-0.5 text-xs font-medium uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]">
          Workspace
        </span>
        <span className="truncate text-sm font-medium tracking-[-0.005em] text-foreground">
          {activeWorkspace?.name ?? "—"}
        </span>
      </div>
      <CaretRight size={14} className="shrink-0 text-[hsl(var(--foreground-subtle))]" />
    </button>
  );

  return (
    <>
      {trigger}

      {open && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[200] bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 top-0 z-[201] flex h-full w-full max-w-[380px] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_18px_48px_rgba(9,30,66,0.2)]">
            <div className="border-b border-[hsl(var(--border-subtle))] bg-[linear-gradient(180deg,rgba(233,242,255,0.8)_0%,rgba(255,255,255,1)_72%)] px-5 py-4 dark:bg-[linear-gradient(180deg,rgba(27,38,56,0.94)_0%,rgba(22,26,34,1)_72%)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-md border border-[#cce0ff] bg-[#e9f2ff] px-2.5 py-1 text-xs font-medium text-[#0c66e4] dark:border-[#2c4f7c] dark:bg-[#1b2638] dark:text-[#85b8ff]">
                    <Buildings size={14} />
                    Workspace administration
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold tracking-[-0.01em] text-[hsl(var(--foreground))]">
                      Manage workspaces
                    </h2>
                    <p className="max-w-[28ch] text-sm leading-5 text-[hsl(var(--foreground-muted))]">
                      Switch context and open workspace settings from a structured control panel.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-[hsl(var(--foreground-subtle))] transition-colors hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground-muted))]"
                  aria-label="Close workspace management panel"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
                  Current workspace
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#cce0ff] bg-[#e9f2ff] text-[#0c66e4] dark:border-[#2c4f7c] dark:bg-[#1b2638] dark:text-[#85b8ff]">
                    <Buildings size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold tracking-[-0.005em] text-[hsl(var(--foreground))]">
                      {activeWorkspace?.name ?? "No workspace selected"}
                    </p>
                    <p className="truncate text-sm text-[hsl(var(--foreground-muted))]">
                      {activeWorkspace?.role
                        ? `${activeWorkspace.role.toLowerCase()} access`
                        : "Select a workspace to continue"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] px-5 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
                  Available workspaces
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                  {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                {workspaces.map((w) => {
                  const isActive = activeWorkspace?.id === w.id;

                  return (
                    <button
                      key={w.id}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition-[background-color,border-color,box-shadow,color] duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]",
                        isActive
                          ? "border-[#85b8ff] bg-[#f7fbff] shadow-sm dark:border-[#2c4f7c] dark:bg-[#1b2638]"
                          : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-raised))]"
                      )}
                      onClick={() => activeWorkspace?.id !== w.id && switchWorkspace(w)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                            isActive
                              ? "border-[#cce0ff] bg-[#e9f2ff] text-[#0c66e4] dark:border-[#2c4f7c] dark:bg-[#243247] dark:text-[#85b8ff]"
                              : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
                          )}
                        >
                          <Buildings size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold tracking-[-0.005em] text-[hsl(var(--foreground))]">
                              {w.name}
                            </p>
                            {isActive && (
                              <span className="inline-flex items-center rounded-md bg-[#deebff] px-2 py-0.5 text-[11px] font-medium text-[#0052cc] dark:bg-[#1d3557] dark:text-[#85b8ff]">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                            {w.role ? `${w.role.toLowerCase()} access` : "Workspace member"}
                          </p>
                        </div>

                        <div className="flex items-center">
                          {isActive ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0c66e4] text-white dark:bg-[#0052cc]">
                              <Check size={14} />
                            </div>
                          ) : (
                            <CaretRight
                              size={16}
                              className="text-[hsl(var(--foreground-subtle))]"
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-[hsl(var(--border-subtle))] pt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
                  Administration
                </p>
                <Link
                  href="/workspace/settings"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-3 py-3 text-sm transition-[background-color,border-color,color] hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]">
                    <Home size={18} className="shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold tracking-[-0.005em] text-[hsl(var(--foreground))]">
                      Workspace settings
                    </p>
                    <p className="text-sm text-[hsl(var(--foreground-muted))]">
                      Members, invitations, billing, and controls
                    </p>
                  </div>
                  <CaretRight
                    size={16}
                    className="shrink-0 text-[hsl(var(--foreground-subtle))]"
                  />
                </Link>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
