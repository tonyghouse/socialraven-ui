"use client";

import Link from "next/link";
import { Instagram, Linkedin, Twitter, Youtube, Link2 } from "lucide-react";

export default function LinkNewAccountSection() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Connect Accounts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect and manage your social media profiles
        </p>
      </div>

      {/* SECTION TITLE */}
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">
          Link New Account
        </h2>
      </div>

      {/* ICON GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">

        {/* Instagram */}
        <Link href="/api/auth/instagram">
          <button
            className="
              frosted-border depth-ring
              w-full flex flex-col items-center gap-3 p-5
              rounded-[22px]
              bg-white/65 backdrop-blur-xl
              transition-all hover:scale-[1.02] active:scale-[0.99]
            "
          >
            <div className="
              h-12 w-12 
              rounded-xl 
              bg-white shadow-sm 
              flex items-center justify-center
            ">
              <Instagram className="h-5 w-5 text-pink-500" />
            </div>
            <span className="text-sm font-medium text-foreground/90">
              Instagram
            </span>
          </button>
        </Link>

        {/* X / Twitter */}
        <Link href="/api/auth/x">
          <button
            className="
              frosted-border depth-ring
              w-full flex flex-col items-center gap-3 p-5
              rounded-[22px]
              bg-white/65 backdrop-blur-xl
              transition-all hover:scale-[1.02] active:scale-[0.99]
            "
          >
            <div className="
              h-12 w-12 rounded-xl bg-white shadow-sm 
              flex items-center justify-center
            ">
              <Twitter className="h-5 w-5 text-black" />
            </div>
            <span className="text-sm font-medium text-foreground/90">
              X / Twitter
            </span>
          </button>
        </Link>

        {/* LinkedIn */}
        <Link href="/api/auth/linkedin">
          <button
            className="
              frosted-border depth-ring
              w-full flex flex-col items-center gap-3 p-5
              rounded-[22px]
              bg-white/65 backdrop-blur-xl
              transition-all hover:scale-[1.02] active:scale-[0.99]
            "
          >
            <div className="
              h-12 w-12 rounded-xl bg-white shadow-sm 
              flex items-center justify-center
            ">
              <Linkedin className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground/90">
              LinkedIn
            </span>
          </button>
        </Link>

        {/* YouTube */}
        <Link href="/api/auth/youtube">
          <button
            className="
              frosted-border depth-ring
              w-full flex flex-col items-center gap-3 p-5
              rounded-[22px]
              bg-white/65 backdrop-blur-xl
              transition-all hover:scale-[1.02] active:scale-[0.99]
            "
          >
            <div className="
              h-12 w-12 rounded-xl bg-white shadow-sm 
              flex items-center justify-center
            ">
              <Youtube className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-foreground/90">
              YouTube
            </span>
          </button>
        </Link>

      </div>
    </div>
  );
}
