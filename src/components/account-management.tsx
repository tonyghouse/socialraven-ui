import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AccountManagement() {
  // Replace this with your actual connected accounts data
  const accounts = [
    { name: "Instagram", username: "@yourbrand", avatar: "/instagram-logo.png" },
    { name: "Facebook", username: "Your Brand", avatar: "/facebook-logo.png" },
    { name: "LinkedIn", username: "Your Brand", avatar: "/linkedin-logo.png" },
    { name: "YouTube", username: "Your Brand", avatar: "/youtube-logo.png" },
    { name: "Twitter", username: "@yourbrand", avatar: "/twitter-logo.png" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts  <Link href="/connected-accounts"> <Button>Manage</Button> </Link> </CardTitle>
       
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.name} className="flex items-center space-x-4">
              {/* <Avatar>
                <AvatarImage src={account.avatar} alt={account.name} />
                <AvatarFallback>{account.name[0]}</AvatarFallback>
              </Avatar> */}
              <div>
                <p className="text-sm font-medium">{account.name}</p>
                <p className="text-xs text-muted-foreground">{account.username}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

