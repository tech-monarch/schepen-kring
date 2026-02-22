"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";

// Configuration
const STORAGE_URL = "https://schepen-kring.nl/storage/";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

type AiStagedImage = {
  file: File;
  preview: string;
  category: string;
  originalName: string;
};
type GalleryState = { [key: string]: any[] };

// Availability Rule Type
type AvailabilityRule = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

// Spec Checkbox Component
function SpecCheckbox({
  field,
  label,
  selectedYacht,
  onSpecChange,
}: {
  field: string;
  label: string;
  selectedYacht: any;
  onSpecChange: (field: string, isChecked: boolean) => void;
}) {
  const [isChecked, setIsChecked] = useState(() => {
    if (selectedYacht?.display_specs) {
      return selectedYacht.display_specs.includes(field);
    }
    return true;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    onSpecChange(field, newChecked);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded">
      <input
        type="checkbox"
        name={`display_specs[${field}]`}
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

export default function YachtEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNewMode = params.id === "new";
  const yachtId = params.id;

  // Form State
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!isNewMode);
  const [errors, setErrors] = useState<any>(null);

  // AI & Media State
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

  // Availability State
  const [availabilityRules, setAvailabilityRules] = useState<
    AvailabilityRule[]
  >([]);

  // Display Specs State
  const [displaySpecs, setDisplaySpecs] = useState<Record<string, boolean>>({});

  // --- 1. FETCH DATA (IF EDITING) ---
  useEffect(() => {
    if (isNewMode) return;

    const fetchYachtDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/yachts/${yachtId}`);
        const yacht = res.data;
        setSelectedYacht(yacht);

        // Populate Main Image
        setMainPreview(
          yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : null,
        );

        // Populate Gallery
        const initialGallery: GalleryState = {
          Exterior: [],
          Interior: [],
          "Engine Room": [],
          Bridge: [],
          General: [],
        };

        if (yacht.images) {
          yacht.images.forEach((img: any) => {
            const category = img.category || "General";
            if (initialGallery[category]) {
              initialGallery[category].push(img);
            } else {
              initialGallery["General"].push(img);
            }
          });
        }
        setGalleryState(initialGallery);

        // Load existing availability rules
        if (yacht.availability_rules) {
          setAvailabilityRules(yacht.availability_rules);
        } else if (yacht.availabilityRules) {
          setAvailabilityRules(yacht.availabilityRules);
        }

        // Initialize display specs state
        if (yacht.display_specs) {
          const specsState: Record<string, boolean> = {};
          const allSpecs = [
            "builder",
            "model",
            "year",
            "designer",
            "where",
            "hull_number",
            "hull_type",
            "loa",
            "lwl",
            "beam",
            "draft",
            "air_draft",
            "displacement",
            "ballast",
            "passenger_capacity",
            "hull_colour",
            "hull_construction",
            "super_structure_colour",
            "super_structure_construction",
            "deck_colour",
            "deck_construction",
            "cockpit_type",
            "control_type",
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
            "cabins",
            "berths",
            "toilet",
            "shower",
            "bath",
            "heating",
          ];

          allSpecs.forEach((spec) => {
            specsState[spec] = yacht.display_specs.includes(spec);
          });
          setDisplaySpecs(specsState);
        }
      } catch (err) {
        console.error("Failed to fetch yacht details", err);
        toast.error("Could not load vessel data.");
        router.push("/nl/dashboard/admin/yachts");
      } finally {
        setLoading(false);
      }
    };

    fetchYachtDetails();
  }, [yachtId, isNewMode, router]);

  // --- 2. HANDLERS ---

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

  const deleteExistingImage = async (
    id: number,
    category: string,
    index: number,
  ) => {
    if (!confirm("Remove this image permanently?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      setGalleryState((prev) => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index),
      }));
      toast.success("Image removed");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete image");
    }
  };

  const handleAiCategorizer = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsAnalyzing(true);
    const formData = new FormData();
    const fileArray = Array.from(files);
    fileArray.forEach((file) => formData.append("images[]", file));
    try {
      toast.loading("Gemini is analyzing assets...", { id: "ai-loading" });

      let res;
      try {
        res = await api.post("/partner/yachts/ai-classify", formData);
      } catch (aiErr: any) {
        if (aiErr.response?.status === 403 || aiErr.response?.status === 404) {
          res = await api.post("/yachts/ai-classify", formData);
        } else {
          throw aiErr;
        }
      }

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

  // Availability Handlers
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

  // Display Specs Handler
  const handleSpecChange = (field: string, isChecked: boolean) => {
    setDisplaySpecs((prev) => ({
      ...prev,
      [field]: isChecked,
    }));
  };

  // --- 3. SIMPLIFIED SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    // Create form data directly without validation
    const formData = new FormData();

    // Collect all form data
    const formElements = e.currentTarget.elements;

    // Add boat name and price first
    const boatName = (
      document.querySelector('input[name="boat_name"]') as HTMLInputElement
    )?.value;
    const price = (
      document.querySelector('input[name="price"]') as HTMLInputElement
    )?.value;
    const minBidAmount = (
      document.querySelector('input[name="min_bid_amount"]') as HTMLInputElement
    )?.value;

    if (boatName) formData.append("boat_name", boatName);
    if (price) formData.append("price", price);
    if (minBidAmount) formData.append("min_bid_amount", minBidAmount);

    // Add main image if exists
    if (mainFile) {
      formData.append("main_image", mainFile);
    }

    // Add all other fields from form
    const fields = [
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
      "ballast",
      "stern_thruster",
      "bow_thruster",
      "starting_type",
      "drive_type",
    ];

    fields.forEach((field) => {
      const element = document.querySelector(
        `[name="${field}"]`,
      ) as HTMLInputElement;
      if (element && element.value !== undefined && element.value !== "") {
        formData.append(field, element.value);
      }
    });

    // Handle boolean fields - SIMPLIFIED
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
    ];

    booleanFields.forEach((field) => {
      const checkbox = document.querySelector(
        `[name="${field}"]`,
      ) as HTMLInputElement;
      if (checkbox) {
        formData.append(field, checkbox.checked ? "true" : "false");
      } else {
        formData.append(field, "false");
      }
    });

    // Add availability rules
    if (availabilityRules.length > 0) {
      formData.append("availability_rules", JSON.stringify(availabilityRules));
    }

    // Add display specs
    const selectedSpecs = Object.keys(displaySpecs).filter(
      (key) => displaySpecs[key],
    );
    if (selectedSpecs.length > 0) {
      formData.append("display_specs", JSON.stringify(selectedSpecs));
    }

    try {
      let finalYachtId = selectedYacht?.id;

      if (!isNewMode && selectedYacht) {
        // UPDATE
        await api.put(`/yachts/${selectedYacht.id}`, formData);
      } else {
        // CREATE NEW
        try {
          const res = await api.post("/partner/yachts", formData);
          finalYachtId = res.data.id;
        } catch (partnerErr: any) {
          if (
            partnerErr.response?.status === 403 ||
            partnerErr.response?.status === 404
          ) {
            const res = await api.post("/yachts", formData);
            finalYachtId = res.data.id;
          } else {
            throw partnerErr;
          }
        }
      }

      // Bulk gallery submission (new files only)
      for (const cat of Object.keys(galleryState)) {
        const newFiles = galleryState[cat].filter(
          (item) => item instanceof File,
        );
        if (newFiles.length > 0) {
          const gData = new FormData();
          newFiles.forEach((file) => gData.append("images[]", file));
          gData.append("category", cat);

          try {
            await api.post(`/partner/yachts/${finalYachtId}/gallery`, gData);
          } catch (galleryErr: any) {
            if (
              galleryErr.response?.status === 403 ||
              galleryErr.response?.status === 404
            ) {
              await api.post(`/yachts/${finalYachtId}/gallery`, gData);
            } else {
              throw galleryErr;
            }
          }
        }
      }

      toast.success(
        isNewMode
          ? "Vessel Registered Successfully"
          : "Manifest Updated Successfully",
      );
      router.push("/nl/dashboard/admin/yachts");
    } catch (err: any) {
      console.error("Submission error:", err);

      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Please check required fields");
      } else if (err.response?.status === 403) {
        toast.error("Permission denied.");
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again.");
      } else {
        toast.error(`Error: ${err.response?.data?.message || "System Error"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#003566]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Toaster position="top-right" />
      {/* PAGE HEADER - now relative (not sticky) */}
      <div className="bg-[#003566] text-white p-8 relative shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif italic">
              {isNewMode
                ? "New Vessel Registration"
                : `Manifest: ${selectedYacht?.boat_name || "Loading..."}`}
            </h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
              Registry Auth: Admin
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6 lg:p-12 pt-16">
        <form onSubmit={handleSubmit} className="space-y-16">
          {/* ERROR SUMMARY */}
          {errors && (
            <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex items-center gap-2 mb-3 font-black uppercase text-[11px]">
                <AlertCircle size={16} /> Data Conflict Detected
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

          {/* --- SECTION 1: PROFILE AUTHORITY --- */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-[#003566] tracking-widest flex items-center gap-2 italic">
              <Camera size={16} /> 01. Profile Authority
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
                    Select Primary Identification Photo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- SECTION 2: CORE SPECS --- */}
          <div className="bg-white p-8 lg:p-10 border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2 border-b border-slate-50 pb-4 italic">
              <Coins size={16} /> Essential Registry Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label>Vessel Name *</Label>
                <Input
                  name="boat_name"
                  defaultValue={selectedYacht?.boat_name}
                  placeholder="e.g. M/Y NOBILITY"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price (€)</Label>
                <Input
                  name="price"
                  type="number"
                  defaultValue={selectedYacht?.price}
                  placeholder="1500000"
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Bid Amount (€)</Label>
                <Input
                  name="min_bid_amount"
                  type="number"
                  defaultValue={selectedYacht?.min_bid_amount || ""}
                  placeholder="Auto-calculates 90% of price if empty"
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label>Year Built</Label>
                <Input
                  name="year"
                  type="number"
                  defaultValue={selectedYacht?.year}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label>LOA (Length Overall)</Label>
                <Input
                  name="loa"
                  defaultValue={selectedYacht?.loa}
                  placeholder="45.5"
                />
              </div>
              <div className="space-y-2">
                <Label>LWL (Waterline Length)</Label>
                <Input
                  name="lwl"
                  defaultValue={selectedYacht?.lwl}
                  placeholder="40.2"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="where"
                  defaultValue={selectedYacht?.where}
                  placeholder="e.g. Monaco"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  name="status"
                  defaultValue={selectedYacht?.status || "Draft"}
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
                  defaultValue={selectedYacht?.passenger_capacity}
                  placeholder="12"
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3: TECHNICAL DOSSIER --- */}
          <div className="space-y-12">
            <h3 className="text-[12px] font-black text-[#003566] uppercase tracking-[0.3em] flex items-center gap-3 border-b-2 border-[#003566] pb-4">
              <Waves size={18} /> Technical Dossier
            </h3>

            {/* Sub-Section: General & Hull */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <SectionHeader
                  icon={<Ship size={14} />}
                  title="Hull & Dimensions"
                />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label>Beam (Width)</Label>
                    <Input
                      name="beam"
                      defaultValue={selectedYacht?.beam}
                      placeholder="e.g. 8.5m"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Draft (Depth)</Label>
                    <Input
                      name="draft"
                      defaultValue={selectedYacht?.draft}
                      placeholder="e.g. 2.1m"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Air Draft (Clearance)</Label>
                    <Input
                      name="air_draft"
                      defaultValue={selectedYacht?.air_draft}
                      placeholder="e.g. 4.5m"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Displacement</Label>
                    <Input
                      name="displacement"
                      defaultValue={selectedYacht?.displacement}
                      placeholder="e.g. 12000 kg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Type</Label>
                    <Input
                      name="hull_type"
                      defaultValue={selectedYacht?.hull_type}
                      placeholder="e.g. Monohull"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Construction</Label>
                    <Input
                      name="hull_construction"
                      defaultValue={selectedYacht?.hull_construction}
                      placeholder="e.g. GRP / Polyester"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Colour</Label>
                    <Input
                      name="hull_colour"
                      defaultValue={selectedYacht?.hull_colour}
                      placeholder="White"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Number</Label>
                    <Input
                      name="hull_number"
                      defaultValue={selectedYacht?.hull_number}
                      placeholder="e.g. HULL001"
                    />
                  </div>
                </div>
              </div>

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
                      defaultValue={selectedYacht?.engine_manufacturer}
                      placeholder="e.g. CAT / MTU"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Horse Power</Label>
                    <Input
                      name="horse_power"
                      defaultValue={selectedYacht?.horse_power}
                      placeholder="e.g. 2x 1500HP"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Engine Hours</Label>
                    <Input
                      name="hours"
                      defaultValue={selectedYacht?.hours}
                      placeholder="e.g. 450 hrs"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fuel Type</Label>
                    <Input
                      name="fuel"
                      defaultValue={selectedYacht?.fuel}
                      placeholder="Diesel"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Max Speed</Label>
                    <Input
                      name="max_speed"
                      defaultValue={selectedYacht?.max_speed}
                      placeholder="e.g. 35 kn"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Cruising Speed</Label>
                    <Input
                      name="cruising_speed"
                      defaultValue={selectedYacht?.cruising_speed}
                      placeholder="e.g. 25 kn"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Gallons per Hour</Label>
                    <Input
                      name="gallons_per_hour"
                      defaultValue={selectedYacht?.gallons_per_hour}
                      placeholder="e.g. 50"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Tankage</Label>
                    <Input
                      name="tankage"
                      defaultValue={selectedYacht?.tankage}
                      placeholder="e.g. 2000L"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Section: Accommodation */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Bed size={14} />}
                title="Accommodation & Facilities"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <Label>Cabins</Label>
                  <Input
                    name="cabins"
                    type="number"
                    defaultValue={selectedYacht?.cabins}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Berths</Label>
                  <Input
                    name="berths"
                    defaultValue={selectedYacht?.berths}
                    placeholder="6"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Toilet</Label>
                  <Input
                    name="toilet"
                    defaultValue={selectedYacht?.toilet}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Shower</Label>
                  <Input
                    name="shower"
                    defaultValue={selectedYacht?.shower}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Bath</Label>
                  <Input
                    name="bath"
                    defaultValue={selectedYacht?.bath}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Heating</Label>
                  <Input
                    name="heating"
                    defaultValue={selectedYacht?.heating}
                    placeholder="e.g. Central heating"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cockpit Type</Label>
                  <Input
                    name="cockpit_type"
                    defaultValue={selectedYacht?.cockpit_type}
                    placeholder="e.g. Open / Closed"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Control Type</Label>
                  <Input
                    name="control_type"
                    defaultValue={selectedYacht?.control_type}
                    placeholder="e.g. Wheel / Joystick"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section: Equipment Checkboxes */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Box size={14} />}
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
                ].map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-2 bg-slate-50/50 p-3"
                  >
                    <input
                      type="checkbox"
                      name={field}
                      id={field}
                      defaultChecked={selectedYacht?.[field]}
                      className="w-3 h-3 accent-[#003566] cursor-pointer"
                    />
                    <label
                      htmlFor={field}
                      className="text-[8px] font-black uppercase tracking-wider text-slate-600 cursor-pointer select-none flex-1"
                    >
                      {field.replace("_", " ")}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Display Specifications Control --- */}
            <div className="space-y-6 bg-white p-6 border border-slate-200">
              <SectionHeader
                icon={<Eye size={14} />}
                title="Display Specifications"
              />
              <p className="text-[9px] text-gray-600 mb-4">
                Select which specifications to show on the public yacht page
              </p>

              <div className="space-y-4">
                {/* General Specs */}
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
                        label={field.replace("_", " ")}
                        selectedYacht={selectedYacht}
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
                        label={field.replace("_", " ")}
                        selectedYacht={selectedYacht}
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
                        label={field.replace("_", " ")}
                        selectedYacht={selectedYacht}
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
                        label={field.replace("_", " ")}
                        selectedYacht={selectedYacht}
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
                        label={field.replace("_", " ")}
                        selectedYacht={selectedYacht}
                        onSpecChange={handleSpecChange}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEW SECTION: SCHEDULING AUTHORITY */}
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

          {/* 05. AI CARGO DROP */}
          <div className="space-y-8 bg-slate-900 p-12 border-l-8 border-blue-500 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[12px] font-black uppercase text-blue-400 tracking-[0.4em] flex items-center gap-3 italic">
                  <Sparkles size={20} className="fill-blue-400" /> Gemini AI
                  Categorizer
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2 tracking-widest italic">
                  Automated asset classification via Neural Engine
                </p>
              </div>

              <label className="cursor-pointer bg-blue-600 text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl">
                {isAnalyzing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {isAnalyzing ? "Processing..." : "Initiate AI Cargo Drop"}
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

            {/* Staging Area Grid */}
            {aiStaging.length > 0 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">
                    {aiStaging.length} Assets in Staging
                  </p>
                  <button
                    type="button"
                    onClick={approveAllAi}
                    className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase flex items-center gap-2"
                  >
                    <CheckCircle size={14} /> Approve Entire Batch
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {aiStaging.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-slate-800 border border-slate-700 overflow-hidden shadow-lg"
                    >
                      <img
                        src={item.preview}
                        className="h-40 w-full object-cover opacity-80"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 uppercase tracking-tighter">
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

          {/* --- SECTION 6: GALLERY --- */}
          {Object.keys(galleryState).map((category) => (
            <div key={category} className="space-y-8">
              <h3 className="text-[11px] font-black uppercase text-[#003566] tracking-widest flex items-center gap-2 italic border-b border-slate-200 pb-4">
                <Images size={20} className="text-blue-600" /> {category}{" "}
                Gallery
              </h3>
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#003566]">
                    {category}
                  </span>
                  <label className="cursor-pointer bg-[#003566] text-white px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors shadow-sm">
                    Queue Files
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
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-[120px]">
                  {galleryState[category].map((item, i) => {
                    const isFile = item instanceof File;
                    const src = isFile
                      ? URL.createObjectURL(item)
                      : `${STORAGE_URL}${item.url}`;
                    return (
                      <div
                        key={i}
                        className="aspect-square bg-slate-50 relative group overflow-hidden border border-slate-100"
                      >
                        <img
                          src={src}
                          onError={handleImageError}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (isFile) {
                              setGalleryState((prev) => ({
                                ...prev,
                                [category]: prev[category].filter(
                                  (_, idx) => idx !== i,
                                ),
                              }));
                            } else {
                              deleteExistingImage(item.id, category, i);
                            }
                          }}
                          className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all backdrop-blur-sm"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {galleryState[category].length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-8 opacity-30 gap-2">
                      <Images size={24} />
                      <span className="text-[9px] uppercase font-bold">
                        No Media
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* SAVE ACTION BAR - now a normal block at the end */}
          <div className="mt-8 p-6 flex justify-between items-center border-t border-slate-200 bg-white">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 hidden lg:block">
              Unsaved changes will be lost
            </p>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-12 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl ml-auto"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2 w-5 h-5" />
              ) : (
                <Save className="mr-2 w-5 h-5" />
              )}
              {isNewMode
                ? "Initialize Vessel Registry"
                : "Save Manifest Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------- Helper Components ---------------- //

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-0.5">
      {children}
    </p>
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
