"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Ruler,
  Anchor,
  Ship,
  Gauge,
  Box,
  Droplets,
  Fuel,
  Compass,
  User,
  CheckCircle2,
  ChevronRight,
  Printer,
  X,
  Gavel,
  History,
  CheckSquare,
  FileText,
  Waves,
  Zap,
  Bed,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";

// --- CONSTANTS ---
const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80";
const DUTCH_DAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
const DUTCH_MONTHS = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

// --- INTERFACES ---
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

interface CalendarDay {
  date: Date;
  available: boolean;
  isCurrentMonth: boolean;
}

// --- HELPER COMPONENTS ---

// 1. The "Specs Strip"
const QuickSpecItem = ({ label, value, unit }: { label: string; value?: string | number; unit?: string }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center px-4 border-r border-gray-300 last:border-0">
      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</span>
      <span className="text-gray-900 font-semibold text-sm md:text-base whitespace-nowrap">
        {value} {unit}
      </span>
    </div>
  );
};

// 2. Clean Row for Details
const DetailRow = ({ label, value, icon: Icon }: { label: string; value?: string | number | boolean | null; icon?: any }) => {
  if (value === null || value === undefined || value === "") return null;
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2">
      <div className="flex items-center gap-3 text-gray-600">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <span className="text-gray-900 font-semibold text-sm text-right">{value}</span>
    </div>
  );
};

// 3. Section Header
const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <h3 className="text-lg font-serif font-bold text-[#003566] mt-8 mb-4 border-b pb-2 border-gray-200 flex items-center gap-2">
    {Icon && <Icon size={18} />}
    {children}
  </h3>
);

// 4. Bidding Module
const BiddingModule = ({ yacht, bidAmount, setBidAmount, placeBid }: any) => (
  <div className="bg-slate-50 p-4 border rounded-lg w-full mt-4">
    <div className="flex justify-between items-center mb-2">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Huidig Bod</p>
      <span className="text-[10px] font-bold uppercase text-[#003566] bg-blue-100 px-2 py-0.5 rounded-full">Veiling</span>
    </div>
    <p className="text-3xl font-bold text-[#003566] mb-4">
      € {Number(yacht.current_bid || yacht.price).toLocaleString("nl-NL")}
    </p>
    <div className="flex gap-2">
      <input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Uw bod..."
        className="flex-1 border border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:border-[#003566]"
      />
      <Button onClick={placeBid} className="bg-[#003566] hover:bg-[#00284d]">
        <Gavel size={16} className="mr-2" /> Bied
      </Button>
    </div>
    <p className="text-xs text-gray-500 mt-2">Minimaal bod: € {(Number(yacht.current_bid || yacht.price) + 100).toLocaleString()}</p>
  </div>
);

// 5. Broker Info Card
const BrokerInfoCard = ({ setPaymentMode }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Schepen+Kring&background=003566&color=fff" alt="Broker" className="w-full h-full object-cover" />
            </div>
            <div>
                <h4 className="text-lg font-bold text-gray-900">Schepenkring Makelaardij</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Uw jachtmakelaar</p>
            </div>
        </div>
        <div className="space-y-3">
            <Button
                onClick={() => setPaymentMode("test_sail")}
                className="w-full bg-[#003566] hover:bg-[#00284d] text-white py-6 text-sm uppercase tracking-widest font-bold"
            >
                <Calendar className="mr-2 h-4 w-4" />
                Plan een Bezichtiging
            </Button>
            <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 text-gray-700">
                <Phone className="mr-2 h-4 w-4" />
                +31 (0)88 123 4567
            </Button>
            <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 text-gray-700">
                <Mail className="mr-2 h-4 w-4" />
                Stuur e-mail
            </Button>
        </div>
    </div>
);


