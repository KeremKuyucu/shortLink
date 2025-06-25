import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, Users, Code } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kullanım Şartları</h1>
        <p className="text-muted-foreground">
          LinkKısa servisini kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Servis Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Servis ücretsiz olarak sunulmaktadır</li>
              <li>Hesap oluşturmak için Google hesabı gereklidir</li>
              <li>Yönetici onayı sonrası servisi kullanabilirsiniz</li>
              <li>Kısaltılmış linkler kalıcı olarak saklanır</li>
              <li>Servis 7/24 kullanılabilir olmaya çalışılır</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Yasaklı Kullanımlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Zararlı, yasadışı veya spam içerik paylaşımı</li>
              <li>Telif hakkı ihlali içeren materyaller</li>
              <li>Phishing veya dolandırıcılık amaçlı linkler</li>
              <li>Malware veya virüs içeren siteler</li>
              <li>Nefret söylemi veya taciz içeriği</li>
              <li>Sistem güvenliğini tehdit eden aktiviteler</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kullanıcı Sorumlulukları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz</li>
              <li>Paylaştığınız linklerin içeriğinden sorumlusunuz</li>
              <li>Servisi kötüye kullanmamayı taahhüt edersiniz</li>
              <li>Şüpheli aktiviteleri bildirmeyi kabul edersiniz</li>
              <li>Yasal gerekliliklere uymayı kabul edersiniz</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Açık Kaynak Lisansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                LinkKısa açık kaynak bir projedir ve MIT lisansı altında yayınlanmaktadır.
              </p>

              <div>
                <h3 className="font-semibold mb-2">MIT Lisansı Özeti</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Kaynak kodu serbestçe kullanılabilir</li>
                  <li>Ticari amaçlarla kullanılabilir</li>
                  <li>Değiştirilebilir ve dağıtılabilir</li>
                  <li>Lisans metni korunmalıdır</li>
                  <li>Garanti verilmez, sorumluluk kabul edilmez</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">Tam lisans metni GitHub repository'sinde mevcuttur.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servis Değişiklikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Servis özelliklerinde değişiklik yapma hakkımız saklıdır</li>
              <li>Önemli değişiklikler önceden duyurulur</li>
              <li>Kullanım şartları güncellenebilir</li>
              <li>Güncellemeler bu sayfada yayınlanır</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sorumluluk Reddi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              LinkKısa servisi "olduğu gibi" sunulmaktadır. Servisin kesintisiz çalışacağı garanti edilmez.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Veri kaybından sorumlu değiliz</li>
              <li>Servis kesintilerinden sorumlu değiliz</li>
              <li>Üçüncü taraf içeriklerden sorumlu değiliz</li>
              <li>Kullanıcı eylemlerinden sorumlu değiliz</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İletişim ve Destek</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kullanım şartları hakkında sorularınız için GitHub üzerinden issue açabilir veya topluluk forumlarını
              kullanabilirsiniz.
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
