"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomBar } from "@/components/sidebar/MobileBottomBar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { WorkspaceProvider, useWorkspace } from "@/context/WorkspaceContext";

/**
 * Hard gate: wait for workspaces to load, then:
 *  - 0 workspaces  → /onboarding for first-time users, /no-workspace for removed users
 *  - 1 workspace   → auto-select + enter app
 *  - 2+ workspaces → /workspace-select (unless one is already active in localStorage)
 */
function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    workspaces,
    activeWorkspace,
    isLoading,
    isDeactivated,
    hasCompletedOnboarding,
    canCreateWorkspaces,
  } = useWorkspace();
  const [gateOpen, setGateOpen] = useState(false);
  const checked = useRef(false);

  // These pages are under this layout but must bypass the workspace gate
  const isWorkspaceSelectPage = pathname === "/workspace-select";
  const isNoWorkspacePage = pathname === "/no-workspace";

  useEffect(() => {
    if (isWorkspaceSelectPage) {
      if (isLoading) return;

      if (!canCreateWorkspaces) {
        if (workspaces.length === 0) {
          router.replace("/no-workspace");
        } else {
          router.replace("/dashboard");
        }
        return;
      }

      setGateOpen(true);
      return;
    }

    if (isNoWorkspacePage) {
      if (isLoading) return;

      if (isDeactivated) {
        setGateOpen(true);
        return;
      }

      if (workspaces.length === 0) {
        setGateOpen(true);
        return;
      }

      if (workspaces.length === 1) {
        router.replace("/dashboard");
      } else {
        router.replace(canCreateWorkspaces ? "/workspace-select" : "/dashboard");
      }
      return;
    }

    if (isLoading) return;
    if (checked.current) return;
    checked.current = true;

    if (isDeactivated) {
      router.replace("/no-workspace");
      return;
    }

    if (workspaces.length === 0) {
      // If the user arrived here via an invitation link, send them back to accept it
      const pendingToken =
        typeof window !== "undefined"
          ? localStorage.getItem("pendingInviteToken")
          : null;
      if (pendingToken) {
        router.replace(`/invite?token=${pendingToken}`);
      } else if (hasCompletedOnboarding) {
        router.replace("/no-workspace");
      } else {
        router.replace("/onboarding");
      }
      return;
    }

    if (workspaces.length === 1) {
      // Single workspace — auto-selected by WorkspaceProvider, enter app
      setGateOpen(true);
      return;
    }

    if (!canCreateWorkspaces) {
      setGateOpen(true);
      return;
    }

    // 2+ workspaces: check if a valid workspace is already active in localStorage
    const storedId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeWorkspaceId")
        : null;

    const isValid = storedId
      ? workspaces.some((w) => w.id === storedId)
      : false;

    if (isValid) {
      setGateOpen(true);
    } else {
      router.replace("/workspace-select");
    }
  }, [
    isLoading,
    workspaces,
    activeWorkspace,
    router,
    isWorkspaceSelectPage,
    isNoWorkspacePage,
    isDeactivated,
    hasCompletedOnboarding,
    canCreateWorkspaces,
  ]);

  if (!gateOpen) {
    // Keep the shell visually stable while access and workspace state resolve.
    return <div aria-hidden="true" className="min-h-screen bg-[var(--ds-background-100)]" />;
  }

  return <>{children}</>;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isFullscreenWorkspacePage =
    pathname === "/workspace-select" || pathname === "/no-workspace";

  // These pages get a full-screen layout without sidebar/nav
  if (isFullscreenWorkspacePage) {
    return (
      <WorkspaceGate>
        <main className="min-h-screen bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
          {children}
        </main>
      </WorkspaceGate>
    );
  }

  return (
    <WorkspaceGate>
      {isMobile ? (
        <div className="min-h-screen bg-[var(--ds-background-100)] pb-16 text-[var(--ds-gray-1000)]">
          <main className="min-h-screen bg-[var(--ds-background-200)]">
            {children}
          </main>
          <MobileBottomBar />
        </div>
      ) : (
        <div className="flex h-screen w-full bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
          <AppSidebar />
          <main className="flex-1 overflow-auto bg-[var(--ds-background-200)]">
            {children}
          </main>
        </div>
      )}
    </WorkspaceGate>
  );
}

export default function ProtectedRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedIn>
        <WorkspaceProvider>
          <LayoutContent>{children}</LayoutContent>
        </WorkspaceProvider>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/sign-in" />
      </SignedOut>
    </>
  );
}
