"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Link2,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

export default function LinkNewAccountSection() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Connect Accounts
        </h1>
        <p className="text-muted-foreground">
          Connect and manage your social media accounts
        </p>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Link New Account
        </h2>
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-6 mb-6">
        
        <Link href="/api/auth/instagram" className="w-full sm:w-auto">
          <button className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-violet-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Instagram className="h-6 w-6 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-center">Instagram</span>
          </button>
        </Link>

        <Link href="/api/auth/x" className="w-full sm:w-auto">
          <button className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-black hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Twitter className="h-6 w-6 text-black" />
            </div>
            <span className="text-sm font-medium text-center">X/Twitter</span>
          </button>
        </Link>

        <Link href="/api/auth/linkedin" className="w-full sm:w-auto">
          <button className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-blue-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Linkedin className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-center">Linkedin</span>
          </button>
        </Link>

        <Link href="/api/auth/youtube" className="w-full sm:w-auto">
          <button className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-red-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Youtube className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-center">Youtube</span>
          </button>
        </Link>


        {/* <Link href="/connect-accounts/later" className="w-full sm:w-auto">
          <button className="w-full flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 text-blue-600 hover:shadow-md hover:border-primary/30">
            <div className="p-3 rounded-lg bg-white">
              <Facebook className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-center">Facebook</span>
          </button>
        </Link> */}
      </div>
    </div>
  );
}
