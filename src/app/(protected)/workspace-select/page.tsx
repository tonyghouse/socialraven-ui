"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Building2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [createCompanyId, setCreateCompanyId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manageableCompanies = Array.from(
    new Map(
      workspaces
        .filter((workspace) => workspace.role === "OWNER" || workspace.role === "ADMIN")
        .map((workspace) => [
          workspace.companyId,
          {
            id: workspace.companyId,
            name: workspace.companyName ?? workspace.name,
          },
        ])
    ).values()
  );

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

  useEffect(() => {
    if (!createCompanyId && manageableCompanies.length > 0) {
      setCreateCompanyId(manageableCompanies[0].id);
    }
  }, [createCompanyId, manageableCompanies]);

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
      const payload =
        manageableCompanies.length > 1
          ? { name: newName.trim(), companyId: createCompanyId }
          : {
              name: newName.trim(),
              companyId: createCompanyId || manageableCompanies[0]?.id,
            };
      const workspace = await createWorkspaceApi(getToken, payload);
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
          <h1 className="text-lg font-semibold leading-6 text-[hsl(var(--foreground))]">
            Select a workspace
          </h1>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
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
                <p className="truncate text-sm font-medium leading-5 text-[hsl(var(--foreground))]">
                  {w.name}
                </p>
                <p className="text-xs font-medium leading-4 text-muted-foreground">
                  {[w.companyName, w.role.replace("_", " ").toLowerCase()].filter(Boolean).join(" • ")}
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
              <p className="text-sm font-medium leading-5 text-muted-foreground">
                Create new workspace
              </p>
            </button>
          )}
        </div>

        {/* Create form */}
        {creating && canCreateWorkspaces && (
          <div className="mb-3 space-y-3 rounded-xl border border-accent/20 bg-[hsl(var(--surface-raised))] p-4">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name" className="text-sm font-medium leading-5">
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
            {manageableCompanies.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium leading-5">
                  Company
                </Label>
                <Select value={createCompanyId} onValueChange={setCreateCompanyId}>
                  <SelectTrigger className="bg-[hsl(var(--surface))]">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {manageableCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || busy || !createCompanyId}
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
