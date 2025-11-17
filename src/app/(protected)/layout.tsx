"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@radix-ui/react-separator";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProtectedRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  return (
    <>
      <SignedIn>
        <SidebarProvider
          style={{
            "--sidebar-width": "12.5rem",
            "--sidebar-width-mobile": "12.5rem",
          }}
        >
          <AppSidebar />
          {isMobile ? <SidebarTrigger className="text-primary"/> : <></>}
          <main>
            {children}
          </main>
        </SidebarProvider>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/sign-in" />
      </SignedOut>
    </>
  );
}
