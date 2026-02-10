"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { Search, Anchor, ArrowRight, Gavel, Loader2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// The storage URL for your Laravel backend
const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

// Helper function to generate slug from text
function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export default function PublicFleetGallery() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  // Fetch fleet from API
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const { data } = await api.get("/yachts");
        setVessels(data || []);
        
        // Calculate price range for filtering
        if (data && data.length > 0) {
          const prices = data
            .filter((v: any) => v.price && !isNaN(v.price))
            .map((v: any) => Number(v.price));
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange([minPrice, maxPrice]);
          }
        }
      } catch (error) {
        console.error("Critical Registry Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  // Filter logic with updated field names
  const filteredVessels = vessels.filter((v: any) => {
    // Get safe values with null checks
    const boatName = v.boat_name || '';
    const builder = v.builder || '';
    const designer = v.designer || '';
    const location = v.where || '';
    const vesselId = v.vessel_id || '';
    const status = v.status || '';
    const price = v.price || 0;
    
    // Status filter
    const matchesFilter =
      filter === "All" ||
      (filter === "Auction" && status === "For Bid") ||
      (filter === "Sale" && status === "For Sale") ||
      (filter === "Sold" && status === "Sold") ||
      (filter === "Draft" && status === "Draft");

    // Search filter (multiple fields)
    const searchLower = search.toLowerCase();
    const matchesSearch =
      boatName.toLowerCase().includes(searchLower) ||
      builder.toLowerCase().includes(searchLower) ||
      designer.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower) ||
      vesselId.toLowerCase().includes(searchLower);

    // Price range filter
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesFilter && matchesSearch && matchesPrice;
  });

  // Sort vessels
  const sortedVessels = [...filteredVessels].sort((a: any, b: any) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "year-new":
        return (b.year || 0) - (a.year || 0);
      case "year-old":
        return (a.year || 0) - (b.year || 0);
      case "name-asc":
        return (a.boat_name || '').localeCompare(b.boat_name || '');
      case "name-desc":
        return (b.boat_name || '').localeCompare(a.boat_name || '');
      default:
        return 0;
    }
  });

  // Format currency
  const formatCurrency = (amount: number | string | null | undefined) => {
    if (!amount || amount === '' || isNaN(Number(amount))) return '€ --';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  // Get image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    return `${STORAGE_URL}${imagePath}`;
  };

  // Handle image error
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale");
  };

  // Get yacht details safely
  const getYachtName = (yacht: any) => yacht.boat_name || 'Unnamed Vessel';
  const getYachtStatus = (yacht: any) => yacht.status || 'Draft';
  const getYachtLength = (yacht: any) => yacht.loa || yacht.length || '--';
  const getYachtBuilder = (yacht: any) => yacht.builder || 'N/A';
  const getYachtDesigner = (yacht: any) => yacht.designer || 'N/A';

  // Generate yacht detail URL with slug
  const getYachtDetailUrl = (yacht: any) => {
    const slug = generateSlug(yacht.boat_name || yacht.vessel_id || `yacht-${yacht.id}`);
    return `/nl/yachts/${yacht.id}/${slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="animate-spin text-[#003566]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Loading Fleet Registry...
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
                  Current Fleet Registry
                </p>
              </div>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif tracking-tighter leading-[0.9] text-white">
                The{" "}
                <span className="italic font-light text-white/40">Fleet</span>
              </h1>
              <p className="text-white/70 text-sm md:text-base max-w-2xl">
                Explore our curated collection of premium yachts, available for purchase or auction.
              </p>
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
                  placeholder="Search by name, builder, or location..."
                  className="bg-white/10 backdrop-blur-md border border-white/10 pl-10 pr-4 py-2.5 text-[9px] uppercase font-bold tracking-widest text-white outline-none focus:bg-white focus:text-[#003566] transition-all w-full sm:w-64"
                />
              </div>

              <div className="flex bg-white/5 backdrop-blur-md border border-white/10 p-1">
                {["All", "Auction", "Sale", "Sold"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "flex-1 sm:flex-none px-3 md:px-4 py-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all",
                      filter === cat
                        ? "bg-white text-[#003566]"
                        : "text-white/60 hover:text-white hover:bg-white/10",
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

      {/* FILTERS BAR */}
      <section className="bg-slate-50 border-b border-slate-100 py-4">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Sort by:
                </span>
              </div>
              <select
                className="bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-[#003566] outline-none focus:border-blue-600 transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="year-new">Year: Newest First</option>
                <option value="year-old">Year: Oldest First</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Price Range:
                </span>
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-32 accent-blue-600"
                />
                <span className="text-xs font-bold text-[#003566]">
                  {formatCurrency(priceRange[1])}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-[#003566]">{sortedVessels.length}</span> of{" "}
              <span className="font-bold">{vessels.length}</span> vessels
            </div>
          </div>
        </div>
      </section>

      {/* FLEET GRID */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">
        {sortedVessels.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⛵</div>
            <h3 className="text-xl font-serif text-slate-400 mb-2">No vessels found</h3>
            <p className="text-slate-500 mb-6">
              {search || filter !== "All" 
                ? "Try adjusting your search or filters" 
                : "No vessels are currently available in the registry"}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilter("All");
                setSortBy("default");
              }}
              className="px-6 py-3 bg-[#003566] text-white text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {sortedVessels.map((v: any) => {
                const detailUrl = getYachtDetailUrl(v);
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={v.id}
                    className="group relative"
                  >
                    <Link
                      href={detailUrl}
                      className="relative aspect-[4/5] overflow-hidden block bg-slate-100"
                    >
                      <img
                        src={getImageUrl(v.main_image)}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt={getYachtName(v)}
                      />
                      <div className="absolute top-6 left-6 flex gap-2">
                        <span
                          className={cn(
                            "px-4 py-2 text-[9px] font-black uppercase tracking-widest backdrop-blur-md border",
                            getYachtStatus(v) === "For Bid"
                              ? "bg-blue-600 text-white border-blue-700"
                              : getYachtStatus(v) === "For Sale"
                                ? "bg-emerald-600 text-white border-emerald-700"
                                : getYachtStatus(v) === "Sold"
                                  ? "bg-red-600 text-white border-red-700"
                                  : "bg-slate-600 text-white border-slate-700",
                          )}
                        >
                          {getYachtStatus(v) === "For Bid" 
                            ? "Auction" 
                            : getYachtStatus(v) === "For Sale"
                              ? "For Sale"
                              : getYachtStatus(v) === "Sold"
                                ? "Sold"
                                : "Draft"}
                        </span>
                        {v.vessel_id && (
                          <span className="px-3 py-2 text-[8px] font-black uppercase tracking-widest bg-black/80 text-white">
                            ID: {v.vessel_id}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white text-xs font-black uppercase tracking-widest mb-1">
                              {getYachtBuilder(v)}
                            </p>
                            <p className="text-white text-lg font-serif italic">
                              {getYachtName(v)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">
                              Valuation
                            </p>
                            <p className="text-white text-2xl font-bold">
                              {formatCurrency(v.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="pt-6">
                      {/* VESSEL SPECS */}
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                            LOA
                          </p>
                          <p className="text-sm font-serif font-bold text-[#003566]">
                            {getYachtLength(v)}m
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                            Year
                          </p>
                          <p className="text-sm font-serif font-bold text-[#003566]">
                            {v.year || '--'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                            Cabins
                          </p>
                          <p className="text-sm font-serif font-bold text-[#003566]">
                            {v.cabins || "0"}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase text-slate-400 mb-1">
                            Beam
                          </p>
                          <p className="text-sm font-serif font-bold text-[#003566]">
                            {v.beam || '--'}m
                          </p>
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="font-bold">Designer:</span>
                          <span>{getYachtDesigner(v)}</span>
                        </div>
                        {v.where && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-bold">Location:</span>
                            <span>{v.where}</span>
                          </div>
                        )}
                        {v.passenger_capacity && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-bold">Capacity:</span>
                            <span>{v.passenger_capacity} passengers</span>
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex gap-3">
                        <Link 
                          href={detailUrl}
                          className="flex-1 bg-[#003566] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowRight size={14} />
                          View Details
                        </Link>
                        {getYachtStatus(v) === "For Bid" && (
                          <Link 
                            href={detailUrl}
                            className="px-4 py-3 bg-amber-600 text-white hover:bg-amber-700 transition-all flex items-center justify-center"
                          >
                            <Gavel size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* FEATURED VESSEL SECTION */}
      {vessels.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">
          <div className="bg-slate-50 border border-slate-200 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center">
              <div className="lg:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-[1px] bg-blue-600" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">
                    Featured Vessel
                  </p>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif text-[#003566] mb-6">
                  {getYachtName(vessels[0])}
                </h2>
                <p className="text-slate-600 mb-6">
                  {vessels[0].owners_comment || "A premium vessel from our curated collection."}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                      Price
                    </p>
                    <p className="text-2xl font-bold text-[#003566]">
                      {formatCurrency(vessels[0].price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                      Length
                    </p>
                    <p className="text-2xl font-bold text-[#003566]">
                      {getYachtLength(vessels[0])}m
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                      Year
                    </p>
                    <p className="text-2xl font-bold text-[#003566]">
                      {vessels[0].year || '--'}
                    </p>
                  </div>
                </div>
                <Link 
                  href={getYachtDetailUrl(vessels[0])}
                  className="inline-flex items-center gap-2 bg-[#003566] text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
                >
                  Explore This Vessel
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="lg:w-1/3">
                <img
                  src={getImageUrl(vessels[0].main_image)}
                  onError={handleImageError}
                  alt={getYachtName(vessels[0])}
                  className="w-full h-64 md:h-80 object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-32">
        <div className="bg-[#003566] p-12 md:p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
            <Anchor size={300} className="text-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
              Seeking a{" "}
              <span className="italic text-blue-300">custom vessel</span>{" "}
              outside this registry?
            </h2>
            <p className="text-white/70 mb-8">
              Our global network can source the perfect vessel to match your specific requirements. 
              Contact our specialists for bespoke yacht sourcing.
            </p>
            <Link 
              href="/nl/contact"
              className="inline-flex items-center gap-4 px-12 py-4 bg-white text-[#003566] text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all group"
            >
              Inquire for Bespoke Sourcing
              <ArrowRight
                size={16}
                className="group-hover:translate-x-2 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* FLEET STATS */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-12">
        <div className="border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Total Vessels in Registry
              </p>
              <p className="text-3xl font-bold text-[#003566]">{vessels.length}</p>
            </div>
            <div className="grid grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  For Sale
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {vessels.filter((v: any) => v.status === "For Sale").length}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  For Bid
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {vessels.filter((v: any) => v.status === "For Bid").length}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Sold
                </p>
                <p className="text-lg font-bold text-red-600">
                  {vessels.filter((v: any) => v.status === "Sold").length}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Draft
                </p>
                <p className="text-lg font-bold text-slate-500">
                  {vessels.filter((v: any) => v.status === "Draft").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}