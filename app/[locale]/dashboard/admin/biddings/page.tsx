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
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80";

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
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

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
      // Refresh the list
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
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("nl-NL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Bid["status"]) => {
    const config = {
      active: { label: "Actief", className: "bg-blue-100 text-blue-800" },
      outbid: { label: "Overboden", className: "bg-gray-100 text-gray-600" },
      won: { label: "Geaccepteerd", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Geannuleerd", className: "bg-red-100 text-red-800" },
    };
    const c = config[status] || config.outbid;
    return (
      <span className={`inline-block px-3 py-1.5 text-xs font-medium rounded-full ${c.className}`}>
        {c.label}
      </span>
    );
  };

  // ----- Loading state -----
  if (loading && bids.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-roboto">
        <Loader2 className="animate-spin text-[#2a77b1]" size={40} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Biedingen laden...
        </p>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-white text-[#333] font-roboto antialiased flex flex-col -top-20">
    <Toaster position="top-center" />

    {/* Header */}
    <header className="w-full bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
        <Link
          href="/dashboard" // change to your own dashboard link
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} /> Terug naar dashboard
        </Link>
        <span className="text-sm font-medium text-gray-500">
          Totaal biedingen: {total}
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif italic text-gray-900 mb-2">
            Biedingen beheer
          </h1>
          <p className="text-gray-600">
            Alle uitstaande, overboden, geaccepteerde en geannuleerde biedingen.
          </p>
        </div>

        {/* Bids list */}
        {bids.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <Award size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Er zijn nog geen biedingen geplaatst.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className={cn(
                  "bg-white border rounded-lg p-5 transition-all hover:shadow-sm",
                  bid.status === "active"
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-gray-200"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                  {/* Yacht thumbnail & info */}
                  <div className="flex gap-4 flex-1">
                    <div className="w-24 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={
                          bid.yacht.main_image
                            ? `${STORAGE_URL}${bid.yacht.main_image}`
                            : PLACEHOLDER_IMAGE
                        }
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                        alt={bid.yacht.boat_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/nl/yachts/${bid.yacht.id}/${bid.yacht.boat_name
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="group inline-flex items-center gap-1.5"
                      >
                        <h2 className="text-lg font-serif italic text-[#2a77b1] group-hover:underline notranslate">
                          {bid.yacht.boat_name}
                        </h2>
                        <ExternalLink size={14} className="text-gray-400" />
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        REF: {bid.yacht.vessel_id || bid.yacht.id}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {bid.yacht.status}
                        </span>
                        <span className="text-sm">
                          Vraagprijs: €{formatPrice(bid.yacht.price)}
                        </span>
                        {bid.yacht.current_bid && (
                          <span className="text-sm font-medium">
                            Huidig bod: €{formatPrice(bid.yacht.current_bid)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bid details & actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:gap-3 xl:gap-4 lg:min-w-[300px] xl:min-w-[400px]">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-serif italic">
                          €{formatPrice(bid.amount)}
                        </span>
                        {getStatusBadge(bid.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Bieder:</span>{" "}
                        {bid.user?.name || "Anoniem"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Datum:</span>{" "}
                        {formatDate(bid.created_at)}
                      </p>
                      {bid.finalized_at && (
                        <p className="text-xs text-gray-500">
                          Afgerond: {formatDate(bid.finalized_at)}
                        </p>
                      )}
                    </div>

                    {/* Actions - only for active bids */}
                    {bid.status === "active" && (
                      <div className="flex flex-row sm:flex-col lg:flex-row xl:flex-col gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={actionInProgress === bid.id}
                          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors disabled:bg-green-300 flex items-center justify-center gap-2 text-sm"
                        >
                          {actionInProgress === bid.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Accepteer
                        </button>
                        <button
                          onClick={() => handleDeclineBid(bid.id)}
                          disabled={actionInProgress === bid.id}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:bg-red-300 flex items-center justify-center gap-2 text-sm"
                        >
                          {actionInProgress === bid.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}
                          Afwijzen
                        </button>
                      </div>
                    )}

                    {/* Status messages for finalised bids */}
                    {bid.status === "won" && (
                      <div className="px-5 py-2.5 bg-green-50 text-green-700 rounded-md text-sm font-medium flex items-center gap-2 self-end">
                        <CheckCircle size={16} />
                        Winnend bod
                      </div>
                    )}
                    {bid.status === "cancelled" && (
                      <div className="px-5 py-2.5 bg-red-50 text-red-700 rounded-md text-sm font-medium flex items-center gap-2 self-end">
                        <XCircle size={16} />
                        Geannuleerd
                      </div>
                    )}
                    {bid.status === "outbid" && (
                      <div className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-md text-sm font-medium flex items-center gap-2 self-end">
                        <Award size={16} />
                        Overboden
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vorige
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Pagina {page} van {lastPage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
              disabled={page === lastPage}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volgende
            </button>
          </div>
        )}
      </main>
    </div>
  );
}