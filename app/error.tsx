"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Hata loglaması
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Bir Hata Oluştu</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Üzgünüz, beklenmeyen bir hata meydana geldi. Lütfen tekrar deneyin.</p>

          {process.env.NODE_ENV === "development" && (
            <div className="text-left bg-gray-100 p-3 rounded text-xs font-mono text-gray-700">{error.message}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>

            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
