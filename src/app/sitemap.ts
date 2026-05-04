import type { MetadataRoute } from "next";

import { blogPosts } from "./(public)/blog/posts";
import { absoluteUrl } from "@/lib/site";

const marketingRoutes = [
  "/",
  "/about",
  "/blog",
  "/changelog",
  "/contact",
  "/meta/data-deletion",
  "/pricing",
  "/privacy-policy",
  "/refund-policy",
  "/terms-of-service",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...marketingRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "/" ? 1 : route === "/blog" ? 0.9 : 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
