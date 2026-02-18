"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Award,
  Ship,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";

// ----- Roboto font (exact match) -----
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

// Bid status configuration (matches partner dashboard)
const bidStatusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  active: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", label: "Active" },
  outbid: { color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200", label: "Outbid" },
  won: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "Won" },
  cancelled: { color: "text-red-600", bg: "bg-red-50", border: "border-red-100", label: "Cancelled" },
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

interface YachtInfo {
  id: number;
  boat_name: string;
  vessel_id: string;
  status: string;
  current_bid: number | null;
  price: number;
  main_image: string;
}

interface Bid {
  id: number;
  amount: number;
  status: "active" | "outbid" | "won" | "cancelled";
  created_at: string;
  finalized_at?: string | null;
  user: {
    id: number;
    name: string;
    email?: string;
  };
  yacht: YachtInfo;
}

interface PaginatedResponse {
  data: Bid[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function GlobalBidManagementPage() {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    won: 0,
    outbid: 0,
    cancelled: 0,
    totalValue: 0,
    avgBid: 0,
  });

  // ----- Authentication helpers -----
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  const getUserData = () => {
    if (typeof window !== "undefined") {
      const userDataStr = localStorage.getItem("user_data");
      if (userDataStr) {
        try {
          return JSON.parse(userDataStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  // ----- Check auth & fetch bids -----
  useEffect(() => {
    const token = getAuthToken();
    const userData = getUserData();
    if (!token || !userData) {
      toast.error("U moet ingelogd zijn om biedingen te beheren.");
      router.push("/login");
      return;
    }
    fetchBids();
  }, [page]);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers: any = {
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://schepen-kring.nl/api/bids?page=${page}`, {
        headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
        }
        throw new Error("Failed to fetch bids");
      }

      const data: PaginatedResponse = await res.json();
      setBids(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching bids:", error);
      toast.error("Kon biedingen niet laden.");
    } finally {
      setLoading(false);
    }
  };

  // Update stats whenever bids change (based on current page)
useEffect(() => {
  const active = bids.filter((b) => b.status === "active").length;
  const won = bids.filter((b) => b.status === "won").length;
  const outbid = bids.filter((b) => b.status === "outbid").length;
  const cancelled = bids.filter((b) => b.status === "cancelled").length;

  // Safely parse amounts as floats
  const totalValue = bids.reduce((sum, b) => {
    const amount = typeof b.amount === 'string' ? parseFloat(b.amount) : (b.amount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const avgBid = bids.length ? totalValue / bids.length : 0;

  setStats({
    total: bids.length,
    active,
    won,
    outbid,
    cancelled,
    totalValue,
    avgBid,
  });
}, [bids]);

  // Filtering & sorting (client-side on current page)
// Replace the existing sorting useEffect with this version
useEffect(() => {
  let filtered = [...bids];

  if (selectedStatus !== "all") {
    filtered = filtered.filter((bid) => bid.status === selectedStatus);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((bid) => {
      const yachtName = bid.yacht?.boat_name?.toLowerCase() || "";
      const bidderName = bid.user?.name?.toLowerCase() || "";
      return yachtName.includes(query) || bidderName.includes(query);
    });
  }

  filtered.sort((a, b) => {
    let aVal: any, bVal: any;

    if (sortBy === "yacht_name") {
      aVal = a.yacht?.boat_name || "";
      bVal = b.yacht?.boat_name || "";
    } else if (sortBy === "bidder_name") {
      aVal = a.user?.name || "";
      bVal = b.user?.name || "";
    } else if (sortBy === "amount") {
      aVal = a.amount || 0;
      bVal = b.amount || 0;
    } else if (sortBy === "created_at") {
      aVal = new Date(a.created_at || 0).getTime();
      bVal = new Date(b.created_at || 0).getTime();
    } else {
      // fallback (should never happen)
      aVal = 0;
      bVal = 0;
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  setFilteredBids(filtered);
}, [bids, searchQuery, selectedStatus, sortBy, sortOrder]);

  // ----- Accept a bid -----
  const handleAcceptBid = async (bidId: number) => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Niet geautoriseerd. Log opnieuw in.");
      router.push("/login");
      return;
    }

    setActionInProgress(bidId);
    try {
      const response = await fetch(`https://schepen-kring.nl/api/bids/${bidId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Bod accepteren mislukt");
      }

      toast.success("Bod geaccepteerd! Jacht gemarkeerd als verkocht.");
      fetchBids();
    } catch (error: any) {
      console.error("Accept bid error:", error);
      toast.error(error.message || "Bod accepteren mislukt");
    } finally {
      setActionInProgress(null);
    }
  };

  // ----- Decline a bid -----
  const handleDeclineBid = async (bidId: number) => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Niet geautoriseerd. Log opnieuw in.");
      router.push("/login");
      return;
    }

    setActionInProgress(bidId);
    try {
      const response = await fetch(`https://schepen-kring.nl/api/bids/${bidId}/decline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Bod afwijzen mislukt");
      }

      toast.success("Bod afgewezen.");
      fetchBids();
    } catch (error: any) {
      console.error("Decline bid error:", error);
      toast.error(error.message || "Bod afwijzen mislukt");
    } finally {
      setActionInProgress(null);
    }
  };

  // ----- Helpers -----
  const getYachtName = (yacht: YachtInfo): string => {
    return yacht?.boat_name || `Vessel #${yacht?.id}`;
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http")) return imagePath;
    return `${STORAGE_URL}${imagePath}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale");
  };

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "€ --";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

  // ----- Loading state -----
  if (loading && bids.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] font-roboto">
        <Loader2 className="animate-spin text-[#003566]" size={40} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Biedingen laden...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-roboto">
      <Toaster position="top-right" />

      {/* HEADER (sticky, white, with back button and total) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif italic tracking-tight mb-1">
              Bid Management
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              All offers on vessels
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchBids}
              className="bg-white text-[#003566] border border-slate-200 hover:bg-slate-50 rounded-none h-12 px-6 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Link
              href="/dashboard"
              className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-12 px-8 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Bids</p>
                <p className="text-xl font-bold text-[#003566]">{stats.total}</p>
              </div>
              <BarChart3 className="text-blue-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Active</p>
                <p className="text-xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="text-blue-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Won</p>
                <p className="text-xl font-bold text-emerald-600">{stats.won}</p>
              </div>
              <CheckCircle className="text-emerald-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Outbid</p>
                <p className="text-xl font-bold text-slate-500">{stats.outbid}</p>
              </div>
              <AlertTriangle className="text-slate-500" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cancelled</p>
                <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="text-red-600" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Value</p>
                <p className="text-base font-bold text-blue-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="text-blue-900" size={18} />
            </div>
          </div>
          <div className="bg-white p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Bid</p>
                <p className="text-base font-bold text-blue-900">{formatCurrency(stats.avgBid)}</p>
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
                : "There are no bids on any vessels yet."}
            </p>
          </div>
        )}

        {/* BIDS LIST (table style) */}
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
                    <p className="font-medium text-[#003566]">{getYachtName(bid.yacht)}</p>
                    {bid.yacht?.vessel_id && (
                      <p className="text-[9px] text-slate-500">ID: {bid.yacht.vessel_id}</p>
                    )}
                  </div>
                </div>

                {/* Bidder */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-blue-600" />
                    <span className="text-sm">{bid.user?.name || "Unknown"}</span>
                  </div>
                  {bid.user?.email && (
                    <p className="text-[9px] text-slate-500 truncate">{bid.user.email}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <p className="font-bold text-blue-900">{formatCurrency(bid.amount)}</p>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-blue-600" />
                    <span className="text-xs">{formatDate(bid.created_at)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span
                    className={cn(
                      "inline-flex text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                      bidStatusConfig[bid.status]?.color || "text-slate-600",
                      bidStatusConfig[bid.status]?.bg || "bg-slate-100",
                      bidStatusConfig[bid.status]?.border || "border-slate-200"
                    )}
                  >
                    {bidStatusConfig[bid.status]?.label || bid.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/nl/yachts/${bid.yacht.id}/${bid.yacht.boat_name?.toLowerCase().replace(/\s+/g, "-")}`}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Yacht"
                  >
                    <Eye size={16} />
                  </Link>

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

        {/* FOOTER with pagination */}
        {!loading && filteredBids.length > 0 && (
          <div className="pt-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="text-blue-600">{filteredBids.length}</span> of{" "}
                <span>{bids.length}</span> bids displayed on this page
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchBids}
                  className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white hover:bg-slate-50 rounded-none flex items-center gap-2"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white hover:bg-slate-50 rounded-none"
                >
                  Back to Top
                </button>
              </div>
            </div>
            {/* Pagination controls */}
            {lastPage > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-[10px] font-black text-slate-500">
                  Page {page} of {lastPage}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                  disabled={page === lastPage}
                  className="px-4 py-2 border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Button component to match the UI (since we don't have the shadcn button)
const Button = ({ children, className, onClick, ...props }: any) => (
  <button
    className={cn("inline-flex items-center justify-center", className)}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);