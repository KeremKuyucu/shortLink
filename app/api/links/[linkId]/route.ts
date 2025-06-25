import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function DELETE(request: NextRequest, { params }: { params: { linkId: string } }) {
  try {
    const { linkId } = params

    // Link'i bul
    const linkDoc = await adminDb.collection("links").doc(linkId).get()

    if (!linkDoc.exists) {
      return NextResponse.json({ error: "Link bulunamadı" }, { status: 404 })
    }

    const linkData = linkDoc.data()

    // Authorization kontrolü - sadece link sahibi silebilir
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
    }

    // Bu basit bir örnek - gerçek uygulamada Firebase Auth token'ı verify edin
    const userId = authHeader.replace("Bearer ", "")

    if (linkData?.createdBy !== userId) {
      return NextResponse.json({ error: "Bu linki silme yetkiniz yok" }, { status: 403 })
    }

    // Link'i sil
    await linkDoc.ref.delete()

    // Discord'a silme bildirimi gönder
    const embed = {
      title: "🗑️ Link Silindi",
      description: `Bir kısa link silindi`,
      color: 0xff4444, // Kırmızı
      fields: [
        {
          name: "👤 Kullanıcı",
          value: `\`${linkData?.createdByEmail || "Bilinmeyen"}\``,
          inline: true,
        },
        {
          name: "🔗 Silinen Link",
          value: `\`${linkData?.shortCode}\``,
          inline: true,
        },
        {
          name: "📊 Toplam Tıklama",
          value: `**${linkData?.clicks || 0}** kez`,
          inline: true,
        },
        {
          name: "🌐 Orijinal URL",
          value:
            linkData?.originalUrl && linkData.originalUrl.length > 100
              ? `${linkData.originalUrl.substring(0, 100)}...`
              : linkData?.originalUrl || "Bilinmeyen",
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
    }

    return NextResponse.json({ success: true, message: "Link başarıyla silindi" })
  } catch (error) {
    console.error("Link silme hatası:", error)
    return NextResponse.json({ error: "Link silinirken hata oluştu" }, { status: 500 })
  }
}
