import type { PlanType } from "@/model/Plan";

export type AppMode = "influencer" | "agency";
export type ModeTag = AppMode | "both";

export const APP_MODE_STORAGE_KEY = "socialraven.app-mode";
export const APP_MODE_STORAGE_EVENT = "socialraven:app-mode-updated";

export function resolveAppModeFromPlan(plan: PlanType): AppMode {
  return plan.startsWith("INFLUENCER") ? "influencer" : "agency";
}

export function resolveAppModeFromWorkspaceId(
  workspaceId: string | null | undefined
): AppMode | null {
  if (!workspaceId) {
    return null;
  }

  return workspaceId.startsWith("personal_") ? "influencer" : "agency";
}

export function modeAllows(tag: ModeTag, mode: AppMode) {
  return tag === "both" || tag === mode;
}
