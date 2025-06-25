import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { validateAPIToken, hasPermission, logAPIUsage, APIAuthError, generateAPIToken } from "@/lib/api-auth"
import type { APIResponse, CreateTokenRequest } from "@/types/api"

export async function POST(request: NextRequest) {
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

    if (!hasPermission(apiToken, "tokens", "create")) {
      await logAPIUsage(tokenId, "/api/v1/tokens", "POST", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    const body: CreateTokenRequest = await request.json()
    const { name, permissions, rateLimit = 100, expiresAt } = body

    // Validation
    if (!name || name.trim().length < 3) {
      await logAPIUsage(tokenId, "/api/v1/tokens", "POST", 400)
      return NextResponse.json({ success: false, error: "Token name must be at least 3 characters" } as APIResponse, {
        status: 400,
      })
    }

    if (!permissions || permissions.length === 0) {
      await logAPIUsage(tokenId, "/api/v1/tokens", "POST", 400)
      return NextResponse.json({ success: false, error: "At least one permission is required" } as APIResponse, {
        status: 400,
      })
    }

    // Token oluştur
    const newToken = generateAPIToken()
    const tokenData = {
      name: name.trim(),
      token: newToken,
      userId: apiToken.userId,
      userEmail: apiToken.userEmail,
      permissions,
      rateLimit: Math.min(rateLimit, 1000), // Max 1000/hour
      usageCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(expiresAt && { expiresAt: new Date(expiresAt) }),
    }

    const tokenRef = await adminDb.collection("apiTokens").add(tokenData)

    // Response'da token'ı mask'le (sadece ilk oluşturma sırasında tam token döner)
    const response = {
      id: tokenRef.id,
      name: tokenData.name,
      token: newToken, // İlk oluşturmada tam token
      permissions: tokenData.permissions,
      rateLimit: tokenData.rateLimit,
      usageCount: 0,
      isActive: true,
      createdAt: tokenData.createdAt.toISOString(),
    }

    await logAPIUsage(tokenId, "/api/v1/tokens", "POST", 201)
    return NextResponse.json(
      {
        success: true,
        data: response,
        message: "Token created successfully. Save it securely - you won't see it again!",
      } as APIResponse,
      { status: 201 },
    )
  } catch (error) {
    console.error("API create token error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, "/api/v1/tokens", "POST", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, "/api/v1/tokens", "POST", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}

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

    if (!hasPermission(apiToken, "tokens", "read")) {
      await logAPIUsage(tokenId, "/api/v1/tokens", "GET", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Kullanıcının token'larını getir
    const tokensQuery = await adminDb
      .collection("apiTokens")
      .where("userId", "==", apiToken.userId)
      .orderBy("createdAt", "desc")
      .get()

    const tokens = tokensQuery.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        token: `${data.token.substring(0, 8)}...${data.token.substring(data.token.length - 4)}`, // Masked
        permissions: data.permissions,
        rateLimit: data.rateLimit,
        usageCount: data.usageCount || 0,
        lastUsed: data.lastUsed?.toDate?.()?.toISOString(),
        expiresAt: data.expiresAt?.toDate?.()?.toISOString(),
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
      }
    })

    await logAPIUsage(tokenId, "/api/v1/tokens", "GET", 200)
    return NextResponse.json({ success: true, data: tokens } as APIResponse)
  } catch (error) {
    console.error("API get tokens error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, "/api/v1/tokens", "GET", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, "/api/v1/tokens", "GET", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}
