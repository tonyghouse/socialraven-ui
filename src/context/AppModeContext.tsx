"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

import { useWorkspace } from "@/context/WorkspaceContext";
import {
  APP_MODE_STORAGE_EVENT,
  APP_MODE_STORAGE_KEY,
  resolveAppModeFromPlan,
  resolveAppModeFromWorkspaceId,
  type AppMode,
} from "@/lib/app-mode";
import type { PlanType, UserPlan } from "@/model/Plan";

type StoredAppMode = {
  version: 1;
  userId: string;
  plan: PlanType;
  mode: AppMode;
};

type AppModeContextValue = {
  mode: AppMode;
  plan: PlanType | null;
  isInfluencer: boolean;
  isAgency: boolean;
  syncFromUserPlan: (planOrUserPlan: PlanType | UserPlan | null | undefined) => void;
  clearCachedMode: () => void;
};

const AppModeCtx = createContext<AppModeContextValue>({
  mode: "agency",
  plan: null,
  isInfluencer: false,
  isAgency: true,
  syncFromUserPlan: () => {},
  clearCachedMode: () => {},
});

function isPlanType(value: unknown): value is PlanType {
  return typeof value === "string" &&
    (value.startsWith("INFLUENCER_") || value.startsWith("AGENCY_"));
}

function readStoredAppMode(userId: string | null | undefined): StoredAppMode | null {
  if (typeof window === "undefined" || !userId) {
    return null;
  }

  const raw = window.localStorage.getItem(APP_MODE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAppMode>;
    if (
      parsed.version !== 1 ||
      parsed.userId !== userId ||
      !isPlanType(parsed.plan) ||
      (parsed.mode !== "influencer" && parsed.mode !== "agency")
    ) {
      return null;
    }

    return parsed as StoredAppMode;
  } catch {
    return null;
  }
}

function writeStoredAppMode(value: StoredAppMode | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.localStorage.setItem(APP_MODE_STORAGE_KEY, JSON.stringify(value));
  } else {
    window.localStorage.removeItem(APP_MODE_STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(APP_MODE_STORAGE_EVENT));
}

function extractPlanType(
  planOrUserPlan: PlanType | UserPlan | null | undefined
): PlanType | null {
  if (!planOrUserPlan) {
    return null;
  }

  if (typeof planOrUserPlan === "string") {
    return planOrUserPlan;
  }

  return planOrUserPlan.currentPlan;
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [storedMode, setStoredMode] = useState<StoredAppMode | null>(null);

  useEffect(() => {
    setStoredMode(readStoredAppMode(userId));
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncFromStorage = () => {
      setStoredMode(readStoredAppMode(userId));
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === APP_MODE_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(APP_MODE_STORAGE_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(APP_MODE_STORAGE_EVENT, syncFromStorage);
    };
  }, [userId]);

  const syncFromUserPlan = useCallback((planOrUserPlan: PlanType | UserPlan | null | undefined) => {
    const nextPlan = extractPlanType(planOrUserPlan);
    if (!nextPlan || !userId) {
      return;
    }

    const nextValue: StoredAppMode = {
      version: 1,
      userId,
      plan: nextPlan,
      mode: resolveAppModeFromPlan(nextPlan),
    };

    setStoredMode((current) => {
      if (
        current?.userId === nextValue.userId &&
        current.plan === nextValue.plan &&
        current.mode === nextValue.mode
      ) {
        return current;
      }

      return nextValue;
    });
    writeStoredAppMode(nextValue);
  }, [userId]);

  const clearCachedMode = useCallback(() => {
    setStoredMode(null);
    writeStoredAppMode(null);
  }, []);

  const activeStoredMode =
    storedMode?.userId === userId
      ? storedMode
      : null;
  const fallbackMode =
    resolveAppModeFromWorkspaceId(activeWorkspace?.id) ?? "agency";
  const mode = activeStoredMode?.mode ?? fallbackMode;
  const plan = activeStoredMode?.plan ?? null;

  const value = useMemo(
    () => ({
      mode,
      plan,
      isInfluencer: mode === "influencer",
      isAgency: mode === "agency",
      syncFromUserPlan,
      clearCachedMode,
    }),
    [clearCachedMode, mode, plan, syncFromUserPlan]
  );

  return <AppModeCtx.Provider value={value}>{children}</AppModeCtx.Provider>;
}

export function useAppMode() {
  return useContext(AppModeCtx);
}
