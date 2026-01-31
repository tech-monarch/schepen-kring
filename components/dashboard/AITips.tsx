import type { OptimizationTip } from "@/types/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Target, DollarSign, FileText, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompactAiTipsProps {
  tips: OptimizationTip[]
}

export function CompactAiTips({ tips }: CompactAiTipsProps) {
  const getTipIcon = (type: OptimizationTip["type"]) => {
    switch (type) {
      case "keyword":
        return <Target className="h-3 w-3" />
      case "bid":
        return <DollarSign className="h-3 w-3" />
      case "budget":
        return <DollarSign className="h-3 w-3" />
      case "ad":
        return <FileText className="h-3 w-3" />
    }
  }

  const getImpactColor = (impact: OptimizationTip["impact"]) => {
    switch (impact) {
      case "high":
        return "bg-red-50 text-red-700"
      case "medium":
        return "bg-yellow-50 text-yellow-700"
      case "low":
        return "bg-green-50 text-green-700"
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="p-1 bg-blue-50 rounded">
            <Lightbulb className="h-4 w-4 text-blue-600" />
          </div>
          AI Optimization Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-1 bg-gray-50 rounded flex-shrink-0">
                  <div className="text-gray-600">{getTipIcon(tip.type)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{tip.title}</h4>
                    <Badge className={cn("text-xs", getImpactColor(tip.impact))}>{tip.impact}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{tip.description}</p>
                  {tip.estimatedSavings && (
                    <p className="text-xs text-green-600 font-medium">Save ${tip.estimatedSavings}</p>
                  )}
                </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white ml-3 flex-shrink-0">
                <Zap className="h-3 w-3 mr-1" />
                Apply
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
