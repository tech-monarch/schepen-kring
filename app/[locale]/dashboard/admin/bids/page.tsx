"use client";

import { useState } from "react";
import { 
  Hammer, 
  Check, 
  X, 
  ShieldAlert, 
  History, 
  Settings2, 
  ArrowUpRight,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BiddingTerminalPage() {
  const [activeTab, setActiveTab] = useState<"live" | "rules" | "history">("live");

  // Mock data for live bids
  const liveBids = [
    { 
      id: "BID-991", 
      yacht: "M/Y Sovereign", 
      bidder: "Alexandre Dupont", 
      amount: 4250000, 
      minAcceptable: 4000000, 
      time: "4 mins ago",
      status: "pending"
    },
    { 
      id: "BID-985", 
      yacht: "M/Y Azure Sky", 
      bidder: "Oceanic Ventures Ltd", 
      amount: 1850000, 
      minAcceptable: 2100000, 
      time: "1 hour ago",
      status: "auto-flagged" 
    }
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-white">Bidding Terminal</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a572] font-black mt-2">
            Global Offer Management & Logic Rules
          </p>
        </div>
        
        <div className="flex bg-white/5 p-1 border border-white/10">
          {[
            { id: "live", label: "Live Offers", icon: Hammer },
            { id: "rules", label: "Auto-Rules", icon: Settings2 },
            { id: "history", label: "Audit Log", icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all",
                activeTab === tab.id ? "bg-[#c5a572] text-black" : "text-gray-500 hover:text-white"
              )}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "live" && (
        <div className="grid grid-cols-1 gap-6">
          {liveBids.map((bid) => (
            <div key={bid.id} className="bg-[#0d0d0d] border border-white/5 p-8 flex flex-col xl:flex-row justify-between items-center gap-8 group hover:border-[#c5a572]/30 transition-all">
              <div className="flex gap-8 items-center w-full xl:w-auto">
                <div className="w-16 h-16 bg-[#c5a572]/10 border border-[#c5a572]/20 flex items-center justify-center shrink-0">
                  <Hammer className="text-[#c5a572]" size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-serif text-white">{bid.yacht}</h3>
                    <span className="text-[8px] px-2 py-0.5 bg-white/5 text-gray-400 uppercase tracking-widest">#{bid.id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-gray-500">
                    <span className="flex items-center gap-1.5"><UserIcon size={10} /> {bid.bidder}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-800" />
                    <span>Received {bid.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10 w-full xl:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-[8px] uppercase tracking-tighter text-gray-600 mb-1 font-black">Current Offer</p>
                  <p className={cn(
                    "text-3xl font-serif",
                    bid.amount >= bid.minAcceptable ? "text-[#c5a572]" : "text-red-500"
                  )}>
                    €{bid.amount.toLocaleString()}
                  </p>
                  {bid.amount < bid.minAcceptable && (
                    <p className="text-[8px] text-red-500/70 uppercase tracking-widest mt-1 flex items-center justify-end gap-1">
                      <ShieldAlert size={10} /> Below Minimum
                    </p>
                  )}
                </div>

                <div className="flex gap-3 shrink-0">
                  <button className="px-8 py-4 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:border-red-500/20 transition-all">
                    Reject
                  </button>
                  <button className="px-8 py-4 bg-[#c5a572] hover:bg-white text-black text-[10px] font-bold uppercase tracking-widest transition-all">
                    Accept Offer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "rules" && (
        <div className="bg-[#0d0d0d] border border-white/5 p-10 max-w-2xl">
          <h2 className="text-xl font-serif italic text-white mb-6">Automation Logic</h2>
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#c5a572] font-black">Global Threshold</label>
              <div className="flex items-center justify-between p-4 bg-white/2 border border-white/5">
                <span className="text-[11px] text-gray-400 uppercase tracking-widest">Auto-Reject bids below (%)</span>
                <input type="number" defaultValue={85} className="bg-transparent border-b border-[#c5a572] text-white text-center w-16 outline-none" />
              </div>
            </div>
            <div className="p-6 bg-[#c5a572]/5 border border-[#c5a572]/20 border-dashed">
              <p className="text-[10px] text-[#c5a572] leading-relaxed uppercase tracking-widest">
                Rule: If a bid is submitted at 95% or more of the asking price, notify the Branch Manager immediately via SMS.
              </p>
            </div>
            <Button className="w-full h-14 rounded-none bg-white text-black uppercase text-[10px] font-black tracking-widest hover:bg-[#c5a572] transition-colors">
              Update Automation Rules
            </Button>
          </div>
        </div>
      )}

      {/* Quick Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white/2 border border-white/5">
          <p className="text-[8px] uppercase tracking-widest text-gray-500 mb-1">Weekly Volume</p>
          <p className="text-xl font-serif text-white">€12,450,000</p>
        </div>
        <div className="p-6 bg-white/2 border border-white/5 text-center">
          <p className="text-[8px] uppercase tracking-widest text-gray-500 mb-1">Average Variance</p>
          <p className="text-xl font-serif text-white">-2.4%</p>
        </div>
        <div className="p-6 bg-white/2 border border-white/5 text-right">
          <p className="text-[8px] uppercase tracking-widest text-gray-500 mb-1">System Status</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Automations Active</p>
        </div>
      </div>
    </div>
  );
}