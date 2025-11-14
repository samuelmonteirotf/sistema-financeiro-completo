import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SessionProvider } from "@/components/providers/session-provider"
import { ConsentBanner } from "@/components/privacy/ConsentBanner"
import { AnalyticsScripts } from "@/lib/analytics"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.seurobo.app"
const isProduction = process.env.NODE_ENV === "production"

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: "Finanço | Plataforma SaaS de controle financeiro",
    template: "%s | Finanço",
  },
  description:
    "Controle financeiro SaaS com Stripe, limites por plano e relatórios avançados. Pix, boleto e LGPD prontos para produção.",
  generator: "Codex CLI",
  keywords: [
    "controle financeiro",
    "SaaS Brasil",
    "Stripe Pix",
    "gestão de despesas",
    "assinaturas",
    "LGPD",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Finanço - Monetize seu controle financeiro",
    description:
      "Landing page pronta para venda de planos com Stripe, limites e auditoria. Ideal para SaaS financeiro.",
    url: appBaseUrl,
    siteName: "Finanço",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Dashboard financeiro com métricas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finanço - SaaS financeiro com Stripe",
    description: "Multi-tenant com limites e billing completo. Lance no Brasil com Pix/Boleto.",
    creator: "@financo_app",
    images: ["/opengraph-image.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="canonical" href={appBaseUrl} />
      </head>
      <body className={`${geistSans.className} ${geistMono.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>{children}</SessionProvider>
          <ConsentBanner />
          {isProduction ? <AnalyticsScripts /> : null}
        </ThemeProvider>
      </body>
    </html>
  )
}
