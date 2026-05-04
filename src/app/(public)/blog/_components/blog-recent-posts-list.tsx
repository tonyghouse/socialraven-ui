"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";

import { PublicCard } from "@/components/public/public-layout";
import {
  PublicSubtleButton,
  PublicSubtleLinkButton,
} from "@/components/public/public-site-primitives";
import { cn } from "@/lib/utils";

import { formatBlogDate, type BlogPost } from "../posts";

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
    <div className="space-y-4">
      <PublicCard className="overflow-hidden">
        {visiblePosts.map((post, index) => (
          <article
            key={post.slug}
            className={cn(
              "group px-6 py-5 transition-colors hover:bg-[var(--ds-gray-100)]",
              index > 0 && "border-t border-[var(--ds-gray-400)]",
            )}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
              <div className="min-w-0 space-y-2.5">
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
                    className="block"
                  >
                    <h3 className="text-heading-16 text-[var(--ds-gray-1000)] transition-colors group-hover:text-[var(--ds-blue-700)]">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="max-w-3xl text-copy-14 text-[var(--ds-gray-900)]">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <PublicSubtleLinkButton href={`/blog/${post.slug}`}>
                  Read post
                  <ArrowRight className="transition-transform duration-100 group-hover:translate-x-0.5" />
                </PublicSubtleLinkButton>
              </div>
            </div>
          </article>
        ))}
      </PublicCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-label-12 text-[var(--ds-gray-900)]">
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
    </div>
  );
}
