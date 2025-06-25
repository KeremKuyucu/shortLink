import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function isValidCustomUrl(customUrl: string): boolean {
  // 3-20 karakter arası, sadece harf, rakam, tire ve alt çizgi
  const regex = /^[a-zA-Z0-9\-_]{3,20}$/

  // Yasaklı kelimeler (sistem sayfaları)
  const reservedWords = [
    "admin",
    "api",
    "www",
    "mail",
    "ftp",
    "localhost",
    "dashboard",
    "login",
    "register",
    "signup",
    "signin",
    "auth",
    "callback",
    "settings",
    "profile",
    "account",
    "help",
    "support",
    "about",
    "contact",
    "privacy",
    "terms",
    "legal",
    "blog",
    "news",
  ]

  return regex.test(customUrl) && !reservedWords.includes(customUrl.toLowerCase())
}
