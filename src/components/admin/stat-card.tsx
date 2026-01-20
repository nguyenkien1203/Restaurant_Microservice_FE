import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  isLoading?: boolean
}

export function StatCard({ title, value, change, changeType = "neutral", icon, isLoading }: StatCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />
      case "negative":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200 overflow-hidden relative">
      {/* Gradient accent based on change type */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          changeType === "positive" && "bg-gradient-to-r from-green-500 to-emerald-400",
          changeType === "negative" && "bg-gradient-to-r from-red-500 to-rose-400",
          changeType === "neutral" && "bg-gradient-to-r from-gray-400 to-gray-300",
          !change && "bg-gradient-to-r from-primary/60 to-primary/40"
        )}
      />
      
      <CardContent className="px-6 py-4">
        <div className="flex items-start justify-between mb-4">
          {/* Title */}
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
          </div>
          
          {/* Icon with background */}
          {icon && (
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <div className="h-6 w-6">
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {value}
              </span>
            </div>
          )}

          {/* Change indicator */}
          {change && !isLoading && (
            <div className="flex items-center gap-1.5 pt-1">
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                  changeType === "positive" && "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
                  changeType === "negative" && "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
                  changeType === "neutral" && "bg-muted text-muted-foreground"
                )}
              >
                {getChangeIcon()}
                <span>{change}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
