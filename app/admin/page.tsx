"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { isSuperAdmin } from "@/lib/auth"
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Users, Shield } from "lucide-react"

interface UserData {
  id: string
  email: string
  name: string
  photoURL?: string
  isApproved: boolean
  role: string
  createdAt: any
}

export default function AdminPage() {
  const [user] = useAuthState(auth)
  const [users, setUsers] = useState<UserData[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (!user || !isSuperAdmin(user.email)) return

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData: UserData[] = []
      snapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data(),
        } as UserData)
      })
      setUsers(usersData.sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.()))
    })

    return () => unsubscribe()
  }, [user])

  const updateUserApproval = async (userId: string, isApproved: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isApproved,
      })

      toast({
        title: "Başarılı!",
        description: `Kullanıcı ${isApproved ? "onaylandı" : "onayı kaldırıldı"}.`,
      })
    } catch (error) {
      toast({
        title: "Hata!",
        description: "İşlem gerçekleştirilemedi.",
        variant: "destructive",
      })
    }
  }

  if (!user || !isSuperAdmin(user.email)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Yetkisiz Erişim</h2>
          <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    )
  }

  const approvedUsers = users.filter((u) => u.isApproved)
  const pendingUsers = users.filter((u) => !u.isApproved && u.role !== "superadmin")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Kullanıcı yönetimi ve sistem ayarları</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
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
            <CardTitle className="text-sm font-medium">Onaylı Kullanıcı</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {pendingUsers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Onay Bekleyen Kullanıcılar</CardTitle>
            <CardDescription>Sisteme erişim için onay bekleyen kullanıcılar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={userData.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{userData.name?.[0] || userData.email[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userData.name}</p>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {userData.createdAt?.toDate?.()?.toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => updateUserApproval(userData.id, true)}>
                      <Check className="h-4 w-4 mr-1" />
                      Onayla
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateUserApproval(userData.id, false)}>
                      <X className="h-4 w-4 mr-1" />
                      Reddet
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
                      {userData.isApproved ? (
                        <Badge variant="default">Onaylı</Badge>
                      ) : (
                        <Badge variant="secondary">Beklemede</Badge>
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
                    {userData.isApproved ? (
                      <Button size="sm" variant="outline" onClick={() => updateUserApproval(userData.id, false)}>
                        <X className="h-4 w-4 mr-1" />
                        Onayı Kaldır
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => updateUserApproval(userData.id, true)}>
                        <Check className="h-4 w-4 mr-1" />
                        Onayla
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
