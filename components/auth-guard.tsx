"use client"

import type React from "react"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { checkUserPermission } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, loading] = useAuthState(auth)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    if (user) {
      checkUserPermission(user.uid).then(setHasPermission)
    } else {
      setHasPermission(false)
    }
  }, [user])

  if (loading || hasPermission === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !hasPermission) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erişim Reddedildi</h2>
            <p className="text-muted-foreground">Bu sayfaya erişim izniniz bulunmamaktadır.</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
