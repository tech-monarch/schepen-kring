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
}

const API_BASE = "https://schepen-kring.nl/api/v1";
const dummyDealsForWebshops = [
  {
    id: "w1",
    name: "Bol.com",
    logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    cashback: "Tot 5%",
    category: "General",
    type: "webshop",
    description: "De winkel van ons allemaal met miljoenen artikelen.",
    long_description:
      "Bol.com is de grootste webwinkel van Nederland en België met een assortiment van boeken tot elektronica.",
    url: "https://www.bol.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w2",
    name: "Coolblue",
    logo: "https://images.unsplash.com/photo-1498049794561-7780e7231661",
    cashback: "2.5% Reward",
    category: "Electronics",
    type: "webshop",
    description: "Alles voor een glimlach en specialist in elektronica.",
    long_description:
      "Coolblue staat bekend om de beste klantenservice en een groot aanbod aan consumentenelektronica.",
    url: "https://www.coolblue.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w3",
    name: "Albert Heijn",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    cashback: "€5.00 Korting",
    category: "Groceries",
    type: "webshop",
    description: "De grootste supermarkt van Nederland nu ook online.",
    long_description:
      "Bestel je dagelijkse boodschappen eenvoudig online bij Albert Heijn en laat ze thuisbezorgen.",
    url: "https://www.ah.nl",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "w50",
    name: "Body & Fit",
    logo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    cashback: "6% Reward",
    category: "Wellness",
    type: "webshop",
    description: "Alles voor je sportieve doelen.",
    long_description:
      "Marktleider in sportvoeding, supplementen en fitnessaccessoires.",
    url: "https://www.bodyandfit.com",
    available_days: ["1", "2", "3", "4", "5", "6", "7"],
  },
];

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

  // 2. Ensure the fetch function updates that state
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', sans-serif; 
            background: #f8fafc; 
            display: flex; 
            justify-content: center; 
            padding: 40px 20px;
          }
          
          .ticket { 
            background: white; 
            width: 100%; 
            max-width: 420px; 
            border-radius: 40px; 
            overflow: hidden; 
            box-shadow: 0 40px 80px -20px rgba(0,0,0,0.08);
            border: 1px solid #f1f5f9;
          }

          /* Header matching your Webshop Card style */
          .header { 
            background: white;
            padding: 40px 32px; 
            text-align: center;
            border-bottom: 2px dashed #f1f5f9;
            position: relative;
          }
          
          .brand-logo {
            width: 48px;
            height: 48px;
            background: #eff6ff;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
          }

          .brand-logo svg { color: #2563eb; }

          .header h1 { 
            font-size: 22px; 
            font-weight: 900; 
            color: #0f172a;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }

          .category-tag {
            font-size: 10px;
            font-weight: 900;
            color: #3b82f6;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 8px;
            display: block;
          }

          .content { 
            padding: 32px; 
            position: relative; 
          }

          /* The Ticket Notches */
          .notch {
            position: absolute;
            top: -12px;
            width: 24px;
            height: 24px;
            background: #f8fafc;
            border-radius: 50%;
            border: 1px solid #f1f5f9;
          }
          .notch-l { left: -13px; }
          .notch-r { right: -13px; }

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
          }

          .label { 
            font-size: 10px; 
            font-weight: 800; 
            color: #94a3b8; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          
          .value { 
            font-size: 14px; 
            font-weight: 700; 
            color: #1e293b;
          }

          .price-value {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
          }

          .status-badge {
            background: #0f172a;
            color: white;
            padding: 6px 14px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .footer { 
            background: #f8fafc; 
            padding: 32px; 
            text-align: center;
            border-top: 1px solid #f1f5f9;
          }

          .qr-code {
            width: 100px;
            height: 100px;
            background: white;
            margin: 0 auto 20px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
          }

          .footer-brand {
            font-weight: 900;
            font-size: 14px;
            color: #0f172a;
          }

          .footer-sub {
            font-size: 10px;
            color: #94a3b8;
            font-weight: 600;
            margin-top: 4px;
          }

          @media print {
            body { background: white !important; padding: 0; }
            .ticket { box-shadow: none !important; border: 1px solid #f1f5f9; }
            .notch { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h1>${deal.deal_name}</h1>
            <span class="category-tag">Official Member Deal</span>
          </div>

          <div class="content">
            <div class="notch notch-l"></div>
            <div class="notch notch-r"></div>

            <div class="info-row">
              <div>
                <p class="label">Customer</p>
                <p class="value">${deal.customer_email}</p>
              </div>
              <div style="text-align: right">
                <p class="label">Booking Date</p>
                <p class="value">${new Date(deal.booking_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>

            <div class="info-row" style="margin-bottom: 0; align-items: flex-end;">
              <div>
                <p class="label">Total Price</p>
                <p class="price-value">€${deal.price || deal.deal_price || "0.00"}</p>
              </div>
              <div style="text-align: right">
                <p class="label" style="margin-bottom: 8px;">Status</p>
                <span class="status-badge">${deal.status}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="qr-code">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="1.5">
                <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM14 14h3v3h-3zM17 17h4v4h-4zM14 17h3v4h-3zM17 14h4v3h-4z" />
              </svg>
            </div>
            <p class="footer-brand">Answer24</p>
            <p class="footer-sub">Voucher ID: #A24-${deal.id}</p>
          </div>
        </div>

        <script>
          window.onload = function() { 
            setTimeout(() => {
              window.print(); 
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  // Add this useEffect to fetch personal deals when the "requested" tab is active
  // useEffect(() => {
  //   if (activeMainTab === "requested") {
  //     const fetchPersonalDeals = async () => {
  //       try {
  //         const response = await fetch(`${API_BASE}/requested-deals`, {
  //           headers: {
  //             // FIX: Ensure this key matches your LocalStorage key 'auth_token'
  //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  //         'Accept': 'application/json'
  //           }
  //         });
  //         const result = await response.json();
  //         if (result.success) setRequestedDeals(result.data);
  //       } catch (err) {
  //         console.error("Error fetching personal deals:", err);
  //       }
  //     };
  //     fetchPersonalDeals();
  //   }
  // }, [activeMainTab]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === "#webshop" || hash === "#webshops")
        setActiveMainTab("webshops");
      else if (hash === "#deals") setActiveMainTab("deals");
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
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
    const baseList =
      activeMainTab === "webshops" ? dummyDealsForWebshops : deals;
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader />
      {/*  <ChatWidget /> */}
      {/* --- PROFESSIONAL BLUE HEADER --- */}
      {/* Hero Section */}
      <div className="bg-blue-600 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* FEATURE 2: Dynamic Heading based on Tab */}
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              {activeMainTab === "webshops"
                ? "Bespaar bij je favoriete winkels"
                : "Ontdek exclusieve deals"}
            </h1>

            {/* FEATURE 2: Dynamic Description based on Tab */}
            <p className="text-blue-100 text-base mb-6 max-w-2xl mx-auto">
              {activeMainTab === "webshops"
                ? "Ontdek exclusieve aanbiedingen en verdien direct cashback bij honderden Nederlandse webshops."
                : "Bekijk je gereserveerde deals en profiteer van exclusieve member voordelen bij onze partners."}
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                /* FEATURE 2: Dynamic Placeholder based on Tab */
                placeholder={
                  activeMainTab === "webshops"
                    ? "Zoek naar een winkel of deal..."
                    : "Zoek naar een specifieke deal..."
                }
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white shadow-xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 pb-32">
        {/* CATEGORY & TAB NAVIGATION */}
        {/* FEATURE 4: Only visible if NOT on #webshop */}
        {activeMainTab !== "webshops" && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/20">
              {/* FEATURE 1: Button to View Deals */}
              <button
                onClick={() => setActiveMainTab("deals")}
                className={`px-10 py-3.5 rounded-xl font-black text-sm transition-all capitalize ${
                  activeMainTab === "deals"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                view deals
              </button>

              {/* FEATURE 1 & 3: Button to View Requested Deals */}
              <button
                onClick={() => setActiveMainTab("requested")}
                className={`px-10 py-3.5 rounded-xl font-black text-sm transition-all capitalize ${
                  activeMainTab === "requested"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                view requested deals
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all border ${
                    activeCategory === cat.id
                      ? "bg-white text-blue-600 border-blue-600 shadow-md"
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <cat.icon className="w-4 h-4" /> {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        {/* FEATURE 3: Toggle between Grid and Requested Deals View */}
        {activeMainTab === "requested" ? (
          /* REQUESTED DEALS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requestedDeals.length > 0 ? (
              requestedDeals.map((deal: RequestedDeal) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden">
                      {deal.deal_image ? (
                        <img
                          src={deal.deal_image}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-[1000] text-slate-900 leading-tight mb-1">
                        {deal.deal_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold">
                        {new Date(deal.booking_date).toLocaleDateString(
                          "nl-NL",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-bold truncate">
                        {deal.customer_email}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => {
                        setSelectedItem(deal);
                        setPaymentStep(3);
                      }}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-3.5 h-3.5" /> View Ticket
                    </button>
                    <button
                      onClick={() => handleDownloadTicket(deal)}
                      className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              /* EMPTY STATE IF NO DEALS FOUND */
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Geen aanvragen gevonden
                </h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">
                  Je hebt op dit moment nog geen actieve deal aanvragen.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD GRID CARDS WITH AVAILABILITY */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layoutId={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setPaymentStep(1);
                }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image_url || item.logo}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-slate-500 font-medium mb-6 line-clamp-2 text-sm">
                    {item.description}
                  </p>

                  {/* AVAILABLE DAYS ON CARD */}
                  <div className="mb-8 pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      Availability
                    </p>
                    <div className="flex gap-1.5">
                      {["1", "2", "3", "4", "5", "6", "7"].map((dayNum) => {
                        const isActive = item.available_days?.includes(dayNum);
                        const dayLabels: Record<string, string> = {
                          "1": "M",
                          "2": "T",
                          "3": "W",
                          "4": "T",
                          "5": "F",
                          "6": "S",
                          "7": "S",
                        };
                        return (
                          <div
                            key={dayNum}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black transition-colors ${isActive ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-300 border border-slate-100"}`}
                          >
                            {dayLabels[dayNum]}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        {item.type === "webshop" ? "Cashback" : "Member Deal"}
                      </span>
                      <span className="text-2xl font-[1000] text-slate-900">
                        {item.type === "webshop"
                          ? item.cashback
                          : `€${item.deal_price}`}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all group-hover:rotate-12">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* --- ORIGINAL FULL-PAGE POPUP (LOGIC PRESERVED) --- */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          >
            <div className="min-h-screen flex flex-col relative">
              <div className="fixed top-6 right-6 z-[110]">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-4 bg-gray-900/10 backdrop-blur-md rounded-full hover:bg-gray-900/20 transition-all"
                >
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </div>

              <div className="relative h-[55vh] bg-slate-100">
                <img
                  src={selectedItem.image_url || selectedItem.logo}
                  className="w-full h-full object-cover"
                  alt="Header"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-12 flex flex-col justify-end">
                  <div className="max-w-7xl mx-auto w-full">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">
                      {selectedItem.category}
                    </span>
                    <h3 className="text-5xl md:text-7xl font-[1000] text-white tracking-tighter">
                      {selectedItem.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-32">
                <div className="lg:col-span-2 space-y-12">
                  <section>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px]">
                        01
                      </div>
                      Detailed Information
                    </h4>
                    <div className="text-slate-600 leading-[1.8] text-xl font-medium whitespace-pre-line bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                      {selectedItem.long_description ||
                        selectedItem.description}
                    </div>
                  </section>
                </div>

                {/* --- SIDEBAR (EXACT LOGIC FROM USER) --- */}
                <div className="lg:sticky lg:top-10 h-fit space-y-6">
                  {selectedItem.type === "webshop" ? (
                    <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-200 space-y-6">
                      <h3 className="text-3xl font-black">Go to Shop</h3>
                      <p className="text-blue-100 font-medium text-sm opacity-90 leading-relaxed">
                        Proceed to the merchant's domain to initiate your
                        transaction and secure your cashback allocation.
                      </p>
                      <a
                        href={selectedItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 group transition-all active:scale-95"
                      >
                        Visit Website{" "}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-7 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                          Weekly Availability
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                          {["1", "2", "3", "4", "5", "6", "7"].map((dayNum) => {
                            const isActive =
                              selectedItem.available_days?.includes(dayNum);
                            const dayLabels: any = {
                              "1": "M",
                              "2": "T",
                              "3": "W",
                              "4": "T",
                              "5": "F",
                              "6": "S",
                              "7": "S",
                            };
                            return (
                              <div
                                key={dayNum}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-[1000] ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-slate-50 text-slate-300"}`}
                              >
                                {dayLabels[dayNum]}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
                        {paymentStep === 1 && (
                          <div className="space-y-6">
                            <h3 className="text-3xl font-[1000]">
                              Reserveer Nu
                            </h3>
                            <div className="space-y-4">
                              <div className="bg-white/10 rounded-[1.5rem] p-5 border border-white/10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-2 opacity-80">
                                  Email Address
                                </label>
                                <div className="flex items-center gap-3">
                                  <Mail className="w-5 h-5 text-blue-300" />
                                  <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/30 font-bold"
                                    value={customerEmail}
                                    onChange={(e) =>
                                      setCustomerEmail(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div className="bg-white/10 rounded-[1.5rem] p-5 border border-white/10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-2 opacity-80">
                                  Number of Guests
                                </label>
                                <div className="flex items-center gap-3">
                                  <Users className="w-5 h-5 text-blue-300" />
                                  <input
                                    type="number"
                                    min="1"
                                    className="bg-transparent border-none outline-none text-white w-full font-bold"
                                    value={peopleCount}
                                    onChange={(e) =>
                                      setPeopleCount(parseInt(e.target.value))
                                    }
                                  />
                                </div>
                              </div>
                              <div className="bg-white/10 rounded-[1.5rem] p-5 border border-white/10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-2 opacity-80">
                                  Select Date & Time
                                </label>
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-blue-300" />
                                  <input
                                    type="datetime-local"
                                    className="bg-transparent border-none outline-none text-white w-full font-bold [color-scheme:dark]"
                                    value={bookingDate}
                                    onChange={(e) =>
                                      setBookingDate(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setPaymentStep(2)}
                              disabled={!customerEmail || !bookingDate}
                              className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all active:scale-95"
                            >
                              Review Booking{" "}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}

                        {paymentStep === 2 && (
                          <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
                            <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/10 text-left space-y-4">
                              <div>
                                <p className="text-blue-100 text-[10px] uppercase font-black mb-1 opacity-70">
                                  Booking for
                                </p>
                                <p className="text-white font-bold">
                                  {customerEmail}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-100 text-[10px] uppercase font-black mb-1 opacity-70">
                                  Party Size
                                </p>
                                <p className="text-white font-bold">
                                  {peopleCount}{" "}
                                  {peopleCount === 1 ? "Person" : "Guests"}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-100 text-[10px] uppercase font-black mb-1 opacity-70">
                                  Appointment
                                </p>
                                <p className="text-white font-bold">
                                  {bookingDate
                                    ? new Date(bookingDate).toLocaleString([], {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Not set"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleBookDeal}
                              className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center mb-5 transition-all active:scale-95"
                            >
                              {isProcessing ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                "Confirm & Send Ticket"
                              )}
                            </button>
                            <button
                              onClick={() => setPaymentStep(1)}
                              className="text-[10px] font-black opacity-60 hover:opacity-100 uppercase tracking-[0.2em] text-white"
                            >
                              Go Back
                            </button>
                          </div>
                        )}

                        {paymentStep === 3 && (
                          <div className="py-4">
                            {/* Ticket Header */}
                            <div className="text-center mb-8">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/10">
                                <Check className="w-8 h-8 text-white" />
                              </div>
                              <h4 className="text-2xl font-[1000] text-white tracking-tight">
                                Booking Confirmed
                              </h4>
                              <p className="text-blue-100 text-xs opacity-70 uppercase tracking-widest font-bold mt-1">
                                Ticket ID: #RD-
                                {selectedItem.id.toString().slice(-5)}
                              </p>
                            </div>

                            {/* The Ticket Body */}
                            <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-2xl relative overflow-hidden">
                              {/* Decorative Ticket Notches */}
                              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full" />
                              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full" />

                              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dashed border-slate-200">
                                <img
                                  src={
                                    selectedItem.deal_image ||
                                    selectedItem.logo ||
                                    selectedItem.image_url
                                  }
                                  className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                  alt=""
                                />
                                <div>
                                  <h5 className="font-black text-lg leading-tight">
                                    {selectedItem.deal_name ||
                                      selectedItem.name}
                                  </h5>
                                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                    {selectedItem.category || "Member Deal"}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Date
                                  </p>
                                  <p className="text-sm font-black text-slate-800">
                                    {new Date(
                                      selectedItem.booking_date || bookingDate,
                                    ).toLocaleDateString("nl-NL", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Guests
                                  </p>
                                  <p className="text-sm font-black text-slate-800">
                                    {selectedItem.people_count || peopleCount}{" "}
                                    Persons
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Total Price
                                  </p>
                                  <p className="text-sm font-black text-blue-600">
                                    €
                                    {selectedItem.price ||
                                      selectedItem.deal_price ||
                                      "0.00"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Status
                                  </p>
                                  <p className="text-sm font-black text-green-500 uppercase">
                                    {selectedItem.status || "Active"}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                                <div className="flex items-center gap-3">
                                  <Mail className="w-4 h-4 text-slate-400" />
                                  <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">
                                    {selectedItem.customer_email ||
                                      customerEmail}
                                  </span>
                                </div>
                                <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                  <span className="text-[10px] font-black">
                                    VALID
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 space-y-3">
                              <button
                                onClick={() =>
                                  handleDownloadTicket(selectedItem)
                                }
                                className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 hover:bg-blue-50"
                              >
                                <Download className="w-4 h-4" /> Download PDF
                                Voucher
                              </button>
                              <button
                                onClick={() => setSelectedItem(null)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-sm transition-all"
                              >
                                Close Ticket
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
