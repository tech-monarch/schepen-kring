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
  
  // Core fields from backend
  external_url?: string;
  print_url?: string;
  owners_comment?: string;
  reg_details?: string;
  known_defects?: string;
  last_serviced?: string;
  
  // Dimensions
  beam?: string;
  draft?: string;
  loa?: string;
  lwl?: string;
  air_draft?: string;
  passenger_capacity?: string;
  
  // Construction
  designer?: string;
  builder?: string;
  where?: string;
  hull_colour?: string;
  hull_construction?: string;
  hull_number?: string;
  hull_type?: string;
  super_structure_colour?: string;
  super_structure_construction?: string;
  deck_colour?: string;
  deck_construction?: string;
  
  // Configuration
  cockpit_type?: string;
  control_type?: string;
  ballast?: string;
  displacement?: string;
  
  // Accommodation
  cabins?: string;
  berths?: string;
  toilet?: string;
  shower?: string;
  bath?: string;
  
  // Kitchen equipment
  heating?: string;
  
  // Engine and propulsion
  stern_thruster?: boolean;
  bow_thruster?: boolean;
  fuel?: string;
  hours?: string;
  cruising_speed?: string;
  max_speed?: string;
  horse_power?: string;
  engine_manufacturer?: string;
  tankage?: string;
  gallons_per_hour?: string;
  starting_type?: string;
  drive_type?: string;
  
  // Boolean fields from backend
  allow_bidding?: boolean;
  flybridge?: boolean;
  oven?: boolean;
  microwave?: boolean;
  fridge?: boolean;
  freezer?: boolean;
  air_conditioning?: boolean;
  navigation_lights?: boolean;
  compass?: boolean;
  depth_instrument?: boolean;
  wind_instrument?: boolean;
  autopilot?: boolean;
  gps?: boolean;
  vhf?: boolean;
  plotter?: boolean;
  speed_instrument?: boolean;
  radar?: boolean;
  life_raft?: boolean;
  epirb?: boolean;
  bilge_pump?: boolean;
  fire_extinguisher?: boolean;
  mob_system?: boolean;
  spinnaker?: boolean;
  battery?: boolean;
  battery_charger?: boolean;
  generator?: boolean;
  inverter?: boolean;
  television?: boolean;
  cd_player?: boolean;
  dvd_player?: boolean;
  anchor?: boolean;
  spray_hood?: boolean;
  bimini?: boolean;
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
}

