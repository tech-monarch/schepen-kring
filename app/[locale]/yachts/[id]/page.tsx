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
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    fetchVesselData();
  }, [id]);

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
    
    // General Information
    text += "ALGEMENE INFORMATIE\n";
    text += "-".repeat(30) + "\n";
    text += `Bouwjaar: ${yacht.year}\n`;
    text += `Lengte: ${yacht.length}\n`;
    text += `Breedte: ${yacht.beam}\n`;
    text += `Diepgang: ${yacht.draft}\n`;
    text += `Prijs: €${yacht.price.toLocaleString("nl-NL")}\n`;
    text += `Status: ${yacht.status}\n`;
    text += `Locatie: ${yacht.location}\n\n`;
    
    // Construction
    text += "CONSTRUCTIE\n";
    text += "-".repeat(30) + "\n";
    text += `Bouwstof: ${yacht.construction_material}\n`;
    text += `Rompvorm: ${yacht.hull_shape}\n`;
    text += `Rompkleur: ${yacht.hull_colour}\n`;
    text += `Dekkleur: ${yacht.deck_colour}\n`;
    text += `Rompsnummer: ${yacht.hull_number}\n\n`;
    
    // Motor
    text += "MOTOR\n";
    text += "-".repeat(30) + "\n";
    text += `Motor: ${yacht.engine_manufacturer}\n`;
    text += `Vermogen: ${yacht.horse_power}\n`;
    text += `Brandstof: ${yacht.fuel}\n`;
    text += `Uren: ${yacht.hours}\n`;
    text += `Max snelheid: ${yacht.max_speed}\n`;
    text += `Cruise snelheid: ${yacht.cruising_speed}\n\n`;
    
    // Accommodatie
    text += "ACCOMMODATIE\n";
    text += "-".repeat(30) + "\n";
    text += `Kajuiten: ${yacht.cabins}\n`;
    text += `Slaapplaatsen: ${yacht.berths}\n`;
    text += `Toilet: ${yacht.toilet}\n`;
    text += `Douche: ${yacht.shower}\n\n`;
    
    // Extra voorzieningen
    text += "EXTRA VOORZIENINGEN\n";
    text += "-".repeat(30) + "\n";
    const extras = [];
    if (yacht.air_conditioning) extras.push("Airconditioning");
    if (yacht.heating) extras.push("Verwarming");
    if (yacht.oven) extras.push("Oven");
    if (yacht.microwave) extras.push("Magnetron");
    if (yacht.fridge) extras.push("Koelkast");
    if (yacht.freezer) extras.push("Vriezer");
    if (yacht.television) extras.push("TV");
    if (yacht.cd_player) extras.push("CD-speler");
    if (yacht.dvd_player) extras.push("DVD-speler");
    text += extras.join(", ") + "\n\n";
    
    // Navigatie en elektronica
    text += "NAVIGATIE & ELEKTRONICA\n";
    text += "-".repeat(30) + "\n";
    const navEquipment = [];
    if (yacht.compass) navEquipment.push("Kompas");
    if (yacht.gps) navEquipment.push("GPS");
    if (yacht.plotter) navEquipment.push("Kaartplotter");
    if (yacht.radar) navEquipment.push("Radar");
    if (yacht.autopilot) navEquipment.push("Autopilot");
    if (yacht.vhf) navEquipment.push("VHF");
    text += navEquipment.join(", ") + "\n\n";
    
    // Veiligheid
    text += "VEILIGHEID\n";
    text += "-".repeat(30) + "\n";
    const safety = [];
    if (yacht.life_raft) safety.push("Reddingsvlot");
    if (yacht.epirb) safety.push("EPIRB");
    if (yacht.bilge_pump) safety.push("Bilgepomp");
    if (yacht.fire_extinguisher) safety.push("Brandblusser");
    if (yacht.mob_system) safety.push("MOB systeem");
    text += safety.join(", ") + "\n\n";
    
    // Extra uitrusting
    text += "EXTRA UITRUSTING\n";
    text += "-".repeat(30) + "\n";
    const extraEquipment = [];
    if (yacht.anchor) extraEquipment.push("Anker");
    if (yacht.spray_hood) extraEquipment.push("Sprayhood");
    if (yacht.bimini) extraEquipment.push("Bimini");
    if (yacht.spinnaker) extraEquipment.push("Spinnaker");
    text += extraEquipment.join(", ") + "\n\n";
    
    // Opmerkingen
    if (yacht.owners_comment || yacht.known_defects) {
      text += "OPMERKINGEN\n";
      text += "-".repeat(30) + "\n";
      if (yacht.owners_comment) text += `Eigenaar: ${yacht.owners_comment}\n`;
      if (yacht.known_defects) text += `Bekende gebreken: ${yacht.known_defects}\n`;
    }
    
    text += "\n" + "=".repeat(50) + "\n";
    text += `Aangemaakt: ${new Date().toLocaleDateString('nl-NL')}\n`;
    text += `Referentie: ${yacht.vessel_id || yacht.reference_code}`;
    
    return text;
  };

  const formatCheckbox = (value: boolean | undefined) => {
    return value ? "✔" : "";
  };

  const formatValue = (value: any) => {
    if (value === undefined || value === null || value === "") return "-";
    if (typeof value === "boolean") return value ? "Ja" : "Nee";
    return value.toString();
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - SPECIFICATIONS */}
          <div className="lg:col-span-2">
            {/* MAIN IMAGE */}
            <div className="mb-8">
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={activeImage}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                  alt={displayName}
                />
              </div>
              {showAllPhotos && yacht.images && yacht.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  {yacht.images.slice(0, 4).map((img, index) => (
                    <img
                      key={img.id}
                      src={`${STORAGE_URL}${img.url}`}
                      className="w-full h-32 object-cover rounded"
                      alt={`${displayName} ${index + 1}`}
                      onError={handleImageError}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* GENERAL SPECIFICATIONS */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                General specifications
              </h2>
              
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
                  <div>
                    <p className="text-sm font-medium text-gray-700">Air draught</p>
                    <p className="text-lg">{formatValue(yacht.air_draft)}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Displacement</p>
                    <p className="text-lg">{formatValue(yacht.displacement)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ballast</p>
                    <p className="text-lg">{formatValue(yacht.ballast)}</p>
                  </div>
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
                    <p className="text-sm font-medium text-gray-700">Superstructure colour</p>
                    <p className="text-lg">{formatValue(yacht.super_structure_colour)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hull number</p>
                    <p className="text-lg">{formatValue(yacht.hull_number)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hull type</p>
                    <p className="text-lg">{formatValue(yacht.hull_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Builder</p>
                    <p className="text-lg">{formatValue(yacht.builder)}</p>
                  </div>
                </div>
              </div>

              {/* COMMENTS */}
              {yacht.owners_comment && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Owners comment</p>
                  <p className="text-gray-700 whitespace-pre-line">{yacht.owners_comment}</p>
                </div>
              )}
            </div>

            {/* ENGINE AND PROPULSION */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                Engine and propulsion
              </h2>
              
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
                    <p className="text-sm font-medium text-gray-700">Gearbox</p>
                    <p className="text-lg">{formatValue(yacht.gearbox)}</p>
                  </div>
                </div>
              </div>

              {/* THRUSTERS */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* ACCOMMODATION */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                Accommodation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Cabins</p>
                    <p className="text-lg">{formatValue(yacht.cabins)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Berths</p>
                    <p className="text-lg">{formatValue(yacht.berths)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Toilet</p>
                    <p className="text-lg">{formatValue(yacht.toilet)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Shower</p>
                    <p className="text-lg">{formatValue(yacht.shower)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Bath</p>
                    <p className="text-lg">{formatValue(yacht.bath)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Heating</p>
                    <p className="text-lg">{formatValue(yacht.heating)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Air conditioning</p>
                    <p className="text-lg">{formatValue(yacht.air_conditioning)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Oven</p>
                    <p className="text-lg">{formatValue(yacht.oven)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Microwave</p>
                    <p className="text-lg">{formatValue(yacht.microwave)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fridge</p>
                    <p className="text-lg">{formatValue(yacht.fridge)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Freezer</p>
                    <p className="text-lg">{formatValue(yacht.freezer)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NAVIGATION AND ELECTRONICS */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                Navigation and electronics
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Compass</p>
                  <p className="text-lg">{formatValue(yacht.compass)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">GPS</p>
                  <p className="text-lg">{formatValue(yacht.gps)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Plotter</p>
                  <p className="text-lg">{formatValue(yacht.plotter)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Radar</p>
                  <p className="text-lg">{formatValue(yacht.radar)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Autopilot</p>
                  <p className="text-lg">{formatValue(yacht.autopilot)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">VHF</p>
                  <p className="text-lg">{formatValue(yacht.vhf)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Depth instrument</p>
                  <p className="text-lg">{formatValue(yacht.depth_instrument)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Speed instrument</p>
                  <p className="text-lg">{formatValue(yacht.speed_instrument)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Wind instrument</p>
                  <p className="text-lg">{formatValue(yacht.wind_instrument)}</p>
                </div>
              </div>
            </div>

            {/* SAFETY AND EQUIPMENT */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                Safety and equipment
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Life raft</p>
                  <p className="text-lg">{formatValue(yacht.life_raft)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">EPIRB</p>
                  <p className="text-lg">{formatValue(yacht.epirb)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Bilge pump</p>
                  <p className="text-lg">{formatValue(yacht.bilge_pump)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fire extinguisher</p>
                  <p className="text-lg">{formatValue(yacht.fire_extinguisher)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">MOB system</p>
                  <p className="text-lg">{formatValue(yacht.mob_system)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Anchor</p>
                  <p className="text-lg">{formatValue(yacht.anchor)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Spray hood</p>
                  <p className="text-lg">{formatValue(yacht.spray_hood)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Bimini</p>
                  <p className="text-lg">{formatValue(yacht.bimini)}</p>
                </div>
              </div>
            </div>

            {/* SAILS AND RIGGING */}
            {(yacht.genoa || yacht.main_sail || yacht.spinnaker) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                  Sails and rigging
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {yacht.genoa && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Genoa</p>
                        <p className="text-lg">{yacht.genoa}</p>
                      </div>
                    )}
                    {yacht.main_sail && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Main sail</p>
                        <p className="text-lg">{yacht.main_sail}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Spinnaker</p>
                      <p className="text-lg">{formatValue(yacht.spinnaker)}</p>
                    </div>
                    {yacht.winches && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Winches</p>
                        <p className="text-lg">{yacht.winches}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* KNOWN DEFECTS */}
            {yacht.known_defects && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-bold text-red-800 mb-2">Known defects</h3>
                <p className="text-red-700 whitespace-pre-line">{yacht.known_defects}</p>
              </div>
            )}
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

            {/* CONTACT FORM */}
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                More information
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your first and last name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number*
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address*
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    I would like the following... *
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select an option</option>
                    <option>More information</option>
                    <option>Schedule a viewing</option>
                    <option>Request a test sail</option>
                    <option>Make an offer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your comment or question
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  Send
                </Button>
                <p className="text-xs text-gray-500 mt-2">* Required field</p>
              </form>
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

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {paymentMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {paymentStatus === "idle" && (
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {paymentMode === "buy_now" ? "Directe Aankoop" : "Proefvaart Boeken"}
                  </h3>
                  
                  {paymentMode === "test_sail" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Naam *
                        </label>
                        <input
                          type="text"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm(prev => ({...prev, name: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm(prev => ({...prev, email: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefoonnummer
                        </label>
                        <input
                          type="tel"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm(prev => ({...prev, phone: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gewenste datum *
                        </label>
                        <input
                          type="date"
                          onChange={(e) => setSelectedDate(new Date(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gewenste tijd *
                        </label>
                        <input
                          type="time"
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opmerkingen
                        </label>
                        <textarea
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm(prev => ({...prev, notes: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button
                      onClick={() => {
                        setPaymentMode(null);
                        setSelectedDate(null);
                        setSelectedTime(null);
                        setBookingForm({ name: '', email: '', phone: '', notes: '' });
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={paymentMode === "buy_now" ? handleBuyNow : handleTestSailBooking}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Bevestigen
                    </Button>
                  </div>
                </div>
              )}

              {paymentStatus === "processing" && (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                  <p className="text-gray-700">Verwerken...</p>
                </div>
              )}

              {paymentStatus === "success" && (
                <div className="p-12 text-center">
                  <CheckCircle2 className="text-green-600 mx-auto mb-4" size={48} />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {paymentMode === "buy_now" ? "Aankoop Aangevraagd" : "Proefvaart Geboekt"}
                  </h4>
                  <p className="text-gray-600">
                    {paymentMode === "buy_now" 
                      ? "Ons team neemt zo snel mogelijk contact met u op." 
                      : "U ontvangt binnenkort een bevestiging per e-mail."}
                  </p>
                  <Button
                    onClick={() => {
                      setPaymentMode(null);
                      setPaymentStatus("idle");
                    }}
                    className="mt-6"
                  >
                    Sluiten
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}