import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { validateAPIToken, hasPermission, logAPIUsage, APIAuthError } from "@/lib/api-auth"
import type { APIResponse } from "@/types/api"

export async function PATCH(request: NextRequest, { params }: { params: { tokenId: string } }) {
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

    if (!hasPermission(apiToken, "tokens", "update")) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Token'ı getir
    const tokenDoc = await adminDb.collection("apiTokens").doc(params.tokenId).get()

    if (!tokenDoc.exists) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", 404)
      return NextResponse.json({ success: false, error: "Token not found" } as APIResponse, { status: 404 })
    }

    const tokenData = tokenDoc.data()

    // Ownership kontrolü
    if (tokenData?.userId !== apiToken.userId) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", 403)
      return NextResponse.json({ success: false, error: "Access denied" } as APIResponse, { status: 403 })
    }

    const body = await request.json()
    const { name, permissions, rateLimit, isActive, expiresAt } = body

    // Update data hazırla
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) {
      if (!name || name.trim().length < 3) {
        await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", 400)
        return NextResponse.json({ success: false, error: "Token name must be at least 3 characters" } as APIResponse, {
          status: 400,
        })
      }
      updateData.name = name.trim()
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions) || permissions.length === 0) {
        await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", 400)
        return NextResponse.json({ success: false, error: "At least one permission is required" } as APIResponse, {
          status: 400,
        })
      }
      updateData.permissions = permissions
    }

    if (rateLimit !== undefined) {
      updateData.rateLimit = Math.min(Math.max(rateLimit, 1), 1000) // 1-1000 arası
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive)
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    }

    // Token'ı güncelle
    await tokenDoc.ref.update(updateData)

    await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", 200)
    return NextResponse.json({
      success: true,
      message: "Token updated successfully",
    } as APIResponse)
  } catch (error) {
    console.error("API update token error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "PATCH", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { tokenId: string } }) {
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

    if (!hasPermission(apiToken, "tokens", "delete")) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "DELETE", 403)
      return NextResponse.json({ success: false, error: "Insufficient permissions" } as APIResponse, { status: 403 })
    }

    // Token'ı getir
    const tokenDoc = await adminDb.collection("apiTokens").doc(params.tokenId).get()

    if (!tokenDoc.exists) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "DELETE", 404)
      return NextResponse.json({ success: false, error: "Token not found" } as APIResponse, { status: 404 })
    }

    const tokenData = tokenDoc.data()

    // Ownership kontrolü
    if (tokenData?.userId !== apiToken.userId) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "DELETE", 403)
      return NextResponse.json({ success: false, error: "Access denied" } as APIResponse, { status: 403 })
    }

    // Kendi token'ını silmeye çalışıyor mu?
    if (params.tokenId === apiToken.id) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "DELETE", 400)
      return NextResponse.json(
        { success: false, error: "Cannot delete the token being used for this request" } as APIResponse,
        { status: 400 },
      )
    }

    // Token'ı sil
    await tokenDoc.ref.delete()

    // İlgili usage kayıtlarını da sil
    const usageQuery = await adminDb.collection("apiUsage").where("tokenId", "==", params.tokenId).get()
    const batch = adminDb.batch()
    usageQuery.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    await batch.commit()

    await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "DELETE", 200)
    return NextResponse.json({
      success: true,
      message: "Token deleted successfully",
    } as APIResponse)
  } catch (error) {
    console.error("API delete token error:", error)

    if (error instanceof APIAuthError) {
      await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "DELETE", error.statusCode)
      return NextResponse.json({ success: false, error: error.message } as APIResponse, { status: error.statusCode })
    }

    await logAPIUsage(tokenId, `/api/v1/tokens/${params.tokenId}`, "DELETE", 500)
    return NextResponse.json({ success: false, error: "Internal server error" } as APIResponse, { status: 500 })
  }
}
