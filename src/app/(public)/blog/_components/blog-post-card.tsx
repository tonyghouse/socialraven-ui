import Image from "next/image";
import Link from "next/link";
import { Doc, MoveArrowRight, Time } from "@vibe/icons";

import { PublicCard } from "@/components/public/public-layout";
import {
  PublicLozenge,
  PublicTag,
} from "@/components/public/public-site-primitives";
import { cn } from "@/lib/utils";

import type { BlogPost } from "../posts";
import { formatBlogDate } from "../posts";
import { getBlogAccentStyle } from "./blog-theme";

export function BlogPostCard({
  post,
  featured = false,
  priority = false,
  className,
}: {
  post: BlogPost;
  featured?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const accentStyle = getBlogAccentStyle(post.slug);

  if (featured) {
    return (
      <PublicCard
        className={cn("card-hover overflow-hidden p-0", className)}
        style={accentStyle}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--ui-border-color)] bg-[var(--primary-background-color)] px-5 py-3.5 md:px-6">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[var(--blog-accent)] opacity-65" />
            <span className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
              Featured playbook
            </span>
          </div>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <span
                key={item}
                className="h-1.5 w-1.5 rounded-full bg-[var(--blog-accent)] opacity-30"
              />
            ))}
          </div>
        </div>
        <Link href={`/blog/${post.slug}`} className="group block h-full min-w-0">
          <div className="grid h-full lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="border-b border-[var(--ui-border-color)] bg-[var(--blog-accent-soft)] p-3 lg:border-r lg:border-b-0 md:p-4">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt}
                width={1200}
                height={630}
                priority={priority}
                className="h-full min-h-[18rem] w-full rounded-[1rem] border border-[var(--ui-border-color)] object-cover transition-transform duration-200 group-hover:scale-[1.008]"
              />
            </div>

            <div className="flex h-full min-w-0 flex-col justify-between gap-6 p-7 md:p-8">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <PublicLozenge appearance="information">Featured</PublicLozenge>
                  <PublicTag text={`${post.sections.length} sections`} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--secondary-text-color)]">
                  <span>{formatBlogDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Time className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                  <span>By {post.authorName}</span>
                </div>
                <div className="min-w-0 space-y-3">
                  <h2 className="text-heading-32 text-[var(--primary-text-color)] transition-colors [overflow-wrap:anywhere] group-hover:text-[var(--primary-color)]">
                    {post.title}
                  </h2>
                  <p className="text-copy-14 text-[var(--secondary-text-color)] md:text-[1rem] md:leading-6">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[var(--ui-border-color)] pt-4">
                <span className="text-label-12 text-[var(--secondary-text-color)]">
                  {post.sections.length} sections
                </span>
                <span className="inline-flex items-center gap-1.5 text-label-14 text-[var(--primary-text-color)]">
                  Read post
                  <MoveArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </PublicCard>
    );
  }

  return (
    <PublicCard
      className={cn("card-hover h-full overflow-hidden p-0", className)}
      style={accentStyle}
    >
      <div className="flex items-center justify-between border-b border-[var(--ui-border-color)] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-0.5 rounded-full bg-[var(--blog-accent)] opacity-65" />
          <span className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            Editorial guide
          </span>
        </div>
        <Doc className="h-4 w-4 text-[var(--blog-accent)] opacity-60" />
      </div>
      <Link href={`/blog/${post.slug}`} className="group flex h-full min-w-0 flex-col">
        <div className="border-b border-[var(--ui-border-color)] bg-[var(--blog-accent-soft)] p-3">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            width={1200}
            height={630}
            priority={priority}
            className="aspect-[1.91/1] w-full rounded-[0.9rem] border border-[var(--ui-border-color)] object-cover transition-transform duration-200 group-hover:scale-[1.008]"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <PublicTag text={`${post.sections.length} sections`} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--secondary-text-color)]">
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Time className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          <div className="min-w-0 space-y-3">
            <h3 className="text-heading-16 text-[var(--primary-text-color)] transition-colors [overflow-wrap:anywhere] group-hover:text-[var(--primary-color)]">
              {post.title}
            </h3>
            <p className="text-copy-14 text-[var(--secondary-text-color)]">{post.excerpt}</p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-[var(--ui-border-color)] pt-4">
            <span className="text-label-12 text-[var(--secondary-text-color)]">
              By {post.authorName}
            </span>
            <span className="inline-flex items-center gap-1 text-label-14 text-[var(--primary-text-color)]">
              Read post
              <MoveArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </PublicCard>
  );
}
