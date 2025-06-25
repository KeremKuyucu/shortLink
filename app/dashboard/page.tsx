"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, BarChart3, LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LinkData {
  id: string
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: any
}

export default function DashboardPage() {
  const [user] = useAuthState(auth)
  const [links, setLinks] = useState<LinkData[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "links"), where("createdBy", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData: LinkData[] = []
      let clicks = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        linksData.push({
          id: doc.id,
          ...data,
        } as LinkData)
        clicks += data.clicks || 0
      })

      setLinks(linksData)
      setTotalClicks(clicks)
    })

    return () => unsubscribe()
  }, [user])

  const copyToClipboard = async (shortCode: string) => {
    const fullUrl = `${window.location.origin}/${shortCode}`
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

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Kısaltılmış URL'lerinizi ve istatistiklerini görüntüleyin</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Linkleriniz</CardTitle>
            <CardDescription>Oluşturduğunuz kısaltılmış URL'ler ve tıklama istatistikleri</CardDescription>
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
                          <span className="text-sm text-muted-foreground">
                            {link.createdAt?.toDate?.()?.toLocaleDateString("tr-TR") || "Tarih bilinmiyor"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Kısa:</span>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {window.location.origin}/{link.shortCode}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
