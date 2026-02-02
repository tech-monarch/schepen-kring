"use client";

import { useState, useEffect } from "react";
import { Search, Anchor, ArrowRight, Gavel, Loader2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// Placeholder import (ensure you have this or remove it)
import YachtPlaceholder from "@/components/homepage/yacht.jpg";

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function PublicFleetGallery() {
  const [vessels, setVessels] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const { data } = await api.get("/yachts");
        setVessels(data);
      } catch (error) {
        console.error("Critical Registry Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  const filteredVessels = vessels.filter((v: any) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Auction" && v.status === "For Bid") ||
      (filter === "Sale" && v.status === "For Sale");

    const matchesSearch = 
      v.name.toLowerCase().includes(search.toLowerCase()) || 
      v.make?.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="animate-spin text-[#003566]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Manifest...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#003566] selection:bg-blue-100">
      
      {/* HEADER SECTION */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600" 
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-[#001D3D]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000814] via-transparent to-[#001D3D]/40" />
        </div>

        <header className="relative z-10 px-6 md:px-12 max-w-[1400px] mx-auto w-full pt-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/20 pb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-blue-400" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-300">
                  Global Inventory
                </p>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif tracking-tighter leading-[0.9] text-white">
                The <span className="italic font-light text-white/40">Manifest</span>
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH FLEET..." 
                  className="bg-white/10 backdrop-blur-md border border-white/10 pl-12 pr-6 py-4 text-[10px] uppercase font-bold tracking-widest text-white outline-none focus:bg-white focus:text-[#003566] transition-all w-full sm:w-64"
                />
              </div>

              <div className="flex bg-white/5 backdrop-blur-md border border-white/10 p-1">
                {["All", "Auction", "Sale"].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                      filter === cat ? "bg-white text-[#003566]" : "text-white/60 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>
      </section>

      {/* FLEET GRID */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          <AnimatePresence mode="popLayout">
            {filteredVessels.map((v: any) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={v.id}
                className="group relative"
              >
                <Link href={`/fleet/${v.id}`} className="relative aspect-[4/5] overflow-hidden block bg-slate-100">
                  <img 
                    src={v.main_image ? `${STORAGE_URL}${v.main_image}` : YachtPlaceholder.src} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    alt={v.name} 
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className={cn(
                      "px-4 py-2 text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm",
                      v.status === 'For Bid' ? "bg-blue-600 text-white" : "bg-white text-[#003566]"
                    )}>
                      {v.status === 'For Bid' ? "Live Auction" : "Direct Sale"}
                    </span>
                    {v.status === 'Sold' && (
                      <span className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-red-600 text-white shadow-sm">Sold</span>
                    )}
                  </div>

                  {/* Quick Action Overlay */}
                  {v.status !== 'Sold' && (
                    <div className="absolute inset-0 bg-[#003566]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4">View Details</p>
                        <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center mx-auto text-white">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  )}
                </Link>

                <div className="pt-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-serif text-[#003566] mb-1 group-hover:text-blue-600 transition-colors">
                        {v.name}
                      </h3>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {v.make} {v.model} | {v.vessel_id}
                      </p>
                    </div>
                  </div>

                  {/* SPECS */}
                  <div className="grid grid-cols-3 gap-2 border-y border-slate-50 py-6 mb-8">
                    <div className="text-center border-r border-slate-50">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Length</p>
                      <p className="text-sm font-serif italic">{v.length}m</p>
                    </div>
                    <div className="text-center border-r border-slate-50">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Year</p>
                      <p className="text-sm font-serif italic">{v.year}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Guests</p>
                      <p className="text-sm font-serif italic">{v.cabins ? v.cabins * 2 : 'N/A'}</p>
                    </div>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest mb-1">
                        {v.status === 'For Bid' ? "Current Bid" : "Valuation"}
                      </p>
                      <p className="text-3xl font-serif tracking-tighter text-[#003566]">
                        €{new Intl.NumberFormat().format(v.current_bid || v.price)}
                      </p>
                    </div>
                    
                    {/* BUTTONS LINKING TO BIDS PAGE */}
                    <div className="flex gap-2">
                      {v.status !== 'Sold' && (
                        <Link href={`/nl/bids/${v.id}`}>
                          <button 
                            className={cn(
                              "w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-sm",
                              v.status === 'For Bid' 
                                ? "bg-blue-600 text-white hover:bg-blue-700" 
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            )}
                            title={v.status === 'For Bid' ? "Enter Auction" : "Book Test Sail"}
                          >
                            {v.status === 'For Bid' ? <Gavel size={18} /> : <Anchor size={18} />}
                          </button>
                        </Link>
                      )}
                      
                      <Link href={`/fleet/${v.id}`}>
                        <button className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 hover:border-[#003566] hover:bg-[#003566] hover:text-white transition-all">
                          <ArrowRight size={18} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-32">
        <div className="bg-[#003566] p-16 md:p-24 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
             <Anchor size={300} className="text-white" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-8">
              Seeking a <span className="italic text-blue-300">custom vessel</span> outside this manifest?
            </h2>
            <button className="px-12 py-6 bg-white text-[#003566] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-50 transition-all flex items-center gap-4 group">
              Inquire for Bespoke Sourcing
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}