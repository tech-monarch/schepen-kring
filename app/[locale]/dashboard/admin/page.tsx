"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCcw,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@/i18n/navigation";

export default function AdminDashboardHome() {
  const t = useTranslations("Dashboard");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState({
    activeBidsCount: 0,
    pendingTasks: 0,
    fleetIntake: 0,
    totalSales: "€0",
    recentBids: [],
    auditLogs: []
  });

  const fetchDashboardData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setIsRefreshing(true);
    try {
      const [yachtsRes, tasksRes] = await Promise.all([
        api.get("/yachts"),
        api.get("/tasks")
      ]);

      const yachts = yachtsRes.data || [];
      const tasks = tasksRes.data || [];

      const activeBids = yachts.filter((y: any) => y.status === "For Bid").length;
      const intake = yachts.filter((y: any) => y.status === "Draft" || y.status === "For Sale").length;
      const pending = tasks.filter((t: any) => t.status !== "Done").length;
      
      const salesTotal = yachts
        .filter((y: any) => y.status === "Sold")
        .reduce((sum: number, y: any) => sum + (parseFloat(y.price) || 0), 0);

      setData({
        activeBidsCount: activeBids,
        pendingTasks: pending,
        fleetIntake: intake,
        totalSales: new Intl.NumberFormat('de-DE', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 0
        }).format(salesTotal),
        recentBids: yachts
          .filter((y: any) => parseFloat(y.current_bid) > 0)
          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 3),
        auditLogs: tasks.slice(0, 5) 
      });
    } catch (error) {
      console.error("Terminal Data Sync Error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(false), 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const stats = [
    { 
      label: "Active Bids", 
      value: data.activeBidsCount, 
      change: "Live", 
      icon: TrendingUp,
      color: "text-blue-600",
      borderColor: "hover:border-blue-500/50",
      bg: "bg-blue-50/30"
    },
    { 
      label: "Pending Manifest", 
      value: data.pendingTasks, 
      change: "Tasks", 
      icon: Clock,
      color: "text-amber-600",
      borderColor: "hover:border-amber-500/50",
      bg: "bg-amber-50/30"
    },
    { 
      label: "Fleet in Intake", 
      value: data.fleetIntake, 
      change: "Unit", 
      icon: AlertCircle,
      color: "text-rose-600",
      borderColor: "hover:border-rose-500/50",
      bg: "bg-rose-50/30"
    },
    { 
      label: "Completed Sales", 
      value: data.totalSales, 
      change: "Total", 
      icon: CheckCircle2,
      color: "text-emerald-600",
      borderColor: "hover:border-emerald-500/50",
      bg: "bg-emerald-50/30"
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">Command Overview</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2 flex items-center gap-2">
            <ShieldCheck size={12} />
            Real-time Maritime Intelligence
          </p>
        </div>
        <button 
          onClick={() => fetchDashboardData(false)}
          disabled={isRefreshing}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={16} className={cn(isRefreshing && "animate-spin")} />
        </button>
      </header>

{/* Stats Grid with Fully Colored Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map((stat, i) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      key={stat.label}
      className={cn(
        "p-6 transition-all shadow-sm group relative overflow-hidden border",
        // Dynamic background and border colors based on the stat
        i === 0 && "bg-blue-600 border-blue-700 text-white",
        i === 1 && "bg-amber-500 border-amber-600 text-white",
        i === 2 && "bg-rose-600 border-rose-700 text-white",
        i === 3 && "bg-emerald-600 border-emerald-700 text-white"
      )}
    >
      {/* Decorative Icon Watermark */}
      <stat.icon 
        size={80} 
        className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500" 
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
            <stat.icon size={20} className="text-white" />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 bg-white/20 border border-white/30 text-white rounded">
            {stat.change}
          </span>
        </div>
        
        <p className="text-[9px] uppercase tracking-widest text-white/80 mb-1 font-black">
          {stat.label}
        </p>
        
        <h3 className="text-2xl font-serif text-white flex items-baseline gap-2">
          {loading ? (
            <span className="animate-pulse opacity-50">...</span>
          ) : (
            <>
              {stat.value}
              <span className="text-[10px] font-sans opacity-60 font-bold uppercase tracking-tighter">
                Confirmed
              </span>
            </>
          )}
        </h3>
      </div>

      {/* Hover Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  ))}
</div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
            <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic">Recent Bidding Activity</h2>
            <Link 
              href="/dashboard/admin/yachts" 
              className="text-[9px] uppercase tracking-widest text-blue-600 hover:text-[#003566] transition-colors font-bold flex items-center gap-2 group"
            >
              Access Terminal
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentBids.map((yacht: any, i) => (
              <div key={yacht.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-serif italic group-hover:bg-[#003566] group-hover:text-white transition-colors">
                    0{i + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#003566] uppercase tracking-wider">{yacht.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter font-medium">Registry: {yacht.vessel_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-serif text-blue-600 font-bold">
                    €{parseFloat(yacht.current_bid).toLocaleString('de-DE')}
                  </p>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Current Valuation</p>
                </div>
              </div>
            ))}
            {!loading && data.recentBids.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <p className="text-[10px] uppercase text-slate-300 tracking-[0.2em]">No active bidding protocols</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black text-[#003566] italic mb-8 border-b border-slate-50 pb-4">System Audit</h2>
          <div className="space-y-6">
            {data.auditLogs.map((task: any) => (
              <div key={task.id} className="flex gap-4 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 group-hover:scale-150 transition-transform" />
                <div>
                  <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest font-medium">
                    <span className="text-[#003566] font-bold">{task.assigned_to ? 'Operator' : 'Auto-System'}</span> updated 
                    <span className="text-blue-600 font-black italic mx-1">"{task.title}"</span> 
                    for {task.yacht?.vessel_id || 'Global Fleet'}.
                  </p>
                  <p className="text-[8px] text-slate-300 mt-1 uppercase font-bold tracking-tighter">
                    {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
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