import { auth, db } from "./firebase"
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { sendDiscordBotMessage, createNewUserEmbed } from "./discord"
import { config } from "./config"

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    // Kullanıcıyı veritabanına kaydet
    const userRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      const userData = {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        isApproved: true, // Artık tüm kullanıcılar otomatik onaylı
        isBanned: false, // Yeni ban field'ı
        role: user.email === config.admin.superAdminEmail ? "superadmin" : "user",
        createdAt: new Date(),
      }

      await setDoc(userRef, userData)

      // Discord'a yeni kullanıcı bildirimi gönder
      if (user.email && user.displayName) {
        const embed = createNewUserEmbed(user.email, user.displayName, user.photoURL || undefined)
        await sendDiscordBotMessage(embed, `🎉 **${user.displayName}** sisteme katıldı!`)
      }
    } else {
      // Mevcut kullanıcı için eksik field'ları güncelle
      const userData = userDoc.data()
      const updates: any = {}

      if (userData.isApproved === undefined) {
        updates.isApproved = true
      }
      if (userData.isBanned === undefined) {
        updates.isBanned = false
      }

      if (Object.keys(updates).length > 0) {
        await setDoc(userRef, updates, { merge: true })
      }
    }

    return user
  } catch (error) {
    console.error("Google sign-in error:", error)
    throw error
  }
}

export const signOut = () => firebaseSignOut(auth)

export const checkUserPermission = async (uid: string) => {
  try {
    const userRef = doc(db, "users", uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) return true // Yeni kullanıcılar için izin ver

    const userData = userDoc.data()
    // Sadece banlı kullanıcıları engelle
    return userData.isBanned !== true
  } catch (error) {
    console.error("Permission check error:", error)
    return true // Hata durumunda izin ver
  }
}

// isSuperAdmin fonksiyonunu güncelle
export const isSuperAdmin = (email: string | null) => {
  if (!email) return false

  // Environment variable'dan super admin email'i al
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || config.admin.superAdminEmail

  console.log("Admin check:", { email, superAdminEmail, match: email === superAdminEmail })

  return email === superAdminEmail
}

// Yeni fonksiyon: Kullanıcının admin yetkisini kontrol et
export const checkAdminPermission = async (uid: string, email: string | null) => {
  // Önce super admin kontrolü
  if (isSuperAdmin(email)) {
    console.log("Super admin detected:", email)
    return true
  }

  // Veritabanından kullanıcı rolünü kontrol et
  try {
    const userRef = doc(db, "users", uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      console.log("User data from DB:", userData)
      return userData.role === "superadmin" || userData.isAdmin === true
    }
  } catch (error) {
    console.error("Admin permission check error:", error)
  }

  return false
}
