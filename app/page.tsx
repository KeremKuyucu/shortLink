"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { signInWithGoogle } from "@/lib/auth"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { generateShortCode, isValidUrl } from "@/lib/utils"
import { Copy, LinkIcon, Loader2 } from "lucide-react"

export default function HomePage() {
  const [user, loading] = useAuthState(auth)
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [isShortening, setIsShortening] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast({
        title: "Başarılı!",
        description: "Google ile giriş yapıldı.",
      })
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleShortenUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Hata!",
        description: "Lütfen bir URL girin.",
        variant: "destructive",
      })
      return
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Hata!",
        description: "Geçerli bir URL girin.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Hata!",
        description: "URL kısaltmak için giriş yapmalısınız.",
        variant: "destructive",
      })
      return
    }

    setIsShortening(true)

    try {
      let shortCode = generateShortCode()

      // Benzersiz kod kontrolü
      const existingQuery = query(collection(db, "links"), where("shortCode", "==", shortCode))
      const existingDocs = await getDocs(existingQuery)

      while (!existingDocs.empty) {
        shortCode = generateShortCode()
        const newQuery = query(collection(db, "links"), where("shortCode", "==", shortCode))
        const newDocs = await getDocs(newQuery)
        if (newDocs.empty) break
      }

      await addDoc(collection(db, "links"), {
        originalUrl: url,
        shortCode,
        createdBy: user.uid,
        createdByEmail: user.email,
        clicks: 0,
        createdAt: new Date(),
      })

      const fullShortUrl = `${window.location.origin}/${shortCode}`
      setShortUrl(fullShortUrl)

      toast({
        title: "Başarılı!",
        description: "URL başarıyla kısaltıldı.",
      })
    } catch (error) {
      console.error("Error shortening URL:", error)
      toast({
        title: "Hata!",
        description: "URL kısaltılırken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsShortening(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      toast({
        title: "Kopyalandı!",
        description: "Kısaltılmış URL panoya kopyalandı.",
      })
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Kopyalama işlemi başarısız.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">LinkKısa</h1>
          <p className="text-xl text-muted-foreground">
            Uzun URL'lerinizi kısaltın ve tıklama istatistiklerini takip edin
          </p>
        </div>

        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Başlamak için giriş yapın</CardTitle>
              <CardDescription>URL kısaltma servisini kullanmak için Google hesabınızla giriş yapın</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSignIn} className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google ile Giriş Yap
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>URL Kısalt</CardTitle>
                <CardDescription>Kısaltmak istediğiniz URL'yi girin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleShortenUrl()}
                  />
                  <Button onClick={handleShortenUrl} disabled={isShortening}>
                    {isShortening ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                  </Button>
                </div>

                {shortUrl && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-2">
                        <p className="text-sm text-muted-foreground mb-1">Kısaltılmış URL:</p>
                        <p className="font-mono text-sm break-all">{shortUrl}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
