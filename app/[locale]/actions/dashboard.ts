"use server";

import type {
  Campaign,
  Alert,
  OptimizationTip,
  DashboardStats,
  ChartData,
  PerformanceData,
} from "@/types/dashboard";

// ✅ Real stats API (Answer24 Backend)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://answer24.nl/api/v1";

// --- FETCH HELPERS ---
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
}

// --- DASHBOARD STATS ---
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const stats = await fetchJSON<{
      total_visits: number;
      impressions: number;
      clicks: number;
      ctr: number;
    }>(`${BASE_URL}/analytics/stats`);

    return {
      totalSpend: 0, // optional dummy for now
      totalImpressions: stats.impressions,
      totalClicks: stats.clicks,
      totalConversions: 0,
      averageCTR: stats.ctr,
      averageCPC: 0,
      averageROAS: 0,
      spendChange: 0,
      clicksChange: 0,
      conversionsChange: 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      averageCTR: 0,
      averageCPC: 0,
      averageROAS: 0,
      spendChange: 0,
      clicksChange: 0,
      conversionsChange: 0,
    };
  }
}

// --- CHART DATA ---
export async function getChartData(): Promise<ChartData[]> {
  try {
    const stats = await fetchJSON<{
      total_visits: number;
      impressions: number;
      clicks: number;
      ctr: number;
    }>(`${BASE_URL}/analytics/stats`);

    // Just simulate a 7-day trend using the fetched values
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      name: day,
      spend: Math.floor(Math.random() * 2000) + 1000,
      clicks: Math.floor(stats.clicks / 7),
      conversions: Math.floor(stats.clicks * 0.05),
      impressions: Math.floor(stats.impressions / 7),
      total_visits: Math.floor(stats.total_visits / 7),
    }));
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}

// --- PERFORMANCE DATA (dummy) ---
export async function getPerformanceData(): Promise<PerformanceData[]> {
  return [
    { date: "Jan", spend: 8500, revenue: 34000, roas: 4.0 },
    { date: "Feb", spend: 9200, revenue: 38400, roas: 4.2 },
    { date: "Mar", spend: 8800, revenue: 36800, roas: 4.2 },
    { date: "Apr", spend: 9600, revenue: 41280, roas: 4.3 },
    { date: "May", spend: 10200, revenue: 44880, roas: 4.4 },
    { date: "Jun", spend: 11000, revenue: 49500, roas: 4.5 },
  ];
}

// --- CAMPAIGNS (using the stats) ---
export async function getCampaigns(): Promise<Campaign[]> {
  const stats = await getDashboardStats();

  return [
    {
      id: "1",
      name: "Total Visits",
      status: "active",
      budget: 0,
      spent: 0,
      impressions: stats.totalImpressions,
      clicks: stats.totalClicks,
      conversions: stats.totalConversions,
      ctr: stats.averageCTR,
      cpc: 0,
      roas: 0,
    },
    {
      id: "2",
      name: "Impressions",
      status: "active",
      budget: 0,
      spent: 0,
      impressions: stats.totalImpressions,
      clicks: stats.totalClicks,
      conversions: 0,
      ctr: stats.averageCTR,
      cpc: 0,
      roas: 0,
    },
    {
      id: "3",
      name: "Purchases",
      status: "paused",
      budget: 0,
      spent: 0,
      impressions: stats.totalImpressions,
      clicks: stats.totalClicks,
      conversions: stats.totalConversions,
      ctr: stats.averageCTR,
      cpc: 0,
      roas: 0,
    },
  ];
}

// --- DUMMY TRANSACTIONS API ---
export async function getTransactions() {
  return [
    {
      id: "tx_001",
      type: "purchase",
      amount: 49.99,
      status: "completed",
      timestamp: new Date().toISOString(),
    },
    {
      id: "tx_002",
      type: "subscription",
      amount: 9.99,
      status: "pending",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ];
}

// --- ALERTS ---
export async function getAlerts(): Promise<Alert[]> {
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
      message: "Brand Awareness CTR increased by 15% this week",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
    },
  ];
}

// --- OPTIMIZATION TIPS ---
export async function getOptimizationTips(): Promise<OptimizationTip[]> {
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
      type: "budget",
      title: "Reallocate Budget",
      description: "Move budget from underperforming to high-ROAS campaigns",
      impact: "high",
      estimatedSavings: 156.3,
    },
  ];
}
