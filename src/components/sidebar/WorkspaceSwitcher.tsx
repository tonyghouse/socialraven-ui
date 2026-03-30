"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeftRight as ArrowsLeftRight,
  Check,
  ChevronDown as CaretDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext";
import { WorkspaceResponse } from "@/model/Workspace";
import { usePlan } from "@/hooks/usePlan";
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
  const { isInfluencer } = usePlan();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = activeWorkspace?.name ?? "Main workspace";

  const triggerClassName = cn(
    "group flex h-8 w-full items-center gap-2 rounded-lg border border-transparent px-2 text-left transition-[background-color,border-color,color,box-shadow] duration-150",
    "text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--foreground))]",
    open && "border-[hsl(var(--accent))]/20 bg-[hsl(var(--surface))] text-[hsl(var(--foreground))] shadow-xs"
  );

  const iconClassName =
    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))]";

  const renderStaticContent = (name: string) => (
    <>
      <div className={iconClassName}>
        <ArrowsLeftRight size={14} />
      </div>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-[-0.005em] text-[hsl(var(--foreground))]">
        {name}
      </span>
    </>
  );

  function openDropdown() {
    if (!open) refresh(); // fetch fresh list whenever dropdown is opened
    setOpen((v) => !v);
  }

  // Close on outside click — must be called unconditionally (rules of hooks)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Influencer plans: single static workspace display
  if (isInfluencer) {
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))]">
                <ArrowsLeftRight size={16} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Workspace: main
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <div className={triggerClassName}>
        {renderStaticContent("main")}
      </div>
    );
  }

  // Single workspace: show static display (no dropdown)
  if (workspaces.length < 2) {
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))]">
                <ArrowsLeftRight size={16} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {activeWorkspace?.name ?? "Workspace"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <div className={triggerClassName}>
        {renderStaticContent(activeWorkspace?.name ?? "Workspace")}
      </div>
    );
  }

  function handleSelect(w: WorkspaceResponse) {
    switchWorkspace(w);
    setOpen(false);
  }

  if (collapsed) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={openDropdown}
          title={activeWorkspace?.name ?? "Switch workspace"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--accent))] transition-[background-color,border-color,box-shadow] duration-150",
            "hover:border-[hsl(var(--accent))]/20 hover:bg-[hsl(var(--surface-raised))]",
            open && "border-[hsl(var(--accent))]/20 bg-[hsl(var(--surface-raised))] shadow-xs"
          )}
        >
          <ArrowsLeftRight size={16} />
        </button>

        {open && (
          <div
            className="absolute left-full top-0 z-50 ml-3 w-60 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1.5 shadow-lg"
          >
            <div className="px-2.5 pb-1.5 pt-1">
              <p className="text-[11px] font-semibold tracking-[0.01em] text-[hsl(var(--foreground-subtle))]">
                Switch workspace
              </p>
            </div>
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSelect(w)}
                className={cn(
                  "flex h-8 w-full items-center gap-2 rounded-lg border border-transparent px-2.5 text-[13px] transition-[background-color,border-color,color] duration-150",
                  activeWorkspace?.id === w.id
                    ? "border-[hsl(var(--accent))]/15 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    : "text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    activeWorkspace?.id === w.id
                      ? "border-[hsl(var(--accent))]/15 bg-white/70 text-[hsl(var(--accent))] dark:bg-[hsl(var(--surface))]"
                      : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-subtle))]"
                  )}
                >
                  <ArrowsLeftRight size={12} className="shrink-0" />
                </div>
                <span className="flex-1 truncate text-left">{w.name}</span>
                {activeWorkspace?.id === w.id && (
                  <Check size={14} className="shrink-0 text-accent" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={openDropdown}
        className={triggerClassName}
      >
        {renderStaticContent(displayName)}
        <CaretDown
          size={14}
          className={cn(
            "shrink-0 text-[hsl(var(--foreground-subtle))] transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-1.5 shadow-lg">
          <div className="px-2.5 pb-1.5 pt-1">
            <p className="text-[11px] font-semibold tracking-[0.01em] text-[hsl(var(--foreground-subtle))]">
              Switch workspace
            </p>
          </div>
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded-lg border border-transparent px-2.5 text-[13px] transition-[background-color,border-color,color] duration-150",
                activeWorkspace?.id === w.id
                  ? "border-[hsl(var(--accent))]/15 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                  : "text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--border-subtle))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  activeWorkspace?.id === w.id
                    ? "border-[hsl(var(--accent))]/15 bg-white/70 text-[hsl(var(--accent))] dark:bg-[hsl(var(--surface))]"
                    : "border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] text-[hsl(var(--foreground-subtle))]"
                )}
              >
                <ArrowsLeftRight size={12} className="shrink-0" />
              </div>
              <span className="flex-1 truncate text-left">{w.name}</span>
              {activeWorkspace?.id === w.id && (
                <Check size={14} className="shrink-0 text-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
