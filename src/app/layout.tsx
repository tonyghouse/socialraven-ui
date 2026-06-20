import "./globals.css";
import type { Metadata } from "next";
import { Figtree, Poppins, Roboto_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import ClientToaster from "@/components/generic/ClientToaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { VibeStyleRegistry } from "@/components/theme/vibe-style-registry";
import { getMetadataBase } from "@/lib/site";

const figtree = Figtree({
  variable: "--font-vibe-sans",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-vibe-title",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-vibe-mono",
  subsets: ["latin"],
  display: "swap",
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
      <html lang="en" suppressHydrationWarning className="default-app-theme">
        <body
          suppressHydrationWarning
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            figtree.variable,
            poppins.variable,
            robotoMono.variable
          )}
        >
          <ThemeProvider>
            <VibeStyleRegistry>
              <ClientToaster />
              {children}
            </VibeStyleRegistry>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
