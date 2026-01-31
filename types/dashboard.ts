export interface Campaign {
    id: string
    name: string
    status: "active" | "paused" | "draft"
    budget: number
    spent: number
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpc: number
    roas: number
  }
  
  export interface Alert {
    id: string
    type: "warning" | "info" | "success" | "error"
    title: string
    message: string
    timestamp: Date
    isRead: boolean
  }
  
  export interface OptimizationTip {
    id: string
    type: "keyword" | "bid" | "budget" | "ad"
    title: string
    description: string
    impact: "high" | "medium" | "low"
    estimatedSavings?: number
  }
  
  export interface DashboardStats {
    totalSpend: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    averageCTR: number
    averageCPC: number
    averageROAS: number
    spendChange: number
    clicksChange: number
    conversionsChange: number
  }
  
  export interface ChartData {
    name: string
    spend: number
    clicks: number
    conversions: number
    impressions: number
    total_visits: number
    value?: number
  }
  
  export interface PerformanceData {
    date: string
    spend: number
    revenue: number
    roas: number
  }
  