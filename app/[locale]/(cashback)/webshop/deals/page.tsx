"use client";

import { tokenUtils } from "@/utils/auth";
import React, { useEffect, useState, useMemo } from "react";
import { Search, Tag, ShoppingBag, X, Check, Loader2, Mail, ArrowRight, Users, Sparkles, Calendar, Globe, Bell, Download, Ticket, ChevronLeft, ChevronRight, Clock, Link, Heart } from "lucide-react";
import Footer from "@/components/(webshop)/Footer";
import { toast } from "react-toastify";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import ChatWidget from "@/components/common/ChatWidget";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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

const API_BASE = "https://api.answer24.nl/api/v1";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
// Inside your WebshopPage component
const [walletBalance, setWalletBalance] = useState<number>(0);
const router = useRouter();
// Inside WebshopPage component
const [favorites, setFavorites] = useState<number[]>([]); // Array of deal_ids

// 1. Fetch existing favorites on load
useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/user/favorites`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await response.json();
      if (result.success) {
        // Map the favorites to just an array of deal IDs for easy checking
        setFavorites(result.data.map((fav: any) => fav.deal_id));
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };
  fetchFavorites();
}, []);

useEffect(() => {
  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/wallet/balance`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance || 0);
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  fetchWallet();
}, [selectedItem]); // Refetch when a deal is opened to be sure
const toggleFavorite = async (e: React.MouseEvent, dealId: number) => {
  e.stopPropagation(); // Prevent opening the deal modal
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error("Log in om favorieten op te slaan.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/deals/${dealId}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      if (result.status === 'added') {
        setFavorites([...favorites, dealId]);
        toast.success("Opgeslagen in favorieten!");
      } else {
        setFavorites(favorites.filter(id => id !== dealId));
        toast.info("Verwijderd uit favorieten.");
      }
    }
  } catch (error) {
    toast.error("Er is iets misgegaan.");
  }
};

// 1. URL Handler for individual deals
const handleCardClick = (item: any) => {
  const slug = item.name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');

  // This will navigate to e.g., /deals/14/exclusieve-hotel-deal
  router.push(`/nl/webshop/deals/${item.id}/${slug}`);
};

