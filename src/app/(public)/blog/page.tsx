import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import { BlogRecentPostsList } from "./_components/blog-recent-posts-list";
import {
  blogIndexDescription,
  blogPosts,
  formatBlogDate,
  recentBlogPosts,
  topBlogPosts,
} from "./posts";
import { PublicHero, PublicPageShell } from "@/components/public/public-layout";
import {
  PublicBackLink,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
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
      <PublicPageShell>
        <PublicHero
          topSlot={<PublicBackLink href="/" />}
          title="Blog"
          description={blogIndexDescription}
        />

        {featuredTopPost ? (
          <section className="border-b border-[var(--ds-gray-400)]">
            <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-14">
              <div className="mb-6">
                <h2 className="text-heading-20 text-[var(--ds-gray-1000)]">
                  Top posts
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {[featuredTopPost, ...secondaryTopPosts].map((post, index) => (
                  <article
                    key={post.slug}
                    className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]"
                  >
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                        <Image
                          src={post.coverImage}
                          alt={post.coverImageAlt}
                          width={1200}
                          height={630}
                          priority={index === 0}
                          className="aspect-[1.91/1] w-full object-cover transition-transform duration-100 group-hover:scale-[1.01]"
                        />
                      </div>
                    </Link>

                    <div className="space-y-4 p-5">
                      <p className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--ds-gray-900)]">
                        <span>{formatBlogDate(post.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </p>

                      <div className="space-y-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="group block"
                        >
                          <h3 className="text-heading-20 text-[var(--ds-gray-1000)] transition-colors group-hover:text-[var(--ds-blue-700)]">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-copy-14 text-[var(--ds-gray-900)]">
                          {post.excerpt}
                        </p>
                      </div>

                      <div>
                        <PublicSubtleLinkButton href={`/blog/${post.slug}`}>
                          Read post
                          <ArrowRight />
                        </PublicSubtleLinkButton>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {recentBlogPosts.length > 0 ? (
          <section className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-background-200)]">
            <div className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-14">
              <div className="mb-6">
                <h2 className="text-heading-20 text-[var(--ds-gray-1000)]">
                  Recent posts
                </h2>
              </div>

              <BlogRecentPostsList
                posts={recentBlogPosts}
                initialVisibleCount={2}
                pageSize={2}
              />
            </div>
          </section>
        ) : null}
      </PublicPageShell>
    </>
  );
}
