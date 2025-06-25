import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Development ortamında environment variables kontrolü
  if (process.env.NODE_ENV === "development") {
    const requiredClientEnvVars = ["NEXT_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_PROJECT_ID"]

    const requiredServerEnvVars = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]

    const missingClientVars = requiredClientEnvVars.filter((varName) => !process.env[varName])
    const missingServerVars = requiredServerEnvVars.filter((varName) => !process.env[varName])

    if (missingClientVars.length > 0) {
      console.error("❌ Missing required CLIENT environment variables:", missingClientVars.join(", "))
    }

    if (missingServerVars.length > 0) {
      console.error("❌ Missing required SERVER environment variables:", missingServerVars.join(", "))
    }

    // Discord configuration check (optional)
    if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_CHANNEL_ID) {
      console.warn("⚠️ Discord configuration is incomplete. Bot features will be disabled.")
    }

    // Success message
    if (missingClientVars.length === 0 && missingServerVars.length === 0) {
      console.log("✅ All required environment variables are configured")
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
