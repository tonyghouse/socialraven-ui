"use client"

import type React from "react"
import { Calendar, Clock } from "lucide-react"

interface ScheduleDateTimePickerProps {
  date: string
  setDate: React.Dispatch<React.SetStateAction<string>>
  time: string
  setTime: React.Dispatch<React.SetStateAction<string>>
}

export default function ScheduleDateTimePicker({ date, setDate, time, setTime }: ScheduleDateTimePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Schedule</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="date" className="text-xs font-medium text-gray-600">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="time" className="text-xs font-medium text-gray-600">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">Select when you want your post to be published</p>
    </div>
  )
}