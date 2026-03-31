"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { UserX, Mail, ArchiveRestore } from "lucide-react";
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

        <h1 className="mb-2 text-lg font-semibold leading-6 text-[hsl(var(--foreground))]">
          No active workspace
        </h1>
        <p className="mb-8 max-w-xs mx-auto text-sm leading-5 text-muted-foreground">
          You&apos;ve been removed from all workspaces. Ask your team admin to
          re-invite you and check your email for an invitation.
        </p>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/workspace/settings")}
          >
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Manage deleted workspaces
          </Button>

          <Button
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
            className="mt-2 text-xs font-medium leading-4 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
