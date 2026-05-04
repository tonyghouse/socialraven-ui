import Image from "next/image";
import { CalendarDays, Clock3 } from "lucide-react";

import {
  PublicCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicToc,
} from "@/components/public/public-layout";
import {
  PublicBackLink,
  PublicPrimaryLinkButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";

import { BlogPostCard } from "./blog-post-card";
import { formatBlogDate, getRelatedBlogPosts, type BlogPost } from "../posts";

export function BlogArticleLayout({ post }: { post: BlogPost }) {
  const relatedPosts = getRelatedBlogPosts(post.slug);
  const tableOfContents = post.sections.map((section) => ({
    id: section.id,
    label: section.title,
  }));

  return (
    <PublicPageShell>
      <PublicHero
        topSlot={
          <PublicBackLink href="/blog">Back to blog</PublicBackLink>
        }
        eyebrow="Blog"
        title={post.title}
        meta={
          <span className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span>By {post.authorName}</span>
          </span>
        }
        description={post.description}
        aside={
          <PublicCard className="overflow-hidden">
            <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt}
                width={1200}
                height={630}
                priority
                className="aspect-[1.91/1] w-full object-cover"
              />
            </div>
            <div className="space-y-4 p-5">
              <div>
                <p className="text-label-12 text-[var(--ds-gray-900)]">At a glance</p>
                <p className="mt-2 text-copy-14 text-[var(--ds-gray-900)]">
                  Short, practical guidance you can expand into a repeatable workflow.
                </p>
              </div>
            </div>
          </PublicCard>
        }
      />

      <PublicSection>
        <div className="items-start lg:grid lg:grid-cols-[13.75rem_1fr] lg:gap-14">
          <PublicToc items={tableOfContents} />

          <div className="min-w-0 space-y-10">
            <PublicCard className="space-y-8 p-8 md:p-10">
              <article className="blog-prose space-y-10">
                {post.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                    <h2>{section.title}</h2>
                    {section.content}
                  </section>
                ))}
              </article>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ds-gray-400)] pt-6">
                <p className="text-copy-14 text-[var(--ds-gray-900)]">
                  Want a calmer scheduling workflow? Start with the system, then expand the content.
                </p>
                <div className="flex flex-wrap gap-3">
                  <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
                  <PublicSubtleLinkButton href="/blog">More articles</PublicSubtleLinkButton>
                </div>
              </div>
            </PublicCard>
          </div>
        </div>
      </PublicSection>

      {relatedPosts.length > 0 ? (
        <PublicSection eyebrow="Keep reading" title="Related articles" surface="surface">
          <div className="grid gap-5 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <BlogPostCard key={relatedPost.slug} post={relatedPost} />
            ))}
          </div>
        </PublicSection>
      ) : null}
    </PublicPageShell>
  );
}
