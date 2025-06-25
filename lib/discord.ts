import { config, validateDiscordConfig } from "./config"

interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

interface DiscordEmbed {
  title: string
  description?: string
  color: number
  fields?: DiscordEmbedField[]
  timestamp: string
  footer?: {
    text: string
    icon_url?: string
  }
  thumbnail?: {
    url: string
  }
}

interface DiscordMessage {
  embeds: DiscordEmbed[]
  content?: string
}

export async function sendDiscordBotMessage(embed: DiscordEmbed, content?: string) {
  // Check if Discord is configured
  if (!validateDiscordConfig()) {
    console.log("Discord not configured, skipping message")
    return
  }

  try {
    const message: DiscordMessage = {
      embeds: [embed],
      ...(content && { content }),
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${config.discord.channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${config.discord.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Failed to send Discord bot message:", response.statusText, errorData)
    } else {
      console.log("Discord message sent successfully")
    }
  } catch (error) {
    console.error("Error sending Discord bot message:", error)
  }
}

export function createNewUserEmbed(userEmail: string, userName: string, userPhoto?: string) {
  return {
    title: "🆕 Yeni Kullanıcı Kaydı",
    description: "Sisteme yeni bir kullanıcı kaydoldu ve otomatik olarak onaylandı!",
    color: 0x00ff00, // Yeşil
    fields: [
      {
        name: "📧 Email",
        value: `\`${userEmail}\``,
        inline: true,
      },
      {
        name: "👤 İsim",
        value: userName || "Belirtilmemiş",
        inline: true,
      },
      {
        name: "✅ Durum",
        value: "Otomatik Onaylı",
        inline: true,
      },
      {
        name: "📅 Kayıt Tarihi",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Kullanıcı Sistemi",
    },
    ...(userPhoto && {
      thumbnail: {
        url: userPhoto,
      },
    }),
  }
}

export function createNewLinkEmbed(
  userEmail: string,
  originalUrl: string,
  shortCode: string,
  isCustom: boolean,
  userPhoto?: string,
) {
  const shortUrl = `https://link.keremkk.com.tr/${shortCode}`

  return {
    title: "🔗 Yeni Link Oluşturuldu",
    description: `${isCustom ? "Özel" : "Otomatik"} kısa link oluşturuldu`,
    color: 0x0099ff, // Mavi
    fields: [
      {
        name: "👤 Kullanıcı",
        value: `\`${userEmail}\``,
        inline: true,
      },
      {
        name: "🎯 Tip",
        value: isCustom ? "🎨 Özel URL" : "🤖 Otomatik",
        inline: true,
      },
      {
        name: "🔗 Kısa Link",
        value: `[${shortCode}](${shortUrl})`,
        inline: false,
      },
      {
        name: "🌐 Orijinal URL",
        value: originalUrl.length > 100 ? `${originalUrl.substring(0, 100)}...` : originalUrl,
        inline: false,
      },
      {
        name: "📅 Oluşturulma",
        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Link Sistemi",
    },
    ...(userPhoto && {
      thumbnail: {
        url: userPhoto,
      },
    }),
  }
}

export function createLinkClickEmbed(
  shortCode: string,
  originalUrl: string,
  totalClicks: number,
  userAgent?: string,
  ipAddress?: string,
) {
  const shortUrl = `https://link.keremkk.com.tr/${shortCode}`

  // User Agent'tan tarayıcı ve işletim sistemi bilgisi çıkar
  const getBrowserInfo = (ua: string) => {
    if (ua.includes("Chrome")) return "🌐 Chrome"
    if (ua.includes("Firefox")) return "🦊 Firefox"
    if (ua.includes("Safari")) return "🧭 Safari"
    if (ua.includes("Edge")) return "🔷 Edge"
    return "❓ Bilinmeyen"
  }

  const getOSInfo = (ua: string) => {
    if (ua.includes("Windows")) return "🪟 Windows"
    if (ua.includes("Mac")) return "🍎 macOS"
    if (ua.includes("Linux")) return "🐧 Linux"
    if (ua.includes("Android")) return "🤖 Android"
    if (ua.includes("iPhone") || ua.includes("iPad")) return "📱 iOS"
    return "❓ Bilinmeyen"
  }

  // Bot detection
  const isBotRequest = (ua: string) => {
    const botPatterns = [
      /discordbot/i,
      /discord/i,
      /whatsapp/i,
      /telegrambot/i,
      /telegram/i,
      /twitterbot/i,
      /twitter/i,
      /facebookexternalhit/i,
      /facebook/i,
      /linkedinbot/i,
      /linkedin/i,
      /slackbot/i,
      /slack/i,
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /preview/i,
      /unfurl/i,
      /embed/i,
    ]
    return botPatterns.some((pattern) => pattern.test(ua))
  }

  const isBot = userAgent ? isBotRequest(userAgent) : false

  return {
    title: "👆 Link Tıklandı",
    description: `**${shortCode}** kısa linki tıklandı ${isBot ? "(Bot/Preview filtrelendi)" : ""}`,
    color: isBot ? 0x888888 : 0xff9900, // Bot ise gri, değilse turuncu
    fields: [
      {
        name: "🔗 Kısa Link",
        value: `[${shortCode}](${shortUrl})`,
        inline: true,
      },
      {
        name: "📊 Toplam Tıklama",
        value: `**${totalClicks}** kez`,
        inline: true,
      },
      {
        name: "🕐 Tıklama Zamanı",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true,
      },
      {
        name: "🌐 Hedef URL",
        value: originalUrl.length > 100 ? `${originalUrl.substring(0, 100)}...` : originalUrl,
        inline: false,
      },
      ...(userAgent
        ? [
            {
              name: "🖥️ Tarayıcı",
              value: getBrowserInfo(userAgent),
              inline: true,
            },
            {
              name: "💻 İşletim Sistemi",
              value: getOSInfo(userAgent),
              inline: true,
            },
            ...(isBot
              ? [
                  {
                    name: "🤖 Bot/Preview",
                    value: "✅ Tespit edildi",
                    inline: true,
                  },
                ]
              : []),
          ]
        : []),
      ...(ipAddress && ipAddress !== "Bilinmeyen"
        ? [
            {
              name: "🌍 IP Adresi",
              value: `\`${ipAddress}\``,
              inline: true,
            },
          ]
        : []),
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Tıklama Sistemi",
    },
  }
}

export function createUserBanEmbed(userEmail: string, userName: string, isBanned: boolean, userPhoto?: string) {
  return {
    title: isBanned ? "🚫 Kullanıcı Banlandı" : "✅ Kullanıcı Ban Kaldırıldı",
    description: `Bir kullanıcının ban durumu **${isBanned ? "banlandı" : "kaldırıldı"}**`,
    color: isBanned ? 0xff0000 : 0x00ff00, // Kırmızı veya Yeşil
    fields: [
      {
        name: "📧 Email",
        value: `\`${userEmail}\``,
        inline: true,
      },
      {
        name: "👤 İsim",
        value: userName || "Belirtilmemiş",
        inline: true,
      },
      {
        name: "📊 Yeni Durum",
        value: isBanned ? "🚫 **Banlı**" : "✅ **Aktif**",
        inline: true,
      },
      {
        name: "🕐 İşlem Zamanı",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Admin Sistemi",
    },
    ...(userPhoto && {
      thumbnail: {
        url: userPhoto,
      },
    }),
  }
}

export function createDailyStatsEmbed(stats: {
  totalUsers: number
  newUsersToday: number
  totalLinks: number
  newLinksToday: number
  totalClicks: number
  clicksToday: number
}) {
  return {
    title: "📊 Günlük İstatistikler",
    description: `${new Date().toLocaleDateString("tr-TR")} tarihli sistem özeti`,
    color: 0x9932cc, // Mor
    fields: [
      {
        name: "👥 Toplam Kullanıcı",
        value: `**${stats.totalUsers}** (+${stats.newUsersToday} bugün)`,
        inline: true,
      },
      {
        name: "🔗 Toplam Link",
        value: `**${stats.totalLinks}** (+${stats.newLinksToday} bugün)`,
        inline: true,
      },
      {
        name: "👆 Toplam Tıklama",
        value: `**${stats.totalClicks}** (+${stats.clicksToday} bugün)`,
        inline: true,
      },
      {
        name: "📈 Günlük Aktivite",
        value: `${stats.newUsersToday + stats.newLinksToday + stats.clicksToday} toplam işlem`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Günlük Rapor",
    },
  }
}

// Link silme embed'i
export function createLinkDeleteEmbed(
  userEmail: string,
  shortCode: string,
  originalUrl: string,
  totalClicks: number,
  userPhoto?: string,
) {
  return {
    title: "🗑️ Link Silindi",
    description: `Bir kısa link silindi`,
    color: 0xff4444, // Kırmızı
    fields: [
      {
        name: "👤 Kullanıcı",
        value: `\`${userEmail}\``,
        inline: true,
      },
      {
        name: "🔗 Silinen Link",
        value: `\`${shortCode}\``,
        inline: true,
      },
      {
        name: "📊 Toplam Tıklama",
        value: `**${totalClicks}** kez`,
        inline: true,
      },
      {
        name: "🌐 Orijinal URL",
        value: originalUrl.length > 100 ? `${originalUrl.substring(0, 100)}...` : originalUrl,
        inline: false,
      },
      {
        name: "🕐 Silme Zamanı",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Link Yönetimi",
    },
    ...(userPhoto && {
      thumbnail: {
        url: userPhoto,
      },
    }),
  }
}

// Sistem durumu için
export function createSystemStatusEmbed(status: "online" | "maintenance" | "error", message?: string) {
  const colors = {
    online: 0x00ff00,
    maintenance: 0xffaa00,
    error: 0xff0000,
  }

  const emojis = {
    online: "🟢",
    maintenance: "🟡",
    error: "🔴",
  }

  const titles = {
    online: "Sistem Çevrimiçi",
    maintenance: "Bakım Modu",
    error: "Sistem Hatası",
  }

  return {
    title: `${emojis[status]} ${titles[status]}`,
    description: message || "Sistem durumu güncellendi",
    color: colors[status],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Sistem Durumu",
    },
  }
}

// Hata raporlama için
export function createErrorEmbed(error: string, context: string, userId?: string) {
  return {
    title: "🚨 Sistem Hatası",
    description: "Sistemde bir hata meydana geldi",
    color: 0xff0000, // Kırmızı
    fields: [
      {
        name: "❌ Hata",
        value: `\`\`\`${error.substring(0, 500)}\`\`\``,
        inline: false,
      },
      {
        name: "📍 Konum",
        value: context,
        inline: true,
      },
      ...(userId
        ? [
            {
              name: "👤 Kullanıcı ID",
              value: `\`${userId}\``,
              inline: true,
            },
          ]
        : []),
      {
        name: "🕐 Zaman",
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "LinkKısa - Hata Sistemi",
    },
  }
}
