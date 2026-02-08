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
  ChevronDown,
  ChevronUp,
  Settings,
  Shield,
  Radio,
  Volume2,
  Camera,
  Download,
  Printer,
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
  
  // General specifications
  vat_status?: string;
  reference_code?: string;
  construction_material?: string;
  hull_shape?: string;
  hull_color?: string;
  deck_color?: string;
  clearance?: string;
  displacement?: string;
  steering?: string;
  beam?: string;
  draft?: string;
  
  // Engine and propulsion
  engine_brand?: string;
  engine_model?: string;
  engine_power?: string;
  engine_hours?: string;
  engine_type?: string;
  max_speed?: string;
  fuel_type?: string;
  fuel_capacity?: string;
  voltage?: string;
  fuel_consumption?: string;
  engine_quantity?: string;
  starting_type?: string;
  cylinders?: string;
  propulsion?: string;
  tachometer?: boolean;
  battery?: boolean;
  battery_capacity?: string;
  dynamo?: boolean;
  voltmeter?: boolean;
  
  // Accommodation
  cabins?: number;
  berths?: string;
  heads?: number;
  water_tank?: string;
  water_capacity?: string;
  water_system?: string;
  interior_type?: string;
  mattresses?: boolean;
  shower?: boolean;
  
  // Navigation and electronics
  kompas?: boolean;
  log_speed?: boolean;
  depth_gauge?: boolean;
  navigation_lights?: boolean;
  rudder_angle_indicator?: boolean;
  gps?: string;
  chart_plotter?: string;
  radio_cd_player?: string;
  fishfinder?: string;
  refrigerator?: string;
  
  // Outside equipment
  anchor?: string;
  anchor_rod?: boolean;
  sprayhood?: boolean;
  cockpit_tent?: boolean;
  tarpaulin?: string;
  pulpit?: boolean;
  swimming_platform?: boolean;
  swimming_ladder?: boolean;
  trailer_included?: boolean;
  trailer_details?: string;
  teak_deck?: boolean;
  fenders_lines?: boolean;
  cockpit_table?: boolean;
  water_ski_pole?: boolean;
  
  // Safety
  lifebuoy?: boolean;
  bilge_pump?: boolean;
  fire_extinguisher?: boolean;
  self_draining_cockpit?: boolean;
  safety_comments?: string;
  
  // Additional fields from screenshots
  ce_category?: string;
  ce_max_weight?: string;
  deck_superstructure_color?: string;
  deck_superstructure_construction?: string;
  open_cockpit?: boolean;
  control_place?: string;
  trim_flaps?: boolean;
  waterline_length?: string;
  water_tank_material?: string;
  propeller_type?: string;
  hour_meter?: boolean;
  running_hours?: string;
  serial_number?: string;
  engine_year?: string;
}

