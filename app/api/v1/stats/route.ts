import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { validateAPIToken, hasPermission, logAPIUsage, APIAuthError } from "@/lib/api-auth"
import type { APIResponse, LinkStatsResponse } from "@/types/api"

export async function GET(request: NextRequest) {
  let tokenId = ""

  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authorization header required" } as APIResponse, {
        status: 401,
      })
    }

    const token = authHeader.replace("Bearer ", "")
    const apiToken = await validateAPIToken(token)
    tokenId = apiToken.id

    if (!hasPermission(apiToken, "stats", "read")) {
      await logAPIUsage(tokenId, "/api/v1/stats", "GET", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Kullanıcının linklerini getir
    const linksQuery = await adminDb.collection("links").where("createdBy", "==", apiToken.userId).get()

    let totalClicks = 0
    const recentLinks: any[] = []

    linksQuery.docs.forEach((doc) => {
      const data = doc.data()
      totalClicks += data.clicks || 0

      recentLinks.push({
        id: doc.id,
        shortCode: data.shortCode,
        originalUrl: data.originalUrl,
        clicks: data.clicks || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })
    })

    // Son 5 link'i al (clicks'e göre sıralı)
    recentLinks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const topRecentLinks = recentLinks.slice(0, 5)

    // Son 7 günün tıklama verilerini hazırla (basit versiyon)
    const clicksOverTime = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Bu tarihte oluşturulan linklerin toplam tıklamalarını hesapla
      const dayClicks = linksQuery.docs
        .filter((doc) => {
          const createdAt = doc.data().createdAt?.toDate()
          return createdAt && createdAt.toDateString() === date.toDateString()
        })
        .reduce((sum, doc) => sum + (doc.data().clicks || 0), 0)

      clicksOverTime.push({
        date: date.toISOString().split("T")[0],
        clicks: dayClicks,
      })
    }

    const response: LinkStatsResponse = {
      totalLinks: linksQuery.size,
      totalClicks,
      recentLinks: topRecentLinks,
      clicksOverTime,
    }

    await logAPIUsage(tokenId, "/api/v1/stats", "GET", 200)
    return NextResponse.json({ success: true, data: response } as APIResponse<LinkStatsResponse>)
  } catch (error) {
    console.error("API get stats error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, "/api/v1/stats", "GET", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, "/api/v1/stats", "GET", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}
