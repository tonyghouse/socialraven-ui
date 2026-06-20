"use client";

import { Accordion, AccordionItem, Text } from "@vibe/core";

import { PublicCard } from "@/components/public/public-layout";

const FAQ_ITEMS = [
  {
    q: "When does billing start?",
    a: "After your 14-day trial ends. No charge during the trial — no credit card required to start.",
  },
  {
    q: "Can I cancel?",
    a: "Yes. Cancel from Settings at any time. Your access continues until the end of the current billing period.",
  },
  {
    q: "Can I change my plan?",
    a: "Yes. Upgrade or downgrade from Settings. Changes apply from the next billing cycle.",
  },
  {
    q: "What is Agency Custom pricing?",
    a: "Starts at $300/month for 30 workspaces. Each additional workspace is $3/month. Contact sales for a quote.",
  },
];

export function PricingFaq() {
  return (
    <PublicCard className="overflow-hidden p-0">
      <div className="border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-6 py-5">
        <Text
          type="text3"
          weight="medium"
          element="p"
          className="uppercase tracking-[0.12em] text-[var(--secondary-text-color)]"
        >
          FAQ
        </Text>
      </div>

      <div className="px-5 py-2">
        <Accordion className="bg-transparent px-0 py-0">
          {FAQ_ITEMS.map(({ q, a }, index) => (
            <AccordionItem
              key={q}
              title={q}
              hideBorder={index === FAQ_ITEMS.length - 1}
              contentClassName="pb-4 pt-1 text-copy-14 text-[var(--secondary-text-color)]"
              headerClassName="text-label-14 text-[var(--primary-text-color)]"
            >
              {a}
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="border-t border-[var(--ui-border-color)] px-6 py-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a
            href="/refund-policy"
            className="text-label-14 text-[var(--secondary-text-color)] underline underline-offset-2 transition-colors hover:text-[var(--primary-text-color)]"
          >
            Refund policy
          </a>
          <a
            href="/terms-of-service"
            className="text-label-14 text-[var(--secondary-text-color)] underline underline-offset-2 transition-colors hover:text-[var(--primary-text-color)]"
          >
            Terms of service
          </a>
          <a
            href="mailto:team+sales@socialraven.io"
            className="text-label-14 text-[var(--secondary-text-color)] underline underline-offset-2 transition-colors hover:text-[var(--primary-text-color)]"
          >
            Talk to sales
          </a>
        </div>
      </div>
    </PublicCard>
  );
}
