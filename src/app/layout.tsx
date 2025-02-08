import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import localfont from "next/font/local"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/navbar";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const heming = localfont({
  src:[
    {
      path: "../../public/fonts/Heming_Variable.ttf"
    }
  ],
   variable: "--font-heming"
})

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
    <html lang="en">
      <body  className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
          <Navbar/>
          {children}
          <Toaster />
          </body>
    </html>
    </ClerkProvider>
  );
}


