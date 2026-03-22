"use client";

import { Building2, Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const { isInfluencer } = usePlan();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
                <Building2 className="h-4 w-4 text-accent" />
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
      <div className="flex items-center gap-2 w-full rounded-xl px-2 py-2">
        <div className="h-6 w-6 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
          <Building2 className="h-3.5 w-3.5 text-accent" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-foreground/30 leading-none mb-0.5">
            Workspace
          </span>
          <span className="text-[13px] font-medium text-foreground/70 truncate leading-none">
            main
          </span>
        </div>
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
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
                <Building2 className="h-4 w-4 text-accent" />
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
      <div className="flex items-center gap-2 w-full rounded-xl px-2 py-2">
        <div className="h-6 w-6 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
          <Building2 className="h-3.5 w-3.5 text-accent" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-foreground/30 leading-none mb-0.5">
            Workspace
          </span>
          <span className="text-[13px] font-medium text-foreground/70 truncate leading-none">
            {activeWorkspace?.name ?? "—"}
          </span>
        </div>
      </div>
    );
  }

  function handleSelect(w: WorkspaceResponse) {
    switchWorkspace(w);
    setOpen(false);
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setOpen((v) => !v)}
        title={activeWorkspace?.name ?? "Switch workspace"}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
      >
        <Building2 className="h-4 w-4 text-accent" />

        {open && (
          <div
            ref={ref}
            className="absolute left-full top-0 ml-3 w-52 rounded-xl border border-border/60 bg-white shadow-lg py-1 z-50"
          >
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSelect(w)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate text-left">{w.name}</span>
                {activeWorkspace?.id === w.id && (
                  <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 w-full rounded-xl px-2 py-2",
          "text-sm font-medium text-foreground/70 hover:bg-black/[0.04]",
          "transition-colors"
        )}
      >
        <div className="h-6 w-6 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
          <Building2 className="h-3.5 w-3.5 text-accent" />
        </div>
        <span className="flex-1 truncate text-left text-[13px]">
          {activeWorkspace?.name ?? "Select workspace"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-150 text-foreground/30",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-border/60 bg-white shadow-lg py-1 z-50">
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate text-left">{w.name}</span>
              {activeWorkspace?.id === w.id && (
                <Check className="h-3.5 w-3.5 text-accent shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
