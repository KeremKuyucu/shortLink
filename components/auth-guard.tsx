"use client"

import type React from "react"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"
import { Loader2, Ban } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

async function checkUserBanStatus(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/check-ban?userId=${userId}`)
    if (!response.ok) return false
    const data = await response.json()
    return data.isBanned === true
  } catch (error) {
    console.error("Ban status check failed:", error)
    return false
  }
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, loading] = useAuthState(auth)
  const [isBanned, setIsBanned] = useState<boolean | null>(null)

  useEffect(() => {
    if (user) {
      checkUserBanStatus(user.uid).then(setIsBanned)
    } else {
      setIsBanned(false)
    }
  }, [user])

  if (loading || isBanned === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Giriş Gerekli</h2>
            <p className="text-muted-foreground">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
          </div>
        </div>
      )
    )
  }

  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Erişim Engellendi</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Hesabınız askıya alınmış durumda. Lütfen destek ekibi ile iletişime geçin.
                </p>
              </div>
              <Button onClick={() => signOut(auth)} variant="outline" className="w-full">
                Çıkış Yap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// Default export for backward compatibility
export default AuthGuard
