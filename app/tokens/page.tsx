"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import { Key, Plus, Trash2, Copy, EyeOff, Eye, Activity, Settings, Calendar, Code, AlertTriangle } from "lucide-react"
import type { APIToken, APIPermission } from "@/types/api"
import { APIIntegrationGuide } from "@/components/api-integration-guide"
import Link from "next/link"

export default function TokensPage() {
  const [user, userLoading, userError] = useAuthState(auth)
  const [tokens, setTokens] = useState<APIToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState("")
  const [newTokenPermissions, setNewTokenPermissions] = useState<APIPermission[]>([
    { resource: "links", actions: ["create", "read"] },
  ])
  const [newTokenRateLimit, setNewTokenRateLimit] = useState(100)
  const [newTokenExpiry, setNewTokenExpiry] = useState("")
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    const fetchTokens = async () => {
      try {
        setLoading(true)
        setError(null)

        const q = query(collection(db, "apiTokens"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)
        const tokensData: APIToken[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          tokensData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            ...(data.expiresAt && { expiresAt: data.expiresAt.toDate() }),
            ...(data.lastUsed && { lastUsed: data.lastUsed.toDate() }),
          } as APIToken)
        })

        tokensData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setTokens(tokensData)
      } catch (error: any) {
        console.error("Error fetching tokens:", error)
        setError("Token'lar yüklenirken hata oluştu: " + (error.message || "Bilinmeyen hata"))
        toast({
          title: "Hata!",
          description: "Token'lar yüklenirken hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [user, userLoading, toast])

  const generateAPIToken = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = "lks_"
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const createToken = async () => {
    if (!user || !newTokenName.trim()) {
      toast({
        title: "Hata!",
        description: "Token adı gerekli.",
        variant: "destructive",
      })
      return
    }

    if (newTokenPermissions.length === 0) {
      toast({
        title: "Hata!",
        description: "En az bir yetki seçmelisiniz.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = generateAPIToken()
      const tokenData = {
        name: newTokenName.trim(),
        token,
        userId: user.uid,
        userEmail: user.email,
        permissions: newTokenPermissions,
        rateLimit: newTokenRateLimit,
        usageCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(newTokenExpiry && { expiresAt: new Date(newTokenExpiry) }),
      }

      const docRef = await addDoc(collection(db, "apiTokens"), tokenData)

      const newToken: APIToken = {
        id: docRef.id,
        ...tokenData,
      }

      setTokens((prev) => [newToken, ...prev])
      setCreatedToken(token)
      setNewTokenName("")
      setNewTokenPermissions([{ resource: "links", actions: ["create", "read"] }])
      setNewTokenRateLimit(100)
      setNewTokenExpiry("")
      setCreateDialogOpen(false)

      toast({
        title: "Başarılı!",
        description: "API token oluşturuldu.",
      })
    } catch (error: any) {
      console.error("Error creating token:", error)
      toast({
        title: "Hata!",
        description: "Token oluşturulurken hata oluştu: " + (error.message || "Bilinmeyen hata"),
        variant: "destructive",
      })
    }
  }

  const deleteToken = async (tokenId: string) => {
    try {
      await deleteDoc(doc(db, "apiTokens", tokenId))
      setTokens((prev) => prev.filter((t) => t.id !== tokenId))

      toast({
        title: "Başarılı!",
        description: "Token silindi.",
      })
    } catch (error: any) {
      console.error("Error deleting token:", error)
      toast({
        title: "Hata!",
        description: "Token silinirken hata oluştu: " + (error.message || "Bilinmeyen hata"),
        variant: "destructive",
      })
    }
  }

  const toggleTokenStatus = async (tokenId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "apiTokens", tokenId), {
        isActive: !isActive,
        updatedAt: new Date(),
      })

      setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, isActive: !isActive } : t)))

      toast({
        title: "Başarılı!",
        description: `Token ${!isActive ? "aktifleştirildi" : "devre dışı bırakıldı"}.`,
      })
    } catch (error: any) {
      console.error("Error updating token:", error)
      toast({
        title: "Hata!",
        description: "Token güncellenirken hata oluştu: " + (error.message || "Bilinmeyen hata"),
        variant: "destructive",
      })
    }
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    toast({
      title: "Kopyalandı!",
      description: "Token panoya kopyalandı.",
    })
  }

  const toggleTokenVisibility = (tokenId: string) => {
    setVisibleTokens((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId)
      } else {
        newSet.add(tokenId)
      }
      return newSet
    })
  }

  const updatePermission = (index: number, resource: string, actions: string[]) => {
    setNewTokenPermissions((prev) => {
      const updated = [...prev]
      updated[index] = { resource: resource as any, actions: actions as any }
      return updated
    })
  }

  const addPermission = () => {
    setNewTokenPermissions((prev) => [...prev, { resource: "stats", actions: ["read"] }])
  }

  const removePermission = (index: number) => {
    setNewTokenPermissions((prev) => prev.filter((_, i) => i !== index))
  }

  const maskToken = (token: string) => {
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
  }

  const getPermissionBadgeColor = (resource: string) => {
    switch (resource) {
      case "links":
        return "bg-blue-100 text-blue-800"
      case "stats":
        return "bg-green-100 text-green-800"
      case "tokens":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Loading state
  if (userLoading || loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Key className="h-8 w-8 animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Token'lar yükleniyor...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Error state
  if (userError) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Kimlik Doğrulama Hatası</h3>
                <p className="text-red-600 mb-4">{userError.message}</p>
                <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  // Data error state
  if (error) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Veri Yükleme Hatası</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">API Token'ları</h1>
              <p className="text-muted-foreground">Programatik erişim için API token'larınızı yönetin</p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Token
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni API Token Oluştur</DialogTitle>
                  <DialogDescription>
                    API erişimi için yeni bir token oluşturun. Token'ı güvenli bir yerde saklayın.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="tokenName">Token Adı</Label>
                    <Input
                      id="tokenName"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      placeholder="Örn: Mobil Uygulama, Website Bot"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Yetkiler</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Token'ın hangi kaynaklara erişebileceğini belirleyin
                    </p>
                    <div className="space-y-4">
                      {newTokenPermissions.map((permission, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Label className="font-medium">Kaynak:</Label>
                              <select
                                value={permission.resource}
                                onChange={(e) => updatePermission(index, e.target.value, permission.actions)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="links">Links</option>
                                <option value="stats">Stats</option>
                                <option value="tokens">Tokens</option>
                              </select>
                            </div>
                            {newTokenPermissions.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removePermission(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {["create", "read", "update", "delete"].map((action) => (
                              <div key={action} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${index}-${action}`}
                                  checked={permission.actions.includes(action as any)}
                                  onCheckedChange={(checked) => {
                                    const actions = checked
                                      ? [...permission.actions, action]
                                      : permission.actions.filter((a) => a !== action)
                                    updatePermission(index, permission.resource, actions)
                                  }}
                                />
                                <Label htmlFor={`${index}-${action}`} className="text-sm capitalize">
                                  {action}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <Button size="sm" variant="outline" onClick={addPermission}>
                        <Plus className="h-4 w-4 mr-2" />
                        Yetki Ekle
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rateLimit">Saatlik İstek Limiti</Label>
                      <Input
                        id="rateLimit"
                        type="number"
                        value={newTokenRateLimit}
                        onChange={(e) => setNewTokenRateLimit(Number.parseInt(e.target.value) || 100)}
                        min={1}
                        max={1000}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Maksimum 1000 istek/saat</p>
                    </div>

                    <div>
                      <Label htmlFor="expiry">Son Kullanma Tarihi (Opsiyonel)</Label>
                      <Input
                        id="expiry"
                        type="datetime-local"
                        value={newTokenExpiry}
                        onChange={(e) => setNewTokenExpiry(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Boş bırakılırsa süresiz</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={createToken}>Token Oluştur</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Created Token Dialog */}
        <Dialog open={!!createdToken} onOpenChange={() => setCreatedToken(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                Token Başarıyla Oluşturuldu!
              </DialogTitle>
              <DialogDescription>
                Token'ınız başarıyla oluşturuldu. Bu token'ı güvenli bir yerde saklayın - bir daha göremezsiniz!
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-orange-300">
              <div className="flex items-center justify-between">
                <code className="text-sm break-all font-mono bg-white px-2 py-1 rounded">{createdToken}</code>
                <Button size="sm" onClick={() => createdToken && copyToken(createdToken)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Önemli:</strong> Bu token'ı güvenli bir yerde saklayın. Güvenlik nedeniyle bir daha
                gösterilmeyecektir.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => setCreatedToken(null)} className="w-full">
                Anladım, Token'ı Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Token</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tokens?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{tokens?.filter((t) => t.isActive).length || 0} aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanım</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tokens?.reduce((sum, token) => sum + (token.usageCount || 0), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">API çağrısı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Limit</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tokens?.length > 0
                  ? Math.round(tokens.reduce((sum, token) => sum + token.rateLimit, 0) / tokens.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">istek/saat</p>
            </CardContent>
          </Card>
        </div>

        {/* Tokens List */}
        <Card>
          <CardHeader>
            <CardTitle>Token'larınız</CardTitle>
            <CardDescription>API erişimi için oluşturduğunuz token'lar ve kullanım durumları</CardDescription>
          </CardHeader>
          <CardContent>
            {!tokens || tokens.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Henüz API Token'ınız Yok</h3>
                <p className="text-muted-foreground mb-6">Programatik erişim için ilk API token'ınızı oluşturun</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Token'ınızı Oluşturun
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tokens.map((token) => (
                  <div key={token.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{token.name}</h3>
                          <Badge variant={token.isActive ? "default" : "secondary"}>
                            {token.isActive ? "Aktif" : "Devre Dışı"}
                          </Badge>
                          {token.expiresAt && new Date(token.expiresAt) < new Date() && (
                            <Badge variant="destructive">Süresi Dolmuş</Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          {/* Token */}
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium min-w-[60px]">Token:</span>
                            <code className="bg-muted px-3 py-1 rounded text-sm font-mono flex-1">
                              {visibleTokens.has(token.id) ? token.token : maskToken(token.token)}
                            </code>
                            <Button size="sm" variant="ghost" onClick={() => toggleTokenVisibility(token.id)}>
                              {visibleTokens.has(token.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyToken(visibleTokens.has(token.id) ? token.token : maskToken(token.token))
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Permissions */}
                          <div className="flex items-start space-x-3">
                            <span className="text-sm font-medium min-w-[60px]">Yetkiler:</span>
                            <div className="flex flex-wrap gap-2">
                              {token.permissions?.map((permission, index) => (
                                <div key={index} className="flex items-center space-x-1">
                                  <Badge variant="outline" className={getPermissionBadgeColor(permission.resource)}>
                                    {permission.resource}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ({permission.actions.join(", ")})
                                  </span>
                                </div>
                              )) || <span className="text-sm text-muted-foreground">Yetki bilgisi yok</span>}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Kullanım:</span>
                              <div className="font-medium">{token.usageCount || 0} çağrı</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Limit:</span>
                              <div className="font-medium">{token.rateLimit || 0}/saat</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Son Kullanım:</span>
                              <div className="font-medium">
                                {token.lastUsed ? new Date(token.lastUsed).toLocaleDateString("tr-TR") : "Hiç"}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Oluşturulma:</span>
                              <div className="font-medium">
                                {token.createdAt ? new Date(token.createdAt).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                              </div>
                            </div>
                          </div>

                          {/* Expiry */}
                          {token.expiresAt && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Son kullanma:</span>
                              <span
                                className={`font-medium ${
                                  new Date(token.expiresAt) < new Date()
                                    ? "text-red-600"
                                    : new Date(token.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                                      ? "text-orange-600"
                                      : "text-green-600"
                                }`}
                              >
                                {new Date(token.expiresAt).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant={token.isActive ? "outline" : "default"}
                          onClick={() => toggleTokenStatus(token.id, token.isActive)}
                        >
                          {token.isActive ? "Devre Dışı Bırak" : "Aktifleştir"}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Sil
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Token'ı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>{token.name}</strong> token'ını silmek istediğinizden emin misiniz?
                                <br />
                                <br />
                                Bu işlem geri alınamaz ve bu token'ı kullanan tüm uygulamalar çalışmayı durdurur.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteToken(token.id)}
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

        {/* API Documentation Link */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">API Dokümantasyonu</h3>
              <p className="text-muted-foreground mb-4">
                API'yi nasıl kullanacağınızı öğrenmek için dokümantasyonu inceleyin
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/docs">API Bilgileri</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/docs" target="_blank">
                    <Code className="h-4 w-4 mr-2" />
                    API Docs
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Integration Guide */}
        <div className="mt-8">
          <APIIntegrationGuide />
        </div>
      </div>
    </AuthGuard>
  )
}
