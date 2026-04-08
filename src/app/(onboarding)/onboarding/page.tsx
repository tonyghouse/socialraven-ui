"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Building2, Sparkles, ArrowRight, Loader2, Plus, X, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UserType } from "@/model/Onboarding";
import { completeOnboardingApi } from "@/service/onboarding";

const MAX_ONBOARDING_WORKSPACES = 10;
const primaryButtonClassName =
  "h-10 rounded-md bg-[var(--ds-blue-600)] px-4 text-label-14 text-white shadow-none transition-colors hover:bg-[var(--ds-blue-700)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const secondaryButtonClassName =
  "h-10 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 text-label-14 text-[var(--ds-gray-1000)] shadow-none transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";
const formCardClassName =
  "rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-8 shadow-none";
const inputClassName =
  "h-10 rounded-md border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 text-copy-14 text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-900)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

type Step = "choose-type" | "company-details" | "agency-workspaces";

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [step, setStep] = useState<Step>("choose-type");
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyNameConfirm, setCompanyNameConfirm] = useState("");
  const [workspaceNames, setWorkspaceNames] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  function updateWorkspaceName(index: number, value: string) {
    setWorkspaceNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function addWorkspace() {
    if (workspaceNames.length < MAX_ONBOARDING_WORKSPACES) {
      setWorkspaceNames((prev) => [...prev, ""]);
    }
  }

  function removeWorkspace(index: number) {
    setWorkspaceNames((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleInfluencerSelect() {
    setSelectedType("INFLUENCER");
    setLoading(true);
    try {
      const status = await completeOnboardingApi(getToken, { userType: "INFLUENCER" });
      if (status.workspaceId) {
        localStorage.setItem("onboardingCompleted", "true");
        localStorage.setItem("activeWorkspaceId", status.workspaceId);
      }
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSelectedType(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAgencySelect() {
    setSelectedType("AGENCY");
    setStep("company-details");
  }

  function handleCompanyDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = companyName.trim();
    const trimmedConfirm = companyNameConfirm.trim();
    if (!trimmed) {
      toast.error("Agency / company name is required.");
      return;
    }
    if (trimmed.toLowerCase() !== trimmedConfirm.toLowerCase()) {
      toast.error("Company names don't match. Please re-enter to confirm.");
      return;
    }
    setStep("agency-workspaces");
  }

  async function handleAgencySubmit(e: React.FormEvent) {
    e.preventDefault();
    const validNames = workspaceNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0) {
      toast.error("At least one workspace (brand) name is required.");
      return;
    }
    setLoading(true);
    try {
      const status = await completeOnboardingApi(getToken, {
        userType: "AGENCY",
        companyName: companyName.trim(),
        workspaceNames: validNames,
      });
      if (status.workspaceId) {
        localStorage.setItem("onboardingCompleted", "true");
        localStorage.setItem("activeWorkspaceId", status.workspaceId);
      }
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const companyNamesMatch =
    companyName.trim().length > 0 &&
    companyName.trim().toLowerCase() === companyNameConfirm.trim().toLowerCase();

  const companyNameMismatch =
    companyNameConfirm.trim().length > 0 &&
    companyName.trim().toLowerCase() !== companyNameConfirm.trim().toLowerCase();

  const totalSteps = selectedType === "AGENCY" ? 3 : 2;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--ds-background-100)] px-4 py-16 text-[var(--ds-gray-1000)]">
      {/* Logo / brand */}
      <div className="mb-10 text-center">
        <h1 className="text-heading-32 text-[var(--ds-gray-1000)]">Welcome to SocialRaven</h1>
        <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
          Let&apos;s set up your account in seconds.
        </p>
      </div>

      {/* ── Step 1: Choose type ── */}
      {step === "choose-type" && (
        <div className="w-full max-w-2xl">
          <p className="mb-6 text-center text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
            Step 1 of 2 &mdash; Who are you?
          </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Influencer card */}
              <button
                onClick={handleInfluencerSelect}
                disabled={loading}
                className={cn(
                  "group relative flex flex-col items-start gap-4 rounded-2xl border p-6 text-left shadow-none transition-[border-color,background-color,color]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] hover:border-[var(--ds-blue-600)] hover:bg-[var(--ds-gray-100)]",
                  selectedType === "INFLUENCER"
                    ? "border-[var(--ds-blue-600)] bg-[var(--ds-blue-100)]"
                    : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]">
                  {loading && selectedType === "INFLUENCER" ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Sparkles className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="text-heading-16 text-[var(--ds-gray-1000)]">Creator / Influencer</p>
                  <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                    I manage my own social accounts and content schedule.
                  </p>
                </div>
                <ul className="mt-2 space-y-1 text-copy-14 text-[var(--ds-gray-900)]">
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--ds-blue-600)]">✓</span> Single personal workspace
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--ds-blue-600)]">✓</span> Up to 15 connected accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--ds-blue-600)]">✓</span> 500 posts / month
                  </li>
                </ul>
                <ArrowRight className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ds-gray-900)]/40 transition-colors group-hover:text-[var(--ds-blue-600)]" />
              </button>

              {/* Agency card */}
              <button
                onClick={handleAgencySelect}
                disabled={loading}
                className={cn(
                  "group relative flex flex-col items-start gap-4 rounded-2xl border p-6 text-left shadow-none transition-[border-color,background-color,color]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)] hover:border-[var(--ds-blue-600)] hover:bg-[var(--ds-gray-100)]",
                  selectedType === "AGENCY"
                    ? "border-[var(--ds-blue-600)] bg-[var(--ds-blue-100)]"
                    : "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-heading-16 text-[var(--ds-gray-1000)]">Agency / Business</p>
                  <p className="mt-1 text-copy-14 text-[var(--ds-gray-900)]">
                    I manage social accounts for multiple clients or brands.
                  </p>
                </div>
                <ul className="mt-2 space-y-1 text-copy-14 text-[var(--ds-gray-900)]">
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--ds-blue-600)]">✓</span> Multiple workspaces (one per brand)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--ds-blue-600)]">✓</span> Team members &amp; roles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--ds-blue-600)]">✓</span> Client-level isolation
                  </li>
                </ul>
                <ArrowRight className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ds-gray-900)]/40 transition-colors group-hover:text-[var(--ds-blue-600)]" />
              </button>
            </div>

          <p className="mt-6 text-center text-copy-13 text-[var(--ds-gray-900)]">
            You can switch from Creator to Agency at any time from your profile settings.
          </p>
        </div>
      )}

      {/* ── Step 2 (Agency only): Company details ── */}
      {step === "company-details" && (
        <div className="w-full max-w-md">
          <p className="mb-6 text-center text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
            Step 2 of {totalSteps} &mdash; Your Agency Details
          </p>

            <form onSubmit={handleCompanyDetailsSubmit} className={cn(formCardClassName, "space-y-6")}>
              {/* Explainer callout */}
              <div className="space-y-2 rounded-xl border border-[var(--ds-blue-200)] bg-[var(--ds-blue-100)] p-4">
                <p className="flex items-center gap-2 text-label-14 text-[var(--ds-gray-1000)]">
                  <Building2 className="h-4 w-4 shrink-0 text-[var(--ds-blue-700)]" />
                  What is Agency / Company Name?
                </p>
                <p className="text-copy-14 leading-relaxed text-[var(--ds-gray-900)]">
                  This is the name of <strong>your own agency or business</strong> — the company you run.
                  For example: <em>&quot;Spark Media Agency&quot;</em> or{" "}
                  <em>&quot;Acme Marketing Inc.&quot;</em> It is used for your account identity and
                  owner-level settings.
                </p>
                <p className="text-copy-13 text-[var(--ds-gray-900)]">
                  The brands or clients you manage will be set up as separate workspaces on the next
                  screen.
                </p>
              </div>

              {/* Company name input */}
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-label-14 text-[var(--ds-gray-1000)]">
                  Agency / Company Name <span className="text-[var(--ds-red-600)]">*</span>
                </Label>
                <Input
                  id="company-name"
                  placeholder="e.g. Spark Media Agency"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoFocus
                  required
                  className={inputClassName}
                />
                <p className="text-copy-13 text-[var(--ds-gray-900)]">
                  Enter your agency or company name exactly as you want it to appear on your account.
                </p>
              </div>

              {/* Confirmation input */}
              <div className="space-y-2">
                <Label htmlFor="company-name-confirm" className="text-label-14 text-[var(--ds-gray-1000)]">
                  Confirm Agency / Company Name <span className="text-[var(--ds-red-600)]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="company-name-confirm"
                    placeholder="Re-enter company name to confirm"
                    value={companyNameConfirm}
                    onChange={(e) => setCompanyNameConfirm(e.target.value)}
                    required
                    className={cn(
                      inputClassName,
                      companyNamesMatch &&
                        "border-[var(--ds-green-600)] focus-visible:ring-[var(--ds-green-600)]",
                      companyNameMismatch &&
                        "border-[var(--ds-red-600)] focus-visible:ring-[var(--ds-red-600)]"
                    )}
                  />
                  {companyNamesMatch && (
                    <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ds-green-600)]" />
                  )}
                  {companyNameMismatch && (
                    <AlertCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ds-red-600)]" />
                  )}
                </div>
                {companyNameMismatch && (
                  <p className="flex items-center gap-1 text-copy-13 text-[var(--ds-red-600)]">
                    <AlertCircle className="h-3 w-3" />
                    Names don&apos;t match. Please re-enter your company name exactly.
                  </p>
                )}
                {companyNamesMatch && (
                  <p className="flex items-center gap-1 text-copy-13 text-[var(--ds-green-700)]">
                    <CheckCircle2 className="h-3 w-3" />
                    Company name confirmed.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("choose-type");
                    setSelectedType(null);
                    setCompanyName("");
                    setCompanyNameConfirm("");
                  }}
                  className={cn("flex-1", secondaryButtonClassName)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={!companyNamesMatch} className={cn("flex-1", primaryButtonClassName)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
          </form>
        </div>
      )}

      {/* ── Step 3 (Agency only): Name workspaces ── */}
      {step === "agency-workspaces" && (
        <div className="w-full max-w-md">
          <p className="mb-6 text-center text-label-12 uppercase tracking-[0.14em] text-[var(--ds-gray-900)]">
            Step 3 of {totalSteps} &mdash; Add Your Brands / Clients
          </p>

            <form onSubmit={handleAgencySubmit} className={cn(formCardClassName, "space-y-5")}>
              {/* Company summary */}
              <div className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-4 py-3">
                <Building2 className="h-4 w-4 shrink-0 text-[var(--ds-blue-700)]" />
                <div className="min-w-0">
                  <p className="text-label-12 text-[var(--ds-gray-900)]">Your agency</p>
                  <p className="truncate text-label-14 text-[var(--ds-gray-1000)]">{companyName}</p>
                </div>
              </div>

              {/* Workspace explainer */}
              <div className="space-y-1">
                <p className="text-label-14 text-[var(--ds-gray-1000)]">Workspace names</p>
                <p className="text-copy-13 leading-relaxed text-[var(--ds-gray-900)]">
                  Each workspace represents a <strong>brand or client</strong> you manage. Give each one
                  a clear name — your team will use these names to switch between clients. You can add,
                  rename, or remove workspaces at any time from settings.
                </p>
              </div>

              {/* Workspace name list */}
              <div className="space-y-3">
                {workspaceNames.map((name, index) => (
                  <div key={index} className="space-y-1">
                    {index === 0 && (
                      <Label htmlFor="workspace-0" className="text-label-14 text-[var(--ds-gray-1000)]">
                        First workspace (brand / client) <span className="text-[var(--ds-red-600)]">*</span>
                      </Label>
                    )}
                    <div className="flex gap-2">
                      <Input
                        id={index === 0 ? "workspace-0" : undefined}
                        placeholder={
                          index === 0 ? "e.g. Nike Campaign" : `Workspace ${index + 1} (brand / client)`
                        }
                        value={name}
                        onChange={(e) => updateWorkspaceName(index, e.target.value)}
                        disabled={loading}
                        autoFocus={index === 0}
                        className={inputClassName}
                      />
                      {workspaceNames.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWorkspace(index)}
                          disabled={loading}
                          className="h-10 w-10 shrink-0 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-900)] shadow-none transition-colors hover:bg-[var(--ds-red-100)] hover:text-[var(--ds-red-700)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add workspace button */}
                {workspaceNames.length < MAX_ONBOARDING_WORKSPACES && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addWorkspace}
                    disabled={loading}
                    className="h-10 w-full rounded-md border border-dashed border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-4 text-label-14 text-[var(--ds-gray-1000)] shadow-none transition-colors hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Workspace (brand / client)
                  </Button>
                )}

                {workspaceNames.length >= MAX_ONBOARDING_WORKSPACES && (
                  <p className="text-center text-copy-13 text-[var(--ds-gray-900)]">
                    Maximum of {MAX_ONBOARDING_WORKSPACES} workspaces during setup. You can add more later.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("company-details")}
                  disabled={loading}
                  className={cn("flex-1", secondaryButtonClassName)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !workspaceNames[0]?.trim()}
                  className={cn("flex-1", primaryButtonClassName)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      Finish Setup <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
          </form>
        </div>
      )}
    </div>
  );
}
