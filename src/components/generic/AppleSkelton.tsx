"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function AppleSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-foreground/5",
        "backdrop-blur-sm",
        "border border-foreground/10",
        className
      )}
    />
  );
}
