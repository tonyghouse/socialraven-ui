import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PlanType } from "@/model/Plan";
import { fetchUserPlanApi } from "@/service/plan";

export function usePlan() {
  const { getToken } = useAuth();
  const [plan, setPlan] = useState<PlanType | null>(null);

  useEffect(() => {
    fetchUserPlanApi(getToken)
      .then((p) => setPlan(p.currentPlan))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInfluencer =
    plan === "INFLUENCER_TRIAL" ||
    plan === "INFLUENCER_BASE" ||
    plan === "INFLUENCER_PRO";

  return { plan, isInfluencer };
}
