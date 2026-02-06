"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  BarChart3,
  Code,
  Copy,
  Check,
  Eye,
  Globe,
  Clock,
  TrendingUp,
  MousePointer2,
  ChevronLeft,
  ChevronRight,
  Anchor,
  CheckSquare,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast, Toaster } from "react-hot-toast";

import { Sidebar } from "@/components/dashboard/Sidebar";

// Mock translation function - replace with your actual i18n if using one
const t = (key: string) => {
  const keys: any = {
    overview: "Overview",
    fleet_management: "Fleet",
    task_board: "Tasks",
  };
  return keys[key] || key;
};

export default function AnalyticsPage() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const widgetCode = `<script src="https://schepen-kring.nl/vessel-tracker.js" async></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    toast.success("Widget code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Online status monitor
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/summary");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      <DashboardHeader />
      <Toaster position="top-right" />

      <div className="flex pt-20">
        {/* COLLAPSIBLE SIDEBAR */}
        <Sidebar onCollapse={setIsSidebarCollapsed} />

        {/* Adjust Margin based on sidebar state */}
        <main
          className={cn(
            "flex-1 p-8 bg-white transition-all duration-300",
            isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-64",
          )}
        >
          <div className="max-w-[1200px] mx-auto space-y-12">
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
              <div>
                <h1 className="text-5xl font-serif italic text-[#003566]">
                  Intelligence Terminal
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">
                  External Traffic Monitor v2.0
                </p>
              </div>
            </div>

            {/* Deployment Section */}
            <div className="bg-slate-50 border border-slate-200 p-8 space-y-6">
              <div className="flex items-center gap-3 text-[#003566]">
                <Code size={20} />
                <h2 className="text-[12px] font-black uppercase tracking-widest">
                  Widget Deployment Code
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl">
                Paste this script into the Schepenkring website to begin
                tracking vessel engagement.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-[#003566] p-4 text-blue-100 font-mono text-sm overflow-x-auto border border-blue-900 shadow-inner">
                  {widgetCode}
                </div>
                <Button
                  onClick={copyToClipboard}
                  className="bg-white border-2 border-[#003566] text-[#003566] hover:bg-slate-50 rounded-none h-auto px-8 font-black uppercase text-[10px] tracking-widest min-h-[50px]"
                >
                  {copied ? (
                    <Check size={16} className="mr-2" />
                  ) : (
                    <Copy size={16} className="mr-2" />
                  )}
                  {copied ? "Copied" : "Copy Code"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#003566]">
              {/* Main Table */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-2">
                  <TrendingUp size={14} /> High-Traffic Inventory
                </h3>
                <div className="border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Ref Code
                        </th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Name
                        </th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Live Views
                        </th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-[10px] uppercase font-bold text-slate-400 animate-pulse"
                          >
                            Syncing...
                          </td>
                        </tr>
                      ) : stats.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-[10px] uppercase font-bold text-slate-400"
                          >
                            No signals detected yet.
                          </td>
                        </tr>
                      ) : (
                        stats.map((item) => (
                          <tr
                            key={item.external_id}
                            className="hover:bg-blue-50/30 transition-colors group"
                          >
                            <td className="p-4 text-xs font-mono font-bold text-blue-600 italic">
                              {item.ref_code || "N/A"}
                            </td>
                            <td className="p-4">
                              <div className="text-xs font-bold uppercase tracking-tight">
                                {item.name}
                              </div>
                              <div className="text-[9px] text-slate-400 font-medium truncate max-w-[200px]">
                                {item.url}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="flex items-center gap-2 text-xs font-black">
                                <Eye size={12} className="text-blue-400" />{" "}
                                {item.total_views}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 hover:bg-[#003566] hover:text-white transition-all"
                              >
                                External Link
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar Feed */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-2">
                  <Globe size={14} /> Live Signal Feed
                </h3>
                <div className="space-y-4">
                  {(stats || []).slice(0, 5).map((log, i) => (
                    <div
                      key={i}
                      className="p-4 border-l-4 border-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 italic">
                          Incoming Hit
                        </p>
                        <span className="text-[8px] font-bold text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />{" "}
                          LIVE
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-[#003566] truncate mb-1">
                        {log.name}
                      </p>
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-400">
                        <MousePointer2 size={10} /> User via{" "}
                        {log.ip_address?.substring(0, 8) || "Unknown"}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
