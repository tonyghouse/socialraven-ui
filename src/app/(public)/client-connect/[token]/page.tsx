import {
  PublicPrimaryLinkButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
import {
  PublicCard,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";

export default function ClientConnectPage() {
  return (
    <PublicPageShell mainClassName="bg-[var(--allgrey-background-color)]">
      <PublicSection surface="surface">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <PublicCard className="w-full p-8 text-center md:p-10">
            <div className="space-y-4">
              <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                Client connect
              </p>
              <h1 className="text-heading-32 text-[var(--primary-text-color)]">Coming soon.</h1>
              <p className="mx-auto max-w-xl text-copy-14 text-[var(--secondary-text-color)]">
                This shared access flow is being prepared for the next public release.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <PublicPrimaryLinkButton href="/">Back to homepage</PublicPrimaryLinkButton>
                <PublicSubtleLinkButton href="/contact">Contact support</PublicSubtleLinkButton>
              </div>
            </div>
          </PublicCard>
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}
