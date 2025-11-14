import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #22d3ee 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "#f8fafc",
          padding: "80px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <p style={{ textTransform: "uppercase", letterSpacing: "0.5em", fontSize: 20, opacity: 0.8 }}>
          FINANÇO • SaaS FINANCEIRO
        </p>
        <h1 style={{ fontSize: 72, lineHeight: 1.1, margin: "24px 0" }}>
          Stripe + Pix + Limites em um único painel de billing
        </h1>
        <p style={{ fontSize: 28, maxWidth: "70%", color: "#e2e8f0" }}>
          Controle financeiro multi-tenant com auditoria LGPD, uso por plano e UI pronta para conversão.
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}

