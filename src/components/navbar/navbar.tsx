"use client";
import Link from "next/link";
import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { MessageSquareCode } from "lucide-react";
import { Badge } from "../ui/badge";

export default function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="w-full flex justify-center">
      <div
        className="
          mt-2 mx-2 lg:mx-5 
          w-full max-w-7xl
          rounded-[24px] 
          border border-foreground/10
          bg-white/60 backdrop-blur-xl 
          shadow-[0_4px_24px_-8px_rgba(15,23,42,0.15)]
          transition-all
        "
      >
        <nav className="h-16 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/SocialRavenLogo.svg"
              alt="SocialRaven logo"
              className="h-6 w-6"
            />

            <span className="text-lg font-semibold text-foreground/70 group-hover:text-accent transition">
              SocialRaven
            </span>
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 rounded-xl" } }} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    className="rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-primary"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-full bg-accent text-white hover:bg-accent/50 shadow-md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
