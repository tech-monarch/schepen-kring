"use client";

import { tokenUtils } from "@/utils/auth";
import React, { useEffect, useState, useMemo } from "react";
import { Search, Tag, ShoppingBag, X, Check, Loader2, Mail, ArrowRight, Users, Sparkles, Calendar, Globe, Bell, Download, Ticket, ChevronLeft, ChevronRight, Clock, Link, Wallet, ArrowLeft, Grid, Heart } from "lucide-react";
import { toast } from "react-toastify";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { getAllBlogs } from "@/app/[locale]/actions/blog";
import fallbackLogo from './logo.jpg';

const API_BASE = "https://api.answer24.nl/api/v1";
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

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // States from your original logic
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [customerEmail, setCustomerEmail] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingTime, setBookingTime] = useState("");
  const [requestedDeals, setRequestedDeals] = useState<RequestedDeal[]>([]);

// ... inside DealDetailPage
const [allDeals, setAllDeals] = useState<any[]>([]);
const [blogs, setBlogs] = useState<any[]>([]);
const [selectedImg, setSelectedImg] = React.useState<string | null>(null);
const galleryImages = selectedItem?.images || [];
const mainImage = galleryImages[0] || selectedItem?.image_url || fallbackLogo;
const sideImages = galleryImages.slice(1, 5);
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


