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
  const { workspaces, activeWorkspace, isLoading } = useWorkspace();
  const [gateOpen, setGateOpen] = useState(false);
  const checked = useRef(false);

  // The workspace-select page is itself under this layout — let it render freely
  // so the user can pick a workspace without triggering a redirect loop.
  const isWorkspaceSelectPage = pathname === "/workspace-select";

  useEffect(() => {
    if (isWorkspaceSelectPage) {
      setGateOpen(true);
      return;
    }

    if (isLoading) return;
    if (checked.current) return;
    checked.current = true;

    if (workspaces.length === 0) {
      router.replace("/onboarding");
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

  // Workspace-select page gets a full-screen layout without sidebar/nav
  if (pathname === "/workspace-select") {
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
