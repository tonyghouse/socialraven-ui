"use client";

import type React from "react";
import { Calendar, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  time: string;
  setTime: React.Dispatch<React.SetStateAction<string>>;
}

export default function ScheduleDateTimePicker({ date, setDate, time, setTime }: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const minDate  = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">Schedule</label>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
          <Globe className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[180px]">{timezone}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="post-date" className="text-xs font-medium text-muted-foreground">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="post-date"
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border bg-background text-foreground",
                "border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "transition-all duration-200 [color-scheme:light] dark:[color-scheme:dark]"
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="post-time" className="text-xs font-medium text-muted-foreground">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="post-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={cn(
                "w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border bg-background text-foreground",
                "border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "transition-all duration-200 [color-scheme:light] dark:[color-scheme:dark]"
              )}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Select when you want your post to go live — time is based on your local timezone.
      </p>
    </div>
  );
}