export default function YachtTerminalPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Action States
  const [bidAmount, setBidAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"test_sail" | "buy_now" | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  
  // Booking/Calendar State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // --- DATA FETCHING ---
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
      toast.error("Kon gegevens niet laden");
    }
  };

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

  // --- CALENDAR LOGIC ---
  const generateCalendarDays = async () => {
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
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, available: false, isCurrentMonth: true });
    }
    setCalendarDays(days);
    
    // Fetch real availability
    try {
        const res = await api.get(`/yachts/${id}/available-dates?month=${month + 1}&year=${year}`);
        const availableDates = res.data.availableDates || [];
        setCalendarDays(prev => prev.map(day => ({
            ...day,
            available: availableDates.includes(day.date.toISOString().split('T')[0])
        })));
    } catch (e) { console.error(e); }
  };

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await api.get(`/yachts/${id}/available-slots?date=${dateStr}`);
      setAvailableSlots(res.data.timeSlots || []);
      setSelectedTime(null);
    } catch (e) {
      toast.error("Kon tijdslots niet laden.");
    }
  };

  const handleDateSelect = (date: Date, isAvailable: boolean) => {
    if (!isAvailable) {
        toast.error("Niet beschikbaar"); return; 
    }
    setSelectedDate(date);
    fetchAvailableSlots(date);
  };

  // --- ACTIONS ---
  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!yacht) return;
    const currentPrice = yacht.current_bid ? Number(yacht.current_bid) : Number(yacht.price);
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
      toast.error("Bod plaatsen mislukt.");
    }
  };

  const handleBuyNow = async () => {
    setPaymentStatus("processing");
    try {
      await api.post("/tasks", {
        title: `URGENT: KOOP NU - ${yacht?.boat_name}`,
        description: `Directe verkoop aanvraag. Prijs: €${yacht?.price}`,
        priority: "High",
        status: "To Do",
        yacht_id: yacht?.id,
      });
      setPaymentStatus("success");
      setTimeout(() => { setPaymentMode(null); setPaymentStatus("idle"); }, 3000);
    } catch (error) {
      setPaymentStatus("idle");
      toast.error("Fout bij aanvraag.");
    }
  };

  const handleTestSailBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email) {
       toast.error("Vul alle velden in"); return;
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
        setPaymentStatus("success");
        setTimeout(() => {
            setPaymentMode(null); setPaymentStatus("idle"); setSelectedDate(null);
        }, 3000);
    } catch (e) {
        setPaymentStatus("idle"); toast.error("Boeking mislukt");
    }
  };

  const renderList = (text?: string) => {
    if (!text) return <span className="text-slate-400 italic text-sm">Niet gespecificeerd.</span>;
    return (
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        {text.split("\n").map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <CheckSquare className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  };

  if (loading || !yacht) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <Loader2 className="animate-spin text-[#003566]" size={40} />
      </div>
    );
  }

  // Derived Data
  const isTrailerIncluded = yacht.trailer_included === true || yacht.trailer_included === 1;
  const images = [
      yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : PLACEHOLDER_IMAGE,
      ...yacht.images.map(img => `${STORAGE_URL}${img.url}`)
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <Toaster position="top-center" />

      {/* --- TOP NAVIGATION --- */}
      <div className="bg-[#003566] text-white py-3 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 opacity-90">
                <Link href="/" className="hover:underline">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/aanbod" className="hover:underline">Aanbod</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="font-semibold truncate max-w-[200px]">{yacht.boat_name}</span>
            </div>
            <Link href="/aanbod" className="flex items-center gap-2 hover:text-gray-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Terug
            </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* --- HERO SECTION (Original Layout) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* --- LEFT COLUMN (Gallery) --- */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <div className="relative aspect-[4/3] bg-gray-100 group">
                        <img 
                            src={activeImage || images[0]} 
                            className="w-full h-full object-cover"
                            alt={yacht.boat_name}
                        />
                    </div>
                    {/* Thumbnails */}
                    <div className="flex gap-2 p-4 overflow-x-auto bg-white border-t border-gray-100">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={cn(
                                    "w-20 h-20 shrink-0 border-2 rounded-md overflow-hidden transition-all",
                                    activeImage === img ? "border-[#003566]" : "border-transparent opacity-70 hover:opacity-100"
                                )}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="thumb" />
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* THE "SPECS STRIP" (Below Gallery) */}
                <div className="bg-gray-100 rounded-lg p-4 flex flex-wrap justify-between md:justify-around gap-y-4 border border-gray-200 shadow-inner mt-4">
                    <QuickSpecItem label="Lengte" value={yacht.length} unit="m" />
                    <QuickSpecItem label="Breedte" value={yacht.beam} unit="m" />
                    <QuickSpecItem label="Diepgang" value={yacht.draft} unit="m" />
                    <QuickSpecItem label="Doorvaar" value={yacht.clearance} unit="m" />
                    <QuickSpecItem label="Bouwjaar" value={yacht.year} unit="" />
                    <QuickSpecItem label="Materiaal" value={yacht.construction_material} unit="" />
                </div>
            </div>

            {/* --- RIGHT COLUMN (Details, Bidding, Broker) --- */}
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                            "text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm",
                            yacht.status === "For Sale" ? "bg-blue-100 text-[#003566]" : "bg-amber-100 text-amber-800"
                        )}>
                            {yacht.status}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm gap-1">
                            <MapPin className="w-4 h-4" />
                            {yacht.location}
                        </div>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
                        {yacht.boat_name}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1 font-serif italic">{yacht.make} {yacht.model}</p>
                    
                    <div className="mt-4">
                        <p className="text-3xl font-bold text-[#003566]">
                            € {(yacht.current_bid ? Number(yacht.current_bid) : Number(yacht.price)).toLocaleString("nl-NL")}
                        </p>
                        <p className="text-sm text-gray-500">{yacht.vat_status || "BTW n.t.b."}</p>
                    </div>
                </div>

                {/* BIDDING MODULE */}
                {yacht.status === "For Bid" && (
                    <BiddingModule 
                        yacht={yacht} 
                        bidAmount={bidAmount} 
                        setBidAmount={setBidAmount} 
                        placeBid={placeBid} 
                    />
                )}

                {/* BROKER INFO & ACTIONS */}
                <BrokerInfoCard setPaymentMode={setPaymentMode} />
                
                {/* BID HISTORY */}
                {bids.length > 0 && (
                     <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase">
                            <History className="w-4 h-4" /> Biedingen
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {bids.map((bid, i) => (
                                <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-500">{bid.user?.name || "Gebruiker"}</span>
                                    <span className="font-bold text-[#003566]">€ {Number(bid.amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                )}
            </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (Description & Specs) --- */}
            <div className="lg:col-span-2 space-y-8">
                {/* DESCRIPTION */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <SectionTitle icon={FileText}>Notitie van de Kapitein</SectionTitle>
                    <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {yacht.description || "Specificaties in afwachting van maritieme certificering."}
                    </div>
                    
                    {/* Badges */}
                    <div className="flex gap-4 mt-6">
                        {isTrailerIncluded && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-100 rounded">
                            <CheckSquare size={14} /> Trailer Inbegrepen
                          </div>
                        )}
                        {yacht.vat_status && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase border border-slate-200 rounded">
                            <FileText size={14} /> {yacht.vat_status}
                          </div>
                        )}
                    </div>
                </div>

                {/* SPECIFICATIONS LISTS */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <SectionTitle icon={Waves}>Technisch Dossier</SectionTitle>
                    
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* 1. Algemeen */}
                        <div>
                            <h4 className="font-bold text-[#003566] mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Ship className="w-4 h-4" /> Romp & Algemeen
                            </h4>
                            <div className="bg-slate-50 rounded-md p-1 border border-slate-100">
                                <DetailRow label="Werf" value={yacht.make} />
                                <DetailRow label="Model" value={yacht.model} />
                                <DetailRow label="Bouwjaar" value={yacht.year} />
                                <DetailRow label="Rompvorm" value={yacht.hull_shape} />
                                <DetailRow label="Rompkleur" value={yacht.hull_color} />
                                <DetailRow label="Dekkleur" value={yacht.deck_color} />
                                <DetailRow label="Waterverplaatsing" value={yacht.displacement} />
                                <DetailRow label="Besturing" value={yacht.steering} />
                            </div>
                        </div>

                        {/* 2. Afmetingen */}
                        <div>
                            <h4 className="font-bold text-[#003566] mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Ruler className="w-4 h-4" /> Afmetingen
                            </h4>
                            <div className="bg-slate-50 rounded-md p-1 border border-slate-100">
                                <DetailRow label="Lengte" value={`${yacht.length} m`} />
                                <DetailRow label="Breedte" value={`${yacht.beam} m`} />
                                <DetailRow label="Diepgang" value={`${yacht.draft} m`} />
                                <DetailRow label="Doorvaarthoogte" value={`${yacht.clearance} m`} />
                            </div>
                        </div>

                        {/* 3. Motor & Techniek */}
                        <div>
                            <h4 className="font-bold text-[#003566] mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Zap className="w-4 h-4" /> Motorruimte
                            </h4>
                            <div className="bg-slate-50 rounded-md p-1 border border-slate-100">
                                <DetailRow label="Merk" value={yacht.engine_brand} />
                                <DetailRow label="Model" value={yacht.engine_model} />
                                <DetailRow label="Vermogen" value={yacht.engine_power} />
                                <DetailRow label="Uren" value={yacht.engine_hours} />
                                <DetailRow label="Brandstof" value={yacht.fuel_type} />
                                <DetailRow label="Type" value={yacht.engine_type} />
                                <DetailRow label="Max Snelheid" value={yacht.max_speed} />
                                <DetailRow label="Voltage" value={yacht.voltage} />
                            </div>
                        </div>

                        {/* 4. Tankinhoud */}
                        <div>
                            <h4 className="font-bold text-[#003566] mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Droplets className="w-4 h-4" /> Capaciteit
                            </h4>
                            <div className="bg-slate-50 rounded-md p-1 border border-slate-100">
                                <DetailRow label="Brandstof" value={yacht.fuel_capacity} icon={Fuel} />
                                <DetailRow label="Water" value={yacht.water_capacity || yacht.water_tank} icon={Droplets} />
                                <DetailRow label="Verbruik" value={yacht.fuel_consumption} icon={Gauge} />
                            </div>
                        </div>

                        {/* 5. Accommodatie */}
                        <div>
                            <h4 className="font-bold text-[#003566] mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Bed className="w-4 h-4" /> Accommodatie
                            </h4>
                            <div className="bg-slate-50 rounded-md p-1 border border-slate-100">
                                <DetailRow label="Hutten" value={yacht.cabins} />
                                <DetailRow label="Slaapplaatsen" value={yacht.berths} />
                                <DetailRow label="Toiletten" value={yacht.heads} />
                                <DetailRow label="Interieur" value={yacht.interior_type} />
                                <DetailRow label="Water Systeem" value={yacht.water_system} />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Equipment Sections (Using your text lists) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <SectionTitle icon={Compass}>Uitrusting & Elektronica</SectionTitle>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h5 className="font-bold text-gray-700 mb-2 text-sm uppercase">Navigatie</h5>
                            {renderList(yacht.navigation_electronics)}
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-700 mb-2 text-sm uppercase">Exterieur</h5>
                            {renderList(yacht.exterior_equipment)}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN (Sidebar - empty now as content is moved up) --- */}
            <div className="space-y-6">
                {/* Content moved to Hero Section Right Column */}
            </div>
        </div>
      </div>

      {/* --- MODAL (Calendar/Booking) --- */}
      <AnimatePresence>
        {paymentMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPaymentMode(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg z-[101] max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-serif font-bold text-[#003566]">
                        {paymentMode === "buy_now" ? "Directe Aankoop" : "Proefvaart Inplannen"}
                    </h3>
                    <button onClick={() => setPaymentMode(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {paymentStatus === "success" ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#003566]">Aanvraag Ontvangen!</h3>
                        <p className="text-sm text-gray-500 mt-2">Wij nemen spoedig contact met u op.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {paymentMode === "test_sail" && (
                            <>
                                {/* Calendar Header */}
                                <div className="flex justify-between items-center">
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:bg-gray-100 rounded">&larr;</button>
                                    <span className="font-bold text-[#003566]">{DUTCH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:bg-gray-100 rounded">&rarr;</button>
                                </div>
                                
                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                                    {DUTCH_DAYS.map(d => <span key={d} className="text-[10px] text-gray-400 font-bold uppercase">{d}</span>)}
                                    {calendarDays.map((day, i) => (
                                        <button
                                            key={i}
                                            disabled={!day.available || !day.isCurrentMonth}
                                            onClick={() => handleDateSelect(day.date, day.available)}
                                            className={cn(
                                                "aspect-square rounded flex flex-col items-center justify-center text-xs transition-colors relative",
                                                day.date.toDateString() === selectedDate?.toDateString() ? "bg-[#003566] text-white" : 
                                                day.available ? "bg-green-50 text-green-800 hover:bg-green-100" : "text-gray-300 cursor-not-allowed"
                                            )}
                                        >
                                            <span className="font-bold">{day.date.getDate()}</span>
                                            {day.available && <span className="w-1 h-1 bg-green-500 rounded-full absolute bottom-1" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Time Slots */}
                                {availableSlots.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableSlots.map(time => (
                                            <button 
                                                key={time} 
                                                onClick={() => setSelectedTime(time)}
                                                className={cn(
                                                    "py-2 text-xs border rounded transition-all",
                                                    selectedTime === time ? "bg-[#003566] text-white border-[#003566]" : "hover:border-[#003566] text-gray-600"
                                                )}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Contact Form (Required for both modes) */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-xs font-bold uppercase text-gray-500">Uw gegevens</h4>
                            <input 
                                className="w-full border p-2 rounded text-sm" 
                                placeholder="Naam" 
                                value={bookingForm.name}
                                onChange={e => setBookingForm({...bookingForm, name: e.target.value})}
                            />
                            <input 
                                className="w-full border p-2 rounded text-sm" 
                                placeholder="E-mail" 
                                value={bookingForm.email}
                                onChange={e => setBookingForm({...bookingForm, email: e.target.value})}
                            />
                            <input 
                                className="w-full border p-2 rounded text-sm" 
                                placeholder="Telefoon" 
                                value={bookingForm.phone}
                                onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
                            />
                            {paymentMode === "buy_now" && (
                                <textarea
                                    className="w-full border p-2 rounded text-sm"
                                    placeholder="Opmerkingen / Vragen over aankoop"
                                    rows={3}
                                    value={bookingForm.notes}
                                    onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                                />
                            )}
                        </div>

                        <Button 
                            onClick={paymentMode === "buy_now" ? handleBuyNow : handleTestSailBooking}
                            disabled={paymentStatus === "processing"}
                            className="w-full bg-[#003566] hover:bg-[#00284d] h-12 text-lg"
                        >
                            {paymentStatus === "processing" ? <Loader2 className="animate-spin" /> : "Bevestigen"}
                        </Button>
                    </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}