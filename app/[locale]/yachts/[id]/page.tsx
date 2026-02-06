"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Gavel,
  CheckCircle2,
  History,
  Anchor,
  Box,
  Droplets,
  Fuel,
  Share2,
  Loader2,
  Zap,
  Wind,
  Compass,
  Ship,
  Bed,
  Waves,
  FileText,
  CheckSquare,
  Thermometer,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80";

// --- EXTENDED INTERFACE TO MATCH DATABASE ---
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

  // New Technical Fields
  vat_status?: string;
  reference_code?: string;
  construction_material?: string;
  hull_shape?: string;
  hull_color?: string;
  deck_color?: string;
  clearance?: string;
  displacement?: string;
  steering?: string;

  // Engine
  engine_brand?: string;
  engine_model?: string;
  engine_power?: string;
  engine_hours?: string;
  engine_type?: string;
  max_speed?: string;
  fuel_type?: string;
  fuel_capacity?: string;
  voltage?: string;

  // Accommodation
  cabins?: number;
  berths?: string;
  heads?: number;
  water_tank?: string;
  water_capacity?: string;

  // Equipment
  navigation_electronics?: string;
  exterior_equipment?: string;
  trailer_included?: boolean | number; // sometimes comes as 0/1 from DB
  beam?: string;
  draft?: string;
}