export default function YachtTerminalPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
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
    const interval = setInterval(fetchVesselData, 10000);
    return () => clearInterval(interval);
  }, [id]);

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const renderCheckbox = (value: boolean | undefined) => {
    return value ? (
      <span className="text-green-600 font-bold">✔</span>
    ) : (
      <span className="text-gray-300">□</span>
    );
  };

  const formatValue = (value: any) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "boolean") return value ? "Ja" : "Nee";
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-white text-[#003566] selection:bg-blue-100">
      <Toaster position="top-center" />

      {/* NAVIGATION HEADER */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/nl/yachts"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#003566] transition-colors"
          >
            <ArrowLeft size={16} /> Terug naar overzicht
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest bg-[#003566] text-white px-3 py-1 rounded">
            1-YB-192
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-600 hidden md:block">
            REF: {yacht.vessel_id || yacht.id}
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50">
            <Printer size={14} />
            <span className="text-xs">Print PDF</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50">
            <Download size={14} />
            <span className="text-xs">Documenten</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50">
            <Share2 size={14} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* BREADCRUMB */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li>
              <Link href="/" className="hover:text-[#003566]">Home</Link>
            </li>
            <li>›</li>
            <li>
              <Link href="/nl/yachts" className="hover:text-[#003566]">Boot aanbod</Link>
            </li>
            <li>›</li>
            <li className="font-semibold text-[#003566]">{yacht.boat_name}</li>
          </ol>
        </nav>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - MAIN INFO */}
          <div className="lg:col-span-2">
            {/* TITLE & PRICE */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#003566] mb-2">
                {yacht.boat_name}
              </h1>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-[#003566]">
                    € {yacht.price.toLocaleString("nl-NL")},-
                  </p>
                  <p className="text-sm text-slate-600">
                    {yacht.year} • {yacht.make} {yacht.model} • {yacht.length}m
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {yacht.vat_status || "Incl. BTW"}
                </span>
              </div>
            </div>

            {/* MAIN IMAGE */}
            <div className="mb-6">
              <div className="relative h-96 bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={activeImage}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                  alt={yacht.boat_name}
                />
              </div>
              {/* IMAGE THUMBNAILS */}
              <div className="flex gap-2 mt-2 overflow-x-auto py-2">
                {[yacht.main_image, ...yacht.images.map(img => img.url)]
                  .filter(Boolean)
                  .map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(`${STORAGE_URL}${img}`)}
                      className="flex-shrink-0 w-20 h-20 rounded border-2 border-transparent hover:border-[#003566] overflow-hidden"
                    >
                      <img
                        src={`${STORAGE_URL}${img}`}
                        className="w-full h-full object-cover"
                        alt={`Thumbnail ${index + 1}`}
                      />
                    </button>
                  ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#003566] mb-4">Beschrijving</h2>
              <p className="text-slate-700 leading-relaxed">
                {yacht.description || "Quicksilver 645 Cruiser – Compacte en veelzijdige sportcruiser met een 150 pk Mercury buitenboordmotor en Harbeck wegtrailer, comfortabele kajuit voor twee, ruime cockpit met lounge/eetfaciliteiten, en uitstekende handling en veiligheidsvoorzieningen."}
              </p>
            </div>

            {/* SPECIFICATION SECTIONS */}
            <div className="space-y-6">
              {/* GENERAL SPECIFICATIONS */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("general")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100"
                >
                  <h3 className="text-lg font-semibold text-[#003566]">Algemene specificaties</h3>
                  {expandedSections.general ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {expandedSections.general && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border-t border-slate-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SpecRow label="Merk / Model" value={`${yacht.make} ${yacht.model}`} />
                        <SpecRow label="Bouwjaar" value={yacht.year} />
                        <SpecRow label="Motor" value={`${yacht.engine_power} pk ${yacht.engine_brand} ${yacht.engine_type}`} />
                        <SpecRow label="Ligplaats" value={yacht.location} />
                        <SpecRow label="Referentiecode" value={yacht.reference_code} />
                        <SpecRow label="Bouwstof" value={yacht.construction_material} />
                        <SpecRow label="L x B x D" value={`${yacht.length}m x ${yacht.beam}m x ${yacht.draft}m`} />
                        <SpecRow label="Slaapplaatsen" value={yacht.berths} />
                        <SpecRow label="CE categorie" value={yacht.ce_category} />
                        <SpecRow label="CE max gewicht" value={yacht.ce_max_weight} />
                        <SpecRow label="Rompvorm" value={yacht.hull_shape} />
                        <SpecRow label="Rompskleur" value={yacht.hull_color} />
                        <SpecRow label="Dekkleur" value={yacht.deck_color} />
                        <SpecRow label="Dekconstructie" value={yacht.deck_superstructure_construction} />
                        <SpecRow label="Open Cockpit" value={formatValue(yacht.open_cockpit)} />
                        <SpecRow label="Vrije hoogte" value={yacht.clearance} />
                        <SpecRow label="Diepgang" value={yacht.draft} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PROPULSION */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("engine")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100"
                >
                  <h3 className="text-lg font-semibold text-[#003566]">Motor en aandrijving</h3>
                  {expandedSections.engine ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {expandedSections.engine && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border-t border-slate-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SpecRow label="Aantal motoren" value={yacht.engine_quantity} />
                        <SpecRow label="Starttype" value={yacht.starting_type} />
                        <SpecRow label="Type" value={yacht.engine_type} />
                        <SpecRow label="Merk" value={yacht.engine_brand} />
                        <SpecRow label="Model" value={yacht.engine_model} />
                        <SpecRow label="Serienummer" value={yacht.serial_number} />
                        <SpecRow label="Bouwjaar" value={yacht.engine_year} />
                        <SpecRow label="Aantal cilinders" value={yacht.cylinders} />
                        <SpecRow label="Vermogen" value={yacht.engine_power} />
                        <SpecRow label="Urenmeter" value={formatValue(yacht.hour_meter)} />
                        <SpecRow label="Gedraaide uren" value={yacht.running_hours} />
                        <SpecRow label="Brandstof" value={yacht.fuel_type} />
                        <SpecRow label="Verbruik" value={yacht.fuel_consumption} />
                        <SpecRow label="Aandrijving" value={yacht.propulsion} />
                        <SpecRow label="Brandstoftank capaciteit" value={yacht.fuel_capacity} />
                        <SpecRow label="Max snelheid" value={yacht.max_speed} />
                        <SpecRow label="Toerenteller" value={formatValue(yacht.tachometer)} />
                        <SpecRow label="Accu" value={formatValue(yacht.battery)} />
                        <SpecRow label="Accu capaciteit" value={yacht.battery_capacity} />
                        <SpecRow label="Dynamo" value={formatValue(yacht.dynamo)} />
                        <SpecRow label="Voltmeter" value={formatValue(yacht.voltmeter)} />
                        <SpecRow label="Spanning" value={yacht.voltage} />
                        <div className="md:col-span-2">
                          <SpecRow label="Opmerkingen" value="Motor met tracker" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ACCOMMODATION */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("accommodation")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100"
                >
                  <h3 className="text-lg font-semibold text-[#003566]">Accommodatie</h3>
                  {expandedSections.accommodation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {expandedSections.accommodation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border-t border-slate-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SpecRow label="Open Cockpit" value={formatValue(yacht.open_cockpit)} />
                        <SpecRow label="Vrije hoogte" value={yacht.clearance} />
                        <SpecRow label="Diepgang" value={yacht.draft} />
                        <SpecRow label="Waterlijn lengte" value={yacht.waterline_length} />
                        <SpecRow label="Waterverplaatsing" value={yacht.displacement} />
                        <SpecRow label="Besturing" value={yacht.steering} />
                        <SpecRow label="Plaats besturing" value={yacht.control_place} />
                        <SpecRow label="Trim flaps" value={formatValue(yacht.trim_flaps)} />
                        <SpecRow label="Kajuiten" value={yacht.cabins} />
                        <SpecRow label="Slaapplaatsen" value={yacht.berths} />
                        <SpecRow label="Interieurtype" value={yacht.interior_type} />
                        <SpecRow label="Matrassen" value={formatValue(yacht.mattresses)} />
                        <SpecRow label="Watertank" value={yacht.water_tank} />
                        <SpecRow label="Watertank materiaal" value={yacht.water_tank_material} />
                        <SpecRow label="Watersysteem" value={yacht.water_system} />
                        <SpecRow label="Aantal douches" value={formatValue(yacht.shower)} />
                        <SpecRow label="Radio CD speler" value={yacht.radio_cd_player} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* NAVIGATION & ELECTRONICS */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("navigation")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100"
                >
                  <h3 className="text-lg font-semibold text-[#003566]">Navigatie en elektronica</h3>
                  {expandedSections.navigation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {expandedSections.navigation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border-t border-slate-200"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SpecRow label="Kompas" value={formatValue(yacht.kompas)} />
                          <SpecRow label="Log/snelheid" value={formatValue(yacht.log_speed)} />
                          <SpecRow label="Dieptemeter" value={formatValue(yacht.depth_gauge)} />
                          <SpecRow label="Navigatieverlichting" value={formatValue(yacht.navigation_lights)} />
                          <SpecRow label="Roerhoek indicator" value={formatValue(yacht.rudder_angle_indicator)} />
                          <SpecRow label="GPS" value={yacht.gps} />
                          <SpecRow label="Kaartplotter" value={yacht.chart_plotter} />
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                          <h4 className="font-semibold text-slate-700 mb-2">Visdieptemeter</h4>
                          <SpecRow label="Simrad Evo 3" value="" />
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                          <h4 className="font-semibold text-slate-700 mb-2">Buitenboordapparatuur</h4>
                          <SpecRow label="Fishfinder" value={yacht.fishfinder} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* OUTSIDE EQUIPMENT */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("equipment")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100"
                >
                  <h3 className="text-lg font-semibold text-[#003566]">Buitenboord uitrusting</h3>
                  {expandedSections.equipment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {expandedSections.equipment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border-t border-slate-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SpecRow label="Anker" value={yacht.anchor} />
                        <SpecRow label="Ankerstok" value={renderCheckbox(yacht.anchor_rod)} />
                        <SpecRow label="Sprayhood" value={renderCheckbox(yacht.sprayhood)} />
                        <SpecRow label="Cockpittent" value={renderCheckbox(yacht.cockpit_tent)} />
                        <SpecRow label="Zeilen" value={yacht.tarpaulin} />
                        <SpecRow label="Pulpit" value={renderCheckbox(yacht.pulpit)} />
                        <SpecRow label="Zwemplatform" value={renderCheckbox(yacht.swimming_platform)} />
                        <SpecRow label="Zwemladder" value={renderCheckbox(yacht.swimming_ladder)} />
                        <SpecRow label="Trailer" value={yacht.trailer_details} />
                        <SpecRow label="Teakdek" value={renderCheckbox(yacht.teak_deck)} />
                        <SpecRow label="Fenders, lijnen" value={renderCheckbox(yacht.fenders_lines)} />
                        <SpecRow label="Cockpittafel" value={renderCheckbox(yacht.cockpit_table)} />
                        <div className="md:col-span-2">
                          <SpecRow label="Opmerkingen" value="Water ski pole" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SAFETY */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("safety")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100"
                >
                  <h3 className="text-lg font-semibold text-[#003566]">Veiligheid</h3>
                  {expandedSections.safety ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {expandedSections.safety && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 border-t border-slate-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SpecRow label="Reddingsboei" value={renderCheckbox(yacht.lifebuoy)} />
                        <SpecRow label="Bilgepomp" value={renderCheckbox(yacht.bilge_pump)} />
                        <SpecRow label="Brandblusser" value={renderCheckbox(yacht.fire_extinguisher)} />
                        <SpecRow label="Zelflozend cockpit" value={renderCheckbox(yacht.self_draining_cockpit)} />
                        <div className="md:col-span-2">
                          <SpecRow label="Opmerkingen" value="1x ruitenwisser" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - ACTIONS & CONTACT */}
          <div className="lg:col-span-1">
            {/* BIDDING SECTION */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#003566] mb-4">Bieden</h3>
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-1">Huidig hoogste bod</p>
                <p className="text-2xl font-bold text-[#003566]">
                  € {yacht.current_bid ? Number(yacht.current_bid).toLocaleString() : yacht.price.toLocaleString()}
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Voer uw bod in (€)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003566]"
                />
                <Button
                  onClick={placeBid}
                  className="w-full bg-[#003566] hover:bg-blue-900 text-white py-3"
                >
                  <Gavel size={18} className="mr-2" />
                  Plaats bod
                </Button>
              </div>
            </div>

            {/* DIRECT PURCHASE */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#003566] mb-4">Direct kopen</h3>
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-1">Vraagprijs</p>
                <p className="text-3xl font-bold text-[#003566]">
                  € {yacht.price.toLocaleString()},-
                </p>
                <p className="text-sm text-slate-500 mt-1">{yacht.vat_status || "Incl. BTW"}</p>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                Direct kopen
              </Button>
            </div>

            {/* TEST SAIL */}
            <div className="border border-slate-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#003566] mb-4">Proefvaart</h3>
              <p className="text-sm text-slate-600 mb-4">
                Boek een proefvaart om de boot te ervaren.
              </p>
              <Button variant="outline" className="w-full border-[#003566] text-[#003566] hover:bg-blue-50 py-3">
                <Calendar size={18} className="mr-2" />
                Proefvaart boeken
              </Button>
            </div>

            {/* CONTACT FORM */}
            <div className="border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#003566] mb-4">Meer informatie</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Uw voor- en achternaam *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003566]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefoonnummer *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003566]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003566]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ik wil graag...
                  </label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003566]">
                    <option>Meer informatie ontvangen</option>
                    <option>Een bezichtiging plannen</option>
                    <option>Een proefvaart boeken</option>
                    <option>Direct een bod uitbrengen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Uw vraag of opmerking
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003566]"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#003566] hover:bg-blue-900 text-white py-3">
                  Versturen
                </Button>
              </form>
            </div>

            {/* DEALER INFO */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-[#003566] mb-2">Makelaar - Schepenkring Roermond</h4>
              <p className="text-sm text-slate-600">Herteneweg 2, Roermond 6049 AA</p>
              <p className="text-sm text-slate-600">+31 (0) 475 315661</p>
              <p className="text-sm text-slate-600">roermond@schepenkring.nl</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Route berekenen
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value?: any }) {
  if (value === undefined || value === null || value === "") return null;
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-[#003566]">{value}</span>
    </div>
  );
}