import { RedirectClient } from "./redirect-client"

interface RedirectPageProps {
  params: {
    shortCode: string
  }
}

export default function RedirectPage({ params }: RedirectPageProps) {
  return <RedirectClient shortCode={params.shortCode} />
}
