"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock } from "lucide-react"

interface ScheduleDateTimePickerProps {
  date: string
  setDate: React.Dispatch<React.SetStateAction<string>>
  time: string
  setTime: React.Dispatch<React.SetStateAction<string>>
}

export default function ScheduleDateTimePicker({ date, setDate, time, setTime }: ScheduleDateTimePickerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Schedule</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="date" className="text-sm font-medium">
            Date <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 h-10 bg-background border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="time" className="text-sm font-medium">
            Time <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-10 h-10 bg-background border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Select when you want your post to be published</p>
    </div>
  )
}
