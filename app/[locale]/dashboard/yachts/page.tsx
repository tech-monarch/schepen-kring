"use client";

import { useState } from "react";
import { 
  Plus, Camera, DollarSign, Anchor, 
  Settings2, Trash2, Eye, Gavel, 
  CheckCircle2, AlertCircle, Ship
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
      price: "$12,500,000",
      currentBid: "$8,200,000",
      image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=400",
      year: "2023",
      length: "45m"
    },
    {
      id: "Y-104",
      name: "The Azure Sky",
      status: "For Sale",
      price: "$4,200,000",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400",
      year: "2021",
      length: "32m"
    }
  ]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 space-y-12">
      
      {/* 1. FLEET ANALYTICS HEADER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Fleet Value", val: "$42.8M", color: "border-[#c5a572]" },
          { label: "Active Listings", val: vessels.length, color: "border-blue-500" },
          { label: "Pending Bids", val: "14", color: "border-emerald-500" },
          { label: "Sold (MTD)", val: "03", color: "border-white/20" },
        ].map((s, i) => (
          <div key={i} className={cn("bg-[#0d0d0d] border-l-4 p-6 shadow-2xl", s.color)}>
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-bold">{s.val}</p>
          </div>
        ))}
      </div>

      {/* 2. SHIPMENT REGISTRATION (UPLOAD ZONE) */}
      <div className="bg-[#0d0d0d] border border-white/10 p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Ship size={120} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-48 h-48 bg-black border-2 border-dashed border-white/10 flex flex-col items-center justify-center group-hover:border-[#c5a572] transition-colors cursor-pointer">
            <Camera className="text-gray-600 group-hover:text-[#c5a572] mb-2" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">Upload Media</span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#c5a572]">Vessel Nomenclature</label>
                <input placeholder="e.g. M/Y BLACK PEARL" className="w-full bg-black border border-white/10 p-3 text-sm focus:border-[#c5a572] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Price (USD)</label>
                    <input placeholder="$0.00" className="w-full bg-black border border-white/10 p-3 text-sm focus:border-white outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</label>
                    <select className="w-full bg-black border border-white/10 p-3 text-sm focus:border-white outline-none appearance-none">
                        <option>For Sale</option>
                        <option>For Bid</option>
                    </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <button className="bg-[#c5a572] text-black font-black uppercase text-xs py-4 tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Deploy Vessel to Market
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE INVENTORY MANIFEST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-serif italic flex items-center gap-3">
            <Anchor className="text-[#c5a572]" size={20} /> Active Fleet Inventory
          </h2>
          <div className="flex gap-4">
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white">Filter</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white">Export</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {vessels.map((yacht) => (
              <motion.div 
                layout
                key={yacht.id}
                className="bg-[#0d0d0d] border border-white/5 p-4 flex flex-col md:flex-row items-center gap-8 group hover:border-[#c5a572]/40 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-32 h-20 bg-black overflow-hidden relative">
                   <img src={yacht.image} alt={yacht.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold tracking-tight">{yacht.name}</h3>
                    <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 uppercase tracking-widest",
                        yacht.status === "For Bid" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-[#c5a572]/10 text-[#c5a572] border border-[#c5a572]/20"
                    )}>
                        {yacht.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                    <span>ID: {yacht.id}</span>
                    <span>•</span>
                    <span>Length: {yacht.length}</span>
                    <span>•</span>
                    <span>Build: {yacht.year}</span>
                  </div>
                </div>

                {/* Financials */}
                <div className="flex items-center gap-12 text-right">
                  <div>
                    <p className="text-[9px] uppercase font-black text-gray-600 tracking-widest">Market Price</p>
                    <p className="text-lg font-bold text-white">{yacht.price}</p>
                  </div>
                  {yacht.currentBid && (
                    <div>
                      <p className="text-[9px] uppercase font-black text-blue-500 tracking-widest">Active Bid</p>
                      <p className="text-lg font-bold text-blue-400">{yacht.currentBid}</p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  <button className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Eye size={16} />
                  </button>
                  <button className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Settings2 size={16} />
                  </button>
                  <button className="p-3 bg-white/5 hover:bg-red-500/10 text-gray-700 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
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