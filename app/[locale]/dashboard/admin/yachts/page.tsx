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
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
  BarChart3,
  RefreshCw,
  Eye,
  Settings,
  MoreHorizontal,
  Grid3x3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

// Status badge configuration
const statusConfig: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  "For Sale": {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "For Sale",
  },
  "For Bid": {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    label: "For Bid",
  },
  Sold: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "Sold",
  },
  Draft: {
    color: "text-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-200",
    label: "Draft",
  },
  Active: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Active",
  },
  Inactive: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    label: "Inactive",
  },
  Maintenance: {
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    label: "Maintenance",
  },
};

// Status options
const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "For Sale", label: "For Sale" },
  { value: "For Bid", label: "For Bid" },
  { value: "Sold", label: "Sold" },
  { value: "Draft", label: "Draft" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Maintenance", label: "Maintenance" },
];

// Sort options
const sortOptions = [
  { value: "boat_name-asc", label: "Name (A-Z)" },
  { value: "boat_name-desc", label: "Name (Z-A)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "year-desc", label: "Year (New to Old)" },
  { value: "year-asc", label: "Year (Old to New)" },
  { value: "created_at-desc", label: "Recently Added" },
  { value: "updated_at-desc", label: "Recently Updated" },
];

export default function FleetManagementPage() {
  const router = useRouter();
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("boat_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stats, setStats] = useState({
    total: 0,
    forSale: 0,
    forBid: 0,
    sold: 0,
    draft: 0,
    active: 0,
    inactive: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch fleet
  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/yachts");
      setFleet(res.data || []);

      // Calculate stats
      const statsData = {
        total: res.data.length,
        forSale: res.data.filter((y: any) => y.status === "For Sale").length,
        forBid: res.data.filter((y: any) => y.status === "For Bid").length,
        sold: res.data.filter((y: any) => y.status === "Sold").length,
        draft: res.data.filter((y: any) => y.status === "Draft" || !y.status)
          .length,
        active: res.data.filter((y: any) => y.status === "Active").length,
        inactive: res.data.filter((y: any) => y.status === "Inactive").length,
      };
      setStats(statsData);
    } catch (err: any) {
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
    const yachtName = yacht.boat_name || yacht.name || "Unnamed Vessel";
    const confirmed = window.confirm(
      `CRITICAL ACTION: Are you sure you want to permanently remove "${yachtName}" from the registry?`,
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
        toast.error(
          "Permission denied. You don't have access to delete vessels.",
        );
      } else {
        toast.error("Error: Could not remove vessel.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (yacht: any) => {
    try {
      const newStatus = yacht.status === "Active" ? "Inactive" : "Active";
      await api.put(`/yachts/${yacht.id}`, { ...yacht, status: newStatus });
      fetchFleet();
      toast.success(`Vessel marked as ${newStatus}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update vessel status");
    }
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STORAGE_URL}${imagePath}`;
  };

  // Safe string access with null checks
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  // Filter and sort fleet
  const filteredAndSortedFleet = fleet
    .filter((yacht) => {
      if (!yacht) return false;

      // Search filter - safe with null checks
      const boatName = safeString(yacht.boat_name).toLowerCase();
      const vesselId = safeString(yacht.vessel_id).toLowerCase();
      const location = safeString(yacht.where).toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        boatName.includes(query) ||
        vesselId.includes(query) ||
        location.includes(query);

      // Status filter
      const yachtStatus = yacht.status || "Draft";
      const matchesStatus =
        selectedStatus === "all" || yachtStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sorting logic with null checks
      let aValue: any = "";
      let bValue: any = "";

      if (sortBy.includes(".")) {
        // Handle nested properties if needed
        const keys = sortBy.split(".");
        aValue = keys.reduce((obj, key) => obj?.[key], a) || "";
        bValue = keys.reduce((obj, key) => obj?.[key], b) || "";
      } else {
        aValue = a[sortBy] || "";
        bValue = b[sortBy] || "";
      }

      // Handle numeric sorting for price, year, etc.
      if (sortBy === "price" || sortBy === "year") {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Handle date sorting
      if (sortBy.includes("_at")) {
        const aDate = new Date(aValue || 0).getTime();
        const bDate = new Date(bValue || 0).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle string sorting
      const aStr = safeString(aValue);
      const bStr = safeString(bValue);

      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === "") return "€ --";
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return "€ --";
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatLength = (loa: string | number | null | undefined) => {
    if (loa === null || loa === undefined || loa === "") return "-- m";
    return `${loa} m`;
  };

  const getStatusConfig = (status: string | null | undefined) => {
    const safeStatus = status || "Draft";
    return statusConfig[safeStatus] || statusConfig["Draft"];
  };

  const getYachtName = (yacht: any): string => {
    return yacht.boat_name || yacht.name || "Unnamed Vessel";
  };

  const getYachtStatus = (yacht: any): string => {
    return yacht.status || "Draft";
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as "asc" | "desc");
  };

  // View toggle buttons
  const ViewToggle = () => (
    <div className="flex border border-slate-200 rounded-sm overflow-hidden">
      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
          viewMode === "grid"
            ? "bg-[#003566] text-white"
            : "bg-white text-slate-600 hover:bg-slate-50",
        )}
      >
        <Grid3x3 size={14} />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-l border-slate-200",
          viewMode === "list"
            ? "bg-[#003566] text-white"
            : "bg-white text-slate-600 hover:bg-slate-50",
        )}
      >
        <List size={14} />
      </button>
    </div>
  );

  // Simple slugify function
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')      // spaces to hyphens
    .replace(/--+/g, '-')      // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');  // trim hyphens
};

const getPublicUrl = (yacht: any): string => {
  const slug = yacht.slug || slugify(yacht.boat_name || 'yacht');
  return `/nl/yachts/${yacht.id}/${slug}`;
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 -top-20">
      // <Toaster position="top-right" />
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
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchFleet}
              className="bg-white text-[#003566] border border-slate-200 hover:bg-slate-50 rounded-none h-12 px-6 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button
              onClick={() => router.push("/nl/dashboard/admin/yachts/new")}
              className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-12 px-8 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={14} />
              New Vessel
            </Button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-8">
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Total
                </p>
                <p className="text-xl font-bold text-[#003566]">
                  {stats.total}
                </p>
              </div>
              <BarChart3 className="text-blue-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  For Sale
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  {stats.forSale}
                </p>
              </div>
              <Euro className="text-emerald-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  For Bid
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {stats.forBid}
                </p>
              </div>
              <Users className="text-blue-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Sold
                </p>
                <p className="text-xl font-bold text-amber-600">{stats.sold}</p>
              </div>
              <CheckCircle className="text-amber-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Draft
                </p>
                <p className="text-xl font-bold text-slate-500">
                  {stats.draft}
                </p>
              </div>
              <AlertTriangle className="text-slate-500" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Active
                </p>
                <p className="text-xl font-bold text-emerald-600">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="text-emerald-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Inactive
                </p>
                <p className="text-xl font-bold text-red-600">
                  {stats.inactive}
                </p>
              </div>
              <XCircle className="text-red-600" size={18} />
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
            <div className="relative group lg:col-span-2">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="SEARCH BY NAME, ID, OR LOCATION..."
                className="w-full bg-slate-50 border border-slate-200 p-3 pl-12 text-[11px] font-black tracking-widest outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <select
                className="w-full bg-slate-50 border border-slate-200 p-3 pl-12 text-[11px] font-black tracking-widest outline-none appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-black tracking-widest outline-none"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <ViewToggle />
            </div>
          </div>
        </div>
      </div>
      {/* LOADING STATE */}
      {loading && (
        <div className="col-span-full py-20 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Loading Fleet Data...
          </p>
        </div>
      )}
      {/* EMPTY STATE */}
      {!loading && filteredAndSortedFleet.length === 0 && (
        <div className="text-center py-20">
          <Ship className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2">
            No vessels found
          </p>
          <p className="text-[10px] text-slate-400 mb-6">
            {searchQuery || selectedStatus !== "all"
              ? "Try adjusting your search or filters"
              : "No vessels in the registry yet"}
          </p>
          <Button
            onClick={() => router.push("/nl/dashboard/admin/yachts/new")}
            className="bg-[#003566] text-white hover:bg-blue-800 rounded-none px-8 font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="mr-2 w-4 h-4" />
            Register First Vessel
          </Button>
        </div>
      )}
      {/* GRID VIEW */}
      {!loading && viewMode === "grid" && filteredAndSortedFleet.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedFleet.map((yacht) => (
            <div
              key={yacht.id}
              className="bg-white border border-slate-200 group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300"
            >
              {/* IMAGE SECTION */}
              <div className="h-64 bg-slate-100 overflow-hidden relative">
                <img
                  src={getImageUrl(yacht.main_image)}
                  onError={handleImageError}
                  alt={getYachtName(yacht)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* VESSEL ID BADGE */}
                {yacht.vessel_id && (
                  <div className="absolute top-3 left-3 bg-black/80 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1">
                    {yacht.vessel_id}
                  </div>
                )}

                {/* STATUS BADGE */}
                <div className="absolute top-3 right-3">
                  <span
                    className={cn(
                      "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                      getStatusConfig(yacht.status).color,
                      getStatusConfig(yacht.status).bg,
                      getStatusConfig(yacht.status).border,
                    )}
                  >
                    {getYachtStatus(yacht)}
                  </span>
                </div>

                {/* ACTION OVERLAY */}
                <div className="absolute inset-0 bg-[#003566]/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-6">
                  <button
                    onClick={() =>
                      router.push(`/nl/dashboard/admin/yachts/${yacht.id}`)
                    }
                    className="w-full max-w-[200px] bg-white text-[#003566] px-4 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 size={12} />
                    Edit Manifest
                  </button>

                  <button
                    onClick={() => window.open(getPublicUrl(yacht), '_blank')}
                    className="w-full max-w-[200px] bg-blue-600 text-white px-4 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={12} />
                    View Details
                  </button>

                  <button
                    onClick={() => handleDelete(yacht)}
                    disabled={isSubmitting}
                    className="w-full max-w-[200px] bg-red-600 text-white px-4 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <Trash size={12} />
                    )}
                    Delete Vessel
                  </button>
                </div>
              </div>

              {/* DETAILS SECTION */}
              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div>
                  <h3 className="text-lg font-serif italic mb-1 line-clamp-1">
                    {getYachtName(yacht)}
                  </h3>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(yacht.price)}
                  </p>
                </div>

                {/* SPECIFICATIONS */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Dimensions
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-600">
                        <Maximize2 size={12} className="text-blue-600" />
                        <span className="font-medium">
                          {formatLength(yacht.loa)} LOA
                        </span>
                      </div>
                      {yacht.beam && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Maximize2
                            size={12}
                            className="text-blue-600 rotate-90"
                          />
                          <span>{yacht.beam}m Beam</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Details
                    </p>
                    <div className="space-y-1">
                      {yacht.year && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Calendar size={12} className="text-blue-600" />
                          <span>{yacht.year}</span>
                        </div>
                      )}
                      {yacht.where && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-600 line-clamp-1">
                          <MapPin size={12} className="text-blue-600" />
                          <span>{yacht.where}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button
                    onClick={() =>
                      router.push(`/nl/dashboard/admin/yachts/${yacht.id}`)
                    }
                    className="w-full text-[9px] font-black uppercase text-blue-600 tracking-widest hover:text-blue-800 transition-colors flex items-center justify-center gap-1"
                  >
                    Manage Vessel
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* LIST VIEW */}
      {!loading && viewMode === "list" && filteredAndSortedFleet.length > 0 && (
        <div className="bg-white border border-slate-200">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div className="col-span-3">Vessel</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Specifications</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Year</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* TABLE ROWS */}
          {filteredAndSortedFleet.map((yacht) => (
            <div
              key={yacht.id}
              className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              {/* VESSEL */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-16 h-12 bg-slate-100 overflow-hidden flex-shrink-0">
                  <img
                    src={getImageUrl(yacht.main_image)}
                    onError={handleImageError}
                    alt={getYachtName(yacht)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-[#003566]">
                    {getYachtName(yacht)}
                  </p>
                  {yacht.vessel_id && (
                    <p className="text-[9px] text-slate-500 font-medium">
                      ID: {yacht.vessel_id}
                    </p>
                  )}
                </div>
              </div>

              {/* PRICE */}
              <div className="col-span-2 flex items-center">
                <p className="font-bold text-blue-900">
                  {formatCurrency(yacht.price)}
                </p>
              </div>

              {/* SPECIFICATIONS */}
              <div className="col-span-2 flex items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Maximize2 size={12} className="text-blue-600" />
                    <span>{formatLength(yacht.loa)}</span>
                  </div>
                  {yacht.where && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <MapPin size={12} className="text-blue-600" />
                      <span className="truncate">{yacht.where}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* STATUS */}
              <div className="col-span-2 flex items-center">
                <span
                  className={cn(
                    "inline-flex text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                    getStatusConfig(yacht.status).color,
                    getStatusConfig(yacht.status).bg,
                    getStatusConfig(yacht.status).border,
                  )}
                >
                  {getYachtStatus(yacht)}
                </span>
              </div>

              {/* YEAR */}
              <div className="col-span-1 flex items-center">
                <span className="text-[11px] font-medium text-slate-600">
                  {yacht.year || "--"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={() =>
                    router.push(`/nl/dashboard/admin/yachts/${yacht.id}`)
                  }
                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() =>
                    router.push(`/nl/dashboard/admin/yachts/${yacht.id}`)
                  }
                  className="p-2 text-emerald-600 hover:text-emerald-800 transition-colors"
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDelete(yacht)}
                  disabled={isSubmitting}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  title="Delete"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* FOOTER */}
      {!loading && filteredAndSortedFleet.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="text-blue-600">
                {filteredAndSortedFleet.length}
              </span>{" "}
              of <span>{fleet.length}</span> vessels displayed
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={fetchFleet}
                variant="outline"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest"
              >
                <RefreshCw size={12} className="mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                variant="outline"
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest"
              >
                Back to Top
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
