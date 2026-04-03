"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
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
  Camera,
  Loader2,
  Mail,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedPageHeader } from "@/components/layout/protected-page-header";
import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";
import { usePlan } from "@/hooks/usePlan";
import { useWorkspace } from "@/context/WorkspaceContext";
import { fetchUserPlanApi } from "@/service/plan";
import {
  addMyProfileEmailApi,
  deleteMyProfileEmailApi,
  fetchMyProfileApi,
  setMyPrimaryEmailApi,
  updateMyProfileNameApi,
} from "@/service/profile";
import { ProfileResponse } from "@/model/Profile";
import { UserPlan, PlanType } from "@/model/Plan";
import { WorkspaceRole } from "@/model/Workspace";

const PLAN_NAMES: Record<PlanType, string> = {
  INFLUENCER_TRIAL: "Influencer Trial",
  INFLUENCER_BASE: "Influencer",
  INFLUENCER_PRO: "Influencer Pro",
  AGENCY_TRIAL: "Agency Trial",
  AGENCY_BASE: "Agency",
  AGENCY_PRO: "Agency Pro",
  AGENCY_CUSTOM: "Agency Custom",
};

const STATUS_CONFIG: Record<
  NonNullable<UserPlan["status"]>,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  ACTIVE: { label: "Active", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  TRIALING: { label: "Trial", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  CANCELLED: { label: "Cancelled", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  PAST_DUE: { label: "Past due", dot: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
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
  OWNER: { label: "Owner", description: "Full control of the workspace", icon: Crown, iconBg: "bg-violet-50", iconColor: "text-violet-500", pillBg: "bg-violet-50", pillText: "text-violet-700", pillBorder: "border-violet-200" },
  ADMIN: { label: "Admin", description: "Manage team & workspace settings", icon: ShieldCheck, iconBg: "bg-blue-50", iconColor: "text-blue-500", pillBg: "bg-blue-50", pillText: "text-blue-700", pillBorder: "border-blue-200" },
  EDITOR: { label: "Editor", description: "Create and manage content", icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", pillBg: "bg-emerald-50", pillText: "text-emerald-700", pillBorder: "border-emerald-200" },
  READ_ONLY: { label: "Read Only", description: "Read-only access to workspace content", icon: Eye, iconBg: "bg-slate-50", iconColor: "text-slate-400", pillBg: "bg-slate-50", pillText: "text-slate-600", pillBorder: "border-slate-200" },
};

const AGENCY_PERMISSIONS: { label: string; roles: WorkspaceRole[] }[] = [
  { label: "View all content", roles: ["OWNER", "ADMIN", "EDITOR", "READ_ONLY"] },
  { label: "Schedule & edit posts", roles: ["OWNER", "ADMIN", "EDITOR"] },
  { label: "Connect social accounts", roles: ["OWNER", "ADMIN", "EDITOR"] },
  { label: "Manage workspace members", roles: ["OWNER", "ADMIN"] },
  { label: "Workspace settings", roles: ["OWNER", "ADMIN"] },
  { label: "Billing & plans", roles: ["OWNER"] },
];

const INFLUENCER_PERMISSIONS = [
  "View all content",
  "Schedule & publish posts",
  "Connect social accounts",
  "Manage workspace",
  "Billing & plans",
];

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(profile: ProfileResponse | null) {
  const first = profile?.firstName?.[0] ?? "";
  const last = profile?.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
}

function PlanCardSkeleton() {
  return (
    <Card className="rounded-lg border-[hsl(var(--border-subtle))] shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
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

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { role, isOwner } = useRole();
  const { plan, isInfluencer } = usePlan();
  const { activeWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [savingName, setSavingName] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [changingPrimaryId, setChangingPrimaryId] = useState<string | null>(null);
  const [deletingEmailId, setDeletingEmailId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchMyProfileApi(getToken), fetchUserPlanApi(getToken)])
      .then(([profileResponse, planResponse]) => {
        setProfile(profileResponse);
        setFirstName(profileResponse.firstName ?? "");
        setLastName(profileResponse.lastName ?? "");
        setUserPlan(planResponse);
      })
      .catch(() => toast.error("Failed to load profile details"))
      .finally(() => {
        setProfileLoading(false);
        setPlanLoading(false);
      });
  }, [getToken]);

  const statusCfg = userPlan ? STATUS_CONFIG[userPlan.status] : null;
  const roleCfg = ROLE_CONFIG[role];
  const RoleIcon = roleCfg.icon;
  const avatarUrl = user?.hasImage ? user.imageUrl : profile?.imageUrl ?? null;

  const isInfluencerPlan = plan?.startsWith("INFLUENCER");
  const PlanIcon = isInfluencerPlan ? Sparkles : Building2;
  const planIconBg = isInfluencerPlan ? "bg-purple-50" : "bg-blue-50";
  const planIconClr = isInfluencerPlan ? "text-purple-500" : "text-blue-500";

  function applyProfile(nextProfile: ProfileResponse, successMessage?: string) {
    setProfile(nextProfile);
    setFirstName(nextProfile.firstName ?? "");
    setLastName(nextProfile.lastName ?? "");
    void user?.reload();
    if (successMessage) {
      toast.success(successMessage);
    }
  }

  async function handleNameSave() {
    setSavingName(true);
    try {
      const updated = await updateMyProfileNameApi(getToken, firstName, lastName);
      applyProfile(updated, "Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSavingName(false);
    }
  }

  async function handleAddEmail() {
    setAddingEmail(true);
    try {
      const updated = await addMyProfileEmailApi(getToken, newEmail);
      setNewEmail("");
      applyProfile(updated, "Email address added");
      toast.info("New email addresses are added as unverified until verification is completed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add email address");
    } finally {
      setAddingEmail(false);
    }
  }

  async function handleSetPrimaryEmail(emailAddressId: string) {
    setChangingPrimaryId(emailAddressId);
    try {
      const updated = await setMyPrimaryEmailApi(getToken, emailAddressId);
      applyProfile(updated, "Primary email updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update primary email");
    } finally {
      setChangingPrimaryId(null);
    }
  }

  async function handleDeleteEmail(emailAddressId: string) {
    setDeletingEmailId(emailAddressId);
    try {
      const updated = await deleteMyProfileEmailApi(getToken, emailAddressId);
      applyProfile(updated, "Email address removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove email address");
    } finally {
      setDeletingEmailId(null);
    }
  }

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast.error("User session is not available");
      event.target.value = "";
      return;
    }

    setUpdatingImage(true);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      toast.success("Profile image updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload profile image");
    } finally {
      setUpdatingImage(false);
      event.target.value = "";
    }
  }

  if (profileLoading && planLoading) {
    return <ProfilePageSkeleton />;
  }

  async function handleDeleteImage() {
    if (!user) {
      toast.error("User session is not available");
      return;
    }

    setUpdatingImage(true);
    try {
      await user.setProfileImage({ file: null });
      await user.reload();
      toast.success("Profile image removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove profile image");
    } finally {
      setUpdatingImage(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[hsl(var(--background))]">
      <ProtectedPageHeader
        title="Profile"
        description="Manage your account details, workspace access, and privacy preferences."
        icon={<Shield className="h-4 w-4" />}
      />

      <div className="flex w-full flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">

        <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/70 px-4 py-3 dark:bg-[hsl(var(--surface-sunken))] sm:px-5">
            <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
              Account
            </h2>
            <p className="mt-1 text-xs leading-4 text-[hsl(var(--foreground-muted))]">
              Manage your profile details, email addresses, and avatar.
            </p>
          </div>

          {profileLoading ? (
            <div className="grid gap-3 px-3 py-3 sm:px-4 xl:grid-cols-[240px_minmax(0,1fr)]">
              <Skeleton className="h-52 rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-44 rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 px-3 py-3 sm:px-4 xl:grid-cols-[240px_minmax(0,1fr)]">
              <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Profile avatar"
                      className="h-20 w-20 rounded-xl border border-[hsl(var(--border-subtle))] object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] text-lg font-semibold text-[hsl(var(--foreground-muted))]">
                      {getInitials(profile)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-5 text-foreground">
                      {[profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Your profile"}
                    </p>
                    <p className="text-xs leading-4 text-muted-foreground">
                      {profile?.emailAddresses.find((email) => email.primary)?.emailAddress ?? "No primary email"}
                    </p>
                  </div>

                  <div className="grid w-full gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full gap-1.5"
                      disabled={updatingImage}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {updatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      Change photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full gap-1.5"
                      disabled={updatingImage || !user?.hasImage}
                      onClick={handleDeleteImage}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelected}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-3">
                <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                  <CardContent className="grid gap-3 p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-5 text-foreground">Profile details</p>
                      <p className="text-xs leading-4 text-muted-foreground">
                        Keep your name up to date across the app.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-5 text-foreground">First name</label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-5 text-foreground">Last name</label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" className="h-9" disabled={savingName} onClick={handleNameSave}>
                        {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                  <CardContent className="grid gap-3 p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-5 text-foreground">Email addresses</p>
                      <p className="text-xs leading-4 text-muted-foreground">
                        Add new email addresses and choose which verified email is primary.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {profile?.emailAddresses.map((email) => (
                        <div
                          key={email.id}
                          className="flex flex-col gap-2 rounded-lg border border-[hsl(var(--border-subtle))] px-3 py-2.5 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Mail className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
                              <span className="truncate text-sm font-medium leading-5 text-foreground">
                                {email.emailAddress}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-4",
                                  email.primary
                                    ? "border-[hsl(var(--accent)/0.18)] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))]"
                                    : "border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] text-[hsl(var(--foreground-muted))]"
                                )}
                              >
                                {email.primary ? "Primary" : "Secondary"}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-4",
                                  email.verified
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                )}
                              >
                                {email.verified ? "Verified" : "Pending verification"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {!email.primary && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={!email.verified || changingPrimaryId === email.id}
                                onClick={() => handleSetPrimaryEmail(email.id)}
                              >
                                {changingPrimaryId === email.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                Make primary
                              </Button>
                            )}
                            {!email.primary && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                disabled={deletingEmailId === email.id}
                                onClick={() => handleDeleteEmail(email.id)}
                              >
                                {deletingEmailId === email.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))]/35 p-3.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-5 text-foreground">Add email address</label>
                        <Input
                          type="email"
                          value={newEmail}
                          placeholder="name@company.com"
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <p className="text-xs leading-4 text-muted-foreground">
                          Added email addresses remain pending until verified.
                        </p>
                      </div>
                      <Button type="button" className="h-9" disabled={addingEmail} onClick={handleAddEmail}>
                        {addingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Add email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/70 px-4 py-3 dark:bg-[hsl(var(--surface-sunken))] sm:px-5">
            <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
              Membership &amp; Role
            </h2>
            <p className="mt-1 text-xs leading-4 text-[hsl(var(--foreground-muted))]">
              Your current plan and workspace access level.
            </p>
          </div>
          <div className="px-3 py-3 sm:px-4">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {planLoading ? (
                <PlanCardSkeleton />
              ) : (
                <Card className="flex flex-col rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", planIconBg)}>
                        <PlanIcon className={cn("h-5 w-5", planIconClr)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-5 text-foreground">
                          {plan ? PLAN_NAMES[plan] : "—"}
                        </p>
                        {statusCfg && (
                          <span
                            className={cn(
                              "mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-xs font-medium leading-4",
                              statusCfg.bg,
                              statusCfg.text,
                              statusCfg.border
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusCfg.dot)} />
                            {statusCfg.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1">
                      {userPlan?.status === "TRIALING" && userPlan.trialEndsAt && (
                        <div className="flex items-center gap-1.5 text-xs leading-4 text-amber-600">
                          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                          Trial ends {formatDate(userPlan.trialEndsAt)}
                        </div>
                      )}
                      {userPlan?.renewalDate && userPlan.status !== "TRIALING" && (
                        <div className="flex items-center gap-1.5 text-xs leading-4 text-foreground/45">
                          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                          {userPlan.cancelAtPeriodEnd ? "Cancels" : "Renews"} {formatDate(userPlan.renewalDate)}
                        </div>
                      )}
                      {userPlan?.cancelAtPeriodEnd && (
                        <div className="mt-1 flex items-start gap-1.5">
                          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-red-400" />
                          <p className="text-xs leading-4 text-red-500">
                            Your plan will not renew. Access continues until the end of the period.
                          </p>
                        </div>
                      )}
                    </div>

                    {isOwner && (
                      <div className="border-t border-foreground/[0.06] pt-2.5">
                        <Link
                          href="/billing"
                          className="group inline-flex items-center gap-1.5 text-xs font-medium leading-4 text-accent transition-colors hover:text-accent/75"
                        >
                          Manage plan
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-lg border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] shadow-none">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", roleCfg.iconBg)}>
                      <RoleIcon className={cn("h-5 w-5", roleCfg.iconColor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold leading-5 text-foreground">
                          {isInfluencer ? "Solo Creator" : roleCfg.label}
                        </p>
                        {!isInfluencer && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-[3px] text-xs font-medium leading-4",
                              roleCfg.pillBg,
                              roleCfg.pillText,
                              roleCfg.pillBorder
                            )}
                          >
                            {roleCfg.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs leading-4 text-foreground/40">
                        {isInfluencer ? "Personal workspace" : activeWorkspace?.name ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 text-xs font-medium leading-4 text-foreground/45">
                      Permissions
                    </p>

                    {isInfluencer ? (
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {INFLUENCER_PERMISSIONS.map((label) => (
                          <div key={label} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span className="text-xs leading-4 text-foreground/65">{label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {AGENCY_PERMISSIONS.map(({ label, roles }) => {
                          const granted = (roles as string[]).includes(role);
                          return (
                            <div key={label} className="flex items-center gap-2">
                              {granted ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 shrink-0 text-foreground/15" />
                              )}
                              <span className={cn("text-xs leading-4", granted ? "text-foreground/65" : "text-foreground/25")}>
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
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
          <div className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/70 px-4 py-3 dark:bg-[hsl(var(--surface-sunken))] sm:px-5">
            <h2 className="text-sm font-semibold leading-5 text-[hsl(var(--foreground))]">
              Data &amp; Privacy
            </h2>
            <p className="mt-1 text-xs leading-4 text-[hsl(var(--foreground-muted))]">
              Your rights under GDPR and applicable US privacy laws.
            </p>
          </div>
          <div className="grid gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))]/40 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm leading-5 text-muted-foreground">
                    Your data is handled under <strong className="text-foreground">GDPR</strong> for EEA and UK residents and applicable US privacy laws including CCPA. We apply data minimisation principles and do not sell personal data.
                  </p>
                  <p className="text-sm leading-5 text-muted-foreground">
                    You can request access, correction, or deletion of personal data by contacting{" "}
                    <a href="mailto:privacy@socialraven.io" className="font-medium text-foreground underline hover:no-underline">
                      privacy@socialraven.io
                    </a>
                    . Requests are handled within 30 days.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface))] px-4 py-3 lg:flex-col lg:items-start lg:gap-3">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium leading-5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium leading-5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                Terms of Service
              </a>
              <a
                href="mailto:privacy@socialraven.io?subject=Data%20Deletion%20Request"
                className="flex items-center gap-1 text-sm font-medium leading-5 text-red-600 transition-colors hover:text-red-700"
              >
                Request Data Deletion (GDPR Art. 17)
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
