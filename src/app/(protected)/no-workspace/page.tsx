"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { UserX, Mail, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NoWorkspacePage() {
  const router = useRouter();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md text-center">
        <img
          src="/SocialRavenLogo.svg"
          alt="SocialRaven"
          className="h-10 w-10 mx-auto mb-6"
        />

        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          No active workspace
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
          You&apos;ve been removed from all workspaces. Ask your team admin to
          re-invite you, or start your own workspace.
        </p>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => router.push("/onboarding")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Start your own workspace
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Clear any stale workspace state so the invite flow works cleanly
              localStorage.removeItem("activeWorkspaceId");
              localStorage.removeItem("activeWorkspaceRole");
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Waiting for an invitation? Check your email
          </Button>

          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
