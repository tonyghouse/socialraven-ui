"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";

export function UserAvatar({
  size = "md",
  collapsed = false,
}: {
  size?: "sm" | "md";
  collapsed?: boolean;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const avatarSize = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-black/[0.05] transition-colors w-full"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User avatar"}
            className={`${avatarSize} rounded-xl object-cover shrink-0`}
          />
        ) : (
          <div
            className={`${avatarSize} rounded-xl bg-accent/15 flex items-center justify-center text-xs font-semibold text-accent shrink-0`}
          >
            {initials}
          </div>
        )}

        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-medium text-foreground/75 truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11.5px] text-foreground/40 truncate leading-tight mt-0.5">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+6px)] left-0 w-52 bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_-6px_rgba(15,23,42,0.15),0_2px_8px_-2px_rgba(15,23,42,0.08)] border border-foreground/[0.08] p-1.5 space-y-px z-[300]">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-black/[0.05] text-[13px] font-medium text-foreground/70 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-foreground/40" />
            Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-[13px] font-medium text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
