# 🔗 Link Kısaltma Servisi

Modern, güvenli ve özellik açısından zengin bir link kısaltma servisi. Next.js, Firebase ve TypeScript ile geliştirilmiştir.

-----

## ✨ Özellikler

### 🚀 Temel Özellikler

  - **Link Kısaltma**: Uzun URL'leri kısa, paylaşılabilir linklere dönüştürün.
  - **Özel Kısa Kodlar**: İstediğiniz kısa kodu belirleme imkanı.
  - **Tıklama İstatistikleri**: Detaylı analitik ve raporlama.
  - **Duyarlı Tasarım (Responsive)**: Tüm cihazlarda sorunsuz kullanım deneyimi.

### 🔐 Güvenlik ve Yetkilendirme

  - **Firebase Authentication**: Google ile güvenli giriş.
  - **Yönetici Paneli (Admin Panel)**: Kullanıcı ve link yönetimi.
  - **Yasaklama Sistemi (Ban System)**: Kullanıcıları yasaklama/yasağını kaldırma.
  - **Güvenli API**: Token tabanlı API erişimi.
  - **Oran Sınırlandırma (Rate Limiting)**: API kötüye kullanımına karşı koruma.

### 📊 Analitik ve Raporlama

  - **Gerçek Zamanlı İstatistikler**: Anlık tıklama verileri.
  - **Günlük/Haftalık/Aylık Raporlar**: Detaylı analizler.
  - **Coğrafi Veriler**: Tıklamaların konum bilgileri.
  - **Yönlendiren Takibi (Referrer Tracking)**: Trafik kaynaklarını izleme.
  - **Kontrol Paneli (Dashboard)**: Kapsamlı yönetim paneli.

### 🛠️ API ve Entegrasyon

  - **RESTful API**: Tam özellikli REST API.
  - **API Token Yönetimi**: Güvenli token sistemi.
  - **Webhook Desteği**: Discord entegrasyonu.
  - **SDK Desteği**: JavaScript, Python, PHP, Go dilleri için SDK desteği.
  - **OpenAPI Dokümantasyonu**: Kapsamlı API rehberi.

-----

## 🏗️ Teknoloji Yığını (Technology Stack)

### Frontend

  - **Next.js 14**: React framework (App Router).
  - **TypeScript**: Tip güvenli (type-safe) geliştirme.
  - **Tailwind CSS**: Utility-first CSS framework.
  - **Shadcn/UI**: Modern UI bileşen kütüphanesi.
  - **Lucide React**: Güzel ikonlar.

### Backend

  - **Firebase**: Backend-as-a-Service.
      - **Authentication**: Kullanıcı yönetimi.
      - **Firestore**: NoSQL veritabanı.
      - **Admin SDK**: Sunucu tarafı işlemler.
  - **Vercel**: Dağıtım ve barındırma.

### Entegrasyonlar

  - **Discord**: Webhook bildirimleri.
  - **QR Code**: Otomatik QR kod üretimi.
  - **Analytics**: Detaylı kullanım istatistikleri.

-----

## 🚀 Kurulum

### Gereksinimler

  - Node.js 18+
  - npm/yarn/pnpm
  - Firebase projesi
  - Vercel hesabı (isteğe bağlı)

### 1\. Projeyi Klonlayın

```bash
git clone https://github.com/keremkuyucu/shortlink.git
cd link-shortener
```

### 2\. Bağımlılıkları Yükleyin

```bash
npm install
# veya
yarn install
# veya
pnpm install
```

### 3\. Ortam Değişkenleri (Environment Variables)

`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Sunucu tarafı)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Discord Entegrasyonu
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_channel_id

# Yönetici (Admin) Konfigürasyonu
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_EMAIL=admin@example.com
```

### 4\. Firebase Kurulumu

#### Firestore Kuralları (Rules)

```bash
firebase deploy --only firestore:rules
```

#### Firestore İndeksleri (Indexes)

```bash
firebase deploy --only firestore:indexes
```

### 5\. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

-----

## 📖 Kullanım

### Temel Kullanım

1.  **Kaydolun**: Google hesabınızla giriş yapın.
2.  **Link Kısaltın**: Ana sayfada URL'nizi girin.
3.  **Paylaşın**: Oluşturulan kısa linki paylaşın.
4.  **İzleyin**: Kontrol panelinde istatistikleri görün.

### API Kullanımı

#### Token Oluşturma

```bash
curl -X POST https://kisalink.keremkk.com.tr/api/v1/tokens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Token", "permissions": ["links:read", "links:write"]}'
```

#### Link Kısaltma

```bash
curl -X POST https://kisalink.keremkk.com.tr/api/v1/links \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://kisalink.keremkk.com.tr", "customCode": "my-link"}'
```

#### İstatistik Alma

