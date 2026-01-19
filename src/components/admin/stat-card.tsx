import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  isLoading?: boolean
}

export function StatCard({ title, value, change, changeType = "neutral", icon, isLoading }: StatCardProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-card-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          {isLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <span className="text-3xl font-bold text-card-foreground">{value}</span>
          )}
          {change && !isLoading && (
            <span
              className={cn(
                "text-xs mb-1",
                changeType === "positive" && "text-green-600",
                changeType === "negative" && "text-red-600",
                changeType === "neutral" && "text-muted-foreground",
              )}
            >
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
