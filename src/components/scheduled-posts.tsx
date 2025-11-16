import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ScheduledPosts() {
  // This is a mock data array. Replace it with your actual data fetching logic.
  const scheduledPosts = [
    { id: 1, title: "Summer Sale Announcement", platform: "Instagram", date: "2023-07-15" },
    { id: 2, title: "New Product Launch", platform: "Facebook", date: "2023-07-16" },
    { id: 3, title: "Company Milestone", platform: "LinkedIn", date: "2023-07-17" },
    { id: 4, title: "Tutorial Video", platform: "YouTube", date: "2023-07-18" },
    { id: 5, title: "Industry News Update", platform: "Twitter", date: "2023-07-19" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[80vh]">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="mb-4 p-3 border rounded-lg">
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">
                {post.platform} - {post.date}
              </p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

