"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getOnboardingStatusApi } from "@/service/onboarding";

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const status = await getOnboardingStatusApi(getToken);
        if (!cancelled && status.completed) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Fall through and let the page render; protected backend routes still enforce the real rules.
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, [getToken, router]);

  if (isChecking) return null;

  return <div className="min-h-screen page-bg">{children}</div>;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedIn>
        <OnboardingGate>{children}</OnboardingGate>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/sign-in" />
      </SignedOut>
    </>
  );
}
