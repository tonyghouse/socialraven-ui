"use client";

import type React from "react";
import { DatePicker, TimePicker } from "@atlaskit/datetime-picker";
import { Globe } from "lucide-react";

interface Props {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
}

export default function ScheduleDateTimePicker({ date, setDate, time, setTime }: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const minDate  = new Date().toISOString().split("T")[0];
  const pickerThemeClassName = [
    "w-full",
    "[--ds-background-input:hsl(var(--surface))]",
    "[--ds-background-input-hovered:hsl(var(--surface-raised))]",
    "[--ds-background-input-pressed:hsl(var(--surface-raised))]",
    "[--ds-background-disabled:hsl(var(--surface-raised))]",
    "[--ds-border-input:hsl(var(--border))]",
    "[--ds-border-focused:hsl(var(--accent))]",
    "[--ds-border-danger:hsl(var(--destructive))]",
    "[--ds-surface-overlay:hsl(var(--surface))]",
    "[--ds-text:hsl(var(--foreground))]",
    "[--ds-text-subtle:hsl(var(--foreground-muted))]",
    "[--ds-text-subtlest:hsl(var(--foreground-subtle))]",
    "[--ds-text-disabled:hsl(var(--foreground-subtle))]",
    "[--ds-text-selected:hsl(var(--accent-foreground))]",
    "[--ds-background-selected:hsl(var(--accent))]",
    "[--ds-background-selected-hovered:hsl(var(--accent-hover))]",
    "[--ds-background-neutral-subtle-hovered:hsl(var(--surface-raised))]",
    "[--ds-background-neutral-subtle-pressed:hsl(var(--surface-raised))]",
    "[--ds-shadow-overlay:var(--shadow-lg)]",
  ].join(" ");
  const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
    const hour = String(Math.floor(index / 4)).padStart(2, "0");
    const minute = String((index % 4) * 15).padStart(2, "0");
    return `${hour}:${minute}`;
  });

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
          <DatePicker
            id="post-date"
            value={date}
            onChange={(value) => setDate(value)}
            minDate={minDate}
            locale="en-US"
            placeholder="Select date"
            shouldShowCalendarButton
            label="Schedule date"
            innerProps={{ className: `${pickerThemeClassName} schedule-date-picker` }}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="post-time" className="text-xs font-medium text-muted-foreground">
            Time
          </label>
          <TimePicker
            id="post-time"
            value={time}
            onChange={(value) => setTime(value)}
            placeholder="Select time"
            label="Schedule time"
            locale="en-US"
            timeFormat="HH:mm"
            times={timeOptions}
            timeIsEditable
            innerProps={{ className: pickerThemeClassName }}
          />
        </div>
      </div>

      <p className="border-t border-border-subtle pt-3 text-xs text-foreground-muted">
        Select when you want your post to go live — time is based on your local timezone.
      </p>
    </div>
  );
}
