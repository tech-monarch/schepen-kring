"use server"

import type { Campaign, Alert, OptimizationTip, DashboardStats, ChartData, PerformanceData } from "@/types/dashboard"

export async function getDashboardStats(): Promise<DashboardStats> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    totalSpend: 12450.67,
    totalImpressions: 245678,
    totalClicks: 8934,
    totalConversions: 234,
    averageCTR: 3.64,
    averageCPC: 1.39,
    averageROAS: 4.2,
    spendChange: 12.5,
    clicksChange: -5.2,
    conversionsChange: 18.7,
  }
}

export async function getChartData(): Promise<ChartData[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    { name: "Mon", spend: 1200, clicks: 340, conversions: 12, impressions: 8500, total_visits: 0  },
    { name: "Tue", spend: 1800, clicks: 520, conversions: 18, impressions: 12300, total_visits: 0  },
    { name: "Wed", spend: 1600, clicks: 480, conversions: 15, impressions: 11200, total_visits: 0  },
    { name: "Thu", spend: 2100, clicks: 620, conversions: 22, impressions: 14800, total_visits: 0  },
    { name: "Fri", spend: 1900, clicks: 580, conversions: 19, impressions: 13600, total_visits: 0  },
    { name: "Sat", spend: 1400, clicks: 420, conversions: 14, impressions: 9800, total_visits: 0  },
    { name: "Sun", spend: 1100, clicks: 320, conversions: 10, impressions: 7600, total_visits: 0 },
  ]
}

export async function getPerformanceData(): Promise<PerformanceData[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    { date: "Jan", spend: 8500, revenue: 34000, roas: 4.0 },
    { date: "Feb", spend: 9200, revenue: 38400, roas: 4.2 },
    { date: "Mar", spend: 8800, revenue: 36800, roas: 4.2 },
    { date: "Apr", spend: 9600, revenue: 41280, roas: 4.3 },
    { date: "May", spend: 10200, revenue: 44880, roas: 4.4 },
    { date: "Jun", spend: 11000, revenue: 49500, roas: 4.5 },
  ]
}

export async function getCampaigns(): Promise<Campaign[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: "1",
      name: "Total Visits",
      status: "active",
      budget: 500,
      spent: 387.45,
      impressions: 45678,
      clicks: 1234,
      conversions: 45,
      ctr: 2.7,
      cpc: 0.31,
      roas: 3.8,
    },
    {
      id: "2",
      name: "Impressions",
      status: "active",
      budget: 800,
      spent: 623.12,
      impressions: 78901,
      clicks: 2156,
      conversions: 67,
      ctr: 2.73,
      cpc: 0.29,
      roas: 4.1,
    },
    {
      id: "3",
      name: "Purchases",
      status: "paused",
      budget: 300,
      spent: 245.78,
      impressions: 23456,
      clicks: 567,
      conversions: 12,
      ctr: 2.42,
      cpc: 0.43,
      roas: 2.9,
    },
  ]
}

export async function getAlerts(): Promise<Alert[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return [
    {
      id: "1",
      type: "warning",
      title: "Budget Alert",
      message: "Summer Sale Campaign is 90% through its daily budget",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
    },
    {
      id: "2",
      type: "info",
      title: "Performance Update",
      message: "Brand Awareness Q4 CTR increased by 15% this week",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
    },
    {
      id: "3",
      type: "success",
      title: "Optimization Applied",
      message: "AI recommendations saved $156 in the last 24 hours",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isRead: true,
    },
  ]
}

export async function getOptimizationTips(): Promise<OptimizationTip[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return [
    {
      id: "1",
      type: "keyword",
      title: "Pause Low-Performing Keywords",
      description: "5 keywords with CTR below 1% are wasting budget",
      impact: "high",
      estimatedSavings: 89.5,
    },
    {
      id: "2",
      type: "bid",
      title: "Increase Bids on High-Converting Keywords",
      description: "3 keywords showing strong ROAS could benefit from higher bids",
      impact: "medium",
    },
    {
      id: "3",
      type: "budget",
      title: "Reallocate Budget",
      description: "Move budget from underperforming to high-ROAS campaigns",
      impact: "high",
      estimatedSavings: 156.3,
    },
  ]
}
