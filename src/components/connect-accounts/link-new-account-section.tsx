"use client";

import { useState, useEffect } from "react";
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

// Rate limit protection
const RATE_LIMIT_KEY = 'x_oauth_last_attempt';
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown between attempts

export default function LinkNewAccountSection() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Check for cooldown on mount
  useEffect(() => {
    const lastAttempt = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastAttempt) {
      const timeSince = Date.now() - parseInt(lastAttempt);
      if (timeSince < RATE_LIMIT_COOLDOWN) {
        setCooldownRemaining(Math.ceil((RATE_LIMIT_COOLDOWN - timeSince) / 1000));
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const handleConnect = async (provider: typeof PROVIDERS[0], e: React.MouseEvent) => {
    // If disabled, prevent action
    if (!provider.enabled) {
      e.preventDefault();
      return;
    }

    // Only use popup for X/Twitter
    if (provider.key === "x") {
      e.preventDefault();
      
      // Check rate limit
      const lastAttempt = localStorage.getItem(RATE_LIMIT_KEY);
      if (lastAttempt) {
        const timeSince = Date.now() - parseInt(lastAttempt);
        if (timeSince < RATE_LIMIT_COOLDOWN) {
          const secondsLeft = Math.ceil((RATE_LIMIT_COOLDOWN - timeSince) / 1000);
          setError(`Please wait ${secondsLeft} seconds before trying again to avoid rate limits.`);
          setCooldownRemaining(secondsLeft);
          return;
        }
      }

      // Record this attempt
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      
      setLoading(provider.key);
      setError(null);

      try {
        // Simple popup approach for X only
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          provider.href,
          'x-oauth-popup',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          console.warn("Popup blocked, using direct navigation");
          window.location.href = provider.href;
          setLoading(null);
          return;
        }

        // Listen for callback
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'x-oauth-success') {
            setLoading(null);
            popup?.close();
            localStorage.removeItem(RATE_LIMIT_KEY); // Clear on success
            window.location.reload();
          } else if (event.data.type === 'x-oauth-error') {
            setLoading(null);
            setError(event.data.message || `Failed to connect ${provider.name}`);
            popup?.close();
          }
        };

        window.addEventListener("message", handleMessage);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", handleMessage);
            setLoading(null);
          }
        }, 1000);

      } catch (err) {
        console.error(`${provider.name} OAuth error:`, err);
        setError(
          err instanceof Error 
            ? err.message 
            : `Failed to connect ${provider.name}`
        );
        setLoading(null);
      }
    }
  };

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

      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">{error}</p>
            {error.includes('rate limit') ? (
              <p className="text-xs text-red-600 mt-1">
                Twitter has rate limits. Please wait before trying again.
              </p>
            ) : (
              <p className="text-xs text-red-600 mt-1">
                Try disabling ad blockers or allowing popups for this site
              </p>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* TITLE */}
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">
          Link New Account
        </h2>
      </div>

      {/* ICON ROW */}
      <div className="flex flex-wrap gap-3">
        {PROVIDERS.map((provider) => {
          // For X, use button with popup logic
          if (provider.key === "x") {
            return (
              <button
                key={provider.key}
                onClick={(e) => handleConnect(provider, e)}
                disabled={!provider.enabled || loading === provider.key || cooldownRemaining > 0}
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
                    provider.enabled && cooldownRemaining === 0
                      ? "hover:bg-white/80 hover:scale-105 hover:shadow-md cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }
                  ${loading === provider.key ? "animate-pulse" : ""}
                `}
              >
                <div
                  className={`
                    h-9 w-9 rounded-lg bg-white
                    shadow-sm flex items-center justify-center
                  `}
                >
                  <provider.icon className={`h-5 w-5 ${provider.color}`} />
                </div>

                <span className="text-[12px] font-medium text-foreground/90 text-center truncate max-w-[90px]">
                  {loading === provider.key 
                    ? "Connecting..." 
                    : cooldownRemaining > 0 
                    ? `Wait ${cooldownRemaining}s`
                    : provider.name}
                </span>

                {!provider.enabled && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-semibold bg-gray-200 text-gray-600 rounded">
                    SOON
                  </span>
                )}
              </button>
            );
          }

          // For other providers, use regular link
          return (
            <a
              key={provider.key}
              href={provider.enabled ? provider.href : undefined}
              onClick={(e) => !provider.enabled && e.preventDefault()}
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
              <div
                className={`
                  h-9 w-9 rounded-lg bg-white
                  shadow-sm flex items-center justify-center
                `}
              >
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
          );
        })}
      </div>
    </div>
  );
}