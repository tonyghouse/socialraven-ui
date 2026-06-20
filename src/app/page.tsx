"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Navbar, { LANDING_NAVBAR_CONTENT_CLASS } from "@/components/navbar/navbar";
import {
  LANDING_PAGE_KEYFRAMES,
  LandingPageFaqSection,
  LandingPageFeaturesSection,
  LandingPageFinalCtaSection,
  LandingPageHeroSection,
  LandingPageHowItWorksSection,
  LandingPagePersonasSection,
  LandingPagePlatformHubSection,
  LandingPageStatsBarSection,
  LandingPageTestimonialsSection,
  LandingPageUnifiedInboxSection,
} from "@/components/landing-page";
import {
  LANDING_FOOTER_CONTENT_CLASS,
  PublicSiteFooter,
} from "@/components/public/public-site-footer";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <>
      <style jsx global>{LANDING_PAGE_KEYFRAMES}</style>
      <Navbar contentClassName={LANDING_NAVBAR_CONTENT_CLASS} size="landing" />

      <main className="overflow-x-hidden bg-[var(--allgrey-background-color)] text-[var(--primary-text-color)]">
        <LandingPageHeroSection />
        <LandingPageStatsBarSection />
        <LandingPageFeaturesSection />
        <LandingPageHowItWorksSection />
        <LandingPagePersonasSection />
        <LandingPagePlatformHubSection />
        <LandingPageUnifiedInboxSection />
        <LandingPageTestimonialsSection />
        <LandingPageFaqSection />
        <LandingPageFinalCtaSection />
      </main>

      <PublicSiteFooter contentClassName={LANDING_FOOTER_CONTENT_CLASS} />
    </>
  );
}
