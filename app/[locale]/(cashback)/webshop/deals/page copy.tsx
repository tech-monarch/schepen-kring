"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Tag,
  ShoppingBag,
  X,
  Check,
  Loader2,
  Mail,
  ArrowRight,
  Users,
  Sparkles,
  Calendar,
  Globe,
  Bell,
  Download,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Info,
  ArrowLeft,
} from "lucide-react";
import Footer from "@/components/(webshop)/Footer";
import { toast } from "react-toastify";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import ChatWidget from "@/components/common/ChatWidget";
import { motion, AnimatePresence } from "framer-motion";
interface RequestedDeal {
  id: number | string;
  deal_name: string;
  deal_image: string | null;
  status: string;
  booking_date: string;
  customer_email: string;
  price?: string | number;
  deal_price?: string | number;
  people_count?: string | number;
}

const API_BASE = "https://schepen-kring.nl/api/v1";

const categories = [
  { id: "all", name: "All", icon: ShoppingBag },
  { id: "General", name: "General", icon: ShoppingBag },
  { id: "Electronics", name: "Electronics", icon: Sparkles },
  { id: "Fashion", name: "Fashion", icon: Tag },
  { id: "Travel", name: "Travel", icon: Globe },
];

export default function WebshopPage() {
  const [activeMainTab, setActiveMainTab] = useState("webshops");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // POPUP STATE
  const [paymentStep, setPaymentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // 1. Ensure state is initialized correctly
  const [requestedDeals, setRequestedDeals] = useState<RequestedDeal[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);
  // 2. Ensure the fetch function updates that state

  // 1. URL Handler for individual deals
  const handleCardClick = (item: any) => {
    // Create a URL-friendly slug from the deal name
    const slug = item.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    window.location.hash = `deals/${item.id}/${slug}`;

    setSelectedItem(item);
    setPaymentStep(1);
    setCurrentImageIndex(0);
  };

  // 2. Deep Linking Effect: Opens deal if URL contains a hash on load
  useEffect(() => {
    const checkUrlForDeal = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#deals/")) {
        const parts = hash.split("/");
        const dealId = parts[1];
        // Search in current deals list
        const foundDeal = deals.find((d: any) => d.id.toString() === dealId);
        if (foundDeal) {
          setSelectedItem(foundDeal);
          setPaymentStep(1);
        }
      }
    };

    if (deals.length > 0) checkUrlForDeal();
  }, [deals]);

  // 3. Copy Deal Link functionality
  const copyDealLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link gekopieerd!");
  };

  useEffect(() => {
    const fetchPersonalDeals = async () => {
      try {
        const token = localStorage.getItem("auth_token"); // Make sure this matches your localStorage key
        const res = await fetch(`${API_BASE}/requested-deals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const result = await res.json();

        if (result.success) {
          setRequestedDeals(result.data); // This fills the variable
          console.log("Deals loaded into state:", result.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (activeMainTab === "requested") {
      fetchPersonalDeals();
    }
  }, [activeMainTab]);

  const handleDownloadTicket = (deal: RequestedDeal) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>Schepenkring.nlVoucher - ${deal.deal_name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background: #ffffff; 
            display: flex; 
            justify-content: center; 
            padding: 40px;
            color: #1e293b;
          }
          
          .voucher { 
            width: 100%; 
            max-width: 450px; 
            border: 1.5px solid #f1f5f9;
            border-radius: 40px; 
            position: relative;
            background: #ffffff;
          }

          /* Premium Top Section */
          .header { 
            padding: 48px 40px; 
            text-align: left;
            border-bottom: 2px dashed #f1f5f9;
          }
          
          .merchant-logo {
            width: 64px;
            height: 64px;
            border-radius: 20px;
            object-fit: cover;
            margin-bottom: 24px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.05);
          }

          .header h1 { 
            font-size: 28px; 
            font-weight: 800; 
            color: #0f172a;
            letter-spacing: -0.04em;
            line-height: 1;
            margin-bottom: 8px;
          }

          .deal-summary {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }

          /* Details Section */
          .section { padding: 40px; }
          
          .section-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #94a3b8;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #f1f5f9;
          }

          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .data-item { margin-bottom: 8px; }
          
          .label { 
            font-size: 10px; 
            font-weight: 700; 
            color: #94a3b8; 
            text-transform: uppercase; 
            margin-bottom: 4px;
          }
          
          .value { 
            font-size: 14px; 
            font-weight: 600; 
            color: #334155;
          }

          /* Highlights / Instructions */
          .terms-box {
            background: #f8fafc;
            border-radius: 24px;
            padding: 20px;
            margin-top: 32px;
          }

          .term-item {
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 8px;
            display: flex;
            gap: 8px;
          }

          /* Dynamic Price Bar */
          .price-bar {
            background: #0f172a;
            margin: 40px;
            padding: 24px;
            border-radius: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
          }

          .price-label { font-size: 11px; font-weight: 700; opacity: 0.6; text-transform: uppercase; }
          .price-amount { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }

          /* Footer / QR */
          .footer { 
            padding: 0 40px 48px; 
            text-align: center;
          }

          .qr-container {
            border: 1px solid #f1f5f9;
            padding: 12px;
            border-radius: 24px;
            display: inline-block;
            margin-bottom: 20px;
          }

          .id-text {
            font-family: 'Monaco', monospace;
            font-size: 11px;
            color: #94a3b8;
            background: #f8fafc;
            padding: 6px 12px;
            border-radius: 8px;
          }

          @media print {
            body { padding: 0; }
            .voucher { border: 1px solid #f1f5f9; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="voucher">
          <div class="header">
            <img src="${deal.deal_image || "https://schepen-kring.nl/placeholder.png"}" class="merchant-logo" alt="Logo">
            <h1>${deal.deal_name}</h1>
            <p class="deal-summary">Reservation Confirmation & Voucher</p>
          </div>

          <div class="section">
            <h2 class="section-title">Booking Details</h2>
            <div class="details-grid">
              <div class="data-item">
                <p class="label">Customer</p>
                <p class="value">${deal.customer_email}</p>
              </div>
              <div class="data-item" style="text-align: right">
                <p class="label">Arrival Date</p>
                <p class="value">${new Date(deal.booking_date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div class="data-item">
                <p class="label">Guests</p>
                <p class="value">${deal.people_count || "1"} Person(s)</p>
              </div>
              <div class="data-item" style="text-align: right">
                <p class="label">Reference</p>
                <p class="value">A24-${deal.id.toString().slice(-4).toUpperCase()}</p>
              </div>
            </div>

            <div class="terms-box">
              <div class="term-item">
                <span>•</span>
                <span>Please present this voucher upon arrival at the venue.</span>
              </div>
              <div class="term-item">
                <span>•</span>
                <span>Valid only for the specified date and guest count.</span>
              </div>
            </div>
          </div>

          <div class="price-bar">
            <div>
              <p class="price-label">Total Amount</p>
              <p class="price-amount">€${deal.price || deal.deal_price || "0.00"}</p>
            </div>
            <div style="text-align: right">
              <p class="price-label">Status</p>
              <p style="font-size: 12px; font-weight: 900; color: #4ade80;">CONFIRMED</p>
            </div>
          </div>

          <div class="footer">
            <div class="qr-container">
               <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.5">
                <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM14 14h3v3h-3zM17 17h4v4h-4zM14 17h3v4h-3zM17 14h4v3h-4z" />
              </svg>
            </div>
            <br/>
            <span class="id-text">VOUCHER ID: #A24-${deal.id}</span>
          </div>
        </div>

        <script>
          window.onload = function() { 
            setTimeout(() => {
              window.print(); 
              window.close();
            }, 600);
          };
        </script>
      </body>
    </html>
`);
    printWindow.document.close();
  };

  const handleCopyLink = (dealId: string | number) => {
    // Generates a link based on the current origin and the deal ID hash
    const shareUrl = `${window.location.origin}${window.location.pathname}#deal-${dealId}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link.");
      });
  };

  const getNextMonthDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      let dayNum = d.getDay();
      if (dayNum === 0) dayNum = 7;
      dates.push({
        fullDate: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isAvailable: selectedItem?.available_days?.includes(dayNum.toString()),
      });
    }
    return dates;
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    // Generate next 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      // Convert JS day (0-6, Sun-Sat) to your format (1-7, Mon-Sun)
      let dayNum = d.getDay();
      if (dayNum === 0) dayNum = 7; // Sunday is 7

      dates.push({
        fullDate: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        dayId: dayNum.toString(),
        isAvailable: selectedItem?.available_days?.includes(dayNum.toString()),
      });
    }
    return dates;
  };

  const getFutureDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      // Normalize JS day (0-Sun) to your data format (7-Sun)
      let dayNum = d.getDay();
      if (dayNum === 0) dayNum = 7;

      const dateString = d.toISOString().split("T")[0];

      dates.push({
        fullDate: dateString,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isAvailable: selectedItem?.available_days?.includes(dayNum.toString()),
      });
    }
    return dates;
  };
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;

      // Change the state
      if (hash === "#webshop" || hash === "#webshops") {
        setActiveMainTab("webshops");
      } else if (hash === "#deals") {
        setActiveMainTab("deals");
      }

      // This triggers the "Full Page Refresh" effect
      setPageKey((prev) => prev + 1);
    };

    window.addEventListener("hashchange", handleHash);
    handleHash(); // Run on initial load

    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(`${API_BASE}/merchant/deals`);
        const result = await response.json();
        if (result.success) setDeals(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const filteredItems = useMemo(() => {
    // If we are in "requested" mode, we still filter deals to avoid crash,
    // though they aren't displayed in the grid.
    const baseList = activeMainTab === "requested" ? [] : deals;
    return baseList.filter((item: any) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeMainTab, deals, searchQuery, activeCategory]);

  const handleBookDeal = async () => {
    setIsProcessing(true);

    const payload = {
      deal_id: selectedItem.id,
      deal_name: selectedItem.name,
      deal_image: selectedItem.image_url || selectedItem.logo,
      customer_email: customerEmail,
      people_count: peopleCount,
      booking_date: bookingDate,
      price: selectedItem.deal_price || selectedItem.cashback,
    };

    try {
      const res = await fetch(`${API_BASE}/requested-deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Critical fix: using 'auth_token' from your localStorage
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPaymentStep(3);
        toast.success("Booking Request Sent!");
      }
    } catch (error) {
      toast.error("Booking failed.");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div
      key={typeof window !== "undefined" ? window.location.hash : "main"}
      className="min-h-screen bg-[#F8FAFC]"
    >
      <DashboardHeader />
      {/* <ChatWidget /> */}
      {/* --- HERO SECTION (Social Deal Search Style) --- */}
      <div className="bg-blue-600 pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-[1000] text-white mb-6 tracking-tight">
              Ontdek Eindhoven
            </h1>
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Zoek een restaurant, hotel of uitje..."
                className="w-full pl-14 pr-4 py-5 rounded-[2rem] bg-white shadow-2xl outline-none text-gray-800 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-32">
        {/* CATEGORY & TAB NAV */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-lg self-center md:self-start">
            <button
              onClick={() => {
                window.location.hash = "deals";
                setActiveMainTab("deals");
              }}
              className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeMainTab === "deals" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
            >
              Hot Deals
            </button>
            <button
              onClick={() => setActiveMainTab("requested")}
              className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeMainTab === "requested" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
            >
              My Vouchers
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-tighter whitespace-nowrap transition-all border-2 ${activeCategory === cat.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-transparent shadow-sm hover:border-slate-200"}`}
              >
                <cat.icon className="w-3.5 h-3.5" /> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {activeMainTab === "requested" ? (
          /* REQUESTED DEALS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requestedDeals.map((deal: RequestedDeal) => (
              <motion.div
                key={deal.id}
                className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"
              >
                {/* ... Your existing requested deal card logic ... */}
              </motion.div>
            ))}
          </div>
        ) : (
          /* STANDARD GRID CARDS (Social Deal Style) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map((item: any) => (
              <motion.div
                key={item.id}
                layoutId={item.id}
                onClick={() => handleCardClick(item)}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image_url || item.logo}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-blue-600 shadow-sm">
                    -{Math.round(Math.random() * 20 + 30)}% Korting
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {item.category} • Eindhoven
                  </p>
                  <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-1">
                    {item.name}
                  </h3>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-slate-300 line-through text-xs font-bold block">
                        €{(item.deal_price * 1.6).toFixed(2)}
                      </span>
                      <span className="text-3xl font-[1000] text-slate-900">
                        €{item.deal_price}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-lg shadow-blue-100">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* --- SOCIAL DEAL STYLE POPUP --- */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          >
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-[120] bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-900 bg-slate-100 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Terug naar overzicht
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={copyDealLink}
                    className="p-3 bg-slate-50 rounded-full hover:text-blue-600 transition-all"
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-3 bg-slate-50 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto md:px-6 pb-32">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
                {/* LEFT COLUMN: Media & Content */}
                <div className="lg:col-span-2 space-y-10 px-6 md:px-0">
                  <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-slate-100 shadow-2xl">
                    <img
                      src={selectedItem.image_url || selectedItem.logo}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                        Populair in Eindhoven
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span className="text-slate-900 font-black text-xs">
                          4.9 (500+ reviews)
                        </span>
                      </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-[1000] text-slate-900 leading-tight tracking-tighter">
                      {selectedItem.name}
                    </h1>
                    <p className="flex items-center gap-2 text-slate-500 font-bold">
                      <MapPin className="w-4 h-4" /> Eindhoven Center
                    </p>
                  </div>

                  {/* Highlights Card (Core Social Deal UX) */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full" />{" "}
                      Highlights
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        "Exclusief 3-gangen keuzediner",
                        "Sfeervolle locatie",
                        "Geldig op alle dagen",
                        "Vers bereide gerechten",
                      ].map((h, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <span className="text-slate-600 font-bold leading-tight">
                            {h}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl font-black">Over deze deal</h2>
                    <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-line font-medium">
                      {selectedItem.long_description ||
                        selectedItem.description}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Sticky Booking Card */}
                <div className="px-6 md:px-0 lg:relative">
                  <div className="lg:sticky lg:top-28 space-y-6">
                    <div className="bg-white rounded-[3rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100">
                      <div className="flex justify-between items-end mb-8">
                        <div>
                          <span className="text-slate-300 line-through text-sm font-bold block">
                            €{(selectedItem.deal_price * 1.6).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-5xl font-[1000] text-slate-900 tracking-tighter">
                              €{selectedItem.deal_price}
                            </span>
                            <span className="bg-green-500 text-white px-3 py-1 rounded-xl text-xs font-black">
                              -39%
                            </span>
                          </div>
                        </div>
                      </div>

                      {paymentStep === 1 ? (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 focus-within:border-blue-500 transition-all">
                              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                placeholder="naam@mail.nl"
                                className="bg-transparent w-full outline-none font-bold text-slate-900"
                                value={customerEmail}
                                onChange={(e) =>
                                  setCustomerEmail(e.target.value)
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {/* Simplified Guests Selector */}
                              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                                  Personen
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  className="bg-transparent w-full outline-none font-bold text-slate-900"
                                  value={peopleCount}
                                  onChange={(e) =>
                                    setPeopleCount(parseInt(e.target.value))
                                  }
                                />
                              </div>
                              <button
                                onClick={() =>
                                  document
                                    .getElementById("cal")
                                    ?.scrollIntoView({ behavior: "smooth" })
                                }
                                className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left"
                              >
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                                  Datum
                                </label>
                                <span className="text-xs font-bold text-blue-600">
                                  {bookingDate || "Selecteer"}
                                </span>
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => setPaymentStep(2)}
                            disabled={!customerEmail || !bookingDate}
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:grayscale"
                          >
                            Nu kopen
                          </button>

                          <div
                            id="cal"
                            className="pt-4 border-t border-slate-100"
                          >
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-4">
                              Kies een datum
                            </p>
                            <div className="grid grid-cols-4 gap-2 h-48 overflow-y-auto no-scrollbar">
                              {getNextMonthDates().map((date) => (
                                <button
                                  key={date.fullDate}
                                  disabled={!date.isAvailable}
                                  onClick={() => setBookingDate(date.fullDate)}
                                  className={`p-3 rounded-xl flex flex-col items-center border-2 transition-all ${bookingDate === date.fullDate ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-400"}`}
                                >
                                  <span className="text-[8px] font-black uppercase">
                                    {date.dayName}
                                  </span>
                                  <span className="text-sm font-black">
                                    {date.dayNumber}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Final Review Step */
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 text-sm font-bold">
                            Totaal te betalen: €{selectedItem.deal_price}
                          </div>
                          <button
                            onClick={handleBookDeal}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg"
                          >
                            {isProcessing ? (
                              <Loader2 className="animate-spin mx-auto" />
                            ) : (
                              "Bevestig & Betaal"
                            )}
                          </button>
                          <button
                            onClick={() => setPaymentStep(1)}
                            className="w-full text-slate-400 font-bold text-sm"
                          >
                            Wijzig gegevens
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                      <h4 className="font-black text-xs uppercase tracking-widest mb-4">
                        Voorwaarden
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex gap-2 text-[11px] font-bold text-slate-500">
                          <Clock className="w-4 h-4 text-blue-500" /> Geldig tot
                          3 maanden na aankoop
                        </li>
                        <li className="flex gap-2 text-[11px] font-bold text-slate-500">
                          <Info className="w-4 h-4 text-blue-500" /> Vooraf
                          reserveren verplicht
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
