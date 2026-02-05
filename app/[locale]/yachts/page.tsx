"use client";

import { useState, useEffect } from "react";
import { Search, Anchor, ArrowRight, Gavel, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// 1. IMPORT LOCAL PLACEHOLDER
import YachtPlaceholder from "@/components/homepage/yacht.jpg";

// The storage URL for your Laravel backend
const STORAGE_URL = "https://schepen-kring.nl/storage/";

export default function PublicFleetGallery() {
  const [vessels, setVessels] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. FETCH FLEET FROM API
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

  // 3. FILTER LOGIC (Aligned with BidController Statuses)
  const filteredVessels = vessels.filter((v: any) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Auction" && v.status === "For Bid") || // Matches Controller check
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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Loading Manifest...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#003566] selection:bg-blue-100">
      {/* HEADER SECTION */}
      <section className="relative w-full min-h-[40vh] md:h-[50vh] flex flex-col justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600"
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-[#001D3D]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000814] via-transparent to-[#001D3D]/40" />
        </div>

        <header className="relative z-10 px-6 md:px-12 max-w-[1400px] mx-auto w-full py-8 md:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-10 border-b border-white/20 pb-6 md:pb-10">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-6 md:w-10 h-[1px] bg-blue-400" />
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-blue-300">
                  Current Inventory
                </p>
              </div>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif tracking-tighter leading-[0.9] text-white">
                The{" "}
                <span className="italic font-light text-white/40">Fleet</span>
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative group flex-1 sm:flex-none">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                  size={14}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Vessels..."
                  className="bg-white/10 backdrop-blur-md border border-white/10 pl-10 pr-4 py-2.5 text-[9px] uppercase font-bold tracking-widest text-white outline-none focus:bg-white focus:text-[#003566] transition-all w-full sm:w-48"
                />
              </div>

              <div className="flex bg-white/5 backdrop-blur-md border border-white/10 p-1">
                {["All", "Auction", "Sale"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "flex-1 sm:flex-none px-4 md:px-6 py-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all",
                      filter === cat
                        ? "bg-white text-[#003566]"
                        : "text-white/60",
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
                <Link
                  href={`/nl/yachts/${v.id}`}
                  className="relative aspect-[4/5] overflow-hidden block bg-slate-100"
                >
                  <img
                    src={
                      v.main_image
                        ? `${STORAGE_URL}${v.main_image}`
                        : YachtPlaceholder.src
                    }
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt={v.name}
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span
                      className={cn(
                        "px-4 py-2 text-[9px] font-black uppercase tracking-widest backdrop-blur-md",
                        v.status === "For Bid"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-[#003566]",
                      )}
                    >
                      {v.status === "For Bid" ? "Auction" : "Direct Sale"}
                    </span>
                    {v.status === "Sold" && (
                      <span className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-red-600 text-white">
                        Sold
                      </span>
                    )}
                  </div>
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

                  {/* VESSEL SPECS */}
                  <div className="grid grid-cols-3 gap-2 border-y border-slate-50 py-6 mb-8">
                    <div className="text-center border-r border-slate-50">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                        Length
                      </p>
                      <p className="text-sm font-serif italic">{v.length}</p>
                    </div>
                    <div className="text-center border-r border-slate-50">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                        Year
                      </p>
                      <p className="text-sm font-serif italic">{v.year}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                        Cabins
                      </p>
                      <p className="text-sm font-serif italic">
                        {v.cabins || "0"}
                      </p>
                    </div>
                  </div>

                  {/* PRICING & CTA (Synchronized with BidController) */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest mb-1">
                        {v.status === "For Bid"
                          ? "Current High Bid"
                          : "Valuation"}
                      </p>
                      <p className="text-3xl font-serif tracking-tighter">
                        {/* Show current_bid if it exists, otherwise base price */}
                        €
                        {new Intl.NumberFormat().format(
                          v.current_bid || v.price,
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {v.status === "For Bid" && (
                        <Link href={`/bids/${v.id}`}>
                          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <Gavel size={20} />
                          </button>
                        </Link>
                      )}
                      <Link href={`/nl/yachts/${v.id}`}>
                        <button className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 hover:border-[#003566] hover:bg-[#003566] hover:text-white transition-all">
                          <ArrowRight size={20} />
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
        <div className="bg-[#003566] p-16 md:p-24 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
            <Anchor size={300} className="text-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-8">
              Seeking a{" "}
              <span className="italic text-blue-300">custom vessel</span>{" "}
              outside this manifest?
            </h2>
            <button className="px-12 py-6 bg-white text-[#003566] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-50 transition-all flex items-center gap-4 group">
              Inquire for Bespoke Sourcing
              <ArrowRight
                size={16}
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
