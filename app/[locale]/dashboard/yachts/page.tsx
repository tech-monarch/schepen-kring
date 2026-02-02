"use client";

import { useState } from "react";
import { 
  Plus, Camera, Anchor, 
  Settings2, Trash2, Eye, Ship,
  TrendingUp, Activity, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Yacht {
  id: string;
  name: string;
  status: "For Sale" | "For Bid" | "Sold" | "Draft";
  price: string;
  currentBid?: string;
  image: string;
  year: string;
  length: string;
}

export default function AdminYachtPage() {
  const [vessels, setVessels] = useState<Yacht[]>([
    {
      id: "Y-882",
      name: "M/Y Sovereign",
      status: "For Bid",
      price: "€12,500,000",
      currentBid: "€8,200,000",
      image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=400",
      year: "2023",
      length: "45m"
    },
    {
      id: "Y-104",
      name: "The Azure Sky",
      status: "For Sale",
      price: "€4,200,000",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400",
      year: "2021",
      length: "32m"
    }
  ]);

  return (
    <div className="space-y-12 text-[#003566]">
      
      {/* 1. FLEET ANALYTICS HEADER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Fleet Value", val: "€42.8M", color: "border-blue-600", icon: TrendingUp },
          { label: "Active Listings", val: vessels.length, color: "border-slate-200", icon: Anchor },
          { label: "Pending Bids", val: "14", color: "border-emerald-500", icon: Activity },
          { label: "Sold (MTD)", val: "03", color: "border-slate-200", icon: Clock },
        ].map((s, i) => (
          <div key={i} className={cn("bg-white border-l-4 p-8 shadow-sm group hover:shadow-md transition-all", s.color)}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{s.label}</p>
              <s.icon size={14} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-3xl font-serif">{s.val}</p>
          </div>
        ))}
      </div>

      {/* 2. SHIPMENT REGISTRATION (UPLOAD ZONE) */}
      <div className="bg-white border border-slate-200 p-10 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <Ship size={150} className="text-[#003566]" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
          <div className="w-full lg:w-56 h-56 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group-hover:border-blue-600 transition-colors cursor-pointer group/upload">
            <Camera className="text-slate-300 group-hover/upload:text-blue-600 mb-3 transition-colors" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/upload:text-blue-600">Upload Media</span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Vessel Nomenclature</label>
                <input placeholder="M/Y BLACK PEARL" className="w-full bg-white border border-slate-200 p-4 text-sm font-serif focus:border-blue-600 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price (EUR)</label>
                    <input placeholder="€0.00" className="w-full bg-white border border-slate-200 p-4 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</label>
                    <select className="w-full bg-white border border-slate-200 p-4 text-sm focus:border-blue-600 outline-none appearance-none cursor-pointer">
                        <option>For Sale</option>
                        <option>For Bid</option>
                    </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <button className="bg-[#003566] text-white font-bold uppercase text-[10px] py-5 tracking-[0.3em] hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-3">
                <Plus size={16} /> Deploy Vessel to Market
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE INVENTORY MANIFEST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-serif italic flex items-center gap-3">
            <Anchor className="text-blue-600" size={24} /> Active Fleet Inventory
          </h2>
          <div className="flex gap-6">
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Filter Manifest</button>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Export CSV</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {vessels.map((yacht) => (
              <motion.div 
                layout
                key={yacht.id}
                className="bg-white border border-slate-100 p-6 flex flex-col md:flex-row items-center gap-8 group hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-900/5 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-40 h-24 bg-slate-100 overflow-hidden relative">
                   <img src={yacht.image} alt={yacht.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                   <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <h3 className="text-xl font-serif">{yacht.name}</h3>
                    <span className={cn(
                        "text-[8px] font-black px-3 py-1 uppercase tracking-widest border",
                        yacht.status === "For Bid" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                        {yacht.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>Ref: {yacht.id}</span>
                    <span className="text-slate-200">|</span>
                    <span>Length: {yacht.length}</span>
                    <span className="text-slate-200">|</span>
                    <span>Class: {yacht.year} Build</span>
                  </div>
                </div>

                {/* Financials */}
                <div className="flex items-center gap-10 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mb-1">Market Listing</p>
                    <p className="text-lg font-serif">{yacht.price}</p>
                  </div>
                  {yacht.currentBid && (
                    <div className="border-l border-slate-100 pl-10">
                      <p className="text-[8px] uppercase font-black text-blue-600 tracking-widest mb-1">Highest Bid</p>
                      <p className="text-lg font-serif text-blue-600">{yacht.currentBid}</p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  <button className="p-4 border border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all">
                    <Eye size={18} />
                  </button>
                  <button className="p-4 border border-slate-100 text-slate-300 hover:text-[#003566] hover:border-slate-200 hover:bg-slate-50 transition-all">
                    <Settings2 size={18} />
                  </button>
                  <button className="p-4 border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}