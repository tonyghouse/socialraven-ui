import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";

const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/#integrations" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of service", href: "/terms-of-service" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
];

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
      <div className="container mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <Image src="/SocialRavenLogo.svg" alt="SocialRaven logo" width={28} height={28} className="h-7 w-7" />
              <span className="text-heading-16 text-[var(--ds-gray-1000)]">
                SocialRaven
              </span>
            </div>
            <p className="mt-4 text-copy-14 text-[var(--ds-gray-900)]">
              Structured social media scheduling and publishing for creators, agencies, and operations-focused teams.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-3 py-1.5 text-label-12 text-[var(--ds-gray-900)]">
              <Lock className="h-3.5 w-3.5" />
              GDPR-conscious · US and EU ready
            </div>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-label-12 text-[var(--ds-gray-900)]">
                {group.title}
              </p>
              <ul className="mt-4 space-y-3">
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-[var(--ds-gray-400)]" />

        <div className="flex flex-col gap-2 text-label-12 text-[var(--ds-gray-900)] md:flex-row md:items-center md:justify-between">
          <p>© 2026 SocialRaven. All rights reserved.</p>
          <p>Built for calm execution across global publishing teams.</p>
        </div>
      </div>
    </footer>
  );
}