```bash
curl -X GET https://kisalink.keremkk.com.tr/api/v1/stats \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

-----

## 🔧 Konfigürasyon

### Firebase Firestore Kuralları

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar koleksiyonu - Sadece kendi verilerini okuyabilir ve yazabilir.
    // Superadmin rolündeki kullanıcılar tüm kullanıcı verilerini okuyabilir.
    match /users/{userId} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin')
      );
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Kullanıcının durumunu kontrol eden yardımcı fonksiyon (onaylı ve yasaklı değil)
    function isUserAllowed() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return userDoc != null &&
             (userDoc.data.isApproved == true || userDoc.data.isApproved == null) &&
             userDoc.data.isBanned != true;
    }

    // Linkler koleksiyonu - Kimliği doğrulanmış kullanıcılar kendi linklerini okuyabilir, oluşturabilir ve güncelleyebilir.
    // Tüm linkler herkese açık olarak okunabilir (yönlendirme için).
    match /links/{linkId} {
      // Kimliği doğrulanmış kullanıcılar kendi linklerini okuyabilir
      allow read: if request.auth != null && resource.data.createdBy == request.auth.uid;
      // Kimliği doğrulanmış kullanıcılar link oluşturabilir ve güncelleyebilir
      allow create, update: if request.auth != null && request.resource.data.createdBy == request.auth.uid;
      // Kimliği doğrulanmış kullanıcılar kendi linklerini listeleyebilir
      allow list: if request.auth != null;
      // HERKESE AÇIK OKUMA (yönlendirme için)
      allow read: if true;
    }

    // API Tokenları koleksiyonu - Sadece token sahibi erişebilir.
    match /apiTokens/{tokenId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;

      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;

      // Koleksiyon sorgusu için list izni
      allow list: if request.auth != null;
    }
  }
}
```

### Discord Webhook Entegrasyonu

Discord entegrasyonu için aşağıdaki adımları izleyin:

1.  Discord sunucunuzda bir **webhook** oluşturun.
2.  İlgili **bot token**'ı alın.
3.  İletişim kurulacak **kanal ID**'sini kopyalayın.
4.  Bu bilgileri `.env.local` dosyanızdaki ortam değişkenlerine ekleyin.

-----
### Endpoint'ler

  - `GET /api/v1` - API bilgileri
  - `POST /api/v1/links` - Link oluştur
  - `GET /api/v1/links` - Link listesi
  - `DELETE /api/v1/links/:id` - Link sil
  - `GET /api/v1/stats` - İstatistikler
  - `POST /api/v1/tokens` - Token oluştur
  - `DELETE /api/v1/tokens/:id` - Token sil

### Oran Sınırlandırma (Rate Limiting)

  - **Kimliği Doğrulanmış Kullanıcılar**: 1000 istek/saat
  - **Anonim Kullanıcılar**: 100 istek/saat
  - **API Token**: 5000 istek/saat

-----

## 🛡️ Güvenlik

### Güvenlik Özellikleri

  - **HTTPS Only**: Tüm trafik şifrelidir.
  - **CSRF Koruması**: Cross-site request forgery saldırılarına karşı koruma.
  - **Girdi Doğrulama (Input Validation)**: Tüm kullanıcı girişleri doğrulanır.
  - **Oran Sınırlandırma (Rate Limiting)**: API kötüye kullanımına karşı koruma.
  - **Yönetici Kontrolleri (Admin Controls)**: Kullanıcı ve içerik yönetimi.

### Güvenlik Raporlama

Güvenlik açığı bulursanız lütfen şu adrese bildirin: `security@yourapp.com`

-----

## 🚀 Dağıtım (Deployment)

### Vercel (Önerilen)

```bash
# Vercel CLI ile
vercel --prod
```

Veya GitHub entegrasyonu ile otomatik dağıtım yapabilirsiniz.

### Docker

```bash
# Docker imajı oluştur
docker build -t link-shortener .

# Konteyneri çalıştır
docker run -p 3000:3000 link-shortener
```

### Manuel Dağıtım

```bash
# Projeyi derle (Build)
npm run build

# Uygulamayı başlat (Start)
npm start
```

-----

## 🤝 Katkıda Bulunma

1.  Projeyi çatallayın (Fork edin).
2.  Yeni bir özellik dalı oluşturun (`git checkout -b feature/harika-ozellik`).
3.  Değişikliklerinizi kaydedin (`git commit -m 'Harika özellik eklendi'`).
4.  Değişiklikleri uzak depoya itin (`git push origin feature/harika-ozellik`).
5.  Bir Çekme İsteği (Pull Request) açın.

### Geliştirme Kılavuzları

  - TypeScript kullanın.
  - ESLint kurallarına uyun.
  - Test yazın.
  - Commit mesajlarını açıklayıcı yapın.

-----

## 📄 Lisans

Bu proje **GPL lisansı** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

-----

## 🆘 Destek

### Dokümantasyon

  - [API Dokümantasyonu](https://kisalink.keremkk.com.tr/docs)
  - [Terms](https://kisalink.keremkk.com.tr/terms)
  - [privacy](https://kisalink.keremkk.com.tr/privacy)

### İletişim

  - **E-posta**: `support@keremkk.com.tr`
  - **GitHub Sorunlar (Issues)**: [Issues](https://github.com/keremkuyucu/shortLink/issues)

### Yararlı Linkler

  - [Firebase Dokümantasyonu](https://firebase.google.com/docs)
  - [Next.js Dokümantasyonu](https://nextjs.org/docs)
  - [Tailwind CSS](https://tailwindcss.com/docs)
  - [Shadcn/UI](https://ui.shadcn.com)

-----

Made with ❤️ by [Kerem Kuyucu](https://github.com/KeremKuyucu)
