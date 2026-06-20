import type { Metadata } from "next";
import Link from "next/link";
import { Doc, MoveArrowRight } from "@vibe/icons";

import { BlogPostCard } from "./_components/blog-post-card";
import { BlogRecentPostsList } from "./_components/blog-recent-posts-list";
import { getBlogAccentStyle } from "./_components/blog-theme";
import {
  formatBlogDate,
  blogIndexDescription,
  blogPosts,
  recentBlogPosts,
  topBlogPosts,
} from "./posts";
import {
  PublicCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public/public-layout";
import { PublicBackLink } from "@/components/public/public-site-primitives";
import { SITE_NAME, absoluteUrl, toJsonLd } from "@/lib/site";

const socialImagePost = topBlogPosts[0] ?? blogPosts[0];

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: blogIndexDescription,
  keywords: [
    "social media blog",
    "social media scheduling tips",
    "content operations blog",
    "social media workflow advice",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    title: `Blog | ${SITE_NAME}`,
    description: blogIndexDescription,
    url: "/blog",
    images: [
      {
        url: socialImagePost.coverImage,
        width: 1200,
        height: 630,
        alt: socialImagePost.coverImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${SITE_NAME}`,
    description: blogIndexDescription,
    images: [socialImagePost.coverImage],
  },
};

function EditorialDesk() {
  return (
    <PublicCard className="depth-soft min-w-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] text-[var(--primary-color)]">
            <Doc className="h-4 w-4" />
          </span>
          <div>
            <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Publishing desk
            </p>
            <p className="mt-0.5 text-label-14 text-[var(--primary-text-color)]">
              Practical systems for social teams
            </p>
          </div>
        </div>
        <span className="h-2 w-2 rounded-full bg-[var(--color-done-green)] opacity-70" />
      </div>

      <div className="bg-[var(--allgrey-background-color)] p-3">
        <div className="overflow-hidden rounded-[1rem] border border-[var(--layout-border-color)] bg-[var(--primary-background-color)]">
          <div className="grid grid-cols-[minmax(0,1fr)_5.25rem] border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-4 py-2.5 text-label-12 uppercase tracking-[0.08em] text-[var(--secondary-text-color)]">
            <span>Editorial queue</span>
            <span className="text-right">Read</span>
          </div>

          {blogPosts.slice(0, 3).map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group grid grid-cols-[0.2rem_minmax(0,1fr)_5.25rem] items-center gap-3 border-b border-[var(--ui-border-color)] px-4 py-3.5 last:border-b-0 hover:bg-[var(--blog-accent-soft)]"
              style={getBlogAccentStyle(post.slug)}
            >
              <span className="h-9 rounded-full bg-[var(--blog-accent)] opacity-55" />
              <span className="min-w-0">
                <span className="block truncate text-label-14 text-[var(--primary-text-color)]">
                  {post.title}
                </span>
                <span className="mt-1 block text-label-12 text-[var(--secondary-text-color)]">
                  {formatBlogDate(post.publishedAt)}
                </span>
              </span>
              <span className="flex items-center justify-end gap-1 text-label-12 text-[var(--secondary-text-color)] group-hover:text-[var(--primary-color)]">
                {post.readTime.replace(" read", "")}
                <MoveArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </PublicCard>
  );
}

export default function BlogPage() {
  const [featuredTopPost, ...secondaryTopPosts] = topBlogPosts;
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description: blogIndexDescription,
    url: absoluteUrl("/blog"),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/SocialRavenLogo.svg"),
      },
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      image: absoluteUrl(post.coverImage),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(blogSchema) }}
      />
      <PublicPageShell mainClassName="bg-[linear-gradient(180deg,var(--primary-background-color)_0%,var(--allgrey-background-color)_24%,var(--primary-background-color)_58%,var(--allgrey-background-color)_100%)]">
        <PublicHero
          topSlot={<PublicBackLink href="/" />}
          title="Blog"
          description={blogIndexDescription}
          aside={<EditorialDesk />}
        />

        {featuredTopPost ? (
          <PublicSection
            eyebrow="Top posts"
            title="Operational advice, not filler content."
            description="The most useful workflow pieces stay pinned here first."
            surface="surface"
          >
            <div className="space-y-5">
              <BlogPostCard post={featuredTopPost} featured priority />
              {secondaryTopPosts.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {secondaryTopPosts.map((post) => (
                    <BlogPostCard key={post.slug} post={post} />
                  ))}
                </div>
              ) : null}
            </div>
          </PublicSection>
        ) : null}

        {recentBlogPosts.length > 0 ? (
          <PublicSection
            eyebrow="Recent"
            title="Fresh publishing and workflow notes."
          >
            <div className="mx-auto w-full max-w-6xl">
              <BlogRecentPostsList
                posts={recentBlogPosts}
                initialVisibleCount={2}
                pageSize={2}
              />
            </div>
          </PublicSection>
        ) : null}
      </PublicPageShell>
    </>
  );
}
