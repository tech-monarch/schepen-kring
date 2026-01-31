import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, BarChart3, FileText, Users, Zap } from "lucide-react"

export function QuickActionsGrid() {
  const actions = [
    {
      icon: <Plus className="h-5 w-5" />,
      title: "Create Campaign",
      description: "Launch new ads",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Keyword Research",
      description: "Find keywords",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Campaign Audit",
      description: "Analyze performance",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Generate Report",
      description: "Create reports",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Competitor Analysis",
      description: "Track competitors",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Auto-Optimize",
      description: "Apply AI tips",
    },
  ]

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors bg-transparent"
            >
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="text-blue-600">{action.icon}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm text-gray-900">{action.title}</div>
                <div className="text-xs text-gray-600">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
