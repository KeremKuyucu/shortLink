import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { validateAPIToken, hasPermission, logAPIUsage, APIAuthError } from "@/lib/api-auth"
import { sendDiscordBotMessage } from "@/lib/discord" // Declare the variable here
import type { APIResponse } from "@/types/api"

export async function GET(request: NextRequest, { params }: { params: { linkId: string } }) {
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

    if (!hasPermission(apiToken, "links", "read")) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "GET", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Link'i getir
    const linkDoc = await adminDb.collection("links").doc(params.linkId).get()

    if (!linkDoc.exists) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "GET", 404)
      return NextResponse.json({ success: false, error: "Link not found" } as APIResponse, { status: 404 })
    }

    const linkData = linkDoc.data()

    // Ownership kontrolü
    if (linkData?.createdBy !== apiToken.userId) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "GET", 403)
      return NextResponse.json({ success: false, error: "Access denied" } as APIResponse, { status: 403 })
    }

    const response = {
      id: linkDoc.id,
      originalUrl: linkData.originalUrl,
      shortCode: linkData.shortCode,
      shortUrl: `${request.nextUrl.origin}/${linkData.shortCode}`,
      clicks: linkData.clicks || 0,
      isCustom: linkData.isCustom || false,
      createdAt: linkData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastClickedAt: linkData.lastClickedAt?.toDate?.()?.toISOString(),
    }

    await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "GET", 200)
    return NextResponse.json({ success: true, data: response } as APIResponse)
  } catch (error) {
    console.error("API get link error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "GET", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "GET", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { linkId: string } }) {
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

    if (!hasPermission(apiToken, "links", "delete")) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "DELETE", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Link'i getir
    const linkDoc = await adminDb.collection("links").doc(params.linkId).get()

    if (!linkDoc.exists) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "DELETE", 404)
      return NextResponse.json({ success: false, error: "Link not found" } as APIResponse, { status: 404 })
    }

    const linkData = linkDoc.data()

    // Ownership kontrolü
    if (linkData?.createdBy !== apiToken.userId) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "DELETE", 403)
      return NextResponse.json({ success: false, error: "Access denied" } as APIResponse, { status: 403 })
    }

    // Link'i sil
    await linkDoc.ref.delete()

    // Discord bildirimi
    try {
      const embed = {
        title: "🗑️ Link Silindi (API)",
        description: `API üzerinden bir link silindi`,
        color: 0xff4444,
        fields: [
          {
            name: "👤 Kullanıcı",
            value: `\`${apiToken.userEmail}\``,
            inline: true,
          },
          {
            name: "🔗 Silinen Link",
            value: `\`${linkData.shortCode}\``,
            inline: true,
          },
          {
            name: "📊 Toplam Tıklama",
            value: `**${linkData.clicks || 0}** kez`,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "LinkKısa - API",
        },
      }

      await sendDiscordBotMessage(embed, `🤖 **API ile** \`${linkData.shortCode}\` linki silindi`)
    } catch (error) {
      console.error("Discord notification failed:", error)
    }

    await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "DELETE", 200)
    return NextResponse.json({
      success: true,
      message: "Link deleted successfully",
    } as APIResponse)
  } catch (error) {
    console.error("API delete link error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "DELETE", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, `/api/v1/links/${params.linkId}`, "DELETE", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}
