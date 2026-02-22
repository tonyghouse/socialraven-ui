"use client";

import { UserProfile } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, fetchUserPlanApi, changeUserPlanApi } from "@/service/plan";
import { PlanType, UserPlan } from "@/model/Plan";

export default function ProfilePage() {
  const { getToken } = useAuth();

  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [changingTo, setChangingTo] = useState<PlanType | null>(null);

  useEffect(() => {
    fetchUserPlanApi(getToken)
      .then(setUserPlan)
      .catch(() => toast.error("Failed to load plan info"))
      .finally(() => setPlanLoading(false));
  }, [getToken]);

  async function handleChangePlan(planType: PlanType) {
    if (!userPlan || planType === userPlan.currentPlan) return;
    setChangingTo(planType);
    try {
      const updated = await changeUserPlanApi(getToken, planType);
      setUserPlan(updated);
      toast.success(`Switched to ${planType.charAt(0) + planType.slice(1).toLowerCase()} plan`);
    } catch {
      toast.error("Failed to change plan. Please try again.");
    } finally {
      setChangingTo(null);
    }
  }

  const currentPlanType = userPlan?.currentPlan;
  const currentPlanIndex = PLANS.findIndex((p) => p.type === currentPlanType);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">

      {/* Plan Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Plan</h2>
          {userPlan && (
            <span className="text-sm text-muted-foreground">
              Renews{" "}
              {new Date(userPlan.renewalDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {planLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading plan info…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan, idx) => {
              const isCurrent = plan.type === currentPlanType;
              const isUpgrade = currentPlanIndex !== -1 && idx > currentPlanIndex;
              const isDowngrade = currentPlanIndex !== -1 && idx < currentPlanIndex;
              const isChanging = changingTo === plan.type;

              return (
                <div
                  key={plan.type}
                  className={cn(
                    "rounded-xl border p-5 flex flex-col gap-4 shadow-sm transition-all",
                    isCurrent
                      ? "border-foreground ring-1 ring-foreground bg-white"
                      : "bg-white hover:border-foreground/30"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{plan.name}</span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {plan.price === 0 ? (
                        <span className="text-lg font-bold">Free</span>
                      ) : (
                        <>
                          <span className="text-lg font-bold">${plan.price}</span>
                          <span className="text-xs text-muted-foreground">/mo</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-green-600 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action */}
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    disabled={isCurrent || isChanging || changingTo !== null}
                    onClick={() => handleChangePlan(plan.type)}
                  >
                    {isChanging ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Switching…
                      </span>
                    ) : isCurrent ? (
                      "Current plan"
                    ) : isUpgrade ? (
                      "Upgrade"
                    ) : isDowngrade ? (
                      "Downgrade"
                    ) : (
                      "Switch"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="border-t border-foreground/10 pt-10">
        <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
        <div className="rounded-xl overflow-hidden border shadow-sm">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  );
}
