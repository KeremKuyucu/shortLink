import Link from "next/link"
import { Github, Heart, Code } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Sol taraf - Açık kaynak bilgisi */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code className="h-4 w-4" />
            <span>
              Bu proje <span className="font-medium text-foreground">açık kaynak</span> kodludur
            </span>
          </div>

          {/* Orta - Copyright */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>© 2024 LinkKısa</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> by Kerem Kuyucu
            </span>
          </div>

          {/* Sağ taraf - GitHub linki */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/KeremKuyucu/shortLink"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub'da Görüntüle</span>
              <span className="sm:hidden">GitHub</span>
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              API
            </Link>
          </div>
        </div>

        {/* Alt satır - Ek bilgiler */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Next.js ile geliştirildi</span>
              <span>•</span>
              <span>Firebase ile destekleniyor</span>
              <span>•</span>
              <span>Vercel'de barındırılıyor</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/docs" className="hover:text-foreground transition-colors">
                API
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Gizlilik
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
