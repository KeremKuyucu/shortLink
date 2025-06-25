import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Database, Lock } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gizlilik Politikası</h1>
        <p className="text-muted-foreground">
          LinkKısa olarak kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Toplanan Veriler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Hesap Bilgileri</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Google hesabınızdan gelen e-posta adresi</li>
                <li>Profil resmi ve isim bilgisi</li>
                <li>Hesap oluşturma tarihi</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Link Verileri</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Kısalttığınız URL'ler</li>
                <li>Oluşturduğunuz kısa kodlar</li>
                <li>Tıklama istatistikleri</li>
                <li>Link oluşturma tarihleri</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Veri Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Servis işlevselliğini sağlamak için</li>
              <li>Kullanıcı deneyimini iyileştirmek için</li>
              <li>İstatistiksel analiz için (anonim)</li>
              <li>Güvenlik ve spam koruması için</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Veri Güvenliği
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Verileriniz Firebase güvenli sunucularında saklanır</li>
              <li>HTTPS şifreleme ile korunur</li>
              <li>Sadece gerekli personel erişim sağlayabilir</li>
              <li>Düzenli güvenlik güncellemeleri yapılır</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Açık Kaynak Taahhüdü
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              LinkKısa açık kaynak bir projedir. Kaynak kodlarımızı GitHub'da inceleyebilir, veri işleme süreçlerimizi
              şeffaf bir şekilde görebilirsiniz.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Tüm kod GitHub'da açık olarak mevcuttur</li>
              <li>Veri işleme süreçleri şeffaftır</li>
              <li>Topluluk katkılarına açığız</li>
              <li>Güvenlik açıkları hızla giderilir</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İletişim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gizlilik politikamız hakkında sorularınız varsa, GitHub üzerinden issue açabilir veya e-posta ile
              iletişime geçebilirsiniz.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Son güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
