export interface APIToken {
  id: string
  name: string
  token: string
  userId: string
  userEmail: string
  permissions: APIPermission[]
  rateLimit: number // requests per hour
  usageCount: number
  lastUsed?: Date
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface APIPermission {
  resource: "links" | "stats" | "tokens"
  actions: ("create" | "read" | "update" | "delete")[]
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateLinkRequest {
  originalUrl: string
  customUrl?: string
}

export interface CreateLinkResponse {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  isCustom: boolean
  clicks: number
  createdAt: string
}

export interface LinkStatsResponse {
  totalLinks: number
  totalClicks: number
  recentLinks: {
    id: string
    shortCode: string
    originalUrl: string
    clicks: number
    createdAt: string
  }[]
  clicksOverTime: {
    date: string
    clicks: number
  }[]
}

export interface CreateTokenRequest {
  name: string
  permissions: APIPermission[]
  rateLimit?: number
  expiresAt?: string
}
