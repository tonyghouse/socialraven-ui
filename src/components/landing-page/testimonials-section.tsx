import { Quote } from "@vibe/icons";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import {
  LANDING_PAGE_CONTAINER_CLASS,
  LANDING_PAGE_FADE_VARIANT,
  LANDING_PAGE_STAGGER_VARIANT,
  LANDING_PAGE_VIEWPORT,
  TESTIMONIALS,
} from "@/components/landing-page/landing-page-constants";

const REVIEW_AVATAR_CLASSES = [
  "bg-[var(--primary-selected-color)] text-[var(--primary-color)]",
  "bg-[color-mix(in_srgb,var(--color-aquamarine)_20%,var(--primary-background-color))] text-[var(--color-teal)]",
  "bg-[var(--positive-color-selected)] text-[var(--positive-color)]",
  "bg-[color-mix(in_srgb,var(--color-working_orange)_20%,var(--primary-background-color))] text-[var(--color-dark-orange)]",
  "bg-[color-mix(in_srgb,var(--color-bazooka)_18%,var(--primary-background-color))] text-[var(--color-dark-red)]",
] as const;

function Rating({ size = "small" }: { size?: "small" | "medium" }) {
  const iconClassName =
    size === "medium"
      ? "h-4 w-4 fill-[var(--warning-color)] text-[var(--warning-color)]"
      : "h-3.5 w-3.5 fill-[var(--warning-color)] text-[var(--warning-color)]";

  return (
    <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={iconClassName} aria-hidden="true" />
      ))}
    </div>
  );
}

export function LandingPageTestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-16 border-b border-[var(--layout-border-color)] bg-[var(--allgrey-background-color)] py-20 sm:py-24"
    >
      <div className={LANDING_PAGE_CONTAINER_CLASS}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={LANDING_PAGE_VIEWPORT}
          variants={LANDING_PAGE_STAGGER_VARIANT}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div>
              <motion.div variants={LANDING_PAGE_FADE_VARIANT}>
                <span className="inline-flex items-center gap-2 rounded-[0.75rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-3 py-1.5 text-[0.6875rem] font-semibold text-[var(--secondary-text-color)]">
                  <Quote className="h-3.5 w-3.5 text-[var(--primary-color)]" />
                  Customer reviews
                </span>
              </motion.div>
              <motion.h2
                variants={LANDING_PAGE_FADE_VARIANT}
                className="mt-5 max-w-2xl font-[var(--font-vibe-title)] text-[2rem] font-bold leading-[1.15] tracking-normal text-[var(--primary-text-color)] sm:text-[2.5rem]"
              >
                What social teams say.
              </motion.h2>
            </div>

            <motion.div
              variants={LANDING_PAGE_FADE_VARIANT}
              className="flex items-center gap-3 lg:justify-end"
            >
              <Rating size="medium" />
              <span className="text-[0.8125rem] font-medium text-[var(--secondary-text-color)]">
                Feedback from early users
              </span>
            </motion.div>
          </div>

          <motion.div
            variants={LANDING_PAGE_FADE_VARIANT}
            className="mt-9 grid grid-cols-1 gap-px border-y border-[var(--layout-border-color)] bg-[var(--layout-border-color)] md:grid-cols-2 lg:grid-cols-6"
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.figure
                key={testimonial.name}
                variants={LANDING_PAGE_FADE_VARIANT}
                className={`flex flex-col bg-[var(--allgrey-background-color)] px-1 py-6 sm:p-6 ${
                  index < 3
                    ? "md:col-span-1 lg:col-span-2"
                    : index === 3
                      ? "md:col-span-1 lg:col-span-3"
                      : "md:col-span-2 lg:col-span-3"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <Rating />
                  <Quote className="h-5 w-5 text-[var(--ui-border-color)]" />
                </div>

                <blockquote className="mt-5 flex-1 text-[0.9375rem] leading-6 text-[var(--primary-text-color)]">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold ${REVIEW_AVATAR_CLASSES[index]}`}
                  >
                    {testimonial.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.8125rem] font-semibold text-[var(--primary-text-color)]">
                      {testimonial.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.6875rem] text-[var(--secondary-text-color)]">
                      {testimonial.role} · {testimonial.company}
                    </span>
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
