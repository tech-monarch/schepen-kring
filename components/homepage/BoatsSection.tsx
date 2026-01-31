"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, ArrowRight, Gavel, Ship, Anchor } from "lucide-react";
import Link from "next/link";

const vessels = [
  {
    id: "01",
    name: "M/Y SOVEREIGN",
    price: "$12,500,000",
    status: "Auction Active",
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200",
    specs: "45m / 2023 / 12 Guests"
  },
  {
    id: "02",
    name: "THE AZURE SKY",
    price: "$4,200,000",
    status: "Direct Sale",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200",
    specs: "32m / 2021 / 8 Guests"
  },
  {
    id: "03",
    name: "M/Y OBSIDIAN",
    price: "$28,900,000",
    status: "Auction Active",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798156?w=1200",
    specs: "62m / 2025 / 16 Guests"
  },
  {
    id: "04",
    name: "SILVER VOYAGER",
    price: "$1,850,000",
    status: "Direct Sale",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200",
    specs: "18m / 2022 / 6 Guests"
  }
];

export const BoatsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-black py-24 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#c5a572]">
              <Anchor size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Curated Fleet</span>
            </div>
            <h2 className="text-5xl font-serif italic text-white tracking-tight">The Elite Collection</h2>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => scroll("left")}
              className="p-4 border border-white/10 text-white hover:border-[#c5a572] hover:text-[#c5a572] transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-4 border border-white/10 text-white hover:border-[#c5a572] hover:text-[#c5a572] transition-all"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10 scroll-smooth"
        >
          {vessels.map((boat) => (
            <motion.div 
              key={boat.id}
              className="min-w-[85vw] md:min-w-[600px] snap-start group relative bg-[#0d0d0d] border border-white/5"
            >
              {/* Image Area */}
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={boat.image} 
                  alt={boat.name}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute top-6 right-6">
                    <span className="bg-black/60 backdrop-blur-md border border-[#c5a572]/40 text-[#c5a572] text-[9px] font-black uppercase px-4 py-2 tracking-widest">
                        {boat.status}
                    </span>
                </div>
              </div>

              {/* Data Area */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight text-white uppercase group-hover:text-[#c5a572] transition-colors">
                      {boat.name}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{boat.specs}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-gray-600 mb-1">Asking Price</p>
                    <p className="text-xl font-bold text-white italic">{boat.price}</p>
                  </div>
                </div>

                <Link href="/fleet">
                    <button className="w-full group/btn relative flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
                        {boat.status.includes("Auction") ? <Gavel size={14} /> : <Ship size={14} />}
                        Explore Details
                    </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom View All Link */}
        <div className="mt-12 flex justify-center">
            <Link href="nl/fleet" className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 hover:text-[#c5a572] transition-colors border-b border-transparent hover:border-[#c5a572] pb-2">
                Discover All 24 Vessels
            </Link>
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};