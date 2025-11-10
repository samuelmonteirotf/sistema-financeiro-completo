"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportButtonProps {
  data: any
  fileName: string
  disabled?: boolean
}

export function ExportButton({ data, fileName, disabled = false }: ExportButtonProps) {
  const handleExport = (format: "csv" | "json" | "pdf") => {
    let content = ""
    let type = ""

    if (format === "csv") {
      content = convertToCSV(data)
      type = "text/csv"
    } else if (format === "json") {
      content = JSON.stringify(data, null, 2)
      type = "application/json"
    } else if (format === "pdf") {
      // Simplified PDF export
      content = JSON.stringify(data, null, 2)
      type = "text/plain"
    }

    const element = document.createElement("a")
    element.setAttribute("href", `data:${type};charset=utf-8,${encodeURIComponent(content)}`)
    element.setAttribute("download", `${fileName}.${format}`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const convertToCSV = (data: any) => {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {})
      const rows = data.map((item) => headers.map((header) => item[header]).join(","))
      return [headers.join(","), ...rows].join("\n")
    }
    return JSON.stringify(data)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={disabled}>
        <Download className="w-4 h-4 mr-2" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={disabled}>
        <Download className="w-4 h-4 mr-2" />
        JSON
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={disabled}>
        <Download className="w-4 h-4 mr-2" />
        PDF
      </Button>
    </div>
  )
}
