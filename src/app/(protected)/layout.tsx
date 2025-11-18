"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { AppSidebar } from "@/components/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProtectedRootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <>
      <SignedIn>
        {isMobile ? (
          <div> 
            {/* Mobile navbar is fixed at top (your AppSidebar renders it) */}
            <AppSidebar />
            <main className="p-4">{children}</main>
          </div>
        ) : (
          <div className="flex h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/sign-in" />
      </SignedOut>
    </>
  );
}
