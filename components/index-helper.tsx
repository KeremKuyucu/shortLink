"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface IndexHelperProps {
  show: boolean
  onClose: () => void
}

export function IndexHelper({ show, onClose }: IndexHelperProps) {
  const [step, setStep] = useState(1)
  const { toast } = useToast()

  if (!show) return null

  const indexUrl =
    "https://console.firebase.google.com/v1/r/project/keremkk-auth/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9rZXJlbWtrLWF1dGgvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xpbmtzL2luZGV4ZXMvXxABGg0KCWNyZWF0ZWRCeRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI"

  const copyIndexConfig = () => {
    const config = `{
  "indexes": [
    {
      "collectionGroup": "links",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdBy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}`

    navigator.clipboard.writeText(config)
    toast({
      title: "Kopyalandı!",
      description: "Index konfigürasyonu panoya kopyalandı.",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Firestore Index Kurulumu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Neden Index Gerekli?</h3>
                <p className="text-sm text-orange-700">
                  Firestore'da compound query'ler (birden fazla field'a göre sıralama/filtreleme) için index
                  oluşturulması gerekiyor. Bu performansı artırır ve maliyeti düşürür.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Gerekli Index:</h3>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                  <div>
                    Collection: <Badge variant="outline">links</Badge>
                  </div>
                  <div>
                    Fields: <Badge variant="outline">createdBy</Badge> + <Badge variant="outline">createdAt</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} className="flex-1">
                  Manuel Kurulum
                </Button>
                <Button onClick={() => window.open(indexUrl, "_blank")} variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Otomatik Oluştur
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Manuel Index Oluşturma Adımları:</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    1
                  </Badge>
                  <div>
                    <p className="font-medium">Firebase Console'a Git</p>
                    <p className="text-sm text-muted-foreground">
                      Firebase Console → Firestore Database → Indexes sekmesi
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    2
                  </Badge>
                  <div>
                    <p className="font-medium">"Create Index" Butonuna Tıkla</p>
                    <p className="text-sm text-muted-foreground">Yeni composite index oluştur</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    3
                  </Badge>
                  <div>
                    <p className="font-medium">Index Ayarlarını Gir</p>
                    <div className="bg-gray-100 p-3 rounded-lg mt-2 text-sm">
                      <div>
                        Collection ID: <code>links</code>
                      </div>
                      <div>
                        Field 1: <code>createdBy</code> (Ascending)
                      </div>
                      <div>
                        Field 2: <code>createdAt</code> (Descending)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    4
                  </Badge>
                  <div>
                    <p className="font-medium">Index'i Oluştur ve Bekle</p>
                    <p className="text-sm text-muted-foreground">Index oluşturma 2-5 dakika sürebilir</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Index Konfigürasyonu (JSON)</h4>
                <Button size="sm" onClick={copyIndexConfig} className="mb-2">
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </Button>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                  {`{
  "collectionGroup": "links",
  "fields": [
    {"fieldPath": "createdBy", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}`}
                </pre>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline">
                  Geri
                </Button>
                <Button
                  onClick={() =>
                    window.open("https://console.firebase.google.com/project/keremkk-auth/firestore/indexes", "_blank")
                  }
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Firebase Console'a Git
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Index oluştuktan sonra sayfa otomatik olarak düzelecek
            </div>
          </div>

          <Button onClick={onClose} variant="outline" className="w-full">
            Kapat
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
