"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LineChartProps {
  title: string
  data: Array<{ name: string; value: number }>
  color?: string
}

export function LineChart({ title, data, color = "#3b82f6" }: LineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
 const safeData = data.filter(d => typeof d.value === "number" && !isNaN(d.value))
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  const width = 400
  const height = 160
  const paddingX = 40
  const paddingY = 20

  const getX = (i: number) => paddingX + (i * (width - 2 * paddingX)) / (data.length - 1)
  const getY = (v: number) =>
    height - paddingY - ((v - minValue) / range) * (height - 2 * paddingY)

  const createSmoothPath = () => {
    return data
      .map((point, i) => {
        const x = getX(i)
        const y = getY(point.value)
        if (i === 0) return `M ${x} ${y}`
        const prevX = getX(i - 1)
        const prevY = getY(data[i - 1].value)
        const midX = (prevX + x) / 2
        return `C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`
      })
      .join(" ")
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            width="100%"
            height="200"
            viewBox={`0 0 ${width} 200`}
            className="overflow-visible"
          >
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const val = Math.round(maxValue - t * range)
              return (
                <text
                  key={i}
                  x="0"
                  y={getY(val) + 4}
                  textAnchor="start"
                  className="text-xs fill-gray-500"
                >
                  {val.toLocaleString()}
                </text>
              )
            })}

            {/* Smooth Line */}
            <path
              d={createSmoothPath()}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Data points */}
            {data
              .filter(point => typeof point.value === "number" && !isNaN(point.value))
              .map((point, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(point.value)}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
            ))}


            {/* Hover Tooltip */}
            {hovered !== null && data[hovered] && typeof data[hovered].value === "number" && (
              <g>
                <rect
                  x={getX(hovered) - 40}
                  y={getY(data[hovered].value) - 40}
                  width="80"
                  height="32"
                  rx="6"
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  className="shadow-md"
                />
                <text
                  x={getX(hovered)}
                  y={getY(data[hovered].value) - 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-700"
                >
                  {`${data[hovered].value.toLocaleString()} visits`}
                </text>
              </g>
            )}


            {/* X-axis labels */}
            {data.map((point, i) => (
              <text
                key={i}
                x={getX(i)}
                y="190"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {point.name}
              </text>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
