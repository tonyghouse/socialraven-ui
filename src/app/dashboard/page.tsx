'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Facebook, Twitter, Linkedin, Youtube, Trash2, Edit, Image as ImageIcon } from "lucide-react"
import { useDropzone } from 'react-dropzone'

type Platform = 'Facebook' | 'Twitter' | 'LinkedIn' | 'YouTube'
type ScheduledPost = {
  id: string
  title: string
  description: string
  media?: File
  scheduledTime: Date
  platforms: Platform[]
  tags: string[]
}

const platformIcons = {
  Facebook: <Facebook className="h-4 w-4 text-blue-600" />,
  Twitter: <Twitter className="h-4 w-4 text-sky-500" />,
  LinkedIn: <Linkedin className="h-4 w-4 text-blue-700" />,
  YouTube: <Youtube className="h-4 w-4 text-red-600" />
}

const platformCharacterLimits = {
  Twitter: 280,
  Facebook: 63206,
  LinkedIn: 3000,
  YouTube: 5000
}

export default function Component() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [media, setMedia] = useState<File | null>(null)
  const [scheduledTime, setScheduledTime] = useState<Date | undefined>(undefined)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setMedia(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 })

  const handlePlatformToggle = (platform: Platform) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !scheduledTime || platforms.length === 0) {
      alert('Please fill in all required fields and select at least one platform.')
      return
    }
    const newPost: ScheduledPost = {
      id: editingPost ? editingPost.id : Date.now().toString(),
      title,
      description,
      media: media || undefined,
      scheduledTime,
      platforms,
      tags
    }
    if (editingPost) {
      setScheduledPosts(prev => prev.map(post => post.id === editingPost.id ? newPost : post))
      setEditingPost(null)
    } else {
      setScheduledPosts(prev => [...prev, newPost])
    }
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setMedia(null)
    setScheduledTime(undefined)
    setPlatforms([])
    setTags([])
    setCurrentTag('')
  }

  const handleEdit = (post: ScheduledPost) => {
    setEditingPost(post)
    setTitle(post.title)
    setDescription(post.description)
    setMedia(post.media || null)
    setScheduledTime(post.scheduledTime)
    setPlatforms(post.platforms)
    setTags(post.tags)
  }

  const handleDelete = (id: string) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== id))
  }

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags(prev => [...prev, currentTag])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required
              />
              <div className="text-sm text-muted-foreground mt-1">
                {platforms.map(platform => (
                  <span key={platform} className="mr-2">
                    {platform}: {description.length}/{platformCharacterLimits[platform]} characters
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label>Media (optional)</Label>
              <div {...getRootProps()} className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>Drag and drop an image here, or click to select one</p>
                )}
                {media && <p className="mt-2">{media.name}</p>}
              </div>
            </div>
            <div>
              <Label>Scheduled Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledTime ? format(scheduledTime, "PPP HH:mm") : <span>Pick a date and time</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledTime}
                    onSelect={setScheduledTime}
                    initialFocus
                  />
                  <div className="p-2">
                    <Input
                      type="time"
                      value={scheduledTime ? format(scheduledTime, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const newDate = scheduledTime || new Date()
                        newDate.setHours(parseInt(hours), parseInt(minutes))
                        setScheduledTime(newDate)
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {Object.entries(platformIcons).map(([platform, icon]) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox 
                      id={platform} 
                      checked={platforms.includes(platform as Platform)}
                      onCheckedChange={() => handlePlatformToggle(platform as Platform)}
                    />
                    <Label htmlFor={platform} className="flex items-center space-x-1">
                      {icon}
                      <span>{platform}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="tags" 
                  value={currentTag} 
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag}>Add Tag</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 text-muted-foreground hover:text-foreground">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <Button type="submit">{editingPost ? 'Update Post' : 'Schedule Post'}</Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Post Preview</h2>
        <Tabs defaultValue="Facebook">
          <TabsList>
            {platforms.map(platform => (
              <TabsTrigger key={platform} value={platform}>
                {platformIcons[platform]}
                <span className="ml-2">{platform}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {platforms.map(platform => (
            <TabsContent key={platform} value={platform}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {platformIcons[platform]}
                    <span className="font-semibold">{platform} Preview</span>
                  </div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-sm">{description}</p>
                  {media && (
                    <div className="mt-2">
                      <img src={URL.createObjectURL(media)} alt="Preview" className="max-w-full h-auto rounded" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Scheduled Posts</h2>
        {scheduledPosts.length === 0 ? (
          <p>No posts scheduled yet.</p>
        ) : (
          <div className="space-y-4">
            {scheduledPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(post.scheduledTime, "PPP HH:mm")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    {post.platforms.map(platform => (
                      <span key={platform}>{platformIcons[platform]}</span>
                    ))}
                  </div>
                  {post.media && (
                    <div className="mt-2 flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{post.media.name}</span>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}