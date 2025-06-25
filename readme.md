# 🔗 Link Kısaltma Servisi

Modern, güvenli ve özellik açısından zengin bir link kısaltma servisi. Next.js, Firebase ve TypeScript ile geliştirilmiştir.

## ✨ Özellikler

### 🚀 Temel Özellikler
- **Link Kısaltma**: Uzun URL'leri kısa, paylaşılabilir linklere dönüştürün
- **Özel Kısa Kodlar**: İstediğiniz kısa kodu belirleyebilirsiniz
- **QR Kod Üretimi**: Her kısa link için otomatik QR kod
- **Tıklama İstatistikleri**: Detaylı analitik ve raporlama
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

### 🔐 Güvenlik ve Yetkilendirme
- **Firebase Authentication**: Google ile güvenli giriş
- **Admin Panel**: Kullanıcı ve link yönetimi
- **Ban Sistemi**: Kullanıcı banlama/ban kaldırma
- **Güvenli API**: Token tabanlı API erişimi
- **Rate Limiting**: API kötüye kullanım koruması

### 📊 Analitik ve Raporlama
- **Gerçek Zamanlı İstatistikler**: Anlık tıklama verileri
- **Günlük/Haftalık/Aylık Raporlar**: Detaylı analiz
- **Coğrafi Veriler**: Tıklamaların konum bilgisi
- **Referrer Tracking**: Trafik kaynaklarını izleme
- **Dashboard**: Kapsamlı yönetim paneli

### 🛠️ API ve Entegrasyon
- **RESTful API**: Tam özellikli REST API
- **API Token Yönetimi**: Güvenli token sistemi
- **Webhook Desteği**: Discord entegrasyonu
- **SDK Desteği**: JavaScript, Python, PHP, Go
- **OpenAPI Dokümantasyonu**: Kapsamlı API rehberi

## 🏗️ Teknoloji Stack

### Frontend
- **Next.js 14**: React framework (App Router)
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Modern UI component library
- **Lucide React**: Beautiful icons

### Backend
- **Firebase**: Backend-as-a-Service
  - **Authentication**: Kullanıcı yönetimi
  - **Firestore**: NoSQL veritabanı
  - **Admin SDK**: Server-side işlemler
- **Vercel**: Deployment ve hosting

### Entegrasyonlar
- **Discord**: Webhook bildirimleri
- **QR Code**: Otomatik QR kod üretimi
- **Analytics**: Detaylı kullanım istatistikleri

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm/yarn/pnpm
- Firebase projesi
- Vercel hesabı (opsiyonel)

