import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function POST() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Kullanıcı istatistikleri
    const usersSnapshot = await adminDb.collection("users").get()
    const totalUsers = usersSnapshot.size
    const newUsersToday = usersSnapshot.docs.filter((doc) => {
      const createdAt = doc.data().createdAt?.toDate()
      return createdAt && createdAt >= today
    }).length

    // Link istatistikleri
    const linksSnapshot = await adminDb.collection("links").get()
    const totalLinks = linksSnapshot.size
    const newLinksToday = linksSnapshot.docs.filter((doc) => {
      const createdAt = doc.data().createdAt?.toDate()
      return createdAt && createdAt >= today
    }).length

    // Tıklama istatistikleri
    const totalClicks = linksSnapshot.docs.reduce((sum, doc) => sum + (doc.data().clicks || 0), 0)
    const clicksToday = linksSnapshot.docs.reduce((sum, doc) => {
      const lastClickedAt = doc.data().lastClickedAt?.toDate()
      if (lastClickedAt && lastClickedAt >= today) {
        return sum + (doc.data().clicks || 0)
      }
      return sum
    }, 0)

    const stats = {
      totalUsers,
      newUsersToday,
      totalLinks,
      newLinksToday,
      totalClicks,
      clicksToday,
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Daily stats error:", error)
    return NextResponse.json({ error: "Failed to generate daily stats" }, { status: 500 })
  }
}
