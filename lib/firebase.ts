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

  // Fallback değerler (sadece development için)
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ Using fallback Firebase configuration for development")
  }
}

export { auth, db }
export default app
