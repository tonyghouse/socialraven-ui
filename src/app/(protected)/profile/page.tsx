"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ElementType } from "react";
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
  ACTIVE: {
    label: "Active",
    dot: "bg-[var(--ds-green-500)]",
    bg: "bg-[var(--ds-green-100)]",
    text: "text-[var(--ds-green-700)]",
    border: "border-[var(--ds-green-200)]",
  },
  TRIALING: {
    label: "Trial",
    dot: "bg-[var(--ds-amber-500)]",
    bg: "bg-[var(--ds-amber-100)]",
    text: "text-[var(--ds-amber-700)]",
    border: "border-[var(--ds-amber-200)]",
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-[var(--ds-red-500)]",
    bg: "bg-[var(--ds-red-100)]",
    text: "text-[var(--ds-red-700)]",
    border: "border-[var(--ds-red-200)]",
  },
  PAST_DUE: {
    label: "Past due",
    dot: "bg-[var(--ds-amber-500)]",
    bg: "bg-[var(--ds-amber-100)]",
    text: "text-[var(--ds-amber-700)]",
    border: "border-[var(--ds-amber-200)]",
  },
};

const ROLE_CONFIG: Record<
  WorkspaceRole,
  {
    label: string;
    description: string;
    icon: ElementType;
    iconBg: string;
    iconColor: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
  }
> = {
  OWNER: {
    label: "Owner",
    description: "Full control of the workspace",
    icon: Crown,
    iconBg: "bg-[var(--ds-plum-100)]",
    iconColor: "text-[var(--ds-plum-700)]",
    pillBg: "bg-[var(--ds-plum-100)]",
    pillText: "text-[var(--ds-plum-700)]",
    pillBorder: "border-[var(--ds-plum-200)]",
  },
  ADMIN: {
    label: "Admin",
    description: "Manage team & workspace settings",
    icon: ShieldCheck,
    iconBg: "bg-[var(--ds-plum-100)]",
    iconColor: "text-[var(--ds-plum-700)]",
    pillBg: "bg-[var(--ds-plum-100)]",
    pillText: "text-[var(--ds-plum-700)]",
    pillBorder: "border-[var(--ds-plum-200)]",
  },
  EDITOR: {
    label: "Editor",
    description: "Create and manage content",
    icon: Users,
    iconBg: "bg-[var(--ds-green-100)]",
    iconColor: "text-[var(--ds-green-700)]",
    pillBg: "bg-[var(--ds-green-100)]",
    pillText: "text-[var(--ds-green-700)]",
    pillBorder: "border-[var(--ds-green-200)]",
  },
  READ_ONLY: {
    label: "Read Only",
    description: "Read-only access to workspace content",
    icon: Eye,
    iconBg: "bg-[var(--ds-gray-100)]",
    iconColor: "text-[var(--ds-gray-900)]",
    pillBg: "bg-[var(--ds-gray-100)]",
    pillText: "text-[var(--ds-gray-900)]",
    pillBorder: "border-[var(--ds-gray-400)]",
  },
};

const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const sectionClassName =
  "overflow-hidden rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm";
const sectionHeaderClassName =
  "border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3 sm:px-5";
const cardClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-none";
const mutedCardClassName =
  "rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]";
const inputClassName =
  "h-10 rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none placeholder:text-[var(--ds-gray-900)] focus-visible:border-[hsl(var(--accent))] focus-visible:ring-[hsl(var(--accent))]/20";
const primaryButtonClassName =
  "h-9 rounded-md border-0 bg-[hsl(var(--accent))] !text-white shadow-none hover:bg-[hsl(var(--accent-hover))]";
const secondaryButtonClassName =
  "h-9 rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-none hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]";
