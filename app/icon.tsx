import { ImageResponse } from "next/og"

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0f172a, #2563eb)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 32,
          fontWeight: 600,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        F₿
      </div>
    ),
    {
      ...size,
    }
  )
}

