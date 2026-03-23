"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, SignIn } from "@clerk/nextjs";
import { acceptInvitationApi } from "@/service/invitation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
      setState({ status: "needs-auth" });
      return;
    }
    // Auto-accept once signed in
    accept();
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
    // Store as active workspace — WorkspaceGate in the protected layout will validate it
    localStorage.setItem("activeWorkspaceId", workspaceId);
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-sm text-center">
        <img
          src="/SocialRavenLogo.svg"
          alt="SocialRaven"
          className="h-10 w-10 mx-auto mb-6"
        />

        {/* Not signed in — show Clerk sign-in/sign-up, return URL preserves token */}
        {state.status === "needs-auth" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Sign in to accept</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in or create an account to accept this workspace invitation.
            </p>
            <SignIn
              afterSignInUrl={`/invite?token=${token}`}
              afterSignUpUrl={`/invite?token=${token}`}
              routing="hash"
            />
          </div>
        )}

        {(state.status === "idle" || state.status === "loading") && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Accepting invitation…</p>
          </div>
        )}

        {state.status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold">You&apos;re in!</h2>
            <p className="text-sm text-muted-foreground">
              You&apos;ve successfully joined the workspace.
            </p>
            <Button onClick={() => enterWorkspace(state.workspaceId)} className="w-full">
              Go to dashboard
            </Button>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Invitation error</h2>
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <Button variant="outline" onClick={() => router.replace("/dashboard")} className="w-full">
              Go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
