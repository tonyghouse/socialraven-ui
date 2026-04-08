import { useAppMode } from "@/context/AppModeContext";

export function usePlan() {
  const {
    mode,
    plan,
    isInfluencer,
    isAgency,
    syncFromUserPlan,
  } = useAppMode();

  return { mode, plan, isInfluencer, isAgency, syncFromUserPlan };
}
