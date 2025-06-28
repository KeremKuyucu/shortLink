"use client"
import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { signInWithGoogle, checkUserPermission } from "@/lib/auth"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { generateShortCode, isValidUrl } from "@/lib/utils"
import { Copy, LinkIcon, Loader2, Github, Shield, Zap, Code, Ban } from "lucide-react"
import Link from "next/link"
import { APIShowcase } from "@/components/api-showcase"
import { QuickStats } from "@/components/quick-stats"
import { useEffect } from "react"
import { sendAnalyticsEvent } from "@/lib/analytics";

export default function HomePage() {
  const [user, loading] = useAuthState(auth)
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [isShortening, setIsShortening] = useState(false)
  const [userPermission, setUserPermission] = useState<boolean | null>(null)
  const { toast } = useToast()

  const [customUrl, setCustomUrl] = useState("")
  const [useCustomUrl, setUseCustomUrl] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [customUrlError, setCustomUrlError] = useState("")
  const [hasSentPageView, setHasSentPageView] = useState(false);

  // ... diğer state'leriniz ...

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!hasSentPageView) {
      sendAnalyticsEvent(
        '/page/view',
        user ? user.uid : 'hesapsız',
      );
      setHasSentPageView(true); 
    }
    if (user) {
      checkUserPermission(user.uid).then(setUserPermission);
    } else {
      setUserPermission(null);
    }
  }, [user, loading, hasSentPageView]);

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

  const isValidCustomUrl = (url: string) => {
    const regex = /^[a-z0-9\-_]{3,20}$/
    return regex.test(url)
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

    // Ban kontrolü
    if (userPermission === false) {
      toast({
        title: "Erişim Engellendi!",
        description: "Hesabınız askıya alınmış durumda. URL kısaltamazsınız.",
        variant: "destructive",
      })
      return
    }

    // Özel URL validasyonu
    if (useCustomUrl) {
      if (!customUrl.trim()) {
        toast({
          title: "Hata!",
          description: "Özel URL girin veya otomatik oluşturma seçeneğini seçin.",
          variant: "destructive",
        })
        return
      }

      if (!isValidCustomUrl(customUrl)) {
        toast({
          title: "Hata!",
          description:
            "Özel URL sadece harf, rakam, tire (-) ve alt çizgi (_) içerebilir. 3-20 karakter arası olmalıdır.",
          variant: "destructive",
        })
        return
      }
    }

    setIsShortening(true)

    try {
      let shortCode = useCustomUrl ? customUrl.toLowerCase() : generateShortCode()

      // Benzersiz kod kontrolü
      const existingQuery = query(collection(db, "links"), where("shortCode", "==", shortCode))
      const existingDocs = await getDocs(existingQuery)

      if (!existingDocs.empty) {
        if (useCustomUrl) {
          toast({
            title: "Hata!",
            description: "Bu özel URL zaten kullanılıyor. Lütfen farklı bir URL deneyin.",
            variant: "destructive",
          })
          setIsShortening(false)
          return
        } else {
          // Otomatik kod için yeni kod üret
          while (!existingDocs.empty) {
            shortCode = generateShortCode()
            const newQuery = query(collection(db, "links"), where("shortCode", "==", shortCode))
            const newDocs = await getDocs(newQuery)
            if (newDocs.empty) break
          }
        }
      }

      const linkData = {
        originalUrl: url,
        shortCode,
        createdBy: user.uid,
        createdByEmail: user.email,
        clicks: 0,
        isCustom: useCustomUrl,
        createdAt: new Date(),
      }

      await addDoc(collection(db, "links"), linkData)

      const fullShortUrl = `${window.location.origin}/${shortCode}`
      setShortUrl(fullShortUrl)

      // Form'u temizle
      setUrl("")
      setCustomUrl("")
      setUseCustomUrl(false)

      toast({
        title: "Başarılı!",
        description: "URL başarıyla kısaltıldı.",
      })
    } catch (error) {
      console.error("Error shortening URL:", error)
      toast({
        title: "Hata!",
        description: "URL kısaltılırken bir hata oluştu. Hesabınız askıya alınmış olabilir.",
        variant: "destructive",
      })
    } finally {
      setIsShortening(false)
    }
  }

  const checkCustomUrlAvailability = async (customUrl: string) => {
    if (!customUrl.trim() || !isValidCustomUrl(customUrl)) {
      setCustomUrlError("")
      return
    }

    setIsCheckingAvailability(true)
    setCustomUrlError("")

    try {
      const q = query(collection(db, "links"), where("shortCode", "==", customUrl.toLowerCase()))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setCustomUrlError("Bu URL zaten kullanılıyor")
      } else {
        setCustomUrlError("")
      }
    } catch (error) {
      console.error("Error checking availability:", error)
    } finally {
      setIsCheckingAvailability(false)
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

  // Banlı kullanıcı kontrolü
  if (user && userPermission === false) {
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
              <Button onClick={() => auth.signOut()} variant="outline" className="w-full">
                Çıkış Yap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">kısaLink</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Açık kaynak kodlu, ücretsiz URL kısaltma servisi
          </p>
        </div>

        {/* Quick Stats */}
        {user && userPermission !== false && (
          <div className="max-w-2xl mx-auto mb-12">
            <QuickStats />
          </div>
        )}

        {/* Main Content */}
        {!user ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Başlamak için giriş yapın</CardTitle>
              <CardDescription>
                Açık kaynak URL kısaltma servisini kullanmak için Google hesabınızla giriş yapın
              </CardDescription>
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
        ) : userPermission !== false ? (
          <div className="space-y-6 max-w-2xl mx-auto">
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

                {/* Özel URL Seçeneği */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useCustomUrl"
                      checked={useCustomUrl}
                      onChange={(e) => {
                        setUseCustomUrl(e.target.checked)
                        if (!e.target.checked) {
                          setCustomUrl("")
                          setCustomUrlError("")
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="useCustomUrl" className="text-sm font-medium">
                      Özel kısa URL kullan
                    </label>
                  </div>

                  {useCustomUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{window.location.origin}/</span>
                        <Input
                          type="text"
                          placeholder="ozel-url"
                          value={customUrl}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, "")
                            setCustomUrl(value)
                            if (value.length >= 3) {
                              checkCustomUrlAvailability(value)
                            } else {
                              setCustomUrlError("")
                            }
                          }}
                          className={`flex-1 ${customUrlError ? "border-red-500" : ""}`}
                          maxLength={20}
                        />
                        {isCheckingAvailability && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>

                      {customUrlError && <p className="text-sm text-red-500">{customUrlError}</p>}

                      <p className="text-xs text-muted-foreground">
                        Sadece harf, rakam, tire (-) ve alt çizgi (_) kullanabilirsiniz. 3-20 karakter arası.
                      </p>
                    </div>
                  )}
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
        ) : null}

      </div>
    </div>
  )
}
