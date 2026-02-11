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
  Grid3x3,
  List,
  Fuel,
  Gauge,
  Anchor,
  Bed,
  Bath,
  Wind,
  DollarSign,
  TrendingUp,
  Copy,
  Clock,
  Info,
  Clipboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

// Status badge configuration (extended)
const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  "For Sale": { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "For Sale" },
  "For Bid": { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", label: "For Bid" },
  Sold: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "Sold" },
  Draft: { color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200", label: "Draft" },
  Active: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "Active" },
  Inactive: { color: "text-red-600", bg: "bg-red-50", border: "border-red-100", label: "Inactive" },
  Maintenance: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", label: "Maintenance" },
};

// Status filter options
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
  { value: "loa-desc", label: "Length (Longest)" },
  { value: "loa-asc", label: "Length (Shortest)" },
  { value: "horse_power-desc", label: "HP (High to Low)" },
  { value: "hours-asc", label: "Hours (Low to High)" },
];

export default function PartnerFleetManagementPage() {
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
    totalValue: 0,
    avgPrice: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ------------------------------------------------------------------------
  // Fetch partner's fleet
  // ------------------------------------------------------------------------
  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-yachts");
      const yachts = res.data || [];
      setFleet(yachts);

      // 🔍 DEBUG: Log the first yacht and its keys
      if (yachts.length > 0) {
        console.log("🚤 First yacht (full object):", yachts[0]);
        console.log("🔑 Available keys:", Object.keys(yachts[0]));
        console.log("📛 boat_name value:", yachts[0].boat_name);
        console.log("📛 name value:", yachts[0].name);
      }

      // Calculate enhanced stats
      const forSale = yachts.filter((y: any) => y.status === "For Sale").length;
      const forBid = yachts.filter((y: any) => y.status === "For Bid").length;
      const sold = yachts.filter((y: any) => y.status === "Sold").length;
      const draft = yachts.filter((y: any) => y.status === "Draft" || !y.status).length;
      const active = yachts.filter((y: any) => y.status === "Active").length;
      const inactive = yachts.filter((y: any) => y.status === "Inactive").length;

      const totalValue = yachts.reduce((sum: number, y: any) => {
        const price = parseFloat(y.price) || 0;
        return sum + price;
      }, 0);

      const pricedYachts = yachts.filter((y: any) => y.price && !isNaN(parseFloat(y.price)));
      const avgPrice = pricedYachts.length > 0 ? totalValue / pricedYachts.length : 0;

      setStats({
        total: yachts.length,
        forSale,
        forBid,
        sold,
        draft,
        active,
        inactive,
        totalValue,
        avgPrice,
      });
    } catch (err: any) {
      console.error("API Sync Error", err);
      if (err.response?.status === 401) {
        toast.error("Please log in to view your fleet");
        router.push("/login");
      } else {
        toast.error("Failed to load your fleet data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // ------------------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------------------
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale");
  };

  const handleDelete = async (yacht: any) => {
    const yachtName = getYachtName(yacht);
    const confirmed = window.confirm(`Are you sure you want to permanently remove "${yachtName}" from your fleet?`);
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/yachts/${yacht.id}`);
      fetchFleet();
      toast.success("Vessel successfully removed from your fleet.");
    } catch (err: any) {
      console.error("Deletion failed:", err);
      toast.error("Error: Could not remove vessel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (yacht: any) => {
    try {
      toast.loading("Duplicating vessel...", { id: "duplicate" });

      // Omit id, vessel_id, timestamps – everything else can be copied
      const { id, vessel_id, created_at, updated_at, ...yachtData } = yacht;

      // Append " (Copy)" to the name
      const baseName = yachtData.boat_name || yachtData.name || "Vessel";
      yachtData.boat_name = `${baseName} (Copy)`;

      // Always set new copy as Draft
      yachtData.status = "Draft";

      const res = await api.post("/partner/yachts", yachtData);
      toast.success("Vessel duplicated successfully", { id: "duplicate" });
      fetchFleet();
    } catch (err: any) {
      console.error("Duplicate failed:", err);
      toast.error(err.response?.data?.message || "Failed to duplicate vessel", { id: "duplicate" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STORAGE_URL}${imagePath}`;
  };

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  // ------------------------------------------------------------------------
  // 🔥 ULTIMATE VESSEL NAME RESOLVER – tries every possible field
  // ------------------------------------------------------------------------
  const getYachtName = (yacht: any): string => {
    // All possible fields that might contain the name
    const candidates = [
      yacht.boat_name,
      yacht.name,
      yacht.title,
      yacht.vessel_name,
      yacht.display_name,
      yacht.vessel_id,
      yacht.id ? `Vessel #${yacht.id}` : null,
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === "string" && candidate.trim() !== "") {
        return candidate.trim();
      }
    }

    return "⚠️ Unnamed Vessel";
  };

  const getYachtStatus = (yacht: any): string => yacht.status || "Draft";
  const getStatusConfig = (status: string | null | undefined) =>
    statusConfig[status || "Draft"] || statusConfig.Draft;

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

  // ------------------------------------------------------------------------
  // Filtering & Sorting
  // ------------------------------------------------------------------------
  const filteredAndSortedFleet = fleet
    .filter((yacht) => {
      if (!yacht) return false;

      const boatName = safeString(getYachtName(yacht)).toLowerCase();
      const vesselId = safeString(yacht.vessel_id).toLowerCase();
      const location = safeString(yacht.where).toLowerCase();
      const builder = safeString(yacht.builder).toLowerCase();
      const model = safeString(yacht.model).toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        boatName.includes(query) ||
        vesselId.includes(query) ||
        location.includes(query) ||
        builder.includes(query) ||
        model.includes(query);

      const yachtStatus = yacht.status || "Draft";
      const matchesStatus = selectedStatus === "all" || yachtStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = "";
      let bValue: any = "";

      if (sortBy.includes(".")) {
        const keys = sortBy.split(".");
        aValue = keys.reduce((obj, key) => obj?.[key], a) || "";
        bValue = keys.reduce((obj, key) => obj?.[key], b) || "";
      } else {
        aValue = a[sortBy] || "";
        bValue = b[sortBy] || "";
      }

      // Numeric fields
      if (["price", "year", "loa", "beam", "draft", "horse_power", "hours"].includes(sortBy)) {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Date fields
      if (sortBy.includes("_at")) {
        const aDate = new Date(aValue || 0).getTime();
        const bDate = new Date(bValue || 0).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      // String fields
      const aStr = safeString(aValue);
      const bStr = safeString(bValue);
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as "asc" | "desc");
  };

  // ------------------------------------------------------------------------
  // UI Components
  // ------------------------------------------------------------------------
  const ViewToggle = () => (
    <div className="flex border border-slate-200 rounded-sm overflow-hidden">
      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
          viewMode === "grid" ? "bg-[#003566] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        <Grid3x3 size={14} />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-l border-slate-200",
          viewMode === "list" ? "bg-[#003566] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
        )}
      >
        <List size={14} />
      </button>
    </div>
  );

  // Tooltip – shows extra specs on hover
  const SpecTooltip = ({ yacht }: { yacht: any }) => {
    const specs = [];

    if (yacht.engine_manufacturer) specs.push(`Engine: ${yacht.engine_manufacturer} ${yacht.horse_power || ""}`);
    if (yacht.fuel) specs.push(`Fuel: ${yacht.fuel}`);
    if (yacht.cruising_speed) specs.push(`Cruise: ${yacht.cruising_speed} kn`);
    if (yacht.max_speed) specs.push(`Max: ${yacht.max_speed} kn`);
    if (yacht.cabins) specs.push(`Cabins: ${yacht.cabins}`);
    if (yacht.berths) specs.push(`Berths: ${yacht.berths}`);
    if (yacht.toilet) specs.push(`Toilets: ${yacht.toilet}`);
    if (yacht.shower) specs.push(`Showers: ${yacht.shower}`);
    if (yacht.passenger_capacity) specs.push(`Passengers: ${yacht.passenger_capacity}`);
    if (yacht.draft) specs.push(`Draft: ${yacht.draft} m`);
    if (yacht.air_draft) specs.push(`Air Draft: ${yacht.air_draft} m`);
    if (yacht.displacement) specs.push(`Displacement: ${yacht.displacement} kg`);
    if (yacht.ballast) specs.push(`Ballast: ${yacht.ballast}`);
    if (yacht.hull_type) specs.push(`Hull: ${yacht.hull_type}`);
    if (yacht.designer) specs.push(`Designer: ${yacht.designer}`);

    return specs.length > 0 ? (
      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-[9px] font-medium rounded shadow-xl z-50 hidden group-hover:block">
        {specs.map((spec, i) => (
          <div key={i} className="flex items-center gap-1.5 py-0.5">
            <Info size={10} className="text-blue-400" />
            <span>{spec}</span>
          </div>
        ))}
      </div>
    ) : null;
  };

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif italic tracking-tight mb-1">
              My Vessel Registry
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Partner Fleet Management
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
              onClick={() => router.push("/nl/dashboard/partner/yachts/new")}
              className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-12 px-8 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={14} />
              New Vessel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-8">
        {/* ENHANCED STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total</p>
                <p className="text-xl font-bold text-[#003566]">{stats.total}</p>
              </div>
              <BarChart3 className="text-blue-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">For Sale</p>
                <p className="text-xl font-bold text-emerald-600">{stats.forSale}</p>
              </div>
              <Euro className="text-emerald-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">For Bid</p>
                <p className="text-xl font-bold text-blue-600">{stats.forBid}</p>
              </div>
              <Users className="text-blue-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sold</p>
                <p className="text-xl font-bold text-amber-600">{stats.sold}</p>
              </div>
              <CheckCircle className="text-amber-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Draft</p>
                <p className="text-xl font-bold text-slate-500">{stats.draft}</p>
              </div>
              <AlertTriangle className="text-slate-500" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Fleet Value</p>
                <p className="text-base font-bold text-blue-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="text-blue-900" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Price</p>
                <p className="text-base font-bold text-blue-900">{formatCurrency(stats.avgPrice)}</p>
              </div>
              <TrendingUp className="text-blue-900" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Sync</p>
                <p className="text-[9px] font-bold text-slate-600">
                  {new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <Clock className="text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-6 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
            <div className="relative group lg:col-span-2">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="SEARCH BY NAME, ID, BUILDER, LOCATION..."
                className="w-full bg-slate-50 border border-slate-200 p-3 pl-12 text-[11px] font-black tracking-widest outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
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

        {/* LOADING STATE */}
        {loading && (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Loading Your Fleet...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredAndSortedFleet.length === 0 && (
          <div className="text-center py-20">
            <Ship className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2">
              No vessels in your fleet yet
            </p>
            <p className="text-[10px] text-slate-400 mb-6">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first vessel to your fleet"}
            </p>
            <Button
              onClick={() => router.push("/nl/dashboard/partner/yachts/new")}
              className="bg-[#003566] text-white hover:bg-blue-800 rounded-none px-8 font-black uppercase text-[10px] tracking-widest"
            >
              <Plus className="mr-2 w-4 h-4" />
              Add Your First Vessel
            </Button>
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && viewMode === "grid" && filteredAndSortedFleet.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedFleet.map((yacht) => (
              <div
                key={yacht.id}
                className="bg-white border border-slate-200 group overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 relative"
              >
                {/* IMAGE SECTION */}
                <div className="h-64 bg-slate-100 overflow-hidden relative">
                  <img
                    src={getImageUrl(yacht.main_image)}
                    onError={handleImageError}
                    alt={getYachtName(yacht)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {yacht.vessel_id && (
                    <div className="absolute top-3 left-3 bg-black/80 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1">
                      {yacht.vessel_id}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(yacht.vessel_id);
                        }}
                        className="ml-1 hover:text-blue-300"
                      >
                        <Clipboard size={10} />
                      </button>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span
                      className={cn(
                        "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                        getStatusConfig(yacht.status).color,
                        getStatusConfig(yacht.status).bg,
                        getStatusConfig(yacht.status).border
                      )}
                    >
                      {getYachtStatus(yacht)}
                    </span>
                  </div>

                  {/* ACTION OVERLAY */}
                  <div className="absolute inset-0 bg-[#003566]/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-6">
                    <button
                      onClick={() => router.push(`/nl/dashboard/partner/yachts/${yacht.id}/edit`)}
                      className="w-full max-w-[200px] bg-white text-[#003566] px-4 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 size={12} />
                      Edit Vessel
                    </button>

                    <button
                      onClick={() => router.push(`/nl/dashboard/partner/yachts/${yacht.id}`)}
                      className="w-full max-w-[200px] bg-blue-600 text-white px-4 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={12} />
                      View Details
                    </button>

                    <button
                      onClick={() => handleDuplicate(yacht)}
                      className="w-full max-w-[200px] bg-amber-600 text-white px-4 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={12} />
                      Duplicate
                    </button>

                    <button
                      onClick={() => handleDelete(yacht)}
                      disabled={isSubmitting}
                      className="w-full max-w-[200px] bg-red-600 text-white px-4 py-3 font-black uppercase text-[9px] tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={12} /> : <Trash size={12} />}
                      Delete Vessel
                    </button>
                  </div>
                </div>

                {/* DETAILS SECTION */}
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-serif italic mb-1 line-clamp-1">
                        {getYachtName(yacht).startsWith("⚠️") ? (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle size={14} />
                            {getYachtName(yacht)}
                          </span>
                        ) : (
                          getYachtName(yacht)
                        )}
                      </h3>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(yacht.price)}</p>
                      {yacht.min_bid_amount && (
                        <p className="text-[9px] text-slate-500 mt-1">
                          Min. Bid: {formatCurrency(yacht.min_bid_amount)}
                        </p>
                      )}
                    </div>
                    {yacht.passenger_capacity && (
                      <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <Users size={12} className="text-blue-600" />
                        <span className="text-[9px] font-bold text-slate-700">{yacht.passenger_capacity}</span>
                      </div>
                    )}
                  </div>

                  {/* SPEC ROW */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Dimensions</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-600">
                          <Maximize2 size={12} className="text-blue-600" />
                          <span>{formatLength(yacht.loa)} LOA</span>
                        </div>
                        {yacht.beam && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-600">
                            <Maximize2 size={12} className="text-blue-600 rotate-90" />
                            <span>{yacht.beam}m Beam</span>
                          </div>
                        )}
                        {yacht.draft && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-600">
                            <Anchor size={12} className="text-blue-600" />
                            <span>Draft {yacht.draft}m</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Performance</p>
                      <div className="space-y-1">
                        {yacht.engine_manufacturer && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-600">
                            <Fuel size={12} className="text-blue-600" />
                            <span className="truncate">{yacht.engine_manufacturer}</span>
                          </div>
                        )}
                        {yacht.horse_power && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-600">
                            <Gauge size={12} className="text-blue-600" />
                            <span>{yacht.horse_power} HP</span>
                          </div>
                        )}
                        {yacht.hours && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-600">
                            <Clock size={12} className="text-blue-600" />
                            <span>{yacht.hours} hrs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACCOMMODATION QUICK VIEW */}
                  {(yacht.cabins || yacht.berths || yacht.toilet) && (
                    <div className="flex items-center gap-3 text-[9px] text-slate-600 border-t border-slate-100 pt-2">
                      {yacht.cabins && (
                        <div className="flex items-center gap-1">
                          <Bed size={12} className="text-blue-600" />
                          <span>{yacht.cabins} Cabins</span>
                        </div>
                      )}
                      {yacht.berths && (
                        <div className="flex items-center gap-1">
                          <Bed size={12} className="text-blue-600" />
                          <span>{yacht.berths} Berths</span>
                        </div>
                      )}
                      {yacht.toilet && (
                        <div className="flex items-center gap-1">
                          <Bath size={12} className="text-blue-600" />
                          <span>{yacht.toilet} Toilet</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="pt-2 border-t border-slate-100 mt-auto flex justify-between items-center relative group">
                    <button
                      onClick={() => router.push(`/nl/dashboard/partner/yachts/${yacht.id}`)}
                      className="text-[9px] font-black uppercase text-blue-600 tracking-widest hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      Manage Vessel
                      <ChevronRight size={12} />
                    </button>

                    {/* Tooltip for extra specs */}
                    <SpecTooltip yacht={yacht} />

                    {yacht.updated_at && (
                      <span className="text-[7px] text-slate-400">
                        Updated {new Date(yacht.updated_at).toLocaleDateString("nl-NL")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {!loading && viewMode === "list" && filteredAndSortedFleet.length > 0 && (
          <div className="bg-white border border-slate-200">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="col-span-3">Vessel</div>
              <div className="col-span-2">Price / Bid</div>
              <div className="col-span-3">Specifications</div>
              <div className="col-span-2">Status / Location</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredAndSortedFleet.map((yacht) => (
              <div
                key={yacht.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center relative group"
              >
                {/* Vessel */}
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
                    <p className="font-medium text-[#003566] flex items-center gap-1">
                      {getYachtName(yacht).startsWith("⚠️") ? (
                        <span className="text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {getYachtName(yacht)}
                        </span>
                      ) : (
                        getYachtName(yacht)
                      )}
                    </p>
                    {yacht.vessel_id && (
                      <p className="text-[9px] text-slate-500 font-medium flex items-center gap-1">
                        ID: {yacht.vessel_id}
                        <button
                          onClick={() => copyToClipboard(yacht.vessel_id)}
                          className="hover:text-blue-600"
                        >
                          <Clipboard size={10} />
                        </button>
                      </p>
                    )}
                    {yacht.builder && <p className="text-[9px] text-slate-500">{yacht.builder}</p>}
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <p className="font-bold text-blue-900">{formatCurrency(yacht.price)}</p>
                  {yacht.min_bid_amount && (
                    <p className="text-[8px] text-slate-500">Min bid: {formatCurrency(yacht.min_bid_amount)}</p>
                  )}
                </div>

                {/* Specifications */}
                <div className="col-span-3">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Maximize2 size={11} className="text-blue-600" />
                        <span>{formatLength(yacht.loa)} LOA</span>
                      </div>
                      {yacht.beam && (
                        <div className="flex items-center gap-1.5">
                          <Maximize2 size={11} className="text-blue-600 rotate-90" />
                          <span>{yacht.beam}m Beam</span>
                        </div>
                      )}
                      {yacht.year && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-blue-600" />
                          <span>{yacht.year}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {yacht.engine_manufacturer && (
                        <div className="flex items-center gap-1.5">
                          <Fuel size={11} className="text-blue-600" />
                          <span className="truncate">{yacht.engine_manufacturer}</span>
                        </div>
                      )}
                      {yacht.horse_power && (
                        <div className="flex items-center gap-1.5">
                          <Gauge size={11} className="text-blue-600" />
                          <span>{yacht.horse_power} HP</span>
                        </div>
                      )}
                      {yacht.cabins && (
                        <div className="flex items-center gap-1.5">
                          <Bed size={11} className="text-blue-600" />
                          <span>{yacht.cabins} Cabins</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Location */}
                <div className="col-span-2">
                  <div className="space-y-1.5">
                    <span
                      className={cn(
                        "inline-flex text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                        getStatusConfig(yacht.status).color,
                        getStatusConfig(yacht.status).bg,
                        getStatusConfig(yacht.status).border
                      )}
                    >
                      {getYachtStatus(yacht)}
                    </span>
                    {yacht.where && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                        <MapPin size={11} className="text-blue-600" />
                        <span className="truncate">{yacht.where}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => router.push(`/nl/dashboard/partner/yachts/${yacht.id}/edit`)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => router.push(`/nl/dashboard/partner/yachts/${yacht.id}`)}
                    className="p-2 text-emerald-600 hover:text-emerald-800 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(yacht)}
                    className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={16} />
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

                {/* Tooltip for extra specs in list view */}
                <div className="absolute left-0 -bottom-2 translate-y-full hidden group-hover:block z-50">
                  <div className="bg-slate-900 text-white text-[9px] p-2 rounded shadow-lg max-w-xs">
                    {yacht.air_draft && <span>Air Draft: {yacht.air_draft}m • </span>}
                    {yacht.displacement && <span>Disp: {yacht.displacement}kg • </span>}
                    {yacht.ballast && <span>Ballast: {yacht.ballast} • </span>}
                    {yacht.passenger_capacity && <span>Pass: {yacht.passenger_capacity} • </span>}
                    {yacht.fuel && <span>Fuel: {yacht.fuel} • </span>}
                    {yacht.cruising_speed && <span>Cruise: {yacht.cruising_speed}kn</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        {!loading && filteredAndSortedFleet.length > 0 && (
          <div className="pt-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="text-blue-600">{filteredAndSortedFleet.length}</span> of{" "}
                <span>{fleet.length}</span> vessels displayed
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
    </div>
  );
}