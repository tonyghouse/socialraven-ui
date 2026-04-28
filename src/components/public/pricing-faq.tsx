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
    <div>
      <p className="mb-4 text-label-12 text-[var(--ds-gray-900)]">FAQ</p>
      <div className="divide-y divide-[var(--ds-gray-400)]">
        {FAQ_ITEMS.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-label-14 text-[var(--ds-gray-1000)]">
              {q}
              <span className="shrink-0 text-[var(--ds-gray-900)] transition-transform duration-150 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-copy-14 text-[var(--ds-gray-900)]">{a}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-1">
        <a
          href="/refund-policy"
          className="text-label-14 text-[var(--ds-gray-900)] underline underline-offset-2 transition-colors hover:text-[var(--ds-gray-1000)]"
        >
          Refund policy
        </a>
        <a
          href="/terms-of-service"
          className="text-label-14 text-[var(--ds-gray-900)] underline underline-offset-2 transition-colors hover:text-[var(--ds-gray-1000)]"
        >
          Terms of service
        </a>
        <a
          href="mailto:team+sales@socialraven.io"
          className="text-label-14 text-[var(--ds-gray-900)] underline underline-offset-2 transition-colors hover:text-[var(--ds-gray-1000)]"
        >
          Talk to sales
        </a>
      </div>
    </div>
  );
}
