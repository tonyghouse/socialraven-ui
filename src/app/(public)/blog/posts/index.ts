import { post as batchingPost } from "./how-to-batch-a-month-of-social-content";
import { post as approvalWorkflowPost } from "./lightweight-approval-workflow-for-social-teams";
import { post as contentPillarsPost } from "./choosing-content-pillars-for-consistent-scheduling";
import type { BlogPost } from "./types";

export const blogIndexDescription =
  "Short, practical articles on social media planning, approvals, scheduling, and repeatable publishing systems from the SocialRaven team.";

export const blogPosts: BlogPost[] = [
  batchingPost,
  approvalWorkflowPost,
  contentPillarsPost,
].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

export const topBlogPosts = blogPosts
  .filter((post) => typeof post.topPostRank === "number")
  .sort((left, right) => {
    const leftRank = left.topPostRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.topPostRank ?? Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return right.publishedAt.localeCompare(left.publishedAt);
  });

export const recentBlogPosts = blogPosts.filter(
  (post) => typeof post.topPostRank !== "number",
);

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function getAllBlogPostSlugs() {
  return blogPosts.map((post) => post.slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(slug: string, limit = 2) {
  if (!getBlogPostBySlug(slug)) {
    return [];
  }

  return blogPosts
    .filter((post) => post.slug !== slug)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, limit);
}

export type { BlogPost, BlogPostSection } from "./types";