export default function YachtTerminalPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [trialDate, setTrialDate] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Payment states
  const [paymentMode, setPaymentMode] = useState<
    "test_sail" | "buy_now" | null
  >(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");

  useEffect(() => {
    fetchVesselData();
    const interval = setInterval(fetchVesselData, 10000);
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

      // Set initial active image safely
      if (!activeImage) {
        const mainImg = yachtRes.data.main_image
          ? `${STORAGE_URL}${yachtRes.data.main_image}`
          : PLACEHOLDER_IMAGE;
        setActiveImage(mainImg);
      }
      setLoading(false);
    } catch (error) {
      console.error("Vessel Retrieval Failed:", error);
    }
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!yacht) return;

    // Check if bid is valid (higher than current bid or base price)
    const currentPrice = yacht.current_bid
      ? Number(yacht.current_bid)
      : Number(yacht.price);

    if (amount <= currentPrice) {
      toast.error(`Bid must be higher than €${currentPrice.toLocaleString()}`);
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
            : `Client paid deposit for Test Sail on ${yacht?.name}. Test Sail on ${yacht?.name}. Start: ${selectedDate?.toLocaleDateString()} at ${selectedTime}.`,
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
  const fetchAvailableSlots = async (date: string) => {
  try {
    const res = await api.get(`/yachts/${id}/available-slots?date=${date}`);
    setAvailableSlots(res.data); // Expecting ["10:00", "10:15", ...]
  } catch (e) {
    toast.error("Could not load time slots.");
  }
};

const calculateEndTime = (startTime: string) => {
  const [hh, mm] = startTime.split(':').map(Number);
  const end = new Date();
  end.setHours(hh, mm + 60); // 60 min duration
  return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  const isTrailerIncluded =
    yacht.trailer_included === true || yacht.trailer_included === 1;

  // Helper to process textarea lists
  const renderList = (text?: string) => {
    if (!text)
      return (
        <span className="text-slate-400 italic">No equipment listed.</span>
      );
    return (
      <ul className="space-y-1 mt-2">
        {text.split("\n").map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs font-medium text-slate-600"
          >
            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#003566] selection:bg-blue-100">
      <Toaster position="top-center" />

      {/* NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 md:px-12 justify-between">
        <Link
          href="/nl/yachts"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003566] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Fleet
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 hidden md:block">
            REF: {yacht.vessel_id || yacht.id}
          </span>
          <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-400">
            <Share2 size={16} />
          </button>
        </div>
      </header>

      <main className="pt-20">
        <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh]">
          {/* LEFT: MEDIA & TECHNICAL DOSSIER (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-50 border-r border-slate-100 flex flex-col">
            {/* Image Gallery */}
            <div className="relative h-[60vh] overflow-hidden group bg-slate-200">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={activeImage}
                onError={handleImageError}
                className="w-full h-full object-cover"
                alt={yacht.name}
              />
              {/* Thumbnails Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Thumbnail
                  src={
                    yacht.main_image
                      ? `${STORAGE_URL}${yacht.main_image}`
                      : PLACEHOLDER_IMAGE
                  }
                  active={activeImage.includes(
                    yacht.main_image || "placeholder",
                  )}
                  onClick={() =>
                    setActiveImage(
                      yacht.main_image
                        ? `${STORAGE_URL}${yacht.main_image}`
                        : PLACEHOLDER_IMAGE,
                    )
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

            {/* Vessel Description */}
            <div className="p-8 md:p-12 bg-white border-b border-slate-100">
              <h3 className="text-2xl font-serif italic text-[#003566] mb-6">
                Captain's Note
              </h3>
              <p className="text-sm font-light leading-relaxed text-slate-600 mb-8 whitespace-pre-line">
                {yacht.description ||
                  "Specifications pending final maritime certification."}
              </p>

              {/* Highlight Badges */}
              <div className="flex gap-4">
                {isTrailerIncluded && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <CheckSquare size={14} /> Trailer Included
                  </div>
                )}
                {yacht.vat_status && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    <FileText size={14} /> {yacht.vat_status}
                  </div>
                )}
              </div>
            </div>

            {/* TECHNICAL DOSSIER GRID */}
            <div className="bg-slate-50/50 p-8 md:p-12">
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#003566] mb-8 flex items-center gap-2">
                <Waves size={16} /> Technical Dossier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                {/* Category: General */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Ship size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Hull & General
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4">
                    <SpecRow label="Builder" value={yacht.make} />
                    <SpecRow label="Model" value={yacht.model} />
                    <SpecRow
                      label="Construction"
                      value={yacht.construction_material}
                    />
                    <SpecRow label="Hull Shape" value={yacht.hull_shape} />
                    <SpecRow label="Hull Color" value={yacht.hull_color} />
                    <SpecRow label="Displacement" value={yacht.displacement} />
                    <SpecRow label="Clearance" value={yacht.clearance} />
                    <SpecRow label="Steering" value={yacht.steering} />
                  </div>
                </div>

                {/* Category: Engine */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Zap size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Engine Room
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4">
                    <SpecRow label="Brand" value={yacht.engine_brand} />
                    <SpecRow label="Model" value={yacht.engine_model} />
                    <SpecRow label="Power" value={yacht.engine_power} />
                    <SpecRow label="Hours" value={yacht.engine_hours} />
                    <SpecRow label="Fuel Type" value={yacht.fuel_type} />
                    <SpecRow label="Max Speed" value={yacht.max_speed} />
                    <SpecRow label="Voltage" value={yacht.voltage} />
                    <SpecRow label="Tank (Fuel)" value={yacht.fuel_capacity} />
                  </div>
                </div>

                {/* Category: Accommodation */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Bed size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Accommodation
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4">
                    <SpecRow label="Berths" value={yacht.berths} />
                    <SpecRow label="Cabins" value={yacht.cabins?.toString()} />
                    <SpecRow label="Heads" value={yacht.heads?.toString()} />
                    <SpecRow
                      label="Water Tank"
                      value={yacht.water_tank || yacht.water_capacity}
                    />
                    <SpecRow
                      label="Water System"
                      value={yacht.water_capacity}
                    />{" "}
                    {/* Fallback if needed */}
                  </div>
                </div>

                {/* Category: Equipment Lists */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Compass size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Equipment
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">
                        Navigation & Electronics
                      </p>
                      {renderList(yacht.navigation_electronics)}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">
                        Exterior & Deck
                      </p>
                      {renderList(yacht.exterior_equipment)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION CENTER (Sticky Sidebar) */}
          <div className="lg:col-span-4 p-8 md:p-12 flex flex-col gap-8 bg-white sticky top-20 h-fit border-l border-slate-50">
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
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">
                  Current High Bid
                </p>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {yacht.status}
                </span>
              </div>
              <h2 className="text-4xl font-serif mb-6 italic">
                €
                {(yacht.current_bid
                  ? Number(yacht.current_bid)
                  : Number(yacht.price)
                ).toLocaleString()}
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
            <div className="border-2 border-[#003566] p-6 rounded-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-[#003566] text-white text-[8px] font-black uppercase">
                Buy Now
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#003566] mb-1">
                Asking Price{" "}
                {yacht.vat_status && (
                  <span className="text-slate-400">({yacht.vat_status})</span>
                )}
              </p>
              <h3 className="text-2xl font-serif mb-4">
                €{Number(yacht.price).toLocaleString()}
              </h3>
              <Button
                onClick={() => setPaymentMode("buy_now")}
                className="w-full bg-[#003566] text-white py-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-900"
              >
                Direct Acquisition
              </Button>
            </div>

            {/* Quick Specs List */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Location</span>
                <span className="text-[#003566] flex items-center gap-1">
                  <MapPin size={10} /> {yacht.location}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Length</span>
                <span className="text-[#003566]">{yacht.length}m</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Beam</span>
                <span className="text-[#003566]">{yacht.beam}m</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Draft</span>
                <span className="text-[#003566]">{yacht.draft}m</span>
              </div>
            </div>

            <Button
              onClick={() => setPaymentMode("test_sail")}
              variant="outline"
              className="w-full border-slate-200 text-[10px] font-black uppercase tracking-widest py-6 hover:bg-slate-50"
            >
              <Anchor size={14} className="mr-2" /> Book Sea Trial
            </Button>

            {/* Transaction Log Widget */}
            <div className="bg-slate-50 p-6 rounded-sm border border-slate-100 mt-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                <History size={14} /> Bid History
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {bids.length > 0 ? (
                  bids.map((bid: any, i) => (
                    <div
                      key={bid.id}
                      className={cn(
                        "flex justify-between items-center text-xs",
                        i === 0 ? "text-[#003566] font-bold" : "text-slate-400",
                      )}
                    >
                      <span>{bid.user?.name || "Private Collector"}</span>
                      <span>€{Number(bid.amount).toLocaleString()}</span>
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
        </section>
      </main>

      {/* PAYMENT MODAL */}
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
                      {paymentMode === "buy_now" ? "Direct Purchase" : "Secure Test Sail"}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Deposit Due: €{depositAmount.toLocaleString()}
                    </p>
                  </div>

                  {/* BEAUTIFULLY STYLED CALENDAR INJECTION */}
{paymentMode === "test_sail" && (
  <div className="space-y-6">
    {/* Header & Date Picker */}
    <div className="text-center">
      <input 
        type="date" 
        className="text-lg font-serif italic border-none focus:ring-0 cursor-pointer"
        onChange={(e) => {
          setSelectedDate(new Date(e.target.value));
          fetchAvailableSlots(e.target.value);
        }}
      />
    </div>

    {/* Slot Grid - Style matching your uploaded image */}
    <div className="grid grid-cols-4 gap-2">
      {availableSlots.length > 0 ? (
        availableSlots.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={cn(
              "py-3 rounded-xl text-xs font-bold transition-all",
              selectedTime === time 
                ? "bg-[#003566] text-white" 
                : "bg-emerald-200 text-emerald-900 hover:bg-emerald-300"
            )}
          >
            {time}
          </button>
        ))
      ) : (
        <p className="col-span-4 text-center text-[9px] text-slate-400 uppercase tracking-widest">
          Select a date to view 15-min slots
        </p>
      )}
    </div>

    {/* Confirmation Details */}
    {selectedTime && (
      <div className="text-center p-2 bg-slate-50 border border-dashed border-slate-200">
        <p className="text-[10px] font-black uppercase text-slate-500">
          Selected: {selectedTime} - {calculateEndTime(selectedTime)} (+15m Buffer)
        </p>
      </div>
    )}
  </div>
)}
                  <div className="p-4 bg-blue-50 text-[#003566] flex gap-3 rounded-sm">
                    <FileText size={20} className="shrink-0" />
                    <p className="text-[9px] leading-relaxed font-medium">
                      This deposit initiates the official transfer sequence. Our legal team will generate a maritime contract within 24 hours.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button onClick={() => setPaymentMode(null)} variant="ghost" className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDepositPayment}
                      disabled={paymentMode === "test_sail" && !trialDate}
                      className="flex-[2] bg-[#003566] hover:bg-blue-900 text-white font-bold uppercase tracking-widest text-[10px] disabled:bg-slate-300"
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

// ---------------- SUB-COMPONENTS ----------------

function Thumbnail({
  src,
  active,
  onClick,
}: {
  src: string;
  active: boolean;
  onClick: () => void;
}) {
  const handleThumbError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-20 h-20 shrink-0 border-2 transition-all bg-slate-100",
        active ? "border-[#003566]" : "border-white/50 hover:border-white",
      )}
    >
      <img
        src={src}
        onError={handleThumbError}
        className="w-full h-full object-cover"
        alt="Thumbnail"
      />
    </button>
  );
}

function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null; // Don't render empty rows
  return (
    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
        {label}
      </span>
      <span className="text-xs font-serif italic text-[#003566]">{value}</span>
    </div>
  );
}
