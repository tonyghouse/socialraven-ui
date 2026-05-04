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
import { PublicPageShell } from "@/components/public/public-layout";
import { SITE_NAME, absoluteUrl, toJsonLd } from "@/lib/site";
import { cn } from "@/lib/utils";

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
        <div className="mx-auto w-full max-w-7xl px-5 pb-8 pt-8 md:px-8 md:pb-10 md:pt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-label-14 text-[var(--ds-gray-900)] transition-colors hover:text-[var(--ds-gray-1000)]"
          >
            ← Back
          </Link>
          <h1 className="mt-4 text-heading-24 text-[var(--ds-gray-1000)]">
            Blog
          </h1>
        </div>

        {featuredTopPost ? (
          <section className="mx-auto w-full max-w-7xl px-5 pb-12 md:px-8 md:pb-14">
            <div className="mb-6">
              <h2 className="text-heading-20 text-[var(--ds-gray-1000)]">
                Top posts
              </h2>
            </div>

            <div
              className={cn(
                "grid gap-8",
                secondaryTopPosts.length > 0 && "lg:grid-cols-[minmax(0,1fr)_21rem]",
              )}
            >
              <Link href={`/blog/${featuredTopPost.slug}`} className="group block">
                <article className="grid gap-5 lg:grid-cols-[minmax(18rem,24rem)_1fr] lg:items-center lg:gap-8">
                  <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
                    <Image
                      src={featuredTopPost.coverImage}
                      alt={featuredTopPost.coverImageAlt}
                      width={1200}
                      height={630}
                      priority
                      className="aspect-[1.3/1] w-full object-cover"
                    />
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <p className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--ds-gray-900)]">
                        <span>{featuredTopPost.category}</span>
                        <span>{formatBlogDate(featuredTopPost.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {featuredTopPost.readTime}
                        </span>
                      </p>
                      <h2 className="text-heading-32 text-[var(--ds-gray-1000)] transition-colors group-hover:text-[var(--ds-blue-700)]">
                        {featuredTopPost.title}
                      </h2>
                      <p className="max-w-2xl text-copy-16 text-[var(--ds-gray-900)]">
                        {featuredTopPost.description}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-label-14 text-[var(--ds-gray-1000)]">
                      Read post
                      <ArrowRight className="h-4 w-4 transition-transform duration-100 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </article>
              </Link>

              {secondaryTopPosts.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)]">
                  {secondaryTopPosts.map((post, index) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className={cn(
                        "group block px-5 py-5 transition-colors hover:bg-[var(--ds-gray-100)]",
                        index > 0 && "border-t border-[var(--ds-gray-400)]",
                      )}
                    >
                      <article className="space-y-3">
                        <p className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--ds-gray-900)]">
                          <span>{post.category}</span>
                          <span>{formatBlogDate(post.publishedAt)}</span>
                        </p>
                        <div className="space-y-2">
                          <h3 className="text-heading-16 text-[var(--ds-gray-1000)] transition-colors group-hover:text-[var(--ds-blue-700)]">
                            {post.title}
                          </h3>
                          <p className="text-copy-14 text-[var(--ds-gray-900)]">
                            {post.excerpt}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {recentBlogPosts.length > 0 ? (
          <section className="bg-[var(--ds-background-200)]">
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
