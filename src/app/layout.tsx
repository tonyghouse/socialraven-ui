import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import ClientToaster from "@/components/generic/ClientToaster";
import { ThemeProvider } from "@/components/theme/theme-provider";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SocialRaven",
  description: "Social Media Automation & Management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
          <ThemeProvider>
            <ClientToaster />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
