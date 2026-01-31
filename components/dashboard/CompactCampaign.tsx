import type { Campaign } from "@/types/dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompactCampaignsProps {
  campaigns: Campaign[]
}

export function CompactCampaigns({ campaigns }: CompactCampaignsProps) {
  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700"
      case "paused":
        return "bg-yellow-50 text-yellow-700"
      case "draft":
        return "bg-gray-50 text-gray-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Active Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Campaign</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Budget</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Clicks</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">CTR</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">ROAS</th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const spentPercentage = (campaign.spent / campaign.budget) * 100
                return (
                  <tr key={campaign.id} className="border-b border-gray-50 hover:bg-gray-25">
                    <td className="py-3 px-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{campaign.name}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className={cn(
                              "h-1 rounded-full",
                              spentPercentage > 90
                                ? "bg-red-500"
                                : spentPercentage > 70
                                  ? "bg-yellow-500"
                                  : "bg-blue-500",
                            )}
                            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge className={cn("text-xs", getStatusColor(campaign.status))}>{campaign.status}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right text-sm">
                      <div className="font-medium">${campaign.spent.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">/ ${campaign.budget}</div>
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-medium">{campaign.clicks.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-sm font-medium text-blue-600">{campaign.ctr}%</td>
                    <td className="py-3 px-3 text-right text-sm font-medium text-green-600">{campaign.roas}x</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {campaign.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
