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
  
  // From screenshots
  ce_category?: string;
  ce_max_weight?: string;
  deck_superstructure_color?: string;
  deck_superstructure_construction?: string;
  open_cockpit?: boolean;
  waterline_length?: string;
  water_displacement?: string;
  control?: string;
  control_place?: string;
  trim_flaps?: boolean;
  
  // Engine and propulsion
  number_of_identical_engines?: string;
  start_type?: string;
  engine_type?: string;
  engine_brand?: string;
  engine_model?: string;
  serial_number?: string;
  engine_year?: string;
  amount_of_cylinders?: string;
  engine_power?: string;
  hour_meter?: boolean;
  running_hours?: string;
  fuel_type?: string;
  fuel_consumption?: string;
  propulsion?: string;
  fuel_tank_quantity?: boolean;
  max_speed?: string;
  tachometer?: boolean;
  battery?: boolean;
  battery_capacity?: string;
  dynamo?: boolean;
  voltmeter?: boolean;
  voltage?: string;
  engine_comments?: string;
  
  // Accommodation
  cabins?: number;
  berths?: string;
  interior_type?: string;
  mattresses?: boolean;
  water_tank?: string;
  water_tank_material?: string;
  water_system?: string;
  number_of_showers?: string;
  radio_cd_player?: string;
  
  // Navigation and electronics
  kompas?: boolean;
  log_speed?: boolean;
  depth_gauge?: boolean;
  navigation_lights?: boolean;
  rudder_angle_indicator?: boolean;
  gps?: string;
  chart_plotter?: string;
  fishfinder?: string;
  refrigerator?: string;
  
  // Outside equipment
  anchors_material?: string;
  anchor_rod?: boolean;
  sprayhood?: boolean;
  cockpit_tent?: boolean;
  tarpaulin?: string;
  pulpit_bastion?: boolean;
  swimming_platform?: boolean;
  swimming_ladder?: boolean;
  trailer?: string;
  teak_deck?: boolean;
  fenders_lines?: boolean;
  cockpit_table?: boolean;
  equipment_comments?: string;
  
  // Safety
  lifebuoy?: boolean;
  bilge_pump?: boolean;
  fire_extinguisher?: boolean;
  self_draining_cockpit?: boolean;
  safety_comments?: string;
}