// 2. Deep Linking Effect: Opens deal if URL contains a hash on load
useEffect(() => {
  const checkUrlForDeal = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#deals/')) {
      const parts = hash.split('/');
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
      const token = localStorage.getItem('auth_token'); // Make sure this matches your localStorage key
      const res = await fetch(`${API_BASE}/requested-deals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
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
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

printWindow.document.write(`
    <html>
      <head>
        <title>Answer24 Voucher - ${deal.deal_name}</title>
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
            <img src="${deal.deal_image || 'https://api.answer24.nl/placeholder.png'}" class="merchant-logo" alt="Logo">
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
                <p class="value">${new Date(deal.booking_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div class="data-item">
                <p class="label">Guests</p>
                <p class="value">${deal.people_count || '1'} Person(s)</p>
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
              <p class="price-amount">€${deal.price || deal.deal_price || '0.00'}</p>
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
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    toast.success("Link copied to clipboard!");
  }).catch(() => {
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
      fullDate: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isAvailable: selectedItem?.available_days?.includes(dayNum.toString())
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
      fullDate: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      dayId: dayNum.toString(),
      isAvailable: selectedItem?.available_days?.includes(dayNum.toString())
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
    
    const dateString = d.toISOString().split('T')[0];
    
    dates.push({
      fullDate: dateString,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isAvailable: selectedItem?.available_days?.includes(dayNum.toString())
    });
  }
  return dates;
};
  useEffect(() => {
  const handleHash = () => {
    const hash = window.location.hash;
    
    // Change the state
    if (hash === '#webshop' || hash === '#webshops') {
      setActiveMainTab("webshops");
    } else if (hash === '#deals') {
      setActiveMainTab("deals");
    }
    
    // This triggers the "Full Page Refresh" effect
    setPageKey(prev => prev + 1);
  };

  window.addEventListener('hashchange', handleHash);
  handleHash(); // Run on initial load

  return () => window.removeEventListener('hashchange', handleHash);
}, []);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(`${API_BASE}/merchant/deals`);
        const result = await response.json();
        if (result.success) setDeals(result.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDeals();
  }, []);

  const filteredItems = useMemo(() => {
    // If we are in "requested" mode, we still filter deals to avoid crash, 
    // though they aren't displayed in the grid.
    const baseList = activeMainTab === "requested" ? [] : deals;
    return baseList.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeMainTab, deals, searchQuery, activeCategory]);


  const handleCopyVoucherLink = (dealId: string | number) => {
  // Construct a URL to a specific voucher page
  // We will assume a route like /webshop/voucher/[id] exists or we use the current page with a special query param
  const voucherUrl = `${window.location.origin}/nl/webshop/deals/voucher/${dealId}`;
  
  navigator.clipboard.writeText(voucherUrl).then(() => {
    toast.success("Voucher link copied!", {
      icon: <Link className="text-blue-600" />,
      style: { borderRadius: '12px', fontWeight: 'bold' }
    });
  }).catch(() => {
    toast.error("Failed to copy link.");
  });
};



const handleBookDeal = async () => {
  // 1. Pre-checks: Ensure required data exists before starting the process
  if (!bookingDate) {
    toast.error("Selecteer a.u.b. een boekingsdatum.");
    return;
  }

  // Get current user from tokenUtils (or your auth state)
  const currentUser = tokenUtils.getUser();
  const userId = currentUser?.mainId || currentUser?.id;

  if (!userId) {
    toast.error("Gebruikerssessie niet gevonden. Log opnieuw in.");
    return;
  }

  const unitPrice = parseFloat(String(selectedItem.deal_price || 0));
  const totalToPay = unitPrice * (peopleCount || 1); 
  const currentBalance = parseFloat(String(walletBalance || 0));

  if (currentBalance < totalToPay) {
    toast.error(`Onvoldoende saldo. Totaal is €${totalToPay.toFixed(2)}.`);
    return;
  }

  setIsProcessing(true);
  
  try {
    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // STEP 1: Deduct from the Ledger API
    // We pass the actual database ID of the person buying the deal
    const deductRes = await fetch(`${API_URL}/admin/ledger/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId, 
        amount: -totalToPay, // Negative to subtract
        description: `Payment for deal: ${selectedItem.name || selectedItem.deal_name}`,
      }),
    });

    const deductData = await deductRes.json();

    if (!deductRes.ok) {
      console.error("Deduction Error Details:", deductData.errors);
      throw new Error(deductData.message || "Saldo afschrijving mislukt");
    }

    // STEP 2: Create the Booking (Requested Deal)
    // We map every field required by your RequestedDealController validation
    const payload = {
      deal_id: selectedItem.id,
      deal_name: selectedItem.name || selectedItem.deal_name || "Deal", // Backend requires this
      deal_image: selectedItem.image_url || selectedItem.logo || "",
      customer_email: customerEmail || currentUser.email, // Fallback to account email
      people_count: Number(peopleCount),
      booking_date: bookingDate, // Backend requires this
      price: Number(totalToPay.toFixed(2)),
      payment_method: 'wallet',
      status: 'pending'
    };

    const res = await fetch(`${API_URL}/requested-deals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // SUCCESS!
      setPaymentStep(3);
      // Update the local balance with the actual new balance from the server
      setWalletBalance(deductData.new_balance); 
      toast.success("Boeking succesvol betaald met wallet!");
    } else {
      const errorData = await res.json();
      console.error("Booking Table Error:", errorData.errors);
      // NOTE: At this point, money has been taken, but the record failed. 
      // You might want to add a reversal logic here later.
      toast.error("Saldo is afgeschreven, maar boeking kon niet worden opgeslagen. Neem contact op.");
    }
  } catch (error: any) {
    console.error("Critical Booking Error:", error);
    toast.error(error.message || "Er is een fout opgetreden tijdens het boeken.");
  } finally {
    setIsProcessing(false);
  }
};

return (
    <div key={typeof window !== 'undefined' ? window.location.hash : 'main'} className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader />
      <ChatWidget />

      {/* --- HERO SECTION --- */}
      <div className="bg-blue-600 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ontdek exclusieve deals
            </h1>
            <p className="text-blue-100 text-base mb-6 max-w-2xl mx-auto">
              Bekijk je gereserveerde deals en profiteer van exclusieve member voordelen bij onze partners.
            </p>

            <div className="max-w-lg mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Zoek naar een specifieke deal..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white shadow-xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 pb-32">
        {/* TAB NAVIGATION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/20">
            <button 
              onClick={() => {
                window.location.hash = "deals";
                setRefreshKey((prev: number) => prev + 1);
                setActiveMainTab("deals");
              }}
              className={`px-10 py-3.5 rounded-xl font-black text-sm transition-all capitalize ${activeMainTab === "deals" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              view deals
            </button>
            <button 
              onClick={() => setActiveMainTab("requested")}
              className={`px-10 py-3.5 rounded-xl font-black text-sm transition-all capitalize ${activeMainTab === "requested" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600"}`}
            >
              view requested deals
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat.id ? "bg-white text-blue-600 border-blue-600 shadow-md" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"}`}
              >
                <cat.icon className="w-4 h-4" /> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {activeMainTab === "requested" ? (
          /* REQUESTED DEALS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requestedDeals.length > 0 ? (
              requestedDeals.map((deal: RequestedDeal) => (
                <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden">
                      {deal.deal_image ? <img src={deal.deal_image} className="w-full h-full object-cover" alt="" /> : <ShoppingBag className="w-6 h-6 text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-[1000] text-slate-900 leading-tight mb-1">{deal.deal_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{deal.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                      <Calendar className="w-4 h-4" /> {new Date(deal.booking_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold truncate">
                      <Mail className="w-4 h-4" /> {deal.customer_email}
                    </div>
                  </div>
                  {/* <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
                    <button onClick={() => { setSelectedItem(deal); setPaymentStep(3); }} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                      <Ticket className="w-3.5 h-3.5" /> View Ticket
                    </button>
                    <button 
                      onClick={() => handleCopyLink(deal.id)}
                      className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all"
                      title="Copy Link"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDownloadTicket(deal)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div> */}
                  <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => handleCopyVoucherLink(selectedItem.id)}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
            >
              <Link className="w-3.5 h-3.5" /> Copy Deal Link
            </button>
          </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Bell className="w-8 h-8 text-slate-300" /></div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Geen aanvragen gevonden</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">Je hebt op dit moment nog geen actieve deal aanvragen.</p>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD GRID CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map((item: any) => (
              <motion.div key={item.id} layoutId={item.id} onClick={() => handleCardClick(item)}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all cursor-pointer">
                <div className="relative h-64 overflow-hidden">
                  {Array.isArray(item.images) && item.images.length > 1 ? (
                    <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 bg-slate-100">
                      {item.images.slice(0, 4).map((img: string, idx: number) => (
                        <img key={idx} src={img} className="w-full h-full object-cover" alt="" />
                      ))}
                    </div>
                  ) : (
                    <img src={item.image_url || item.logo} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                  <p className="text-slate-500 font-medium mb-6 line-clamp-2 text-sm">{item.description}</p>
                  
                  <div className="mb-8 pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Availability</p>
                    <div className="flex gap-1.5">
                      {["1", "2", "3", "4", "5", "6", "7"].map((dayNum) => {
                        const isActive = item.available_days?.includes(dayNum);
                        const dayLabels: Record<string, string> = { "1": "M", "2": "T", "3": "W", "4": "T", "5": "F", "6": "S", "7": "S" };
                        return (
                          <div key={dayNum} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black transition-colors ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                            {dayLabels[dayNum]}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-50">
{/* LEFT: PRICING SECTION */}
<div className="flex flex-col">
  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-1">
    Member Deal
  </span>
  
  {/* Container changed to flex-col to stack prices vertically */}
  <div className="flex flex-col gap-0">
    {/* Current Deal Price */}
    <div className="flex items-baseline gap-0.5">
      <span className="text-sm font-bold text-slate-900">€</span>
      <span className="text-3xl font-[1000] text-slate-900 tracking-tighter">
        {item.deal_price || '0.00'}
      </span>
    </div>

    {/* "Before" Price - Positioned below and colored light red */}
    {item.original_price && item.original_price !== item.deal_price && (
      <div className="flex items-baseline gap-0.5 line-through decoration-red-400/50 -mt-1">
        <span className="text-[10px] font-bold text-red-400/80">€</span>
        <span className="text-sm font-bold text-red-400/80">
          {item.original_price}
        </span>
      </div>
    )}
  </div>
</div>
{/* Heart/Favorite Button */}
  <button 
    onClick={(e) => toggleFavorite(e, item.id)}
    className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center transition-all border active:scale-95 ${
      favorites.includes(item.id) 
        ? 'bg-pink-50 border-pink-100 text-pink-500' 
        : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-pink-500 hover:border-pink-100'
    }`}
  >
    <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
  </button>

  {/* RIGHT: ACTION GROUP */}
  <div className="flex items-center gap-2.5">
    {/* Copy Button */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${item.id}`);
        toast.success("Link gekopieerd!");
      }} 
      className="w-11 h-11 bg-slate-50 text-slate-400 rounded-[1.2rem] flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all border border-slate-100 hover:border-blue-100 hover:shadow-md active:scale-95 group/copy"
      title="Kopieer Link"
    >
      <Link className="w-4 h-4 group-hover/copy:rotate-12 transition-transform" />
    </button>

    {/* Primary Action Button (Arrow) */}
    <div className="w-11 h-11 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center group-hover:bg-blue-600 transition-all group-hover:translate-x-1 shadow-lg shadow-slate-200 active:scale-95">
      <ArrowRight className="w-5 h-5" />
    </div>
  </div>
</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* --- POPUP --- */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-100 bg-white overflow-y-auto">
            <div className="min-h-screen flex flex-col relative">
              <div className="fixed top-6 right-6 z-110">
                <button onClick={() => setSelectedItem(null)} className="p-4 bg-gray-900/10 backdrop-blur-md rounded-full hover:bg-gray-900/20 transition-all">
                  <X className="w-6 h-6 text-slate-900" />
                </button>
              </div>

              <div className="relative h-[55vh] bg-slate-100 group">
                {Array.isArray(selectedItem.images) && selectedItem.images.length > 1 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img key={currentImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                        src={selectedItem.images[currentImageIndex]} className="w-full h-full object-cover" alt="Header" />
                    </AnimatePresence>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev: number) => prev === 0 ? selectedItem.images.length - 1 : prev - 1); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev: number) => (prev + 1) % selectedItem.images.length); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {selectedItem.images.map((_: any, i: number) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-8 bg-blue-600' : 'w-2 bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                ) : (
                  <img src={selectedItem.image_url || selectedItem.logo} className="w-full h-full object-cover" alt="Header" />
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent p-12 flex flex-col justify-end pointer-events-none">
                  <div className="max-w-7xl mx-auto w-full pointer-events-auto">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {selectedItem.category}
                      </span>
                      {/* COPY LINK BUTTON INSIDE MODAL */}
                      <button onClick={copyDealLink} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all">
                        <Tag className="w-3.5 h-3.5" /> Kopieer Link
                      </button>
                    </div>
                    <h3 className="text-5xl md:text-7xl font-[1000] text-white tracking-tighter">{selectedItem.name}</h3>
                  </div>
                </div>
              </div>
              
              <div className="max-w-7xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-32">
                <div className="lg:col-span-2 space-y-12">
                  <section>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px]">01</div> 
                      Detailed Information
                    </h4>
                    <div className="text-slate-600 leading-[1.8] text-xl font-medium whitespace-pre-line bg-slate-50/50 p-8 rounded-4xl border border-slate-100">
                      {selectedItem.long_description || selectedItem.description}
                    </div>
                  </section>
                </div>

                <div className="lg:sticky lg:top-10 h-fit space-y-6">
                    <div className="bg-white border-2 border-slate-100 rounded-4xl p-7 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Weekly Availability</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {["1", "2", "3", "4", "5", "6", "7"].map((dayNum) => {
                          const isActive = selectedItem.available_days?.includes(dayNum);
                          const dayLabels: any = { "1": "M", "2": "T", "3": "W", "4": "T", "5": "F", "6": "S", "7": "S" };
                          return (
                            <div key={dayNum} className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-[1000] ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-300'}`}>
                              {dayLabels[dayNum]}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
                      {paymentStep === 1 && (
                        <div className="space-y-6">
                          <h3 className="text-3xl font-[1000]">Reserveer Nu</h3>
{/* NEW PRICE BADGE - CENTERED */}
<div className="flex flex-col items-center justify-center py-2">
  <div className="flex items-baseline gap-2">
    {/* Bright Neon Green Deal Price */}
    <div className="flex items-baseline gap-0.5">
      <span className="text-sm font-black text-green-300 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">€</span>
      <span className="text-5xl font-[1000] text-green-300 tracking-tighter drop-shadow-[0_0_12px_rgba(74,222,128,0.6)]">
        {selectedItem.deal_price || '0.00'}
      </span>
    </div>

    {/* Small Red Original Price - Now Beside it */}
    {selectedItem.original_price && selectedItem.original_price !== selectedItem.deal_price && (
      <div className="flex items-baseline gap-0.5 line-through decoration-red-500/60 opacity-90">
        <span className="text-[10px] font-bold text-red-500">€</span>
        <span className="text-base font-bold text-red-500">
          {selectedItem.original_price}
        </span>
      </div>
    )}
  </div>
</div>
                          <div className="space-y-4">
                            <div className="bg-white/10 rounded-3xl p-5 border border-white/10">
                              <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-2 opacity-80">Email Address</label>
                              <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-300" />
                                <input type="email" placeholder="your@email.com" className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/30 font-bold" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                              </div>
                            </div>
                            <div className="bg-white/10 rounded-3xl p-5 border border-white/10">
                              <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-2 opacity-80">Number of Guests</label>
                              <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-300" />
                                <input type="number" min="1" className="bg-transparent border-none outline-none text-white w-full font-bold" value={peopleCount} onChange={(e) => setPeopleCount(parseInt(e.target.value))} />
                              </div>
                            </div>
<div className="space-y-4 mt-4">
  {/* Calendar Header */}
  <div className="flex items-center justify-between px-1">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/80">
      Availability Calendar
    </label>
    <div className="flex items-center gap-2">
       <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
       <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">30 Day View</span>
    </div>
  </div>

  {/* 7-Column Grid (Fits 30 days in ~4.5 rows) */}
  <div className="grid grid-cols-7 gap-1.5">
    {getNextMonthDates().map((date) => {
      const isSelected = bookingDate === date.fullDate; 

      return (
        <button 
          key={date.fullDate} 
          disabled={!date.isAvailable}
          onClick={() => setBookingDate(date.fullDate)}
          className={`
          group relative h-16 flex flex-col items-center justify-center rounded-xl transition-all duration-300 border
          ${isSelected 
            ? "bg-white border-white shadow-lg -translate-y-1 scale-105" 
            : date.isAvailable 
              ? "bg-white/5 border-white/10 hover:bg-white/20 hover:border-white/30 text-white" 
              // --- UPDATED UNAVAILABLE STYLE ---
              : "bg-white/[0.015] border-white/5 opacity-25 cursor-not-allowed" 
          }
          `}
        >
          {/* Day Name (Top) */}
          <span className={`text-[7px] font-black uppercase mb-0.5 tracking-tighter ${isSelected ? 'text-blue-400' : 'text-blue-300/40'}`}>
            {date.dayName}
          </span>

          {/* Day Number (Middle) */}
          <span className={`text-base font-black leading-none ${isSelected ? 'text-slate-900' : 'text-white'}`}>
            {date.dayNumber}
          </span>

          {/* Month (Bottom) - Only show if it's the 1st of the month or the first item */}
          <span className={`text-[6px] font-bold uppercase mt-0.5 ${isSelected ? 'text-slate-400' : 'text-white/20'}`}>
            {date.monthName}
          </span>

          {/* Selection Indicator Dot */}
          {isSelected && (
            <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
          )}
        </button>
      );
    })}
  </div>
</div>
                          </div>
                          <button onClick={() => setPaymentStep(2)} disabled={!customerEmail || !bookingDate} className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all active:scale-95">
                            Review Booking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                      
{paymentStep === 2 && (
  <div className="animate-in fade-in zoom-in-95 duration-500 text-center relative">
    {/* CONFIRMATION OVERLAY */}
    <AnimatePresence>
      {showConfirmModal && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-blue-600 rounded-3xl p-6 border-2 border-white/20 shadow-2xl"
        >
          <div className="bg-white/20 p-4 rounded-full mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Final Confirmation</h3>
          <p className="text-blue-100 text-sm mb-6">
            Are you sure you want to spend <span className="text-white font-bold">€{(selectedItem.deal_price * peopleCount).toFixed(2)}</span> from your wallet?
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="py-4 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setShowConfirmModal(false);
                handleBookDeal();
              }}
              className="py-4 rounded-xl font-black bg-green-400 text-blue-900 shadow-lg hover:bg-green-300 transition-all"
            >
              Yes, Pay
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/10 text-left space-y-4">
      <div><p className="text-blue-100 text-[10px] uppercase font-black mb-1 opacity-70">Booking for</p><p className="text-white font-bold">{customerEmail}</p></div>
      <div><p className="text-blue-100 text-[10px] uppercase font-black mb-1 opacity-70">Party Size</p><p className="text-white font-bold">{peopleCount} {peopleCount === 1 ? 'Person' : 'Guests'}</p></div>
      <div><p className="text-blue-100 text-[10px] uppercase font-black mb-1 opacity-70">Appointment</p><p className="text-white font-bold">{bookingDate ? new Date(bookingDate).toLocaleString([], { day: '2-digit', month: 'long', year: 'numeric' }) : "Not set"}</p></div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-blue-100 text-[10px] uppercase font-black mb-1 opacity-70">Payment Method: Wallet</p>
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-200 opacity-70">
            <span>Unit Price x {peopleCount}</span>
            <span>Total Cost</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white font-bold">€{(selectedItem.deal_price || 0)} x {peopleCount}</p>
            <p className="text-white font-[1000] text-xl">€{(selectedItem.deal_price * peopleCount).toFixed(2)}</p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <p className="text-blue-100 text-[10px] uppercase font-black opacity-70">Your Wallet Balance:</p>
            <p className={`font-black ${walletBalance < (selectedItem.deal_price * peopleCount) ? 'text-red-400' : 'text-green-400'}`}>
              € {walletBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>

    {walletBalance < (selectedItem.deal_price * peopleCount) ? (
       <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-5 text-xs font-bold border border-red-500/30">
         Insufficient balance for this party size.
       </div>
    ) : (
      <button 
        onClick={() => setShowConfirmModal(true)} 
        disabled={isProcessing} 
        className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center mb-5 hover:bg-blue-50 transition-all active:scale-95"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : "Confirm & Pay Total"}
      </button>
    )}
    
    <button onClick={() => setPaymentStep(1)} className="text-[10px] font-black opacity-60 hover:opacity-100 uppercase tracking-[0.2em] text-white">Go Back</button>
  </div>
)}

                      {paymentStep === 3 && (
  <div className="py-6 animate-in fade-in zoom-in-95 duration-500">
    {/* Success Header */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-400 text-blue-900 rounded-full mb-4 shadow-lg shadow-green-400/30 ring-4 ring-white/10">
        <Check className="w-10 h-10 stroke-[3px]" />
      </div>
      <h4 className="text-3xl font-[1000] text-white tracking-tight leading-none mb-2">You're Going!</h4>
      <p className="text-blue-100 font-medium">Your booking has been confirmed.</p>
    </div>

    {/* Premium Ticket Card */}
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      {/* Decorative notches */}
      <div className="absolute -left-3 top-[65%] -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full" />
      <div className="absolute -right-3 top-[65%] -translate-y-1/2 w-6 h-6 bg-blue-600 rounded-full" />
      
      {/* Card Header */}
      <div className="p-8 pb-6 border-b border-dashed border-slate-200 bg-slate-50/50">
        <div className="flex gap-5">
          <img 
            src={selectedItem.deal_image || selectedItem.logo || selectedItem.image_url} 
            className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-white" 
            alt="Deal" 
          />
          <div className="flex-1 min-w-0 py-1">
            <span className="inline-block px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-2">
              Confirmed
            </span>
            <h5 className="font-[900] text-slate-900 text-lg leading-tight truncate">
              {selectedItem.deal_name || selectedItem.name}
            </h5>
            <p className="text-slate-500 text-xs font-bold mt-1">
              Ref: #A24-{selectedItem.id}
            </p>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-8 pt-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              {new Date(selectedItem.booking_date || bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guests</p>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Users className="w-4 h-4 text-blue-500" />
              {selectedItem.people_count || peopleCount} Ppl
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Paid</p>
            <div className="text-slate-900 font-[900] text-lg">
              €{selectedItem.price || selectedItem.deal_price || '0.00'}
            </div>
          </div>
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Voucher</p>
             <span className="text-green-500 font-black text-xs bg-green-50 px-2 py-1 rounded-md">READY</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => handleDownloadTicket(selectedItem)} 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-blue-600 hover:scale-[1.02] transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF Voucher
          </button>
          
          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => handleCopyVoucherLink(selectedItem.id)}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
            >
              <Link className="w-3.5 h-3.5" /> Copy Deal Link
            </button>
            <button 
              onClick={() => setSelectedItem(null)} 
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <p className="text-center text-blue-200/60 text-[10px] mt-6 font-medium">
      A confirmation email has also been sent to {customerEmail}
    </p>
  </div>
)}
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