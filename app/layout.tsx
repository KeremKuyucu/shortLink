import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseErrorBoundary } from "@/components/firebase-error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "kısaLink - URL Kısaltma Servisi",
  icons: {
    icon: "/image.png",
  },
  description: "Basit URL kısaltma servisi - Açık kaynak kodlu, ücretsiz ve güvenli",
  keywords: ["url kısaltma", "link kısaltma", "açık kaynak", "ücretsiz", "güvenli"],
  authors: [{ name: "Kerem Kuyucu", url: "https://keremkk.com.tr" }],
  openGraph: {
    title: "kısaLink - Açık Kaynak URL Kısaltma Servisi",
    description: "Basit URL kısaltma servisi - Açık kaynak kodlu, ücretsiz ve güvenli",
    type: "website",
    locale: "tr_TR",
  },
  generator: 'with v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <FirebaseErrorBoundary>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </FirebaseErrorBoundary>
      </body>
    </html>
  )
}
