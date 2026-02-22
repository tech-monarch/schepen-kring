"use client";

import { useState, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Camera,
  Loader2,
  Upload,
  Waves,
  Coins,
  Images,
  Trash,
  AlertCircle,
  Ship,
  Compass,
  Box,
  CheckSquare,
  Sparkles,
  CheckCircle,
  Zap,
  Bed,
  Save,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/dashboard/Sidebar";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

type AiStagedImage = {
  file: File;
  preview: string;
  category: string;
  originalName: string;
};

type GalleryState = { [key: string]: any[] };

type AvailabilityRule = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

// ----------------------------------------------------------------------
// Display Spec Checkbox (identical to admin)
// ----------------------------------------------------------------------
function SpecCheckbox({
  field,
  label,
  onSpecChange,
}: {
  field: string;
  label: string;
  onSpecChange: (field: string, isChecked: boolean) => void;
}) {
  const [isChecked, setIsChecked] = useState(true); // default true for new yachts

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    onSpecChange(field, newChecked);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded">
      <input
        type="checkbox"
        id={`display_spec_${field}`}
        checked={isChecked}
        onChange={handleChange}
        className="w-3 h-3 accent-[#003566] cursor-pointer"
      />
      <label
        htmlFor={`display_spec_${field}`}
        className="text-[8px] font-medium uppercase tracking-wider text-slate-600 cursor-pointer select-none flex-1"
      >
        {label}
      </label>
    </div>
  );
}

