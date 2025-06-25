import { adminDb } from "./firebase-admin"
import type { APIToken } from "@/types/api"

export class APIAuthError extends Error {
  constructor(
    message: string,
    public statusCode = 401,
  ) {
    super(message)
    this.name = "APIAuthError"
  }
}

export async function validateAPIToken(token: string): Promise<APIToken> {
  if (!token) {
    throw new APIAuthError("API token is required", 401)
  }

  // Token format kontrolü
  if (!token.startsWith("lks_")) {
    throw new APIAuthError("Invalid token format", 401)
  }

  try {
    // Token'ı veritabanından bul
    const tokensRef = adminDb.collection("apiTokens")
    const tokenQuery = await tokensRef.where("token", "==", token).where("isActive", "==", true).get()

    if (tokenQuery.empty) {
      throw new APIAuthError("Invalid or inactive token", 401)
    }

    const tokenDoc = tokenQuery.docs[0]
    const tokenData = tokenDoc.data() as APIToken

    // Expiration kontrolü
    if (tokenData.expiresAt && new Date(tokenData.expiresAt.toDate()) < new Date()) {
      throw new APIAuthError("Token has expired", 401)
    }

    // Rate limit kontrolü
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Son 1 saatteki kullanım sayısını kontrol et
    const usageRef = adminDb.collection("apiUsage")
    const usageQuery = await usageRef.where("tokenId", "==", tokenDoc.id).where("timestamp", ">=", oneHourAgo).get()

    if (usageQuery.size >= tokenData.rateLimit) {
      throw new APIAuthError("Rate limit exceeded", 429)
    }

    // Token kullanımını kaydet
    await usageRef.add({
      tokenId: tokenDoc.id,
      userId: tokenData.userId,
      timestamp: now,
      endpoint: "", // Bu endpoint'te set edilecek
    })

    // Last used güncelle
    await tokenDoc.ref.update({
      lastUsed: now,
      usageCount: (tokenData.usageCount || 0) + 1,
    })

    return {
      ...tokenData,
      id: tokenDoc.id,
    }
  } catch (error) {
    if (error instanceof APIAuthError) {
      throw error
    }
    console.error("API token validation error:", error)
    throw new APIAuthError("Token validation failed", 500)
  }
}

export function hasPermission(token: APIToken, resource: string, action: string): boolean {
  return token.permissions.some(
    (permission) => permission.resource === resource && permission.actions.includes(action as any),
  )
}

export function generateAPIToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "lks_"
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function logAPIUsage(tokenId: string, endpoint: string, method: string, statusCode: number) {
  try {
    await adminDb.collection("apiUsage").add({
      tokenId,
      endpoint,
      method,
      statusCode,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Failed to log API usage:", error)
  }
}
