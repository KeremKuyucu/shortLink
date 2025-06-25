import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search, AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Link Bulunamadı</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Aradığınız kısaltılmış link mevcut değil veya silinmiş olabilir.</p>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Şunları deneyebilirsiniz:</p>
            <ul className="text-sm text-gray-500 text-left space-y-1">
              <li>• URL'yi doğru yazdığınızdan emin olun</li>
              <li>• Link'in hala aktif olduğunu kontrol edin</li>
              <li>• Ana sayfadan yeni bir link oluşturun</li>
            </ul>
          </div>

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
