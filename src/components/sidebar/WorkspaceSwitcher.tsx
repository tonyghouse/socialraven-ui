"use client";

import { Building2 as Buildings, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkspaceSwitcherProps {
  collapsed: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const { workspaces, activeWorkspace, switchWorkspace, refresh } = useWorkspace();
  const [open, setOpen] = useState(false);
  const displayName = activeWorkspace?.name ?? "Workspace";
  const displayCompanyName = activeWorkspace?.companyName ?? null;
  const canSwitch = workspaces.length > 1;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && canSwitch) {
      void refresh();
    }
    setOpen(nextOpen);
  }

  function handleSelect(workspaceId: string) {
    const nextWorkspace = workspaces.find((workspace) => workspace.id === workspaceId);

    if (!nextWorkspace || nextWorkspace.id === activeWorkspace?.id) {
      setOpen(false);
      return;
    }

    switchWorkspace(nextWorkspace);
    setOpen(false);
  }

  if (collapsed) {
    const collapsedTrigger = (
      <button
        type="button"
        disabled={!canSwitch}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg border transition-[background-color,border-color,color,box-shadow] duration-150",
          canSwitch
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
            : "cursor-default border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]/60 shadow-none"
        )}
        aria-label={canSwitch ? "Switch workspace" : `Current workspace: ${displayName}`}
      >
        <Buildings size={15} />
      </button>
    );

    return (
      <TooltipProvider delayDuration={300}>
        <DropdownMenu open={canSwitch ? open : false} onOpenChange={handleOpenChange}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{collapsedTrigger}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {displayName}
            </TooltipContent>
          </Tooltip>

          {canSwitch && (
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={10}
              className="w-64 rounded-xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-1.5 shadow-none"
            >
              <WorkspaceList
                activeWorkspaceId={activeWorkspace?.id ?? null}
                workspaces={workspaces}
                onSelect={handleSelect}
              />
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu open={canSwitch ? open : false} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={!canSwitch}
          className={cn(
            "group flex h-9 w-full items-center gap-2 rounded-lg border px-2.5 text-left transition-[background-color,border-color,color,box-shadow] duration-150",
            canSwitch
              ? "border-transparent bg-transparent text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-400)] hover:bg-[var(--ds-background-100)] hover:text-[var(--ds-gray-1000)]"
              : "cursor-default border-transparent bg-transparent text-[var(--ds-gray-900)]"
          )}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]">
            <Buildings size={14} />
          </div>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-label-13 text-[var(--ds-gray-1000)]">
              {displayName}
            </span>
            {displayCompanyName && (
              <span className="block truncate text-label-12 text-[var(--ds-gray-900)]">
                {displayCompanyName}
              </span>
            )}
          </div>

          {canSwitch && (
            <ChevronDown
              size={14}
              className={cn(
                "shrink-0 text-[var(--ds-gray-900)] transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          )}
        </button>
      </DropdownMenuTrigger>

      {canSwitch && (
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[240px] rounded-xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-1.5 shadow-none"
        >
          <WorkspaceList
            activeWorkspaceId={activeWorkspace?.id ?? null}
            workspaces={workspaces}
            onSelect={handleSelect}
          />
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

interface WorkspaceListProps {
  activeWorkspaceId: string | null;
  workspaces: Array<{ id: string; name: string; companyName?: string | null }>;
  onSelect: (workspaceId: string) => void;
}

function WorkspaceList({
  activeWorkspaceId,
  workspaces,
  onSelect,
}: WorkspaceListProps) {
  return (
    <div className="space-y-1">
      <p className="px-2 py-1 text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
        Switch workspace
      </p>

      <div className="max-h-72 overflow-y-auto pr-0.5">
        <div className="space-y-1">
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspaceId;

            return (
              <button
                key={workspace.id}
                type="button"
                onClick={() => onSelect(workspace.id)}
                className={cn(
                  "flex h-9 w-full items-center gap-2 rounded-lg border px-2.5 text-left transition-[background-color,border-color,color] duration-150",
                  isActive
                    ? "border-[hsl(var(--accent)/0.18)] bg-[hsl(var(--accent)/0.10)] text-[hsl(var(--accent))]"
                    : "border-transparent text-[var(--ds-gray-900)] hover:border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    isActive
                      ? "border-[hsl(var(--accent)/0.18)] bg-[var(--ds-background-100)] text-[hsl(var(--accent))]"
                      : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]"
                  )}
                >
                  <Buildings size={12} />
                </div>

                <span className="flex-1 truncate text-label-13">
                  <span className="block truncate text-label-13">
                    {workspace.name}
                  </span>
                  {workspace.companyName && (
                    <span
                      className={cn(
                        "block truncate text-label-12",
                        isActive ? "text-[hsl(var(--accent))]" : "text-[var(--ds-gray-900)]"
                      )}
                    >
                      {workspace.companyName}
                    </span>
                  )}
                </span>

                {isActive && <Check size={14} className="shrink-0 text-[hsl(var(--accent))]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
