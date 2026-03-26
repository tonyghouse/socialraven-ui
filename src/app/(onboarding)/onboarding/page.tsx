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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Logo / brand */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to SocialRaven</h1>
        <p className="mt-2 text-muted-foreground">Let&apos;s set up your account in seconds.</p>
      </div>

      {/* ── Step 1: Choose type ── */}
      {step === "choose-type" && (
        <div className="w-full max-w-2xl">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">
            Step 1 of 2 &mdash; Who are you?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Influencer card */}
            <button
              onClick={handleInfluencerSelect}
              disabled={loading}
              className={cn(
                "group relative flex flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all",
                "hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedType === "INFLUENCER" ? "border-primary bg-primary/5" : "border-border bg-card"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {loading && selectedType === "INFLUENCER" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-base font-semibold">Creator / Influencer</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  I manage my own social accounts and content schedule.
                </p>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Single personal workspace
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Up to 15 connected accounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> 500 posts / month
                </li>
              </ul>
              <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </button>

            {/* Agency card */}
            <button
              onClick={handleAgencySelect}
              disabled={loading}
              className={cn(
                "group relative flex flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all",
                "hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedType === "AGENCY" ? "border-primary bg-primary/5" : "border-border bg-card"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold">Agency / Business</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  I manage social accounts for multiple clients or brands.
                </p>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Multiple workspaces (one per brand)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Team members &amp; roles
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Client-level isolation
                </li>
              </ul>
              <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            You can switch from Creator to Agency at any time from your profile settings.
          </p>
        </div>
      )}

      {/* ── Step 2 (Agency only): Company details ── */}
      {step === "company-details" && (
        <div className="w-full max-w-md">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">
            Step 2 of {totalSteps} &mdash; Your Agency Details
          </p>

          <form
            onSubmit={handleCompanyDetailsSubmit}
            className="rounded-2xl border border-border bg-card p-8 space-y-6"
          >
            {/* Explainer callout */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                What is Agency / Company Name?
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is the name of <strong>your own agency or business</strong> — the company you run.
                For example: <em>&quot;Spark Media Agency&quot;</em> or <em>&quot;Acme Marketing Inc.&quot;</em>
                It is used for your account identity and owner-level settings.
              </p>
              <p className="text-xs text-muted-foreground/70">
                The brands or clients you manage will be set up as separate workspaces on the next screen.
              </p>
            </div>

            {/* Company name input */}
            <div className="space-y-2">
              <Label htmlFor="company-name">
                Agency / Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-name"
                placeholder="e.g. Spark Media Agency"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your agency or company name exactly as you want it to appear on your account.
              </p>
            </div>

            {/* Confirmation input */}
            <div className="space-y-2">
              <Label htmlFor="company-name-confirm">
                Confirm Agency / Company Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="company-name-confirm"
                  placeholder="Re-enter company name to confirm"
                  value={companyNameConfirm}
                  onChange={(e) => setCompanyNameConfirm(e.target.value)}
                  required
                  className={cn(
                    companyNamesMatch && "border-green-500 focus-visible:ring-green-500/30",
                    companyNameMismatch && "border-destructive focus-visible:ring-destructive/30"
                  )}
                />
                {companyNamesMatch && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                )}
                {companyNameMismatch && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
                )}
              </div>
              {companyNameMismatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Names don&apos;t match. Please re-enter your company name exactly.
                </p>
              )}
              {companyNamesMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Company name confirmed.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep("choose-type"); setSelectedType(null); setCompanyName(""); setCompanyNameConfirm(""); }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!companyNamesMatch}
                className="flex-1"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 3 (Agency only): Name workspaces ── */}
      {step === "agency-workspaces" && (
        <div className="w-full max-w-md">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">
            Step 3 of {totalSteps} &mdash; Add Your Brands / Clients
          </p>

          <form
            onSubmit={handleAgencySubmit}
            className="rounded-2xl border border-border bg-card p-8 space-y-5"
          >
            {/* Company summary */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Your agency</p>
                <p className="font-semibold truncate">{companyName}</p>
              </div>
            </div>

            {/* Workspace explainer */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Workspace names</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each workspace represents a <strong>brand or client</strong> you manage.
                Give each one a clear name — your team will use these names to switch between clients.
                You can add, rename, or remove workspaces at any time from settings.
              </p>
            </div>

            {/* Workspace name list */}
            <div className="space-y-3">
              {workspaceNames.map((name, index) => (
                <div key={index} className="space-y-1">
                  {index === 0 && (
                    <Label htmlFor="workspace-0">
                      First workspace (brand / client) <span className="text-destructive">*</span>
                    </Label>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id={index === 0 ? "workspace-0" : undefined}
                      placeholder={index === 0 ? "e.g. Nike Campaign" : `Workspace ${index + 1} (brand / client)`}
                      value={name}
                      onChange={(e) => updateWorkspaceName(index, e.target.value)}
                      disabled={loading}
                      autoFocus={index === 0}
                    />
                    {workspaceNames.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkspace(index)}
                        disabled={loading}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
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
                  className="w-full border-dashed text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Workspace (brand / client)
                </Button>
              )}

              {workspaceNames.length >= MAX_ONBOARDING_WORKSPACES && (
                <p className="text-xs text-muted-foreground text-center">
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
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !workspaceNames[0]?.trim()}
                className="flex-1"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
                ) : (
                  <>Finish Setup <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
