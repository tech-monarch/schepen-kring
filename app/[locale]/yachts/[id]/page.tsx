"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Printer,
  Image as ImageIcon,
  File,
  Share,
  GalleryHorizontal,
  ChevronRight,
  Maximize2,
  X,
  Plus,
  Minus,
  AlertCircle,
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

interface Yacht {
  id: number;
  vessel_id: string;
  boat_name: string;
  price: number;
  min_bid_amount: number;
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
  
  // ... rest of the interface remains the same
}

// Dutch day names
const DUTCH_DAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const DUTCH_MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

interface CalendarDay {
  date: Date;
  available: boolean;
  isCurrentMonth: boolean;
  isToday?: boolean;
}

interface Bid {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

export default function YachtTerminalPage() {
  const { id } = useParams();
  const router = useRouter();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string>("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [expandedGallery, setExpandedGallery] = useState(false);
  
  const [paymentMode, setPaymentMode] = useState<"buy_now" | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  
  const [showTestSailForm, setShowTestSailForm] = useState(false);
  const [testSailStatus, setTestSailStatus] = useState<"idle" | "processing" | "success">("idle");
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [placingBid, setPlacingBid] = useState(false);
  const [bidError, setBidError] = useState<string>("");

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        try {
          return JSON.parse(userDataStr);
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  };

  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const userData = getUserData();
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    fetchVesselData();
    const interval = setInterval(fetchVesselData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (showTestSailForm) {
      generateCalendarDays();
    }
  }, [showTestSailForm, currentMonth]);

  // FIXED CALENDAR LOGIC - Matching the original
  const generateCalendarDays = () => {
    const days: CalendarDay[] = [];
    const startDate = new Date(currentMonth);
    startDate.setDate(1);
    
    const firstDay = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    const isTodayDate = (date: Date) => {
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };
    
    // Previous month days
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({
        date,
        available: false,
        isCurrentMonth: false,
        isToday: isTodayDate(date)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        available: true, // This will be updated by the API
        isCurrentMonth: true,
        isToday: isTodayDate(date)
      });
    }
    
    // Next month days to complete the grid (6 rows * 7 columns = 42 cells)
    const totalCells = 42;
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        available: false,
        isCurrentMonth: false,
        isToday: isTodayDate(date)
      });
    }
    
    setCalendarDays(days);
    fetchAvailableDatesForMonth();
  };

  const fetchAvailableDatesForMonth = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const res = await api.get(`/yachts/${id}/available-dates?month=${month}&year=${year}`);
      const availableDates = res.data.availableDates || [];
      
      // Mark days as available if they're in the availableDates array
      setCalendarDays(prev => prev.map(day => {
        const dateStr = formatDate(day.date);
        const isAvailable = availableDates.includes(dateStr);
        
        return {
          ...day,
          available: day.isCurrentMonth ? isAvailable : false
        };
      }));
    } catch (error) {
      console.error("Error fetching available dates:", error);
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchVesselData = async () => {
    try {
      const [yachtRes, historyRes] = await Promise.all([
        api.get(`/yachts/${id}`),
        api.get(`/bids/${id}/history`),
      ]);
      
      const yachtData = yachtRes.data;
      
      if (!yachtData.min_bid_amount) {
        yachtData.min_bid_amount = yachtData.price * 0.9;
      }
      
      setYacht(yachtData);
      setBids(historyRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Vessel Retrieval Failed:", error);
    }
  };

  // ... rest of the functions remain the same (handleImageError, formatPrice, openPhotoGallery, navigateGallery, placeBid, etc.)

  const handleDateSelect = (date: Date, isAvailable: boolean) => {
    if (!isAvailable) {
      toast.error("Deze datum is niet beschikbaar");
      return;
    }
    setSelectedDate(date);
    fetchAvailableSlots(date);
  };

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateStr = formatDate(date);
      const res = await api.get(`https://schepen-kring.nl/api/yachts/${id}/available-slots?date=${dateStr}`);
      setAvailableSlots(res.data.timeSlots || [
        '09:00', '10:30', '12:00', '13:30', 
        '15:00', '16:30'
      ]);
      setSelectedTime(null);
    } catch (e) {
      setAvailableSlots([
        '09:00', '10:30', '12:00', '13:30', 
        '15:00', '16:30'
      ]);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  if (loading || !yacht) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#003566]" size={40} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Manifest synchroniseren...
        </p>
      </div>
    );
  }

  const depositAmount = yacht.price * 0.1;
  const allImages = [
    yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : PLACEHOLDER_IMAGE,
    ...yacht.images.map(img => `${STORAGE_URL}${img.url}`)
  ];
  const mainImage = allImages[0];
  const otherImages = allImages.slice(1, 5);
  const hasMoreImages = allImages.length > 5;
  const galleryImagesToShow = expandedGallery ? allImages : allImages.slice(0, 8);

  const formattedPrice = `€ ${formatPrice(yacht.price)}`;
  const minBidAmount = yacht.min_bid_amount || yacht.price * 0.9;

  return (
    <div className="min-h-screen bg-white text-[#333] selection:bg-blue-100">
      <Toaster position="top-center" />

      {/* Navigation */}
      <header className="fixed top-20 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
        <Link
          href="/nl/yachts"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} /> Terug naar overzicht
        </Link>
        <span className="text-sm font-medium text-gray-500">
          REF: {yacht.vessel_id || yacht.id}
        </span>
      </header>

      <main className="pt-16">
        {/* HERO SECTION */}
        <section className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[70vh]">
            <div className="relative bg-gray-100 overflow-hidden">
              <img
                src={mainImage}
                onError={(e) => e.currentTarget.src = PLACEHOLDER_IMAGE}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                alt={yacht.boat_name}
                onClick={() => openPhotoGallery(mainImage, 0)}
              />
              <button
                onClick={() => openPhotoGallery(mainImage, 0)}
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white p-2 transition-colors"
              >
                <Maximize2 size={20} />
              </button>
            </div>

            <div className="relative bg-gray-50">
              {otherImages.length > 0 ? (
                <div className="grid grid-cols-2 h-full">
                  {otherImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative bg-gray-200 overflow-hidden border border-white"
                    >
                      <img
                        src={img}
                        onError={(e) => e.currentTarget.src = PLACEHOLDER_IMAGE}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        alt={`${yacht.boat_name} - View ${index + 1}`}
                        onClick={() => openPhotoGallery(img, index + 1)}
                      />
                      {index === 3 && hasMoreImages && (
                        <button
                          onClick={() => setShowPhotoGallery(true)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium hover:bg-black/60 transition-colors"
                        >
                          <div className="text-center">
                            <GalleryHorizontal size={32} className="mx-auto mb-2" />
                            <span className="text-lg">+{allImages.length - 5}</span>
                            <p className="text-sm mt-1">Meer foto's</p>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <ImageIcon size={48} className="mx-auto mb-4" />
                    <p>Geen extra foto's beschikbaar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* HEADER ACTION BAR */}
        <section className="bg-gray-50 py-6 px-8 border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-2xl md:text-3xl font-serif italic text-gray-900">
                {yacht.boat_name} · {formattedPrice}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.location.href = `mailto:info@schepen-kring.nl?subject=Informatie aanvraag: ${yacht.boat_name}&body=Ik zou graag meer informatie willen over de ${yacht.boat_name} (${yacht.vessel_id})`}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <Mail size={16} />
                  More information
                </button>

                <button
                  onClick={() => window.open(yacht?.print_url || `#`, '_blank')}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Printer size={16} />
                  Print PDF
                </button>

                <button
                  onClick={() => setShowPhotoGallery(true)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <ImageIcon size={16} />
                  Photos
                </button>

                <button
                  onClick={async () => {
                    const url = window.location.href;
                    try {
                      await navigator.clipboard.writeText(url);
                      toast.success("Link gekopieerd naar klembord");
                    } catch (err) {
                      toast.error("Kan link niet kopiëren");
                    }
                  }}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Share size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section className="py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                {/* Description */}
                <div className="mb-12">
                  <h2 className="text-2xl font-serif italic text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Schip Specificaties
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="text-lg leading-relaxed mb-6">
                      {yacht.description || "Een unieke gelegenheid om dit uitzonderlijke schip aan te schaffen. Met een rijke historie en uitstekende onderhoudsstaat biedt dit vaartuig zowel comfort als prestaties."}
                    </p>
                    
                    {yacht.owners_comment && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 pl-6 py-4 mb-8">
                        <h3 className="font-serif italic text-blue-900 mb-2">Notitie van de eigenaar:</h3>
                        <p className="text-blue-800 italic">{yacht.owners_comment}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Specifications Grid - Remains the same */}
                {/* ... */}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                {/* Bidding Section */}
                <div className="bg-gray-50 p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Bod uitbrengen</h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${yacht.status === 'Sold' ? 'bg-red-100 text-red-800' : yacht.status === 'For Bid' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {yacht.status === 'For Sale' ? 'Te Koop' : yacht.status === 'For Bid' ? 'Veiling Actief' : 'Verkocht'}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Huidig hoogste bod:</p>
                    <p className="text-2xl font-serif italic">
                      €{(yacht.current_bid ? Number(yacht.current_bid) : Number(yacht.price)).toLocaleString('nl-NL')}
                    </p>
                    {yacht.status === 'For Sale' && (
                      <p className="text-xs text-gray-500 mt-1">Startprijs</p>
                    )}
                    
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Minimaal bod vereist:</p>
                          <p className="text-lg font-bold text-amber-900">
                            €{minBidAmount.toLocaleString('nl-NL')}
                            <span className="text-sm font-normal text-amber-700 ml-2">(90% van vraagprijs)</span>
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            Biedingen onder dit bedrag worden automatisch afgewezen
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {yacht.status === 'Sold' ? (
                    <div className="text-center py-4 bg-red-50 border border-red-100 rounded">
                      <p className="text-red-600 font-medium">Dit schip is verkocht</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => {
                            setBidAmount(e.target.value);
                            setBidError("");
                          }}
                          placeholder={`Minimaal €${minBidAmount.toLocaleString('nl-NL')}`}
                          className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500"
                          step="100"
                          min={minBidAmount}
                        />
                        {bidError && (
                          <p className="text-red-500 text-xs mt-1">{bidError}</p>
                        )}
                      </div>
                      
                      {isAuthenticated ? (
                        <button
                          onClick={placeBid}
                          disabled={placingBid}
                          className={`w-full ${placingBid ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'} text-white py-3 font-medium transition-colors flex items-center justify-center gap-2`}
                        >
                          {placingBid ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Plaatsen...
                            </>
                          ) : (
                            <>
                              <Gavel size={16} />
                              Bod plaatsen
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push('/login')}
                          className="w-full bg-gray-900 hover:bg-black text-white py-3 font-medium transition-colors"
                        >
                          Inloggen om te bieden
                        </button>
                      )}
                      {user && (
                        <p className="text-xs text-gray-500 text-center">
                          Ingelogd als: {user.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMode("buy_now")}
                    disabled={yacht.status === 'Sold'}
                    className={`w-full ${yacht.status === 'Sold' ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white py-4 font-medium text-center transition-colors`}
                  >
                    Directe aankoop
                  </button>
                  
                  <button
                    onClick={() => setShowTestSailForm(!showTestSailForm)}
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 font-medium text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <Anchor size={18} />
                    {showTestSailForm ? 'Proefvaart formulier verbergen' : 'Proefvaart boeken'}
                  </button>
                </div>

                {/* INLINE TEST SAIL BOOKING FORM WITH FIXED CALENDAR */}
                {showTestSailForm && (
                  <div className="bg-white border border-gray-200 p-6 mt-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Proefvaart Boeken
                        </h3>
                        <p className="text-sm text-gray-600">
                          Borg Vereist: €{depositAmount.toLocaleString('nl-NL')}
                        </p>
                      </div>

                      {/* FIXED CALENDAR SECTION */}
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="flex items-center justify-between mb-6">
                            <button
                              onClick={handlePrevMonth}
                              className="text-gray-400 hover:text-gray-900 p-2"
                            >
                              ←
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {DUTCH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </h3>
                            <button
                              onClick={handleNextMonth}
                              className="text-gray-400 hover:text-gray-900 p-2"
                            >
                              →
                            </button>
                          </div>
                          
                          {/* Calendar Grid - FIXED LOGIC */}
                          <div className="grid grid-cols-7 gap-2 mb-6">
                            {/* Dutch Day Headers */}
                            {DUTCH_DAYS.map((day) => (
                              <div key={day} className="text-center py-2">
                                <span className="text-xs font-medium text-gray-500">
                                  {day}
                                </span>
                              </div>
                            ))}
                            
                            {/* Calendar Days - FIXED RENDERING */}
                            {calendarDays.map((day, index) => {
                              const isSelected = selectedDate && 
                                day.date.getDate() === selectedDate.getDate() &&
                                day.date.getMonth() === selectedDate.getMonth() &&
                                day.date.getFullYear() === selectedDate.getFullYear();
                              
                              // Determine the CSS classes based on day properties
                              let buttonClasses = "aspect-square flex flex-col items-center justify-center text-sm transition-all ";
                              
                              if (!day.isCurrentMonth) {
                                buttonClasses += "text-gray-300 cursor-default";
                              } else if (isSelected) {
                                buttonClasses += "bg-gray-900 text-white";
                              } else if (day.isToday) {
                                buttonClasses += "bg-gray-100 text-gray-900 font-bold border-2 border-blue-500";
                              } else if (day.available) {
                                buttonClasses += "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100";
                              } else {
                                buttonClasses += "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed";
                              }
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => handleDateSelect(day.date, day.available)}
                                  disabled={!day.available || !day.isCurrentMonth}
                                  className={buttonClasses}
                                  title={day.available ? "Beschikbaar" : "Niet beschikbaar"}
                                >
                                  <span className="text-xs font-medium">
                                    {day.date.getDate()}
                                  </span>
                                  {day.available && day.isCurrentMonth && (
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Date Display */}
                          {selectedDate && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                              <p className="text-sm font-medium text-blue-900">
                                Geselecteerde datum: {selectedDate.toLocaleDateString('nl-NL', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}

                          {/* Time Slots Grid */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-4">
                              Beschikbare Tijdslots
                            </p>
                            {availableSlots.length > 0 ? (
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {availableSlots.map((time) => (
                                  <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={cn(
                                      "py-3 rounded text-sm font-medium transition-all",
                                      selectedTime === time 
                                        ? "bg-gray-900 text-white" 
                                        : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                    )}
                                  >
                                    {time}
                                  </button>
                                ))}
                              </div>
                            ) : selectedDate ? (
                              <div className="text-center py-6 border border-gray-200 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">
                                  Geen beschikbare slots voor deze datum
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Selecteer een andere datum
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-6 border border-gray-200 rounded-lg">
                                <p className="text-sm font-medium text-gray-500">
                                  Selecteer eerst een datum
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rest of the booking form remains the same */}
                        {/* ... */}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bid History */}
                <div className="bg-gray-50 p-6 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <History size={16} />
                    Bod geschiedenis
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {bids.length > 0 ? (
                      bids.map((bid, i) => (
                        <div
                          key={bid.id}
                          className={cn(
                            "flex justify-between items-center py-3 px-3 rounded border",
                            i === 0 
                              ? "bg-blue-50 border-blue-200 text-blue-900 font-medium" 
                              : "border-gray-100 text-gray-600"
                          )}
                        >
                          <div>
                            <span className="text-sm">{bid.user?.name || "Anonieme bieder"}</span>
                            {bid.status === 'active' && i === 0 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                                Actief
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">€{Number(bid.amount).toLocaleString('nl-NL')}</span>
                            <p className="text-xs text-gray-400">
                              {new Date(bid.created_at).toLocaleDateString('nl-NL')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        Nog geen biedingen geregistreerd
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="py-12 px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif italic text-gray-900">
                Fotogalerij
              </h2>
              <span className="text-sm text-gray-500">
                {allImages.length} foto's
              </span>
            </div>
            
            {allImages.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImagesToShow.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden bg-gray-200 group cursor-pointer"
                      onClick={() => openPhotoGallery(img, index)}
                    >
                      <img
                        src={img}
                        onError={(e) => e.currentTarget.src = PLACEHOLDER_IMAGE}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={`${yacht.boat_name} - Afbeelding ${index + 1}`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Klik om te vergroten
                      </div>
                    </div>
                  ))}
                </div>
                
                {allImages.length > 8 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setExpandedGallery(!expandedGallery)}
                      className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                    >
                      {expandedGallery ? (
                        <>
                          <Minus size={16} />
                          Minder foto's tonen
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Alle {allImages.length} foto's tonen
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Geen foto's beschikbaar</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals for gallery and buy now remain the same */}
      {/* ... */}
    </div>
  );
}

// Helper Components remain the same
function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
      {children}
    </span>
  );
}

function EquipmentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">
      {children}
    </span>
  );
}