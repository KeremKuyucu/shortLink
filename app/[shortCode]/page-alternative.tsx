"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface RedirectPageProps {
  params: {
    shortCode: string
  }
}

export default function RedirectPage({ params }: RedirectPageProps) {
  const [status, setStatus] = useState<"loading" | "redirecting" | "not-found" | "error">("loading")
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const q = query(collection(db, "links"), where("shortCode", "==", params.shortCode))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setStatus("not-found")
          return
        }

        const linkDoc = querySnapshot.docs[0]
        const linkData = linkDoc.data()

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
        console.error("Redirect error:", error)
        setStatus("error")
      }
    }

    handleRedirect()
  }, [params.shortCode])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Link kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (status === "redirecting") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold text-primary">{countdown}</div>
          <p className="text-xl">Yönlendiriliyor...</p>
          <p className="text-muted-foreground">{countdown} saniye sonra hedef sayfaya yönlendirileceksiniz</p>
        </div>
      </div>
    )
  }

  if (status === "not-found") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-2xl font-semibold">Link Bulunamadı</h2>
            <p className="text-muted-foreground max-w-md">
              Aradığınız kısaltılmış link mevcut değil veya silinmiş olabilir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold mb-4">Hata</h1>
          <p className="text-xl text-muted-foreground mb-4">Bir hata oluştu</p>
          <p className="text-muted-foreground">Yönlendirme işlemi sırasında bir hata oluştu.</p>
        </div>

        <Button asChild>
          <Link href="/">Ana Sayfaya Dön</Link>
        </Button>
      </div>
    </div>
  )
}
