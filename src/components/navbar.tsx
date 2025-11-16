'use client'
import Link from 'next/link'
import React from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from './ui/button'
import { MessageSquareCode } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/10 via-purple-950/10 to-blue-950/10 backdrop-blur-md border-b border-cyan-500/20"></div>
      
      <nav className="relative px-4 lg:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link className="flex items-center gap-2 group" href="/">
            <MessageSquareCode className="h-7 w-7 text-cyan-500" />
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
            SocialRaven
          </span>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={"/sign-in"}>
                <Button 
                  variant="ghost" 
                  className="text-foreground hover:text-cyan-500 hover:bg-cyan-500/10 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
              
              <Link href={"/sign-up"}>
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
