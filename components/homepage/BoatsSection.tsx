"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Anchor } from "lucide-react";
import Link from "next/link";

const vessels = [
  {
    id: "01",
    name: "M/Y SOVEREIGN",
    price: "$12,500,000",
    status: "Auction Active",
    image: "https://images.unsplash.com/photo-1567891299233-13fb1a720dc1?auto=format&fit=crop&q=60&w=800&fm=webp",
    specs: "45m / 2023 / 12 Guests"
  },
  {
    id: "02",
    name: "THE AZURE SKY",
    price: "$4,200,000",
    status: "Direct Sale",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798156?auto=format&fit=crop&q=60&w=800&fm=webp",
    specs: "32m / 2021 / 8 Guests"
  },
  {
    id: "03",
    name: "M/Y OBSIDIAN",
    price: "$28,900,000",
    status: "Auction Active",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=60&w=800&fm=webp",
    specs: "62m / 2025 / 16 Guests"
  },
  {
    id: "04",
    name: "SILVER VOYAGER",
    price: "$1,850,000",
    status: "Direct Sale",
    image: "https://images.unsplash.com/photo-1524522173746-f628baad3644?auto=format&fit=crop&q=60&w=800&fm=webp",
    specs: "18m / 2022 / 6 Guests"
  }
];

export const BoatsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.7;
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white py-32 border-t border-slate-100 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* White Theme Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[1px] bg-blue-600"></span>
              <span className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.4em]">Available Fleet</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-serif text-[#003566] tracking-tighter leading-[0.9]">
              The <span className="italic font-light text-slate-300">Elite</span> <br />Collection
            </h2>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => scroll("left")}
              className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-[#003566] hover:bg-[#003566] hover:text-white transition-all duration-500"
            >
              <ArrowLeft size={22} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-[#003566] hover:bg-[#003566] hover:text-white transition-all duration-500"
            >
              <ArrowRight size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Yacht Gallery Slider */}
        <div 
          ref={scrollRef}
          className="flex gap-10 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-20 scroll-smooth"
        >
          {vessels.map((boat) => (
            <div 
              key={boat.id}
              className="min-w-[85vw] md:min-w-[450px] snap-start group"
            >
              {/* Image Frame with Placeholder and Fail-safe */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[#003566] mb-8 rounded-sm">
                {/* Fallback Icon visible while loading or if broken */}
                <div className="absolute inset-0 flex items-center justify-center text-white/10">
                  <Anchor size={80} />
                </div>

                <img 
                  src={boat.image} 
                  alt={boat.name}
                  className="w-full h-full object-cover transition-opacity duration-700 opacity-0"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onError={(e) => {
                    // If link is broken, hide the img tag and show the navy background/icon
                    e.currentTarget.style.display = 'none';
                  }}
                  loading="lazy"
                />
                
                <div className="absolute top-6 left-6">
                  <span className="bg-white/95 backdrop-blur-sm text-[#003566] text-[10px] font-bold uppercase px-4 py-2 tracking-widest shadow-sm">
                    {boat.status}
                  </span>
                </div>
              </div>

              {/* Info Area */}
              <div className="px-2">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-2 block">{boat.specs}</span>
                    <h4 className="text-3xl font-serif text-[#003566] leading-none">
                      {boat.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Inquiry From</p>
                    <p className="text-2xl font-light text-[#003566]">{boat.price}</p>
                  </div>
                </div>

                <Link href="/fleet" className="inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#003566] border-b border-slate-200 pb-2 hover:border-[#003566] transition-all group/link">
                  Vessel Details
                  <Plus size={14} className="group-hover/link:rotate-90 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};