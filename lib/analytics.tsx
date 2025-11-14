"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

const gaId = process.env.NEXT_PUBLIC_GA_ID
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function AnalyticsScripts() {
  const [hasConsent, setHasConsent] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const readConsent = () => {
      if (typeof window === "undefined") return
      const allowed = window.localStorage.getItem("consent") === "true"
      setHasConsent(allowed)
      setReady(true)
    }

    readConsent()

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "consent") {
        readConsent()
      }
    }

    const handleCustom = () => readConsent()

    window.addEventListener("storage", handleStorage)
    window.addEventListener("consentchange", handleCustom)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("consentchange", handleCustom)
    }
  }, [])

  if (!ready || !hasConsent || (!gaId && !metaPixelId)) {
    return null
  }

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
            id="ga-loader"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}
    </>
  )
}
