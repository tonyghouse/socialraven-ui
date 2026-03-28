"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@clerk/nextjs";
import {
  Building2,
  Check,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceResponse } from "@/model/Workspace";
import { createWorkspaceApi, updateWorkspaceApi } from "@/service/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WorkspaceManageSheetProps {
  collapsed: boolean;
}

export function WorkspaceManageSheet({ collapsed }: WorkspaceManageSheetProps) {
  const { getToken } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace, refresh } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Create workspace form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Rename workspace
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreateBusy(true);
    setCreateError(null);
    try {
      const ws = await createWorkspaceApi(getToken, { name: createName.trim() });
      setCreateName("");
      setShowCreate(false);
      await refresh();
      switchWorkspace(ws);
    } catch (e: any) {
      setCreateError(e.message ?? "Failed to create workspace");
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleRename(workspaceId: string) {
    if (!editName.trim()) return;
    setRenameBusy(true);
    try {
      await updateWorkspaceApi(getToken, workspaceId, { name: editName.trim() });
      await refresh();
      setEditingWorkspaceId(null);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to rename workspace");
    } finally {
      setRenameBusy(false);
    }
  }

  const trigger = collapsed ? (
    <button
      onClick={() => setOpen(true)}
      title="Manage workspaces"
      className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
    >
      <Building2 className="h-4 w-4 text-accent" />
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
        <Building2 className="h-3.5 w-3.5 text-accent" />
      </div>
      <div className="flex flex-col min-w-0 flex-1 text-left">
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-foreground/30 leading-none mb-0.5">
          Workspace
        </span>
        <span className="text-[13px] font-medium text-foreground/70 truncate leading-none">
          {activeWorkspace?.name ?? "—"}
        </span>
      </div>
      <Building2 className="h-3.5 w-3.5 text-foreground/30 shrink-0" />
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
                          <Building2 className={cn("h-3.5 w-3.5", activeWorkspace?.id === w.id ? "text-accent" : "text-muted-foreground")} />
                        </div>

                        {/* Name / edit inline */}
                        {editingWorkspaceId === w.id ? (
                          <div className="flex-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename(w.id);
                                if (e.key === "Escape") setEditingWorkspaceId(null);
                              }}
                              autoFocus
                              className="h-7 text-xs flex-1"
                            />
                            <button
                              onClick={() => handleRename(w.id)}
                              disabled={renameBusy || !editName.trim()}
                              className="p-1 text-accent hover:text-accent/80 disabled:opacity-40"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingWorkspaceId(null)}
                              className="p-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate">{w.name}</p>
                            {w.role && (
                              <p className="text-[10px] text-muted-foreground capitalize">{w.role.toLowerCase()}</p>
                            )}
                          </div>
                        )}

                        {activeWorkspace?.id === w.id && editingWorkspaceId !== w.id && (
                          <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                        )}

                        {/* Edit pencil (owner only — always owner in own workspaces) */}
                        {w.role === "OWNER" && editingWorkspaceId !== w.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWorkspaceId(w.id);
                              setEditName(w.name);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Rename workspace"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Create workspace */}
                  {showCreate ? (
                    <div className="border rounded-xl p-3 space-y-2.5">
                      <p className="text-xs font-medium">New workspace</p>
                      <Input
                        placeholder="Workspace name"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        autoFocus
                        className="h-8 text-sm"
                      />
                      {createError && <p className="text-xs text-destructive">{createError}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreate} disabled={!createName.trim() || createBusy} className="h-7 text-xs">
                          {createBusy ? "Creating…" : "Create"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowCreate(false); setCreateError(null); }} className="h-7 text-xs">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreate(true)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New workspace
                    </button>
                  )}
              </>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
