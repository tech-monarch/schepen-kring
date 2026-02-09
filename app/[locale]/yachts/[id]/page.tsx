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
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Printer,
  Download,
  Camera,
  Home,
  Info,
  Images,
  File,
  ChevronRight,
  PhoneCall,
  MapPin as MapPinIcon,
  Mail as MailIcon,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
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
  // Core fields
  id: number;
  vessel_id: string;
  boat_name: string;
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
  
  // Technical Specifications from backend
  vat_status?: string;
  reference_code?: string;
  construction_material?: string;
  hull_shape?: string;
  hull_colour?: string;
  deck_colour?: string;
  clearance?: string;
  displacement?: string;
  steering?: string;
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
  hull_construction?: string;
  hull_number?: string;
  hull_type?: string;
  super_structure_colour?: string;
  super_structure_construction?: string;
  deck_construction?: string;
  
  // Configuration
  cockpit_type?: string;
  control_type?: string;
  ballast?: string;
  
  // Accommodation
  cabins?: number;
  berths?: string;
  toilet?: string;
  shower?: string;
  bath?: string;
  heating?: string;
  
  // Engine and Propulsion
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
  engine_quantity?: string;
  litres_per_hour?: string;
  gearbox?: string;
  cylinders?: string;
  propeller_type?: string;
  engine_location?: string;
  cooling_system?: string;
  
  // Sails and Rigging
  genoa?: string;
  tri_sail?: string;
  storm_jib?: string;
  main_sail?: string;
  winches?: string;
  spinnaker?: boolean;
  
  // Equipment and Electronics
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
  
  // Additional fields
  external_url?: string;
  print_url?: string;
  owners_comment?: string;
  reg_details?: string;
  known_defects?: string;
  last_serviced?: string;
}

const DUTCH_DAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const DUTCH_MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

