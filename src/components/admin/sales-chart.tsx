import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartItemProps {
  label: string
  value: number
  total: number
  color: string
}

interface CircularProgressProps extends ChartItemProps {
  size?: 'small' | 'large'
}

function CircularProgress({ value, total, color, label, size = 'small' }: CircularProgressProps) {
  const percentage = (value / total) * 100
  const radius = size === 'large' ? 60 : 40
  const svgSize = size === 'large' ? 160 : 96
  const center = svgSize / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const strokeWidth = size === 'large' ? 15 : 10

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${size === 'large' ? 'w-40 h-40' : 'w-24 h-24'}`}>
        <svg className={`${size === 'large' ? 'w-40 h-40' : 'w-24 h-24'} transform -rotate-90`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${size === 'large' ? 'text-lg' : 'text-sm'} font-semibold text-card-foreground`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <span className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-muted-foreground`}>{label}</span>
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
    { label: "Dine-in", value: dineIn, total: total || 1, color: "#3b82f6" },
    { label: "Pre-order", value: preOrder, total: total || 1, color: "#a855f7" },
    { label: "Takeaway", value: takeaway, total: total || 1, color: "#f97316" },
    { label: "Delivery", value: delivery, total: total || 1, color: "#22c55e" },
    
  ].filter((item) => item.value > 0) // Only show channels with orders

  const renderCharts = () => {
    const count = data.length

    if (count === 1) {
      // 1 channel: 1 big circle chart in the middle
      return (
        <div className="flex justify-center items-center py-8">
          <CircularProgress {...data[0]} size="large" />
        </div>
      )
    }

    if (count === 2) {
      // 2 channels: 2 horizontally aligned circles
      return (
        <div className="flex justify-center items-center gap-12 py-8">
          {data.map((item) => (
            <CircularProgress key={item.label} {...item} />
          ))}
        </div>
      )
    }

    if (count === 3) {
      // 3 channels: 2 circles above, 1 circle below in the middle vertically
      return (
        <div className="flex flex-col items-center gap-8 py-8">
          <div className="flex justify-center items-center gap-12">
            {data.slice(0, 2).map((item) => (
              <CircularProgress key={item.label} {...item} />
            ))}
          </div>
          <div className="flex justify-center items-center">
            <CircularProgress {...data[2]} />
          </div>
        </div>
      )
    }

    if (count === 4) {
      // 4 channels: 2 above, 2 below
      return (
        <div className="flex flex-col items-center gap-8">
          <div className="flex justify-center items-center gap-20">
            {data.slice(0, 2).map((item) => (
              <CircularProgress key={item.label} {...item} />
            ))}
          </div>
          <div className="flex justify-center items-center gap-20">
            {data.slice(2, 4).map((item) => (
              <CircularProgress key={item.label} {...item} />
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground">Sales by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center gap-12 py-8">
            {[1, 2, 3, 4].slice(0, 3).map((i) => (
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
          renderCharts()
        )}
      </CardContent>
    </Card>
  )
}
