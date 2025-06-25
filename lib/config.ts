// Environment variables validation
export const config = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  admin: {
    // Client-side'da da kullanabilmek için NEXT_PUBLIC_ prefix'i ekle
    superAdminEmail: process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL,
  },
  // Server-side Firebase config (Admin SDK için)
  firebaseAdmin: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
}

// Validation functions
export function validateFirebaseConfig() {
  const required = ["apiKey", "projectId"]
  const missing = required.filter((key) => !config.firebase[key as keyof typeof config.firebase])

  if (missing.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missing.join(", ")}`)
  }
}

export function validateFirebaseAdminConfig() {
  const required = ["projectId", "clientEmail", "privateKey"]
  const missing = required.filter((key) => !config.firebaseAdmin[key as keyof typeof config.firebaseAdmin])

  if (missing.length > 0) {
    console.error(`Missing Firebase Admin configuration: ${missing.join(", ")}`)
    return false
  }
  return true
}

export function isDevelopment() {
  return process.env.NODE_ENV === "development"
}

export function isProduction() {
  return process.env.NODE_ENV === "production"
}
