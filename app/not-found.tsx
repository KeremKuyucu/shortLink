import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search, FileQuestion } from "lucide-react"

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">404</CardTitle>
          <p className="text-xl text-gray-600">Sayfa Bulunamadı</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Link>
            </Button>

            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard">
                <Search className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
