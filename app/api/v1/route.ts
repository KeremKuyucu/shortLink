import { NextResponse } from "next/server"
import type { APIResponse } from "@/types/api"

export async function GET() {
  const apiInfo = {
    name: "LinkKısa API",
    version: "1.0.0",
    description: "Açık kaynak URL kısaltma servisi API'si",
    documentation: "https://link.keremkk.com.tr/docs",
    endpoints: {
      links: {
        "POST /api/v1/links": "Yeni link oluştur",
        "GET /api/v1/links": "Link'leri listele",
        "GET /api/v1/links/{id}": "Link detayı",
        "DELETE /api/v1/links/{id}": "Link sil",
      },
      tokens: {
        "POST /api/v1/tokens": "Yeni token oluştur",
        "GET /api/v1/tokens": "Token'ları listele",
        "PATCH /api/v1/tokens/{id}": "Token güncelle",
        "DELETE /api/v1/tokens/{id}": "Token sil",
      },
      stats: {
        "GET /api/v1/stats": "İstatistikleri getir",
      },
    },
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer lks_your_token_here",
    },
    rateLimit: {
      default: "100 requests per hour",
      max: "1000 requests per hour",
    },
    support: "https://github.com/keremkk/link-shortener/issues",
  }

  return NextResponse.json({
    success: true,
    data: apiInfo,
  } as APIResponse)
}
