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
import { getOnboardingStatusApi } from "@/service/onboarding";
import { AccountDeactivatedError, getMyWorkspacesApi } from "@/service/workspace";

interface WorkspaceContextValue {
  workspaces: WorkspaceResponse[];
  activeWorkspace: WorkspaceResponse | null;
  isLoading: boolean;
  isDeactivated: boolean;
  hasCompletedOnboarding: boolean;
  canCreateWorkspaces: boolean;
  switchWorkspace: (workspace: WorkspaceResponse) => void;
  refresh: () => Promise<void>;
}

const WorkspaceCtx = createContext<WorkspaceContextValue>({
  workspaces: [],
  activeWorkspace: null,
  isLoading: true,
  isDeactivated: false,
  hasCompletedOnboarding: false,
  canCreateWorkspaces: false,
  switchWorkspace: () => {},
  refresh: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [activeWorkspace, setActiveWorkspace] =
    useState<WorkspaceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [canCreateWorkspaces, setCanCreateWorkspaces] = useState(false);
  const initialized = useRef(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsDeactivated(false);

    try {
      const [workspacesResult, onboardingResult] = await Promise.allSettled([
        getMyWorkspacesApi(getToken),
        getOnboardingStatusApi(getToken),
      ]);

      if (
        workspacesResult.status === "rejected" &&
        workspacesResult.reason instanceof AccountDeactivatedError
      ) {
        setIsDeactivated(true);
        setWorkspaces([]);
        setActiveWorkspace(null);
        return;
      }

      if (workspacesResult.status === "rejected") {
        throw workspacesResult.reason;
      }

      const list = workspacesResult.value;
      setWorkspaces(list);

      if (onboardingResult.status === "fulfilled") {
        setHasCompletedOnboarding(onboardingResult.value.completed);
        setCanCreateWorkspaces(onboardingResult.value.canCreateWorkspaces);
      } else {
        setHasCompletedOnboarding(list.length > 0);
        setCanCreateWorkspaces(false);
      }

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
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("activeWorkspaceId");
        localStorage.removeItem("activeWorkspaceRole");
      }

      setActiveWorkspace(active);
    } catch (e) {
      if (e instanceof AccountDeactivatedError) {
        setIsDeactivated(true);
      }
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
    window.location.reload();
  }, []);

  return (
    <WorkspaceCtx.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        isDeactivated,
        hasCompletedOnboarding,
        canCreateWorkspaces,
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
