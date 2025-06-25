import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Yönlendiriliyor...</h2>
          <p className="text-sm text-gray-600 text-center">
            Link kontrol ediliyor ve hedef sayfaya yönlendiriliyorsunuz.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
