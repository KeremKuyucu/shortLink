import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCQkSB0MUl2Seti5Or5qicsWlDlIGcNDGM",
  authDomain: "keremkk-auth.firebaseapp.com",
  projectId: "keremkk-auth",
  storageBucket: "keremkk-auth.firebasestorage.app",
  messagingSenderId: "645967433817",
  appId: "1:645967433817:web:8c938f633f7043bdd76148",
  measurementId: "G-83T4YB6WQN",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
