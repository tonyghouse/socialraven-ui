"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MoveArrowRight, Time } from "@vibe/icons";

import { PublicCard } from "@/components/public/public-layout";
import {
  PublicSubtleButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
import { cn } from "@/lib/utils";

import { formatBlogDate, type BlogPost } from "../posts";
import { getBlogAccentStyle } from "./blog-theme";

export function BlogRecentPostsList({
  posts,
  initialVisibleCount = 2,
  pageSize = 2,
}: {
  posts: BlogPost[];
  initialVisibleCount?: number;
  pageSize?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialVisibleCount, posts.length),
  );

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMorePosts = visibleCount < posts.length;

  return (
    <div>
      <PublicCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-[var(--ui-border-color)] bg-[var(--allgrey-background-color)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-label-12 uppercase tracking-[0.12em] text-[var(--secondary-text-color)]">
            Showing {visiblePosts.length} of {posts.length} posts
          </p>

          {hasMorePosts ? (
            <PublicSubtleButton
              onClick={() => {
                setVisibleCount((currentCount) =>
                  Math.min(currentCount + pageSize, posts.length),
                );
              }}
            >
              Load more posts
            </PublicSubtleButton>
          ) : null}
        </div>

        {visiblePosts.map((post, index) => (
          <article
            key={post.slug}
            className={cn(
              "group transition-colors hover:bg-[var(--blog-accent-soft)]",
              index > 0 && "border-t border-[var(--ui-border-color)]",
            )}
            style={getBlogAccentStyle(post.slug)}
          >
            <div className="grid grid-cols-[0.2rem_minmax(0,1fr)] gap-4 px-5 py-5 md:gap-5 md:px-6">
              <span className="h-full min-h-20 rounded-full bg-[var(--blog-accent)] opacity-55" />

              <div className="grid min-w-0 gap-5 md:grid-cols-[8.5rem_minmax(0,1fr)] lg:grid-cols-[8.5rem_minmax(0,1fr)_auto] lg:items-center">
                <Link
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-[0.85rem] border border-[var(--ui-border-color)] bg-[var(--blog-accent-soft)] p-1.5"
                >
                  <Image
                    src={post.coverImage}
                    alt=""
                    width={240}
                    height={126}
                    className="aspect-[1.91/1] w-full rounded-[0.6rem] object-cover"
                  />
                </Link>

                <div className="min-w-0 space-y-2.5">
                  <p className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--secondary-text-color)]">
                    <span className="text-[var(--placeholder-color)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{formatBlogDate(post.publishedAt)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Time className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                    <span>By {post.authorName}</span>
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="block"
                  >
                    <h3 className="text-heading-16 text-[var(--primary-text-color)] transition-colors [overflow-wrap:anywhere] group-hover:text-[var(--primary-color)]">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="max-w-3xl text-copy-14 text-[var(--secondary-text-color)]">
                    {post.excerpt}
                  </p>
                </div>

                <div className="shrink-0 md:col-start-2 lg:col-start-auto">
                  <PublicSubtleLinkButton href={`/blog/${post.slug}`}>
                    Read post
                    <MoveArrowRight className="transition-transform duration-100 group-hover:translate-x-0.5" />
                  </PublicSubtleLinkButton>
                </div>
              </div>
            </div>
          </article>
        ))}
      </PublicCard>
    </div>
  );
}
