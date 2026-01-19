import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartItemProps {
  label: string
  value: number
  total: number
  color: string
}

function CircularProgress({ value, total, color, label }: ChartItemProps) {
  const percentage = (value / total) * 100
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-card-foreground">{Math.round(percentage)}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

interface SalesChartProps {
  dineIn: number
  takeaway: number
  delivery: number
  preOrder: number
  total: number
  isLoading?: boolean
}

export function SalesChart({ dineIn, takeaway, delivery, preOrder, total, isLoading }: SalesChartProps) {
  const data = [
    { label: "Dine-in", value: dineIn, total: total || 1, color: "#22c55e" },
    { label: "Takeaway", value: takeaway, total: total || 1, color: "#f97316" },
    { label: "Delivery", value: delivery, total: total || 1, color: "#3b82f6" },
    { label: "Pre-order", value: preOrder, total: total || 1, color: "#a855f7" },
  ].filter((item) => item.value > 0) // Only show channels with orders

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground">Sales by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-around">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 bg-muted animate-pulse rounded-full" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="flex justify-around">
            {data.map((item) => (
              <CircularProgress key={item.label} {...item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
