"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Anchor, Calendar, Ruler, Box, Droplets, 
  Fuel, Gavel, CheckCircle2, MapPin, Share2, Loader2, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// Matches your backend STORAGE_URL configuration
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

interface YachtImage {
  id: number;
  url: string;
  category: string;
}

interface Yacht {
  id: number;
  vessel_id: string;
  name: string;
  price: number;
  current_bid: number | null;
  status: "For Sale" | "For Bid" | "Sold" | "Draft";
  year: number;
  length: string;
  make: string;
  model: string;
  location: string;
  description: string;
  main_image: string;
  images: YachtImage[];
  // Technical Specs from your Backend Model
  beam: string;
  draft: string;
  engine_type: string;
  fuel_type: string;
  cabins: number;
  heads: number;
  hull_material?: string;
}

export default function YachtDetailsPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYachtDetails = async () => {
      try {
        // Fetches full relationship with 'images' as defined in YachtController@show 
        const { data } = await api.get(`/yachts/${id}`);
        setYacht(data);
        setActiveImage(data.main_image ? `${STORAGE_URL}${data.main_image}` : "");
      } catch (error) {
        console.error("Manifest Retrieval Failed:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchYachtDetails();
  }, [id]);

  if (loading || !yacht) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#003566]" size={40} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Vessel Specifications...</p>
      </div>
    );
  }

  // Determine Display Price (Current Bid takes precedence if in auction) 
  const displayPrice = yacht.status === 'For Bid' && yacht.current_bid 
    ? yacht.current_bid 
    : yacht.price;

  return (
    <div className="min-h-screen bg-white text-[#003566] selection:bg-blue-100">
      
      {/* 1. NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 md:px-12 justify-between">
        <Link href="/fleet" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003566] transition-colors">
          <ArrowLeft size={14} /> Back to Fleet
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 hidden md:block">
            REF: {yacht.vessel_id} [cite: 163]
          </span>
          <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-400">
            <Share2 size={16} />
          </button>
        </div>
      </header>

      <main className="pt-20">
        {/* 2. SPLIT HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
          
          {/* LEFT: IMMERSIVE IMAGE GALLERY */}
          <div className="bg-slate-50 relative h-[50vh] lg:h-auto overflow-hidden group">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0.8, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              src={activeImage} 
              alt={yacht.name}
              className="w-full h-full object-cover"
            />
            
            {/* Thumbnail Strip */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {/* Main Image Thumbnail */}
              <button 
                onClick={() => setActiveImage(`${STORAGE_URL}${yacht.main_image}`)}
                className={cn(
                  "w-20 h-20 shrink-0 border-2 transition-all",
                  activeImage.includes(yacht.main_image) ? "border-[#003566]" : "border-white/50 hover:border-white"
                )}
              >
                <img src={`${STORAGE_URL}${yacht.main_image}`} className="w-full h-full object-cover" alt="Main" />
              </button>

              {/* Gallery Thumbnails from Backend Relation [cite: 152] */}
              {yacht.images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(`${STORAGE_URL}${img.url}`)} // Matches YachtImage model [cite: 231]
                  className={cn(
                    "w-20 h-20 shrink-0 border-2 transition-all",
                    activeImage.includes(img.url) ? "border-[#003566]" : "border-white/50 hover:border-white"
                  )}
                >
                  <img src={`${STORAGE_URL}${img.url}`} className="w-full h-full object-cover" alt={img.category} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: DETAILS & ACTIONS */}
          <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-white relative">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className={cn(
                  "px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                  yacht.status === 'For Bid' ? "bg-blue-600 text-white" : "bg-slate-100 text-[#003566]"
                )}>
                  {yacht.status === 'For Bid' ? "Active Auction" : "Direct Sale"} 
                </span>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={12} /> {yacht.location} 
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-serif text-[#003566] mb-2 leading-[0.9]">
                {yacht.name}
              </h1>
              <p className="text-xl md:text-2xl font-light italic text-slate-400 mb-8">
                {yacht.year} {yacht.make} {yacht.model}
              </p>

              <div className="border-t border-b border-slate-100 py-8 mb-10 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {yacht.status === 'For Bid' ? "Current High Bid" : "Listing Valuation"}
                  </span>
                  <span className="text-4xl font-serif text-[#003566]">
                    €{new Intl.NumberFormat().format(displayPrice)}
                  </span>
                </div>
                {yacht.status === 'For Bid' && (
                  <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest flex items-center justify-end gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    Bidding Open - Ends in 48h
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                {yacht.status === 'For Bid' ? (
                  <Link href={`/bids/${yacht.id}`} className="flex-1">
                    <button className="w-full py-5 bg-[#003566] text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10">
                      <Gavel size={16} /> Enter Auction Room
                    </button>
                  </Link>
                ) : (
                  <button className="flex-1 py-5 bg-[#003566] text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-900 transition-all">
                    Inquire to Purchase
                  </button>
                )}
                <button className="px-6 border border-slate-200 text-[#003566] hover:bg-slate-50 transition-colors">
                  <Anchor size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TECHNICAL SPECIFICATIONS GRID */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 border-t border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Description Text */}
            <div className="lg:col-span-4">
              <h3 className="text-2xl font-serif italic text-[#003566] mb-6">Captain's Note</h3>
              <div className="prose prose-sm prose-slate font-light leading-relaxed text-slate-500">
                <p>{yacht.description || "No description provided for this vessel."} </p>
              </div>
            </div>

            {/* Specs Matrix - Populated from YachtController */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                
                <SpecItem label="Length Overall" value={`${yacht.length}m`} icon={<Ruler size={16}/>} />
                <SpecItem label="Draft" value={`${yacht.draft}m`} icon={<Anchor size={16}/>} />
                <SpecItem label="Beam" value={`${yacht.beam}m`} icon={<Box size={16}/>} />
                <SpecItem label="Year Built" value={yacht.year.toString()} icon={<Calendar size={16}/>} />
                
                <SpecItem label="Cabins" value={yacht.cabins.toString()} icon={<CheckCircle2 size={16}/>} />
                <SpecItem label="Fresh Water" value={`${yacht.water_capacity}L`} icon={<Droplets size={16}/>} />
                <SpecItem label="Fuel Capacity" value={`${yacht.fuel_capacity}L`} icon={<Fuel size={16}/>} />
                <SpecItem label="Engine Type" value={yacht.engine_type} icon={<SettingsIcon size={16}/>} />

              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

// Reusable Spec Component for clean layout
function SpecItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-3 group">
      <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-lg font-serif italic text-[#003566] border-b border-slate-100 pb-2 group-hover:border-blue-200 transition-all">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function SettingsIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}