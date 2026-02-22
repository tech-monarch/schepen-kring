"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Loader2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  ChevronRight,
  Calendar,
  User,
  Ship,
  AlertTriangle,
  Euro,
  BarChart3,
  Copy,
  Check,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/Sidebar";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

// Bid status configuration
const bidStatusConfig: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  active: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    label: "Active",
  },
  outbid: {
    color: "text-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-200",
    label: "Outbid",
  },
  won: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Won",
  },
  cancelled: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    label: "Cancelled",
  },
};

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "outbid", label: "Outbid" },
  { value: "won", label: "Won" },
  { value: "cancelled", label: "Cancelled" },
];

const sortOptions = [
  { value: "created_at-desc", label: "Newest First" },
  { value: "created_at-asc", label: "Oldest First" },
  { value: "amount-desc", label: "Amount (High to Low)" },
  { value: "amount-asc", label: "Amount (Low to High)" },
  { value: "yacht_name-asc", label: "Yacht Name (A-Z)" },
  { value: "bidder_name-asc", label: "Bidder Name (A-Z)" },
];

export default function PartnerBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<any[]>([]);
  const [filteredBids, setFilteredBids] = useState<any[]>([]);
  const [yachts, setYachts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    won: 0,
    outbid: 0,
    cancelled: 0,
    totalValue: 0,
    avgBid: 0,
  });
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // ------------------------------------------------------------------------
  // Fetch partner's yachts and all bids
  // ------------------------------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      // First get partner's yachts to know which bids belong to them
      const yachtsRes = await api.get("/my-yachts");
      const yachtsData = yachtsRes.data || [];
      setYachts(yachtsData);
      const yachtIds = yachtsData.map((y: any) => y.id);

      // Then fetch all bids (assuming /bids returns all bids, we'll filter)
      const bidsRes = await api.get("/bids");
      let bidsData = bidsRes.data?.data || bidsRes.data || []; // handle pagination if needed

      // Filter bids to only those on partner's yachts
      bidsData = bidsData.filter((bid: any) => yachtIds.includes(bid.yacht_id));

      // Enhance bids with yacht details from our yachts list
      bidsData = bidsData.map((bid: any) => {
        const yacht = yachtsData.find((y: any) => y.id === bid.yacht_id);
        return { ...bid, yacht };
      });

      setBids(bidsData);

      // Calculate stats
      const active = bidsData.filter((b: any) => b.status === "active").length;
      const won = bidsData.filter((b: any) => b.status === "won").length;
      const outbid = bidsData.filter((b: any) => b.status === "outbid").length;
      const cancelled = bidsData.filter(
        (b: any) => b.status === "cancelled",
      ).length;
      const totalValue = bidsData.reduce(
        (sum: number, b: any) => sum + (parseFloat(b.amount) || 0),
        0,
      );
      const avgBid = bidsData.length ? totalValue / bidsData.length : 0;

      setStats({
        total: bidsData.length,
        active,
        won,
        outbid,
        cancelled,
        totalValue,
        avgBid,
      });
    } catch (err: any) {
      console.error("Failed to fetch bids:", err);
      if (err.response?.status === 401) {
        toast.error("Please log in to view bids");
        router.push("/login");
      } else {
        toast.error("Failed to load bid data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------------------------------------------------------------------
  // Filtering & Sorting
  // ------------------------------------------------------------------------
  useEffect(() => {
    let filtered = [...bids];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((bid) => bid.status === selectedStatus);
    }

    // Filter by search (yacht name, bidder name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((bid) => {
        const yachtName = getYachtName(bid.yacht).toLowerCase();
        const bidderName = bid.user?.name?.toLowerCase() || "";
        return yachtName.includes(query) || bidderName.includes(query);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortBy === "yacht_name") {
        aVal = getYachtName(a.yacht);
        bVal = getYachtName(b.yacht);
      } else if (sortBy === "bidder_name") {
        aVal = a.user?.name || "";
        bVal = b.user?.name || "";
      } else if (sortBy === "amount") {
        aVal = parseFloat(a.amount) || 0;
        bVal = parseFloat(b.amount) || 0;
      } else {
        aVal = new Date(a[sortBy] || 0).getTime();
        bVal = new Date(b[sortBy] || 0).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredBids(filtered);
  }, [bids, searchQuery, selectedStatus, sortBy, sortOrder]);

  // ------------------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------------------
  const getYachtName = (yacht: any): string => {
    if (!yacht) return "Unknown Yacht";
    return yacht.boat_name || yacht.name || `Vessel #${yacht.id}`;
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STORAGE_URL}${imagePath}`;
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale");
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === "") return "€ --";
    const num = Number(amount);
    if (isNaN(num)) return "€ --";
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ------------------------------------------------------------------------
  // Actions: Accept / Decline Bid
  // ------------------------------------------------------------------------
  const handleAcceptBid = async (bidId: number) => {
    setActionInProgress(bidId);
    try {
      await api.post(`/bids/${bidId}/accept`);
      toast.success("Bid accepted successfully");
      // Refresh data
      fetchData();
    } catch (err: any) {
      console.error("Accept failed:", err);
      toast.error(err.response?.data?.message || "Failed to accept bid");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeclineBid = async (bidId: number) => {
    setActionInProgress(bidId);
    try {
      await api.post(`/bids/${bidId}/decline`);
      toast.success("Bid declined");
      fetchData();
    } catch (err: any) {
      console.error("Decline failed:", err);
      toast.error(err.response?.data?.message || "Failed to decline bid");
    } finally {
      setActionInProgress(null);
    }
  };

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster position="top-right" />
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "ml-20" : "ml-64",
        )}
      >
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6 lg:px-12 flex justify-between items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif italic tracking-tight mb-1">
                Bid Management
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Offers on your vessels
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={fetchData}
                className="bg-white text-[#003566] border border-slate-200 hover:bg-slate-50 rounded-none h-12 px-6 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
              <Button
                onClick={() => router.push("/nl/dashboard/partner/yachts")}
                className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-12 px-8 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2"
              >
                <Ship size={14} />
                My Fleet
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-8">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Total Bids
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
                    Active
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {stats.active}
                  </p>
                </div>
                <Clock className="text-blue-600" size={18} />
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Won
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    {stats.won}
                  </p>
                </div>
                <CheckCircle className="text-emerald-600" size={18} />
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Outbid
                  </p>
                  <p className="text-xl font-bold text-slate-500">
                    {stats.outbid}
                  </p>
                </div>
                <AlertTriangle className="text-slate-500" size={18} />
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Cancelled
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {stats.cancelled}
                  </p>
                </div>
                <XCircle className="text-red-600" size={18} />
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Total Value
                  </p>
                  <p className="text-base font-bold text-blue-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <DollarSign className="text-blue-900" size={18} />
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Avg. Bid
                  </p>
                  <p className="text-base font-bold text-blue-900">
                    {formatCurrency(stats.avgBid)}
                  </p>
                </div>
                <TrendingUp className="text-blue-900" size={18} />
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="bg-white p-6 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
              <div className="relative group lg:col-span-2">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="SEARCH BY YACHT OR BIDDER..."
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
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder as "asc" | "desc");
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort: {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="col-span-full py-20 text-center">
              <Loader2
                className="animate-spin mx-auto text-blue-600"
                size={40}
              />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Loading bids...
              </p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredBids.length === 0 && (
            <div className="text-center py-20">
              <Ship className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-2">
                No bids found
              </p>
              <p className="text-[10px] text-slate-400 mb-6">
                {searchQuery || selectedStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't received any bids on your vessels yet"}
              </p>
              <Button
                onClick={() => router.push("/nl/dashboard/partner/yachts")}
                className="bg-[#003566] text-white hover:bg-blue-800 rounded-none px-8 font-black uppercase text-[10px] tracking-widest"
              >
                <Ship className="mr-2 w-4 h-4" />
                View My Fleet
              </Button>
            </div>
          )}

          {/* BIDS LIST */}
          {!loading && filteredBids.length > 0 && (
            <div className="bg-white border border-slate-200">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="col-span-3">Yacht</div>
                <div className="col-span-2">Bidder</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Rows */}
              {filteredBids.map((bid) => (
                <div
                  key={bid.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center"
                >
                  {/* Yacht */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(bid.yacht?.main_image)}
                        onError={handleImageError}
                        alt={getYachtName(bid.yacht)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-[#003566]">
                        {getYachtName(bid.yacht)}
                      </p>
                      {bid.yacht?.vessel_id && (
                        <p className="text-[9px] text-slate-500">
                          ID: {bid.yacht.vessel_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bidder */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-blue-600" />
                      <span className="text-sm">
                        {bid.user?.name || "Unknown"}
                      </span>
                    </div>
                    {bid.user?.email && (
                      <p className="text-[9px] text-slate-500 truncate">
                        {bid.user.email}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <p className="font-bold text-blue-900">
                      {formatCurrency(bid.amount)}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-600" />
                      <span className="text-xs">
                        {formatDate(bid.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span
                      className={cn(
                        "inline-flex text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                        bidStatusConfig[bid.status]?.color || "text-slate-600",
                        bidStatusConfig[bid.status]?.bg || "bg-slate-100",
                        bidStatusConfig[bid.status]?.border ||
                          "border-slate-200",
                      )}
                    >
                      {bidStatusConfig[bid.status]?.label || bid.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/nl/dashboard/partner/yachts/${bid.yacht_id}`,
                        )
                      }
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Yacht"
                    >
                      <Eye size={16} />
                    </button>

                    {bid.status === "active" && (
                      <>
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={actionInProgress === bid.id}
                          className="p-2 text-emerald-600 hover:text-emerald-800 transition-colors disabled:opacity-50"
                          title="Accept Bid"
                        >
                          {actionInProgress === bid.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeclineBid(bid.id)}
                          disabled={actionInProgress === bid.id}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                          title="Decline Bid"
                        >
                          {actionInProgress === bid.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FOOTER */}
          {!loading && filteredBids.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="text-blue-600">{filteredBids.length}</span>{" "}
                  of <span>{bids.length}</span> bids displayed
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={fetchData}
                    variant="outline"
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    <RefreshCw size={12} className="mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
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
    </div>
  );
}
