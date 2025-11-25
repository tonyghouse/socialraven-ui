"use client";
import Link from "next/link";
import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { MessageSquareCode } from "lucide-react";
import { Badge } from "../ui/badge";

export default function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="relative">
      <div className="absolute inset-0 border-primary/20  backdrop-blur-md border"></div>

      <nav className="relative pr-2 lg:pr-2 h-16 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link className="flex items-center gap-2 group" href="/">
          <MessageSquareCode className="h-7 w-7 text-primary" />

          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
            SocialRaven
          </span>

          <Badge
            variant="outline"
            className="border-red-500 text-red-600 px-1.5 py-0 text-xs leading-none rounded-md"
          >
            Beta
          </Badge>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={"/sign-in"}>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>

              <Link href={"/sign-up"}>
                <Button className="bg-gradient-to-r from-primary to-primary/50 hover:from-primary hover:to-primary/50 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
