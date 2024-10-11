import Link from 'next/link'
import React from 'react'
import { UserButton } from "@clerk/nextjs"
import { auth } from '@clerk/nextjs/server'
import { Button } from './ui/button'

function Navbar() {
    const { userId }: { userId: string | null } = auth()
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
    <Link className="flex items-center justify-center" href="/">
      <span className="ml-2 text-lg font-bold">Social Raven</span>
    </Link>
    <nav className="ml-auto flex gap-4 sm:gap-6">
      <Link className="text-sm font-medium hover:text-orange-500 transition-colors" href="/">
        Features
      </Link>

      <Link className="text-sm font-medium hover:text-orange-500 transition-colors" href="/">
        About
      </Link>
    </nav>
    {
    (userId) ?  <div className="ml-4 flex gap-2"> <UserButton /> </div>:
    <div className="ml-4 flex gap-2">
      <Link href={"/sign-in"}>
      <Button variant="outline">Sign In</Button>
      </Link>
      
      <Link href={"/sign-up"}>
      <Button variant="secondary">Sign Up</Button>
      </Link>
    </div>
   }
  </header>
  )
}

export default Navbar