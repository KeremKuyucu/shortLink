import { redirect, notFound } from "next/navigation"
import { adminDb } from "@/lib/firebase-admin"
import { headers } from "next/headers"

interface RedirectPageProps {
  params: {
    shortCode: string
  }
}

// Bot/Preview user agent'larını tespit et
function isBotOrPreview(userAgent: string): boolean {
  const botPatterns = [
    // Discord
    /discordbot/i,
    /discord/i,
    // WhatsApp
    /whatsapp/i,
    // Telegram
    /telegrambot/i,
    /telegram/i,
    // Twitter/X
    /twitterbot/i,
    /twitter/i,
    // Facebook
    /facebookexternalhit/i,
    /facebook/i,
    // LinkedIn
    /linkedinbot/i,
    /linkedin/i,
    // Slack
    /slackbot/i,
    /slack/i,
    // Generic bots
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    // Preview services
    /preview/i,
    /unfurl/i,
    /embed/i,
    // Search engines (optional - bunları sayabilirsiniz)
    /googlebot/i,
    /bingbot/i,
    /yandexbot/i,
  ]

  return botPatterns.some((pattern) => pattern.test(userAgent))
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = params

  try {
    // Admin SDK ile kısa kodu ara
    const linksRef = adminDb.collection("links")
    const querySnapshot = await linksRef.where("shortCode", "==", shortCode).get()

    if (querySnapshot.empty) {
      // Link bulunamadı - Next.js notFound() kullan
      notFound()
    }

    const linkDoc = querySnapshot.docs[0]
    const linkData = linkDoc.data()

    // Request bilgilerini al
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || ""
    const forwardedFor = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "Bilinmeyen"

    // Bot/Preview kontrolü
    const isBot = isBotOrPreview(userAgent)

    // Sadece gerçek kullanıcı tıklamaları için sayacı artır
    if (!isBot) {
      // Tıklama sayısını artır
      const newClickCount = (linkData.clicks || 0) + 1
      await linkDoc.ref.update({
        clicks: newClickCount,
        lastClickedAt: new Date(),
      })
    } else {
      // Bot/Preview isteği - sadece log
      console.log(`Bot/Preview request detected for ${shortCode}:`, {
        userAgent: userAgent.substring(0, 100),
        ipAddress,
        timestamp: new Date().toISOString(),
      })
    }

    // Orijinal URL'ye yönlendir
    redirect(linkData.originalUrl)
  } catch (error) {
    // Next.js özel hatalarını yeniden fırlat
    if (error && typeof error === "object" && "digest" in error && typeof error.digest === "string") {
      // NEXT_REDIRECT ve NEXT_NOT_FOUND hatalarını yeniden fırlat
      if (error.digest.startsWith("NEXT_REDIRECT") || error.digest === "NEXT_NOT_FOUND") {
        throw error
      }
    }

    // Gerçek hatalar için log ve 500 sayfası
    console.error("Redirect error:", error)
    throw new Error("Internal server error")
  }
}
