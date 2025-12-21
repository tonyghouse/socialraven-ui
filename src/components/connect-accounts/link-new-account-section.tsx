"use client";

import { useState } from "react";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Link2,
  AlertCircle,
} from "lucide-react";

const PROVIDERS = [
  {
    name: "X / Twitter",
    key: "x",
    href: "/api/auth/x",
    icon: Twitter,
    color: "text-black",
    bgColor: "bg-white",
    enabled: true,
  },
  {
    name: "LinkedIn",
    key: "linkedin",
    href: "/api/auth/linkedin",
    icon: Linkedin,
    color: "text-blue-600",
    bgColor: "bg-white",
    enabled: true,
  },
  {
    name: "YouTube",
    key: "youtube",
    href: "/api/auth/youtube",
    icon: Youtube,
    color: "text-red-600",
    bgColor: "bg-white",
    enabled: true,
  },
  {
    name: "Instagram",
    key: "instagram",
    href: "/api/auth/instagram",
    icon: Instagram,
    color: "text-pink-500",
    bgColor: "bg-gray-100",
    enabled: false,
  },
];

export default function LinkNewAccountSection() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}
      {/* ICON ROW */}
      <div className="flex flex-wrap gap-3">
        {PROVIDERS.map((provider) => (
          <a
            key={provider.key}
            href={provider.enabled ? provider.href : undefined}
            onClick={(e) => {
              if (!provider.enabled) e.preventDefault();
            }}
            className={`
              w-[110px] h-[90px]
              flex flex-col items-center justify-center
              gap-2
              rounded-[18px]
              ${provider.bgColor} backdrop-blur-xl
              border border-foreground/10
              shadow-sm
              transition-all duration-200
              relative
              ${
                provider.enabled
                  ? "hover:bg-white/80 hover:scale-105 hover:shadow-md cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }
            `}
          >
            <div className="h-9 w-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <provider.icon className={`h-5 w-5 ${provider.color}`} />
            </div>

            <span className="text-[12px] font-medium text-foreground/90 text-center truncate max-w-[90px]">
              {provider.name}
            </span>

            {!provider.enabled && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-semibold bg-gray-200 text-gray-600 rounded">
                SOON
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
