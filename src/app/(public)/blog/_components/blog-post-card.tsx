import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import { PublicCard } from "@/components/public/public-layout";
import { cn } from "@/lib/utils";

import type { BlogPost } from "../posts";
import { formatBlogDate } from "../posts";

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
  if (featured) {
    return (
      <PublicCard className={cn("card-hover overflow-hidden", className)}>
        <Link href={`/blog/${post.slug}`} className="group block h-full">
          <div className="grid h-full lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] lg:border-r lg:border-b-0">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt}
                width={1200}
                height={630}
                priority={priority}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
              />
            </div>

            <div className="flex h-full flex-col justify-between gap-6 p-7">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--ds-gray-900)]">
                  <span>{formatBlogDate(post.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>
                <div className="space-y-3">
                  <h2 className="text-heading-32 text-[var(--ds-gray-1000)] transition-colors group-hover:text-[var(--ds-blue-700)]">
                    {post.title}
                  </h2>
                  <p className="text-copy-14 text-[var(--ds-gray-900)] md:text-[1rem] md:leading-6">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t border-[var(--ds-gray-400)] pt-4">
                <div className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--ds-gray-900)]">
                  <span>By {post.authorName}</span>
                </div>
                <div className="flex items-center justify-end gap-4">
                  <span className="inline-flex items-center gap-1.5 text-label-14 text-[var(--ds-gray-1000)]">
                    Read post
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </PublicCard>
    );
  }

  return (
    <PublicCard className={cn("card-hover h-full overflow-hidden", className)}>
      <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
        <div className="border-b border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)]">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            width={1200}
            height={630}
            priority={priority}
            className="aspect-[1.91/1] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center gap-3 text-label-12 text-[var(--ds-gray-900)]">
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-heading-16 text-[var(--ds-gray-1000)] transition-colors group-hover:text-[var(--ds-blue-700)]">
              {post.title}
            </h3>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">{post.excerpt}</p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-[var(--ds-gray-400)] pt-4">
            <span className="text-label-12 text-[var(--ds-gray-900)]">
              {formatBlogDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-label-14 text-[var(--ds-gray-1000)]">
              Open
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </PublicCard>
  );
}
