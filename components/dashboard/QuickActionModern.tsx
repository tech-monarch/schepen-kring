import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, BarChart3, FileText, Users, Zap, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickActionsModern() {
  const actions = [
    {
      icon: <Plus className="h-5 w-5" />,
      title: "Create Campaign",
      description: "Launch new Google Ads campaign",
      color: "blue",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Keyword Research",
      description: "AI-powered keyword discovery and analysis",
      color: "indigo",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Campaign Audit",
      description: "Comprehensive performance analysis",
      color: "sky",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Generate Report",
      description: "White-label client reports and insights",
      color: "cyan",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Competitor Analysis",
      description: "Track and analyze competitor strategies",
      color: "violet",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Auto-Optimize",
      description: "Apply AI recommendations automatically",
      color: "blue",
    },
  ]
  
  const colorVariants = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      hover: 'hover:bg-blue-600',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      hover: 'hover:bg-indigo-600',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      hover: 'hover:bg-sky-600',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600',
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      hover: 'hover:bg-cyan-600',
      iconBg: 'bg-cyan-100',
      iconText: 'text-cyan-600',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      hover: 'hover:bg-violet-600',
      iconBg: 'bg-violet-100',
      iconText: 'text-violet-600',
    },
  }

  return (
    <Card className="border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3 px-6 pt-">
        <CardTitle className="text-lg font-semibold text-gray-800">Quick Actions</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Common tasks at your fingertips</p>
      </CardHeader>
      <CardContent className="px-4 pb-6">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => {
            const colors = colorVariants[action.color as keyof typeof colorVariants] || colorVariants.blue
            return (
              <Button 
                key={index} 
                variant="ghost" 
                className={cn(
                  "h-auto p-0 group transition-all duration-200 overflow-hidden",
                  "hover:bg-transparent hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "w-full flex items-start sm:items-center gap-4 p-3 rounded-xl transition-all duration-200",
                  "hover:bg-gray-50/80 border border-transparent hover:border-gray-100"
                )}>
                  <div className={cn(
                    "p-2.5 rounded-lg transition-all duration-200 group-hover:scale-110 mt-0.5",
                    colors.iconBg,
                    colors.iconText
                  )}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className={cn(
                      "font-medium text-gray-900 group-hover:text-blue-600 transition-colors",
                      "truncate"
                    )}>
                      {action.title}
                    </div>
                    <div className={cn(
                      "text-sm text-gray-500 mt-0.5 leading-tight",
                      "line-clamp-2"
                    )}>
                      {action.description}
                    </div>
                  </div>
                  <div className={cn(
                    "p-1.5 rounded-full transition-all duration-200",
                    "text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50/50"
                  )}>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
