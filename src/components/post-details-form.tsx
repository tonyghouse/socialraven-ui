"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PostDetailsFormProps {
  title: string
  setTitle: React.Dispatch<React.SetStateAction<string>>
  description: string
  setDescription: React.Dispatch<React.SetStateAction<string>>
}

export default function PostDetailsForm({ title, setTitle, description, setDescription }: PostDetailsFormProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <Label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Add a title for your post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 bg-background border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="description" className="text-sm font-medium">
          Content <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="What's on your mind? Share your message..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-32 resize-none bg-background border-border transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground">{description.length} characters</p>
      </div>
    </div>
  )
}
