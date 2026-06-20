import type { CSSProperties } from "react";

export type BlogAccentStyle = CSSProperties & {
  "--blog-accent": string;
  "--blog-accent-soft": string;
  "--blog-accent-muted": string;
};

const BLOG_ACCENTS = [
  "var(--primary-color)",
  "var(--color-done-green)",
  "var(--color-working_orange)",
  "var(--color-indigo)",
  "var(--color-bazooka)",
  "var(--color-aquamarine)",
] as const;

function createAccentStyle(colorToken: string): BlogAccentStyle {
  return {
    "--blog-accent": colorToken,
    "--blog-accent-soft": `color-mix(in srgb, ${colorToken} 6%, var(--primary-background-color))`,
    "--blog-accent-muted": `color-mix(in srgb, ${colorToken} 10%, var(--allgrey-background-color))`,
  };
}

export function getBlogAccentStyle(key: string | number): BlogAccentStyle {
  const index =
    typeof key === "number"
      ? key
      : [...key].reduce((total, character) => total + character.charCodeAt(0), 0);

  return createAccentStyle(BLOG_ACCENTS[index % BLOG_ACCENTS.length]);
}