const handleMollieTopUpAndPay = async (dealId: string | number, dealPrice: number, currentBalance: number) => {
  try {
    const token = tokenUtils.getToken();
    const topUpAmount = dealPrice - currentBalance;

    // Call the deposit endpoint we fixed in your routes 
    const response = await fetch(`${API_BASE}/user/deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: topUpAmount,
        deal_id: dealId, // Pass this so the backend knows what to buy after payment
        redirect_type: 'deal_purchase'
      }),
    });

    const data = await response.json();
    
    if (data.checkoutUrl) {
      // Redirect the user to Mollie to pay the remainder
      window.location.href = data.checkoutUrl;
    } else {
      toast.error(data.error || "Failed to initialize Mollie payment");
    }
  } catch (error) {
    console.error("Payment Error:", error);
    toast.error("An error occurred while connecting to the payment gateway.");
  }
};

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


useEffect(() => {
  const initPage = async () => {
    try {
      setLoading(true);
      
      const [dealsRes, blogResponse] = await Promise.all([
        fetch(`https://api.answer24.nl/api/v1/merchant/deals`),
        getAllBlogs()
      ]);

      const dealsResult = await dealsRes.json();

      // Handle Deals
      if (dealsResult.success) {
        setAllDeals(dealsResult.data || []);
        const found = dealsResult.data.find((d: any) => d.id.toString() === params.id);
        setSelectedItem(found);
      }

      // Handle Blogs: Based on your blog.ts, the array is inside blogResponse.data
      if (blogResponse && Array.isArray(blogResponse.data)) {
        setBlogs(blogResponse.data.slice(0, 6)); // Filter to exactly 6 blogs
      }

      // Wallet fetch logic
      const token = localStorage.getItem('auth_token');
      const user = tokenUtils.getUser();
      if (token && user) {
        const walletRes = await fetch(`${API_BASE}/admin/ledger/balance/${user.mainId || user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const walletData = await walletRes.json();
        if (walletData.success) setWalletBalance(walletData.balance);
      }
    } catch (err) {
      console.error("Initialization Error:", err);
    } finally {
      setLoading(false);
    }
  };
  initPage();
}, [params.id]);


  // Fetch email and user data from localStorage on mount
  useEffect(() => {
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.email) setCustomerEmail(userData.email);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  // Generate time slots every 15 minutes
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  }, []);

  // 1. Safe calculation to prevent NaN (uses your specific deal_price field)
const totalAmount = useMemo(() => {
  if (!selectedItem) return "0.00";
  // Ensure we are pulling the correct numeric value from your deal object
  const basePrice = selectedItem.deal_price || 0;
  const parsedPrice = parseFloat(basePrice.toString());
  return (isNaN(parsedPrice) ? 0 : parsedPrice * peopleCount).toFixed(2);
}, [selectedItem, peopleCount]);

// 2. Initial Fetching using your exact hardcoded routes
useEffect(() => {
  const initPage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const user = tokenUtils.getUser();
      const userId = user?.mainId || user?.id;

      // Fetch Deal using your hardcoded merchant route
      const res = await fetch(`https://api.answer24.nl/api/v1/merchant/deals`);
      const result = await res.json();
      if (result.success) {
        const found = result.data.find((d: any) => d.id.toString() === params.id);
        setSelectedItem(found);
      }

      // Fetch Wallet using your hardcoded ledger route
      if (token && userId) {
        const walletRes = await fetch(`https://api.answer24.nl/api/v1/admin/ledger/balance/${userId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const walletData = await walletRes.json();
        if (walletData.success) {
          setWalletBalance(walletData.balance || 0);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
  initPage();
}, [params.id]);

  useEffect(() => {
  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Change this to use API_BASE to match your working deals fetch
      const response = await fetch(`https://api.answer24.nl/api/v1/wallet/balance`, { 
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data.balance matches your backend response key
        setWalletBalance(data.balance || 0); 
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  fetchWallet();
}, [selectedItem]); // Refetches balance when a deal is opened
  // Initial Fetching
  useEffect(() => {
    const initPage = async () => {
      try {
        // Fetch Deal
        const res = await fetch(`https://api.answer24.nl/api/v1/merchant/deals`);
        const result = await res.json();
        if (result.success) {
          const found = result.data.find((d: any) => d.id.toString() === params.id);
          setSelectedItem(found);
        }

        // Fetch Wallet
        const token = localStorage.getItem('auth_token');
        const user = tokenUtils.getUser();
        if (user) {
          const walletRes = await fetch(`${API_BASE}/admin/ledger/balance/${user.mainId || user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const walletData = await walletRes.json();
          if (walletData.success) setWalletBalance(walletData.balance);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [params.id]);

  // Helper for Calendar Dates
  const getNextMonthDates = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const dayNum = d.getDay() === 0 ? "7" : d.getDay().toString();
      dates.push({
        fullDate: d.toISOString().split('T')[0],
        dayNumber: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isAvailable: selectedItem?.available_days?.includes(dayNum)
      });
    }
    return dates;
  };

  // Logic Functions (Kept exactly as requested)
//   const handleBookDeal = async () => {
//     if (!bookingDate) { toast.error("Selecteer a.u.b. een boekingsdatum."); return; }
//     const currentUser = tokenUtils.getUser();
//     const userId = currentUser?.mainId || currentUser?.id;
//     if (!userId) { toast.error("Gebruikerssessie niet gevonden."); return; }

//     const unitPrice = parseFloat(String(selectedItem.deal_price || 0));
//     const totalToPay = unitPrice * (peopleCount || 1); 
//     if (walletBalance < totalToPay) { toast.error("Onvoldoende saldo."); return; }

//     setIsProcessing(true);
//     try {
//       const token = localStorage.getItem('auth_token');
//       const API_URL = "https://api.answer24.nl/api/v1";

//       const deductRes = await fetch(`${API_URL}/admin/ledger/adjust`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//         body: JSON.stringify({ user_id: userId, amount: -totalToPay, description: `Payment for deal: ${selectedItem.name}` }),
//       });
//       const deductData = await deductRes.json();
//       if (!deductRes.ok) throw new Error(deductData.message);

//       const res = await fetch(`${API_URL}/requested-deals`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//         body: JSON.stringify({
//           deal_id: selectedItem.id,
//           deal_name: selectedItem.name,
//           deal_image: selectedItem.image_url || selectedItem.logo || "",
//           customer_email: customerEmail || currentUser.email,
//           people_count: Number(peopleCount),
//           booking_date: bookingDate,
//           price: Number(totalToPay.toFixed(2)),
//           payment_method: 'wallet',
//           status: 'pending'
//         }),
//       });

//       if (res.ok) {
//         setPaymentStep(3);
//         setWalletBalance(deductData.new_balance);
//         toast.success("Boeking succesvol!");
//       }
//     } catch (error: any) {
//       toast.error(error.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

const handleBookDeal = async () => {
  if (!bookingDate) { 
    toast.error("Selecteer a.u.b. een boekingsdatum."); 
    return; 
  }
  
  const currentUser = tokenUtils.getUser();
  const userId = currentUser?.mainId || currentUser?.id;
  if (!userId) { 
    toast.error("Gebruikerssessie niet gevonden."); 
    return; 
  }

  const unitPrice = parseFloat(String(selectedItem.deal_price || 0));
  const totalToPay = unitPrice * (peopleCount || 1); 
  const token = localStorage.getItem('auth_token');
  const API_URL = "https://api.answer24.nl/api/v1";

  setIsProcessing(true);

  try {
    // SCENARIO 1: Full Wallet Payment
    if (walletBalance >= totalToPay) {
      const deductRes = await fetch(`${API_URL}/admin/ledger/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          user_id: userId, 
          amount: -totalToPay, 
          description: `Volledige betaling voor deal: ${selectedItem.name}` 
        }),
      });
      
      const deductData = await deductRes.json();
      if (!deductRes.ok) throw new Error(deductData.message);

      const res = await fetch(`${API_URL}/requested-deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          deal_id: selectedItem.id,
          deal_name: selectedItem.name,
          deal_image: selectedItem.image_url || selectedItem.logo || "",
          customer_email: customerEmail || currentUser.email,
          people_count: Number(peopleCount),
          booking_date: bookingDate,
          price: Number(totalToPay.toFixed(2)),
          payment_method: 'wallet',
          status: 'pending'
        }),
      });

      if (res.ok) {
        setPaymentStep(3);
        setWalletBalance(deductData.new_balance);
        toast.success("Boeking succesvol!");
      }
    } 
    
    // SCENARIO 2: Partial Wallet + Mollie Top-up
    else {
      const gapAmount = totalToPay - walletBalance;
      
      // We send the booking details as metadata so the backend can finish the deal automatically
      const depositRes = await fetch(`${API_URL}/user/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            amount: gapAmount,
            gateway: 'mollie', // Don't forget this field based on your initiateDeposit validation
            metadata: {
            type: 'deal_purchase_topup',
            deal_id: selectedItem.id,
            deal_name: selectedItem.name,
            deal_image: selectedItem.image_url || "",
            customer_email: customerEmail || currentUser.email,
            people_count: Number(peopleCount),
            booking_date: bookingDate,
            total_price: totalToPay // Full price to be deducted from balance
            }
        }),
      });

      const depositData = await depositRes.json();
      
      if (depositData.checkoutUrl) {
        toast.info(`Saldo onvoldoende. U wordt doorgeleid naar Mollie voor het restant van €${gapAmount.toFixed(2)}`);
        // Small delay so the user can read the toast
        setTimeout(() => {
          window.location.href = depositData.checkoutUrl;
        }, 1500);
      } else {
        throw new Error(depositData.message || "Kon betaling niet initialiseren.");
      }
    }
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setIsProcessing(false);
  }
};


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

  const copyDealLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link gekopieerd!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!selectedItem) return <div className="p-20 text-center">Deal niet gevonden.</div>;

