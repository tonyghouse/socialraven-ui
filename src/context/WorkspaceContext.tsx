"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { WorkspaceResponse } from "@/model/Workspace";
import { getMyWorkspacesApi } from "@/service/workspace";

interface WorkspaceContextValue {
  workspaces: WorkspaceResponse[];
  activeWorkspace: WorkspaceResponse | null;
  isLoading: boolean;
  switchWorkspace: (workspace: WorkspaceResponse) => void;
  refresh: () => Promise<void>;
}

const WorkspaceCtx = createContext<WorkspaceContextValue>({
  workspaces: [],
  activeWorkspace: null,
  isLoading: true,
  switchWorkspace: () => {},
  refresh: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [activeWorkspace, setActiveWorkspace] =
    useState<WorkspaceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const load = useCallback(async () => {
    try {
      const list = await getMyWorkspacesApi(getToken);
      setWorkspaces(list);

      const storedId =
        typeof window !== "undefined"
          ? localStorage.getItem("activeWorkspaceId")
          : null;

      const active =
        list.find((w) => w.id === storedId) ?? list[0] ?? null;

      if (active) {
        localStorage.setItem("activeWorkspaceId", active.id);
        localStorage.setItem(
          "activeWorkspaceRole",
          active.role
        );
      }

      setActiveWorkspace(active);
    } catch {
      // Non-fatal — keep current state
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    load();
  }, [load]);

  const switchWorkspace = useCallback((workspace: WorkspaceResponse) => {
    localStorage.setItem("activeWorkspaceId", workspace.id);
    localStorage.setItem("activeWorkspaceRole", workspace.role);
    setActiveWorkspace(workspace);
  }, []);

  return (
    <WorkspaceCtx.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        switchWorkspace,
        refresh: load,
      }}
    >
      {children}
    </WorkspaceCtx.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceCtx);
}
