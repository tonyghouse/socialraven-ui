"use client";

import { Building2 as Buildings, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
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

  const collapsedTrigger = (
    <button
      type="button"
      disabled={!canSwitch}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
        canSwitch
          ? "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]"
          : "cursor-default bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
      )}
      aria-label={canSwitch ? "Switch workspace" : `Current workspace: ${displayName}`}
    >
      <Buildings className="h-[1.125rem] w-[1.125rem]" />
    </button>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={250}>
        <DropdownMenu open={canSwitch ? open : false} onOpenChange={handleOpenChange}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{collapsedTrigger}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none"
            >
              {displayName}
            </TooltipContent>
          </Tooltip>

          {canSwitch ? (
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={10}
              className="w-[16.5rem] rounded-2xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-2 shadow-none"
            >
              <WorkspaceList
                activeWorkspaceId={activeWorkspace?.id ?? null}
                workspaces={workspaces}
                onSelect={handleSelect}
              />
            </DropdownMenuContent>
          ) : null}
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
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
            canSwitch
              ? "hover:bg-[var(--ds-gray-100)]"
              : "cursor-default"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]">
            <Buildings className="h-[1.125rem] w-[1.125rem]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.875rem] font-medium text-[var(--ds-gray-1000)]">{displayName}</p>
            <p className="mt-0.5 truncate text-label-12 text-[var(--ds-gray-900)]">
              {displayCompanyName ?? `${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {canSwitch ? (
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[var(--ds-gray-900)] transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          ) : null}
        </button>
      </DropdownMenuTrigger>

      {canSwitch ? (
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[16.5rem] rounded-2xl border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-2 shadow-none"
        >
          <WorkspaceList
            activeWorkspaceId={activeWorkspace?.id ?? null}
            workspaces={workspaces}
            onSelect={handleSelect}
          />
        </DropdownMenuContent>
      ) : null}
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
    <div className="space-y-2">
      <div className="px-2 pb-1">
        <p className="text-label-12 uppercase tracking-[0.16em] text-[var(--ds-gray-900)]">
          Workspaces
        </p>
        <p className="mt-1 text-copy-13 text-[var(--ds-gray-900)]">
          Switch the active workspace.
        </p>
      </div>

      <div className="space-y-1">
        {workspaces.map((workspace) => {
          const isActive = workspace.id === activeWorkspaceId;

          return (
            <button
              key={workspace.id}
              type="button"
              onClick={() => onSelect(workspace.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                isActive
                  ? "bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                  : "text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-1000)]"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isActive
                    ? "bg-[var(--ds-background-100)] text-[var(--ds-plum-700)]"
                    : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
                )}
              >
                <Buildings className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-label-13">{workspace.name}</p>
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
    </div>
  );
}
