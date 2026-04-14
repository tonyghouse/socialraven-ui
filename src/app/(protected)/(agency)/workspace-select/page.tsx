"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
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

const pageClassName =
  "flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-background-200)_100%)] p-4";
const cardClassName =
  "w-full max-w-md rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-5 shadow-sm sm:p-6";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const actionButtonClassName = cn(
  "h-10 w-full rounded-md border text-label-14 shadow-none transition-colors disabled:pointer-events-none disabled:opacity-50",
  focusRingClassName
);
const primaryButtonClassName = cn(
  actionButtonClassName,
  "border-transparent bg-[hsl(var(--accent))] !text-white hover:bg-[hsl(var(--accent-hover))]"
);
const secondaryButtonClassName = cn(
  actionButtonClassName,
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
);
const inputClassName = cn(
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-900)]",
  "focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]"
);
const workspaceCardBaseClassName =
  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors";
const workspaceCardIdleClassName =
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";
const workspaceCardActiveClassName =
  "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] shadow-sm";

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
    <div className={pageClassName}>
      <div className={cardClassName}>
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] shadow-sm">
              <Image
            src="/SocialRavenLogo.svg"
            alt="SocialRaven"
                width={28}
                height={28}
                className="h-7 w-7"
              />
            </div>
          </div>
          <h1 className="text-title-20 text-[var(--ds-gray-1000)]">
            Select a workspace
          </h1>
          <p className="mt-1 text-label-14 leading-6 text-[var(--ds-gray-900)]">
            Choose where you&apos;d like to work
          </p>
        </div>

        <div className="mb-3 space-y-2">
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              className={cn(
                workspaceCardBaseClassName,
                selected?.id === w.id
                  ? workspaceCardActiveClassName
                  : workspaceCardIdleClassName,
                focusRingClassName
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  selected?.id === w.id
                    ? "border-[var(--ds-plum-200)] bg-[var(--ds-background-100)] text-[var(--ds-plum-700)]"
                    : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
                )}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                  {w.name}
                </p>
                <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                  {[w.companyName, w.role.replace("_", " ").toLowerCase()].filter(Boolean).join(" • ")}
                </p>
              </div>
              {selected?.id === w.id && (
                <Check className="h-4 w-4 shrink-0 text-[var(--ds-plum-700)]" />
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
                workspaceCardBaseClassName,
                creating
                  ? workspaceCardActiveClassName
                  : "border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]",
                focusRingClassName
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  creating
                    ? "border-[var(--ds-plum-200)] bg-[var(--ds-background-100)] text-[var(--ds-plum-700)]"
                    : "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
                )}
              >
                <Plus className="h-4 w-4" />
              </div>
              <p className="text-label-14 text-[var(--ds-gray-900)]">
                Create new workspace
              </p>
            </button>
          )}
        </div>

        {creating && canCreateWorkspaces && (
          <div className="mb-3 space-y-3 rounded-xl border border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] p-4">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name" className="text-label-14 text-[var(--ds-plum-700)]">
                Workspace name
              </Label>
              <Input
                id="ws-name"
                placeholder="e.g. Acme Agency"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
                className={inputClassName}
              />
            </div>
            {manageableCompanies.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-label-14 text-[var(--ds-plum-700)]">
                  Company
                </Label>
                <Select value={createCompanyId} onValueChange={setCreateCompanyId}>
                  <SelectTrigger
                    className={cn(
                      "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]",
                      focusRingClassName
                    )}
                  >
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
                    {manageableCompanies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id}
                        className="focus:bg-[var(--ds-gray-100)] focus:text-[var(--ds-gray-1000)]"
                      >
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && <p className="text-copy-12 text-[var(--ds-red-700)]">{error}</p>}
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || busy || !createCompanyId}
              className={primaryButtonClassName}
              size="sm"
            >
              {busy ? "Creating…" : "Create & enter"}
            </Button>
          </div>
        )}

        {!creating && (
          <Button
            onClick={handleEnter}
            disabled={!selected}
            className={cn(
              selected ? primaryButtonClassName : secondaryButtonClassName,
              "mt-1"
            )}
          >
            Enter workspace
          </Button>
        )}
      </div>
    </div>
  );
}
