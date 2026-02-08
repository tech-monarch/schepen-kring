
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

// Updated interface to match backend structure
interface Yacht {
  id: number;
  vessel_id: string;
  boat_name: string; // Changed from 'name' to 'boat_name'
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
  
  // Technical Fields
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
  trailer_included?: boolean | number;
  beam?: string;
  draft?: string;
  water_system?: string;
  fuel_consumption?: string;
  interior_type?: string;
  dimensions?: string;
}

// Dutch day names
const DUTCH_DAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const DUTCH_MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

// Define type for calendar days
interface CalendarDay {
  date: Date;
  available: boolean;
  isCurrentMonth: boolean;
}

export default function YachtTerminalPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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
    
    // Add days of current month (initially all unavailable until we fetch data)
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, available: false, isCurrentMonth: true });
    }
    
    setCalendarDays(days);
    
    // Fetch available slots for each day in the current month
    fetchAvailableDatesForMonth();
  };

  const fetchAvailableDatesForMonth = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      // This endpoint needs to be created in your backend
      // For now, we'll fetch available slots for each day
      // You should create: GET /api/availability/dates?yacht_id=${id}&month=${month}&year=${year}
      const res = await api.get(`/yachts/${id}/available-dates?month=${month}&year=${year}`);
      const availableDates = res.data.availableDates || [];
      
      // Update calendar days with availability
      setCalendarDays(prev => prev.map(day => ({
        ...day,
        available: availableDates.includes(formatDate(day.date))
      })));
    } catch (error) {
      console.error("Error fetching available dates:", error);
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
      // Create booking
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

      // Create task for admin
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
      setAvailableSlots(res.data.timeSlots || []);
      setSelectedTime(null);
    } catch (e) {
      toast.error("Kon tijdslots niet laden.");
      setAvailableSlots([]);
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
  const isTrailerIncluded = yacht.trailer_included === true || yacht.trailer_included === 1;

  const renderList = (text?: string) => {
    if (!text)
      return (
        <span className="text-slate-400 italic">Geen apparatuur vermeld.</span>
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
      <header className="fixed top-0 left-0 right-0 z-100 bg-white/90 backdrop-blur-md border-b border-slate-100 h-20 flex items-center px-6 md:px-12 justify-between">
        <Link
          href="/nl/yachts"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003566] transition-colors"
        >
          <ArrowLeft size={14} /> Terug naar Vloot
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
          {/* LEFT: MEDIA & TECHNICAL DOSSIER */}
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
                alt={yacht.boat_name}
              />
              {/* Thumbnails Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Thumbnail
                  src={
                    yacht.main_image
                      ? `${STORAGE_URL}${yacht.main_image}`
                      : PLACEHOLDER_IMAGE
                  }
                  active={activeImage.includes(yacht.main_image || "placeholder")}
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
                Notitie van de Kapitein
              </h3>
              <p className="text-sm font-light leading-relaxed text-slate-600 mb-8 whitespace-pre-line">
                {yacht.description || "Specificaties in afwachting van maritieme certificering."}
              </p>

              {/* Highlight Badges */}
              <div className="flex gap-4">
                {isTrailerIncluded && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <CheckSquare size={14} /> Trailer Inbegrepen
                  </div>
                )}
                {yacht.vat_status && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    <FileText size={14} /> {yacht.vat_status}
                  </div>
                )}
                {yacht.reference_code && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    <Box size={14} /> REF: {yacht.reference_code}
                  </div>
                )}
              </div>
            </div>

            {/* TECHNICAL DOSSIER GRID */}
            <div className="bg-slate-50/50 p-8 md:p-12">
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#003566] mb-8 flex items-center gap-2">
                <Waves size={16} /> Technisch Dossier
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                {/* Category: General */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Ship size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Romp & Algemeen
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4">
                    <SpecRow label="Bouwer" value={yacht.make} />
                    <SpecRow label="Model" value={yacht.model} />
                    <SpecRow label="Bouwjaar" value={yacht.year?.toString()} />
                    <SpecRow label="Lengte" value={yacht.length} />
                    <SpecRow label="Breedte" value={yacht.beam} />
                    <SpecRow label="Diepgang" value={yacht.draft} />
                    <SpecRow label="Constructie" value={yacht.construction_material} />
                    <SpecRow label="Rompvorm" value={yacht.hull_shape} />
                    <SpecRow label="Rompskleur" value={yacht.hull_color} />
                    <SpecRow label="Dekkleur" value={yacht.deck_color} />
                    <SpecRow label="Waterverplaatsing" value={yacht.displacement} />
                    <SpecRow label="Vrije hoogte" value={yacht.clearance} />
                    <SpecRow label="Besturing" value={yacht.steering} />
                  </div>
                </div>

                {/* Category: Engine */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Zap size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Motorruimte
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4">
                    <SpecRow label="Merk" value={yacht.engine_brand} />
                    <SpecRow label="Model" value={yacht.engine_model} />
                    <SpecRow label="Vermogen" value={yacht.engine_power} />
                    <SpecRow label="Uren" value={yacht.engine_hours} />
                    <SpecRow label="Motortype" value={yacht.engine_type} />
                    <SpecRow label="Brandstoftype" value={yacht.fuel_type} />
                    <SpecRow label="Maximumsnelheid" value={yacht.max_speed} />
                    <SpecRow label="Spanning" value={yacht.voltage} />
                    <SpecRow label="Brandstoftank" value={yacht.fuel_capacity} />
                    <SpecRow label="Brandstofverbruik" value={yacht.fuel_consumption} />
                  </div>
                </div>

                {/* Category: Accommodation */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Bed size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Accommodatie
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4">
                    <SpecRow label="Slaapplaatsen" value={yacht.berths} />
                    <SpecRow label="Kajuiten" value={yacht.cabins?.toString()} />
                    <SpecRow label="Toiletten" value={yacht.heads?.toString()} />
                    <SpecRow label="Watertank" value={yacht.water_tank || yacht.water_capacity} />
                    <SpecRow label="Watersysteem" value={yacht.water_system} />
                    <SpecRow label="Interieurstijl" value={yacht.interior_type} />
                  </div>
                </div>

                {/* Category: Equipment Lists */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-2 mb-4">
                    <Compass size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Uitrusting
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">
                        Navigatie & Elektronica
                      </p>
                      {renderList(yacht.navigation_electronics)}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">
                        Exterieur & Dek
                      </p>
                      {renderList(yacht.exterior_equipment)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION CENTER */}
          <div className="lg:col-span-4 p-8 md:p-12 flex flex-col gap-8 bg-white sticky top-20 h-fit border-l border-slate-50">
            <div className="space-y-2">
              <h1 className="text-5xl font-serif text-[#003566] leading-none">
                {yacht.boat_name} {/* Changed from yacht.name */}
              </h1>
              <p className="text-lg font-light italic text-slate-400">
                {yacht.year} {yacht.make} {yacht.model}
              </p>
            </div>

            {/* Bidding Module */}
            <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">
                  Huidig Hoogste Bod
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
                  placeholder="Voer bedrag in"
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
                Koop Nu
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#003566] mb-1">
                Vraagprijs{" "}
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
                Directe Aankoop
              </Button>
            </div>

            {/* Quick Specs List */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Locatie</span>
                <span className="text-[#003566] flex items-center gap-1">
                  <MapPin size={10} /> {yacht.location}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Lengte</span>
                <span className="text-[#003566]">{yacht.length}m</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Breedte</span>
                <span className="text-[#003566]">{yacht.beam}m</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Diepgang</span>
                <span className="text-[#003566]">{yacht.draft}m</span>
              </div>
            </div>

            <Button
              onClick={() => setPaymentMode("test_sail")}
              variant="outline"
              className="w-full border-slate-200 text-[10px] font-black uppercase tracking-widest py-6 hover:bg-slate-50"
            >
              <Anchor size={14} className="mr-2" /> Proefvaart Boeken
            </Button>

            {/* Transaction Log Widget */}
            <div className="bg-slate-50 p-6 rounded-sm border border-slate-100 mt-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                <History size={14} /> Bod Geschiedenis
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
                      <span>{bid.user?.name || "Privé Verzamelaar"}</span>
                      <span>€{Number(bid.amount).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic">
                    Nog geen biedingen geregistreerd.
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
            className="fixed inset-0 z-100 bg-[#001D3D]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {paymentStatus === "idle" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-2">
                      {paymentMode === "buy_now" ? "Directe Aankoop" : "Beveiligde Proefvaart"}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Borg Vereist: €{depositAmount.toLocaleString()}
                    </p>
                  </div>

                  {/* CALENDAR FOR TEST SAIL */}
                  {paymentMode === "test_sail" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            onClick={handlePrevMonth}
                            variant="ghost"
                            className="text-slate-400 hover:text-[#003566]"
                          >
                            ←
                          </Button>
                          <h3 className="text-lg font-semibold text-[#003566]">
                            {DUTCH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                          </h3>
                          <Button
                            onClick={handleNextMonth}
                            variant="ghost"
                            className="text-slate-400 hover:text-[#003566]"
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
                                title={day.available ? "Beschikbaar" : "Niet beschikbaar"}
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
                  )}

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
                      onClick={paymentMode === "buy_now" ? handleBuyNow : handleTestSailBooking}
                      disabled={paymentMode === "test_sail" && (!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email)}
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
                  {paymentMode === "test_sail" && selectedDate && selectedTime && (
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
  if (!value) return null;
  return (
    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
        {label}
      </span>
      <span className="text-xs font-serif italic text-[#003566]">{value}</span>
    </div>
  );
}