export default function PartnerCreateYachtPage() {
  const router = useRouter();

  // State ----------------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>(null);
  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [aiStaging, setAiStaging] = useState<AiStagedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryState, setGalleryState] = useState<GalleryState>({
    Exterior: [],
    Interior: [],
    "Engine Room": [],
    Bridge: [],
    General: [],
  });

  const [availabilityRules, setAvailabilityRules] = useState<
    AvailabilityRule[]
  >([]);
  const [displaySpecs, setDisplaySpecs] = useState<Record<string, boolean>>({});

  // Handlers -------------------------------------------------------------
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale");
  };

  const handleGalleryAdd = (category: string, files: FileList | null) => {
    if (!files) return;
    setGalleryState((prev) => ({
      ...prev,
      [category]: [...prev[category], ...Array.from(files)],
    }));
  };

  const handleAiCategorizer = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsAnalyzing(true);
    const formData = new FormData();
    const fileArray = Array.from(files);
    fileArray.forEach((file) => formData.append("images[]", file));
    try {
      toast.loading("Gemini is analyzing assets...", { id: "ai-loading" });
      const res = await api.post("/partner/yachts/ai-classify", formData);
      const analyzedData: AiStagedImage[] = res.data.map(
        (item: any, index: number) => ({
          file: fileArray[index],
          preview: item.preview,
          category: item.category,
          originalName: item.originalName,
        }),
      );
      setAiStaging((prev) => [...prev, ...analyzedData]);
      toast.success("AI Classification complete", { id: "ai-loading" });
    } catch (err) {
      toast.error("AI Analysis failed", { id: "ai-loading" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approveAiImage = (index: number) => {
    const item = aiStaging[index];
    setGalleryState((prev) => ({
      ...prev,
      [item.category]: [...prev[item.category], item.file],
    }));
    setAiStaging((prev) => prev.filter((_, i) => i !== index));
  };

  const approveAllAi = () => {
    const updatedGallery = { ...galleryState };
    aiStaging.forEach((item) => {
      updatedGallery[item.category] = [
        ...updatedGallery[item.category],
        item.file,
      ];
    });
    setGalleryState(updatedGallery);
    setAiStaging([]);
    toast.success("All assets approved");
  };

  const addAvailabilityRule = () => {
    setAvailabilityRules([
      ...availabilityRules,
      { day_of_week: 1, start_time: "09:00", end_time: "17:00" },
    ]);
  };

  const removeAvailabilityRule = (index: number) => {
    setAvailabilityRules(availabilityRules.filter((_, i) => i !== index));
  };

  const updateAvailabilityRule = (
    index: number,
    field: keyof AvailabilityRule,
    value: any,
  ) => {
    const newRules = [...availabilityRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setAvailabilityRules(newRules);
  };

  const handleSpecChange = (field: string, isChecked: boolean) => {
    setDisplaySpecs((prev) => ({ ...prev, [field]: isChecked }));
  };

  // ----------------------------------------------------------------------
  // ✅ SUBMIT – Only send fields with values (admin‑style)
  // ----------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    const formData = new FormData();

    // 1. Required field
    const boatName = (
      document.querySelector('input[name="boat_name"]') as HTMLInputElement
    )?.value;
    if (!boatName) {
      toast.error("Vessel name is required");
      setIsSubmitting(false);
      return;
    }
    formData.append("boat_name", boatName);

    // 2. Main image (only if provided)
    if (mainFile) {
      formData.append("main_image", mainFile);
    }

    // 3. Text / numeric fields – only if they have a value
    const fields = [
      "price",
      "min_bid_amount",
      "year",
      "status",
      "loa",
      "lwl",
      "where",
      "passenger_capacity",
      "beam",
      "draft",
      "air_draft",
      "displacement",
      "ballast",
      "hull_type",
      "hull_construction",
      "hull_colour",
      "hull_number",
      "designer",
      "builder",
      "engine_manufacturer",
      "horse_power",
      "hours",
      "fuel",
      "max_speed",
      "cruising_speed",
      "gallons_per_hour",
      "tankage",
      "cabins",
      "berths",
      "toilet",
      "shower",
      "bath",
      "heating",
      "cockpit_type",
      "control_type",
      "external_url",
      "print_url",
      "owners_comment",
      "reg_details",
      "known_defects",
      "last_serviced",
      "super_structure_colour",
      "super_structure_construction",
      "deck_colour",
      "deck_construction",
      "starting_type",
      "drive_type",
    ];

    fields.forEach((field) => {
      const element = document.querySelector(`[name="${field}"]`) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;
      if (
        element &&
        element.value !== undefined &&
        element.value.trim() !== ""
      ) {
        formData.append(field, element.value);
      }
    });

    // 4. Boolean fields – always send "true" or "false"
    const booleanFields = [
      "allow_bidding",
      "flybridge",
      "oven",
      "microwave",
      "fridge",
      "freezer",
      "air_conditioning",
      "navigation_lights",
      "compass",
      "depth_instrument",
      "wind_instrument",
      "autopilot",
      "gps",
      "vhf",
      "plotter",
      "speed_instrument",
      "radar",
      "life_raft",
      "epirb",
      "bilge_pump",
      "fire_extinguisher",
      "mob_system",
      "spinnaker",
      "battery",
      "battery_charger",
      "generator",
      "inverter",
      "television",
      "cd_player",
      "dvd_player",
      "anchor",
      "spray_hood",
      "bimini",
      "stern_thruster",
      "bow_thruster",
    ];

    booleanFields.forEach((field) => {
      const checkbox = document.querySelector(
        `[name="${field}"]`,
      ) as HTMLInputElement;
      formData.append(field, checkbox?.checked ? "true" : "false");
    });

    // 5. Availability rules – only if at least one rule exists
    if (availabilityRules.length > 0) {
      formData.append("availability_rules", JSON.stringify(availabilityRules));
    }

    // 6. Display specs – only if at least one spec is selected
    const selectedSpecs = Object.keys(displaySpecs).filter(
      (key) => displaySpecs[key],
    );
    if (selectedSpecs.length > 0) {
      formData.append("display_specs", JSON.stringify(selectedSpecs));
    }

    // 7. Auto‑calculate min_bid_amount if price exists but min_bid_amount is empty
    const price = formData.get("price");
    if (!formData.has("min_bid_amount") && price) {
      const priceVal = parseFloat(price as string);
      if (!isNaN(priceVal)) {
        formData.append("min_bid_amount", (priceVal * 0.9).toString());
      }
    }

    try {
      // Create yacht
      const res = await api.post("/partner/yachts", formData);
      const newYachtId = res.data.id;

      // Upload gallery images
      for (const cat of Object.keys(galleryState)) {
        const newFiles = galleryState[cat];
        if (newFiles.length > 0) {
          const gData = new FormData();
          newFiles.forEach((file) => gData.append("images[]", file));
          gData.append("category", cat);
          await api.post(`/partner/yachts/${newYachtId}/gallery`, gData);
        }
      }

      toast.success("Vessel Registered Successfully");
      router.push("/nl/dashboard/partner");
    } catch (err: any) {
      console.error("Submission error:", err);
      if (err.response) {
        const serverMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          "Unknown server error";
        toast.error(`Server error: ${serverMessage}`);
        console.error("Server response:", err.response.data);
      } else {
        toast.error("Network error – please try again");
      }
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Toaster position="top-right" />
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      {/* ========== ADMIN‑STYLE STICKY HEADER ========== */}
      <div className="bg-[#003566] text-white p-8 sticky top-0 z-40 shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif italic">
              New Vessel Registration
            </h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
              Registry Auth: Partner
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-16">
          {/* ERROR SUMMARY */}
          {errors && (
            <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 animate-pulse">
              <div className="flex items-center gap-2 mb-3 font-black uppercase text-[11px]">
                <AlertCircle size={16} /> Please Correct the Following
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.keys(errors).map((key) => (
                  <p key={key} className="text-[10px] font-bold">
                    ● {key.toUpperCase()}: {errors[key][0]}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION 1: MAIN PHOTO --- */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-[#003566] tracking-widest flex items-center gap-2 italic">
              <Camera size={16} /> 01. Primary Vessel Photo
            </label>
            <div
              onClick={() =>
                document.getElementById("main_image_input")?.click()
              }
              className="h-80 lg:h-96 bg-white border-2 border-dashed border-slate-200 relative flex items-center justify-center cursor-pointer overflow-hidden shadow-inner group transition-all hover:border-blue-400"
            >
              <input
                id="main_image_input"
                name="main_image"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMainFile(file);
                    setMainPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {mainPreview ? (
                <img
                  src={mainPreview}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="text-center">
                  <Upload
                    className="mx-auto text-slate-200 mb-4 group-hover:text-blue-600 transition-colors"
                    size={48}
                  />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                    Click to Upload Main Photo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- SECTION 2: CORE SPECS (ESSENTIAL REGISTRY) --- */}
          <div className="bg-white p-8 lg:p-10 border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2 border-b border-slate-50 pb-4 italic">
              <Coins size={16} /> Essential Registry Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label>Vessel Name *</Label>
                <Input
                  name="boat_name"
                  placeholder="e.g. M/Y NOBILITY"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price (€)</Label>
                <Input name="price" type="number" placeholder="1500000" />
              </div>
              <div className="space-y-2">
                <Label>Minimum Bid Amount (€)</Label>
                <Input
                  name="min_bid_amount"
                  type="number"
                  placeholder="Auto‑calculates 90% of price if empty"
                  step="1000"
                />
                <p className="text-[8px] text-slate-400 italic mt-1">
                  Leave empty to auto‑calculate
                </p>
              </div>
              <div className="space-y-2">
                <Label>Year Built</Label>
                <Input name="year" type="number" placeholder="2024" />
              </div>
              <div className="space-y-2">
                <Label>LOA (m)</Label>
                <Input name="loa" placeholder="45.5" />
              </div>
              <div className="space-y-2">
                <Label>LWL (m)</Label>
                <Input name="lwl" placeholder="40.2" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input name="where" placeholder="e.g. Monaco" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  name="status"
                  defaultValue="For Sale"
                  className="w-full bg-slate-50 p-3 border-b border-slate-200 text-[#003566] font-bold text-xs outline-none focus:border-blue-600 transition-all"
                >
                  <option value="For Sale">For Sale</option>
                  <option value="For Bid">For Bid</option>
                  <option value="Sold">Sold</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Passenger Capacity</Label>
                <Input
                  name="passenger_capacity"
                  type="number"
                  placeholder="12"
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3: TECHNICAL DOSSIER (FULL) --- */}
          <div className="space-y-12">
            <h3 className="text-[12px] font-black text-[#003566] uppercase tracking-[0.3em] flex items-center gap-3 border-b-2 border-[#003566] pb-4">
              <Waves size={18} /> Technical Dossier
            </h3>

            {/* Hull & Dimensions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <SectionHeader
                  icon={<Ship size={14} />}
                  title="Hull & Dimensions"
                />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label>Beam (m)</Label>
                    <Input name="beam" placeholder="8.5" />
                  </div>
                  <div className="space-y-1">
                    <Label>Draft (m)</Label>
                    <Input name="draft" placeholder="2.1" />
                  </div>
                  <div className="space-y-1">
                    <Label>Air Draft (m)</Label>
                    <Input name="air_draft" placeholder="4.5" />
                  </div>
                  <div className="space-y-1">
                    <Label>Displacement (kg)</Label>
                    <Input name="displacement" placeholder="12000" />
                  </div>
                  <div className="space-y-1">
                    <Label>Ballast</Label>
                    <Input name="ballast" placeholder="e.g. 4000 kg" />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Type</Label>
                    <Input name="hull_type" placeholder="e.g. Monohull" />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Construction</Label>
                    <Input name="hull_construction" placeholder="e.g. GRP" />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Colour</Label>
                    <Input name="hull_colour" placeholder="White" />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Number</Label>
                    <Input name="hull_number" placeholder="HULL001" />
                  </div>
                  <div className="space-y-1">
                    <Label>Designer</Label>
                    <Input name="designer" placeholder="e.g. Naval Architect" />
                  </div>
                  <div className="space-y-1">
                    <Label>Builder</Label>
                    <Input name="builder" placeholder="e.g. Ferretti" />
                  </div>
                  <div className="space-y-1">
                    <Label>Superstructure Colour</Label>
                    <Input name="super_structure_colour" placeholder="White" />
                  </div>
                  <div className="space-y-1">
                    <Label>Superstructure Construction</Label>
                    <Input
                      name="super_structure_construction"
                      placeholder="GRP"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Deck Colour</Label>
                    <Input name="deck_colour" placeholder="Teak" />
                  </div>
                  <div className="space-y-1">
                    <Label>Deck Construction</Label>
                    <Input name="deck_construction" placeholder="Teak" />
                  </div>
                </div>
              </div>

              {/* Engine & Performance */}
              <div className="space-y-6">
                <SectionHeader
                  icon={<Zap size={14} />}
                  title="Engine & Performance"
                />
                <div className="bg-slate-50 p-6 border border-slate-100 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label>Engine Manufacturer</Label>
                    <Input
                      name="engine_manufacturer"
                      placeholder="e.g. CAT"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Horse Power</Label>
                    <Input
                      name="horse_power"
                      placeholder="e.g. 2x1500HP"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Engine Hours</Label>
                    <Input
                      name="hours"
                      placeholder="450"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fuel Type</Label>
                    <Input
                      name="fuel"
                      placeholder="Diesel"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Max Speed (kn)</Label>
                    <Input
                      name="max_speed"
                      placeholder="35"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Cruising Speed (kn)</Label>
                    <Input
                      name="cruising_speed"
                      placeholder="25"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Gallons per Hour</Label>
                    <Input
                      name="gallons_per_hour"
                      placeholder="50"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Tankage</Label>
                    <Input
                      name="tankage"
                      placeholder="2000L"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Starting Type</Label>
                    <Input
                      name="starting_type"
                      placeholder="e.g. Electric"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Drive Type</Label>
                    <Input
                      name="drive_type"
                      placeholder="e.g. Shaft"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodation & Facilities */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Bed size={14} />}
                title="Accommodation & Facilities"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                <div className="space-y-1">
                  <Label>Cabins</Label>
                  <Input name="cabins" type="number" placeholder="3" />
                </div>
                <div className="space-y-1">
                  <Label>Berths</Label>
                  <Input name="berths" placeholder="6" />
                </div>
                <div className="space-y-1">
                  <Label>Toilet</Label>
                  <Input name="toilet" placeholder="2" />
                </div>
                <div className="space-y-1">
                  <Label>Shower</Label>
                  <Input name="shower" placeholder="2" />
                </div>
                <div className="space-y-1">
                  <Label>Bath</Label>
                  <Input name="bath" placeholder="1" />
                </div>
                <div className="space-y-1">
                  <Label>Heating</Label>
                  <Input name="heating" placeholder="Central heating" />
                </div>
                <div className="space-y-1">
                  <Label>Cockpit Type</Label>
                  <Input name="cockpit_type" placeholder="Open/Closed" />
                </div>
                <div className="space-y-1">
                  <Label>Control Type</Label>
                  <Input name="control_type" placeholder="Wheel/Joystick" />
                </div>
              </div>
            </div>

            {/* Additional / Broker Fields */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Box size={14} />}
                title="Additional Details"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label>External URL</Label>
                  <Input name="external_url" placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <Label>Print URL</Label>
                  <Input name="print_url" placeholder="https://..." />
                </div>
                <div className="space-y-1">
                  <Label>Registration Details</Label>
                  <Input
                    name="reg_details"
                    placeholder="Registration number, flag, etc."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Known Defects</Label>
                  <Input name="known_defects" placeholder="Any known issues" />
                </div>
                <div className="space-y-1">
                  <Label>Last Serviced</Label>
                  <Input name="last_serviced" placeholder="2024-05-01" />
                </div>
                <div className="space-y-1">
                  <Label>Owner's Comments</Label>
                  <textarea
                    name="owners_comment"
                    className="w-full h-24 bg-slate-50 border border-slate-200 p-3 text-xs text-[#003566] font-medium outline-none focus:border-blue-600 transition-all resize-none"
                    placeholder="Any additional comments about the vessel..."
                  />
                </div>
              </div>
            </div>

            {/* Equipment Checkboxes (full list) */}
            <div className="space-y-6">
              <SectionHeader
                icon={<CheckSquare size={14} />}
                title="Equipment & Features"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  "allow_bidding",
                  "flybridge",
                  "oven",
                  "microwave",
                  "fridge",
                  "freezer",
                  "air_conditioning",
                  "navigation_lights",
                  "compass",
                  "depth_instrument",
                  "wind_instrument",
                  "autopilot",
                  "gps",
                  "vhf",
                  "plotter",
                  "speed_instrument",
                  "radar",
                  "life_raft",
                  "epirb",
                  "bilge_pump",
                  "fire_extinguisher",
                  "mob_system",
                  "spinnaker",
                  "battery",
                  "battery_charger",
                  "generator",
                  "inverter",
                  "television",
                  "cd_player",
                  "dvd_player",
                  "anchor",
                  "spray_hood",
                  "bimini",
                  "stern_thruster",
                  "bow_thruster",
                ].map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-2 bg-slate-50/50 p-3"
                  >
                    <input
                      type="checkbox"
                      name={field}
                      id={field}
                      className="w-3 h-3 accent-[#003566] cursor-pointer"
                    />
                    <label
                      htmlFor={field}
                      className="text-[8px] font-black uppercase tracking-wider text-slate-600 cursor-pointer select-none flex-1"
                    >
                      {field.replace(/_/g, " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- SCHEDULING AUTHORITY (Availability Rules) --- */}
          <div className="space-y-8 bg-slate-50 p-10 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="text-[12px] font-black uppercase text-[#003566] tracking-[0.4em] flex items-center gap-3 italic">
                <Calendar size={20} className="text-blue-600" /> 04. Scheduling
                Authority
              </h3>
              <Button
                type="button"
                onClick={addAvailabilityRule}
                className="bg-[#003566] text-white text-[8px] font-black uppercase tracking-widest px-6 h-8"
              >
                Add Window
              </Button>
            </div>

            <div className="space-y-4">
              {availabilityRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-end gap-6 bg-white p-4 border border-slate-100 shadow-sm relative group"
                >
                  <div className="flex-1 min-w-[150px]">
                    <Label>Day of Week</Label>
                    <select
                      value={rule.day_of_week}
                      onChange={(e) =>
                        updateAvailabilityRule(
                          idx,
                          "day_of_week",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full bg-slate-50 p-2 border-b border-slate-200 text-[#003566] font-bold text-xs outline-none"
                    >
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                      <option value={0}>Sunday</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[120px]">
                    <Label>Start Time</Label>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 border-b border-slate-200">
                      <Clock size={12} className="text-slate-400" />
                      <input
                        type="time"
                        step="900"
                        value={rule.start_time}
                        onChange={(e) =>
                          updateAvailabilityRule(
                            idx,
                            "start_time",
                            e.target.value,
                          )
                        }
                        className="bg-transparent text-xs font-bold text-[#003566] outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-[120px]">
                    <Label>End Time</Label>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 border-b border-slate-200">
                      <Clock size={12} className="text-slate-400" />
                      <input
                        type="time"
                        step="900"
                        value={rule.end_time}
                        onChange={(e) =>
                          updateAvailabilityRule(
                            idx,
                            "end_time",
                            e.target.value,
                          )
                        }
                        className="bg-transparent text-xs font-bold text-[#003566] outline-none w-full"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAvailabilityRule(idx)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}

              {availabilityRules.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 bg-white">
                  <Calendar size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    No Booking Windows Defined. Test Sails will be disabled.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- DISPLAY SPECIFICATIONS (Public visibility) --- */}
          <div className="space-y-6 bg-white p-6 border border-slate-200">
            <SectionHeader
              icon={<Eye size={14} />}
              title="Display Specifications"
            />
            <p className="text-[9px] text-gray-600 mb-4">
              Select which specifications to show on the public yacht page
            </p>

            <div className="space-y-4">
              {/* General */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase text-gray-700">
                  General
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "builder",
                    "model",
                    "year",
                    "designer",
                    "where",
                    "hull_number",
                    "hull_type",
                  ].map((field) => (
                    <SpecCheckbox
                      key={field}
                      field={field}
                      label={field.replace(/_/g, " ")}
                      onSpecChange={handleSpecChange}
                    />
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase text-gray-700">
                  Dimensions
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "loa",
                    "lwl",
                    "beam",
                    "draft",
                    "air_draft",
                    "displacement",
                    "ballast",
                    "passenger_capacity",
                  ].map((field) => (
                    <SpecCheckbox
                      key={field}
                      field={field}
                      label={field.replace(/_/g, " ")}
                      onSpecChange={handleSpecChange}
                    />
                  ))}
                </div>
              </div>

              {/* Construction */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase text-gray-700">
                  Construction
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "hull_colour",
                    "hull_construction",
                    "super_structure_colour",
                    "super_structure_construction",
                    "deck_colour",
                    "deck_construction",
                    "cockpit_type",
                    "control_type",
                  ].map((field) => (
                    <SpecCheckbox
                      key={field}
                      field={field}
                      label={field.replace(/_/g, " ")}
                      onSpecChange={handleSpecChange}
                    />
                  ))}
                </div>
              </div>

              {/* Engine */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase text-gray-700">
                  Engine & Performance
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "engine_manufacturer",
                    "horse_power",
                    "fuel",
                    "hours",
                    "cruising_speed",
                    "max_speed",
                    "tankage",
                    "gallons_per_hour",
                    "starting_type",
                    "drive_type",
                  ].map((field) => (
                    <SpecCheckbox
                      key={field}
                      field={field}
                      label={field.replace(/_/g, " ")}
                      onSpecChange={handleSpecChange}
                    />
                  ))}
                </div>
              </div>

              {/* Accommodation */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase text-gray-700">
                  Accommodation
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "cabins",
                    "berths",
                    "toilet",
                    "shower",
                    "bath",
                    "heating",
                  ].map((field) => (
                    <SpecCheckbox
                      key={field}
                      field={field}
                      label={field.replace(/_/g, " ")}
                      onSpecChange={handleSpecChange}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- AI CARGO DROP (Gemini Classifier) --- */}
          <div className="space-y-8 bg-slate-900 p-12 border-l-8 border-blue-500 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[12px] font-black uppercase text-blue-400 tracking-[0.4em] flex items-center gap-3 italic">
                  <Sparkles size={20} className="fill-blue-400" /> Upload Media
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2 tracking-widest italic">
                  Select all images. Our AI will sort them automatically.
                </p>
              </div>
              <label className="cursor-pointer bg-blue-600 text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl">
                {isAnalyzing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {isAnalyzing ? "Analyzing..." : "Select Images"}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleAiCategorizer(e.target.files)}
                  disabled={isAnalyzing}
                />
              </label>
            </div>

            {/* Staging Area */}
            {aiStaging.length > 0 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">
                    {aiStaging.length} Images Found
                  </p>
                  <button
                    type="button"
                    onClick={approveAllAi}
                    className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase flex items-center gap-2"
                  >
                    <CheckCircle size={14} /> Confirm All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {aiStaging.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-slate-800 border border-slate-700 overflow-hidden"
                    >
                      <img
                        src={item.preview}
                        className="h-32 w-full object-cover opacity-80"
                        alt={item.originalName}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 uppercase">
                          AI: {item.category}
                        </span>
                      </div>
                      <div className="flex gap-1 p-2 bg-slate-900 border-t border-slate-700">
                        <button
                          type="button"
                          onClick={() => approveAiImage(idx)}
                          className="flex-1 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 text-[8px] font-black py-2 uppercase hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAiStaging((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="bg-red-600/20 text-red-400 border border-red-600/30 px-3 py-2 hover:bg-red-600 hover:text-white"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- GALLERY (Per category) --- */}
          {Object.keys(galleryState).map((category) => (
            <div key={category} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#003566]">
                    {category}
                  </span>
                  <label className="cursor-pointer text-[#003566] text-[8px] font-black uppercase hover:text-blue-600">
                    + Add More
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleGalleryAdd(category, e.target.files)
                      }
                    />
                  </label>
                </div>

                {/* Image grid */}
                {galleryState[category].length > 0 && (
                  <div className="p-4 grid grid-cols-4 lg:grid-cols-8 gap-2">
                    {galleryState[category].map((file, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-slate-100 relative group"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          alt={`${category} ${i}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryState((prev) => ({
                              ...prev,
                              [category]: prev[category].filter(
                                (_, idx) => idx !== i,
                              ),
                            }))
                          }
                          className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* --- SUBMIT BUTTON --- */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-6 flex justify-end items-center z-50">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-12 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2 w-5 h-5" />
              ) : (
                <Save className="mr-2 w-5 h-5" />
              )}
              Register Vessel <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------------

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-0.5 block cursor-pointer"
    >
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-transparent border-b border-slate-200 py-2.5 text-xs font-bold text-[#003566] outline-none focus:border-blue-600 focus:bg-white/50 transition-all placeholder:text-slate-300",
        props.className,
      )}
    />
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 mb-4">
      {icon} {title}
    </h4>
  );
}
