"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, SignIn } from "@clerk/nextjs";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

import {
  PublicPrimaryButton,
  PublicSectionMessage,
  PublicSubtleButton,
} from "@/components/public/public-atlassian";
import { acceptInvitationApi } from "@/service/invitation";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; workspaceId: string }
  | { status: "error"; message: string }
  | { status: "needs-auth" };

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface-sunken))_100%)]">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--foreground-muted))]" />
        </div>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}

function InvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const token = searchParams.get("token");
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!isLoaded) return;
    if (!token) {
      setState({ status: "error", message: "No invitation token found in the URL." });
      return;
    }
    if (!isSignedIn) {
      localStorage.setItem("pendingInviteToken", token);
      setState({ status: "needs-auth" });
      return;
    }
    localStorage.removeItem("pendingInviteToken");
    void accept();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, token]);

  async function accept() {
    if (!token) return;
    setState({ status: "loading" });
    try {
      const { workspaceId } = await acceptInvitationApi(getToken, { token });
      setState({ status: "success", workspaceId });
    } catch (e: any) {
      const raw: string = e.message ?? "";
      let message = "Failed to accept invitation.";
      if (raw.includes("expired")) message = "This invitation has expired.";
      else if (raw.includes("already been accepted")) message = "This invitation has already been accepted.";
      else if (raw.includes("different email")) message = "This invitation was sent to a different email address.";
      else if (raw.includes("not found")) message = "Invitation not found or already used.";
      setState({ status: "error", message });
    }
  }

  function enterWorkspace(workspaceId: string) {
    localStorage.setItem("activeWorkspaceId", workspaceId);
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface-sunken))_100%)] p-4">
      <div className="w-full max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[var(--shadow-sm)]">
        <Image
          src="/SocialRavenLogo.svg"
          alt="SocialRaven"
          width={40}
          height={40}
          className="mx-auto mb-6 h-10 w-10"
        />

        {state.status === "needs-auth" && (
          <div>
            <h2 className="mb-2 text-base leading-5 font-bold text-[hsl(var(--foreground))]">Sign in to accept</h2>
            <p className="mb-6 text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              Sign in or create an account to accept this workspace invitation.
            </p>
            <SignIn
              forceRedirectUrl={`/invite?token=${token}`}
              signUpForceRedirectUrl={`/invite?token=${token}`}
              routing="hash"
            />
          </div>
        )}

        {(state.status === "idle" || state.status === "loading") && (
          <div className="flex flex-col items-center gap-3 text-[hsl(var(--foreground-muted))]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm leading-5">Accepting invitation…</p>
          </div>
        )}

        {state.status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-[hsl(var(--success))]" />
            <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">You&apos;re in!</h2>
            <p className="text-sm leading-5 text-[hsl(var(--foreground-muted))]">
              You&apos;ve successfully joined the workspace.
            </p>
            <PublicPrimaryButton onClick={() => enterWorkspace(state.workspaceId)}>
              Go to dashboard
            </PublicPrimaryButton>
          </div>
        )}

        {state.status === "error" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-[hsl(var(--destructive))]" />
            </div>
            <h2 className="text-base leading-5 font-bold text-[hsl(var(--foreground))]">Invitation error</h2>
            <PublicSectionMessage appearance="error" title={state.message}>
              <p>This invitation could not be accepted.</p>
            </PublicSectionMessage>
            <PublicSubtleButton onClick={() => router.replace("/dashboard")}>
              Go to dashboard
            </PublicSubtleButton>
          </div>
        )}
      </div>
    </div>
  );
}
