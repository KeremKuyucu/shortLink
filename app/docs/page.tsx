"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Code, Key, Shield, Zap, Clock, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function APIDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(label)
    setTimeout(() => setCopiedCode(null), 2000)
    toast({
      title: "Kopyalandı!",
      description: `${label} kodu panoya kopyalandı.`,
    })
  }

  const endpoints = [
    {
      method: "POST",
      path: "/api/v1/links",
      title: "Link Oluştur",
      description: "Yeni bir kısaltılmış link oluşturur",
      permissions: ["links:create"],
      requestBody: {
        originalUrl: "string (required) - Kısaltılacak URL",
        customUrl: "string (optional) - Özel kısa URL",
      },
      response: {
        success: true,
        data: {
          id: "doc_id",
          originalUrl: "https://example.com/very-long-url",
          shortCode: "abc123",
          shortUrl: "https://link.keremkk.com.tr/abc123",
          isCustom: false,
          clicks: 0,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      },
    },
    {
      method: "GET",
      path: "/api/v1/links",
      title: "Link'leri Listele",
      description: "Kullanıcının tüm link'lerini listeler",
      permissions: ["links:read"],
      queryParams: {
        page: "number (optional) - Sayfa numarası (default: 1)",
        limit: "number (optional) - Sayfa başına kayıt (max: 100, default: 10)",
      },
      response: {
        success: true,
        data: [
          {
            id: "doc_id",
            originalUrl: "https://example.com",
            shortCode: "abc123",
            shortUrl: "https://link.keremkk.com.tr/abc123",
            clicks: 42,
            isCustom: false,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      },
    },
    {
      method: "GET",
      path: "/api/v1/links/{id}",
      title: "Link Detayı",
      description: "Belirli bir link'in detaylarını getirir",
      permissions: ["links:read"],
      response: {
        success: true,
        data: {
          id: "doc_id",
          originalUrl: "https://example.com",
          shortCode: "abc123",
          shortUrl: "https://link.keremkk.com.tr/abc123",
          clicks: 42,
          isCustom: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          lastClickedAt: "2024-01-01T12:00:00.000Z",
        },
      },
    },
    {
      method: "DELETE",
      path: "/api/v1/links/{id}",
      title: "Link Sil",
      description: "Belirli bir link'i siler",
      permissions: ["links:delete"],
      response: {
        success: true,
        message: "Link deleted successfully",
      },
    },
    {
      method: "GET",
      path: "/api/v1/stats",
      title: "İstatistikler",
      description: "Kullanıcının link istatistiklerini getirir",
      permissions: ["stats:read"],
      response: {
        success: true,
        data: {
          totalLinks: 25,
          totalClicks: 1250,
          recentLinks: [
            {
              id: "doc_id",
              shortCode: "abc123",
              originalUrl: "https://example.com",
              clicks: 42,
              createdAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          clicksOverTime: [
            {
              date: "2024-01-01",
              clicks: 150,
            },
          ],
        },
      },
    },
    {
      method: "POST",
      path: "/api/v1/tokens",
      title: "Token Oluştur",
      description: "Yeni API token oluşturur",
      permissions: ["tokens:create"],
      requestBody: {
        name: "string (required) - Token adı",
        permissions: "array (required) - Token yetkileri",
        rateLimit: "number (optional) - Saatlik limit (default: 100)",
        expiresAt: "string (optional) - Son kullanma tarihi",
      },
      response: {
        success: true,
        data: {
          id: "token_id",
          name: "My API Token",
          token: "lks_abc123...",
          permissions: [
            {
              resource: "links",
              actions: ["create", "read"],
            },
          ],
          rateLimit: 100,
          usageCount: 0,
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        message: "Token created successfully. Save it securely - you won't see it again!",
      },
    },
  ]

  const errorCodes = [
    { code: 400, title: "Bad Request", description: "Geçersiz istek parametreleri" },
    { code: 401, title: "Unauthorized", description: "Geçersiz veya eksik token" },
    { code: 403, title: "Forbidden", description: "Yetersiz yetki" },
    { code: 404, title: "Not Found", description: "Kaynak bulunamadı" },
    { code: 409, title: "Conflict", description: "Özel URL zaten kullanılıyor" },
    { code: 429, title: "Too Many Requests", description: "Rate limit aşıldı" },
    { code: 500, title: "Internal Server Error", description: "Sunucu hatası" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 rounded-lg p-3">
            <Code className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">LinkKısa API</h1>
            <p className="text-xl text-muted-foreground">RESTful API Dokümantasyonu</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            v1.0.0
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Shield className="h-3 w-3 mr-1" />
            Token Auth
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Zap className="h-3 w-3 mr-1" />
            Rate Limited
          </Badge>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Hızlı Başlangıç
          </CardTitle>
          <CardDescription>3 adımda API'yi kullanmaya başlayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">1. Token Oluştur</h3>
              <p className="text-sm text-muted-foreground mb-3">API erişimi için token oluşturun</p>
              <Button asChild size="sm">
                <Link href="/tokens">Token Oluştur</Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Code className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">2. İlk İstek</h3>
              <p className="text-sm text-muted-foreground mb-3">API'ye ilk isteğinizi gönderin</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => document.getElementById("endpoints")?.scrollIntoView()}
              >
                Endpoint'leri Gör
              </Button>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">3. Entegre Et</h3>
              <p className="text-sm text-muted-foreground mb-3">Uygulamanıza entegre edin</p>
              <Button asChild size="sm" variant="outline">
<<<<<<< HEAD
                <Link href="https://github.com/keremkk/shortLink/wiki/API" target="_blank">
=======
                <Link href="https://github.com/keremkk/link-shortener/wiki/API" target="_blank">
>>>>>>> 5c5b36df51964fda8c0391a178f607c2b08f1c0d
                  GitHub Wiki
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Kimlik Doğrulama
          </CardTitle>
          <CardDescription>API'ye güvenli erişim için token tabanlı kimlik doğrulama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Bearer Token</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Tüm API isteklerinde Authorization header'ında Bearer token kullanın.
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-sm">Authorization: Bearer lks_your_token_here</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                  onClick={() => copyCode("Authorization: Bearer lks_your_token_here", "Auth Header")}
                >
                  {copiedCode === "Auth Header" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Güvenlik Uyarısı</h4>
                  <p className="text-sm text-yellow-700">
                    Token'ınızı güvenli tutun ve asla public repository'lerde paylaşmayın. Environment variable
                    kullanın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rate Limiting
          </CardTitle>
          <CardDescription>API kullanım limitleri ve kısıtlamaları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Limitler</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Varsayılan Limit:</span>
                  <Badge variant="outline">100 req/hour</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Maksimum Limit:</span>
                  <Badge variant="outline">1000 req/hour</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Burst Limit:</span>
                  <Badge variant="outline">10 req/min</Badge>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Response Headers</h4>
              <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                <div>X-RateLimit-Limit: 100</div>
                <div>X-RateLimit-Remaining: 95</div>
                <div>X-RateLimit-Reset: 1640995200</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div id="endpoints">
        <h2 className="text-2xl font-bold mb-6">API Endpoint'leri</h2>

        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        endpoint.method === "GET"
                          ? "bg-blue-100 text-blue-800"
                          : endpoint.method === "POST"
                            ? "bg-green-100 text-green-800"
                            : endpoint.method === "DELETE"
                              ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"
                      }
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm">{endpoint.path}</code>
                  </CardTitle>
                  <div className="flex gap-1">
                    {endpoint.permissions.map((perm, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="request" className="w-full">
                  <TabsList>
                    <TabsTrigger value="request">İstek</TabsTrigger>
                    <TabsTrigger value="response">Yanıt</TabsTrigger>
                    <TabsTrigger value="example">Örnek</TabsTrigger>
                  </TabsList>

                  <TabsContent value="request" className="space-y-4">
                    {endpoint.requestBody && (
                      <div>
                        <h4 className="font-medium mb-2">Request Body</h4>
                        <div className="bg-muted p-3 rounded-lg">
                          <pre className="text-sm">
                            {JSON.stringify(
                              Object.fromEntries(
                                Object.entries(endpoint.requestBody).map(([key, value]) => [
                                  key,
                                  value.split(" - ")[0],
                                ]),
                              ),
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                        <div className="mt-2 space-y-1">
                          {Object.entries(endpoint.requestBody).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <code className="bg-muted px-1 rounded">{key}</code>: {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.queryParams && (
                      <div>
                        <h4 className="font-medium mb-2">Query Parameters</h4>
                        <div className="space-y-1">
                          {Object.entries(endpoint.queryParams).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <code className="bg-muted px-1 rounded">{key}</code>: {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="response">
                    <div>
                      <h4 className="font-medium mb-2">Success Response (200)</h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <pre className="text-sm overflow-x-auto">{JSON.stringify(endpoint.response, null, 2)}</pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="example">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">cURL Örneği</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const curlExample = `curl -X ${endpoint.method} https://link.keremkk.com.tr${endpoint.path} \\
  -H "Authorization: Bearer lks_your_token_here" \\
  -H "Content-Type: application/json"${
    endpoint.requestBody
      ? ` \\
  -d '${JSON.stringify(
    Object.fromEntries(Object.entries(endpoint.requestBody).map(([key, value]) => [key, value.split(" - ")[0]])),
    null,
    2,
  )}'`
      : ""
  }`
                              copyCode(curlExample, `${endpoint.title} cURL`)
                            }}
                          >
                            {copiedCode === `${endpoint.title} cURL` ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="bg-black text-green-400 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                          {`curl -X ${endpoint.method} https://link.keremkk.com.tr${endpoint.path} \\
  -H "Authorization: Bearer lks_your_token_here" \\
  -H "Content-Type: application/json"${
    endpoint.requestBody
      ? ` \\
  -d '${JSON.stringify(
    Object.fromEntries(Object.entries(endpoint.requestBody).map(([key, value]) => [key, value.split(" - ")[0]])),
    null,
    2,
  )}'`
      : ""
  }`}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Error Codes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Hata Kodları</CardTitle>
          <CardDescription>API'nin döndürebileceği hata kodları ve açıklamaları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {errorCodes.map((error, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge
                  variant="outline"
                  className={
                    error.code < 400
                      ? "bg-green-100 text-green-800"
                      : error.code < 500
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {error.code}
                </Badge>
                <div>
                  <div className="font-medium">{error.title}</div>
                  <div className="text-sm text-muted-foreground">{error.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Error Response Format</h4>
            <div className="bg-muted p-3 rounded-lg">
              <pre className="text-sm">
                {JSON.stringify(
                  {
                    success: false,
                    error: "Error message",
                    message: "Detailed error description",
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDKs and Libraries */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>SDK'lar ve Kütüphaneler</CardTitle>
          <CardDescription>Farklı programlama dilleri için örnekler ve kütüphaneler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">JavaScript/Node.js</h4>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <code>npm install axios</code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Axios ile HTTP istekleri gönderin</p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Python</h4>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <code>pip install requests</code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Requests kütüphanesi ile API'ye erişin</p>
            </div>

            <div>
              <h4 className="font-medium mb-3">PHP</h4>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <code>curl veya Guzzle HTTP</code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">cURL veya Guzzle ile HTTP istekleri</p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Go</h4>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <code>net/http package</code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Standard HTTP client kullanın</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Destek ve Topluluk</CardTitle>
          <CardDescription>Yardım almak ve katkıda bulunmak için kaynaklar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">GitHub</h4>
              <p className="text-sm text-muted-foreground mb-3">Kaynak kod ve issue'lar</p>
              <Button asChild size="sm" variant="outline">
<<<<<<< HEAD
                <Link href="https://github.com/keremkk/shortLink" target="_blank">
=======
                <Link href="https://github.com/keremkk/link-shortener" target="_blank">
>>>>>>> 5c5b36df51964fda8c0391a178f607c2b08f1c0d
                  GitHub'da Görüntüle
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">Wiki</h4>
              <p className="text-sm text-muted-foreground mb-3">Detaylı dokümantasyon</p>
              <Button asChild size="sm" variant="outline">
<<<<<<< HEAD
                <Link href="https://github.com/keremkk/shortLink/wiki" target="_blank">
=======
                <Link href="https://github.com/keremkk/link-shortener/wiki" target="_blank">
>>>>>>> 5c5b36df51964fda8c0391a178f607c2b08f1c0d
                  Wiki'yi Ziyaret Et
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">API Tokens</h4>
              <p className="text-sm text-muted-foreground mb-3">Token yönetimi</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/tokens">Token Yönetimi</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
