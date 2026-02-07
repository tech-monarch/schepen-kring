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
  Fuel,
  Droplets,
  Palette,
  Cpu,
  Battery,
  Shield,
  ThermometerSun,
  Tv,
  Music,
  Anchor,
  Wind,
  Home,
  Info,
  Ruler,
  Weight,
  Navigation,
  Power
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

type AvailabilityRule = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type BooleanAmenities = {
  trailer_included: boolean;
  oven: boolean;
  microwave: boolean;
  fridge: boolean;
  freezer: boolean;
  air_conditioning: boolean;
  generator: boolean;
  inverter: boolean;
  television: boolean;
  dvd_player: boolean;
  cd_player: boolean;
  anchor: boolean;
  bimini: boolean;
  spray_hood: boolean;
  heating: boolean;
  central_heating: boolean;
};

export default function EmployeeYachtEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNewMode = params.id === "new";
  const yachtId = params.id;

  // Form State
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!isNewMode);
  const [errors, setErrors] = useState<any>(null);
  
  // Media State
  const [aiStaging, setAiStaging] = useState<AiStagedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryState, setGalleryState] = useState<GalleryState>({
    Exterior: [],
    Interior: [],
    "Engine Room": [],
    Bridge: [],
    General: []
  });

  // Availability State
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);

  // Boolean Amenities State
  const [booleanAmenities, setBooleanAmenities] = useState<BooleanAmenities>({
    trailer_included: false,
    oven: false,
    microwave: false,
    fridge: false,
    freezer: false,
    air_conditioning: false,
    generator: false,
    inverter: false,
    television: false,
    dvd_player: false,
    cd_player: false,
    anchor: false,
    bimini: false,
    spray_hood: false,
    heating: false,
    central_heating: false
  });

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
          General: []
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

        // Load availability rules
        if (yacht.availability_rules) {
          setAvailabilityRules(yacht.availability_rules);
        }

        // Load boolean amenities
        const amenities: BooleanAmenities = {
          trailer_included: yacht.trailer_included || false,
          oven: yacht.oven || false,
          microwave: yacht.microwave || false,
          fridge: yacht.fridge || false,
          freezer: yacht.freezer || false,
          air_conditioning: yacht.air_conditioning || false,
          generator: yacht.generator || false,
          inverter: yacht.inverter || false,
          television: yacht.television || false,
          dvd_player: yacht.dvd_player || false,
          cd_player: yacht.cd_player || false,
          anchor: yacht.anchor || false,
          bimini: yacht.bimini || false,
          spray_hood: yacht.spray_hood || false,
          heating: yacht.heating || false,
          central_heating: yacht.central_heating || false
        };
        setBooleanAmenities(amenities);

      } catch (err) {
        console.error("Failed to fetch yacht details", err);
        toast.error("Could not load vessel data.");
        router.push("/dashboard/yachts");
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
      const res = await api.post("/yachts/ai-classify", formData);
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
      const category = item.category;
      updatedGallery[category] = [
        ...updatedGallery[category],
        item.file,
      ];
    });
    setGalleryState(updatedGallery);
    setAiStaging([]);
    toast.success("All assets approved");
  };

  // Availability Handlers
  const addAvailabilityRule = () => {
    setAvailabilityRules([...availabilityRules, { day_of_week: 1, start_time: "10:00", end_time: "18:00" }]);
  };

  const removeAvailabilityRule = (index: number) => {
    setAvailabilityRules(availabilityRules.filter((_, i) => i !== index));
  };

  const updateAvailabilityRule = (index: number, field: keyof AvailabilityRule, value: any) => {
    const newRules = [...availabilityRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setAvailabilityRules(newRules);
  };

  // Boolean Amenities Handler
  const handleBooleanAmenityChange = (field: keyof BooleanAmenities) => {
    setBooleanAmenities(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // --- 3. SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);
    
    const formData = new FormData(e.currentTarget);

    // Add main image
    if (mainFile) formData.append("main_image", mainFile);

    // Add boolean amenities
    Object.keys(booleanAmenities).forEach(key => {
      formData.append(key, booleanAmenities[key as keyof BooleanAmenities] ? "1" : "0");
    });

    // Add availability rules
    formData.append("availability_rules", JSON.stringify(availabilityRules));

    // Cleanup empty numeric fields
    const numericFields = [
      "cabins", "heads", "price", "year", "engine_hours", 
      "engine_power", "berths", "length", "beam", "draft"
    ];
    
    numericFields.forEach((field) => {
      const val = formData.get(field);
      if (!val || val === "" || val === "undefined") {
        formData.set(field, "");
      }
    });

    try {
      let finalYachtId = selectedYacht?.id;
      
      if (!isNewMode && selectedYacht) {
        // Update existing yacht - using PUT method
        await api.put(`/yachts/${selectedYacht.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new yacht
        const res = await api.post("/yachts", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        finalYachtId = res.data.id;
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
          await api.post(`/yachts/${finalYachtId}/gallery`, gData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }

      toast.success(
        isNewMode
          ? "Vessel Registered Successfully"
          : "Manifest Updated Successfully",
      );
      router.push("/dashboard/yachts");
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Please fix validation errors");
      } else {
        console.error(err);
        toast.error(`Error ${err.response?.status}: ${err.response?.data?.message || "Critical System Error"}`);
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

      {/* PAGE HEADER */}
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
              {isNewMode
                ? "New Vessel Registration"
                : `Manifest: ${selectedYacht?.name || "Loading..."}`}
            </h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
              Registry Auth: Employee
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-12">
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
                  alt="Main yacht image"
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
                <Label>Vessel Name*</Label>
                <Input
                  name="name"
                  defaultValue={selectedYacht?.name}
                  placeholder="e.g. M/Y NOBILITY"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price (€)*</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={selectedYacht?.price}
                  placeholder="1500000"
                  required
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
                <Label>Make</Label>
                <Input
                  name="make"
                  defaultValue={selectedYacht?.make}
                  placeholder="e.g. Sunseeker"
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  name="model"
                  defaultValue={selectedYacht?.model}
                  placeholder="e.g. Predator 50"
                />
              </div>
              <div className="space-y-2">
                <Label>Reference Code</Label>
                <Input
                  name="reference_code"
                  defaultValue={selectedYacht?.reference_code}
                  placeholder="e.g. SSK-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  defaultValue={selectedYacht?.location}
                  placeholder="e.g. Monaco"
                />
              </div>
              <div className="space-y-2">
                <Label>VAT Status</Label>
                <select
                  name="vat_status"
                  defaultValue={selectedYacht?.vat_status || "VAT Included"}
                  className="w-full bg-slate-50 p-3 border-b border-slate-200 text-[#003566] font-bold text-xs outline-none focus:border-blue-600 transition-all"
                >
                  <option value="VAT Included">VAT Included</option>
                  <option value="VAT Excluded">VAT Excluded</option>
                  <option value="Margin Scheme">Margin Scheme</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
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
                  <option value="Under Offer">Under Offer</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                name="description"
                defaultValue={selectedYacht?.description}
                placeholder="Detailed description of the yacht including features, condition, and history..."
                className="w-full border border-slate-200 p-4 text-xs font-medium text-[#003566] h-40 outline-none focus:border-blue-600 resize-none bg-slate-50/50"
              />
            </div>
          </div>

          {/* --- SECTION 3: TECHNICAL DOSSIER --- */}
          <div className="space-y-12">
            <h3 className="text-[12px] font-black text-[#003566] uppercase tracking-[0.3em] flex items-center gap-3 border-b-2 border-[#003566] pb-4">
              <Waves size={18} /> Technical Dossier
            </h3>

            {/* Sub-Section: Dimensions & Hull */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Ruler size={14} />}
                title="Dimensions"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <Label>Length (m)</Label>
                  <Input
                    name="length"
                    type="number"
                    step="0.01"
                    defaultValue={selectedYacht?.length}
                    placeholder="45.5"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Beam (m)</Label>
                  <Input
                    name="beam"
                    type="number"
                    step="0.01"
                    defaultValue={selectedYacht?.beam}
                    placeholder="8.5"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Draft (m)</Label>
                  <Input
                    name="draft"
                    type="number"
                    step="0.01"
                    defaultValue={selectedYacht?.draft}
                    placeholder="2.1"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Clearance (m)</Label>
                  <Input
                    name="clearance"
                    defaultValue={selectedYacht?.clearance}
                    placeholder="4.5"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section: Hull Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <SectionHeader
                  icon={<Ship size={14} />}
                  title="Hull & Construction"
                />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label>Construction Material</Label>
                    <Input
                      name="construction_material"
                      defaultValue={selectedYacht?.construction_material}
                      placeholder="e.g. GRP / Polyester"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Shape</Label>
                    <Input
                      name="hull_shape"
                      defaultValue={selectedYacht?.hull_shape}
                      placeholder="e.g. V-Bottom"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Color</Label>
                    <Input
                      name="hull_color"
                      defaultValue={selectedYacht?.hull_color}
                      placeholder="e.g. White"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Deck Color</Label>
                    <Input
                      name="deck_color"
                      defaultValue={selectedYacht?.deck_color}
                      placeholder="e.g. Teak"
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
                    <Label>Overall Dimensions</Label>
                    <Input
                      name="dimensions"
                      defaultValue={selectedYacht?.dimensions}
                      placeholder="e.g. 45.5m x 8.5m x 2.1m"
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
                    <Label>Engine Type</Label>
                    <Input
                      name="engine_type"
                      defaultValue={selectedYacht?.engine_type}
                      placeholder="e.g. Inboard Diesel"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Engine Brand</Label>
                    <Input
                      name="engine_brand"
                      defaultValue={selectedYacht?.engine_brand}
                      placeholder="e.g. CAT / MTU"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Engine Model</Label>
                    <Input
                      name="engine_model"
                      defaultValue={selectedYacht?.engine_model}
                      placeholder="e.g. V12 2000"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Engine Power (HP)</Label>
                    <Input
                      name="engine_power"
                      defaultValue={selectedYacht?.engine_power}
                      placeholder="e.g. 2x 1500HP"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Engine Hours</Label>
                    <Input
                      name="engine_hours"
                      defaultValue={selectedYacht?.engine_hours}
                      placeholder="e.g. 450 hrs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fuel Type</Label>
                    <Input
                      name="fuel_type"
                      defaultValue={selectedYacht?.fuel_type}
                      placeholder="Diesel"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fuel Capacity</Label>
                    <Input
                      name="fuel_capacity"
                      defaultValue={selectedYacht?.fuel_capacity}
                      placeholder="e.g. 2000L"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Fuel Consumption</Label>
                    <Input
                      name="fuel_consumption"
                      defaultValue={selectedYacht?.fuel_consumption}
                      placeholder="e.g. 100L/h"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Max Speed (knots)</Label>
                    <Input
                      name="max_speed"
                      defaultValue={selectedYacht?.max_speed}
                      placeholder="e.g. 35 kn"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Steering</Label>
                    <Input
                      name="steering"
                      defaultValue={selectedYacht?.steering}
                      placeholder="Wheel / Joystick"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Section: Accommodation */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Bed size={14} />}
                title="Accommodation"
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
                  <Label>Berths (Beds)</Label>
                  <Input
                    name="berths"
                    defaultValue={selectedYacht?.berths}
                    placeholder="6 + 2 Crew"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Heads (Baths)</Label>
                  <Input
                    name="heads"
                    type="number"
                    defaultValue={selectedYacht?.heads}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Interior Type</Label>
                  <Input
                    name="interior_type"
                    defaultValue={selectedYacht?.interior_type}
                    placeholder="e.g. Modern / Classic"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section: Tanks & Water Systems */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Droplets size={14} />}
                title="Tanks & Water Systems"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <Label>Water Capacity</Label>
                  <Input
                    name="water_capacity"
                    defaultValue={selectedYacht?.water_capacity}
                    placeholder="e.g. 1000L"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Water Tank</Label>
                  <Input
                    name="water_tank"
                    defaultValue={selectedYacht?.water_tank}
                    placeholder="e.g. 800L"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Water System</Label>
                  <Input
                    name="water_system"
                    defaultValue={selectedYacht?.water_system}
                    placeholder="e.g. Pressurized"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section: Electrical */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Power size={14} />}
                title="Electrical Systems"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <Label>Voltage</Label>
                  <Input
                    name="voltage"
                    defaultValue={selectedYacht?.voltage}
                    placeholder="e.g. 12V/220V"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Generator</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={booleanAmenities.generator}
                      onChange={() => handleBooleanAmenityChange('generator')}
                      className="w-4 h-4 accent-[#003566]"
                    />
                    <span className="text-xs">Generator Installed</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Inverter</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={booleanAmenities.inverter}
                      onChange={() => handleBooleanAmenityChange('inverter')}
                      className="w-4 h-4 accent-[#003566]"
                    />
                    <span className="text-xs">Inverter Installed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Section: Equipment */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Box size={14} />}
                title="Equipment & Features"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label>Navigation & Electronics</Label>
                  <textarea
                    name="navigation_electronics"
                    defaultValue={selectedYacht?.navigation_electronics}
                    placeholder="List all navigation equipment (GPS, Radar, Autopilot, etc.)"
                    className="w-full border border-slate-200 p-4 text-xs font-medium text-[#003566] h-32 outline-none focus:border-blue-600 resize-none bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exterior & Deck Equipment</Label>
                  <textarea
                    name="exterior_equipment"
                    defaultValue={selectedYacht?.exterior_equipment}
                    placeholder="Anchor, Teak deck, Swimming ladder, Davits, etc."
                    className="w-full border border-slate-200 p-4 text-xs font-medium text-[#003566] h-32 outline-none focus:border-blue-600 resize-none bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Safety Equipment</Label>
                  <textarea
                    name="safety_equipment"
                    defaultValue={selectedYacht?.safety_equipment}
                    placeholder="Life jackets, Life raft, Fire extinguishers, EPIRB, etc."
                    className="w-full border border-slate-200 p-4 text-xs font-medium text-[#003566] h-32 outline-none focus:border-blue-600 resize-none bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section: Boolean Amenities */}
            <div className="space-y-6">
              <SectionHeader
                icon={<Home size={14} />}
                title="Amenities & Features"
              />
              <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Kitchen/Galley */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-500">Galley</h5>
                    <div className="space-y-1">
                      <CheckboxField
                        label="Oven"
                        checked={booleanAmenities.oven}
                        onChange={() => handleBooleanAmenityChange('oven')}
                      />
                      <CheckboxField
                        label="Microwave"
                        checked={booleanAmenities.microwave}
                        onChange={() => handleBooleanAmenityChange('microwave')}
                      />
                      <CheckboxField
                        label="Fridge"
                        checked={booleanAmenities.fridge}
                        onChange={() => handleBooleanAmenityChange('fridge')}
                      />
                      <CheckboxField
                        label="Freezer"
                        checked={booleanAmenities.freezer}
                        onChange={() => handleBooleanAmenityChange('freezer')}
                      />
                    </div>
                  </div>
                  
                  {/* Climate Control */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-500">Climate</h5>
                    <div className="space-y-1">
                      <CheckboxField
                        label="Air Conditioning"
                        checked={booleanAmenities.air_conditioning}
                        onChange={() => handleBooleanAmenityChange('air_conditioning')}
                      />
                      <CheckboxField
                        label="Heating"
                        checked={booleanAmenities.heating}
                        onChange={() => handleBooleanAmenityChange('heating')}
                      />
                      <CheckboxField
                        label="Central Heating"
                        checked={booleanAmenities.central_heating}
                        onChange={() => handleBooleanAmenityChange('central_heating')}
                      />
                    </div>
                  </div>
                  
                  {/* Entertainment */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-500">Entertainment</h5>
                    <div className="space-y-1">
                      <CheckboxField
                        label="Television"
                        checked={booleanAmenities.television}
                        onChange={() => handleBooleanAmenityChange('television')}
                      />
                      <CheckboxField
                        label="DVD Player"
                        checked={booleanAmenities.dvd_player}
                        onChange={() => handleBooleanAmenityChange('dvd_player')}
                      />
                      <CheckboxField
                        label="CD Player"
                        checked={booleanAmenities.cd_player}
                        onChange={() => handleBooleanAmenityChange('cd_player')}
                      />
                    </div>
                  </div>
                  
                  {/* Deck & Exterior */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-500">Deck & Exterior</h5>
                    <div className="space-y-1">
                      <CheckboxField
                        label="Anchor"
                        checked={booleanAmenities.anchor}
                        onChange={() => handleBooleanAmenityChange('anchor')}
                      />
                      <CheckboxField
                        label="Bimini"
                        checked={booleanAmenities.bimini}
                        onChange={() => handleBooleanAmenityChange('bimini')}
                      />
                      <CheckboxField
                        label="Spray Hood"
                        checked={booleanAmenities.spray_hood}
                        onChange={() => handleBooleanAmenityChange('spray_hood')}
                      />
                      <CheckboxField
                        label="Trailer Included"
                        checked={booleanAmenities.trailer_included}
                        onChange={() => handleBooleanAmenityChange('trailer_included')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION 4: SCHEDULING AUTHORITY --- */}
          <div className="space-y-8 bg-slate-50 p-10 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="text-[12px] font-black uppercase text-[#003566] tracking-[0.4em] flex items-center gap-3 italic">
                <Calendar size={20} className="text-blue-600" /> 04. Scheduling Authority
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
                <div key={idx} className="flex flex-wrap items-end gap-6 bg-white p-4 border border-slate-100 shadow-sm relative group">
                  <div className="flex-1 min-w-[150px]">
                    <Label>Day of Week</Label>
                    <select
                      value={rule.day_of_week}
                      onChange={(e) => updateAvailabilityRule(idx, 'day_of_week', parseInt(e.target.value))}
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
                        onChange={(e) => updateAvailabilityRule(idx, 'start_time', e.target.value)}
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
                        onChange={(e) => updateAvailabilityRule(idx, 'end_time', e.target.value)}
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

          {/* --- SECTION 5: AI CARGO DROP --- */}
          <div className="space-y-8 bg-slate-900 p-12 border-l-8 border-blue-500 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[12px] font-black uppercase text-blue-400 tracking-[0.4em] flex items-center gap-3 italic">
                  <Sparkles size={20} className="fill-blue-400" /> Gemini AI Categorizer
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
                        alt={item.originalName}
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
                <Images size={20} className="text-blue-600" /> {category} Gallery
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
                          alt={`Gallery image ${i + 1}`}
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

          {/* SAVE ACTION BAR */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-6 flex justify-between items-center z-50">
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

// ---------------- Helper Components ----------------

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

function CheckboxField({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: () => void 
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-[#003566]"
      />
      <label className="text-xs font-medium text-slate-700 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
}