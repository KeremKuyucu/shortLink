import { redirect } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore"

interface RedirectPageProps {
  params: {
    shortCode: string
  }
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = params

  try {
    // Kısa kodu veritabanında ara
    const q = query(collection(db, "links"), where("shortCode", "==", shortCode))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // Link bulunamadı
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

    const linkDoc = querySnapshot.docs[0]
    const linkData = linkDoc.data()

    // Tıklama sayısını artır
    await updateDoc(doc(db, "links", linkDoc.id), {
      clicks: increment(1),
    })

    // Orijinal URL'ye yönlendir
    redirect(linkData.originalUrl)
  } catch (error) {
    console.error("Redirect error:", error)

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
}
