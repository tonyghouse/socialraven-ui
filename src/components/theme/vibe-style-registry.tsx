"use client";

import type { ReactNode } from "react";
import { useServerInsertedHTML } from "next/navigation";

declare global {
  // Vibe writes server-rendered component CSS into this object.
  // We flush it into a single <style> tag for Next App Router SSR.
  // eslint-disable-next-line no-var
  var injectedStyles: Record<string, string> | undefined;
}

if (typeof window === "undefined") {
  globalThis.injectedStyles ??= {};
}

export function VibeStyleRegistry({ children }: { children: ReactNode }) {
  useServerInsertedHTML(() => {
    const injectedStyles = globalThis.injectedStyles;

    if (!injectedStyles) {
      return null;
    }

    const styles = Object.values(injectedStyles);

    if (styles.length === 0) {
      return null;
    }

    globalThis.injectedStyles = {};

    return (
      <style
        id="vibe-ssr-styles"
        dangerouslySetInnerHTML={{ __html: styles.join("\n") }}
      />
    );
  });

  return children;
}
