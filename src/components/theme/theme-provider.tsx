"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      themes={["light", "dark"]}
      value={{
        light: "default-app-theme",
        dark: "black-app-theme",
      }}
    >
      {children}
    </NextThemesProvider>
  );
}
