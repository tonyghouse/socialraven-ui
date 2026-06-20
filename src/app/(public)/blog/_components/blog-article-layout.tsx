import Image from "next/image";
import { Calendar, Doc, Person, Time } from "@vibe/icons";

import {
  PublicCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";
import {
  PublicBackLink,
  PublicPrimaryLinkButton,
  PublicSubtleLinkButton,
  PublicTag,
} from "@/components/public/public-site-primitives";

import { BlogPostCard } from "./blog-post-card";
import { getBlogAccentStyle } from "./blog-theme";
import { formatBlogDate, getRelatedBlogPosts, type BlogPost } from "../posts";

export function BlogArticleLayout({ post }: { post: BlogPost }) {
  const relatedPosts = getRelatedBlogPosts(post.slug);
  const postAccent = getBlogAccentStyle(post.slug);
  const tableOfContents = post.sections.map((section) => ({
    id: section.id,
    label: section.title,
  }));
  const articleDetails = [
    { label: "Published", value: formatBlogDate(post.publishedAt) },
    { label: "Read time", value: post.readTime },
    { label: "Author", value: post.authorName },
    { label: "Sections", value: String(post.sections.length) },
  ];

  return (
    <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_22%,var(--primary-background-color)_62%,var(--allgrey-background-color)_100%)]">
      <PublicHero
        topSlot={<PublicBackLink href="/blog">Back to blog</PublicBackLink>}
        title={post.title}
        meta={
          <span className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Time className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Person className="h-3.5 w-3.5" />
              {post.authorName}
            </span>
          </span>
        }
        description={post.description}
        aside={
          <PublicCard className="depth-soft overflow-hidden p-0" style={postAccent}>
            <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[var(--blog-accent)] opacity-65" />
                <span className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                  Editorial playbook
                </span>
              </div>
              <Doc className="h-4 w-4 text-[var(--blog-accent)] opacity-60" />
            </div>
            <div className="bg-[var(--blog-accent-soft)] p-3">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt}
                width={1200}
                height={630}
                priority
                className="aspect-[1.91/1] w-full rounded-[1rem] border border-[var(--ui-border-color)] object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--ui-border-color)] px-5 py-3.5" aria-hidden="true">
              {post.sections.map((section, index) => (
                <span
                  key={section.id}
                  className="h-1 rounded-full bg-[var(--blog-accent-muted)]"
                  style={getBlogAccentStyle(index)}
                >
                  <span className="block h-full w-2/3 rounded-full bg-[var(--blog-accent)] opacity-45" />
                </span>
              ))}
            </div>
          </PublicCard>
        }
      />

      <PublicSection surface="surface">
        <div className="mx-auto items-start lg:grid lg:max-w-[75rem] lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 xl:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <PublicCard className="overflow-hidden p-0">
                <div className="flex items-center gap-2.5 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
                  <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
                  <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                    Article details
                  </p>
                </div>

                <div className="grid gap-px bg-[var(--ui-border-color)]">
                  {articleDetails.map((item) => (
                    <div
                      key={item.label}
                      className="space-y-1 bg-[var(--primary-background-color)] px-5 py-4"
                    >
                      <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                        {item.label}
                      </p>
                      <p className="text-label-14 text-[var(--primary-text-color)]">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--ui-border-color)] px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {post.keywords.map((keyword) => (
                      <PublicTag key={keyword} text={keyword} />
                    ))}
                  </div>
                </div>
              </PublicCard>

              <PublicCard className="overflow-hidden p-0">
                <div className="border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
                  <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                    On this page
                  </p>
                </div>
                <nav className="space-y-1 p-3">
                  {tableOfContents.map(({ id, label }, index) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 text-label-14 text-[var(--secondary-text-color)] transition-colors hover:bg-[var(--blog-accent-soft)] hover:text-[var(--primary-text-color)]"
                      style={getBlogAccentStyle(index)}
                    >
                      <span className="h-6 w-0.5 shrink-0 rounded-full bg-[var(--blog-accent)] opacity-55" />
                      <span className="w-5 shrink-0 text-label-12 text-[var(--placeholder-color)]">{String(index + 1).padStart(2, "0")}</span>
                      <span>{label}</span>
                    </a>
                  ))}
                </nav>
              </PublicCard>
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <PublicCard className="overflow-hidden p-0 lg:hidden">
              <div className="border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-5 py-3.5">
                <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                  On this page
                </p>
              </div>
              <nav className="grid gap-px bg-[var(--ui-border-color)] sm:grid-cols-3">
                {tableOfContents.map(({ id, label }, index) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="flex items-start gap-2 bg-[var(--primary-background-color)] px-4 py-3.5 text-label-12 text-[var(--secondary-text-color)]"
                  >
                    <span className="text-[var(--placeholder-color)]">{String(index + 1).padStart(2, "0")}</span>
                    <span>{label}</span>
                  </a>
                ))}
              </nav>
            </PublicCard>

            <PublicCard className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-6 py-4 md:px-7">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--primary-color)] opacity-65" />
                  <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
                    Article
                  </p>
                </div>
                <PublicTag text={`${post.sections.length} sections`} />
              </div>

              <article className="blog-prose">
                {post.sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 border-b border-[var(--ui-border-color)] px-6 py-8 last:border-b-0 md:grid md:grid-cols-[3.25rem_minmax(0,1fr)] md:gap-5 md:px-8 md:py-10"
                    style={getBlogAccentStyle(index)}
                  >
                    <div className="mb-4 flex items-center gap-2 md:mb-0 md:block">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] border border-[var(--ui-border-color)] bg-[var(--blog-accent-soft)] text-label-12 text-[var(--blog-accent)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="h-1 w-10 rounded-full bg-[var(--blog-accent)] opacity-45 md:mt-3 md:block md:w-8" />
                    </div>
                    <div className="min-w-0 space-y-4">
                      <h2>{section.title}</h2>
                      <div className="space-y-4">{section.content}</div>
                    </div>
                  </section>
                ))}
              </article>

              <div className="border-t border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] p-4 md:p-5">
                <div className="overflow-hidden rounded-[1rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)]">
                  <div className="grid gap-px bg-[var(--ui-border-color)] md:grid-cols-[minmax(0,1fr)_14rem]">
                    <div className="bg-[var(--primary-background-color)] px-5 py-5 md:px-6">
                      <p className="text-heading-16 text-[var(--primary-text-color)]">
                        Ready to get started?
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <PublicPrimaryLinkButton href="/sign-up">Start free trial</PublicPrimaryLinkButton>
                        <PublicSubtleLinkButton href="/blog">More articles</PublicSubtleLinkButton>
                      </div>
                    </div>
                    <div className="grid content-between bg-[var(--allgrey-background-color)] px-5 py-5">
                      <div className="grid grid-cols-3 gap-2" aria-hidden="true">
                        {post.sections.map((section, index) => (
                          <span
                            key={section.id}
                            className="flex h-9 items-end rounded-[0.7rem] border border-[var(--ui-border-color)] bg-[var(--primary-background-color)] p-1.5"
                            style={getBlogAccentStyle(index)}
                          >
                            <span className="h-1 w-full rounded-full bg-[var(--blog-accent)] opacity-40" />
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-label-12 text-[var(--secondary-text-color)]">
                        By {post.authorName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PublicCard>
          </div>
        </div>
      </PublicSection>

      {relatedPosts.length > 0 ? (
        <PublicSection title="Related articles" surface="canvas">
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
