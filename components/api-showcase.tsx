"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Code, Terminal, Smartphone, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function APIShowcase() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()
  const id = "exampleId" // Declare the id variable

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(label)
    setTimeout(() => setCopiedCode(null), 2000)
    toast({
      title: "Kopyalandı!",
      description: `${label} kodu panoya kopyalandı.`,
    })
  }

  const curlExample = `curl -X POST https://link.keremkk.com.tr/api/v1/links \\
  -H "Authorization: Bearer lks_your_token_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "originalUrl": "https://example.com/very-long-url",
    "customUrl": "my-api-link"
  }'`

  const jsExample = `// JavaScript/Node.js
const response = await fetch('https://link.keremkk.com.tr/api/v1/links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer lks_your_token_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    originalUrl: 'https://example.com/very-long-url',
    customUrl: 'my-api-link'
  })
});

const result = await response.json();
console.log(result.data.shortUrl);`

  const pythonExample = `# Python
import requests

response = requests.post(
    'https://link.keremkk.com.tr/api/v1/links',
    headers={
        'Authorization': 'Bearer lks_your_token_here',
        'Content-Type': 'application/json'
    },
    json={
        'originalUrl': 'https://example.com/very-long-url',
        'customUrl': 'my-api-link'
    }
)

result = response.json()
print(result['data']['shortUrl'])`

  const phpExample = `<?php
// PHP
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://link.keremkk.com.tr/api/v1/links');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'originalUrl' => 'https://example.com/very-long-url',
    'customUrl' => 'my-api-link'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer lks_your_token_here',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$result = json_decode($response, true);
echo $result['data']['shortUrl'];
?>`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          REST API
        </CardTitle>
        <CardDescription>
          Programatik erişim için RESTful API. Token tabanlı kimlik doğrulama ve rate limiting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* API Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Terminal className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-sm">RESTful</h4>
              <p className="text-xs text-muted-foreground">Standard HTTP metodları</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Badge className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-sm">Token Auth</h4>
              <p className="text-xs text-muted-foreground">Güvenli Bearer token</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-sm">Rate Limiting</h4>
              <p className="text-xs text-muted-foreground">1000 req/hour max</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-sm">CORS Ready</h4>
              <p className="text-xs text-muted-foreground">Web uygulamaları için</p>
            </div>
          </div>

          {/* Code Examples */}
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>

            <TabsContent value="curl" className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">cURL Örneği</h4>
                <Button size="sm" variant="outline" onClick={() => copyCode(curlExample, "cURL")}>
                  {copiedCode === "cURL" ? "Kopyalandı!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                <code>{curlExample}</code>
              </pre>
            </TabsContent>

            <TabsContent value="javascript" className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">JavaScript/Node.js Örneği</h4>
                <Button size="sm" variant="outline" onClick={() => copyCode(jsExample, "JavaScript")}>
                  {copiedCode === "JavaScript" ? "Kopyalandı!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                <code>{jsExample}</code>
              </pre>
            </TabsContent>

            <TabsContent value="python" className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Python Örneği</h4>
                <Button size="sm" variant="outline" onClick={() => copyCode(pythonExample, "Python")}>
                  {copiedCode === "Python" ? "Kopyalandı!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                <code>{pythonExample}</code>
              </pre>
            </TabsContent>

            <TabsContent value="php" className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">PHP Örneği</h4>
                <Button size="sm" variant="outline" onClick={() => copyCode(phpExample, "PHP")}>
                  {copiedCode === "PHP" ? "Kopyalandı!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                <code>{phpExample}</code>
              </pre>
            </TabsContent>
          </Tabs>

          {/* API Endpoints */}
          <div className="space-y-3">
            <h4 className="font-medium">Ana Endpoint'ler</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    POST
                  </Badge>
                  <code>/api/v1/links</code>
                </div>
                <span className="text-muted-foreground">Link oluştur</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    GET
                  </Badge>
                  <code>/api/v1/links</code>
                </div>
                <span className="text-muted-foreground">Link'leri listele</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    GET
                  </Badge>
                  <code>/api/v1/stats</code>
                </div>
                <span className="text-muted-foreground">İstatistikleri getir</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    DELETE
                  </Badge>
                  <code>/api/v1/links/{id}</code>
                </div>
                <span className="text-muted-foreground">Link sil</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-4 border-t">
            <Button asChild>
              <a href="/tokens">Token Oluştur</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/docs">API Dokümantasyonu</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
