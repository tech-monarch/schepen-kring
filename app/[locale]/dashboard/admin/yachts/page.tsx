"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Plus,
  Loader2,
  Edit3,
  Trash,
  Calendar,
  MapPin,
  Maximize2,
  Search,
  Ship,
  Euro,
  Users,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
  MoreVertical,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

// Status badge configuration
const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  'For Sale': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'For Bid': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  'Sold': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  'Draft': { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
  'Active': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'Inactive': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  'Maintenance': { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
};

// Status options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'For Sale', label: 'For Sale' },
  { value: 'For Bid', label: 'For Bid' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Maintenance', label: 'Maintenance' },
];

export default function FleetManagementPage() {
  const router = useRouter();
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('boat_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [stats, setStats] = useState({
    total: 0,
    forSale: 0,
    forBid: 0,
    sold: 0,
    draft: 0,
  });

  // Fetch fleet
  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/yachts");
      setFleet(res.data);
      
      // Calculate stats
      const statsData = {
        total: res.data.length,
        forSale: res.data.filter((y: any) => y.status === 'For Sale').length,
        forBid: res.data.filter((y: any) => y.status === 'For Bid').length,
        sold: res.data.filter((y: any) => y.status === 'Sold').length,
        draft: res.data.filter((y: any) => y.status === 'Draft').length,
      };
      setStats(statsData);
    } catch (err) {
      console.error("API Sync Error", err);
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale");
  };

  const handleDelete = async (yacht: any) => {
    const confirmed = window.confirm(
      `CRITICAL ACTION: Are you sure you want to permanently remove "${yacht.boat_name}" from the registry?`,
    );
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/yachts/${yacht.id}`);
      fetchFleet();
      toast.success("Vessel successfully removed from manifest.");
    } catch (err: any) {
      console.error("Deletion failed:", err);
      if (err.response?.status === 403) {
        toast.error("Permission denied. You don't have access to delete vessels.");
      } else {
        toast.error("Error: Could not remove vessel.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (yacht: any) => {
    try {
      const newStatus = yacht.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/yachts/${yacht.id}`, { ...yacht, status: newStatus });
      fetchFleet();
      toast.success(`Vessel marked as ${newStatus}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update vessel status");
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    return `${STORAGE_URL}${imagePath}`;
  };

  // Filter and sort fleet
  const filteredAndSortedFleet = fleet
    .filter(yacht => {
      // Search filter
      const matchesSearch = yacht.boat_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          yacht.vessel_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          yacht.where?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = selectedStatus === 'all' || yacht.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sorting logic
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle numeric sorting for price, year, etc.
      if (sortBy === 'price' || sortBy === 'year') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle numeric sorting
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const formatCurrency = (amount: number | string | null) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return '€ --';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatLength = (loa: string | number | null) => {
    if (!loa) return '-- m';
    return `${loa} m`;
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig['Draft'];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif italic tracking-tight mb-2">
              Registry Command
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Fleet Management System v2.1
            </p>
          </div>
          <Button
            onClick={() => router.push("/nl/dashboard/admin/yachts/new")}
            className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-10 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Register New Vessel
          </Button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Total Fleet
                </p>
                <p className="text-2xl font-bold text-[#003566]">{stats.total}</p>
              </div>
              <BarChart3 className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  For Sale
                </p>
                <p className="text-2xl font-bold text-emerald-600">{stats.forSale}</p>
              </div>
              <Euro className="text-emerald-600" size={20} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  For Bid
                </p>
                <p className="text-2xl font-bold text-blue-600">{stats.forBid}</p>
              </div>
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Sold
                </p>
                <p className="text-2xl font-bold text-amber-600">{stats.sold}</p>
              </div>
              <CheckCircle className="text-amber-600" size={20} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Draft
                </p>
                <p className="text-2xl font-bold text-slate-500">{stats.draft}</p>
              </div>
              <AlertTriangle className="text-slate-500" size={20} />
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative group md:col-span-2">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="SEARCH BY VESSEL NAME, VESSEL ID, OR LOCATION..."
                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 text-[11px] font-black tracking-widest outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <select
                className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 text-[11px] font-black tracking-widest outline-none appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-200 p-4 text-[11px] font-black tracking-widest outline-none"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
              >
                <option value="boat_name-asc">Sort: Name (A-Z)</option>
                <option value="boat_name-desc">Sort: Name (Z-A)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="year-desc">Sort: Year (New to Old)</option>
                <option value="year-asc">Sort: Year (Old to New)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* FLEET GRID */}
      {loading ? (
        <div className="col-span-full py-20 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Synchronizing Database...
          </p>
        </div>
      ) : filteredAndSortedFleet.length === 0 ? (
        <div className="text-center py-20">
          <Ship className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2">
            No vessels found
          </p>
          <p className="text-[10px] text-slate-400 mb-6">
            {searchQuery || selectedStatus !== 'all' ? 'Try adjusting your search or filters' : 'No vessels in the registry yet'}
          </p>
          <Button
            onClick={() => router.push("/nl/dashboard/admin/yachts/new")}
            className="bg-[#003566] text-white hover:bg-blue-800 rounded-none px-8 font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="mr-2 w-4 h-4" />
            Register First Vessel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAndSortedFleet.map((yacht) => (
            <div
              key={yacht.id}
              className="bg-white border border-slate-200 group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300"
            >
              {/* IMAGE SECTION */}
              <div className="h-72 bg-slate-100 overflow-hidden relative">
                <img
                  src={getImageUrl(yacht.main_image)}
                  onError={handleImageError}
                  alt={yacht.boat_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* VESSEL ID BADGE */}
                <div className="absolute top-4 left-4 bg-black/80 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1">
                  {yacht.vessel_id || 'N/A'}
                </div>
                
                {/* ACTION OVERLAY */}
                <div className="absolute inset-0 bg-[#003566]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-3 p-6">
                  <button
                    onClick={() => router.push(`/nl/dashboard/admin/yachts/${yacht.id}`)}
                    className="bg-white text-[#003566] px-6 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all flex-1 max-w-[140px] flex items-center justify-center gap-2"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => toggleAvailability(yacht)}
                    className={`px-6 py-3 font-black uppercase text-[9px] tracking-widest transition-all flex-1 max-w-[140px] flex items-center justify-center gap-2 ${
                      yacht.status === 'Active' || yacht.status === 'For Sale'
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {yacht.status === 'Active' || yacht.status === 'For Sale' ? (
                      <>
                        <XCircle size={12} />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} />
                        Activate
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(yacht)}
                    disabled={isSubmitting}
                    className="bg-red-600 text-white px-6 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-red-700 transition-all flex-1 max-w-[140px] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <Trash size={12} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
              
              {/* DETAILS SECTION */}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-serif italic truncate pr-4 mb-1">
                      {yacht.boat_name || 'Unnamed Vessel'}
                    </h3>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(yacht.price)}
                    </p>
                  </div>
                  <span className={cn(
                    "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shrink-0",
                    getStatusConfig(yacht.status).color,
                    getStatusConfig(yacht.status).bg,
                    getStatusConfig(yacht.status).border
                  )}>
                    {yacht.status || 'Draft'}
                  </span>
                </div>
                
                {/* SPECIFICATIONS */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Specifications
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-600">
                        <Maximize2 size={12} className="text-blue-600" />
                        <span className="font-bold">{formatLength(yacht.loa)} LOA</span>
                      </div>
                      {yacht.beam && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Maximize2 size={12} className="text-blue-600 rotate-90" />
                          <span>{yacht.beam}m Beam</span>
                        </div>
                      )}
                      {yacht.year && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Calendar size={12} className="text-blue-600" />
                          <span>Built {yacht.year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Details
                    </p>
                    <div className="space-y-1">
                      {yacht.where && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <MapPin size={12} className="text-blue-600" />
                          <span className="truncate">{yacht.where}</span>
                        </div>
                      )}
                      {yacht.cabins && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Ship size={12} className="text-blue-600" />
                          <span>{yacht.cabins} Cabins</span>
                        </div>
                      )}
                      {yacht.passenger_capacity && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Users size={12} className="text-blue-600" />
                          <span>{yacht.passenger_capacity} Passengers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* FOOTER */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Last updated: {yacht.updated_at ? new Date(yacht.updated_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <button
                    onClick={() => router.push(`/nl/dashboard/admin/yachts/${yacht.id}`)}
                    className="text-[9px] font-black uppercase text-blue-600 tracking-widest hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    View Details
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* FOOTER STATS */}
      {!loading && filteredAndSortedFleet.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-6">
              <span>{filteredAndSortedFleet.length} vessels displayed</span>
              <span>•</span>
              <span>{fleet.length} total in registry</span>
            </div>
            <button
              onClick={fetchFleet}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
            >
              <Loader2 size={12} />
              Refresh Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}