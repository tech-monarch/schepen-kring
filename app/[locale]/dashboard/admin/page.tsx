"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns"; // Optional: npm install date-fns

export default function AdminDashboardHome() {
  const t = useTranslations("Dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeBidsCount: 0,
    pendingTasks: 0,
    fleetIntake: 0,
    totalSales: "€0",
    recentBids: [],
    auditLogs: []
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch Yachts and Tasks in parallel
        const [yachtsRes, tasksRes] = await Promise.all([
          api.get("/yachts"),
          api.get("/tasks")
        ]);

        const yachts = yachtsRes.data;
        const tasks = tasksRes.data;

        // Logic to derive stats from your existing controllers
        const activeBids = yachts.filter((y: any) => y.status === "For Bid").length;
        const intake = yachts.filter((y: any) => y.status === "Draft" || y.status === "For Sale").length;
        const pending = tasks.filter((t: any) => t.status !== "Done").length;
        
        // Mocking sale value from 'Sold' yachts (Price sum)
        const salesTotal = yachts
          .filter((y: any) => y.status === "Sold")
          .reduce((sum: number, y: any) => sum + parseFloat(y.price), 0);

        setData({
          activeBidsCount: activeBids,
          pendingTasks: pending,
          fleetIntake: intake,
          totalSales: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumSignificantDigits: 3 }).format(salesTotal),
          recentBids: yachts.filter((y: any) => y.current_bid > 0).slice(0, 3),
          auditLogs: tasks.slice(0, 4) // Using tasks as a proxy for audit logs for MVP
        });
      } catch (error) {
        console.error("Terminal Data Sync Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const stats = [
    { label: "Active Bids", value: data.activeBidsCount, change: "Live", icon: TrendingUp },
    { label: "Pending Manifest", value: data.pendingTasks, change: "Tasks", icon: Clock },
    { label: "Fleet in Intake", value: data.fleetIntake, change: "Unit", icon: AlertCircle },
    { label: "Completed Sales", value: data.totalSales, change: "Total", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-serif italic text-[#003566]">Command Overview</h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">
          Real-time Maritime Intelligence
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white border border-slate-200 p-6 hover:border-blue-600/30 transition-all shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={20} className="text-blue-600" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 px-2 py-1 bg-slate-100">
                {stat.change}
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-serif text-[#003566]">
              {loading ? "..." : stat.value}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Bids Section - Linked to Yacht Current Bids */}
        <div className="xl:col-span-2 bg-white border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic">Recent Bidding Activity</h2>
            <button className="text-[9px] uppercase tracking-widest text-blue-600 hover:underline font-bold">View Terminal</button>
          </div>
          <div className="space-y-4">
            {data.recentBids.map((yacht: any, i) => (
              <div key={yacht.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-serif italic group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#003566] uppercase tracking-wider">{yacht.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter font-medium">Vessel ID: {yacht.vessel_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-serif text-blue-600 font-bold">
                    €{parseFloat(yacht.current_bid).toLocaleString()}
                  </p>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Active Offer</p>
                </div>
              </div>
            ))}
            {!loading && data.recentBids.length === 0 && (
              <p className="text-[10px] uppercase text-slate-400 py-10 text-center tracking-widest">No active bids in manifest</p>
            )}
          </div>
        </div>

        {/* Quick Audit Log - Linked to Task Updates */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic mb-8">Security Audit</h2>
          <div className="space-y-6">
            {data.auditLogs.map((task: any) => (
              <div key={task.id} className="flex gap-4 items-start">
                <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5" />
                <div>
                  <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest font-medium">
                    <span className="text-[#003566] font-bold">{task.assigned_to ? 'Operator Assigned' : 'System'}</span> processed task <span className="text-blue-600 font-black italic">"{task.title}"</span> for vessel {task.yacht?.vessel_id || 'Global'}.
                  </p>
                  <p className="text-[8px] text-slate-300 mt-1 uppercase font-bold tracking-tighter">
                    {new Date(task.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}