"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building,
  Building2,
  Check,
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

  const trigger = collapsed ? (
    <button
      onClick={() => setOpen(true)}
      title="Manage workspaces"
      className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
    >
      <Building className="h-4 w-4 text-accent" />
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        "flex items-center gap-2 w-full rounded-xl px-2 py-2",
        "text-sm font-medium text-foreground/70 hover:bg-black/[0.04] transition-colors"
      )}
    >
      <div className="h-6 w-6 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
        <Building className="h-3.5 w-3.5 text-accent" />
      </div>
      <div className="flex flex-col min-w-0 flex-1 text-left">
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-foreground/30 leading-none mb-0.5">
          Workspace
        </span>
        <span className="text-[13px] font-medium text-foreground/70 truncate leading-none">
          {activeWorkspace?.name ?? "—"}
        </span>
      </div>
    </button>
  );

  return (
    <>
      {trigger}

      {/* Backdrop + Sheet — rendered in a portal so it escapes the sidebar's
           backdrop-blur containing block and sits in the root stacking context */}
      {open && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-[201] w-[340px] bg-white shadow-2xl flex flex-col border-r border-border/60">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <h2 className="text-sm font-semibold text-foreground">Workspaces</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground/70 hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <>
                  <div className="space-y-1.5">
                    {workspaces.map((w) => (
                      <div
                        key={w.id}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 border transition-colors",
                          activeWorkspace?.id === w.id
                            ? "border-accent/30 bg-accent/5"
                            : "border-border/50 hover:bg-muted/40 cursor-pointer"
                        )}
                        onClick={() => activeWorkspace?.id !== w.id && switchWorkspace(w)}
                      >
                        <div className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                          activeWorkspace?.id === w.id ? "bg-accent/15" : "bg-muted/60"
                        )}>
                          <Building className={cn("h-3.5 w-3.5", activeWorkspace?.id === w.id ? "text-accent" : "text-muted-foreground")} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium truncate">{w.name}</p>
                          {w.role && (
                            <p className="text-[10px] text-muted-foreground capitalize">{w.role.toLowerCase()}</p>
                          )}
                        </div>

                        {activeWorkspace?.id === w.id && (
                          <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/workspace/settings"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 border border-border/50 text-sm font-medium text-foreground/70 hover:bg-muted/40 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="truncate">Workspace Settings</span>
                    </Link>
                  </div>
              </>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
