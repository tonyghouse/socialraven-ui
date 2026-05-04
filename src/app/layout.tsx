import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import ClientToaster from "@/components/generic/ClientToaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getMetadataBase } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialRaven",
  description:
    "Social media scheduling, publishing, and approval workflows for creators, agencies, and operations-focused teams.",
  metadataBase: getMetadataBase(),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "SocialRaven",
    description:
      "Social media scheduling, publishing, and approval workflows for creators, agencies, and operations-focused teams.",
    siteName: "SocialRaven",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialRaven",
    description:
      "Social media scheduling, publishing, and approval workflows for creators, agencies, and operations-focused teams.",
  },
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
          suppressHydrationWarning
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            geistSans.variable,
            geistMono.variable
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