### 1. Projeyi Klonlayın
\`\`\`bash
git clone https://github.com/KeremKuyucu/shortLink.git
cd link-shortener
\`\`\`

### 2. Bağımlılıkları Yükleyin
\`\`\`bash
npm install
# veya
yarn install
# veya
pnpm install
\`\`\`

### 3. Environment Variables
`.env.local` dosyası oluşturun:

\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Discord Integration
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_channel_id

# Admin Configuration
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_EMAIL=admin@example.com
\`\`\`

### 4. Firebase Kurulumu

#### Firestore Rules
\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

#### Firestore Indexes
\`\`\`bash
firebase deploy --only firestore:indexes
\`\`\`

### 5. Geliştirme Sunucusunu Başlatın
\`\`\`bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
\`\`\`

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📖 Kullanım

### Temel Kullanım

1. **Kayıt Olun**: Google hesabınızla giriş yapın
2. **Link Kısaltın**: Ana sayfada URL'nizi girin
3. **Paylaşın**: Oluşturulan kısa linki paylaşın
4. **İzleyin**: Dashboard'da istatistikleri görün

### API Kullanımı

#### Token Oluşturma
\`\`\`bash
curl -X POST https://link.keremkk.com.tr/api/v1/tokens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Token", "permissions": ["links:read", "links:write"]}'
\`\`\`

#### Link Kısaltma
\`\`\`bash
curl -X POST https://link.keremkk.com.tr/api/v1/links \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "link.keremkk.com.tr", "customCode": "my-link"}'
\`\`\`

#### İstatistik Alma
\`\`\`bash
curl -X GET https://link.keremkk.com.tr/api/v1/stats \
  -H "Authorization: Bearer YOUR_API_TOKEN"
\`\`\`

## 🔧 Konfigürasyon

### Firebase Firestore Rules
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - sadece kendi verilerini okuyabilir
    match /users/{userId} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin')
      );
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    
    // Helper function to check user status
    function isUserAllowed() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return userDoc != null && 
             (userDoc.data.isApproved == true || userDoc.data.isApproved == null) &&
             userDoc.data.isBanned != true;
    }
    
    // Links collection - authenticated users can access
    match /links/{linkId} {
      allow read, write, list: if request.auth != null;
      allow read: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // API Tokens collection - sadece token sahibi erişebilir
    match /apiTokens/{tokenId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
        
      // Collection query için list permission
      allow list: if request.auth != null;
    }
    
    // Public read için links (redirect için)
    match /links/{linkId} {
      allow read: if true; // Public read for redirects
    }
  }
}
\`\`\`

### Discord Webhook
Discord entegrasyonu için:
1. Discord sunucunuzda webhook oluşturun
2. Bot token'ı alın
3. Kanal ID'sini kopyalayın
4. Environment variables'a ekleyin

## 📊 API Dokümantasyonu

Kapsamlı API dokümantasyonu için: [/docs](https://yourapp.com/docs)

### Endpoint'ler
- `GET /api/v1` - API bilgileri
- `POST /api/v1/links` - Link oluştur
- `GET /api/v1/links` - Link listesi
- `DELETE /api/v1/links/:id` - Link sil
- `GET /api/v1/stats` - İstatistikler
- `POST /api/v1/tokens` - Token oluştur
- `DELETE /api/v1/tokens/:id` - Token sil

### Rate Limiting
- **Authenticated**: 1000 istek/saat
- **Anonymous**: 100 istek/saat
- **API Token**: 5000 istek/saat

## 🛡️ Güvenlik

### Güvenlik Özellikleri
- **HTTPS Only**: Tüm trafik şifreli
- **CSRF Protection**: Cross-site request forgery koruması
- **Input Validation**: Tüm girişler doğrulanır
- **Rate Limiting**: API kötüye kullanım koruması
- **Admin Controls**: Kullanıcı ve içerik yönetimi

### Güvenlik Raporlama
Güvenlik açığı bulursanız: security@yourapp.com

## 🚀 Deployment

### Vercel (Önerilen)
\`\`\`bash
# Vercel CLI ile
vercel --prod

# GitHub entegrasyonu ile otomatik deployment
\`\`\`

### Docker
\`\`\`bash
# Docker image oluştur
docker build -t link-shortener .

# Container çalıştır
docker run -p 3000:3000 link-shortener
\`\`\`

### Manuel Deployment
\`\`\`bash
# Build
npm run build

# Start
npm start
\`\`\`

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Development Guidelines
- TypeScript kullanın
- ESLint kurallarına uyun
- Test yazın
- Commit mesajlarını açıklayıcı yapın

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- ✅ İlk stabil sürüm
- ✅ Temel link kısaltma
- ✅ Firebase entegrasyonu
- ✅ Admin panel
- ✅ API sistemi
- ✅ Discord entegrasyonu

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🆘 Destek

### Dokümantasyon
- [API Dokümantasyonu](/docs)
- [Kullanıcı Rehberi](/guide)
- [SSS](/faq)

### İletişim
- **Email**: support@keremkk.com.tr
- **GitHub Issues**: [Issues](https://github.com/yourusername/link-shortener/issues)
- **Discord**: [Discord Server](https://discord.gg/yourserver)

### Yararlı Linkler
- [Firebase Dokümantasyonu](https://firebase.google.com/docs)
- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com)

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by [Kerem Kuyucu](https://github.com/KeremKuyucu)
