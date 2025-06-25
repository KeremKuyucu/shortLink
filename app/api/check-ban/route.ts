import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user document from Firestore
    const userDoc = await adminDb.collection("users").doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json({ isBanned: false }, { status: 200 })
    }

    const userData = userDoc.data()
    const isBanned = userData?.isBanned === true

    return NextResponse.json({ isBanned }, { status: 200 })
  } catch (error) {
    console.error("Error checking ban status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
