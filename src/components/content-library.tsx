import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ContentLibrary() {
  // Replace this with your actual content library data
  const contentItems = [
    { id: 1, type: "Image", name: "Product Showcase.jpg" },
    { id: 2, type: "Video", name: "Brand Story.mp4" },
    { id: 3, type: "Text", name: "Summer Campaign Copy.docx" },
    { id: 4, type: "Image", name: "Team Photo.jpg" },
    { id: 5, type: "Video", name: "Product Tutorial.mp4" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Library</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {contentItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 mb-4">
              <div className="bg-muted p-2 rounded-md">
                {item.type === "Image" && "🖼️"}
                {item.type === "Video" && "🎥"}
                {item.type === "Text" && "📄"}
              </div>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.type}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

