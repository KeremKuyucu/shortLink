"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore"
import { Loader2 } from "lucide-react"

interface RedirectClientProps {
  shortCode: string
}

export function RedirectClient({ shortCode }: RedirectClientProps) {
  const [status, setStatus] = useState<"loading" | "not-found" | "error">("loading")

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

        // Tıklama sayısını artır
        await updateDoc(doc(db, "links", linkDoc.id), {
          clicks: increment(1),
          lastClickedAt: new Date(),
        })

        // Yönlendir
        window.location.href = linkData.originalUrl
      } catch (error) {
        console.error("Redirect error:", error)
        setStatus("error")
      }
    }

    handleRedirect()
  }, [shortCode])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  if (status === "not-found") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Link bulunamadı</p>
          <p className="text-muted-foreground">Aradığınız kısaltılmış link mevcut değil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hata</h1>
        <p className="text-xl text-muted-foreground mb-4">Bir hata oluştu</p>
        <p className="text-muted-foreground">Yönlendirme işlemi sırasında bir hata oluştu.</p>
      </div>
    </div>
  )
}
