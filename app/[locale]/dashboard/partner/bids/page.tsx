"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Loader2, 
  Gavel, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/Sidebar";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

export default function PartnerBiddingsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch all biddings for the partner's fleet
  const fetchBiddings = async () => {
    try {
      setLoading(true);
      // Using the index endpoint that returns biddings with yacht/user relations 
      const res = await api.get("/bids");
      setBids(res.data.data || res.data || []);
    } catch (err: any) {
      console.error("Failed to load biddings:", err);
      toast.error("Failed to load bidding data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiddings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'won': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'outbid': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-right" />
      <Sidebar onCollapse={setIsSidebarCollapsed} />

      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6 lg:px-12 flex justify-between items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif italic tracking-tight mb-1">
                Bidding Management
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Partner Offer Overview
              </p>
            </div>
            <Button
              onClick={fetchBiddings}
              variant="outline"
              className="rounded-none h-12 px-6 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 lg:p-12">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Biddings...</p>
            </div>
          ) : bids.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200">
              <Gavel className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-[12px] font-black uppercase tracking-widest text-slate-400">No active bids found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bids.map((bid) => (
                <div key={bid.id} className="bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Yacht Image */}
                    <div className="w-24 h-24 bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      <img 
                        src={bid.yacht?.main_image ? `${STORAGE_URL}${bid.yacht.main_image}` : PLACEHOLDER_IMAGE} 
                        alt="Boat"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Vessel Info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5">
                          ID: {bid.yacht?.vessel_id || bid.yacht_id}
                        </span>
                        <div className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border", getStatusStyle(bid.status))}>
                          {bid.status}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#003566] mb-1">
                        {bid.yacht?.boat_name || "Unknown Vessel"}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(bid.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight size={12} />
                          Bid by: {bid.user?.name || "Guest"}
                        </div>
                      </div>
                    </div>

                    {/* Financials & Actions */}
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offer Amount</div>
                      <div className="text-2xl font-black text-[#003566]">{formatCurrency(bid.amount)}</div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/nl/dashboard/partner/yachts/${bid.yacht_id}`)}
                          className="h-8 text-[9px] font-black uppercase tracking-tighter"
                        >
                          View Yacht <ExternalLink size={12} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}