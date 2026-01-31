"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";

export default function AdminDashboardHome() {
  const stats = [
    { label: "Active Bids", value: "24", change: "+12%", icon: TrendingUp },
    { label: "Pending Test Sails", value: "8", change: "Today", icon: Clock },
    { label: "Fleet in Intake", value: "14", change: "-2", icon: AlertCircle },
    { label: "Completed Sales", value: "€4.2M", change: "This Month", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-serif italic text-white">Command Overview</h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a572] font-black mt-2">
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
            className="bg-[#0d0d0d] border border-white/5 p-6 hover:border-[#c5a572]/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={20} className="text-[#c5a572]" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 px-2 py-1 bg-white/5">
                {stat.change}
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-serif text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Bids Section */}
        <div className="xl:col-span-2 bg-[#0d0d0d] border border-white/5 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs uppercase tracking-[0.3em] font-black text-white italic">Recent Bidding Activity</h2>
            <button className="text-[9px] uppercase tracking-widest text-[#c5a572] hover:underline">View Terminal</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#c5a572] font-serif italic">
                    {item}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">M/Y Azure Sky</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-tighter">Bidder: Corporate Client #88</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-serif text-[#c5a572]">€1,450,000</p>
                  <p className="text-[8px] text-gray-600 uppercase">2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Audit Log */}
        <div className="bg-[#0d0d0d] border border-white/5 p-8">
          <h2 className="text-xs uppercase tracking-[0.3em] font-black text-white italic mb-8">Security Audit</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-1 h-1 rounded-full bg-[#c5a572] mt-1.5" />
                <div>
                  <p className="text-[9px] text-gray-400 leading-relaxed uppercase tracking-widest">
                    <span className="text-white font-bold">Employee Jansen</span> updated status of Vessel #770{i} to <span className="text-[#c5a572]">Active</span>.
                  </p>
                  <p className="text-[8px] text-gray-600 mt-1 uppercase">14:02 GMT</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}