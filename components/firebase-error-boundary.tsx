"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface FirebaseErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class FirebaseErrorBoundary extends React.Component<{ children: React.ReactNode }, FirebaseErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): FirebaseErrorBoundaryState {
    // Firebase configuration hatalarını yakala
    if (error.message.includes("Firebase") || error.message.includes("projectId")) {
      return { hasError: true, error }
    }
    return { hasError: false }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Firebase Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Yapılandırma Hatası</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">Firebase yapılandırması eksik veya hatalı.</p>

              {process.env.NODE_ENV === "development" && (
                <div className="text-left bg-gray-100 p-3 rounded text-xs font-mono text-gray-700">
                  {this.state.error?.message}
                </div>
              )}

              <div className="text-sm text-gray-500 text-left">
                <p className="font-medium mb-2">Gerekli environment variables:</p>
                <ul className="space-y-1">
                  <li>• NEXT_PUBLIC_FIREBASE_API_KEY</li>
                  <li>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                  <li>• FIREBASE_PROJECT_ID</li>
                  <li>• FIREBASE_CLIENT_EMAIL</li>
                  <li>• FIREBASE_PRIVATE_KEY</li>
                </ul>
              </div>

              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sayfayı Yenile
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
