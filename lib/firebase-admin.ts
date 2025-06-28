import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { config, validateFirebaseAdminConfig } from "./config"

let adminApp: any = null
let adminDb: any = null

try {
  // Admin configuration'ı validate et
  if (!validateFirebaseAdminConfig()) {
    throw new Error("Firebase Admin configuration is incomplete")
  }

  const firebaseAdminConfig = {
    credential: cert({
      projectId: config.firebaseAdmin.projectId,
      clientEmail: config.firebaseAdmin.clientEmail,
      privateKey: config.firebaseAdmin.privateKey?.replace(/\\n/g, "\n"),
    }),
  }

  // Initialize Firebase Admin
  adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]
  adminDb = getFirestore(adminApp)

  console.log("✅ Firebase Admin initialized successfully")
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error)
}

export { adminDb }
