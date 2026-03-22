"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Building2, Sparkles, ArrowRight, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UserType } from "@/model/Onboarding";
import { completeOnboardingApi } from "@/service/onboarding";

const MAX_ONBOARDING_WORKSPACES = 10;

type Step = "choose-type" | "agency-name";

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [step, setStep] = useState<Step>("choose-type");
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
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
    setStep("agency-name");
  }

  async function handleAgencySubmit(e: React.FormEvent) {
    e.preventDefault();
    const validNames = workspaceNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0) {
      toast.error("At least one workspace name is required.");
      return;
    }
    setLoading(true);
    try {
      const status = await completeOnboardingApi(getToken, {
        userType: "AGENCY",
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Logo / brand */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to SocialRaven</h1>
        <p className="mt-2 text-muted-foreground">Let&apos;s set up your account in seconds.</p>
      </div>

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
                  <span className="text-primary">✓</span> Multiple workspaces
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

      {step === "agency-name" && (
        <div className="w-full max-w-md">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">
            Step 2 of 2 &mdash; Name your workspaces
          </p>

          <form
            onSubmit={handleAgencySubmit}
            className="rounded-2xl border border-border bg-card p-8 space-y-5"
          >
            {/* Workspace name list */}
            <div className="space-y-3">
              {workspaceNames.map((name, index) => (
                <div key={index} className="space-y-1">
                  {index === 0 && (
                    <Label htmlFor="workspace-0">
                      Name your first workspace *
                    </Label>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id={index === 0 ? "workspace-0" : undefined}
                      placeholder={index === 0 ? "e.g. Acme Agency" : `Workspace ${index + 1}`}
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
                  {index === 0 && (
                    <p className="text-xs text-muted-foreground">
                      This is the name your team will see. You can change it later.
                    </p>
                  )}
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
                  Add another workspace
                </Button>
              )}

              {workspaceNames.length >= MAX_ONBOARDING_WORKSPACES && (
                <p className="text-xs text-muted-foreground text-center">
                  Maximum of {MAX_ONBOARDING_WORKSPACES} workspaces during setup. You can add more later from settings.
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              You can add more workspaces later from your settings.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep("choose-type"); setSelectedType(null); }}
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
                  <>Create Workspace{workspaceNames.filter(n => n.trim()).length > 1 ? "s" : ""} <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
