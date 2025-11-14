"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const CONSENT_KEY = "consent"

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(CONSENT_KEY)
    setIsVisible(stored === null)
  }, [])

  const updateConsent = (value: boolean) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(CONSENT_KEY, value ? "true" : "false")
    window.dispatchEvent(new Event("consentchange"))
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <Card className="max-w-2xl w-full shadow-lg border border-primary/20">
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">Usamos cookies para analytics</p>
            <p className="text-sm text-muted-foreground">
              Podemos coletar métricas anônimas para melhorar o produto. Você pode aceitar ou recusar quando quiser.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Button variant="outline" onClick={() => updateConsent(false)}>
              Recusar
            </Button>
            <Button onClick={() => updateConsent(true)}>
              Aceitar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
