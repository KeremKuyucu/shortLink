declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Firebase Configuration (Client-side - Public)
      NEXT_PUBLIC_FIREBASE_API_KEY: string
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string
      NEXT_PUBLIC_FIREBASE_APP_ID?: string
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string

      // Firebase Admin (Server-side - Private)
      FIREBASE_PROJECT_ID: string
      FIREBASE_CLIENT_EMAIL: string
      FIREBASE_PRIVATE_KEY: string

      // Discord Configuration
      DISCORD_BOT_TOKEN?: string
      DISCORD_CHANNEL_ID?: string

      // Admin Configuration (Both client and server-side)
      NEXT_PUBLIC_SUPER_ADMIN_EMAIL?: string
      SUPER_ADMIN_EMAIL?: string

      // Next.js
      NODE_ENV: "development" | "production" | "test"
      VERCEL_URL?: string
    }
  }
}

export {}
