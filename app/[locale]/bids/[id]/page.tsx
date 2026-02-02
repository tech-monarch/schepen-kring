"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Gavel, ShieldCheck, 
  CreditCard, CheckCircle2, History,
  Anchor, ShoppingCart, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

export default function LiveAuctionPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<any>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Payment states for both Test Sail AND Direct Buy
  const [paymentMode, setPaymentMode] = useState<"test_sail" | "buy_now" | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    fetchAuctionData();
    const interval = setInterval(fetchAuctionData, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchAuctionData = async () => {
    try {
      const [yachtRes, historyRes] = await Promise.all([
        api.get(`/yachts/${id}`),
        api.get(`/bids/${id}/history`)
      ]);
      setYacht(yachtRes.data);
      setBids(historyRes.data);
      setLoading(false);
    } catch (error) { console.error(error); }
  };

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    if (amount <= (yacht.current_bid || yacht.price)) {
      toast.error("Bid must be higher than current price");
      return;
    }
    try {
      await api.post("/bids/place", { yacht_id: yacht.id, amount });
      toast.success("Bid placed!");
      setBidAmount("");
      fetchAuctionData();
    } catch (e) { toast.error("Bidding failed"); }
  };

  // --- DUMMY GATEWAY FOR DEPOSITS ---
  const handleDepositPayment = async () => {
    setPaymentStatus("processing");
    
    setTimeout(async () => {
      try {
        const isBuyNow = paymentMode === "buy_now";
        
        // Create Admin Task (Ticket)
        await api.post("/tasks", {
          title: isBuyNow ? `URGENT: BUY NOW REQUEST` : `TEST SAIL REQUEST`,
          description: isBuyNow 
            ? `CLIENT PAID DEPOSIT FOR FULL PURCHASE: €${yacht.price.toLocaleString()}. Please halt auction.`
            : `Client paid deposit for Test Sail on ${yacht.name}.`,
          priority: "High",
          status: "To Do",
          yacht_id: yacht.id,
        });

        setPaymentStatus("success");
        toast.success(isBuyNow ? "Purchase sequence initiated!" : "Test sail ticket created!");
        
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

  if (loading) return null;

  const depositAmount = (yacht.price * 0.10);

  return (
    <div className="min-h-screen bg-white text-[#003566] flex flex-col lg:flex-row">
      <Toaster position="top-center" />

      {/* LEFT: MEDIA & HISTORY */}
      <div className="w-full lg:w-3/5 bg-slate-50 flex flex-col border-r border-slate-100">
        <div className="p-6">
          <Link href={`/fleet/${yacht.id}`}>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2">
              <ArrowLeft size={14} /> Exit Terminal
            </Button>
          </Link>
        </div>

        <div className="px-12 mb-8">
           <img 
            src={`${STORAGE_URL}${yacht.main_image}`} 
            className="w-full h-[400px] object-cover shadow-2xl rounded-sm"
            alt=""
          />
        </div>

        <div className="px-12 pb-12 overflow-y-auto max-h-[300px]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
             <History size={14}/> Live Transaction Log
           </h3>
           <div className="space-y-3">
             {bids.map((bid: any, i) => (
               <div key={bid.id} className={cn("p-4 border flex justify-between items-center", i === 0 ? "border-blue-200 bg-white" : "border-transparent opacity-50")}>
                 <span className="text-xs font-bold">{bid.user?.name || "Private Collector"}</span>
                 <span className="font-serif text-lg">€{bid.amount.toLocaleString()}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* RIGHT: ACTION CENTER */}
      <div className="w-full lg:w-2/5 p-8 md:p-16 flex flex-col gap-10">
        
        {/* SECTION 1: BIDDING */}
        <div className="bg-slate-50 p-8 border border-slate-100 rounded-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Live Auction</p>
          <h2 className="text-5xl font-serif mb-6 italic">€{(yacht.current_bid || yacht.price).toLocaleString()}</h2>
          
          <div className="flex gap-2">
            <input 
              type="number" 
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter Bid Amount"
              className="flex-1 bg-white border border-slate-200 p-4 text-sm font-serif outline-none focus:border-blue-500"
            />
            <Button onClick={placeBid} className="bg-[#003566] hover:bg-blue-900 h-auto px-8">
              <Gavel size={18} />
            </Button>
          </div>
          <p className="text-[8px] text-slate-400 mt-4 uppercase tracking-widest">Bids are legally binding under maritime law.</p>
        </div>

        {/* SECTION 2: BUY NOW (The place where user can buy the price) */}
        <div className="border-2 border-[#003566] p-8 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShoppingCart size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#003566] mb-2">Direct Acquisition</p>
          <h3 className="text-3xl font-serif mb-2">€{yacht.price.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
            Skip the auction and secure this vessel immediately. Requires a 10% refundable deposit to initiate the transfer.
          </p>
          <Button 
            onClick={() => setPaymentMode("buy_now")}
            className="w-full bg-[#003566] text-white py-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-900"
          >
            Buy Now (Pay Deposit)
          </Button>
        </div>

        {/* SECTION 3: TEST SAIL */}
        <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100">
           <div className="flex items-center gap-3">
             <Anchor size={20} className="text-slate-400" />
             <span className="text-[10px] font-black uppercase tracking-widest">Sea Trial</span>
           </div>
           <button 
            onClick={() => setPaymentMode("test_sail")}
            className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
           >
             Book Inspection
           </button>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {paymentMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#001D3D]/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white max-w-md w-full p-8 shadow-2xl">
              {paymentStatus === "idle" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-2">
                      {paymentMode === "buy_now" ? "Confirm Purchase" : "Secure Test Sail"}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deposit Due: €{depositAmount.toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 text-[#003566] flex gap-3 rounded-sm">
                    <Info size={20} className="shrink-0" />
                    <p className="text-[9px] leading-relaxed font-medium">
                      The deposit acts as a security hold. Once confirmed, an automated ticket will be sent to the Admiralty board for immediate processing.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => setPaymentMode(null)} variant="ghost" className="flex-1">Cancel</Button>
                    <Button onClick={handleDepositPayment} className="flex-[2] bg-[#003566] hover:bg-blue-900 text-white font-bold uppercase tracking-widest text-[10px]">
                      Confirm & Pay
                    </Button>
                  </div>
                </div>
              )}

              {paymentStatus === "processing" && (
                <div className="py-20 text-center flex flex-col items-center">
                   <div className="w-10 h-10 border-4 border-blue-100 border-t-[#003566] rounded-full animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Processing via Mollie Gateway...</p>
                </div>
              )}

              {paymentStatus === "success" && (
                <div className="py-12 text-center">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} />
                   </div>
                   <h3 className="text-xl font-serif mb-2 text-[#003566]">Success</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminal ticket has been generated.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}