import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, LinkIcon, X } from "lucide-react"

// This would typically come from a database or API
const connectedAccounts = {
    instagram: false,
    twitter: true,
    linkedin: false,
    youtube: true,
    facebook: true,
}

const socialIcons = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    facebook: Facebook,
}

export default function SocialMediaLinking() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Link Your Social Media Accounts</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(connectedAccounts).map(([platform, isConnected]) => {
          const Icon = socialIcons[platform as keyof typeof socialIcons]
          return (
            <Card key={platform}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{platform}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="flex items-center">
                    <div className="flex-grow">
                      <CardDescription>Connected</CardDescription>
                    </div>
                    <Button variant="destructive" size="sm" className="ml-2">
                      <X className="mr-2 h-4 w-4" />
                      Unlink
                    </Button>
                  </div>
                ) : (
                  <Button variant="secondary" size="sm" className="w-full">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link {platform}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

