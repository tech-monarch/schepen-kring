"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import {
  Search,
  Anchor,
  ArrowRight,
  Gavel,
  Loader2,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const generateSlug = (text: string): string =>
  text
    ? text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim()
    : "";

const formatCurrency = (amount: number | string | null | undefined): string => {
  const num = Number(amount);
  return !isNaN(num) && num > 0
    ? new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num)
    : "€ --";
};

const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return PLACEHOLDER_IMAGE;
  if (imagePath.startsWith("http")) return imagePath;
  return `${STORAGE_URL}${imagePath}`;
};

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------
export default function PublicFleetGallery() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  // ---------- New state for comparison ----------
  const [viewMode, setViewMode] = useState<"grid" | "compare">("grid");
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  // -----------------------------------------------

  // --------------------------------------------------------
  // 1. FETCH ALL YACHTS – NO FILTERING, SHOW EVERY RECORD
  // --------------------------------------------------------
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const { data } = await api.get("/yachts");
        const allVessels = Array.isArray(data) ? data : data?.data || [];
        setVessels(allVessels.filter((v: any) => v.status !== "Draft"));

        const prices = allVessels
          .map((v: any) => Number(v.price))
          .filter((p: number) => !isNaN(p) && p > 0);
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000000;
        setPriceRange([0, maxPrice]);
      } catch (error) {
        console.error("Critical Registry Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  // --------------------------------------------------------
  // 2. FILTERING
  // --------------------------------------------------------
  const filteredVessels = vessels.filter((v: any) => {
    const boatName = v.boat_name || "";
    const builder = v.builder || "";
    const designer = v.designer || "";
    const location = v.where || "";
    const vesselId = v.vessel_id || "";
    const status = v.status || "";
    const price = Number(v.price) || 0;

    const matchesFilter =
      filter === "All" ||
      (filter === "Auction" && status === "For Bid") ||
      (filter === "Sale" && status === "For Sale") ||
      (filter === "Sold" && status === "Sold");

    const searchLower = search.toLowerCase();
    const matchesSearch =
      boatName.toLowerCase().includes(searchLower) ||
      builder.toLowerCase().includes(searchLower) ||
      designer.toLowerCase().includes(searchLower) ||
      location.toLowerCase().includes(searchLower) ||
      vesselId.toLowerCase().includes(searchLower);

    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesFilter && matchesSearch && matchesPrice;
  });

  // --------------------------------------------------------
  // 3. SORTING
  // --------------------------------------------------------
  const sortedVessels = [...filteredVessels].sort((a: any, b: any) => {
    switch (sortBy) {
      case "price-low":
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      case "price-high":
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      case "year-new":
        return (b.year || 0) - (a.year || 0);
      case "year-old":
        return (a.year || 0) - (b.year || 0);
      case "name-asc":
        return (a.boat_name || "").localeCompare(b.boat_name || "");
      case "name-desc":
        return (b.boat_name || "").localeCompare(a.boat_name || "");
      default:
        return 0;
    }
  });

  // ---------- Keep selected vessels only if they still exist in the filtered list ----------
  useEffect(() => {
    setSelectedCompareIds((prev) =>
      prev.filter((id) => sortedVessels.some((v) => v.id === id))
    );
  }, [sortedVessels]);

  // --------------------------------------------------------
  // 4. HELPER GETTERS
  // --------------------------------------------------------
  const getYachtName = (yacht: any) => yacht.boat_name || "Unnamed Vessel";
  const getYachtStatus = (yacht: any) => yacht.status || "Draft";
  const getYachtLength = (yacht: any) => yacht.loa || yacht.length || "--";
  const getYachtBuilder = (yacht: any) => yacht.builder || "N/A";
  const getYachtDesigner = (yacht: any) => yacht.designer || "N/A";
  const getYachtDetailUrl = (yacht: any) => {
    const slug = generateSlug(
      yacht.boat_name || yacht.vessel_id || `yacht-${yacht.id}`
    );
    return `/nl/yachts/${yacht.id}/${slug}`;
  };

  const featuredVessel = vessels.length > 0 ? vessels[0] : null;

  // --------------------------------------------------------
  // 5. LOADING STATE
  // --------------------------------------------------------
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

  // --------------------------------------------------------
  // 6. RENDER
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-[#003566] selection:bg-blue-100">
      {/* HEADER SECTION (unchanged) */}
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
                Explore our curated collection of premium yachts, available for
                purchase or auction.
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
                  className="bg-white/10 backdrop-blur-md border border-white/10 pl-10 pr-4 py-2.5 text-[9px] uppercase font-bold tracking-widest text-white outline-none focus:bg-white focus:text-[#003566] transition-all w-full sm:w-64 placeholder:text-white/50"
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
                        : "text-white/60 hover:text-white hover:bg-white/10"
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

      {/* FILTERS BAR – with view toggle */}
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
                  min={0}
                  max={priceRange[1]}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="w-32 accent-blue-600"
                />
                <span className="text-xs font-bold text-[#003566]">
                  {formatCurrency(priceRange[1])}
                </span>
              </div>
            </div>

            {/* View toggle + count */}
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "compare" : "grid")
                }
                className="px-4 py-2 bg-[#003566] text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
              >
                {viewMode === "grid" ? "Switch to Compare" : "Back to Grid"}
              </button>
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-[#003566]">
                  {sortedVessels.length}
                </span>{" "}
                of{" "}
                <span className="font-bold">{vessels.length}</span> vessels
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== DYNAMIC CONTENT ========== */}
      {viewMode === "grid" ? (
        /* ---------- GRID VIEW (original) ---------- */
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">
          {sortedVessels.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⛵</div>
              <h3 className="text-xl font-serif text-slate-400 mb-2">
                No vessels found
              </h3>
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
                      {/* Card content (unchanged) ... */}
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
                                : "bg-slate-600 text-white border-slate-700"
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
                              {v.year || "--"}
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
                              {v.beam || "--"}m
                            </p>
                          </div>
                        </div>

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
      ) : (
        /* ---------- COMPARISON VIEW ---------- */
        <ComparisonView
          vessels={sortedVessels}
          selectedIds={selectedCompareIds}
          onToggleSelect={(id) =>
            setSelectedCompareIds((prev) =>
              prev.includes(id)
                ? prev.filter((i) => i !== id)
                : [...prev, id]
            )
          }
          onClearSelection={() => setSelectedCompareIds([])}
          getYachtName={getYachtName}
          getYachtBuilder={getYachtBuilder}
          getYachtDesigner={getYachtDesigner}
          getYachtLength={getYachtLength}
          formatCurrency={formatCurrency}
          getImageUrl={getImageUrl}
          handleImageError={handleImageError}
        />
      )}

      {/* FEATURED VESSEL & FOOTER (unchanged) */}
      {featuredVessel && viewMode === "grid" && (
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
                  {getYachtName(featuredVessel)}
                </h2>
                <p className="text-slate-600 mb-6">
                  {featuredVessel.owners_comment ||
                    "A premium vessel from our curated collection."}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                      Price
                    </p>
                    <p className="text-2xl font-bold text-[#003566]">
                      {formatCurrency(featuredVessel.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                      Length
                    </p>
                    <p className="text-2xl font-bold text-[#003566]">
                      {getYachtLength(featuredVessel)}m
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                      Year
                    </p>
                    <p className="text-2xl font-bold text-[#003566]">
                      {featuredVessel.year || "--"}
                    </p>
                  </div>
                </div>
                <Link
                  href={getYachtDetailUrl(featuredVessel)}
                  className="inline-flex items-center gap-2 bg-[#003566] text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
                >
                  Explore This Vessel
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="lg:w-1/3">
                <img
                  src={getImageUrl(featuredVessel.main_image)}
                  onError={handleImageError}
                  alt={getYachtName(featuredVessel)}
                  className="w-full h-64 md:h-80 object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-32">
        <div className="bg-[#003566] p-12 md:p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
            <Anchor size={300} className="text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
              Seeking a <span className="italic text-blue-300">
                custom vessel
              </span>{" "}
              outside this registry?
            </h2>
            <p className="text-white/70 mb-8">
              Our global network can source the perfect vessel to match your
              specific requirements. Contact our specialists for bespoke yacht
              sourcing.
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

      {vessels.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-12">
          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Total Vessels in Registry
                </p>
                <p className="text-3xl font-bold text-[#003566]">
                  {vessels.length}
                </p>
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
                  <p className="text-lg font-bold text-slate-600">
                    {vessels.filter((v: any) => v.status === "Draft").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Comparison View – fully restyled with Tailwind, no external CSS
// ------------------------------------------------------------
function ComparisonView({
  vessels,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  getYachtName,
  getYachtBuilder,
  getYachtDesigner,
  getYachtLength,
  formatCurrency,
  getImageUrl,
  handleImageError,
}: {
  vessels: any[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  getYachtName: (y: any) => string;
  getYachtBuilder: (y: any) => string;
  getYachtDesigner: (y: any) => string;
  getYachtLength: (y: any) => string | number;
  formatCurrency: (p: any) => string;
  getImageUrl: (p: string) => string;
  handleImageError: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const availableVessels = vessels.filter(
    (v) =>
      !selectedIds.includes(v.id) &&
      (getYachtName(v).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getYachtBuilder(v).toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vessel_id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedVessels = vessels.filter((v) => selectedIds.includes(v.id));

  const comparisonAttributes = [
    { label: "Length", value: (v: any) => `${getYachtLength(v)}m` },
    { label: "Beam", value: (v: any) => `${v.beam || "--"}m` },
    { label: "Year", value: (v: any) => v.year || "--" },
    { label: "Builder", value: (v: any) => getYachtBuilder(v) },
    { label: "Designer", value: (v: any) => getYachtDesigner(v) },
    { label: "Cabins", value: (v: any) => v.cabins || "0" },
    {
      label: "Passenger Capacity",
      value: (v: any) => (v.passenger_capacity ? `${v.passenger_capacity} People` : "--"),
    },
    { label: "Location", value: (v: any) => v.where || "--" },
    { label: "Price", value: (v: any) => formatCurrency(v.price) },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-[1px] bg-blue-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">
              Vessel Comparison
            </p>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-[#003566]">
            Compare selected yachts
          </h2>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={onClearSelection}
            className="px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Add vessels: search + dropdown */}
      <div className="bg-slate-50 border border-slate-200 p-6 mb-10">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
          Add yachts to compare
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by name, builder or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-600 transition-all"
          />
        </div>

        {searchTerm && (
          <div className="mt-2 bg-white border border-slate-200 divide-y divide-slate-100 max-h-60 overflow-y-auto shadow-lg">
            {availableVessels.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center">
                No matching vessels found
              </div>
            ) : (
              availableVessels.slice(0, 8).map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    onToggleSelect(v.id);
                    setSearchTerm("");
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-all text-left"
                >
                  <div>
                    <span className="text-sm font-bold text-[#003566]">
                      {getYachtName(v)}
                    </span>
                    <span className="ml-2 text-[10px] uppercase text-slate-500">
                      {getYachtBuilder(v)} • {v.year || "—"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#003566]">
                    {formatCurrency(v.price)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {selectedVessels.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
              Currently comparing ({selectedVessels.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedVessels.map((v) => (
                <div
                  key={v.id}
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 group"
                >
                  <span className="text-xs font-bold text-[#003566]">
                    {getYachtName(v)}
                  </span>
                  <button
                    onClick={() => onToggleSelect(v.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table – only if 2+ vessels */}
      {selectedVessels.length >= 2 ? (
        <div className="bg-white border border-slate-200 overflow-x-auto">
          {/* Simple Specifications heading – tabs removed */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#003566]">
              Specifications
            </h3>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="bg-white border-r border-b border-slate-200 w-1/5 p-4"></th>
                {selectedVessels.map((v) => (
                  <th
                    key={v.id}
                    className="bg-slate-50 border-b border-r border-slate-200 p-4 text-left align-bottom"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                        <img
                          src={getImageUrl(v.main_image)}
                          onError={handleImageError}
                          alt={getYachtName(v)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {getYachtBuilder(v)}
                        </p>
                        <p className="text-base font-serif italic text-[#003566] leading-tight">
                          {getYachtName(v)}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonAttributes.map((attr) => (
                <tr key={attr.label} className="even:bg-slate-50">
                  <td className="border-r border-b border-slate-200 p-4 font-bold text-[#003566]">
                    {attr.label}
                  </td>
                  {selectedVessels.map((v) => (
                    <td
                      key={v.id}
                      className="border-r border-b border-slate-200 p-4 text-slate-700"
                    >
                      {attr.value(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center py-8 bg-slate-50 border-t border-slate-200">
            <button className="px-10 py-4 bg-[#003566] text-white text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md flex items-center gap-2">
              Compare Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">
            {selectedIds.length === 0
              ? "Search and add at least two yachts to start comparing."
              : "Please add one more yacht to enable the comparison table."}
          </p>
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------
// Image error handler
// ------------------------------------------------------------
function handleImageError(e: SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.src = PLACEHOLDER_IMAGE;
  e.currentTarget.classList.add("opacity-50", "grayscale");
}