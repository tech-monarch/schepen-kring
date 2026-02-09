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
  Box,
  CheckSquare,
  Sparkles,
  CheckCircle,
  Zap,
  Bed,
  Save,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";

// Configuration
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

type AiStagedImage = {
  file: File;
  preview: string;
  category: string;
  originalName: string;
};

type GalleryState = { [key: string]: any[] };

export default function OnboardingYachtSetup() {
  const router = useRouter();

  // --- FORM STATE ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  // --- AI & MEDIA STATE ---
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

  // --- HANDLERS ---
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

  // --- SUBMIT LOGIC (CREATE ONLY) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);
    const formData = new FormData(e.currentTarget);

    // Handle main image
    if (mainFile) formData.set("main_image", mainFile);

    // Set default boolean values to false
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
      "bimini"
    ];

    // Set all boolean fields to false by default
    booleanFields.forEach(field => {
      if (!formData.has(field)) {
        formData.append(field, "0");
      } else {
        // Convert checkbox value to boolean
        const value = formData.get(field);
        formData.set(field, value === "on" ? "1" : "0");
      }
    });

    // Cleanup empty numeric fields
    const numericFields = [
      "price", "year", "hours", "horse_power", "berths",
      "cabins", "loa", "beam", "draft"
    ];
    
    numericFields.forEach((field) => {
      const val = formData.get(field);
      if (!val || val === "" || val === "undefined") {
        formData.set(field, "");
      }
    });

    // Handle text fields that should be null if empty
    const textFields = [
      "owners_comment", "reg_details", "known_defects", "ballast",
      "engine_quantity", "tankage", "litres_per_hour", "gearbox",
      "cylinders", "propeller_type", "engine_location", "cooling_system",
      "genoa", "tri_sail", "storm_jib", "main_sail", "winches",
      "toilet", "shower", "bath", "heating"
    ];

    textFields.forEach((field) => {
      const val = formData.get(field);
      if (!val || val === "" || val === "undefined") {
        formData.delete(field); // Remove empty text fields
      }
    });

    try {
      // 1. Create the Yacht
      const res = await api.post("/partner/yachts", formData);
      const newYachtId = res.data.id;

      // 2. Upload Gallery Images
      for (const cat of Object.keys(galleryState)) {
        const newFiles = galleryState[cat];
        if (newFiles.length > 0) {
          const gData = new FormData();
          newFiles.forEach((file) => gData.append("images[]", file));
          gData.append("category", cat);
          await api.post(`/partner/yachts/${newYachtId}/gallery`, gData);
        }
      }

      toast.success("Vessel Registered! Welcome Aboard.");
      
      // 3. Redirect to Main Dashboard
      router.push("/nl/dashboard/partner"); 
      
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Please fix validation errors");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        console.error(err);
        toast.error("System Error during registration");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 ">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-[#003566] text-white p-8 sticky top-20 z-40 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif italic">
            Register Your First Vessel
          </h1>
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
            Partner Onboarding • Step 2 of 2
          </p>
        </div>
        <div className="hidden md:block text-right opacity-50">
           <p className="text-[10px] uppercase font-bold tracking-widest">Final Step</p>
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
              onClick={() => document.getElementById("main_image_input")?.click()}
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

          {/* --- SECTION 2: CORE SPECS --- */}
          <div className="bg-white p-8 lg:p-10 border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2 border-b border-slate-50 pb-4 italic">
              <Coins size={16} /> Essential Registry Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label>Vessel Name *</Label>
                <Input name="boat_name" placeholder="e.g. M/Y NOBILITY" required />
              </div>
              <div className="space-y-2">
                <Label>Price (€)</Label>
                <Input name="price" type="number" placeholder="1500000" />
              </div>
              <div className="space-y-2">
                <Label>Year Built</Label>
                <Input name="year" type="number" placeholder="2024" />
              </div>
              <div className="space-y-2">
                <Label>Length Overall (m)</Label>
                <Input name="loa" placeholder="45.5" />
              </div>
              <div className="space-y-2">
                <Label>Beam (m)</Label>
                <Input name="beam" placeholder="8.5" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  name="status"
                  className="w-full bg-slate-50 p-3 border-b border-slate-200 text-[#003566] font-bold text-xs outline-none focus:border-blue-600 transition-all"
                >
                  <option value="For Sale">For Sale</option>
                  <option value="For Bid">For Bid</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- SECTION 3: TECHNICAL DOSSIER --- */}
          <div className="space-y-12">
            <h3 className="text-[12px] font-black text-[#003566] uppercase tracking-[0.3em] flex items-center gap-3 border-b-2 border-[#003566] pb-4">
              <Waves size={18} /> Technical Dossier
            </h3>

            {/* Hull & Dimensions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <SectionHeader icon={<Ship size={14} />} title="Hull & Dimensions" />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label>Draft (m)</Label>
                    <Input name="draft" placeholder="e.g. 2.1m" />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Type</Label>
                    <Input name="hull_type" placeholder="e.g. V-Bottom" />
                  </div>
                  <div className="space-y-1">
                    <Label>Hull Construction</Label>
                    <Input name="hull_construction" placeholder="e.g. GRP" />
                  </div>
                  <div className="space-y-1">
                    <Label>Designer</Label>
                    <Input name="designer" placeholder="e.g. Naval Architect" />
                  </div>
                </div>
              </div>

              {/* Engine */}
              <div className="space-y-6">
                <SectionHeader icon={<Zap size={14} />} title="Engine" />
                <div className="bg-slate-50 p-6 border border-slate-100 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label>Engine Manufacturer</Label>
                    <Input name="engine_manufacturer" placeholder="e.g. CAT" className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label>Power (HP)</Label>
                    <Input name="horse_power" placeholder="e.g. 1500" className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label>Engine Hours</Label>
                    <Input name="hours" placeholder="e.g. 450" className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label>Fuel Type</Label>
                    <Input name="fuel" placeholder="Diesel" className="bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodation */}
            <div className="space-y-6">
              <SectionHeader icon={<Bed size={14} />} title="Accommodation" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <Label>Cabins</Label>
                  <Input name="cabins" type="number" placeholder="3" />
                </div>
                <div className="space-y-1">
                  <Label>Berths</Label>
                  <Input name="berths" placeholder="6" />
                </div>
                <div className="space-y-1">
                  <Label>Toilets</Label>
                  <Input name="toilet" placeholder="2" />
                </div>
                <div className="space-y-1">
                  <Label>Showers</Label>
                  <Input name="shower" placeholder="2" />
                </div>
              </div>
            </div>

            {/* Owner's Comments */}
            <div className="space-y-6">
              <SectionHeader icon={<Box size={14} />} title="Additional Details" />
              <div className="space-y-4">
                <div>
                  <Label>Owner's Comments</Label>
                  <textarea
                    name="owners_comment"
                    className="w-full h-32 bg-slate-50 border border-slate-200 p-4 text-xs text-[#003566] font-medium outline-none focus:border-blue-600 transition-all resize-none"
                    placeholder="Any additional comments about the vessel..."
                  />
                </div>
                
                {/* Quick Equipment Checkboxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="air_conditioning" name="air_conditioning" className="w-4 h-4" />
                    <Label htmlFor="air_conditioning" className="!text-[8px] !font-normal !text-slate-600">A/C</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="autopilot" name="autopilot" className="w-4 h-4" />
                    <Label htmlFor="autopilot" className="!text-[8px] !font-normal !text-slate-600">Autopilot</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="gps" name="gps" className="w-4 h-4" />
                    <Label htmlFor="gps" className="!text-[8px] !font-normal !text-slate-600">GPS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="generator" name="generator" className="w-4 h-4" />
                    <Label htmlFor="generator" className="!text-[8px] !font-normal !text-slate-600">Generator</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI CATEGORIZER */}
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
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Upload size={14} />}
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
                    <div key={idx} className="relative group bg-slate-800 border border-slate-700">
                      <img src={item.preview} className="h-32 w-full object-cover opacity-80" />
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 uppercase">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GALLERY PREVIEW (For Manual Additions) */}
           {Object.keys(galleryState).map((category) => (
            <div key={category} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#003566]">
                    {category}
                  </span>
                  {/* Manual Add Button */}
                   <label className="cursor-pointer text-[#003566] text-[8px] font-black uppercase hover:text-blue-600">
                    + Add More
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleGalleryAdd(category, e.target.files)}
                    />
                  </label>
                </div>
                
                {/* Image Grid */}
                {galleryState[category].length > 0 && (
                   <div className="p-4 grid grid-cols-4 lg:grid-cols-8 gap-2">
                     {galleryState[category].map((file, i) => (
                       <div key={i} className="aspect-square bg-slate-100 relative group">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                           <button
                              type="button"
                              onClick={() => setGalleryState(prev => ({...prev, [category]: prev[category].filter((_, idx) => idx !== i)}))}
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

          {/* SUBMIT BUTTON */}
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
              Complete & Go to Dashboard <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Updated Label component to accept htmlFor
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
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

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 mb-4">
      {icon} {title}
    </h4>
  );
}