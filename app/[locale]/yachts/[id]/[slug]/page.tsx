"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Gavel,
  CheckCircle2,
  History,
  Anchor,
  Loader2,
  Mail,
  Phone,
  Printer,
  Image as ImageIcon,
  Share,
  GalleryHorizontal,
  ChevronRight,
  X,
  Plus,
  Minus,
  AlertCircle,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast, Toaster } from "react-hot-toast";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80";
const BROKER_LOGO_FALLBACK = "/schepenkring-logo.png"; // your local logo

// ----- Roboto font (exact match) -----
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

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
  external_url?: string;
  print_url?: string;
  owners_comment?: string;
  reg_details?: string;
  known_defects?: string;
  last_serviced?: string;
  beam?: string;
  draft?: string;
  loa?: string;
  lwl?: string;
  air_draft?: string;
  passenger_capacity?: string;
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
  cockpit_type?: string;
  control_type?: string;
  ballast?: string;
  displacement?: string;
  cabins?: string;
  berths?: string;
  toilet?: string;
  shower?: string;
  bath?: string;
  heating?: string;
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

const DUTCH_DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const DUTCH_MONTHS = [
  "Januari",
  "Februari",
  "Maart",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Augustus",
  "September",
  "Oktober",
  "November",
  "December",
];

interface CalendarDay {
  date: Date;
  available: boolean;
  isCurrentMonth: boolean;
}

interface Bid {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  user: { id: number; name: string };
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export default function YachtTerminalPage() {
  const { id, slug } = useParams() as { id: string; slug?: string };
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
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");
  const [showTestSailForm, setShowTestSailForm] = useState(false);
  const [testSailStatus, setTestSailStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");

  // ---------- FORM STATES (auto-filled from localStorage) ----------
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    requestType: "",
    comment: "",
  });

