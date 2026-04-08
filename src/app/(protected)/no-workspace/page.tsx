"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { UserX, Mail, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const actionButtonClassName =
  "h-11 w-full rounded-md border text-label-14 shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-200)]";

const primaryButtonClassName = cn(
  actionButtonClassName,
  "border-transparent bg-[var(--ds-blue-600)] text-white hover:bg-[var(--ds-blue-700)]"
);

const secondaryButtonClassName = cn(
  actionButtonClassName,
  "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
);

export default function NoWorkspacePage() {
  const router = useRouter();
  const { signOut } = useClerk();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,var(--ds-background-100)_0%,var(--ds-background-200)_100%)] p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] shadow-sm">
            <Image
          src="/SocialRavenLogo.svg"
          alt="SocialRaven"
              width={28}
              height={28}
              className="h-7 w-7"
            />
          </div>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--ds-amber-200)] bg-[var(--ds-amber-100)]">
            <UserX className="h-8 w-8 text-[var(--ds-amber-700)]" />
          </div>
        </div>

        <h1 className="mb-2 text-title-20 text-[var(--ds-gray-1000)]">
          No active workspace
        </h1>
        <p className="mx-auto mb-8 max-w-xs text-label-14 leading-6 text-[var(--ds-gray-900)]">
          You&apos;ve been removed from all workspaces. Ask your team admin to
          re-invite you and check your email for an invitation.
        </p>

        <div className="space-y-3">
          <Button
            variant="outline"
            className={secondaryButtonClassName}
            onClick={() => router.push("/workspace/settings")}
          >
            <ArchiveRestore className="mr-2 h-4 w-4" />
            Manage deleted workspaces
          </Button>

          <Button
            className={primaryButtonClassName}
            onClick={() => {
              // Clear any stale workspace state so the invite flow works cleanly
              localStorage.removeItem("activeWorkspaceId");
              localStorage.removeItem("activeWorkspaceRole");
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            Waiting for an invitation? Check your email
          </Button>

          <button
            className={cn(
              "mt-2 rounded-sm text-copy-12 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-200)]"
            )}
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
