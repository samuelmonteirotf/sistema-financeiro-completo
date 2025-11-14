"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface LimitBadgeProps {
  label: string
  used: number
  limit: number
  description?: string
}

export function LimitBadge({ label, used, limit, description }: LimitBadgeProps) {
  const unlimited = limit === -1
  const percent = unlimited ? 0 : Math.min(100, (used / limit) * 100)
  const nearLimit = !unlimited && percent >= 80

  return (
    <div className={cn("rounded-lg border p-4 space-y-2", nearLimit && "border-amber-400 bg-amber-50")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <span className={cn("text-sm font-semibold", nearLimit && "text-amber-700")}>
          {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && <Progress value={percent} />}
      {nearLimit && (
        <p className="text-xs text-amber-700">
          Quase lá! Considere fazer upgrade para liberar mais {label.toLowerCase()}.
        </p>
      )}
    </div>
  )
}
