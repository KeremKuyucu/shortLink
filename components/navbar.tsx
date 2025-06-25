"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { signOut, isSuperAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, LogOut, Settings, BarChart3, Key, Code } from "lucide-react"
import NextLink from "next/link"

export function Navbar() {
  const [user] = useAuthState(auth)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <NextLink href="/" className="flex items-center space-x-2">
          <Link className="h-6 w-6" />
          <span className="font-bold">kısaLink</span>
        </NextLink>

        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <>
              <NextLink href="/dashboard">
                <Button variant="ghost" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </NextLink>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback>{user.displayName?.[0] || user.email?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NextLink href="/tokens">
                      <Key className="mr-2 h-4 w-4" />
                      <span>API Tokens</span>
                    </NextLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NextLink href="/docs">
                      <Code className="mr-2 h-4 w-4" />
                      <span>API Docs</span>
                    </NextLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isSuperAdmin(user.email) && (
                    <>
                      <DropdownMenuItem asChild>
                        <NextLink href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </NextLink>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
