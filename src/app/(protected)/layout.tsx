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
 *  - 0 workspaces  → /onboarding
 *  - 1 workspace   → auto-select + enter app
 *  - 2+ workspaces → /workspace-select (unless one is already active in localStorage)
 */
function WorkspaceGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { workspaces, activeWorkspace, isLoading, isDeactivated } = useWorkspace();
  const [gateOpen, setGateOpen] = useState(false);
  const checked = useRef(false);

  // These pages are under this layout but must bypass the workspace gate
  const isWorkspaceSelectPage = pathname === "/workspace-select";
  const isNoWorkspacePage = pathname === "/no-workspace";

  useEffect(() => {
    if (isWorkspaceSelectPage || isNoWorkspacePage) {
      setGateOpen(true);
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
  }, [isLoading, workspaces, activeWorkspace, router, isWorkspaceSelectPage]);

  if (!gateOpen) {
    // Minimal blank state while checking — avoids flash of protected content
    return null;
  }

  return <>{children}</>;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // These pages get a full-screen layout without sidebar/nav
  if (pathname === "/workspace-select" || pathname === "/no-workspace") {
    return (
      <WorkspaceGate>
        <main>{children}</main>
      </WorkspaceGate>
    );
  }

  return (
    <WorkspaceGate>
      {isMobile ? (
        <div className="pb-16 page-bg min-h-screen">
          <main>{children}</main>
          <MobileBottomBar />
        </div>
      ) : (
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto page-bg">{children}</main>
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
