"use client";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

import { MobileBottomBar } from "@/components/sidebar/MobileBottomBar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

function ProtectedAppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[var(--ds-background-100)] pb-[calc(4rem+env(safe-area-inset-bottom))] text-[var(--ds-gray-1000)]">
        <main className="min-h-screen bg-[var(--ds-background-200)]">
          {children}
        </main>
        <MobileBottomBar />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-[var(--ds-background-200)]">
        {children}
      </main>
    </div>
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
        <ProtectedAppShell>{children}</ProtectedAppShell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/sign-in" />
      </SignedOut>
    </>
  );
}
