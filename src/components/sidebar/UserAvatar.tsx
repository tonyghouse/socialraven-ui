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
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 transition w-full"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User avatar"}
            className={`${avatarSize} rounded-xl object-cover shrink-0`}
          />
        ) : (
          <div
            className={`${avatarSize} rounded-xl bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent shrink-0`}
          >
            {initials}
          </div>
        )}

        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-foreground/80 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-foreground/50 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-14 left-0 w-52 bg-white rounded-xl shadow-lg border border-foreground/10 p-2 space-y-1 z-[300]">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 text-sm text-foreground/80 transition"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 text-sm text-red-500 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
