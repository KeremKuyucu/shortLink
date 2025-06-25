"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ClientRedirectProps {
  shortCode: string
}

export function ClientRedirect({ shortCode }: ClientRedirectProps) {
  const [status, setStatus] = useState<"loading" | "redirecting" | "not-found" | "error">("loading")
  const [countdown, setCountdown] = useState(3)
  const [targetUrl, setTargetUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const q = query(collection(db, "links"), where("shortCode", "==", shortCode))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setStatus("not-found")
          return
        }

        const linkDoc = querySnapshot.docs[0]
        const linkData = linkDoc.data()
        setTargetUrl(linkData.originalUrl)
        setStatus("redirecting")

        // Tıklama sayısını artır
        await updateDoc(doc(db, "links", linkDoc.id), {
          clicks: increment(1),
          lastClickedAt: new Date(),
        })

        // 3 saniye geri sayım
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              window.location.href = linkData.originalUrl
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      } catch (error) {
        console.error("Client redirect error:", error)
        setStatus("error")
      }
    }

    handleRedirect()
  }, [shortCode])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Kontrol Ediliyor...</h2>
            <p className="text-sm text-gray-600 text-center">Kısaltılmış link doğrulanıyor, lütfen bekleyin.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "redirecting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-6xl font-bold text-blue-600 mb-4">{countdown}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Yönlendiriliyor...</h2>
            <p className="text-gray-600 mb-4">{countdown} saniye sonra hedef sayfaya yönlendirileceksiniz</p>

            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-500 mb-1">Hedef URL:</p>
              <p className="text-sm font-mono break-all">{targetUrl}</p>
            </div>

            <Button onClick={() => (window.location.href = targetUrl)} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Hemen Git
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "not-found") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-6xl font-bold text-red-600 mb-4">404</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Bulunamadı</h2>
            <p className="text-gray-600 mb-6">
              <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code> kısa linki mevcut değil.
            </p>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Ana Sayfa</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Bir Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">Link yönlendirme işlemi sırasında bir hata meydana geldi.</p>

          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Tekrar Dene
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Ana Sayfa</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
