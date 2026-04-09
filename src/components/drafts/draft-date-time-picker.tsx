"use client";

import type React from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
}

export function DraftDateTimePicker({ date, setDate, time, setTime }: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const minDate = new Date().toISOString().split("T")[0];

  const inputClassName = cn(
    "flex h-10 w-full rounded-md border px-3 text-sm transition-colors",
    "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
  );

  return (
    <div className="space-y-4 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <label className="text-label-14 text-[var(--ds-gray-1000)]">Schedule</label>
        <div className="flex items-center gap-1.5 rounded-md border border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] px-2.5 py-1 text-copy-12 text-[var(--ds-gray-900)]">
          <Globe className="h-3 w-3 flex-shrink-0" />
          <span className="max-w-[11.25rem] truncate">{timezone}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-copy-12 text-[var(--ds-gray-900)]">Date</span>
          <input
            id="post-date"
            type="date"
            value={date}
            min={minDate}
            onChange={(event) => setDate(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-copy-12 text-[var(--ds-gray-900)]">Time</span>
          <input
            id="post-time"
            type="time"
            value={time}
            step={900}
            onChange={(event) => setTime(event.target.value)}
            className={inputClassName}
          />
        </label>
      </div>

      <p className="border-t border-[var(--ds-gray-400)] pt-3 text-copy-12 text-[var(--ds-gray-900)]">
        Select when you want your post to go live. Time is based on your local timezone.
      </p>
    </div>
  );
}
