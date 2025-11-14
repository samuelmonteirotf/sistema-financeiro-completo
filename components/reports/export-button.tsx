"use client"

import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSubscription } from "@/hooks/useSubscription"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface ExportButtonProps {
  data: any
  fileName: string
  disabled?: boolean
}

export function ExportButton({ data, fileName, disabled = false }: ExportButtonProps) {
  const subscription = useSubscription()
  const { toast } = useToast()
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null)
  const canExport = subscription.can("export_csv")
  const isDisabled = disabled || !canExport || data?.length === 0 || downloading !== null

  const buttons = useMemo(
    () => [
      { format: "csv" as const, label: "CSV" },
      { format: "pdf" as const, label: "PDF" },
      { format: "json" as const, label: "JSON" },
    ],
    []
  )

  const downloadBlob = useCallback((blob: Blob, extension: string) => {
    const url = window.URL.createObjectURL(blob)
    const element = document.createElement("a")
    element.href = url
    element.setAttribute("download", `${fileName}.${extension}`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    window.URL.revokeObjectURL(url)
  }, [fileName])

  const handleRemoteExport = useCallback(
    async (format: "csv" | "pdf") => {
      try {
        setDownloading(format)
        const response = await apiFetch(`/api/export?format=${format}`, {
          method: "POST",
          json: { items: data },
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          throw new Error(errorBody?.error || "Falha ao gerar relatório")
        }

        const blob = await response.blob()
        downloadBlob(blob, format)
        toast({ title: "Download iniciado", description: `Geramos o arquivo ${format.toUpperCase()}.` })
      } catch (error) {
        console.error("Erro ao exportar:", error)
        toast({
          variant: "destructive",
          title: "Erro ao exportar",
          description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        })
      } finally {
        setDownloading(null)
      }
    },
    [data, downloadBlob, toast]
  )

  const handleExport = (format: "csv" | "json" | "pdf") => {
    if (format === "json") {
      const content = JSON.stringify(data, null, 2)
      const blob = new Blob([content], { type: "application/json" })
      downloadBlob(blob, "json")
      return
    }

    void handleRemoteExport(format)
  }

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {buttons.map((button) => (
          <Tooltip key={button.format}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(button.format)}
                disabled={isDisabled}
              >
                <Download className="w-4 h-4 mr-2" />
                {button.format === downloading ? "Gerando..." : button.label}
              </Button>
            </TooltipTrigger>
            {!canExport && (
              <TooltipContent>
                Disponível a partir do plano Pro
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
