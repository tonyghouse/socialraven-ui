import type { ReactNode } from "react";

export type BlogPostSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  topPostRank?: number;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  readTime: string;
  coverImage: string;
  coverImageAlt: string;
  keywords: string[];
  sections: BlogPostSection[];
};
