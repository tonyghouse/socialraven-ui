"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import {
  Shield,
  ExternalLink,
  Crown,
  ShieldCheck,
  Users,
  Eye,
  Sparkles,
  Building2,
  CheckCircle2,
  Circle,
  ArrowRight,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { usePlan } from "@/hooks/usePlan";
import { useWorkspace } from "@/context/WorkspaceContext";
import { fetchUserPlanApi } from "@/service/plan";
import { UserPlan, PlanType } from "@/model/Plan";
import { WorkspaceRole } from "@/model/Workspace";

// ─── display maps ────────────────────────────────────────────────────────────

const PLAN_NAMES: Record<PlanType, string> = {
  INFLUENCER_TRIAL: "Influencer Trial",
  INFLUENCER_BASE:  "Influencer",
  INFLUENCER_PRO:   "Influencer Pro",
  AGENCY_TRIAL:     "Agency Trial",
  AGENCY_BASE:      "Agency",
  AGENCY_PRO:       "Agency Pro",
  AGENCY_CUSTOM:    "Agency Custom",
};

const STATUS_CONFIG: Record<
  NonNullable<UserPlan["status"]>,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  ACTIVE:    { label: "Active",    dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  TRIALING:  { label: "Trial",     dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"   },
  CANCELLED: { label: "Cancelled", dot: "bg-red-500",     bg: "bg-red-50",      text: "text-red-600",     border: "border-red-200"     },
  PAST_DUE:  { label: "Past due",  dot: "bg-orange-500",  bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-200"  },
};

const ROLE_CONFIG: Record<
  WorkspaceRole,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
  }
> = {
  OWNER:  { label: "Owner",  description: "Full control of the workspace",        icon: Crown,       iconBg: "bg-violet-50",  iconColor: "text-violet-500",  pillBg: "bg-violet-50",  pillText: "text-violet-700",  pillBorder: "border-violet-200"  },
  ADMIN:  { label: "Admin",  description: "Manage team & workspace settings",      icon: ShieldCheck, iconBg: "bg-blue-50",    iconColor: "text-blue-500",    pillBg: "bg-blue-50",    pillText: "text-blue-700",    pillBorder: "border-blue-200"    },
  MEMBER: { label: "Member", description: "Create and manage content",             icon: Users,       iconBg: "bg-emerald-50", iconColor: "text-emerald-500", pillBg: "bg-emerald-50", pillText: "text-emerald-700", pillBorder: "border-emerald-200" },
  VIEWER: { label: "Viewer", description: "Read-only access to workspace content", icon: Eye,         iconBg: "bg-slate-50",   iconColor: "text-slate-400",   pillBg: "bg-slate-50",   pillText: "text-slate-600",   pillBorder: "border-slate-200"   },
};

// Role → what each agency role can do
const AGENCY_PERMISSIONS: { label: string; roles: WorkspaceRole[] }[] = [
  { label: "View all content",           roles: ["OWNER", "ADMIN", "MEMBER", "VIEWER"] },
  { label: "Schedule & edit posts",      roles: ["OWNER", "ADMIN", "MEMBER"]            },
  { label: "Connect social accounts",    roles: ["OWNER", "ADMIN", "MEMBER"]            },
  { label: "Manage workspace members",   roles: ["OWNER", "ADMIN"]                      },
  { label: "Workspace settings",         roles: ["OWNER", "ADMIN"]                      },
  { label: "Billing & plans",            roles: ["OWNER"]                               },
];

// What an influencer solo account can do (always full access)
const INFLUENCER_PERMISSIONS = [
  "View all content",
  "Schedule & publish posts",
  "Connect social accounts",
  "Manage workspace",
  "Billing & plans",
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── sub-components ──────────────────────────────────────────────────────────

function PlanCardSkeleton() {
  return (
    <Card className="border-foreground/10">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { role, isOwner } = useRole();
  const { plan, isInfluencer } = usePlan();
  const { activeWorkspace } = useWorkspace();

  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    fetchUserPlanApi(getToken)
      .then(setUserPlan)
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusCfg = userPlan ? STATUS_CONFIG[userPlan.status] : null;
  const roleCfg   = ROLE_CONFIG[role];
  const RoleIcon  = roleCfg.icon;

  const isInfluencerPlan = plan?.startsWith("INFLUENCER");
  const PlanIcon    = isInfluencerPlan ? Sparkles   : Building2;
  const planIconBg  = isInfluencerPlan ? "bg-purple-50" : "bg-blue-50";
  const planIconClr = isInfluencerPlan ? "text-purple-500" : "text-blue-500";

  return (
    <div className="w-full py-8 px-8 space-y-10">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and privacy preferences.
        </p>
      </div>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 1 — ACCOUNT SETTINGS (Clerk)
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update your name, email, password, and connected devices.
          </p>
        </div>
        <div className="rounded-xl overflow-hidden border border-foreground/10 shadow-sm">
          <UserProfile routing="hash" />
        </div>
      </section>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 2 — MEMBERSHIP & ROLE
      ══════════════════════════════════════════════════ */}
      <section className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Membership &amp; Role
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your current plan and workspace access level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── Plan card ───────────────────────────────── */}
          {planLoading ? (
            <PlanCardSkeleton />
          ) : (
            <Card className="border-foreground/10 shadow-sm flex flex-col">
              <CardContent className="p-5 flex flex-col h-full gap-4">

                {/* Header row */}
                <div className="flex items-start gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", planIconBg)}>
                    <PlanIcon className={cn("h-5 w-5", planIconClr)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground/85 leading-tight">
                      {plan ? PLAN_NAMES[plan] : "—"}
                    </p>
                    {statusCfg && (
                      <span className={cn(
                        "inline-flex items-center gap-1.5 mt-1.5 px-2 py-[3px] rounded-full text-[11px] font-medium border",
                        statusCfg.bg, statusCfg.text, statusCfg.border
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusCfg.dot)} />
                        {statusCfg.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-1.5 flex-1">
                  {userPlan?.status === "TRIALING" && userPlan.trialEndsAt && (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-amber-600">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                      Trial ends {formatDate(userPlan.trialEndsAt)}
                    </div>
                  )}
                  {userPlan?.renewalDate && userPlan.status !== "TRIALING" && (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-foreground/45">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                      {userPlan.cancelAtPeriodEnd ? "Cancels" : "Renews"}{" "}
                      {formatDate(userPlan.renewalDate)}
                    </div>
                  )}
                  {userPlan?.cancelAtPeriodEnd && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-px" />
                      <p className="text-[11.5px] text-red-500 leading-relaxed">
                        Your plan will not renew. Access continues until the end of the period.
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA (owner only) */}
                {isOwner && (
                  <div className="pt-3 border-t border-foreground/[0.06]">
                    <Link
                      href="/billing"
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:text-accent/75 transition-colors group"
                    >
                      Manage plan
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Role card ───────────────────────────────── */}
          <Card className="border-foreground/10 shadow-sm">
            <CardContent className="p-5 flex flex-col gap-4">

              {/* Header row */}
              <div className="flex items-start gap-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", roleCfg.iconBg)}>
                  <RoleIcon className={cn("h-5 w-5", roleCfg.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[15px] font-semibold text-foreground/85 leading-tight">
                      {isInfluencer ? "Solo Creator" : roleCfg.label}
                    </p>
                    {!isInfluencer && (
                      <span className={cn(
                        "inline-flex items-center px-2 py-[3px] rounded-full text-[10.5px] font-semibold border",
                        roleCfg.pillBg, roleCfg.pillText, roleCfg.pillBorder
                      )}>
                        {roleCfg.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-foreground/40 mt-0.5 truncate">
                    {isInfluencer
                      ? "Personal workspace"
                      : (activeWorkspace?.name ?? "—")}
                  </p>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-foreground/30 mb-2.5">
                  Permissions
                </p>

                {isInfluencer ? (
                  <div className="space-y-1.5">
                    {INFLUENCER_PERMISSIONS.map((label) => (
                      <div key={label} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="text-[12.5px] text-foreground/65">{label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {AGENCY_PERMISSIONS.map(({ label, roles }) => {
                      const granted = (roles as string[]).includes(role);
                      return (
                        <div key={label} className="flex items-center gap-2">
                          {granted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-foreground/15 shrink-0" />
                          )}
                          <span className={cn(
                            "text-[12.5px]",
                            granted ? "text-foreground/65" : "text-foreground/25"
                          )}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

        </div>
      </section>

      <Separator />

      {/* ══════════════════════════════════════════════════
          SECTION 3 — DATA & PRIVACY
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Data &amp; Privacy
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your rights under GDPR and applicable US privacy laws.
          </p>
        </div>

        <Card className="border-foreground/10">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is stored and processed in accordance with the{" "}
                <strong className="text-foreground">
                  General Data Protection Regulation (GDPR)
                </strong>{" "}
                for EEA and UK residents, and applicable US state privacy laws including CCPA.
                We apply data minimisation principles and never sell your personal data.
                <br />
                <br />
                You have the right to access, correct, or erase your personal data at any time
                (GDPR Arts. 15–17). Submit requests to{" "}
                <a
                  href="mailto:privacy@socialraven.io"
                  className="text-foreground underline hover:no-underline"
                >
                  privacy@socialraven.io
                </a>
                . We respond within 30 days.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Terms of Service
              </a>
              <a
                href="mailto:privacy@socialraven.io?subject=Data%20Deletion%20Request"
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                Request Data Deletion (GDPR Art. 17)
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