export default function YachtTerminalPage() {
  const { id } = useParams();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

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

  const formatCheckbox = (value: boolean | undefined) => {
    return value ? "✔" : "";
  };

  if (loading || !yacht) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Toaster position="top-center" />

      {/* EXACT HERO SECTION - MATCHING SCREENSHOT */}
      <div className="border-b border-gray-200">
        {/* TOP BAR WITH REFERENCE AND ACTIONS */}
        <div className="bg-white py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
              {/* LEFT: REFERENCE NUMBER */}
              <div className="text-xl font-bold text-gray-900">
                1-YB-192
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
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Images size={16} />
                  Photos
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
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

        {/* TITLE SECTION */}
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
                <span className="font-semibold text-gray-900">{yacht.boat_name}</span>
              </span>
            </div>

            {/* MAIN TITLE AND PRICE */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {yacht.boat_name} · € {yacht.price.toLocaleString("nl-NL")},-
                </h1>
              </div>
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

      {/* REST OF THE CONTENT (Your existing content goes here) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Continue with the rest of your page content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - SPECIFICATIONS */}
          <div className="lg:col-span-2">
            {/* IMAGE SECTION */}
            <div className="mb-8">
              <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img
                  src={activeImage || PLACEHOLDER_IMAGE}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                  alt={yacht.boat_name}
                />
              </div>
              <button 
                onClick={() => setShowAllPhotos(!showAllPhotos)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Show more photos
              </button>
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
                <div className="mt-2 p-4 bg-gray-50 rounded">
                  <p className="font-medium">Boat specifications</p>
                </div>
              )}
            </div>

            {/* GENERAL SPECIFICATIONS */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                General specifications
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Asking price</p>
                    <p className="text-lg font-bold">€ {yacht.price.toLocaleString("nl-NL")},-</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">VAT status</p>
                    <p className="text-lg">{yacht.vat_status || "Incl. BTW"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Categories</p>
                    <p className="text-lg">Speedboats and sports boats</p>
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
                    <p className="text-sm font-medium text-gray-700">Motor</p>
                    <p className="text-lg">{yacht.engine_power} pk {yacht.engine_brand} {yacht.engine_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">berth</p>
                    <p className="text-lg">in verkoophaven Schepenkring Roermond</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Comments</p>
                  <p className="text-gray-700">
                    {yacht.description || "Quicksilver 645 Cruiser – Compacte en veelzijdige sportcruiser met een 150 pk Mercury buitenboordmotor en Harbeck wegtrailer, comfortabele kajuit voor twee, ruime cockpit met lounge/eetfaciliteiten, en uitstekende handling en veiligheidsvoorzieningen."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reference code</p>
                    <p className="text-lg">{yacht.reference_code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Building material</p>
                    <p className="text-lg">{yacht.construction_material}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">L x W x D approx.</p>
                    <p className="text-lg">{yacht.length} m x {yacht.beam} m x {yacht.draft} m</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sleeps</p>
                    <p className="text-lg">{yacht.berths}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ENGINE AND ELECTRICS */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Engine and electrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Number of identical engines</p>
                  <p className="text-lg">{yacht.number_of_identical_engines || "1"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Start type</p>
                  <p className="text-lg">{yacht.start_type || "Electric"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-lg">{yacht.engine_type || "Outboard"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Brand</p>
                  <p className="text-lg">{yacht.engine_brand || "Mercury"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Door Design</p>
                  <p className="text-lg">{yacht.engine_model || "ME F150 XLEFI-4266"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Serial Number</p>
                  <p className="text-lg">{yacht.serial_number || "2B44366"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Year of construction</p>
                  <p className="text-lg">{yacht.engine_year || "2018"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Amount of cilinders</p>
                  <p className="text-lg">{yacht.amount_of_cylinders || "4"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Power</p>
                  <p className="text-lg">{yacht.engine_power || "150"} hp</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Hour meter</p>
                  <p className="text-lg">{formatCheckbox(yacht.hour_meter)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Running hours</p>
                  <p className="text-lg">{yacht.running_hours || "80 (+/-)"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fuel</p>
                  <p className="text-lg">{yacht.fuel_type || "Petrol Euro 95"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Consumption</p>
                  <p className="text-lg">{yacht.fuel_consumption || "7 liters/hour"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Propulsion</p>
                  <p className="text-lg">{yacht.propulsion || "Screw"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fuel tank quantity</p>
                  <p className="text-lg">{formatCheckbox(yacht.fuel_tank_quantity)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Max speed</p>
                  <p className="text-lg">{yacht.max_speed || "65 km/h"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Tachometer</p>
                  <p className="text-lg">{formatCheckbox(yacht.tachometer)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Battery</p>
                  <p className="text-lg">
                    {formatCheckbox(yacht.battery)} {yacht.battery_capacity && `Capacity: ${yacht.battery_capacity}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Dynamo</p>
                  <p className="text-lg">{formatCheckbox(yacht.dynamo)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Voltmeter</p>
                  <p className="text-lg">{formatCheckbox(yacht.voltmeter)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Voltage</p>
                  <p className="text-lg">{yacht.voltage || "12 volt"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Comments</p>
                  <p className="text-lg">{yacht.engine_comments || "Motor with tracker"}</p>
                </div>
              </div>
            </div>

            {/* ACCOMMODATION */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Accommodation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Open Cockpit (OK)</p>
                  <p className="text-lg">{formatCheckbox(yacht.open_cockpit)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Normal clearance height</p>
                  <p className="text-lg">{yacht.clearance || "179.0"} m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Draught</p>
                  <p className="text-lg">{yacht.draft || "49 cm"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Waterline length</p>
                  <p className="text-lg">{yacht.waterline_length || "612 cm"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Water displacement</p>
                  <p className="text-lg">{yacht.water_displacement || "1060 kg"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Control</p>
                  <p className="text-lg">{yacht.control || "Steering wheel"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Place control</p>
                  <p className="text-lg">{yacht.control_place || "Outside"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Trim flaps</p>
                  <p className="text-lg">{formatCheckbox(yacht.trim_flaps)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">cabins</p>
                  <p className="text-lg">{yacht.cabins || "1"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Sleeps</p>
                  <p className="text-lg">{yacht.berths || "2 solid"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Type of interior</p>
                  <p className="text-lg">{yacht.interior_type || "Modern, light"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Mattresses</p>
                  <p className="text-lg">{formatCheckbox(yacht.mattresses)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Water tank & material</p>
                  <p className="text-lg">{yacht.water_tank || "45 liters Plastic"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Water system</p>
                  <p className="text-lg">{yacht.water_system || "Pressure system Electric pump"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Number of showers</p>
                  <p className="text-lg">{yacht.number_of_showers || "1"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Radio CD player</p>
                  <p className="text-lg">{yacht.radio_cd_player || "Fusion stereo system"}</p>
                </div>
              </div>
            </div>

            {/* NAVIGATION AND ELECTRONICS */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Navigation and electronics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Kompas</p>
                  <p className="text-lg">{formatCheckbox(yacht.kompas)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Log/speed</p>
                  <p className="text-lg">{formatCheckbox(yacht.log_speed)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Depth gauge</p>
                  <p className="text-lg">{formatCheckbox(yacht.depth_gauge)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Navigation lights</p>
                  <p className="text-lg">{formatCheckbox(yacht.navigation_lights)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Rudder angle indicator</p>
                  <p className="text-lg">{formatCheckbox(yacht.rudder_angle_indicator)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">GPS</p>
                  <p className="text-lg">{yacht.gps || "Simrad Evo 3"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">chart plotter</p>
                  <p className="text-lg">{yacht.chart_plotter || "Simrad Evo 3 with Europe map from Navionics"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Fishfinder</p>
                  <p className="text-lg">{yacht.fishfinder || "Simrad Evo 3"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Radio CD player</p>
                  <p className="text-lg">{yacht.radio_cd_player || "Fusion stereo system"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Refrigerator & food</p>
                  <p className="text-lg">{yacht.refrigerator || "Electric 12V cool box"}</p>
                </div>
              </div>
            </div>

            {/* OUTSIDE EQUIPMENT */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Outside equipment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Anchors & Material</p>
                  <p className="text-lg">{yacht.anchors_material || "Delta anchor 4kg"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Anchor rod</p>
                  <p className="text-lg">{formatCheckbox(yacht.anchor_rod)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Sprayhood</p>
                  <p className="text-lg">{formatCheckbox(yacht.sprayhood)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Cockpit tent</p>
                  <p className="text-lg">{formatCheckbox(yacht.cockpit_tent)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Tarpaulin(s)</p>
                  <p className="text-lg">{yacht.tarpaulin || "Winter tent and transport hood"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Pulpit and bastion(s)</p>
                  <p className="text-lg">{formatCheckbox(yacht.pulpit_bastion)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Swimming platform</p>
                  <p className="text-lg">{formatCheckbox(yacht.swimming_platform)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Swimming ladder</p>
                  <p className="text-lg">{formatCheckbox(yacht.swimming_ladder)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Trailer</p>
                  <p className="text-lg">{yacht.trailer || "Harbeck 2200 KG"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Teak deck</p>
                  <p className="text-lg">{formatCheckbox(yacht.teak_deck)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fenders, lines</p>
                  <p className="text-lg">{formatCheckbox(yacht.fenders_lines)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">cockpit table</p>
                  <p className="text-lg">{formatCheckbox(yacht.cockpit_table)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Comments</p>
                  <p className="text-lg">{yacht.equipment_comments || "Water ski pole"}</p>
                </div>
              </div>
            </div>

            {/* SAFETY */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Safety
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Lifebuoy</p>
                  <p className="text-lg">{formatCheckbox(yacht.lifebuoy)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Bilge pump</p>
                  <p className="text-lg">{formatCheckbox(yacht.bilge_pump)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fire extinguisher</p>
                  <p className="text-lg">{formatCheckbox(yacht.fire_extinguisher)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Self-draining cockpit</p>
                  <p className="text-lg">{formatCheckbox(yacht.self_draining_cockpit)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Comments</p>
                  <p className="text-lg">{yacht.safety_comments || "1x windshield wiper"}</p>
                </div>
              </div>
            </div>

            {/* MEDIA SECTION */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Media of the Quicksilver 645 Cruiser
              </h2>
              <p className="text-gray-700">Photos and documents will be displayed here.</p>
            </div>
          </div>

          {/* RIGHT COLUMN - CONTACT & INFO */}
          <div className="lg:col-span-1">
            {/* DEALER INFO */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Makelaar - Schepenkring Roermond
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone number</p>
                  <p className="text-lg">+31 (0) 475 315661</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-lg">Herteneweg 2, Roermond 6049 AA</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-lg">roermond@schepenkring.nl</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                  Route calculate route
                </Button>
              </div>
            </div>

            {/* ADDITIONAL SPECS */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                More information about the Quicksilver 645 Cruiser
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">werf</p>
                  <p className="text-lg">Quicksilver</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">CE</p>
                  <p className="text-lg">C</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">CE max weight</p>
                  <p className="text-lg">845 kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Hull shape</p>
                  <p className="text-lg">V-bottom</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Hull color</p>
                  <p className="text-lg">Black</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Deck and superstructure colour</p>
                  <p className="text-lg">White</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Deck and superstructure construction</p>
                  <p className="text-lg">Grp (Polyester) Anti-slip and teak</p>
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                More information about the Quicksilver 645 Cruiser
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
                    Your comment or question about the Quicksilver 645 Cruiser
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Send
                </Button>
                <p className="text-xs text-gray-500 mt-2">* Required field</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVACY FOOTER */}
      <div className="border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>Privacy - Terms</p>
        </div>
      </div>
    </div>
  );
}