  const [placingBid, setPlacingBid] = useState(false);
  const [bidError, setBidError] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  const getUserData = () => {
    if (typeof window !== "undefined") {
      const userDataStr = localStorage.getItem("user_data");
      if (userDataStr) {
        try {
          return JSON.parse(userDataStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  // ----- Pre-fill forms when auth state changes -----
  useEffect(() => {
    const token = getAuthToken();
    const userData = getUserData();
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);

      // Pre-fill contact form
      setContactForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.mobile || "", // Changed from phone_number to mobile
        requestType: "",
        comment: "",
      });

      // Pre-fill test sail booking form
      setBookingForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.mobile || "", // Changed from phone_number to mobile
        notes: "",
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
      // Clear forms when logged out
      setContactForm({
        name: "",
        email: "",
        phone: "",
        requestType: "",
        comment: "",
      });
      setBookingForm({ name: "", email: "", phone: "", notes: "" });
    }
  }, []); // runs once on mount

  useEffect(() => {
    fetchVesselData();
    const interval = setInterval(fetchVesselData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (yacht && slug) {
      const expectedSlug = generateSlug(
        yacht.boat_name || yacht.vessel_id || `yacht-${id}`,
      );
      if (slug !== expectedSlug) {
        router.replace(`/nl/yachts/${id}/${expectedSlug}`);
      }
    }
  }, [yacht, slug, id, router]);

  useEffect(() => {
    if (showTestSailForm) generateCalendarDays();
  }, [showTestSailForm, currentMonth]);

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
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, available: true, isCurrentMonth: true });
    }
    setCalendarDays(days);
    fetchAvailableDatesForMonth();
  };

  const fetchAvailableDatesForMonth = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const res = await api.get(
        `/yachts/${id}/available-dates?month=${month}&year=${year}`,
      );
      const availableDates = res.data.availableDates || [];
      setCalendarDays((prev) =>
        prev.map((day) => ({
          ...day,
          available: availableDates.includes(formatDate(day.date)),
        })),
      );
    } catch (error) {
      console.error("Error fetching available dates:", error);
    }
  };

  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

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

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("nl-NL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const openPhotoGallery = (imageUrl: string, index: number) => {
    setSelectedGalleryImage(imageUrl);
    setCurrentPhotoIndex(index);
    setShowPhotoGallery(true);
  };

  const navigateGallery = (direction: "prev" | "next") => {
    if (!yacht) return;
    const allImages = [
      yacht.main_image
        ? `${STORAGE_URL}${yacht.main_image}`
        : PLACEHOLDER_IMAGE,
      ...yacht.images.map((img) => `${STORAGE_URL}${img.url}`),
    ];
    let newIndex =
      direction === "next"
        ? (currentPhotoIndex + 1) % allImages.length
        : (currentPhotoIndex - 1 + allImages.length) % allImages.length;
    setCurrentPhotoIndex(newIndex);
    setSelectedGalleryImage(allImages[newIndex]);
  };

  const placeBid = async () => {
    if (!yacht) return;
    const amount = parseInt(bidAmount, 10); // force integer
    if (isNaN(amount) || amount <= 0) {
      setBidError("Voer een geldig bedrag in (alleen hele euro's)");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      toast.error("U moet ingelogd zijn om een bod te plaatsen.");
      router.push("/login");
      return;
    }
    if (yacht.status === "Sold") {
      setBidError("Dit schip is al verkocht");
      toast.error("Dit schip is al verkocht");
      return;
    }
    if (!["For Bid", "For Sale"].includes(yacht.status)) {
      setBidError("Dit schip is niet beschikbaar voor biedingen");
      toast.error("Dit schip is niet beschikbaar voor biedingen");
      return;
    }
    const currentPrice = yacht.current_bid
      ? Number(yacht.current_bid)
      : Number(yacht.price);
    const minBidAmount = yacht.min_bid_amount || yacht.price * 0.9;
    const minBidAmountInt = Math.ceil(minBidAmount); // round up to nearest euro
    if (amount < minBidAmountInt) {
      setBidError(
        `Bod moet minimaal €${minBidAmountInt.toLocaleString("nl-NL")} zijn (90% van vraagprijs, afgerond)`,
      );
      toast.error(
        `Bod is te laag. Minimaal bod is €${minBidAmountInt.toLocaleString("nl-NL")}.`,
      );
      return;
    }
    if (amount <= currentPrice) {
      setBidError(
        `Bod moet hoger zijn dan €${currentPrice.toLocaleString("nl-NL")}`,
      );
      return;
    }
    setPlacingBid(true);
    setBidError("");
    try {
      const response = await fetch(`https://schepen-kring.nl/api/bids/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ yacht_id: yacht.id, amount }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Geen toegang. Log opnieuw in.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
          return;
        }
        if (response.status === 422) {
          setBidError(
            data.message || data.errors?.amount?.[0] || "Bod plaatsen mislukt",
          );
          toast.error(data.message || "Bod plaatsen mislukt");
          return;
        }
        throw new Error(data.message || "Bod plaatsen mislukt");
      }
      toast.success("Bod geplaatst! De verkoper zal uw bod beoordelen.");
      setBidAmount("");
      setTimeout(() => {
        fetchVesselData();
      }, 1000);
    } catch (e: any) {
      console.error("Bid error:", e);
      setBidError(e.message || "Bod plaatsen mislukt");
      toast.error(e.message || "Bod plaatsen mislukt");
    } finally {
      setPlacingBid(false);
    }
  };

  // ----- Contact form submission (creates a task for admin) -----
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      toast.error("Vul uw naam, e-mail en telefoonnummer in");
      return;
    }
    try {
      const token = getAuthToken();
      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("https://schepen-kring.nl/api/tasks", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: `INFORMATIE AANVRAAG: ${yacht?.boat_name}`,
          description: `Klant vraagt meer informatie over ${yacht?.boat_name} (${yacht?.vessel_id}).\n\nNaam: ${contactForm.name}\nEmail: ${contactForm.email}\nTelefoon: ${contactForm.phone}\nAanvraag type: ${contactForm.requestType || "Niet gespecificeerd"}\nOpmerking: ${contactForm.comment || "Geen"}`,
          priority: "Medium",
          status: "To Do",
          yacht_id: yacht?.id,
        }),
      });
      toast.success("Informatie aanvraag verzonden!");
      setContactForm((prev) => ({ ...prev, requestType: "", comment: "" })); // keep name/email/phone
    } catch {
      toast.error("Verzenden mislukt.");
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
    setTestSailStatus("processing");
    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      const token = getAuthToken();
      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const bookingResponse = await fetch(
        `https://schepen-kring.nl/api/yachts/${yacht?.id}/book`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            start_at: startDateTime.toISOString(),
            name: bookingForm.name,
            email: bookingForm.email,
            phone: bookingForm.phone,
            notes: bookingForm.notes,
          }),
        },
      );
      if (!bookingResponse.ok) throw new Error("Booking failed");
      await fetch("https://schepen-kring.nl/api/tasks", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: `PROEFVAART AANVRAAG: ${yacht?.boat_name}`,
          description: `Klant heeft een proefvaart aangevraagd voor ${selectedDate?.toLocaleDateString("nl-NL")} om ${selectedTime}.\n\nKlantgegevens:\nNaam: ${bookingForm.name}\nEmail: ${bookingForm.email}\nTelefoon: ${bookingForm.phone || "Niet opgegeven"}\nOpmerkingen: ${bookingForm.notes || "Geen"}`,
          priority: "Medium",
          status: "To Do",
          yacht_id: yacht?.id,
        }),
      });
      setTestSailStatus("success");
      toast.success("Proefvaart succesvol aangevraagd!");
      setTimeout(() => {
        setShowTestSailForm(false);
        setTestSailStatus("idle");
        setSelectedDate(null);
        setSelectedTime(null);
        setAvailableSlots([]);
        // Keep the pre-filled user data, only clear notes
        setBookingForm((prev) => ({ ...prev, notes: "" }));
      }, 3000);
    } catch (error) {
      setTestSailStatus("idle");
      toast.error("Boeking mislukt.");
    }
  };

  const handleBuyNow = async () => {
    setPaymentStatus("processing");
    try {
      const token = getAuthToken();
      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch("https://schepen-kring.nl/api/tasks", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: `URGENT: KOOP NU AANVRAAG - ${yacht?.boat_name}`,
          description: `KLANT WIL DEZE BOOT DIRECT KOPEN!\n\nBedrag: €${yacht?.price.toLocaleString()}\n\nStop de veiling en neem contact op met de klant.`,
          priority: "High",
          status: "To Do",
          yacht_id: yacht?.id,
        }),
      });
      if (!response.ok) throw new Error("Task creation failed");
      setPaymentStatus("success");
      toast.success("Aankoop aanvraag succesvol verzonden!");
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
      const res = await api.get(
        `https://schepen-kring.nl/api/yachts/${id}/available-slots?date=${dateStr}`,
      );
      setAvailableSlots(
        res.data.timeSlots || [
          "09:00",
          "10:30",
          "12:00",
          "13:30",
          "15:00",
          "16:30",
        ],
      );
      setSelectedTime(null);
    } catch {
      setAvailableSlots(["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"]);
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
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleMoreInfo = () => {
    window.location.href = `mailto:info@schepen-kring.nl?subject=Informatie aanvraag: ${yacht?.boat_name}&body=Ik zou graag meer informatie willen over de ${yacht?.boat_name} (${yacht?.vessel_id})`;
  };

  const handlePrintPDF = () => {
    window.open(yacht?.print_url || `#`, "_blank");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link gekopieerd naar klembord");
    } catch {
      toast.error("Kan link niet kopiëren");
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setBidAmount("");
    } else {
      // allow only integer digits
      const intVal = parseInt(val, 10);
      if (!isNaN(intVal)) {
        setBidAmount(intVal.toString());
      }
    }
    setBidError("");
  };

  if (loading || !yacht) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white font-roboto">
        <Loader2 className="animate-spin text-[#2a77b1]" size={40} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Manifest synchroniseren...
        </p>
      </div>
    );
  }

  const depositAmount = yacht.price * 0.1;
  const allImages = [
    yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : PLACEHOLDER_IMAGE,
    ...yacht.images.map((img) => `${STORAGE_URL}${img.url}`),
  ];
  const mainImage = allImages[0];
  const otherImages = allImages.slice(1, 5);
  const hasMoreImages = allImages.length > 5;
  const galleryImagesToShow = expandedGallery
    ? allImages
    : allImages.slice(0, 8);
  const formattedPrice = `€ ${formatPrice(yacht.price)}`;
  const minBidAmount = yacht.min_bid_amount || yacht.price * 0.9;
  const minBidAmountInt = Math.ceil(minBidAmount); // integer minimum

  return (
    <div className="min-h-screen bg-white text-[#333] selection:bg-blue-100 font-roboto antialiased">
      // <Toaster position="top-center" />
      {/* ----- EXACT PHOTO GRID CSS (from original, made responsive) ----- */}
      <style>{`
        .photos-holder-grid {
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          height: 500px;
        }
        .inner-photo-holder {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-gap: 10px;
          padding-top: 10px;
          background-color: #f3f4fa;
          height: 500px;
          width: 100%;
        }
        .photo-of-object {
          overflow: hidden;
          background-color: #ededed;
          position: relative;
          transition: 0.4s;
        }
        .photo-of-object:hover { opacity: 0.7; }
        .photo-of-object img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          aspect-ratio: 16/9;
        }
        .photo-of-object:nth-last-of-type(n+5):first-of-type:first-child,
        .photo-of-object:nth-last-of-type(n+5):first-of-type~:first-child {
          grid-row: span 2;
          grid-column: span 6;
        }
        .photo-of-object:nth-last-of-type(n+5):first-of-type:nth-child(2),
        .photo-of-object:nth-last-of-type(n+5):first-of-type~:nth-child(2),
        .photo-of-object:nth-last-of-type(n+5):first-of-type:nth-child(3),
        .photo-of-object:nth-last-of-type(n+5):first-of-type~:nth-child(3),
        .photo-of-object:nth-last-of-type(n+5):first-of-type:nth-child(4),
        .photo-of-object:nth-last-of-type(n+5):first-of-type~:nth-child(4),
        .photo-of-object:nth-last-of-type(n+5):first-of-type:nth-child(5),
        .photo-of-object:nth-last-of-type(n+5):first-of-type~:nth-child(5) {
          grid-column: span 3;
        }
        .photo-of-object:nth-last-of-type(n+5):first-of-type:nth-child(n+6),
        .photo-of-object:nth-last-of-type(n+5):first-of-type~:nth-child(n+6) {
          display: none;
        }
        @media screen and (max-width: 767px) {
          .photos-holder-grid { padding-left: 0; padding-right: 0; }
          .inner-photo-holder { grid-template-columns: 1fr; }
          .photo-of-object:nth-last-of-type(n+1):first-of-type:nth-child(n+2),
          .photo-of-object:nth-last-of-type(n+1):first-of-type~:nth-child(n+2) {
            display: none !important;
          }
        }
        /* Hide check icon when adjacent text exists */
        .vibp_spec_value .check-icon {
          display: inline-block;
          margin-right: 4px;
        }
        .vibp_spec_value:has(span:not(:empty):not(.check-icon)) .check-icon,
        .vibp_spec_value:has(p:not(:empty)) .check-icon {
          display: none !important;
        }
      `}</style>
      <main className="font-roboto">
        {/* ----- PHOTO GRID – EXACT LAYOUT ----- */}
        <div className="photos-holder-grid">
          <div className="inner-photo-holder">
            {allImages.slice(0, 5).map((img, idx) => (
              <div key={idx} className="photo-of-object">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openPhotoGallery(img, idx);
                  }}
                >
                  <img
                    src={img}
                    onError={handleImageError}
                    alt={`${yacht.boat_name} ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ----- TOP ACTION BAR (EXACT) ----- */}
        <div className="bg-gray-50 py-4 px-6 border-y border-gray-200 mt-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-serif italic text-[#2a77b1] notranslate">
                {yacht.boat_name}
              </h1>
              <span className="text-2xl md:text-3xl font-serif italic text-[#2a77b1]">
                {formattedPrice}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMoreInfo}
                className="bg-[#e0332d] hover:bg-[#c02a24] text-white px-6 py-3 font-medium text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Mail size={16} />
                More information
              </button>
              <button
                onClick={handlePrintPDF}
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
                onClick={handleShare}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Share size={16} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* ----- BREADCRUMBS & BACK LINK (EXACT) ----- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8">
          <div className="flex flex-wrap justify-between items-center text-sm">
            <Link
              href="/nl/yachts"
              className="flex items-center gap-2 text-[#2a77b1] hover:text-[#e0332d] transition-colors font-medium"
            >
              <ArrowLeft size={18} /> ❮ Back to overview
            </Link>
            <div className="text-gray-600">
              <Link href="/" className="hover:text-[#2a77b1]">
                Home
              </Link>{" "}
              ❯
              <Link href="/nl/yachts" className="hover:text-[#2a77b1] ml-1">
                {" "}
                Boat offer
              </Link>{" "}
              ❯
              <span className="ml-1 text-gray-800 notranslate">
                {yacht.boat_name}
              </span>
            </div>
          </div>
        </div>

        {/* ----- TWO‑COLUMN LAYOUT ----- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* ----- LEFT COLUMN (8/12) ----- */}
            <div className="lg:col-span-2 space-y-10">
              {/* GENERAL SPECIFICATIONS */}
              <SpecCard title="General specifications">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <SpecItem label="Asking price" value={formattedPrice} />
                  <SpecItem label="VAT status" value="Including VAT" />
                  <SpecItem
                    label="Categories"
                    value="Speedboats and sports boats"
                  />
                  <SpecItem
                    label="Brand / Model"
                    value={
                      `${yacht.make || yacht.builder || ""} ${yacht.model || ""}`.trim() ||
                      yacht.boat_name
                    }
                  />
                  <SpecItem
                    label="Year of construction"
                    value={yacht.year?.toString()}
                  />
                  <SpecItem
                    label="Motor"
                    value={
                      yacht.engine_manufacturer
                        ? `${yacht.horse_power || ""} hp ${yacht.engine_manufacturer}`
                        : undefined
                    }
                  />
                  <SpecItem
                    label="berth"
                    value={yacht.where || yacht.location}
                  />
                  <SpecItem label="Reference code" value={yacht.vessel_id} />
                  <SpecItem
                    label="building material"
                    value={yacht.hull_construction}
                  />
                  <SpecItem
                    label="L x W x D approx."
                    value={`${yacht.loa || yacht.length || ""} x ${yacht.beam || ""} x ${yacht.draft || ""}`
                      .replace(/x\s*x/g, "")
                      .trim()}
                  />
                  <SpecItem label="Sleeps" value={yacht.berths} />
                </div>
              </SpecCard>

              {/* COMMENTS */}
              {yacht.owners_comment && (
                <SpecCard title="Comments">
                  <p className="text-gray-700 leading-relaxed">
                    {yacht.owners_comment}
                  </p>
                </SpecCard>
              )}

              {/* BROKER CARD – EXACT REPLICA */}
              <div className="bg-[#f9fafc] border border-[#eaeef5] p-6 flex flex-wrap items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={BROKER_LOGO_FALLBACK}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    alt="Schepenkring Roermond"
                    className="h-16 w-auto object-contain"
                  />
                  <div className="text-[#2a77b1] font-bold text-xl notranslate mt-1">
                    Schepenkring
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <h2 className="text-lg font-serif italic text-[#2a77b1] notranslate">
                    Makelaar - Schepenkring Roermond
                  </h2>
                  <p className="flex gap-2">
                    <span className="font-medium min-w-[100px]">
                      Phone number
                    </span>{" "}
                    <a
                      href="tel:+31(0)475315661"
                      className="text-[#2a77b1] hover:underline"
                    >
                      +31(0)475 315661
                    </a>
                  </p>
                  <p className="flex gap-2">
                    <span className="font-medium min-w-[100px]">Email</span>{" "}
                    <a
                      href="mailto:roermond@schepenkring.nl"
                      className="text-[#2a77b1] hover:underline"
                    >
                      roermond@schepenkring.nl
                    </a>
                  </p>
                  <p className="flex gap-2">
                    <span className="font-medium min-w-[100px]">Address</span>{" "}
                    <span>
                      Hertenerweg 2, Roermond 6049 AA
                      <br />
                      The Netherlands
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span className="font-medium min-w-[100px]">Route</span>{" "}
                    <a
                      href="https://www.google.nl/maps/dir//51.1862287,5.9717313"
                      target="_blank"
                      rel="noopener"
                      className="text-[#2a77b1] hover:underline"
                    >
                      calculate route
                    </a>
                  </p>
                </div>
              </div>

              {/* DETAILED SPEC SECTIONS */}
              <SpecSection
                title="More information about the"
                subtitle="General"
                specs={[
                  { label: "werf", value: yacht.builder || yacht.make },
                  { label: "CE", value: "C" },
                  { label: "CE max weight", value: null },
                  { label: "Hull shape", value: yacht.hull_type },
                  { label: "Hull color", value: yacht.hull_colour },
                  {
                    label: "Deck and superstructure colour",
                    value: yacht.super_structure_colour,
                  },
                  {
                    label: "Deck and superstructure construction",
                    value: yacht.super_structure_construction,
                  },
                  {
                    label: "Open Cockpit (OK)",
                    value: yacht.cockpit_type ? true : null,
                  },
                  { label: "Normal clearance height", value: yacht.air_draft },
                  { label: "Draught", value: yacht.draft },
                  { label: "Waterline length", value: yacht.lwl },
                  { label: "Water displacement", value: yacht.displacement },
                  {
                    label: "Control",
                    value: yacht.control_type ? `Steering wheel` : null,
                  },
                  { label: "Place control", value: yacht.control_type },
                  { label: "Trim flaps", value: null },
                ]}
              />

              <SpecSection
                title="Accommodation"
                subtitle="Accommodatie"
                specs={[
                  { label: "cabins", value: yacht.cabins },
                  { label: "Sleeps", value: yacht.berths },
                  { label: "Type of interior", value: "Modern, light" },
                  { label: "Mattresses", value: true },
                  {
                    label: "Water tank & material",
                    value: yacht.tankage
                      ? `${yacht.tankage} liters Plastic`
                      : null,
                  },
                  {
                    label: "Water system",
                    value: "Pressure system Electric pump",
                  },
                  {
                    label: "Number of showers",
                    value: yacht.shower ? true : null,
                  },
                  {
                    label: "Radio CD player",
                    value: yacht.cd_player ? "Fusion stereo system" : null,
                  },
                  {
                    label: "Refrigerator & food",
                    value: yacht.fridge ? "Electric 12V cool box" : null,
                  },
                ]}
              />

              <SpecSection
                title="Engine and electrics"
                subtitle="Motor & Elektra"
                specs={[
                  { label: "Number of identical engines", value: "1" },
                  { label: "Start type", value: yacht.starting_type },
                  { label: "Type", value: yacht.drive_type },
                  { label: "Brand", value: yacht.engine_manufacturer },
                  { label: "Door Design", value: null },
                  { label: "Serial Number", value: null },
                  {
                    label: "Year of construction",
                    value: yacht.year?.toString(),
                  },
                  { label: "Amount of cilinders", value: null },
                  { label: "Power", value: yacht.horse_power },
                  { label: "Hour meter", value: true },
                  { label: "Running hours", value: yacht.hours },
                  { label: "Fuel", value: yacht.fuel },
                  { label: "Consumption", value: yacht.gallons_per_hour },
                  { label: "Propulsion", value: "screw" },
                  { label: "Fuel tank quantity", value: true },
                  { label: "Max speed", value: yacht.max_speed },
                  { label: "Tachometer", value: true },
                  {
                    label: "Battery",
                    value: yacht.battery ? `2 Capacity: 95 Ah` : null,
                  },
                  { label: "Dynamo", value: true },
                  { label: "Voltmeter", value: true },
                  { label: "Voltage", value: "12 volt" },
                  { label: "Comments", value: "Motor with tracker" },
                ]}
              />

              <SpecSection
                title="Navigation and electronics"
                subtitle="Navigatie & Elektronica"
                specs={[
                  { label: "Kompas", value: yacht.compass ? true : null },
                  {
                    label: "Log/speed",
                    value: yacht.speed_instrument ? true : null,
                  },
                  {
                    label: "Depth gauge",
                    value: yacht.depth_instrument ? true : null,
                  },
                  {
                    label: "Navigation lights",
                    value: yacht.navigation_lights ? true : null,
                  },
                  { label: "Rudder angle indicator", value: null },
                  { label: "GPS", value: yacht.gps ? "Simrad Evo 3" : null },
                  {
                    label: "chart plotter",
                    value: yacht.plotter
                      ? "Simrad Evo 3 with Europe map from Navionics"
                      : null,
                  },
                  {
                    label: "Fishfinder",
                    value: yacht.plotter ? "Simrad Evo 3" : null,
                  },
                ]}
              />

              <SpecSection
                title="Outside equipment"
                subtitle="Uitrusting buitenom"
                specs={[
                  {
                    label: "Anchors & Material",
                    value: yacht.anchor ? "Delta anchor 4kg" : null,
                  },
                  { label: "Anchor rod", value: true },
                  { label: "Sprayhood", value: yacht.spray_hood ? true : null },
                  { label: "Cockpit tent", value: yacht.bimini ? true : null },
                  {
                    label: "Tarpaulin(s)",
                    value: "Winter tent and transport hood",
                  },
                  { label: "Pulpit and bastion(s)", value: true },
                  { label: "Swimming platform", value: true },
                  { label: "Swimming ladder", value: true },
                  { label: "Trailer", value: "Harbeck 2200 KG" },
                  { label: "Teak deck", value: true },
                  { label: "Fenders, lines", value: true },
                  { label: "cockpit table", value: true },
                  { label: "Comments", value: "Water ski pole" },
                ]}
              />

              <SpecSection
                title="Safety"
                subtitle="Veiligheid"
                specs={[
                  { label: "Lifebuoy", value: true },
                  {
                    label: "Bilge pump",
                    value: yacht.bilge_pump ? "Electric 2x" : null,
                  },
                  {
                    label: "Fire extinguisher",
                    value: yacht.fire_extinguisher ? true : null,
                  },
                  { label: "Self-draining cockpit", value: true },
                  { label: "Comments", value: "1x windshield wiper" },
                ]}
              />

              {/* MEDIA CONTAINER */}
              <div id="fotos" className="bg-white border border-[#eaeef5] p-6">
                <h3 className="text-xl font-serif italic text-[#2a77b1] mb-5 pb-3 border-b border-[#eaeef5]">
                  Media of the {yacht.boat_name}
                </h3>
                <div className="vibp_more_images grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allImages.slice(0, 4).map((img, idx) => (
                    <a
                      key={idx}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openPhotoGallery(img, idx);
                      }}
                    >
                      <img
                        src={img}
                        onError={handleImageError}
                        alt={`${yacht.boat_name} ${idx + 1}`}
                        className="w-full aspect-[16/9] object-cover cursor-pointer hover:opacity-70 transition"
                      />
                    </a>
                  ))}
                  {allImages.slice(4).map((img, idx) => (
                    <a
                      key={idx + 4}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openPhotoGallery(img, idx + 4);
                      }}
                      className="vibp_hidden_image hidden"
                    >
                      <img
                        src={img}
                        onError={handleImageError}
                        alt={`${yacht.boat_name} ${idx + 5}`}
                        className="w-full aspect-[16/9] object-cover"
                      />
                    </a>
                  ))}
                </div>
                <button
                  id="vibp_load_more_images_btn"
                  onClick={() => {
                    const btn = document.getElementById(
                      "vibp_load_more_images_btn",
                    );
                    const hidden =
                      document.querySelectorAll(".vibp_hidden_image");
                    if (btn?.classList.contains("show-images")) {
                      hidden.forEach((el) =>
                        el.classList.remove("hidden", "vibp_hidden_image"),
                      );
                      btn.textContent = "Toon minder foto's";
                      btn.classList.remove("show-images");
                    } else {
                      const allMediaLinks = document.querySelectorAll(
                        ".vibp_more_images > a",
                      );
                      allMediaLinks.forEach((el, idx) => {
                        if (idx >= 4)
                          el.classList.add("hidden", "vibp_hidden_image");
                      });
                      btn!.textContent = "Show more photos";
                      btn!.classList.add("show-images");
                    }
                  }}
                  className="mt-6 bg-[#2a77b1] hover:bg-[#1e5a8a] text-white px-6 py-3 rounded-full text-sm font-medium transition-colors show-images"
                >
                  Show more photos
                </button>
              </div>

              {/* DOCUMENTS */}
              <div
                id="documenten"
                className="bg-white border border-[#eaeef5] p-6"
              >
                <h3 className="text-xl font-serif italic text-[#2a77b1] mb-5 pb-3 border-b border-[#eaeef5]">
                  Documents
                </h3>
                <a
                  href={yacht.print_url || `#`}
                  target="_blank"
                  rel="noopener"
                  className="inline-block bg-[#2a77b1] hover:bg-[#1e5a8a] text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
                >
                  Boat specifications
                </a>
              </div>

              {/* BACK LINK (bottom) */}
              <Link
                href="/nl/yachts"
                className="inline-flex items-center gap-2 text-[#2a77b1] hover:text-[#e0332d] transition-colors font-medium"
              >
                <ArrowLeft size={18} /> ❮ Back to overview
              </Link>
            </div>

            {/* ----- RIGHT COLUMN (4/12) ----- */}
            <div className="lg:col-span-1 space-y-8">
              {/* 🔁 BIDDING CARD – ONLY SHOW IF STATUS IS "For Bid" */}
              {yacht.status === "For Bid" && (
                <>
                  <div className="bg-gray-50 border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-serif italic text-gray-900">
                        Bod uitbrengen
                      </h3>
                      <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-800">
                        Veiling Actief
                      </span>
                    </div>
                    <div className="mb-5">
                      <p className="text-sm text-gray-500 mb-1">
                        prijs?
                      </p>
                      <p className="text-2xl font-serif italic text-gray-900">
                        €
                        {(yacht.current_bid
                          ? Number(yacht.current_bid)
                          : Number(yacht.price)
                        ).toLocaleString("nl-NL")}
                      </p>
                    </div>
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={16}
                          className="text-amber-600 mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            Minimaal bod vereist:
                          </p>
                          <p className="text-lg font-bold text-amber-900">
                            €{minBidAmountInt.toLocaleString("nl-NL")}
                            <span className="text-sm font-normal text-amber-700 ml-2">
                              (90% van vraagprijs, afgerond)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 mt-6">
                      <div>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={handleBidAmountChange}
                          placeholder={`Minimaal €${minBidAmountInt.toLocaleString("nl-NL")}`}
                          className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                          step="1"
                          min={minBidAmountInt}
                        />
                        {bidError && (
                          <p className="text-red-500 text-xs mt-1">
                            {bidError}
                          </p>
                        )}
                      </div>
                      {isAuthenticated ? (
                        <button
                          onClick={placeBid}
                          disabled={placingBid}
                          className="w-full bg-gray-900 hover:bg-black text-white py-3 font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                        >
                          {placingBid ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Gavel size={16} />
                          )}
                          {placingBid ? "Plaatsen..." : "Bod plaatsen"}
                        </button>
                      ) : (
                        <button
                          onClick={handleLoginRedirect}
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
                  </div>

                  {/* 📜 BID HISTORY – ONLY SHOW IF STATUS IS "For Bid" */}
                  <div className="bg-gray-50 border border-gray-200 p-6">
                    <h3 className="text-lg font-serif italic text-gray-900 mb-4 flex items-center gap-2">
                      <History size={16} className="text-gray-600" />
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
                                : "border-gray-100 text-gray-600",
                            )}
                          >
                            <div>
                              <span className="text-sm">
                                {bid.user?.name || "Anonieme bieder"}
                              </span>
                              {bid.status === "active" && i === 0 && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                                  Actief
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">
                                €{Number(bid.amount).toLocaleString("nl-NL")}
                              </span>
                              <p className="text-xs text-gray-400">
                                {new Date(bid.created_at).toLocaleDateString(
                                  "nl-NL",
                                )}
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
                </>
              )}

              {/* ----- CONTACT FORM – ALWAYS VISIBLE ----- */}
              <div className="bg-gray-50 border border-gray-200 p-6">
                <h4 className="text-lg font-serif italic text-gray-900 mb-4">
                  Meer informatie over de
                  <br />
                  <span className="notranslate text-[#2a77b1]">
                    {yacht.boat_name}
                  </span>
                </h4>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="hidden"
                    name="g-recaptcha-response"
                    className="g-recaptcha-response"
                  />
                  <input
                    type="text"
                    placeholder="Your first and last name*"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Phone number*"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                    required
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email address*"
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                  />
                  <p className="text-sm text-gray-700">
                    I would like the following... *
                  </p>
                  <select
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500 rounded-none bg-white"
                    value={contactForm.requestType}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        requestType: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled hidden></option>
                    <option value="Teruggebeld worden">Get a call back</option>
                    <option value="Een vrijblijvende afspraak maken">
                      Make a no-obligation appointment
                    </option>
                    <option value="Anders">Other</option>
                  </select>
                  <textarea
                    placeholder={`Your comment or question about the ${yacht.boat_name} *`}
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500 rounded-none"
                    value={contactForm.comment}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        comment: e.target.value,
                      })
                    }
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-[#2a77b1] hover:bg-[#1e5a8a] text-white py-3 font-medium transition-colors rounded-full"
                  >
                    Send
                  </button>
                  <p className="text-xs text-gray-500 mt-1">* Required field</p>
                </form>
              </div>

              {/* ⚓ TEST SAIL TOGGLE & FORM – ALWAYS VISIBLE */}
              <button
                onClick={() => setShowTestSailForm(!showTestSailForm)}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 font-medium text-center transition-colors flex items-center justify-center gap-2 bg-white"
              >
                <Anchor size={18} />
                {showTestSailForm
                  ? "Proefvaart formulier verbergen"
                  : "Proefvaart boeken"}
              </button>

              {showTestSailForm && (
                <TestSailForm
                  yacht={yacht}
                  depositAmount={depositAmount}
                  currentMonth={currentMonth}
                  calendarDays={calendarDays}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  availableSlots={availableSlots}
                  bookingForm={bookingForm}
                  testSailStatus={testSailStatus}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={setSelectedTime}
                  onBookingFormChange={setBookingForm}
                  onBook={handleTestSailBooking}
                  onCancel={() => setShowTestSailForm(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ----- MOBILE ACTION BAR (PHONE / EMAIL) ----- */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#2a77b1] flex md:hidden z-50">
          <a
            href={`tel:+31(0)475315661`}
            className="flex-1 flex items-center justify-center py-4 text-[#2a77b1] border-r border-gray-200"
          >
            <Phone size={24} />
          </a>
          <a
            href={`mailto:roermond@schepenkring.nl`}
            className="flex-1 flex items-center justify-center py-4 text-[#2a77b1]"
          >
            <Mail size={24} />
          </a>
        </div>
      </main>
      {/* ----- PHOTO GALLERY MODAL (unchanged) ----- */}
      <AnimatePresence>
        {showPhotoGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between p-6 text-white">
              <div>
                <h2 className="text-xl font-medium notranslate">
                  {yacht.boat_name}
                </h2>
                <p className="text-sm text-gray-300">
                  {currentPhotoIndex + 1} van {allImages.length}
                </p>
              </div>
              <button
                onClick={() => setShowPhotoGallery(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center p-4">
              <img
                src={selectedGalleryImage || allImages[0]}
                onError={handleImageError}
                className="max-h-[70vh] max-w-full object-contain"
                alt=""
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateGallery("prev")}
                    className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    <ChevronRight size={24} className="rotate-180" />
                  </button>
                  <button
                    onClick={() => navigateGallery("next")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedGalleryImage(img);
                      setCurrentPhotoIndex(idx);
                    }}
                    className={cn(
                      "w-20 h-20 flex-shrink-0 border-2 transition-all",
                      idx === currentPhotoIndex
                        ? "border-white"
                        : "border-transparent hover:border-white/50",
                    )}
                  >
                    <img
                      src={img}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ----- BUY NOW MODAL (unchanged) ----- */}
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
                      €{yacht.price.toLocaleString("nl-NL")}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Volledig bedrag: €{yacht.price.toLocaleString("nl-NL")}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-bold">Let op:</span> Door direct te
                      kopen wordt de veiling beëindigd en kunnen andere bieders
                      geen bod meer plaatsen.
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

/* ----- HELPER COMPONENTS (exact style) ----- */

function SpecItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function SpecCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#eaeef5] p-6">
      <h3 className="text-xl font-serif italic text-[#2a77b1] mb-5 pb-3 border-b border-[#eaeef5]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SpecSection({
  title,
  subtitle,
  specs,
}: {
  title: string;
  subtitle: string;
  specs: { label: string; value: string | boolean | null | undefined }[];
}) {
  const filtered = specs.filter(
    (s) => s.value !== null && s.value !== undefined && s.value !== "",
  );
  if (filtered.length === 0) return null;
  return (
    <div className="bg-white border border-[#eaeef5] p-6">
      <h3 className="text-xl font-serif italic text-[#2a77b1] mb-5 pb-3 border-b border-[#eaeef5]">
        {title} <span className="notranslate">{subtitle}</span>
      </h3>
      <div className="space-y-1">
        {filtered.map((spec, idx) => (
          <SpecRow key={idx} label={spec.label} value={spec.value} />
        ))}
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
}: {
  label: string;
  value: string | boolean | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  const hasText = typeof value === "string" && value.trim().length > 0;
  return (
    <div className="flex py-2 border-b border-dashed border-gray-200 last:border-0">
      <span className="w-2/5 text-sm text-gray-700 font-medium">{label}</span>
      <div className="w-3/5 text-sm text-gray-800 flex items-center gap-2">
        {typeof value === "boolean" ? (
          <Check size={16} className="text-green-600 check-icon" />
        ) : hasText ? (
          <>
            {value}
            <Check size={16} className="text-green-600 check-icon hidden" />
          </>
        ) : null}
      </div>
    </div>
  );
}

function TestSailForm({
  yacht,
  depositAmount,
  currentMonth,
  calendarDays,
  selectedDate,
  selectedTime,
  availableSlots,
  bookingForm,
  testSailStatus,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  onTimeSelect,
  onBookingFormChange,
  onBook,
  onCancel,
}: any) {
  return (
    <div className="bg-white border border-gray-200 p-6 mt-2 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Proefvaart Boeken
        </h3>
        <p className="text-sm text-gray-600">
          Borg Vereist: €{depositAmount.toLocaleString("nl-NL")}
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevMonth}
            className="text-gray-400 hover:text-gray-900 p-2"
          >
            ←
          </button>
          <h4 className="text-base font-semibold text-gray-900">
            {DUTCH_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={onNextMonth}
            className="text-gray-400 hover:text-gray-900 p-2"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {DUTCH_DAYS.map((d) => (
            <span key={d} className="font-medium text-gray-500">
              {d}
            </span>
          ))}
          {calendarDays.map((day: any, i: number) => {
            const isSelected =
              selectedDate?.toDateString() === day.date.toDateString();
            return (
              <button
                key={i}
                onClick={() => onDateSelect(day.date, day.available)}
                disabled={!day.available || !day.isCurrentMonth}
                className={cn(
                  "aspect-square flex items-center justify-center text-sm transition-all",
                  !day.isCurrentMonth
                    ? "text-gray-300"
                    : isSelected
                      ? "bg-gray-900 text-white"
                      : isToday(day.date)
                        ? "bg-gray-100 text-gray-900 font-bold border-2 border-blue-500"
                        : day.available
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed",
                )}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900">
            Geselecteerd:{" "}
            {selectedDate.toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        )}
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((time: string) => (
              <button
                key={time}
                onClick={() => onTimeSelect(time)}
                className={cn(
                  "py-2 rounded text-sm font-medium transition-all",
                  selectedTime === time
                    ? "bg-gray-900 text-white"
                    : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
                )}
              >
                {time}
              </button>
            ))}
          </div>
        ) : (
          selectedDate && (
            <p className="text-sm text-gray-500 text-center py-4 border border-dashed">
              Geen beschikbare slots
            </p>
          )
        )}
        {selectedTime && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Geselecteerd tijdslot
              </p>
              <p className="text-lg font-serif text-gray-900">
                {selectedTime} -{" "}
                {(() => {
                  const [h, m] = selectedTime.split(":").map(Number);
                  const end = new Date();
                  end.setHours(h + 1, m);
                  return end.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                })()}
                <span className="text-sm text-gray-500 ml-2">
                  (+15m buffer)
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Naam *"
                value={bookingForm.name}
                onChange={(e) =>
                  onBookingFormChange({ ...bookingForm, name: e.target.value })
                }
                className="border border-gray-300 px-4 py-2 text-sm rounded-none"
              />
              <input
                type="email"
                placeholder="E-mail *"
                value={bookingForm.email}
                onChange={(e) =>
                  onBookingFormChange({ ...bookingForm, email: e.target.value })
                }
                className="border border-gray-300 px-4 py-2 text-sm rounded-none"
              />
              <input
                type="tel"
                placeholder="Telefoonnummer"
                value={bookingForm.phone}
                onChange={(e) =>
                  onBookingFormChange({ ...bookingForm, phone: e.target.value })
                }
                className="border border-gray-300 px-4 py-2 text-sm rounded-none md:col-span-2"
              />
              <textarea
                placeholder="Opmerkingen"
                rows={3}
                value={bookingForm.notes}
                onChange={(e) =>
                  onBookingFormChange({ ...bookingForm, notes: e.target.value })
                }
                className="border border-gray-300 px-4 py-2 text-sm rounded-none md:col-span-2"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={onBook}
                disabled={
                  !selectedDate ||
                  !selectedTime ||
                  !bookingForm.name ||
                  !bookingForm.email ||
                  testSailStatus === "processing"
                }
                className="flex-2 bg-gray-900 hover:bg-black text-white py-3 font-medium disabled:bg-gray-300 transition-colors"
              >
                {testSailStatus === "processing" ? (
                  <>
                    <Loader2 className="animate-spin inline mr-2" size={16} />{" "}
                    Verwerken...
                  </>
                ) : (
                  "Bevestigen & Borg Betalen"
                )}
              </button>
            </div>
            {testSailStatus === "success" && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={24} />
                <div>
                  <h4 className="font-medium text-emerald-800">
                    Proefvaart Ingepland!
                  </h4>
                  <p className="text-sm text-emerald-700">
                    Een bevestiging is naar uw e-mail verzonden.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to check if date is today (used in calendar)
function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}