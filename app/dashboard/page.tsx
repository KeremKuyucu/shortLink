"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, limit, doc, deleteDoc } from "firebase/firestore"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Copy,
  ExternalLink,
  BarChart3,
  LinkIcon,
  Loader2,
  AlertCircle,
  Trash2,
  Key,
  Activity,
  Code,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IndexHelper } from "@/components/index-helper"
import Link from "next/link"

interface LinkData {
  id: string
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: any
  isCustom?: boolean
}

export default function DashboardPage() {
  const [user] = useAuthState(auth)
  const [links, setLinks] = useState<LinkData[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexError, setIndexError] = useState(false)
  const [deletingLinks, setDeletingLinks] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const [showIndexHelper, setShowIndexHelper] = useState(false)
  const [apiTokenCount, setApiTokenCount] = useState(0)
  const [activeTokenCount, setActiveTokenCount] = useState(0)
  const [totalApiUsage, setTotalApiUsage] = useState(0)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchLinks = async () => {
      try {
        setLoading(true)
        setError(null)
        setIndexError(false)

        // Önce basit query ile dene (sadece where clause)
        const simpleQuery = query(collection(db, "links"), where("createdBy", "==", user.uid), limit(100))

        const querySnapshot = await getDocs(simpleQuery)
        const linksData: LinkData[] = []
        let clicks = 0

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          linksData.push({
            id: doc.id,
            ...data,
          } as LinkData)
          clicks += data.clicks || 0
        })

        // Client-side'da sıralama yap
        linksData.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0)
          const bTime = b.createdAt?.toDate?.() || new Date(0)
          return bTime.getTime() - aTime.getTime()
        })

        setLinks(linksData)
        setTotalClicks(clicks)
        setLoading(false)
      } catch (error: any) {
        console.error("Dashboard query error:", error)
        setLoading(false)

        if (error.code === "failed-precondition") {
          setIndexError(true)
          setError("Firestore index eksik. Basit sorgu kullanılıyor.")

          // Fallback: Index gerektirmeyen basit query
          try {
            const fallbackQuery = query(collection(db, "links"), where("createdBy", "==", user.uid))
            const fallbackSnapshot = await getDocs(fallbackQuery)
            const fallbackData: LinkData[] = []
            let fallbackClicks = 0

            fallbackSnapshot.forEach((doc) => {
              const data = doc.data()
              fallbackData.push({
                id: doc.id,
                ...data,
              } as LinkData)
              fallbackClicks += data.clicks || 0
            })

            // Client-side sorting
            fallbackData.sort((a, b) => {
              const aTime = a.createdAt?.toDate?.() || new Date(0)
              const bTime = b.createdAt?.toDate?.() || new Date(0)
              return bTime.getTime() - aTime.getTime()
            })

            setLinks(fallbackData)
            setTotalClicks(fallbackClicks)
            setError(null)
          } catch (fallbackError) {
            setError("Veriler yüklenirken hata oluştu")
          }
        } else {
          setError("Dashboard yüklenirken hata oluştu")
        }
      }

      // API token istatistiklerini getir
      try {
        const tokensQuery = query(collection(db, "apiTokens"), where("userId", "==", user.uid))
        const tokensSnapshot = await getDocs(tokensQuery)

        let activeCount = 0
        let totalUsage = 0

        tokensSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.isActive) activeCount++
          totalUsage += data.usageCount || 0
        })

        setApiTokenCount(tokensSnapshot.size)
        setActiveTokenCount(activeCount)
        setTotalApiUsage(totalUsage)
      } catch (error) {
        console.error("Error fetching API stats:", error)
      }
    }

    fetchLinks()
  }, [user])

  const copyToClipboard = async (shortCode: string) => {
    const fullUrl = `https://kisalink.icu/
${shortCode}`
    try {
      await navigator.clipboard.writeText(fullUrl)
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

  const deleteLink = async (linkId: string, shortCode: string) => {
    if (!user) return

    setDeletingLinks((prev) => new Set(prev).add(linkId))

    try {
      // Firestore'dan direkt sil
      await deleteDoc(doc(db, "links", linkId))

      // Local state'den kaldır
      setLinks((prevLinks) => {
        const updatedLinks = prevLinks.filter((link) => link.id !== linkId)
        // Toplam tıklama sayısını yeniden hesapla
        const newTotalClicks = updatedLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
        setTotalClicks(newTotalClicks)
        return updatedLinks
      })

      toast({
        title: "Başarılı!",
        description: `${shortCode} linki silindi.`,
      })
    } catch (error) {
      console.error("Link silme hatası:", error)
      toast({
        title: "Hata!",
        description: "Link silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setDeletingLinks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(linkId)
        return newSet
      })
    }
  }

  const createIndex = () => {
    const indexUrl =
      "https://console.firebase.google.com/v1/r/project/keremkk-auth/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9rZXJlbWtrLWF1dGgvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xpbmtzL2luZGV4ZXMvXxABGg0KCWNyZWF0ZWRCeRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI"
    window.open(indexUrl, "_blank")
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Dashboard yükleniyor...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Kısaltılmış URL'lerinizi ve istatistiklerini görüntüleyin</p>
        </div>

        {/* Index Warning */}
        {indexError && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-2">Firestore Index Eksik</h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Optimal performans için Firestore index'i oluşturulması gerekiyor. Şu anda basit sorgu kullanılıyor.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setShowIndexHelper(true)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Index Kurulum Rehberi
                    </Button>
                    <Button size="sm" variant="outline" onClick={createIndex}>
                      Hızlı Oluştur
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && !indexError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-red-100 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Hata</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Link</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{links.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Tıklama</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{links.length > 0 ? Math.round(totalClicks / links.length) : 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Tokens</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiTokenCount}</div>
              <p className="text-xs text-muted-foreground">{activeTokenCount} aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Kullanımı</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApiUsage}</div>
              <p className="text-xs text-muted-foreground">toplam çağrı</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Linkleriniz</CardTitle>
            <CardDescription>
              Oluşturduğunuz kısaltılmış URL'ler ve tıklama istatistikleri
              {indexError && <span className="text-orange-600 ml-2">(Basit sorgu kullanılıyor)</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz hiç link kısaltmadınız.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <div key={link.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">{link.clicks} tıklama</Badge>
                          {link.isCustom && <Badge variant="outline">Özel URL</Badge>}
                          <span className="text-sm text-muted-foreground">
                            {link.createdAt?.toDate?.()?.toLocaleDateString("tr-TR") || "Tarih bilinmiyor"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Kısa:</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {`https://kisalink.icu/${link.shortCode}`}
                            </code>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Orijinal:</span>
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate max-w-md"
                            >
                              {link.originalUrl}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.shortCode)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingLinks.has(link.id)}
                            >
                              {deletingLinks.has(link.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Link'i Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>{link.shortCode}</strong> kısa linkini silmek istediğinizden emin misiniz?
                                <br />
                                <br />
                                <div className="bg-gray-100 p-3 rounded text-sm">
                                  <div>
                                    <strong>Kısa Link:</strong> {window.location.origin}/{link.shortCode}
                                  </div>
                                  <div className="mt-1">
                                    <strong>Toplam Tıklama:</strong> {link.clicks}
                                  </div>
                                  <div className="mt-1">
                                    <strong>Hedef:</strong>{" "}
                                    <span className="break-all">
                                      {link.originalUrl.length > 60
                                        ? `${link.originalUrl.substring(0, 60)}...`
                                        : link.originalUrl}
                                    </span>
                                  </div>
                                </div>
                                <br />
                                Bu işlem <strong>geri alınamaz</strong> ve link artık çalışmayacaktır.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteLink(link.id, link.shortCode)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Erişimi</CardTitle>
            <CardDescription>Programatik erişim için API token'larınızı yönetin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Toplam Token:</span>
                  <div className="font-medium">{apiTokenCount}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">API Kullanımı:</span>
                  <div className="font-medium">{totalApiUsage} çağrı</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href="/tokens">
                    <Key className="h-4 w-4 mr-2" />
                    Token Yönetimi
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/docs">
                    <Code className="h-4 w-4 mr-2" />
                    API Docs
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <IndexHelper show={showIndexHelper} onClose={() => setShowIndexHelper(false)} />
    </AuthGuard>
  )
}
