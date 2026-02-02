"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gavel,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  History,
  Anchor,
  ShoppingCart,
  Info,
  Ruler,
  Box,
  Droplets,
  Fuel,
  Calendar,
  MapPin,
  Share2,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";

const STORAGE_URL = "http://kring.answer24.nl/storage/";

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
  images: { id: number; url: string; category: string }[];
  beam: string;
  draft: string;
  engine_type: string;
  fuel_type: string;
  fuel_capacity: string;
  water_capacity: string;
  cabins: number;
  heads: number;
}

export default function YachtTerminalPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Payment states
  const [paymentMode, setPaymentMode] = useState<
    "test_sail" | "buy_now" | null
  >(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");

  useEffect(() => {
    fetchVesselData();
    const interval = setInterval(fetchVesselData, 10000); // Polling for bids
    return () => clearInterval(interval);
  }, [id]);

  const fetchVesselData = async () => {
    try {
      const [yachtRes, historyRes] = await Promise.all([
        api.get(`/yachts/${id}`),
        api.get(`/bids/${id}/history`),
      ]);
      setYacht(yachtRes.data);
      setBids(historyRes.data);
      if (!activeImage)
        setActiveImage(
          yachtRes.data.main_image
            ? `${STORAGE_URL}${yachtRes.data.main_image}`
            : "",
        );
      setLoading(false);
    } catch (error) {
      console.error("Vessel Retrieval Failed:", error);
    }
  };

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!yacht) return;
    if (amount <= (yacht.current_bid || yacht.price)) {
      toast.error("Bid must be higher than current price");
      return;
    }
    try {
      await api.post("/bids/place", { yacht_id: yacht.id, amount });
      toast.success("Bid placed successfully!");
      setBidAmount("");
      fetchVesselData();
    } catch (e) {
      toast.error("Bidding failed. Check connection.");
    }
  };

  const handleDepositPayment = async () => {
    setPaymentStatus("processing");
    setTimeout(async () => {
      try {
        const isBuyNow = paymentMode === "buy_now";
        await api.post("/tasks", {
          title: isBuyNow ? `URGENT: BUY NOW REQUEST` : `TEST SAIL REQUEST`,
          description: isBuyNow
            ? `CLIENT PAID DEPOSIT FOR FULL PURCHASE: €${yacht?.price.toLocaleString()}. Please halt auction.`
            : `Client paid deposit for Test Sail on ${yacht?.name}.`,
          priority: "High",
          status: "To Do",
          yacht_id: yacht?.id,
        });
        setPaymentStatus("success");
        setTimeout(() => {
          setPaymentMode(null);
          setPaymentStatus("idle");
        }, 3000);
      } catch (error) {
        setPaymentStatus("idle");
        toast.error("Transaction failed.");
      }
    }, 2000);
  };

  if (loading || !yacht) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#003566]" size={40} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Synchronizing Manifest...
        </p>
      </div>
    );
  }

  const depositAmount = yacht.price * 0.1;

  return (
    <div className="min-h-screen bg-white text-[#003566] selection:bg-blue-100">
      <Toaster position="top-center" />

      {/* NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 md:px-12 justify-between">
        <Link
          href="/yachts"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003566] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Fleet
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 hidden md:block">
            REF: {yacht.vessel_id}
          </span>
          <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-400">
            <Share2 size={16} />
          </button>
        </div>
      </header>

      <main className="pt-20">
        <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh]">
          {/* LEFT: MEDIA & SPECS (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-50 border-r border-slate-100 flex flex-col">
            {/* Image Gallery Component */}
            <div className="relative h-[60vh] overflow-hidden group">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0.8, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                src={activeImage}
                className="w-full h-full object-cover"
                alt={yacht.name}
              />
              <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Thumbnail
                  src={`${STORAGE_URL}${yacht.main_image}`}
                  active={activeImage.includes(yacht.main_image)}
                  onClick={() =>
                    setActiveImage(`${STORAGE_URL}${yacht.main_image}`)
                  }
                />
                {yacht.images.map((img) => (
                  <Thumbnail
                    key={img.id}
                    src={`${STORAGE_URL}${img.url}`}
                    active={activeImage.includes(img.url)}
                    onClick={() => setActiveImage(`${STORAGE_URL}${img.url}`)}
                  />
                ))}
              </div>
            </div>

            {/* Vessel Description & Specs */}
            <div className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white">
              <div>
                <h3 className="text-2xl font-serif italic text-[#003566] mb-6">
                  Captain's Note
                </h3>
                <p className="text-sm font-light leading-relaxed text-slate-500 mb-8">
                  {yacht.description ||
                    "Specifications pending final maritime certification."}
                </p>
                <div className="grid grid-cols-2 gap-y-8">
                  <SpecItem
                    label="Beam"
                    value={`${yacht.beam}m`}
                    icon={<Box size={14} />}
                  />
                  <SpecItem
                    label="Draft"
                    value={`${yacht.draft}m`}
                    icon={<Anchor size={14} />}
                  />
                  <SpecItem
                    label="Fuel"
                    value={`${yacht.fuel_capacity}L`}
                    icon={<Fuel size={14} />}
                  />
                  <SpecItem
                    label="Water"
                    value={`${yacht.water_capacity}L`}
                    icon={<Droplets size={14} />}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <History size={14} /> Transaction Log
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {bids.length > 0 ? (
                    bids.map((bid: any, i) => (
                      <div
                        key={bid.id}
                        className={cn(
                          "p-4 border flex justify-between items-center transition-all",
                          i === 0
                            ? "border-blue-200 bg-white"
                            : "border-transparent opacity-50",
                        )}
                      >
                        <span className="text-[10px] font-bold uppercase">
                          {bid.user?.name || "Private Collector"}
                        </span>
                        <span className="font-serif text-lg">
                          €{bid.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">
                      No bids recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION CENTER (4 Cols) */}
          <div className="lg:col-span-4 p-8 md:p-12 flex flex-col gap-8 bg-white sticky top-20 h-fit">
            <div className="space-y-2">
              <h1 className="text-5xl font-serif text-[#003566] leading-none">
                {yacht.name}
              </h1>
              <p className="text-lg font-light italic text-slate-400">
                {yacht.year} {yacht.make} {yacht.model}
              </p>
            </div>

            {/* Bidding Module */}
            <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">
                Current High Bid
              </p>
              <h2 className="text-4xl font-serif mb-6 italic">
                €{(yacht.current_bid || yacht.price).toLocaleString()}
              </h2>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter Amount"
                  className="flex-1 bg-white border border-slate-200 p-3 text-sm font-serif outline-none focus:border-blue-500"
                />
                <Button
                  onClick={placeBid}
                  className="bg-[#003566] hover:bg-blue-900 h-auto px-6"
                >
                  <Gavel size={16} />
                </Button>
              </div>
            </div>

            {/* Direct Purchase Module */}
            <div className="border-2 border-[#003566] p-6 rounded-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#003566] mb-1">
                Direct Acquisition
              </p>
              <h3 className="text-2xl font-serif mb-4">
                €{yacht.price.toLocaleString()}
              </h3>
              <Button
                onClick={() => setPaymentMode("buy_now")}
                className="w-full bg-[#003566] text-white py-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-900"
              >
                Buy Now (Deposit Required)
              </Button>
            </div>

            {/* Quick Specs List */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Location</span>
                <span className="text-[#003566]">{yacht.location}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Length</span>
                <span className="text-[#003566]">{yacht.length}m</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Status</span>
                <span className="text-blue-600 animate-pulse">
                  {yacht.status === "For Bid" ? "Auction Active" : "For Sale"}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setPaymentMode("test_sail")}
              variant="outline"
              className="w-full border-slate-200 text-[10px] font-black uppercase tracking-widest py-6"
            >
              <Anchor size={14} className="mr-2" /> Book Sea Trial
            </Button>
          </div>
        </section>
      </main>

      {/* PAYMENT MODAL (Merged logic) */}
      <AnimatePresence>
        {paymentMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#001D3D]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white max-w-md w-full p-8 shadow-2xl"
            >
              {paymentStatus === "idle" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-2">
                      {paymentMode === "buy_now"
                        ? "Direct Purchase"
                        : "Secure Test Sail"}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Deposit Due: €{depositAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 text-[#003566] flex gap-3 rounded-sm">
                    <Info size={20} className="shrink-0" />
                    <p className="text-[9px] leading-relaxed font-medium">
                      This deposit initiates the official transfer sequence. Our
                      legal team will generate a maritime contract within 24
                      hours.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setPaymentMode(null)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDepositPayment}
                      className="flex-[2] bg-[#003566] hover:bg-blue-900 text-white font-bold uppercase tracking-widest text-[10px]"
                    >
                      Confirm & Pay
                    </Button>
                  </div>
                </div>
              )}
              {paymentStatus === "processing" && (
                <div className="py-20 text-center flex flex-col items-center">
                  <Loader2
                    className="animate-spin text-[#003566] mb-4"
                    size={32}
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Contacting Secure Gateway...
                  </p>
                </div>
              )}
              {paymentStatus === "success" && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-[#003566]">
                    Transaction Secured
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    A terminal ticket has been dispatched.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components for clean structure
function Thumbnail({
  src,
  active,
  onClick,
}: {
  src: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-20 h-20 shrink-0 border-2 transition-all",
        active ? "border-[#003566]" : "border-white/50 hover:border-white",
      )}
    >
      <img src={src} className="w-full h-full object-cover" alt="Thumbnail" />
    </button>
  );
}

function SpecItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="text-slate-300 mb-1 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-sm font-serif italic text-[#003566]">
        {value || "N/A"}
      </p>
    </div>
  );
}
