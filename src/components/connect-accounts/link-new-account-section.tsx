"use client";

import { useState } from "react";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  AlertCircle,
} from "lucide-react";

const PROVIDERS = [
  {
    name: "X / Twitter",
    key: "x",
    href: "/api/auth/x",
    icon: Twitter,
    iconColor: "text-slate-800",
    bg: "bg-gradient-to-b from-slate-50 to-slate-100/60",
    border: "border-slate-200/80",
    enabled: true,
  },
  {
    name: "LinkedIn",
    key: "linkedin",
    href: "/api/auth/linkedin",
    icon: Linkedin,
    iconColor: "text-[#0A66C2]",
    bg: "bg-gradient-to-b from-blue-50 to-blue-100/40",
    border: "border-blue-100",
    enabled: true,
  },
  {
    name: "YouTube",
    key: "youtube",
    href: "/api/auth/youtube",
    icon: Youtube,
    iconColor: "text-[#FF0000]",
    bg: "bg-gradient-to-b from-red-50 to-red-100/40",
    border: "border-red-100",
    enabled: true,
  },
  {
    name: "Instagram",
    key: "instagram",
    href: "/api/auth/instagram",
    icon: Instagram,
    iconColor: "text-[#E1306C]",
    bg: "bg-gradient-to-b from-pink-50 to-purple-50/60",
    border: "border-pink-100",
    enabled: false,
  },
];

export default function LinkNewAccountSection() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-start gap-3 p-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* PROVIDER TILES */}
      <div className="flex flex-wrap gap-3">
        {PROVIDERS.map((provider) => (
          <a
            key={provider.key}
            href={provider.enabled ? provider.href : undefined}
            onClick={(e) => {
              if (!provider.enabled) e.preventDefault();
            }}
            className={`
              relative w-[116px] h-[96px]
              flex flex-col items-center justify-center gap-2.5
              rounded-2xl
              ${provider.bg}
              border ${provider.border}
              transition-all duration-200
              ${
                provider.enabled
                  ? "hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:scale-[1.04] hover:-translate-y-0.5 cursor-pointer"
                  : "opacity-45 cursor-not-allowed"
              }
            `}
          >
            <div className="h-10 w-10 rounded-xl bg-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.07)] flex items-center justify-center">
              <provider.icon className={`h-5 w-5 ${provider.iconColor}`} />
            </div>

            <span className="text-[12px] font-semibold text-foreground/75 text-center truncate max-w-[94px] leading-none">
              {provider.name}
            </span>

            {!provider.enabled && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-foreground/8 text-foreground/45 rounded-md tracking-widest uppercase">
                Soon
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
