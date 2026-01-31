"use client";

import { useState } from "react";
import { 
  Search, Filter, Gavel, Ship, 
  ChevronRight, Anchor, Maximize2, 
  Wind, Users 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data for the Gallery
const ALL_YACHTS = [
  {
    id: "Y-882",
    name: "M/Y SOVEREIGN",
    type: "Auction",
    price: "$12,500,000",
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
    length: "45m",
    guests: "12",
    year: "2023"
  },
  {
    id: "Y-104",
    name: "THE AZURE SKY",
    type: "Direct Sale",
    price: "$4,200,000",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    length: "32m",
    guests: "8",
    year: "2021"
  },
  {
    id: "Y-202",
    name: "M/Y OBSIDIAN",
    type: "Auction",
    price: "$28,900,000",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798156?w=800",
    length: "62m",
    guests: "16",
    year: "2025"
  },
  {
    id: "Y-305",
    name: "SILVER VOYAGER",
    type: "Direct Sale",
    price: "$1,850,000",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800",
    length: "18m",
    guests: "6",
    year: "2022"
  }
];

export default function PublicFleetGallery() {
  const [filter, setFilter] = useState("All");

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#c5a572] selection:text-black">
      
      {/* 1. MINIMALIST NAVIGATION HEADER */}
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-serif italic tracking-tighter">The Fleet</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a572] font-black">
              Global Inventory // Verified Listings
            </p>
          </div>
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex bg-[#0d0d0d] border border-white/10 p-1 focus-within:border-[#c5a572] transition-all">
                <div className="px-4 flex items-center text-gray-600"><Search size={16} /></div>
                <input 
                  placeholder="SEARCH VESSELS..." 
                  className="bg-transparent border-none outline-none text-[10px] uppercase font-bold py-3 w-full sm:w-48 placeholder:text-gray-800"
                />
            </div>
            <div className="flex bg-[#0d0d0d] border border-white/10 p-1">
                {["All", "Auction", "Sale"].map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={cn(
                            "px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all",
                            (cat === "All" && filter === "All") || (cat === "Auction" && filter === "Auction") || (cat === "Sale" && filter === "Direct Sale")
                                ? "bg-[#c5a572] text-black" 
                                : "text-gray-500 hover:text-white"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SHIP MANIFEST GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {ALL_YACHTS.filter(y => filter === "All" || y.type.includes(filter)).map((yacht) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={yacht.id}
                className="group flex flex-col bg-[#0d0d0d] border border-white/5 hover:border-[#c5a572]/30 transition-all duration-500"
              >
                {/* Image Wrap */}
                <Link href={`/fleet/${yacht.id}`} className="relative aspect-[4/3] overflow-hidden block">
                   <img 
                    src={yacht.image} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={yacht.name} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                   
                   {/* Top Badge */}
                   <div className="absolute top-4 left-4">
                      <div className={cn(
                        "px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] backdrop-blur-md border",
                        yacht.type === "Auction" ? "bg-blue-600/10 border-blue-500/30 text-blue-400" : "bg-[#c5a572]/10 border-[#c5a572]/30 text-[#c5a572]"
                      )}>
                         {yacht.type}
                      </div>
                   </div>
                </Link>

                {/* Info Area */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold uppercase tracking-tight">{yacht.name}</h3>
                        <p className="text-[10px] font-mono text-gray-600">#{yacht.id}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pb-6 mb-6 border-b border-white/5">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-gray-700 tracking-widest">Length</p>
                            <p className="text-xs font-bold">{yacht.length}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-gray-700 tracking-widest">Built</p>
                            <p className="text-xs font-bold">{yacht.year}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black uppercase text-gray-700 tracking-widest">Guests</p>
                            <p className="text-xs font-bold">{yacht.guests}</p>
                        </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[9px] font-black uppercase text-[#c5a572] tracking-[0.2em] mb-1">
                            {yacht.type === "Auction" ? "Opening Bid" : "Listing Price"}
                        </p>
                        <p className="text-2xl font-bold italic tracking-tighter">{yacht.price}</p>
                    </div>
                    <Link href={`/fleet/${yacht.id}`}>
                        <button className="p-4 bg-white/5 hover:bg-[#c5a572] text-white hover:text-black transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. CTA FOOTER */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="bg-[#0d0d0d] border border-white/5 p-12 flex flex-col items-center text-center space-y-6">
            <Anchor className="text-[#c5a572]" size={32} />
            <h2 className="text-3xl font-serif italic max-w-md">Can't find the specific vessel you're looking for?</h2>
            <button className="px-10 py-4 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                Inquire for Bespoke Sourcing
            </button>
        </div>
      </div>
    </div>
  );
}