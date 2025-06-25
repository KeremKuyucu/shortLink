"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Smartphone, Globe, Server, Zap, Shield, Clock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export function APIIntegrationGuide() {
  const [activeStep, setActiveStep] = useState(1)

  const steps = [
    {
      id: 1,
      title: "Token Oluştur",
      description: "API erişimi için token oluşturun",
      icon: Shield,
      completed: false,
    },
    {
      id: 2,
      title: "İlk İstek",
      description: "API'ye ilk isteğinizi gönderin",
      icon: Zap,
      completed: false,
    },
    {
      id: 3,
      title: "Entegrasyon",
      description: "Uygulamanıza entegre edin",
      icon: Code,
      completed: false,
    },
  ]

  const useCases = [
    {
      title: "Web Uygulamaları",
      description: "JavaScript ile frontend entegrasyonu",
      icon: Globe,
      color: "bg-blue-100 text-blue-800",
      examples: ["React", "Vue.js", "Angular", "Vanilla JS"],
    },
    {
      title: "Mobil Uygulamalar",
      description: "iOS ve Android uygulamaları",
      icon: Smartphone,
      color: "bg-green-100 text-green-800",
      examples: ["React Native", "Flutter", "Swift", "Kotlin"],
    },
    {
      title: "Backend Servisler",
      description: "Server-side entegrasyonlar",
      icon: Server,
      color: "bg-purple-100 text-purple-800",
      examples: ["Node.js", "Python", "PHP", "Go"],
    },
    {
      title: "Automation",
      description: "Otomasyon ve bot'lar",
      icon: Zap,
      color: "bg-orange-100 text-orange-800",
      examples: ["Zapier", "IFTTT", "Cron Jobs", "Webhooks"],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Integration Steps */}
      <Card>
        <CardHeader>
          <CardTitle>API Entegrasyon Rehberi</CardTitle>
          <CardDescription>3 basit adımda API'yi uygulamanıza entegre edin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      activeStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {step.completed ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  {index < steps.length - 1 && <ArrowRight className="h-4 w-4 mx-4 text-gray-400" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="bg-gray-50 rounded-lg p-6">
              {activeStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">1. API Token Oluşturun</h3>
                  <p className="text-sm text-muted-foreground">
                    API'ye erişim için önce bir token oluşturmanız gerekiyor. Token'ınız size özel olacak ve güvenli
                    erişim sağlayacak.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href="/tokens">
                        <Shield className="h-4 w-4 mr-2" />
                        Token Oluştur
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveStep(2)}>
                      Sonraki Adım
                    </Button>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">2. İlk API İsteğinizi Gönderin</h3>
                  <p className="text-sm text-muted-foreground">
                    Token'ınızı aldıktan sonra ilk link oluşturma isteğinizi gönderin.
                  </p>
                  <div className="bg-black text-green-400 p-3 rounded text-xs font-mono">
                    {"curl -X POST https://link.keremkk.com.tr/api/v1/links \\"}
                    <br />
                    {'&nbsp;&nbsp;-H "Authorization: Bearer YOUR_TOKEN" \\'}
                    <br />
                    {'&nbsp;&nbsp;-H "Content-Type: application/json" \\'}
                    <br />
                    {'&nbsp;&nbsp;-d \'{"originalUrl": "https://example.com"}\''}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveStep(1)}>
                      Önceki Adım
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveStep(3)}>
                      Sonraki Adım
                    </Button>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">3. Uygulamanıza Entegre Edin</h3>
                  <p className="text-sm text-muted-foreground">
                    API'yi başarıyla test ettikten sonra uygulamanıza entegre edebilirsiniz.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded p-3">
                      <h4 className="font-medium text-sm">Frontend</h4>
                      <p className="text-xs text-muted-foreground">React, Vue, Angular</p>
                    </div>
                    <div className="border rounded p-3">
                      <h4 className="font-medium text-sm">Backend</h4>
                      <p className="text-xs text-muted-foreground">Node.js, Python, PHP</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveStep(2)}>
                      Önceki Adım
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/api/v1" target="_blank">
                        <Code className="h-4 w-4 mr-2" />
                        Dokümantasyon
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanım Senaryoları</CardTitle>
          <CardDescription>API'yi farklı platformlarda nasıl kullanabileceğinizi keşfedin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${useCase.color}`}>
                    <useCase.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{useCase.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {useCase.examples.map((example, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Features */}
      <Card>
        <CardHeader>
          <CardTitle>API Özellikleri</CardTitle>
          <CardDescription>Güçlü ve esnek API ile neler yapabilirsiniz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">Hızlı Yanıt</h3>
              <p className="text-sm text-muted-foreground">Ortalama 50ms yanıt süresi ile hızlı API</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Güvenli</h3>
              <p className="text-sm text-muted-foreground">Token tabanlı kimlik doğrulama ve HTTPS</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">Rate Limiting</h3>
              <p className="text-sm text-muted-foreground">Saatlik 1000 istek limiti ile kontrollü kullanım</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
