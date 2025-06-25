import { auth, db } from "./firebase"
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

const SUPER_ADMIN_EMAIL = "kkuyucu2254@gmail.com"

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    // Kullanıcıyı veritabanına kaydet
    const userRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        isApproved: user.email === SUPER_ADMIN_EMAIL,
        role: user.email === SUPER_ADMIN_EMAIL ? "superadmin" : "user",
        createdAt: new Date(),
      })
    }

    return user
  } catch (error) {
    console.error("Google sign-in error:", error)
    throw error
  }
}

export const signOut = () => firebaseSignOut(auth)

export const checkUserPermission = async (uid: string) => {
  const userRef = doc(db, "users", uid)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) return false

  const userData = userDoc.data()
  return userData.isApproved || userData.email === SUPER_ADMIN_EMAIL
}

export const isSuperAdmin = (email: string | null) => {
  return email === SUPER_ADMIN_EMAIL
}