return (
  <div className="min-h-screen bg-white">
    <DashboardHeader />
    
    <div className="flex flex-col relative">
{/* HERO SECTIE - WITH FALLBACKS */}
<div className="w-full flex justify-center mt-16 px-4 md:px-6">
  <div className="w-full max-w-7xl h-[35vh] max-h-[400px] min-h-[250px] grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-4xl shadow-sm bg-gray-50">
    
    {/* MAIN IMAGE */}
    <div 
      className="col-span-2 row-span-2 relative group overflow-hidden cursor-pointer"
      onClick={() => setSelectedImg(mainImage as string)}
    >
      <img 
        src={typeof mainImage === 'string' ? mainImage : mainImage.src} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        alt="Main" 
      />
      
      {/* Category Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none z-10">
        <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white rounded-full text-[9px] font-black uppercase tracking-wider">
          {selectedItem?.category || 'Fashion'}
        </span>
      </div>

      {/* Text Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
        <h3 className="text-2xl md:text-4xl font-[1000] text-white uppercase tracking-tighter drop-shadow-lg">
          {selectedItem?.name}
        </h3>
        <button 
          onClick={(e) => { e.stopPropagation(); copyDealLink(); }} 
          className="mt-2 w-fit flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-[9px] text-white font-bold uppercase hover:bg-white/40"
        >
           <Link className="w-3 h-3" /> Link Kopiëren
        </button>
      </div>
    </div>

    {/* SIDE IMAGES */}
    {sideImages.map((img: string, idx: number) => (
      <div 
        key={idx} 
        className="relative overflow-hidden cursor-pointer group"
        onClick={() => setSelectedImg(img)}
      >
        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Gallery" />
      </div>
    ))}

    {/* FILLER SLOTS - Uses logo.png if images are missing */}
    {[...Array(4 - sideImages.length)].map((_: any, i: number) => (
      <div key={`filler-${i}`} className="col-span-1 row-span-1 bg-gray-100 overflow-hidden opacity-40">
        <img 
          src={typeof fallbackLogo === 'string' ? fallbackLogo : fallbackLogo.src} 
          className="w-full h-full object-contain p-8 grayscale" 
          alt="Placeholder"
        />
      </div>
    ))}
  </div>
</div>

      <div className="max-w-7xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-32">
        {/* LINKER KOLOM: INFO */}
        <div className="lg:col-span-2 space-y-12">
            <section className="mt-10">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px]">01</div> 
                    Gedetailleerde Informatie
                    </h4>

                    <div className="flex items-center gap-2">
                    {/* NEW FAVORITE BUTTON */}
                    <button 
                        onClick={(e) => toggleFavorite(e, selectedItem.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm border ${
                            favorites.includes(selectedItem.id)
                            ? 'bg-pink-500 border-pink-400 text-white shadow-pink-200 shadow-lg scale-105' // PINK state when favorited
                            : 'bg-white border-slate-200 text-slate-600 hover:border-pink-500 hover:text-pink-500' // WHITE state default
                        }`}
                        >
                        <Heart 
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${
                            favorites.includes(selectedItem.id) 
                                ? 'fill-current scale-110' // Fills the heart when active
                                : 'scale-100'
                            }`} 
                        />
                        <span>{favorites.includes(selectedItem.id) ? 'Opgeslagen' : 'Bewaar Deal'}</span>
                        </button>

                    {/* RE-STYLED COPY BUTTON */}
                    <button 
                        onClick={copyDealLink} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <Tag className="w-3.5 h-3.5" /> Kopieer Link 
                    </button>
                    </div>
                </div>

                <div className="text-slate-600 leading-[1.8] text-xl font-medium whitespace-pre-line bg-slate-50/50 p-8 rounded-4xl border border-slate-100 shadow-inner">
                    {selectedItem?.long_description || selectedItem?.description || 'Geen beschrijving beschikbaar.'}
                </div>
            </section>
        </div>

        {/* RECHTER KOLOM: BOEKINGSPANEEL */}
        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          {/* WALLET WEERGAVE */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white flex items-center justify-between border border-slate-800 shadow-xl">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-500" />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Mijn Saldo</p>
                  <p className="text-lg font-black text-white">€{walletBalance?.toFixed(2) || "0.00"}</p>
               </div>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Status</p>
                <p className="text-[10px] font-black text-green-400">ACTIEF</p>
             </div>
          </div>

          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
            {paymentStep === 1 && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-[1000]">Reserveer Nu</h3>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-blue-200 uppercase">Totaal Bedrag</p>
                     <p className="text-2xl font-[1000] text-green-300">€{totalAmount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-3xl p-5 border border-white/10">
                    <label className="text-[10px] font-black uppercase text-blue-200 block mb-2">E-mailadres</label>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-300" />
                      <input type="email" readOnly className="bg-transparent outline-none text-white w-full font-bold opacity-80" value={customerEmail} />
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-3xl p-5 border border-white/10">
                    <label className="text-[10px] font-black uppercase text-blue-200 block mb-2">Aantal Personen</label>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-300" />
                      <input type="number" min="1" className="bg-transparent outline-none text-white w-full font-bold" value={peopleCount} onChange={(e) => setPeopleCount(parseInt(e.target.value))} />
                    </div>
                  </div>

                  {/* DATUM SELECTIE */}
                  <div className="space-y-4 mt-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/80">1. Kies Datum</label>
                    <div className="grid grid-cols-7 gap-1.5 p-3 bg-white rounded-3xl">
                      {getNextMonthDates().map((date) => {
                        const isSelected = bookingDate === date.fullDate; 
                        return (
                          <button key={date.fullDate} disabled={!date.isAvailable} onClick={() => setBookingDate(date.fullDate)}
                            className={`h-12 flex flex-col items-center justify-center rounded-xl transition-all border
                            ${isSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg" : date.isAvailable ? "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100" : "bg-slate-50 border-transparent opacity-20 cursor-not-allowed"}`}>
                            <span className={`text-[6px] font-black uppercase ${isSelected ? 'text-white/60' : 'text-blue-400'}`}>{date.dayName}</span>
                            <span className="text-xs font-black">{date.dayNumber}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TIJD SELECTIE */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/80">2. Kies Tijdstip</label>
                    <div className="grid grid-cols-4 gap-2 h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: 96 }).map((_, i) => {
                        const hour = Math.floor(i / 4).toString().padStart(2, '0');
                        const min = ((i % 4) * 15).toString().padStart(2, '0');
                        const time = `${hour}:${min}`;
                        return (
                          <button key={time} onClick={() => setBookingTime(time)}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${bookingTime === time ? 'bg-white text-blue-600 border-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}>
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button onClick={() => setPaymentStep(2)} disabled={!bookingDate || !bookingTime} 
                  className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 transition-all">
                  Controleer Boeking <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {paymentStep === 2 && (
              <div className="space-y-8 py-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setPaymentStep(1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <h3 className="text-2xl font-[1000]">Bevestig Bestelling</h3>
                </div>

                <div className="bg-white/10 rounded-3xl p-6 space-y-4 border border-white/20">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                     <span className="text-blue-200 font-bold text-sm">Datum & Tijd</span>
                     <span className="font-black">{bookingDate} @ {bookingTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                     <span className="text-blue-200 font-bold text-sm">Personen</span>
                     <span className="font-black">{peopleCount} {peopleCount === 1 ? 'Persoon' : 'Personen'}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                     <span className="text-blue-200 font-bold text-sm">Totaalprijs</span>
                     <span className="text-2xl font-black text-green-300">€{totalAmount}</span>
                  </div>
                </div>

                <button onClick={handleBookDeal} disabled={isProcessing} className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Nu Bevestigen & Betalen
                </button>
                <button onClick={() => setPaymentStep(1)} className="w-full text-[10px] font-black text-white/40 uppercase tracking-[0.3em] text-center">Annuleren en terug</button>
              </div>
            )}

            {paymentStep === 3 && (
  <div className="space-y-8 py-6">
    {/* Success Icon & Message */}
    <div className="text-center">
      <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-400/20">
        <Check className="text-white w-10 h-10 stroke-[4px]" />
      </div>
      <h4 className="text-3xl font-[1000] mb-2">Success!</h4>
      <p className="text-blue-100 font-medium mb-8">Your booking is confirmed. Your voucher is ready below.</p>
    </div>

    {/* Ticket Management Card */}
    <div className="bg-white/10 rounded-[2rem] p-6 border border-white/20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Voucher Status</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-black uppercase">Active & Valid</span>
          </div>
        </div>
        <Ticket className="w-8 h-8 text-blue-300 opacity-50" />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-blue-200">Confirmation ID</span>
          <span className="font-mono font-bold">#A24-{selectedItem.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-200">Arrival Date</span>
          <span className="font-bold">{bookingDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-3">
        <button 
            onClick={() => handleDownloadTicket({
                id: selectedItem.id,
                deal_name: selectedItem.name,
                deal_image: selectedItem.image_url || selectedItem.logo,
                customer_email: customerEmail,
                booking_date: bookingDate,
                price: selectedItem.deal_price,
                people_count: peopleCount,
                status: "confirmed" // Add this line to fix the error
                })
            }
            className="w-full bg-white text-blue-600 py-4 rounded-4xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 hover:bg-blue-50"
            >
            <Download className="w-4 h-4" /> Download PDF Voucher
            </button>
        
        <button 
          onClick={() => router.push('/nl/deals')} 
          className="w-full bg-blue-700/50 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm transition-all border border-white/10"
        >
          Back to Marketplace
        </button>
      </div>
    </div>

    {/* Arrival Info Box */}
    <div className="bg-blue-900/40 rounded-2xl p-5 border border-white/10 flex gap-4">
      <div className="w-10 h-10 bg-blue-600/30 rounded-xl flex items-center justify-center shrink-0">
        <Clock className="w-5 h-5 text-blue-300" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Important Info</p>
        <p className="text-[11px] text-blue-100 leading-relaxed">
          Please arrive at least 15 minutes before your scheduled time ({bookingTime}). Show your digital or printed voucher at the entrance.
        </p>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
{/* --- LATEST UPDATES: FULL WIDTH SECTION --- */}
<div className="border-t border-slate-100 bg-slate-50/50 mt-20 py-24 w-full">
  <div className="max-w-7xl mx-auto px-6">
    
    {/* Section Header */}
    <div className="flex items-center gap-4 mb-16">
      <div className="h-12 w-1.5 bg-blue-600 rounded-full" />
      <div>
        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] block mb-1">More to explore</span>
        <h2 className="text-4xl md:text-5xl font-[1000] text-slate-900 uppercase italic tracking-tighter">Latest Updates</h2>
      </div>
    </div>

    {/* ROW 1: RECOMMENDED DEALS (4 Cards) */}
    {/* ROW 1: RECOMMENDED DEALS (Using your Premium UI) */}
<div className="mb-24">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Other Great Deals</h3>
    <button onClick={() => router.push('/nl/webshop/deals')} className="text-[10px] font-black uppercase text-blue-600 hover:underline">View All</button>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
    {allDeals
      .filter((item: any) => item.id.toString() !== params.id) // Filter out current deal
      .slice(0, 3) // Show top 3
      .map((item: any) => (
        <motion.div 
          key={item.id} 
          layoutId={item.id} 
          onClick={() => router.push(`/webshop/deals/${item.id}/${item.slug || 'view'}`)}
          whileHover={{ y: -8 }}
          className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all cursor-pointer"
        >
          {/* IMAGE SECTION */}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                {item.category}
              </span>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{item.name}</h3>
            <p className="text-slate-500 font-medium mb-6 line-clamp-2 text-sm">{item.description}</p>
            
            {/* AVAILABILITY TRACKER */}
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
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-1">Member Deal</span>
                <div className="flex flex-col gap-0">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-bold text-slate-900">€</span>
                    <span className="text-3xl font-[1000] text-slate-900 tracking-tighter">
                      {item.deal_price || '0.00'}
                    </span>
                  </div>
                  {item.original_price && item.original_price !== item.deal_price && (
                    <div className="flex items-baseline gap-0.5 line-through decoration-red-400/50 -mt-1">
                      <span className="text-[10px] font-bold text-red-400/80">€</span>
                      <span className="text-sm font-bold text-red-400/80">{item.original_price}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: ACTION GROUP */}
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/nl/webshop/deals/${item.id}/${item.slug || 'view'}`);
                    toast.success("Link gekopieerd!");
                  }} 
                  className="w-11 h-11 bg-slate-50 text-slate-400 rounded-[1.2rem] flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all border border-slate-100 hover:border-blue-100 hover:shadow-md active:scale-95 group/copy"
                  title="Kopieer Link"
                >
                  <Link className="w-4 h-4 group-hover/copy:rotate-12 transition-transform" />
                </button>

                <div className="w-11 h-11 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center group-hover:bg-blue-600 transition-all group-hover:translate-x-1 shadow-lg shadow-slate-200 active:scale-95">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
  </div>
</div>

    {/* ROW 2: LATEST BLOGS (6 Cards Grid) */}
    <div>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">From Our Blog</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div key={blog.id} onClick={() => router.push(`nl/blog/${blog.slug}`)} className="group block bg-white rounded-[2rem] overflow-hidden border border-slate-200 p-3 cursor-pointer">
            <div className="relative aspect-video rounded-[1.5rem] overflow-hidden mb-4">
              <img src={blog.blog_image || "/placeholder.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={blog.title} />
            </div>
            <div className="px-3 pb-3">
              <h4 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                {blog.title}
              </h4>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-3">
                {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MORE BUTTON */}
      <div className="mt-16 text-center">
        <button 
          onClick={() => router.push('nl/blog')} 
          className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center gap-3 mx-auto"
        >
          View All Articles <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</div>



  </div>
);
}