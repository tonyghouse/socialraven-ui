import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Calendar, Facebook, Twitter, Instagram } from "lucide-react"

export default function Dashboard() {
  const scheduledPosts = [
    { id: 1, content: "Check out our new product launch!", date: "2024-10-15", time: "14:00", platforms: ["facebook", "twitter"] },
    { id: 2, content: "Join us for a live Q&A session", date: "2024-10-17", time: "18:30", platforms: ["instagram"] },
    { id: 3, content: "Holiday sale starts tomorrow!", date: "2024-10-20", time: "09:00", platforms: ["facebook", "twitter", "instagram"] },
  ]

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Social Raven Dashboard</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </header>
      <main>
        <h2 className="text-xl font-semibold mb-4">Upcoming Scheduled Posts</h2>
        <div className="grid gap-4">
          {scheduledPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {post.date} at {post.time}
                </CardTitle>
                <div className="flex space-x-1">
                  {post.platforms.includes("facebook") && <Facebook className="h-4 w-4" />}
                  {post.platforms.includes("twitter") && <Twitter className="h-4 w-4" />}
                  {post.platforms.includes("instagram") && <Instagram className="h-4 w-4" />}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}