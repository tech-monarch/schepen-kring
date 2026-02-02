"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gavel,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  History,
  Anchor,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";

// Matches your backend storage
const STORAGE_URL = "http://kring.answer24.nl/storage/";

interface Bid {
  id: number;
  amount: number;
  user: { name: string };
  created_at: string;
}

interface Yacht {
  id: number;
  name: string;
  price: number;
  current_bid: number | null;
  main_image: string;
  vessel_id: string;
  status: "For Sale" | "For Bid" | "Sold";
}

export default function LiveAuctionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Test Sail & Payment States
  const [isTestSailModalOpen, setTestSailModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");

  useEffect(() => {
    fetchAuctionData();
    // Poll for live bids every 5 seconds
    const interval = setInterval(fetchAuctionData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchAuctionData = async () => {
    try {
      const [yachtRes, historyRes] = await Promise.all([
        api.get(`/yachts/${id}`),
        api.get(`/bids/${id}/history`), // Assumes route: Route::get('bids/{id}/history', ...)
      ]);
      setYacht(yachtRes.data);
      setBids(historyRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Auction Sync Error");
    }
  };

  const placeBid = async () => {
    if (!yacht) return;

    const amount = parseFloat(bidAmount);
    const currentHigh = yacht.current_bid || yacht.price;

    if (amount <= currentHigh) {
      toast.error(`Bid must be higher than €${currentHigh.toLocaleString()}`);
      return;
    }

    try {
      // Calls your existing BidController@placeBid
      await api.post("/bids/place", {
        yacht_id: yacht.id,
        amount: amount,
      });

      toast.success("Bid placed successfully!");
      setBidAmount("");
      fetchAuctionData(); // Immediate refresh
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place bid");
    }
  };

  // --- DUMMY PAYMENT & TICKET GENERATION ---
  const handleDummyPayment = async () => {
    setPaymentStatus("processing");

    // 1. Simulate Payment Gateway Delay (Mollie)
    setTimeout(async () => {
      try {
        // 2. On Success, Create "Ticket" using your existing TASK system
        // This ensures Admins see it in their dashboard immediately.
        await api.post("/tasks", {
          title: `TEST SAIL: ${yacht?.name} (${yacht?.vessel_id})`,
          description: `Deposit of €${((yacht?.price || 0) * 0.1).toLocaleString()} received. Client requests test sail.`,
          priority: "High",
          status: "To Do",
          yacht_id: yacht?.id,
          // due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Due in 7 days
        });

        setPaymentStatus("success");
        toast.success(
          "Deposit confirmed. Ticket #TS-" +
            Date.now().toString().slice(-4) +
            " generated.",
        );

        // Close modal after delay
        setTimeout(() => {
          setTestSailModalOpen(false);
          setPaymentStatus("idle");
        }, 3000);
      } catch (error) {
        setPaymentStatus("idle");
        toast.error("Ticket generation failed.");
      }
    }, 2000);
  };

  if (loading || !yacht) return <div className="min-h-screen bg-white" />;

  const currentPrice = yacht.current_bid || yacht.price;
  const depositAmount = currentPrice * 0.1; // 10% Calculation

  return (
    <div className="min-h-screen bg-white text-[#003566] flex flex-col md:flex-row">
      <Toaster position="top-center" />

      {/* LEFT: VISUALS & HISTORY */}
      <div className="w-full md:w-1/2 lg:w-3/5 bg-slate-50 relative flex flex-col">
        {/* Back Nav */}
        <div className="absolute top-6 left-6 z-20">
          <Link href={`/fleet/${yacht.id}`}>
            <Button
              variant="outline"
              className="bg-white/80 backdrop-blur border-white/20 hover:bg-white text-[10px] font-black uppercase tracking-widest gap-2"
            >
              <ArrowLeft size={14} /> Exit Auction
            </Button>
          </Link>
        </div>

        {/* Main Image */}
        <div className="h-[50vh] md:h-[60vh] w-full relative">
          <img
            src={
              yacht.main_image
                ? `${STORAGE_URL}${yacht.main_image}`
                : "/placeholder.jpg"
            }
            className="w-full h-full object-cover"
            alt="Auction Item"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#003566]/90 to-transparent p-10 pt-20">
            <h1 className="text-4xl md:text-5xl font-serif text-white italic mb-2">
              {yacht.name}
            </h1>
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em]">
              {yacht.vessel_id} • Auction Live
            </p>
          </div>
        </div>

        {/* Bid History Feed */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[40vh] bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <History size={16} className="text-slate-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Live Activity Feed
            </h3>
          </div>

          <div className="space-y-4">
            {bids.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                No bids yet. Be the first to start the auction.
              </p>
            ) : (
              bids.map((bid, index) => (
                <div
                  key={bid.id}
                  className={cn(
                    "flex justify-between items-center p-4 border transition-all",
                    index === 0
                      ? "bg-white border-blue-200 shadow-sm"
                      : "border-transparent opacity-60",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        index === 0
                          ? "bg-blue-600 animate-pulse"
                          : "bg-slate-300",
                      )}
                    />
                    <div>
                      <p className="text-xs font-bold text-[#003566]">
                        {bid.user?.name || "Anonymous Bidder"}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {new Date(bid.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-serif text-lg",
                      index === 0 ? "text-blue-600" : "text-slate-400",
                    )}
                  >
                    €{bid.amount.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: ACTION CENTER */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-white p-8 md:p-16 flex flex-col justify-center border-l border-slate-100">
        <div className="max-w-md mx-auto w-full space-y-12">
          {/* 1. CURRENT STATUS */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              Closing Soon
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Current Highest Bid
            </p>
            <p className="text-6xl font-serif text-[#003566] tracking-tighter">
              €{currentPrice.toLocaleString()}
            </p>
          </div>

          {/* 2. BIDDING FORM */}
          <div className="space-y-4 bg-slate-50 p-8 border border-slate-100">
            <div className="flex justify-between text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-2">
              <span>Min. Markup: €1,000</span>
              <span>Secure Gateway</span>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif italic">
                  €
                </span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={(currentPrice + 1000).toString()}
                  className="w-full bg-white border border-slate-200 pl-10 pr-4 py-4 text-lg font-serif text-[#003566] placeholder:text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <button
                onClick={placeBid}
                className="px-8 bg-[#003566] text-white hover:bg-blue-900 transition-all flex items-center justify-center"
              >
                <Gavel size={20} />
              </button>
            </div>
            <p className="text-[8px] text-center text-slate-300 uppercase tracking-widest leading-relaxed">
              By placing a bid, you agree to the binding terms of the Maritime
              Auction Protocol.
            </p>
          </div>

          {/* 3. TEST SAIL SECTION */}
          <div className="border-t border-slate-100 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <Anchor size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#003566]">
                    Request Test Sail
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                    Physical inspection & sea trial
                  </p>
                </div>
              </div>
              <p className="text-right">
                <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Deposit (10%)
                </span>
                <span className="block text-xl font-serif italic text-[#003566]">
                  €{depositAmount.toLocaleString()}
                </span>
              </p>
            </div>

            <Button
              onClick={() => setTestSailModalOpen(true)}
              variant="outline"
              className="w-full h-14 border-slate-200 text-[#003566] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#003566] hover:text-white hover:border-[#003566] transition-all group"
            >
              Secure Inspection Slot
            </Button>
          </div>
        </div>
      </div>

      {/* 4. PAYMENT MODAL (DUMMY GATEWAY) */}
      <AnimatePresence>
        {isTestSailModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#001D3D]/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-[#003566] p-8 text-white flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-serif italic mb-2">
                    Secure Deposit
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-200">
                    Processing via Mollie
                  </p>
                </div>
                <CreditCard size={24} className="text-white/20" />
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8">
                {paymentStatus === "idle" && (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between py-4 border-b border-slate-50">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Total Due
                        </span>
                        <span className="text-xl font-serif text-[#003566]">
                          €{depositAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 flex gap-3">
                        <ShieldCheck
                          size={16}
                          className="text-emerald-500 shrink-0"
                        />
                        <p className="text-[9px] text-slate-500 leading-relaxed">
                          This is a refundable hold. If the test sail does not
                          meet expectations, the amount is returned to source
                          within 3 business days.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => setTestSailModalOpen(false)}
                        variant="ghost"
                        className="flex-1 text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDummyPayment}
                        className="flex-[2] bg-[#003566] hover:bg-blue-900 text-white font-bold uppercase tracking-widest text-[10px]"
                      >
                        Pay & Generate Ticket
                      </Button>
                    </div>
                  </>
                )}

                {paymentStatus === "processing" && (
                  <div className="py-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
                      Contacting Bank...
                    </p>
                  </div>
                )}

                {paymentStatus === "success" && (
                  <div className="py-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-serif text-[#003566]">
                      Payment Confirmed
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
                      Admin Ticket Generated. Our concierge will contact you
                      shortly.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
