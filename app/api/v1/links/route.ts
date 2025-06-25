import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { validateAPIToken, hasPermission, logAPIUsage, APIAuthError } from "@/lib/api-auth"
import { generateShortCode, isValidUrl, isValidCustomUrl } from "@/lib/utils"
import { sendDiscordBotMessage, createNewLinkEmbed } from "@/lib/discord"
import type { APIResponse, CreateLinkRequest, CreateLinkResponse } from "@/types/api"

export async function POST(request: NextRequest) {
  let tokenId = ""

  try {
    // Authorization header'ı al
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authorization header required" } as APIResponse, {
        status: 401,
      })
    }

    const token = authHeader.replace("Bearer ", "")
    const apiToken = await validateAPIToken(token)
    tokenId = apiToken.id

    // Permission kontrolü
    if (!hasPermission(apiToken, "links", "create")) {
      await logAPIUsage(tokenId, "/api/v1/links", "POST", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Request body'yi parse et
    const body: CreateLinkRequest = await request.json()
    const { originalUrl, customUrl } = body

    // Validation
    if (!originalUrl || !isValidUrl(originalUrl)) {
      await logAPIUsage(tokenId, "/api/v1/links", "POST", 400)
      return NextResponse.json({ success: false, error: "Valid originalUrl is required" } as APIResponse, {
        status: 400,
      })
    }

    if (customUrl && !isValidCustomUrl(customUrl)) {
      await logAPIUsage(tokenId, "/api/v1/links", "POST", 400)
      return NextResponse.json({ success: false, error: "Invalid custom URL format" } as APIResponse, { status: 400 })
    }

    // Short code oluştur
    let shortCode = customUrl ? customUrl.toLowerCase() : generateShortCode()

    // Benzersizlik kontrolü
    const existingQuery = await adminDb.collection("links").where("shortCode", "==", shortCode).get()

    if (!existingQuery.empty) {
      if (customUrl) {
        await logAPIUsage(tokenId, "/api/v1/links", "POST", 409)
        return NextResponse.json({ success: false, error: "Custom URL already exists" } as APIResponse, { status: 409 })
      } else {
        // Otomatik kod için yeni kod üret
        do {
          shortCode = generateShortCode()
          const newQuery = await adminDb.collection("links").where("shortCode", "==", shortCode).get()
          if (newQuery.empty) break
        } while (true)
      }
    }

    // Link'i kaydet
    const linkData = {
      originalUrl,
      shortCode,
      createdBy: apiToken.userId,
      createdByEmail: apiToken.userEmail,
      clicks: 0,
      isCustom: !!customUrl,
      createdViaAPI: true,
      apiTokenId: tokenId,
      createdAt: new Date(),
    }

    const linkRef = await adminDb.collection("links").add(linkData)
    const shortUrl = `${request.nextUrl.origin}/${shortCode}`

    // Discord bildirimi
    try {
      const embed = createNewLinkEmbed(apiToken.userEmail, originalUrl, shortCode, !!customUrl, undefined)
      const message = `🤖 **API ile** yeni ${customUrl ? "özel" : "otomatik"} link oluşturuldu: \`${shortCode}\``
      await sendDiscordBotMessage(embed, message)
    } catch (error) {
      console.error("Discord notification failed:", error)
    }

    const response: CreateLinkResponse = {
      id: linkRef.id,
      originalUrl,
      shortCode,
      shortUrl,
      isCustom: !!customUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
    }

    await logAPIUsage(tokenId, "/api/v1/links", "POST", 201)
    return NextResponse.json({ success: true, data: response } as APIResponse<CreateLinkResponse>, { status: 201 })
  } catch (error) {
    console.error("API create link error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, "/api/v1/links", "POST", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, "/api/v1/links", "POST", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  let tokenId = ""

  try {
    // Authorization
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authorization header required" } as APIResponse, {
        status: 401,
      })
    }

    const token = authHeader.replace("Bearer ", "")
    const apiToken = await validateAPIToken(token)
    tokenId = apiToken.id

    // Permission kontrolü
    if (!hasPermission(apiToken, "links", "read")) {
      await logAPIUsage(tokenId, "/api/v1/links", "GET", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 100) // Max 100
    const offset = (page - 1) * limit

    // Links'leri getir
    const linksQuery = adminDb
      .collection("links")
      .where("createdBy", "==", apiToken.userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)

    const linksSnapshot = await linksQuery.get()
    const totalQuery = await adminDb.collection("links").where("createdBy", "==", apiToken.userId).get()

    const links = linksSnapshot.docs.map((doc) => ({
      id: doc.id,
      originalUrl: doc.data().originalUrl,
      shortCode: doc.data().shortCode,
      shortUrl: `${request.nextUrl.origin}/${doc.data().shortCode}`,
      clicks: doc.data().clicks || 0,
      isCustom: doc.data().isCustom || false,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }))

    const response = {
      success: true,
      data: links,
      pagination: {
        page,
        limit,
        total: totalQuery.size,
        totalPages: Math.ceil(totalQuery.size / limit),
      },
    } as APIResponse

    await logAPIUsage(tokenId, "/api/v1/links", "GET", 200)
    return NextResponse.json(response)
  } catch (error) {
    console.error("API get links error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, "/api/v1/links", "GET", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, "/api/v1/links", "GET", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}
