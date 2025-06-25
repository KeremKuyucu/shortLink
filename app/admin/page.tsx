"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { isSuperAdmin, checkAdminPermission } from "@/lib/auth"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Ban, Users, Shield, Loader2, AlertTriangle, UserCheck } from "lucide-react"

interface UserData {
  id: string
  email: string
  name: string
  photoURL?: string
  isApproved: boolean
  isBanned?: boolean
  role: string
  createdAt: any
}

export default function AdminPage() {
  const [user, loading, error] = useAuthState(auth)
  const [users, setUsers] = useState<UserData[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [processingBan, setProcessingBan] = useState<string | null>(null)
  const { toast } = useToast()

  // Admin yetkisi kontrolü
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        setDebugInfo({ reason: "No user logged in" })
        return
      }

      try {
        // Debug bilgileri topla
        const debug = {
          userEmail: user.email,
          userUID: user.uid,
          superAdminEmail: process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL,
          isSuperAdminResult: isSuperAdmin(user.email),
          timestamp: new Date().toISOString(),
        }

        console.log("Admin check debug:", debug)
        setDebugInfo(debug)

        // Admin yetkisi kontrolü
        const adminPermission = await checkAdminPermission(user.uid, user.email)
        setIsAdmin(adminPermission)

        if (!adminPermission) {
          console.warn("Admin access denied for user:", user.email)
        }
      } catch (error) {
        console.error("Admin check error:", error)
        setIsAdmin(false)
        setDebugInfo({ error: error.message })
      }
    }

    checkAdmin()
  }, [user])

  // Kullanıcı verilerini yükle
  useEffect(() => {
    if (!user || isAdmin === false) {
      setDataLoading(false)
      return
    }

    if (isAdmin === true) {
      const fetchUsers = async () => {
        try {
          setDataLoading(true)
          setDataError(null)

          console.log("Fetching users data...")
          const querySnapshot = await getDocs(collection(db, "users"))
          const usersData: UserData[] = []

          querySnapshot.forEach((doc) => {
            usersData.push({
              id: doc.id,
              ...doc.data(),
            } as UserData)
          })

          // Client-side sorting
          usersData.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0)
            const bTime = b.createdAt?.toDate?.() || new Date(0)
            return bTime.getTime() - aTime.getTime()
          })

          console.log("Users data loaded:", usersData.length, "users")
          setUsers(usersData)
          setDataLoading(false)
        } catch (error: any) {
          console.error("Admin query error:", error)
          setDataError("Kullanıcı verileri yüklenirken hata oluştu: " + error.message)
          setDataLoading(false)
        }
      }

      fetchUsers()
    }
  }, [user, isAdmin])

  const updateUserBanStatus = async (userId: string, isBanned: boolean) => {
    if (processingBan) return // Prevent multiple simultaneous requests

    try {
      setProcessingBan(userId)
      const userToUpdate = users.find((u) => u.id === userId)

      console.log("Attempting to ban/unban user:", { userId, isBanned, userToUpdate })

      // Firestore'da güncelle
      await updateDoc(doc(db, "users", userId), {
        isBanned,
        updatedAt: new Date(),
        updatedBy: user?.uid,
      })

      // Local state'i güncelle
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, isBanned } : u)))

      toast({
        title: "Başarılı!",
        description: `Kullanıcı ${isBanned ? "banlandı" : "ban kaldırıldı"}.`,
      })
    } catch (error: any) {
      console.error("User ban error:", error)
      toast({
        title: "Hata!",
        description: `İşlem gerçekleştirilemedi: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setProcessingBan(null)
    }
  }

  // Loading state
  if (loading || isAdmin === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Yetki kontrolü yapılıyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Auth error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Kimlik Doğrulama Hatası</h3>
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Access denied
  if (!user || isAdmin === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 text-orange-600 mx-auto" />
              <h2 className="text-2xl font-bold text-orange-800">Yetkisiz Erişim</h2>
              <p className="text-orange-700">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>

              {/* Debug bilgileri (sadece development'ta göster) */}
              {process.env.NODE_ENV === "development" && debugInfo && (
                <div className="bg-white p-4 rounded border text-left">
                  <h4 className="font-semibold mb-2">Debug Bilgileri:</h4>
                  <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-orange-600">
                  <strong>Mevcut Email:</strong> {user?.email || "Giriş yapılmamış"}
                </p>
                <p className="text-sm text-orange-600">
                  <strong>Gerekli Email:</strong> {process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "Tanımlanmamış"}
                </p>
              </div>

              <Button onClick={() => (window.location.href = "/")}>Ana Sayfaya Dön</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Data loading
  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Admin paneli yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Data error
  if (dataError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Veri Yükleme Hatası</h3>
            <p className="text-red-600 mb-4">{dataError}</p>
            <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
          </div>
        </div>
      </div>
    )
  }

  const activeUsers = users.filter((u) => !u.isBanned)
  const bannedUsers = users.filter((u) => u.isBanned)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Kullanıcı yönetimi ve ban sistemi</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Shield className="h-3 w-3 mr-1" />
            Admin Erişimi
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banlı Kullanıcı</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{bannedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {bannedUsers.length > 0 && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Banlı Kullanıcılar</CardTitle>
            <CardDescription>Sisteme erişimi engellenmiş kullanıcılar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bannedUsers.map((userData) => (
                <div
                  key={userData.id}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={userData.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{userData.name?.[0] || userData.email[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{userData.name}</p>
                        <Badge variant="destructive">Banlı</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {userData.createdAt?.toDate?.()?.toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUserBanStatus(userData.id, false)}
                      disabled={processingBan === userData.id}
                    >
                      {processingBan === userData.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4 mr-1" />
                      )}
                      Ban Kaldır
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tüm Kullanıcılar</CardTitle>
          <CardDescription>Sistemdeki tüm kullanıcılar ve durumları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userData) => (
              <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={userData.photoURL || "/placeholder.svg"} />
                    <AvatarFallback>{userData.name?.[0] || userData.email[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{userData.name}</p>
                      {userData.role === "superadmin" && <Badge variant="destructive">Super Admin</Badge>}
                      {userData.isBanned ? (
                        <Badge variant="destructive">Banlı</Badge>
                      ) : (
                        <Badge variant="default">Aktif</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {userData.createdAt?.toDate?.()?.toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
                {userData.role !== "superadmin" && (
                  <div className="flex space-x-2">
                    {userData.isBanned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserBanStatus(userData.id, false)}
                        disabled={processingBan === userData.id}
                      >
                        {processingBan === userData.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4 mr-1" />
                        )}
                        Ban Kaldır
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateUserBanStatus(userData.id, true)}
                        disabled={processingBan === userData.id}
                      >
                        {processingBan === userData.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Ban className="h-4 w-4 mr-1" />
                        )}
                        Banla
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
