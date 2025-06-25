import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { config, validateFirebaseConfig } from "./config"

let app: any = null
let auth: any = null
let db: any = null

try {
  // Validate configuration before initializing
  validateFirebaseConfig()

  const firebaseConfig = {
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
    measurementId: config.firebase.measurementId,
  }

  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  console.log("✅ Firebase Client initialized successfully")
} catch (error) {
  console.error("❌ Firebase Client initialization failed:", error)

  // Development ortamında daha detaylı hata
  if (process.env.NODE_ENV === "development") {
    console.error("Make sure you have set the following environment variables:")
    console.error("- NEXT_PUBLIC_FIREBASE_API_KEY")
    console.error("- NEXT_PUBLIC_FIREBASE_PROJECT_ID")
    console.error("- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (optional)")
    console.error("- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (optional)")
    console.error("- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (optional)")
    console.error("- NEXT_PUBLIC_FIREBASE_APP_ID (optional)")
    console.error("- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)")
  }

  // Fallback değerler (sadece development için)
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ Using fallback Firebase configuration for development")
  }
}

export { auth, db }
export default app
