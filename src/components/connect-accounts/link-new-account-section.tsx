"use client";

import Link from "next/link";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Link2,
  Facebook,
} from "lucide-react";

const PROVIDERS = [
  {
    name: "X / Twitter",
    href: "/api/auth/x",
    icon: Twitter,
    color: "text-black",
  },
  {
    name: "LinkedIn",
    href: "/api/auth/linkedin",
    icon: Linkedin,
    color: "text-blue-600",
  },
  {
    name: "YouTube",
    href: "/api/auth/youtube",
    icon: Youtube,
    color: "text-red-600",
  },
  {
    name: "(Disabled) Instagram",
    href: "/api/auth/instagram",
    icon: Instagram,
    color: "text-pink-500",
  }
];

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

      {/* TITLE */}
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">
          Link New Account
        </h2>
      </div>

      {/* ICON ROW — SUPER COMPACT, FIXED WIDTH */}
      <div className="flex flex-wrap gap-3">
        {PROVIDERS.map(({ name, href, icon: Icon, color }) => (
          <Link key={name} href={href}>
            <button
              className="
                w-[110px] h-[90px]
                flex flex-col items-center justify-center
                gap-2
                rounded-[18px]
                bg-white/70 backdrop-blur-xl
                border border-foreground/10
                shadow-sm
                hover:bg-white/80 transition
              "
            >
              <div
                className="
                  h-9 w-9 rounded-lg bg-white
                  shadow-sm flex items-center justify-center
                "
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>

              <span className="text-[12px] font-medium text-foreground/90 text-center truncate max-w-[90px]">
                {name}
              </span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