const linkButtonClassName =
  "group inline-flex items-center gap-1.5 text-copy-12 text-[var(--ds-plum-700)] transition-colors hover:text-[var(--ds-plum-800)]";

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
    <Card className={cardClassName}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg bg-[var(--ds-gray-300)]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md bg-[var(--ds-gray-300)]" />
            <Skeleton className="h-3 w-16 rounded-full bg-[var(--ds-gray-300)]" />
          </div>
        </div>
        <Skeleton className="h-3 w-40 rounded-md bg-[var(--ds-gray-300)]" />
        <Skeleton className="h-3 w-24 rounded-md bg-[var(--ds-gray-300)]" />
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { role, isOwner } = useRole();
  const { plan, isInfluencer, syncFromUserPlan } = usePlan();
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
        syncFromUserPlan(planResponse);
      })
      .catch(() => toast.error("Failed to load profile details"))
      .finally(() => {
        setProfileLoading(false);
        setPlanLoading(false);
      });
  }, [getToken, syncFromUserPlan]);

  const statusCfg = userPlan ? STATUS_CONFIG[userPlan.status] : null;
  const roleCfg = ROLE_CONFIG[role];
  const RoleIcon = roleCfg.icon;
  const avatarUrl = user?.hasImage ? user.imageUrl : profile?.imageUrl ?? null;

  const isInfluencerPlan = plan?.startsWith("INFLUENCER");
  const PlanIcon = isInfluencerPlan ? Sparkles : Building2;
  const planIconBg = "bg-[var(--ds-plum-100)]";
  const planIconClr = "text-[var(--ds-plum-700)]";

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
    <main className="min-h-screen w-full bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)]">
      <ProtectedPageHeader
        title="Profile"
        description="Manage your account details, workspace access, and privacy preferences."
        icon={<Shield className="h-4 w-4" />}
      />

      <div className="flex w-full flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">

        <section className={sectionClassName}>
          <div className={sectionHeaderClassName}>
            <h2 className="text-label-14 text-[var(--ds-gray-1000)]">
              Account
            </h2>
            <p className="mt-1 text-copy-12 leading-5 text-[var(--ds-gray-900)]">
              Manage your profile details, email addresses, and avatar.
            </p>
          </div>

          {profileLoading ? (
            <div className="grid gap-3 px-3 py-3 sm:px-4 xl:grid-cols-[15rem_minmax(0,1fr)]">
              <Skeleton className="h-52 rounded-xl bg-[var(--ds-gray-300)]" />
              <div className="space-y-4">
                <Skeleton className="h-32 rounded-xl bg-[var(--ds-gray-300)]" />
                <Skeleton className="h-44 rounded-xl bg-[var(--ds-gray-300)]" />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 px-3 py-3 sm:px-4 xl:grid-cols-[15rem_minmax(0,1fr)]">
              <Card className={cardClassName}>
                <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Profile avatar"
                      className="h-20 w-20 rounded-xl border border-[var(--ds-gray-400)] object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-lg font-semibold text-[var(--ds-gray-900)]">
                      {getInitials(profile)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-label-14 text-[var(--ds-gray-1000)]">
                      {[profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Your profile"}
                    </p>
                    <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                      {profile?.emailAddresses.find((email) => email.primary)?.emailAddress ?? "No primary email"}
                    </p>
                  </div>

                  <div className="grid w-full gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full gap-1.5", secondaryButtonClassName)}
                      disabled={updatingImage}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {updatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      Change photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full gap-1.5", secondaryButtonClassName)}
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
                <Card className={cardClassName}>
                  <CardContent className="grid gap-3 p-4">
                    <div className="space-y-1">
                      <p className="text-label-14 text-[var(--ds-gray-1000)]">Profile details</p>
                      <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                        Keep your name up to date across the app.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-label-14 text-[var(--ds-gray-1000)]">First name</label>
                        <Input className={inputClassName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-label-14 text-[var(--ds-gray-1000)]">Last name</label>
                        <Input className={inputClassName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" className={primaryButtonClassName} disabled={savingName} onClick={handleNameSave}>
                        {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className={cardClassName}>
                  <CardContent className="grid gap-3 p-4">
                    <div className="space-y-1">
                      <p className="text-label-14 text-[var(--ds-gray-1000)]">Email addresses</p>
                      <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                        Add new email addresses and choose which verified email is primary.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {profile?.emailAddresses.map((email) => (
                        <div
                          key={email.id}
                          className="flex flex-col gap-2 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-2.5 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Mail className="h-4 w-4 text-[var(--ds-gray-900)]" />
                              <span className="truncate text-label-14 text-[var(--ds-gray-1000)]">
                                {email.emailAddress}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-1 text-copy-12",
                                  email.primary
                                    ? "border-[var(--ds-plum-200)] bg-[var(--ds-plum-100)] text-[var(--ds-plum-700)]"
                                    : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)]"
                                )}
                              >
                                {email.primary ? "Primary" : "Secondary"}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-1 text-copy-12",
                                  email.verified
                                    ? "border-[var(--ds-green-200)] bg-[var(--ds-green-100)] text-[var(--ds-green-700)]"
                                    : "border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
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
                                className={cn("h-8", secondaryButtonClassName, "px-3 text-copy-12")}
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
                                className={cn("h-8", secondaryButtonClassName, "px-3 text-copy-12")}
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

                    <div className="grid gap-3 rounded-xl border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] p-3.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <div className="space-y-2">
                        <label className="text-label-14 text-[var(--ds-gray-1000)]">Add email address</label>
                        <Input
                          className={inputClassName}
                          type="email"
                          value={newEmail}
                          placeholder="name@company.com"
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <p className="text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                          Added email addresses remain pending until verified.
                        </p>
                      </div>
                      <Button type="button" className={primaryButtonClassName} disabled={addingEmail} onClick={handleAddEmail}>
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

        <section className={sectionClassName}>
          <div className={sectionHeaderClassName}>
            <h2 className="text-label-14 text-[var(--ds-gray-1000)]">
              Membership &amp; Role
            </h2>
            <p className="mt-1 text-copy-12 leading-5 text-[var(--ds-gray-900)]">
              Your current plan and workspace access level.
            </p>
          </div>
          <div className="px-3 py-3 sm:px-4">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {planLoading ? (
                <PlanCardSkeleton />
              ) : (
                <Card className={cn("flex flex-col", cardClassName)}>
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", planIconBg)}>
                        <PlanIcon className={cn("h-5 w-5", planIconClr)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-label-14 text-[var(--ds-gray-1000)]">
                          {plan ? PLAN_NAMES[plan] : "—"}
                        </p>
                        {statusCfg && (
                          <span
                            className={cn(
                              "mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-copy-12",
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
                        <div className="flex items-center gap-1.5 text-copy-12 leading-5 text-[var(--ds-amber-700)]">
                          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                          Trial ends {formatDate(userPlan.trialEndsAt)}
                        </div>
                      )}
                      {userPlan?.renewalDate && userPlan.status !== "TRIALING" && (
                        <div className="flex items-center gap-1.5 text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                          {userPlan.cancelAtPeriodEnd ? "Cancels" : "Renews"} {formatDate(userPlan.renewalDate)}
                        </div>
                      )}
                      {userPlan?.cancelAtPeriodEnd && (
                        <div className="mt-1 flex items-start gap-1.5">
                          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-[var(--ds-red-700)]" />
                          <p className="text-copy-12 leading-5 text-[var(--ds-red-700)]">
                            Your plan will not renew. Access continues until the end of the period.
                          </p>
                        </div>
                      )}
                    </div>

                    {isOwner ? (
                      <div className="border-t border-[var(--ds-gray-400)] pt-2.5">
                        <Link
                          href="/billing"
                          className={linkButtonClassName}
                        >
                          Manage plan
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )}

              <Card className={cardClassName}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", roleCfg.iconBg)}>
                      <RoleIcon className={cn("h-5 w-5", roleCfg.iconColor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-label-14 text-[var(--ds-gray-1000)]">
                          {isInfluencer ? "Solo Creator" : roleCfg.label}
                        </p>
                        {!isInfluencer && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-1 text-copy-12",
                              roleCfg.pillBg,
                              roleCfg.pillText,
                              roleCfg.pillBorder
                            )}
                          >
                            {roleCfg.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                        {isInfluencer ? "Personal workspace" : activeWorkspace?.name ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 text-copy-12 leading-5 text-[var(--ds-gray-900)]">
                      Permissions
                    </p>

                    {isInfluencer ? (
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {INFLUENCER_PERMISSIONS.map((label) => (
                          <div key={label} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--ds-green-700)]" />
                            <span className="text-copy-12 leading-5 text-[var(--ds-gray-1000)]">{label}</span>
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
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--ds-green-700)]" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 shrink-0 text-[var(--ds-gray-700)]" />
                              )}
                              <span
                                className={cn(
                                  "text-copy-12 leading-5",
                                  granted ? "text-[var(--ds-gray-1000)]" : "text-[var(--ds-gray-900)]"
                                )}
                              >
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

        <section className={sectionClassName}>
          <div className={sectionHeaderClassName}>
            <h2 className="text-label-14 text-[var(--ds-gray-1000)]">
              Data &amp; Privacy
            </h2>
            <p className="mt-1 text-copy-12 leading-5 text-[var(--ds-gray-900)]">
              Your rights under GDPR and applicable US privacy laws.
            </p>
          </div>
          <div className="grid gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className={cn(mutedCardClassName, "p-4")}>
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ds-gray-900)]" />
                <div className="space-y-2">
                  <p className="text-label-14 leading-6 text-[var(--ds-gray-900)]">
                    Your data is handled under <strong className="text-[var(--ds-gray-1000)]">GDPR</strong> for EEA and UK residents and applicable US privacy laws including CCPA. We apply data minimisation principles and do not sell personal data.
                  </p>
                  <p className="text-label-14 leading-6 text-[var(--ds-gray-900)]">
                    You can request access, correction, or deletion of personal data by contacting{" "}
                    <a
                      href="mailto:privacy@socialraven.io"
                      className="font-medium text-[var(--ds-plum-700)] underline hover:no-underline"
                    >
                      privacy@socialraven.io
                    </a>
                    . Requests are handled within 30 days.
                  </p>
                </div>
              </div>
            </div>
            <div className={cn(cardClassName, "flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 lg:flex-col lg:items-start lg:gap-3")}>
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className={cn("flex items-center gap-1 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]", focusRingClassName)}
              >
                <ExternalLink className="h-3 w-3" />
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className={cn("flex items-center gap-1 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]", focusRingClassName)}
              >
                <ExternalLink className="h-3 w-3" />
                Terms of Service
              </a>
              <a
                href="mailto:privacy@socialraven.io?subject=Data%20Deletion%20Request"
                className={cn("flex items-center gap-1 text-label-14 text-[var(--ds-red-700)] transition-colors hover:text-[var(--ds-red-800)]", focusRingClassName)}
              >
                Request Data Deletion (GDPR Art. 17)
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