export default function YachtTerminalPage() {
  const { id } = useParams();
  const router = useRouter();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // New states for gallery
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string>("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Payment states
  const [paymentMode, setPaymentMode] = useState<"test_sail" | "buy_now" | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  
  // Booking form
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    fetchVesselData();
    const interval = setInterval(fetchVesselData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (paymentMode === "test_sail") {
      generateCalendarDays();
    }
  }, [paymentMode, currentMonth]);

  const generateCalendarDays = () => {
    const days: CalendarDay[] = [];
    const startDate = new Date(currentMonth);
    startDate.setDate(1);
    
    const firstDay = startDate.getDay();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - (firstDay - i));
      days.push({ date, available: false, isCurrentMonth: false });
    }
    
    // Initially mark all current month days as available (we'll fetch actual availability)
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ 
        date, 
        available: true, // Temporarily true until we fetch actual availability
        isCurrentMonth: true 
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
      
      setCalendarDays(prev => prev.map(day => ({
        ...day,
        available: availableDates.includes(formatDate(day.date))
      })));
    } catch (error) {
      console.error("Error fetching available dates:", error);
      // If API fails, mark weekends as available for demo
      setCalendarDays(prev => prev.map(day => ({
        ...day,
        available: day.isCurrentMonth && (day.date.getDay() !== 0 && day.date.getDay() !== 6)
      })));
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchVesselData = async () => {
    try {
      const [yachtRes, historyRes] = await Promise.all([
        api.get(`/yachts/${id}`),
        api.get(`/bids/${id}/history`),
      ]);
      setYacht(yachtRes.data);
      setBids(historyRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Vessel Retrieval Failed:", error);
    }
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Gallery functions
  const openPhotoGallery = (imageUrl: string, index: number) => {
    setSelectedGalleryImage(imageUrl);
    setCurrentPhotoIndex(index);
    setShowPhotoGallery(true);
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    if (!yacht) return;
    
    const allImages = [
      yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : PLACEHOLDER_IMAGE,
      ...yacht.images.map(img => `${STORAGE_URL}${img.url}`)
    ];
    
    let newIndex = direction === 'next' 
      ? (currentPhotoIndex + 1) % allImages.length
      : (currentPhotoIndex - 1 + allImages.length) % allImages.length;
    
    setCurrentPhotoIndex(newIndex);
    setSelectedGalleryImage(allImages[newIndex]);
  };

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!yacht) return;

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("U moet ingelogd zijn om een bod te plaatsen.");
      router.push('/login');
      return;
    }

    const currentPrice = yacht.current_bid
      ? Number(yacht.current_bid)
      : Number(yacht.price);

    if (amount <= currentPrice) {
      toast.error(`Bod moet hoger zijn dan €${currentPrice.toLocaleString()}`);
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      toast.error("Voer een geldig bedrag in");
      return;
    }

    try {
      await api.post("/bids/place", { 
        yacht_id: yacht.id, 
        amount: amount 
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success("Bod succesvol geplaatst!");
      setBidAmount("");
      fetchVesselData();
    } catch (e: any) {
      console.error("Bid error:", e);
      if (e.response?.status === 403) {
        toast.error("Geen toegang. Log opnieuw in.");
        router.push('/login');
      } else if (e.response?.status === 401) {
        toast.error("Sessie verlopen. Log opnieuw in.");
        router.push('/login');
      } else {
        toast.error("Bod plaatsen mislukt. Controleer verbinding.");
      }
    }
  };

  const handleTestSailBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Selecteer een datum en tijd voor uw proefvaart");
      return;
    }

    if (!bookingForm.name || !bookingForm.email) {
      toast.error("Vul uw naam en e-mail in");
      return;
    }

    setPaymentStatus("processing");

    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      await api.post(`/yachts/${yacht?.id}/book`, {
        start_at: startDateTime.toISOString(),
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        notes: bookingForm.notes
      });

      await api.post("/tasks", {
        title: `PROEFVAART AANVRAAG: ${yacht?.boat_name}`,
        description: `Klant heeft een proefvaart aangevraagd voor ${selectedDate?.toLocaleDateString('nl-NL')} om ${selectedTime}.\n\nKlantgegevens:\nNaam: ${bookingForm.name}\nEmail: ${bookingForm.email}\nTelefoon: ${bookingForm.phone || 'Niet opgegeven'}\nOpmerkingen: ${bookingForm.notes || 'Geen'}`,
        priority: "Medium",
        status: "To Do",
        yacht_id: yacht?.id,
      });

      setPaymentStatus("success");
      setTimeout(() => {
        setPaymentMode(null);
        setPaymentStatus("idle");
        setSelectedDate(null);
        setSelectedTime(null);
        setAvailableSlots([]);
        setBookingForm({ name: '', email: '', phone: '', notes: '' });
      }, 3000);
    } catch (error) {
      setPaymentStatus("idle");
      toast.error("Boeking mislukt.");
    }
  };

  const handleBuyNow = async () => {
    setPaymentStatus("processing");

    try {
      await api.post("/tasks", {
        title: `URGENT: KOOP NU AANVRAAG - ${yacht?.boat_name}`,
        description: `KLANT WIL DEZE BOOT DIRECT KOPEN!\n\nBedrag: €${yacht?.price.toLocaleString()}\n\nStop de veiling en neem contact op met de klant.`,
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
      toast.error("Transactie mislukt.");
    }
  };

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateStr = formatDate(date);
      const res = await api.get(`/yachts/${id}/available-slots?date=${dateStr}`);
      setAvailableSlots(res.data.timeSlots || [
        '09:00', '10:30', '12:00', '13:30', 
        '15:00', '16:30'
      ]);
      setSelectedTime(null);
    } catch (e) {
      // Default time slots if API fails
      setAvailableSlots([
        '09:00', '10:30', '12:00', '13:30', 
        '15:00', '16:30'
      ]);
    }
  };

  const handleDateSelect = (date: Date, isAvailable: boolean) => {
    if (!isAvailable) {
      toast.error("Deze datum is niet beschikbaar");
      return;
    }
    setSelectedDate(date);
    fetchAvailableSlots(date);
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

  // Action handlers
  const handleMoreInfo = () => {
    window.location.href = `mailto:info@schepen-kring.nl?subject=Informatie aanvraag: ${yacht?.boat_name}&body=Ik zou graag meer informatie willen over de ${yacht?.boat_name} (${yacht?.vessel_id})`;
  };

  const handlePrintPDF = () => {
    window.open(yacht?.print_url || `#`, '_blank');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link gekopieerd naar klembord");
    } catch (err) {
      toast.error("Kan link niet kopiëren");
    }
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
  const otherImages = allImages.slice(1, 5); // Max 4 images for the grid
  const hasMoreImages = allImages.length > 5;

  // Format price as per Dutch standards
  const formattedPrice = `€ ${formatPrice(yacht.price)}`

  return (
    <div className="min-h-screen bg-white text-[#333] selection:bg-blue-100">
      <Toaster position="top-center" />

      {/* Simple Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
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
        {/* HERO SECTION - Split Layout */}
        <section className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[70vh]">
            {/* Left - Main Image */}
            <div className="relative bg-gray-100 overflow-hidden">
              <img
                src={mainImage}
                onError={handleImageError}
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

            {/* Right - Image Grid */}
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
                        onError={handleImageError}
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

        {/* HEADER ACTION BAR - Updated with Mail icon and removed buttons */}
        <section className="bg-gray-50 py-6 px-8 border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Boat name and price */}
              <div className="text-2xl md:text-3xl font-serif italic text-gray-900">
                {yacht.boat_name} · {formattedPrice}
              </div>

              {/* Action buttons - Only 4 buttons as requested */}
              <div className="flex flex-wrap gap-3">
                {/* More Information - Red Button with Mail icon */}
                <button
                  onClick={handleMoreInfo}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-medium text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <Mail size={16} />
                  More information
                </button>

                {/* Print PDF */}
                <button
                  onClick={handlePrintPDF}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Printer size={16} />
                  Print PDF
                </button>

                {/* Photos */}
                <button
                  onClick={() => setShowPhotoGallery(true)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <ImageIcon size={16} />
                  Photos
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Share size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT SECTION - Editorial Style */}
        <section className="py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column - Main Content */}
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
                    
                    {/* Owner's Comments */}
                    {yacht.owners_comment && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 pl-6 py-4 mb-8">
                        <h3 className="font-serif italic text-blue-900 mb-2">Notitie van de eigenaar:</h3>
                        <p className="text-blue-800 italic">{yacht.owners_comment}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="mb-12">
                  <h2 className="text-2xl font-serif italic text-gray-900 mb-8 pb-3 border-b border-gray-200">
                    Technische Specificaties
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Specifications */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Algemeen</h3>
                      <SpecRow label="Bouwer" value={yacht.builder || yacht.make} />
                      <SpecRow label="Model" value={yacht.model} />
                      <SpecRow label="Bouwjaar" value={yacht.year?.toString()} />
                      <SpecRow label="Ontwerper" value={yacht.designer} />
                      <SpecRow label="Locatie" value={yacht.where} />
                      <SpecRow label="Hullnummer" value={yacht.hull_number} />
                      <SpecRow label="Hulltype" value={yacht.hull_type} />
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Afmetingen</h3>
                      <SpecRow label="Lengte over alles (LOA)" value={yacht.loa || yacht.length} />
                      <SpecRow label="Lengte waterlijn (LWL)" value={yacht.lwl} />
                      <SpecRow label="Breedte (Beam)" value={yacht.beam} />
                      <SpecRow label="Diepgang (Draft)" value={yacht.draft} />
                      <SpecRow label="Luchtdoorvaart" value={yacht.air_draft} />
                      <SpecRow label="Waterverplaatsing" value={yacht.displacement} />
                      <SpecRow label="Ballast" value={yacht.ballast} />
                      <SpecRow label="Passagierscapaciteit" value={yacht.passenger_capacity} />
                    </div>

                    {/* Construction */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Constructie</h3>
                      <SpecRow label="Rompskleur" value={yacht.hull_colour} />
                      <SpecRow label="Rompconstructie" value={yacht.hull_construction} />
                      <SpecRow label="Superstructuur kleur" value={yacht.super_structure_colour} />
                      <SpecRow label="Superstructuur constructie" value={yacht.super_structure_construction} />
                      <SpecRow label="Dekkleur" value={yacht.deck_colour} />
                      <SpecRow label="Dekconstructie" value={yacht.deck_construction} />
                      <SpecRow label="Cockpit type" value={yacht.cockpit_type} />
                      <SpecRow label="Besturing" value={yacht.control_type} />
                    </div>

                    {/* Engine & Propulsion */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Motor & Propulsie</h3>
                      <SpecRow label="Motorfabrikant" value={yacht.engine_manufacturer} />
                      <SpecRow label="Vermogen" value={yacht.horse_power} />
                      <SpecRow label="Brandstof" value={yacht.fuel} />
                      <SpecRow label="Draaiuren" value={yacht.hours} />
                      <SpecRow label="Kruissnelheid" value={yacht.cruising_speed} />
                      <SpecRow label="Maximumsnelheid" value={yacht.max_speed} />
                      <SpecRow label="Tankinhoud" value={yacht.tankage} />
                      <SpecRow label="Brandstofverbruik" value={yacht.gallons_per_hour} />
                      <SpecRow label="Starttype" value={yacht.starting_type} />
                      <SpecRow label="Aandrijving" value={yacht.drive_type} />
                      <div className="flex items-center gap-4 pt-2">
                        {yacht.stern_thruster && <Badge>Hekschroef</Badge>}
                        {yacht.bow_thruster && <Badge>Boegschroef</Badge>}
                      </div>
                    </div>

                    {/* Accommodation */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Accommodatie</h3>
                      <SpecRow label="Kajuiten" value={yacht.cabins} />
                      <SpecRow label="Slaapplaatsen" value={yacht.berths} />
                      <SpecRow label="Toilet" value={yacht.toilet} />
                      <SpecRow label="Douche" value={yacht.shower} />
                      <SpecRow label="Bad" value={yacht.bath} />
                      <SpecRow label="Verwarming" value={yacht.heating} />
                    </div>

                    {/* Equipment */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Uitrusting</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {yacht.flybridge && <EquipmentBadge>Flybridge</EquipmentBadge>}
                        {yacht.oven && <EquipmentBadge>Oven</EquipmentBadge>}
                        {yacht.microwave && <EquipmentBadge>Magnetron</EquipmentBadge>}
                        {yacht.fridge && <EquipmentBadge>Koelkast</EquipmentBadge>}
                        {yacht.freezer && <EquipmentBadge>Vriezer</EquipmentBadge>}
                        {yacht.air_conditioning && <EquipmentBadge>Airco</EquipmentBadge>}
                        {yacht.navigation_lights && <EquipmentBadge>Navigatielichten</EquipmentBadge>}
                        {yacht.compass && <EquipmentBadge>Kompas</EquipmentBadge>}
                        {yacht.depth_instrument && <EquipmentBadge>Dieptemeter</EquipmentBadge>}
                        {yacht.wind_instrument && <EquipmentBadge>Windmeter</EquipmentBadge>}
                        {yacht.autopilot && <EquipmentBadge>Autopilot</EquipmentBadge>}
                        {yacht.gps && <EquipmentBadge>GPS</EquipmentBadge>}
                        {yacht.vhf && <EquipmentBadge>VHF</EquipmentBadge>}
                        {yacht.plotter && <EquipmentBadge>Plotter</EquipmentBadge>}
                        {yacht.speed_instrument && <EquipmentBadge>Snelheidsmeter</EquipmentBadge>}
                        {yacht.radar && <EquipmentBadge>Radar</EquipmentBadge>}
                        {yacht.life_raft && <EquipmentBadge>Reddingsvlot</EquipmentBadge>}
                        {yacht.epirb && <EquipmentBadge>EPIRB</EquipmentBadge>}
                        {yacht.bilge_pump && <EquipmentBadge>Bilgepomp</EquipmentBadge>}
                        {yacht.fire_extinguisher && <EquipmentBadge>Brandblusser</EquipmentBadge>}
                        {yacht.mob_system && <EquipmentBadge>MOB Systeem</EquipmentBadge>}
                        {yacht.spinnaker && <EquipmentBadge>Spinnaker</EquipmentBadge>}
                        {yacht.battery && <EquipmentBadge>Accu</EquipmentBadge>}
                        {yacht.battery_charger && <EquipmentBadge>Acculader</EquipmentBadge>}
                        {yacht.generator && <EquipmentBadge>Generator</EquipmentBadge>}
                        {yacht.inverter && <EquipmentBadge>Inverter</EquipmentBadge>}
                        {yacht.television && <EquipmentBadge>TV</EquipmentBadge>}
                        {yacht.cd_player && <EquipmentBadge>CD-speler</EquipmentBadge>}
                        {yacht.dvd_player && <EquipmentBadge>DVD-speler</EquipmentBadge>}
                        {yacht.anchor && <EquipmentBadge>Anker</EquipmentBadge>}
                        {yacht.spray_hood && <EquipmentBadge>Sprayhood</EquipmentBadge>}
                        {yacht.bimini && <EquipmentBadge>Bimini</EquipmentBadge>}
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(yacht.reg_details || yacht.known_defects || yacht.last_serviced) && (
                      <div className="space-y-6 md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Aanvullende Informatie</h3>
                        {yacht.reg_details && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Registratie details:</h4>
                            <p className="text-gray-600">{yacht.reg_details}</p>
                          </div>
                        )}
                        {yacht.known_defects && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Bekende gebreken:</h4>
                            <p className="text-gray-600">{yacht.known_defects}</p>
                          </div>
                        )}
                        {yacht.last_serviced && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Laatst onderhouden:</h4>
                            <p className="text-gray-600">{yacht.last_serviced}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                {/* Bidding Section */}
                <div className="bg-gray-50 p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Bod uitbrengen</h3>
                    <span className="text-sm font-medium text-gray-500">{yacht.status}</span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Huidig hoogste bod:</p>
                    <p className="text-2xl font-serif italic">
                      €{(yacht.current_bid ? Number(yacht.current_bid) : Number(yacht.price)).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Voer bedrag in"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500"
                    />
                    <button
                      onClick={placeBid}
                      className="w-full bg-gray-900 hover:bg-black text-white py-3 font-medium transition-colors"
                    >
                      Bod plaatsen
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Je moet ingelogd zijn om te bieden
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMode("buy_now")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 font-medium text-center transition-colors"
                  >
                    Directe aankoop
                  </button>
                  
                  <button
                    onClick={() => setPaymentMode("test_sail")}
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 font-medium text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <Anchor size={18} />
                    Proefvaart boeken
                  </button>
                </div>

                {/* Bid History */}
                <div className="bg-gray-50 p-6 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bod geschiedenis</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {bids.length > 0 ? (
                      bids.map((bid: any, i) => (
                        <div
                          key={bid.id}
                          className={cn(
                            "flex justify-between items-center py-2 border-b border-gray-100 last:border-0",
                            i === 0 ? "text-gray-900 font-medium" : "text-gray-600"
                          )}
                        >
                          <span className="text-sm">{bid.user?.name || "Anonieme bieder"}</span>
                          <span className="text-sm font-medium">€{Number(bid.amount).toLocaleString()}</span>
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
      </main>

      {/* PHOTO GALLERY MODAL */}
      <AnimatePresence>
        {showPhotoGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
          >
            {/* Gallery Header */}
            <div className="flex items-center justify-between p-6 text-white">
              <div>
                <h2 className="text-xl font-medium">{yacht.boat_name}</h2>
                <p className="text-sm text-gray-300">{currentPhotoIndex + 1} van {allImages.length}</p>
              </div>
              <button
                onClick={() => setShowPhotoGallery(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Image */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              <img
                src={selectedGalleryImage || allImages[0]}
                onError={handleImageError}
                className="max-h-[70vh] max-w-full object-contain"
                alt={`Gallery view ${currentPhotoIndex + 1}`}
              />
              
              {/* Navigation Buttons */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateGallery('prev')}
                    className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    <ChevronRight size={24} className="rotate-180" />
                  </button>
                  <button
                    onClick={() => navigateGallery('next')}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedGalleryImage(img);
                      setCurrentPhotoIndex(index);
                    }}
                    className={cn(
                      "w-20 h-20 flex-shrink-0 border-2",
                      index === currentPhotoIndex ? "border-white" : "border-transparent"
                    )}
                  >
                    <img
                      src={img}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                      alt={`Thumbnail ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEST SAIL MODAL - Updated with Calendar */}
      <AnimatePresence>
        {paymentMode === "test_sail" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              {paymentStatus === "idle" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-2 text-gray-900">
                      Beveiligde Proefvaart
                    </h2>
                    <p className="text-sm text-gray-600">
                      Borg Vereist: €{depositAmount.toLocaleString('nl-NL')}
                    </p>
                  </div>

                  {/* CALENDAR SECTION */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-between mb-6">
                        <Button
                          onClick={handlePrevMonth}
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-900"
                        >
                          ←
                        </Button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {DUTCH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <Button
                          onClick={handleNextMonth}
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-900"
                        >
                          →
                        </Button>
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2 mb-6">
                        {/* Dutch Day Headers */}
                        {DUTCH_DAYS.map((day) => (
                          <div key={day} className="text-center py-2">
                            <span className="text-xs font-medium text-gray-500">
                              {day}
                            </span>
                          </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {calendarDays.map((day, index) => {
                          const isSelected = selectedDate && 
                            day.date.getDate() === selectedDate.getDate() &&
                            day.date.getMonth() === selectedDate.getMonth() &&
                            day.date.getFullYear() === selectedDate.getFullYear();
                          
                          return (
                            <button
                              key={index}
                              onClick={() => handleDateSelect(day.date, day.available)}
                              disabled={!day.available || !day.isCurrentMonth}
                              className={cn(
                                "aspect-square flex flex-col items-center justify-center text-sm transition-all",
                                !day.isCurrentMonth ? "text-gray-300" :
                                isSelected
                                  ? "bg-gray-900 text-white"
                                  : isToday(day.date)
                                  ? "bg-gray-100 text-gray-900 font-bold border-2 border-blue-500"
                                  : day.available
                                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                              )}
                              title={day.available ? "Beschikbaar" : "Niet beschikbaar"}
                            >
                              <span className="text-xs font-medium">
                                {day.date.getDate()}
                              </span>
                              {day.available && (
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

                    {/* Confirmation Details */}
                    {selectedTime && (
                      <div className="mt-6 space-y-6">
                        <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Geselecteerd Tijdslot
                          </p>
                          <p className="text-lg font-serif text-gray-900">
                            {selectedTime} - {(() => {
                              const [hours, minutes] = selectedTime.split(':').map(Number);
                              const endTime = new Date();
                              endTime.setHours(hours + 1, minutes);
                              return endTime.toLocaleTimeString('nl-NL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              });
                            })()}
                            <span className="text-sm text-gray-500 ml-2">(+15m buffer)</span>
                          </p>
                        </div>

                        {/* Booking Form */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                            Uw Gegevens
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 block mb-2">
                                Naam *
                              </label>
                              <input
                                type="text"
                                value={bookingForm.name}
                                onChange={(e) => setBookingForm(prev => ({...prev, name: e.target.value}))}
                                className="w-full border border-gray-300 px-4 py-3 text-sm rounded focus:outline-none focus:border-gray-500"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700 block mb-2">
                                E-mail *
                              </label>
                              <input
                                type="email"
                                value={bookingForm.email}
                                onChange={(e) => setBookingForm(prev => ({...prev, email: e.target.value}))}
                                className="w-full border border-gray-300 px-4 py-3 text-sm rounded focus:outline-none focus:border-gray-500"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-gray-700 block mb-2">
                                Telefoonnummer
                              </label>
                              <input
                                type="tel"
                                value={bookingForm.phone}
                                onChange={(e) => setBookingForm(prev => ({...prev, phone: e.target.value}))}
                                className="w-full border border-gray-300 px-4 py-3 text-sm rounded focus:outline-none focus:border-gray-500"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              Opmerkingen
                            </label>
                            <textarea
                              value={bookingForm.notes}
                              onChange={(e) => setBookingForm(prev => ({...prev, notes: e.target.value}))}
                              className="w-full border border-gray-300 px-4 py-3 text-sm rounded focus:outline-none focus:border-gray-500"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 text-gray-700 rounded-lg">
                      <div className="flex gap-3">
                        <FileText size={20} className="shrink-0 mt-1" />
                        <div>
                          <p className="text-sm font-medium mb-1">Belangrijke informatie:</p>
                          <ul className="text-sm space-y-1">
                            <li>• De borg van 10% is volledig terugbetaalbaar</li>
                            <li>• Proefvaart duurt 60 minuten + 15 minuten buffer</li>
                            <li>• Annuleren kan tot 24 uur van tevoren kosteloos</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => {
                        setPaymentMode(null);
                        setSelectedDate(null);
                        setSelectedTime(null);
                        setAvailableSlots([]);
                        setBookingForm({ name: '', email: '', phone: '', notes: '' });
                      }} 
                      className="flex-1 border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={handleTestSailBooking}
                      disabled={!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email}
                      className="flex-2 bg-gray-900 hover:bg-black text-white py-3 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Bevestigen & Borg Betalen
                    </button>
                  </div>
                </div>
              )}
              
              {paymentStatus === "processing" && (
                <div className="py-20 text-center flex flex-col items-center">
                  <Loader2
                    className="animate-spin text-gray-900 mb-4"
                    size={32}
                  />
                  <p className="text-sm font-medium">
                    Beveiligde gateway contacten...
                  </p>
                </div>
              )}
              
              {paymentStatus === "success" && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-gray-900">
                    Proefvaart Ingepland!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Een bevestiging is naar uw e-mail verzonden.
                  </p>
                  {selectedDate && selectedTime && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg inline-block">
                      <p className="text-sm font-medium text-gray-700">
                        {selectedDate.toLocaleDateString('nl-NL', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-lg font-serif text-gray-900">
                        om {selectedTime} uur
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BUY NOW MODAL */}
      <AnimatePresence>
        {paymentMode === "buy_now" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white max-w-md w-full p-8"
            >
              {paymentStatus === "idle" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-2 text-gray-900">
                      Directe Aankoop
                    </h2>
                    <p className="text-3xl font-bold text-gray-900">
                      €{yacht.price.toLocaleString('nl-NL')}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Volledig bedrag: €{yacht.price.toLocaleString('nl-NL')}
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-bold">Let op:</span> Door direct te kopen wordt de veiling beëindigd en kunnen andere bieders geen bod meer plaatsen.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Uw naam *
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-4 py-3 text-sm rounded focus:outline-none focus:border-gray-500"
                        placeholder="Vul uw naam in"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Uw e-mail *
                      </label>
                      <input
                        type="email"
                        className="w-full border border-gray-300 px-4 py-3 text-sm rounded focus:outline-none focus:border-gray-500"
                        placeholder="Vul uw e-mail in"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setPaymentMode(null)} 
                      className="flex-1 border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-2 bg-red-600 hover:bg-red-700 text-white py-3 font-medium transition-colors"
                    >
                      Direct Kopen
                    </button>
                  </div>
                </div>
              )}
              
              {paymentStatus === "processing" && (
                <div className="py-20 text-center flex flex-col items-center">
                  <Loader2
                    className="animate-spin text-gray-900 mb-4"
                    size={32}
                  />
                  <p className="text-sm font-medium">
                    Aankoop wordt verwerkt...
                  </p>
                </div>
              )}
              
              {paymentStatus === "success" && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-gray-900">
                    Aankoop Aanvraag Verzonden!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ons team neemt binnen 24 uur contact met u op.
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

// Helper Components
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