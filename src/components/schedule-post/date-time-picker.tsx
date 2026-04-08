"use client";

import type React from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
  appearance?: "default" | "geist";
}

export default function ScheduleDateTimePicker({
  date,
  setDate,
  time,
  setTime,
  appearance = "default",
}: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const minDate = new Date().toISOString().split("T")[0];
  const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
    const hour = String(Math.floor(index / 4)).padStart(2, "0");
    const minute = String((index % 4) * 15).padStart(2, "0");
    return `${hour}:${minute}`;
  });

  if (appearance === "geist") {
    const fieldClassName =
      "flex h-10 w-full rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] px-3 text-label-14 text-[var(--ds-gray-1000)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-background-100)]";

    return (
      <div className="space-y-4 rounded-2xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-label-14 text-[var(--ds-gray-1000)]">Schedule</label>
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-gray-900)]">
            <Globe className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[180px]">{timezone}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="post-date" className="text-label-12 text-[var(--ds-gray-900)]">
              Date
            </label>
            <input
              id="post-date"
              type="date"
              value={date}
              min={minDate}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClassName}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="post-time" className="text-label-12 text-[var(--ds-gray-900)]">
              Time
            </label>
            <select
              id="post-time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className={fieldClassName}
            >
              <option value="">Select time</option>
              {timeOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="border-t border-[var(--ds-gray-400)] pt-3 text-copy-12 text-[var(--ds-gray-900)]">
          Select when you want your post to go live — time is based on your local timezone.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">Schedule</label>
        <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-2.5 py-1 text-xs text-foreground-muted">
          <Globe className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[180px]">{timezone}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="post-date" className="text-xs font-medium text-muted-foreground">
            Date
          </label>
          <input
            id="post-date"
            type="date"
            value={date}
            min={minDate}
            onChange={(event) => setDate(event.target.value)}
            className={cn(
              "flex h-10 w-full rounded-md border px-3 text-sm transition-colors",
              "border-input bg-background text-foreground shadow-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="post-time" className="text-xs font-medium text-muted-foreground">
            Time
          </label>
          <select
            id="post-time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className={cn(
              "flex h-10 w-full rounded-md border px-3 text-sm transition-colors",
              "border-input bg-background text-foreground shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            )}
          >
            <option value="">Select time</option>
            {timeOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="border-t border-border-subtle pt-3 text-xs text-foreground-muted">
        Select when you want your post to go live — time is based on your local timezone.
      </p>
    </div>
  );
}
