"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Building2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceResponse } from "@/model/Workspace";
import { useWorkspace } from "@/context/WorkspaceContext";
import { createWorkspaceApi } from "@/service/workspace";
import { cn } from "@/lib/utils";

export default function WorkspaceSelectPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const {
    workspaces,
    refresh,
    isLoading,
    canCreateWorkspaces,
  } = useWorkspace();

  const [selected, setSelected] = useState<WorkspaceResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function activateWorkspace(workspace: WorkspaceResponse) {
    localStorage.setItem("activeWorkspaceId", workspace.id);
    localStorage.setItem("activeWorkspaceRole", workspace.role);
  }

  useEffect(() => {
    if (isLoading) return;

    if (!canCreateWorkspaces) {
      if (workspaces.length === 0) {
        router.replace("/no-workspace");
      } else {
        router.replace("/dashboard");
      }
      return;
    }

    if (workspaces.length === 1) {
      router.replace("/dashboard");
      return;
    }

    if (workspaces.length === 0) {
      router.replace("/no-workspace");
    }
  }, [isLoading, workspaces, canCreateWorkspaces, router]);

  function handleSelect(w: WorkspaceResponse) {
    setSelected(w);
    setCreating(false);
  }

  async function handleEnter() {
    if (!selected) return;
    activateWorkspace(selected);
    router.replace("/dashboard");
  }

  async function handleCreate() {
    if (!canCreateWorkspaces) return;
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const workspace = await createWorkspaceApi(getToken, { name: newName.trim() });
      await refresh();
      activateWorkspace(workspace);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Failed to create workspace");
    } finally {
      setBusy(false);
    }
  }

  if (
    isLoading ||
    !canCreateWorkspaces ||
    workspaces.length === 1 ||
    workspaces.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-[hsl(var(--surface))] p-5 shadow-lg sm:p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <img
            src="/SocialRavenLogo.svg"
            alt="SocialRaven"
            className="mx-auto mb-3 h-10 w-10"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Select a workspace
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose where you&apos;d like to work
          </p>
        </div>

        {/* Workspace list */}
        <div className="mb-3 space-y-2">
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                selected?.id === w.id
                  ? "border-accent/60 bg-[hsl(var(--surface-raised))] shadow-sm"
                  : "border-border/60 bg-[hsl(var(--surface))] hover:border-accent/30 hover:bg-[hsl(var(--surface-raised))]"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Building2 className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{w.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {w.role.toLowerCase()}
                </p>
              </div>
              {selected?.id === w.id && (
                <Check className="h-4 w-4 shrink-0 text-accent" />
              )}
            </button>
          ))}

          {canCreateWorkspaces && (
            <button
              onClick={() => {
                setCreating(true);
                setSelected(null);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                creating
                  ? "border-accent/60 bg-[hsl(var(--surface-raised))] shadow-sm"
                  : "border-dashed border-border/60 bg-[hsl(var(--surface))] hover:border-accent/30 hover:bg-[hsl(var(--surface-raised))]"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Create new workspace
              </p>
            </button>
          )}
        </div>

        {/* Create form */}
        {creating && canCreateWorkspaces && (
          <div className="mb-3 space-y-3 rounded-xl border border-accent/20 bg-[hsl(var(--surface-raised))] p-4">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name" className="text-sm">
                Workspace name
              </Label>
              <Input
                id="ws-name"
                placeholder="e.g. Acme Agency"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
                className="bg-[hsl(var(--surface))]"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || busy}
              className="w-full"
              size="sm"
            >
              {busy ? "Creating…" : "Create & enter"}
            </Button>
          </div>
        )}

        {/* Enter button */}
        {!creating && (
          <Button
            onClick={handleEnter}
            disabled={!selected}
            className="mt-1 w-full"
          >
            Enter workspace
          </Button>
        )}
      </div>
    </div>
  );
}
