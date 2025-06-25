"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, LinkIcon, Key, Activity, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"

export function QuickStats() {
  const [user, userLoading, userError] = useAuthState(auth)
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    apiTokens: 0,
    apiUsage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        setError(null)

        // Önce kullanıcı durumunu kontrol et
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists()) {
          throw new Error("Kullanıcı verisi bulunamadı")
        }

        const userData = userDoc.data()
        if (userData.isBanned) {
          throw new Error("Hesabınız askıya alınmış")
        }

        if (!userData.isApproved) {
          throw new Error("Hesabınız henüz onaylanmamış")
        }

        // Links istatistikleri
        try {
          const linksQuery = query(collection(db, "links"), where("createdBy", "==", user.uid))
          const linksSnapshot = await getDocs(linksQuery)

          let totalClicks = 0
          linksSnapshot.forEach((doc) => {
            totalClicks += doc.data().clicks || 0
          })

          setStats((prev) => ({
            ...prev,
            totalLinks: linksSnapshot.size,
            totalClicks,
          }))
        } catch (linksError) {
          console.warn("Links stats error:", linksError)
          // Links hatası olsa da devam et
        }

        // API token istatistikleri
        try {
          const tokensQuery = query(collection(db, "apiTokens"), where("userId", "==", user.uid))
          const tokensSnapshot = await getDocs(tokensQuery)

          let apiUsage = 0
          tokensSnapshot.forEach((doc) => {
            apiUsage += doc.data().usageCount || 0
          })

          setStats((prev) => ({
            ...prev,
            apiTokens: tokensSnapshot.size,
            apiUsage,
          }))
        } catch (tokensError) {
          console.warn("Tokens stats error:", tokensError)
          // Token hatası olsa da devam et
        }
      } catch (error: any) {
        console.error("Error fetching quick stats:", error)
        setError(error.message || "İstatistikler yüklenirken hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, userLoading])

  if (userError) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-600 text-sm">Kimlik doğrulama hatası</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user || loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Hızlı İstatistikler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            İstatistik Hatası
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Hızlı İstatistikler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalLinks}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <LinkIcon className="h-3 w-3" />
              Toplam Link
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalClicks}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Toplam Tıklama
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.apiTokens}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Key className="h-3 w-3" />
              API Token
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.apiUsage}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Activity className="h-3 w-3" />
              API Çağrısı
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button asChild size="sm">
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Detaylı İstatistikler
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/tokens">
              <Key className="h-4 w-4 mr-2" />
              API Yönetimi
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
