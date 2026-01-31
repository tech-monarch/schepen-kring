"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LineChartProps {
  title: string
  data: Array<{ name: string; value: number }>
  color?: string
}

export function LineChart({ title, data, color = "#3b82f6" }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  // Create SVG path for the line
  const createPath = () => {
    const width = 400
    const height = 100
    const padding = -20

    return data
      .map((point, index) => {
        const x = padding + (index * (width - 3 * padding)) / (data.length - 1)
        const y = height - padding - ((point.value - minValue) / range) * (height - 4 * padding)
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  return (
    <Card className="border-none shadow-none ">
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg width="100%" height="180" viewBox="0 0 400 180" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Line */}
            <path d={createPath()} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

            {/* Data points */}
            {data.map((point, index) => {
              const x = 40 + (index * 360) / (data.length - 1)
              const y = 120 - ((point.value - minValue) / range) * 120
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                />
              )
            })}

            {/* X-axis labels */}
            {data.map((point, index) => {
              const x = 30 + (index * 360) / (data.length - 1)
              return (
                <text key={index} x={x} y="185" textAnchor="middle" className="text-xs fill-gray-600">
                  {point.name}
                </text>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
