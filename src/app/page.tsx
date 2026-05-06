"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  LANDING_PAGE_KEYFRAMES,
  LandingPageFaqSection,
  LandingPageFeaturesSection,
  LandingPageFinalCtaSection,
  LandingPageHeroSection,
  LandingPageHowItWorksSection,
  LandingPagePersonasSection,
  LandingPagePlatformHubSection,
  LandingPagePricingSection,
  LandingPageStatsBarSection,
  LandingPageTestimonialsSection,
} from "@/components/landing-page";
import Navbar, { LANDING_NAVBAR_CONTENT_CLASS } from "@/components/navbar/navbar";
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
      <style>{LANDING_PAGE_KEYFRAMES}</style>
      <Navbar contentClassName={LANDING_NAVBAR_CONTENT_CLASS} size="landing" />

      <div className="overflow-x-hidden bg-[hsl(40_6%_96%)] text-[var(--ds-gray-1000)] dark:bg-[var(--ds-background-100)]">
        <LandingPageHeroSection />
        <LandingPageStatsBarSection />
        <LandingPageFeaturesSection />
        <LandingPagePlatformHubSection />
        <LandingPageHowItWorksSection />
        <LandingPagePersonasSection />
        <LandingPageTestimonialsSection />
        <LandingPagePricingSection />
        <LandingPageFaqSection />
        <LandingPageFinalCtaSection />
      </div>
      <PublicSiteFooter contentClassName={LANDING_FOOTER_CONTENT_CLASS} />
    </>
  );
}
