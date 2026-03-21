"use client";

import { useState } from "react";
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
  const { workspaces, switchWorkspace, refresh } = useWorkspace();

  const [selected, setSelected] = useState<WorkspaceResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(w: WorkspaceResponse) {
    setSelected(w);
    setCreating(false);
  }

  async function handleEnter() {
    if (!selected) return;
    switchWorkspace(selected);
    router.replace("/dashboard");
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const workspace = await createWorkspaceApi(getToken, { name: newName.trim() });
      await refresh();
      switchWorkspace(workspace);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Failed to create workspace");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/SocialRavenLogo.svg"
            alt="SocialRaven"
            className="h-10 w-10 mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            Select a workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose where you&apos;d like to work
          </p>
        </div>

        {/* Workspace list */}
        <div className="space-y-2 mb-4">
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                selected?.id === w.id
                  ? "border-accent bg-accent/5 shadow-sm"
                  : "border-border/60 hover:border-accent/40 hover:bg-muted/40"
              )}
            >
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{w.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {w.role.toLowerCase()}
                </p>
              </div>
              {selected?.id === w.id && (
                <Check className="h-4 w-4 text-accent shrink-0" />
              )}
            </button>
          ))}

          {/* Create new workspace option */}
          <button
            onClick={() => {
              setCreating(true);
              setSelected(null);
            }}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
              creating
                ? "border-accent bg-accent/5 shadow-sm"
                : "border-dashed border-border/60 hover:border-accent/40 hover:bg-muted/40"
            )}
          >
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Create new workspace
            </p>
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 mb-4 space-y-3">
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
            className="w-full"
          >
            Enter workspace
          </Button>
        )}
      </div>
    </div>
  );
}
