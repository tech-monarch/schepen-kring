"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useRouter } from "next/navigation"; // Added for routing
import { api } from "@/lib/api";
import {
  Plus,
  Loader2,
  Edit3,
  Trash,
  Calendar,
  MapPin,
  Maximize2,
  Search
} from "lucide-react"; //
import { Button } from "@/components/ui/button"; //
import { toast, Toaster } from "react-hot-toast"; //
import { cn } from "@/lib/utils"; //

const STORAGE_URL = "https://kring.answer24.nl/storage/"; //
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80"; //

export default function FleetManagementPage() {
  const router = useRouter();
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); //
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch fleet
  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/yachts"); //
      setFleet(res.data);
    } catch (err) {
      console.error("API Sync Error", err);
    } finally {
      setLoading(false); //
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []); //

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale"); //
  };

  const handleDelete = async (yacht: any) => {
    const confirmed = window.confirm(
      `CRITICAL ACTION: Are you sure you want to permanently remove "${yacht.name}" from the registry?`
    ); //
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/yachts/${yacht.id}`); //
      fetchFleet();
      toast.success("Vessel successfully removed from manifest.");
    } catch (err) {
      console.error("Deletion failed:", err);
      toast.error("Error: Could not remove vessel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 text-[#003566] -mt-20">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight">
            Registry Command
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
            Fleet Management System v2.1
          </p>
        </div>
        <Button
          onClick={() => router.push('/nl/dashboard/admin/yachts/new')} // ROUTE TO NEW PAGE
          className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-10 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg"
        >
          <Plus className="mr-2 w-5 h-5" /> 
          Register New Vessel
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-10 group">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="SEARCH MANIFEST BY VESSEL NAME..."
          className="w-full bg-white border border-slate-200 p-6 pl-16 text-[11px] font-black tracking-widest outline-none shadow-sm focus:ring-1 focus:ring-blue-600 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Database...</p>
          </div>
        ) : (
          fleet
            .filter((y) => y.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((yacht) => (
              <div
                key={yacht.id}
                className="bg-white border border-slate-200 group overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500"
              >
                <div className="h-72 bg-slate-100 overflow-hidden relative">
                  <img
                    src={yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : PLACEHOLDER_IMAGE}
                    onError={handleImageError}
                    alt={yacht.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#003566]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] gap-2">
                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => router.push(`/nl/dashboard/admin/yachts/${yacht.id}`)} // ROUTE TO EDIT PAGE
                      className="bg-white text-[#003566] p-4 rounded-none font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center gap-2"
                    >
                      <Edit3 size={14} /> Edit Manifest
                    </button>
                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => handleDelete(yacht)}
                      disabled={isSubmitting}
                      className="bg-red-600 text-white p-4 rounded-none font-black uppercase text-[10px] tracking-widest hover:bg-red-800 transition-all shadow-xl flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : <Trash size={14} />} 
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-serif italic truncate pr-4">{yacht.name}</h3>
                      <span className={cn(
                          "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                          yacht.status === 'For Sale' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          yacht.status === 'For Bid' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {yacht.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-900 tracking-tighter">
                      {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(Number(yacht.price))}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase text-slate-400">
                    <div className="flex items-center gap-1">
                      <Maximize2 size={12} className="text-blue-600" /> {yacht.length}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-blue-600" /> {yacht.year}
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin size={12} className="text-blue-600" /> {yacht.location || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}