export default function YachtDetailPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"test_sail" | "buy_now" | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    engine: false,
    accommodation: false,
    navigation: false,
    equipment: false,
    safety: false,
  });

  useEffect(() => {
    fetchVesselData();
  }, [id]);

  useEffect(() => {
    if (paymentMode === "test_sail") {
      generateCalendarDays();
    }
  }, [paymentMode, currentMonth]);

  const fetchVesselData = async () => {
    try {
      const [yachtRes, historyRes] = await Promise.all([
        api.get(`/yachts/${id}`),
        api.get(`/bids/${id}/history`),
      ]);
      setYacht(yachtRes.data);
      setBids(historyRes.data);

      if (!activeImage && yachtRes.data.main_image) {
        setActiveImage(`${STORAGE_URL}${yachtRes.data.main_image}`);
      } else if (!yachtRes.data.main_image) {
        setActiveImage(PLACEHOLDER_IMAGE);
      }
      setLoading(false);
    } catch (error) {
      console.error("Vessel Retrieval Failed:", error);
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const days: any[] = [];
    const startDate = new Date(currentMonth);
    startDate.setDate(1);
    
    // Get first day of month
    const firstDay = startDate.getDay();
    
    // Get number of days in month
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty days for previous month
    for (let i = 0; i < firstDay; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - (firstDay - i));
      days.push({ date, available: false, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, available: true, isCurrentMonth: true });
    }
    
    setCalendarDays(days);
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!yacht) return;

    const currentPrice = yacht.current_bid
      ? Number(yacht.current_bid)
      : Number(yacht.price);

    if (amount <= currentPrice) {
      toast.error(`Bod moet hoger zijn dan €${currentPrice.toLocaleString()}`);
      return;
    }

    try {
      await api.post("/bids/place", { yacht_id: yacht.id, amount });
      toast.success("Bod succesvol geplaatst!");
      setBidAmount("");
      fetchVesselData();
    } catch (e) {
      toast.error("Bod plaatsen mislukt. Controleer verbinding.");
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
        title: `PROEFVAART AANVRAAG: ${yacht?.boat_name || yacht?.name}`,
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
        title: `URGENT: KOOP NU AANVRAAG - ${yacht?.boat_name || yacht?.name}`,
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

  const handleDownloadSpecifications = () => {
    if (!yacht) return;

    const specifications = generateSpecificationsText();
    const blob = new Blob([specifications], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${yacht.boat_name || yacht.name}_specificaties.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Specificaties gedownload");
  };

  const generateSpecificationsText = () => {
    if (!yacht) return "";
    
    let text = `SPECIFICATIES - ${yacht.boat_name || yacht.name}\n`;
    text += "=".repeat(50) + "\n\n";
    
    // Add specifications here...
    
    return text;
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

  const formatCheckbox = (value: boolean | undefined) => {
    return value ? "✔" : "";
  };

  const formatValue = (value: any) => {
    if (value === undefined || value === null || value === "") return "-";
    if (typeof value === "boolean") return value ? "Ja" : "Nee";
    return value.toString();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading || !yacht) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const displayName = yacht.boat_name || yacht.name || "Unnamed Yacht";
  const displayPrice = yacht.price ? `€ ${yacht.price.toLocaleString("nl-NL")},-` : "Prijs op aanvraag";

  // Get all images (main + gallery)
  const allImages = [
    { url: yacht.main_image, id: 0 },
    ...(yacht.images || [])
  ].filter(img => img.url);

  // Determine image layout
  const hasMultipleImages = allImages.length > 1;
  const firstFourImages = allImages.slice(0, 4);
  const remainingImages = allImages.slice(4);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Toaster position="top-center" />

      {/* HERO SECTION - EXACT MATCH TO SCREENSHOT */}
      <div className="border-b border-gray-200">
        {/* TOP BAR WITH REFERENCE AND ACTIONS */}
        <div className="bg-white py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
              {/* LEFT: REFERENCE NUMBER */}
              <div className="text-xl font-bold text-gray-900">
                {yacht.vessel_id || "REF-ID"}
              </div>
              
              {/* RIGHT: ACTION BUTTONS */}
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Info size={16} />
                  More information
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Printer size={16} />
                  Print PDF
                </button>
                <button 
                  onClick={() => setShowAllPhotos(!showAllPhotos)}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Images size={16} />
                  Photos
                </button>
                <button 
                  onClick={handleDownloadSpecifications}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <File size={16} />
                  Documents
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Share2 size={16} />
                  Share
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
                  All media
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN TITLE SECTION */}
        <div className="bg-white py-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* BACK LINK */}
            <div className="mb-4">
              <Link
                href="/nl/yachts"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={16} />
                <span>&lt; Back to overview</span>
              </Link>
            </div>

            {/* BREADCRUMB */}
            <div className="mb-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Home size={14} />
                <span>Home</span>
                <span className="mx-2">&gt;</span>
                <span>Boat offer</span>
                <span className="mx-2">&gt;</span>
                <span className="font-semibold text-gray-900">{displayName}</span>
              </span>
            </div>

            {/* MAIN TITLE AND PRICE */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {displayName} · {displayPrice}
              </h1>
            </div>
          </div>
        </div>

        {/* PRIVACY TERMS LINE */}
        <div className="bg-gray-50 py-3 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
            Privacy - Terms
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* IMAGE GALLERY - FULL WIDTH */}
        <div className="mb-12">
          {hasMultipleImages ? (
            <div className="space-y-4">
              {/* First 2x2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {firstFourImages.map((img, index) => (
                  <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <img
                      src={img.url.includes('http') ? img.url : `${STORAGE_URL}${img.url}`}
                      onError={handleImageError}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      alt={`${displayName} ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {remainingImages.length > 0 && !showAllPhotos && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Show {remainingImages.length} more photos
                  </button>
                </div>
              )}

              {/* Remaining Images Grid */}
              {showAllPhotos && remainingImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">All Photos ({allImages.length})</h3>
                    <button
                      onClick={() => setShowAllPhotos(false)}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Minus size={16} />
                      Show less
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {remainingImages.map((img, index) => (
                      <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                        <img
                          src={img.url.includes('http') ? img.url : `${STORAGE_URL}${img.url}`}
                          onError={handleImageError}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          alt={`${displayName} ${firstFourImages.length + index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Single Image - Full Width
            <div className="relative h-96 md:h-[500px] w-full overflow-hidden rounded-lg">
              <img
                src={activeImage}
                onError={handleImageError}
                className="w-full h-full object-cover"
                alt={displayName}
              />
            </div>
          )}
        </div>

        {/* DOCUMENTS SECTION */}
        <div className="mb-8">
          <button 
            onClick={() => setShowDocuments(!showDocuments)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Documents
          </button>
          {showDocuments && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900 mb-2">Boat specifications</p>
              <div className="flex gap-4">
                <button
                  onClick={handleDownloadSpecifications}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Download size={16} />
                  Download Specifications
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  <File size={16} />
                  View Documents
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - SPECIFICATIONS */}
          <div className="lg:col-span-2">
            {/* COLLAPSIBLE SECTIONS */}
            <div className="space-y-6">
              {/* GENERAL SPECIFICATIONS */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("general")}
                  className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-900">General specifications</h3>
                  {expandedSections.general ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSections.general && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Asking price</p>
                          <p className="text-lg font-bold">{displayPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">VAT status</p>
                          <p className="text-lg">{formatValue(yacht.vat_status)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Brand / Model</p>
                          <p className="text-lg">{yacht.make} {yacht.model}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Year of construction</p>
                          <p className="text-lg">{yacht.year}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Length overall (LOA)</p>
                          <p className="text-lg">{formatValue(yacht.loa)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Waterline length (LWL)</p>
                          <p className="text-lg">{formatValue(yacht.lwl)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Beam</p>
                          <p className="text-lg">{formatValue(yacht.beam)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Draught</p>
                          <p className="text-lg">{formatValue(yacht.draft)}</p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Construction material</p>
                          <p className="text-lg">{formatValue(yacht.construction_material)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Hull colour</p>
                          <p className="text-lg">{formatValue(yacht.hull_colour)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Deck colour</p>
                          <p className="text-lg">{formatValue(yacht.deck_colour)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Builder</p>
                          <p className="text-lg">{formatValue(yacht.builder)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Designer</p>
                          <p className="text-lg">{formatValue(yacht.designer)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Hull type</p>
                          <p className="text-lg">{formatValue(yacht.hull_type)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Hull number</p>
                          <p className="text-lg">{formatValue(yacht.hull_number)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Reference code</p>
                          <p className="text-lg">{yacht.reference_code}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    {yacht.description && (
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                        <p className="text-gray-700 whitespace-pre-line">{yacht.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ENGINE AND PROPULSION */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("engine")}
                  className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-900">Engine and propulsion</h3>
                  {expandedSections.engine ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSections.engine && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Engine manufacturer</p>
                          <p className="text-lg">{formatValue(yacht.engine_manufacturer)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Horse power</p>
                          <p className="text-lg">{formatValue(yacht.horse_power)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Number of engines</p>
                          <p className="text-lg">{formatValue(yacht.engine_quantity)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Fuel type</p>
                          <p className="text-lg">{formatValue(yacht.fuel)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Engine hours</p>
                          <p className="text-lg">{formatValue(yacht.hours)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Starting type</p>
                          <p className="text-lg">{formatValue(yacht.starting_type)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Drive type</p>
                          <p className="text-lg">{formatValue(yacht.drive_type)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Cruising speed</p>
                          <p className="text-lg">{formatValue(yacht.cruising_speed)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Max speed</p>
                          <p className="text-lg">{formatValue(yacht.max_speed)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Fuel tankage</p>
                          <p className="text-lg">{formatValue(yacht.tankage)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Fuel consumption</p>
                          <p className="text-lg">{formatValue(yacht.litres_per_hour)} L/h</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Bow thruster</p>
                          <p className="text-lg">{formatValue(yacht.bow_thruster)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Stern thruster</p>
                          <p className="text-lg">{formatValue(yacht.stern_thruster)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add more collapsible sections for accommodation, navigation, equipment, safety */}
            </div>
          </div>

          {/* RIGHT COLUMN - ACTIONS & CONTACT */}
          <div className="lg:col-span-1 space-y-6">
            {/* BIDDING MODULE */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bieden</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Huidig hoogste bod</p>
                <p className="text-2xl font-bold text-gray-900">
                  € {yacht.current_bid 
                    ? Number(yacht.current_bid).toLocaleString("nl-NL") 
                    : Number(yacht.price).toLocaleString("nl-NL")}
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Voer uw bod in (€)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={placeBid}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  <Gavel size={18} className="mr-2" />
                  Plaats bod
                </Button>
              </div>
            </div>

            {/* DIRECT PURCHASE */}
            <div className="border-2 border-blue-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Direct kopen</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Vraagprijs</p>
                <p className="text-3xl font-bold text-blue-600">
                  € {yacht.price.toLocaleString("nl-NL")},-
                </p>
                {yacht.vat_status && (
                  <p className="text-sm text-gray-500 mt-1">{yacht.vat_status}</p>
                )}
              </div>
              <Button
                onClick={() => setPaymentMode("buy_now")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Direct kopen
              </Button>
            </div>

            {/* TEST SAIL */}
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Proefvaart</h3>
              <p className="text-sm text-gray-600 mb-4">
                Boek een proefvaart om de boot te ervaren.
              </p>
              <Button 
                onClick={() => setPaymentMode("test_sail")}
                variant="outline" 
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3"
              >
                <Calendar size={18} className="mr-2" />
                Proefvaart boeken
              </Button>
            </div>

            {/* DEALER INFO */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Makelaar - Schepenkring Roermond
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PhoneCall size={16} className="text-gray-600" />
                  <span className="text-gray-700">+31 (0) 475 315661</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon size={16} className="text-gray-600" />
                  <span className="text-gray-700">Herteneweg 2, Roermond 6049 AA</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon size={16} className="text-gray-600" />
                  <span className="text-gray-700">roermond@schepenkring.nl</span>
                </div>
                <Button className="w-full mt-4 bg-gray-800 hover:bg-gray-900 text-white">
                  Route calculate route
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ORIGINAL TEST SAIL MODAL */}
      <AnimatePresence>
        {paymentMode === "test_sail" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#001D3D]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {paymentStatus === "idle" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-2">Beveiligde Proefvaart</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Borg Vereist: €{(yacht?.price * 0.1).toLocaleString()}
                    </p>
                  </div>

                  {/* CALENDAR */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          onClick={handlePrevMonth}
                          variant="ghost"
                          className="text-slate-400 hover:text-blue-600"
                        >
                          ←
                        </Button>
                        <h3 className="text-lg font-semibold text-[#003566]">
                          {DUTCH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <Button
                          onClick={handleNextMonth}
                          variant="ghost"
                          className="text-slate-400 hover:text-blue-600"
                        >
                          →
                        </Button>
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2 mb-6">
                        {/* Dutch Day Headers */}
                        {DUTCH_DAYS.map((day) => (
                          <div key={day} className="text-center py-2">
                            <span className="text-[8px] font-black uppercase text-slate-400">
                              {day}
                            </span>
                          </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {calendarDays.map((day: any, index: number) => {
                          const isSelected = selectedDate && 
                            day.date.getDate() === selectedDate.getDate() &&
                            day.date.getMonth() === selectedDate.getMonth() &&
                            day.date.getFullYear() === selectedDate.getFullYear();
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedDate(day.date);
                                // Generate available time slots (demo)
                                setAvailableSlots(['09:00', '11:00', '14:00', '16:00']);
                              }}
                              disabled={!day.available || !day.isCurrentMonth}
                              className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all",
                                !day.isCurrentMonth ? "text-slate-300" :
                                isSelected
                                  ? "bg-[#003566] text-white"
                                  : isToday(day.date)
                                  ? "bg-slate-100 text-[#003566] font-bold border-2 border-blue-400"
                                  : day.available
                                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                              )}
                            >
                              <span className="text-[10px] font-bold">
                                {DUTCH_DAYS[day.date.getDay()]}
                              </span>
                              <span className="text-lg font-serif">
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
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
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
                        <p className="text-[9px] font-bold uppercase text-slate-400 mb-3">
                          Beschikbare Tijdslots (60 minuten + 15 minuten buffer)
                        </p>
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "py-3 rounded-xl text-xs font-bold transition-all",
                                  selectedTime === time 
                                    ? "bg-[#003566] text-white" 
                                    : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                )}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        ) : selectedDate ? (
                          <div className="text-center py-6 border border-slate-200 rounded-lg">
                            <p className="text-[10px] font-black uppercase text-slate-400">
                              Geen beschikbare slots voor deze datum
                            </p>
                            <p className="text-[8px] text-slate-500 mt-1">
                              Selecteer een andere datum
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-slate-200 rounded-lg">
                            <p className="text-[10px] font-black uppercase text-slate-400">
                              Selecteer eerst een datum
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirmation Details */}
                      {selectedTime && (
                        <div className="mt-4 space-y-4">
                          <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">
                              Geselecteerd Tijdslot
                            </p>
                            <p className="text-sm font-serif text-[#003566]">
                              {selectedTime} - {(() => {
                                const [hours, minutes] = selectedTime.split(':').map(Number);
                                const endTime = new Date();
                                endTime.setHours(hours + 1, minutes);
                                return endTime.toLocaleTimeString('nl-NL', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                });
                              })()}
                              <span className="text-[9px] text-slate-500 ml-2">(+15m Buffer)</span>
                            </p>
                          </div>

                          {/* Booking Form */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Uw Gegevens
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">
                                  Naam *
                                </label>
                                <input
                                  type="text"
                                  value={bookingForm.name}
                                  onChange={(e) => setBookingForm(prev => ({...prev, name: e.target.value}))}
                                  className="w-full border border-slate-200 p-2 text-sm rounded"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">
                                  E-mail *
                                </label>
                                <input
                                  type="email"
                                  value={bookingForm.email}
                                  onChange={(e) => setBookingForm(prev => ({...prev, email: e.target.value}))}
                                  className="w-full border border-slate-200 p-2 text-sm rounded"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">
                                  Telefoonnummer
                                </label>
                                <input
                                  type="tel"
                                  value={bookingForm.phone}
                                  onChange={(e) => setBookingForm(prev => ({...prev, phone: e.target.value}))}
                                  className="w-full border border-slate-200 p-2 text-sm rounded"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-[9px] font-bold uppercase text-slate-500 block mb-1">
                                Opmerkingen
                              </label>
                              <textarea
                                value={bookingForm.notes}
                                onChange={(e) => setBookingForm(prev => ({...prev, notes: e.target.value}))}
                                className="w-full border border-slate-200 p-2 text-sm rounded"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 text-[#003566] flex gap-3 rounded-sm">
                    <FileText size={20} className="shrink-0" />
                    <p className="text-[9px] leading-relaxed font-medium">
                      Deze borg start de officiële overdrachtsprocedure. Ons juridisch team genereert binnen 24 uur een maritiem contract.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => {
                        setPaymentMode(null);
                        setSelectedDate(null);
                        setSelectedTime(null);
                        setAvailableSlots([]);
                        setBookingForm({ name: '', email: '', phone: '', notes: '' });
                      }} 
                      variant="ghost" 
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={handleTestSailBooking}
                      disabled={!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email}
                      className="flex-2 bg-[#003566] hover:bg-blue-900 text-white font-bold uppercase tracking-widest text-[10px] disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      Bevestigen & Betalen
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
                    Beveiligde Gateway Contacten...
                  </p>
                </div>
              )}
              {paymentStatus === "success" && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-[#003566]">
                    Transactie Beveiligd
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Een terminal ticket is verzonden.
                  </p>
                  {selectedDate && selectedTime && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-sm">
                      <p className="text-[9px] font-bold uppercase text-slate-500">
                        Proefvaart Ingepland
                      </p>
                      <p className="text-xs font-serif">
                        {selectedDate.toLocaleDateString('nl-NL')} om {selectedTime}
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
            className="fixed inset-0 z-50 bg-[#001D3D]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white max-w-lg w-full p-8 shadow-2xl"
            >
              {paymentStatus === "idle" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-2">Directe Aankoop</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Aankoopbedrag: €{yacht?.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 text-[#003566] flex gap-3 rounded-sm">
                    <FileText size={20} className="shrink-0" />
                    <p className="text-[9px] leading-relaxed font-medium">
                      Uw directe aankoopverzoek wordt direct doorgezet naar ons verkoopteam. Zij nemen binnen 24 uur contact met u op.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setPaymentMode(null)} 
                      variant="ghost" 
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-2 bg-[#003566] hover:bg-blue-900 text-white font-bold uppercase tracking-widest text-[10px]"
                    >
                      Bevestig Directe Aankoop
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
                    Verzoek Verwerken...
                  </p>
                </div>
              )}
              {paymentStatus === "success" && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-serif mb-2 text-[#003566]">
                    Verzoek Bevestigd
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Ons team neemt spoedig contact op.
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