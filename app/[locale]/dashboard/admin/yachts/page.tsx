"use client";

import { useState, useEffect, SyntheticEvent } from "react";
import { api } from "@/lib/api";
import {
  Plus,
  Camera,
  Loader2,
  Upload,
  Waves,
  Coins,
  Images,
  Trash,
  AlertCircle,
  MapPin,
  Maximize2,
  Calendar,
  Edit3,
  X,
  Info,
  Search,
  Anchor,
  Zap,
  Bed,
  Ship,
  Compass,
  Box,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Configuration
const STORAGE_URL = "https://kring.answer24.nl/storage/";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80"; // Fallback yacht image

type GalleryState = { [key: string]: any[] };

export default function FleetManagementPage() {
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Sheet & Form State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  // Media State
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [galleryState, setGalleryState] = useState<GalleryState>({
    Exterior: [],
    Interior: [],
    "Engine Room": [],
    Bridge: [],
  });

  // Fetch fleet
  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/yachts");
      setFleet(res.data);
    } catch (err) {
      console.error("API Sync Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // Handle Image Load Errors
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale"); // Visual cue that it's a placeholder
  };

  // Open sheet and load yacht
  const openTerminal = (yacht: any = null) => {
    setSelectedYacht(yacht);
    setErrors(null);
    setMainFile(null);

    const initialGallery: GalleryState = {
      Exterior: [],
      Interior: [],
      "Engine Room": [],
      Bridge: [],
    };

    if (yacht?.images) {
      yacht.images.forEach((img: any) => {
        // Ensure legacy images get assigned to a category
        const category = img.category || "Exterior";
        if (initialGallery[category]) {
          initialGallery[category].push(img);
        } else {
            // Fallback for unknown categories
            initialGallery["Exterior"].push(img);
        }
      });
    }

    setGalleryState(initialGallery);
    setMainPreview(
      yacht?.main_image ? `${STORAGE_URL}${yacht.main_image}` : null
    );
    setIsSheetOpen(true);
  };

  // Add files to gallery
  const handleGalleryAdd = (category: string, files: FileList | null) => {
    if (!files) return;
    setGalleryState((prev) => ({
      ...prev,
      [category]: [...prev[category], ...Array.from(files)],
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);
    const formData = new FormData(e.currentTarget);

    // Main image logic
    if (mainFile) formData.set("main_image", mainFile);
    else if (!selectedYacht && !mainFile) {
        // Handle case where no image is uploaded for new yacht (optional validation)
    }

    // Handle Checkbox for Trailer (HTML checkboxes don't send 'false' if unchecked)
    if (!formData.has('trailer_included')) {
        formData.append('trailer_included', '0');
    } else {
        formData.set('trailer_included', '1');
    }

    // Cleanup empty numeric fields to avoid API errors
    const numericFields = ["cabins", "heads", "price", "year", "engine_hours", "engine_power", "berths"];
    numericFields.forEach((field) => {
      const val = formData.get(field);
      if (!val || val === "") formData.set(field, ""); // Send empty string or handle in backend as null
    });

    try {
      let yachtId = selectedYacht?.id;
      if (selectedYacht) {
        formData.append("_method", "PUT");
        await api.post(`/yachts/${selectedYacht.id}`, formData);
      } else {
        const res = await api.post("/yachts", formData);
        yachtId = res.data.id;
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
          await api.post(`/yachts/${yachtId}/gallery`, gData);
        }
      }

      setIsSheetOpen(false);
      fetchFleet();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete existing gallery image
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
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 text-[#003566] \ -mt-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight">
            Registry Command
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
            Fleet Management System v2.1
          </p>
        </div>
        <Button
          onClick={() => openTerminal()}
          className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-10 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg"
        >
          <Plus className="mr-2 w-5 h-5" /> Register New Vessel
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-10 group">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="SEARCH MANIFEST BY VESSEL NAME..."
          className="w-full bg-white border border-slate-200 p-6 pl-16 text-[11px] font-black tracking-widest outline-none shadow-sm focus:ring-1 focus:ring-blue-600 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Database...</p>
          </div>
        ) : (
          fleet
            .filter((y) =>
              y.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((yacht) => (
              <div
                key={yacht.id}
                className="bg-white border border-slate-200 group overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500"
              >
                <div className="h-72 bg-slate-100 overflow-hidden relative">
                  <img
                    src={yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : PLACEHOLDER_IMAGE}
                    onError={handleImageError}
                    alt={yacht.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#003566]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      onClick={() => openTerminal(yacht)}
                      className="bg-white text-[#003566] p-4 rounded-none font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center gap-2"
                    >
                      <Edit3 size={14} /> Edit Manifest
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-serif italic truncate pr-4">{yacht.name}</h3>
                      <span className={cn(
                          "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                          yacht.status === 'For Sale' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          yacht.status === 'For Bid' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {yacht.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-900 tracking-tighter">
                      {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(Number(yacht.price))}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase text-slate-400">
                    <div className="flex items-center gap-1">
                      <Maximize2 size={12} className="text-blue-600" /> {yacht.length}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-blue-600" /> {yacht.year}
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin size={12} className="text-blue-600" /> {yacht.location || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* POPUP TERMINAL */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[1000px] w-full bg-[#F8FAFC] p-0 border-l-12 border-[#003566] overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col min-h-full pb-20"
          >
            {/* STICKY HEADER */}
            <div className="bg-[#003566] p-8 lg:p-10 text-white sticky top-0 z-40 flex justify-between items-center shadow-xl">
              <div>
                <SheetTitle className="text-3xl lg:text-4xl font-serif italic">
                  Vessel Manifest Entry
                </SheetTitle>
                <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">
                  Registry Auth: Admin
                </p>
              </div>
              <X
                className="text-white/20 cursor-pointer hover:text-white transition-colors"
                size={32}
                onClick={() => setIsSheetOpen(false)}
              />
            </div>

            {/* ERROR SUMMARY */}
            {errors && (
              <div className="mx-10 mt-10 p-6 bg-red-50 border-l-4 border-red-500 text-red-700">
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

            {/* FORM CONTENT */}
            <div className="p-8 lg:p-12 space-y-16">
              
              {/* --- SECTION 1: PROFILE AUTHORITY --- */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-[#003566] tracking-widest flex items-center gap-2 italic">
                  <Camera size={16} /> 01. Profile Authority
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
                      <Upload className="mx-auto text-slate-200 mb-4 group-hover:text-blue-600 transition-colors" size={48} />
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
                    <Label>Vessel Name</Label>
                    <Input name="name" defaultValue={selectedYacht?.name} placeholder="e.g. M/Y NOBILITY" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (€)</Label>
                    <Input name="price" type="number" defaultValue={selectedYacht?.price} placeholder="1500000" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Year Built</Label>
                    <Input name="year" type="number" defaultValue={selectedYacht?.year} placeholder="2024" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Length (m)</Label>
                    <Input name="length" defaultValue={selectedYacht?.length} placeholder="45.5" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input name="location" defaultValue={selectedYacht?.location} placeholder="e.g. Monaco" />
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
                </div>
              </div>

              {/* --- SECTION 3: TECHNICAL MATRIX (THE NEW FIELDS) --- */}
              <div className="space-y-12 pb-10">
                <h3 className="text-[12px] font-black text-[#003566] uppercase tracking-[0.3em] flex items-center gap-3 border-b-2 border-[#003566] pb-4">
                  <Waves size={18} /> Technical Dossier
                </h3>

                {/* Sub-Section: General & Hull */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <SectionHeader icon={<Ship size={14} />} title="Hull & Dimensions" />
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <Label>Hull Shape</Label>
                          <Input name="hull_shape" defaultValue={selectedYacht?.hull_shape} placeholder="e.g. V-Bottom" />
                       </div>
                       <div className="space-y-1">
                          <Label>Material</Label>
                          <Input name="construction_material" defaultValue={selectedYacht?.construction_material} placeholder="e.g. GRP / Polyester" />
                       </div>
                       <div className="space-y-1">
                          <Label>Beam (Width)</Label>
                          <Input name="beam" defaultValue={selectedYacht?.beam} placeholder="e.g. 8.5m" />
                       </div>
                       <div className="space-y-1">
                          <Label>Draft (Depth)</Label>
                          <Input name="draft" defaultValue={selectedYacht?.draft} placeholder="e.g. 2.1m" />
                       </div>
                       <div className="space-y-1">
                          <Label>Displacement</Label>
                          <Input name="displacement" defaultValue={selectedYacht?.displacement} placeholder="e.g. 12000 kg" />
                       </div>
                       <div className="space-y-1">
                          <Label>Clearance</Label>
                          <Input name="clearance" defaultValue={selectedYacht?.clearance} placeholder="e.g. 4.5m" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <SectionHeader icon={<Zap size={14} />} title="Engine & Performance" />
                    <div className="bg-slate-50 p-6 border border-slate-100 grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <Label>Engine Brand</Label>
                          <Input name="engine_brand" defaultValue={selectedYacht?.engine_brand} placeholder="e.g. CAT / MTU" className="bg-white" />
                       </div>
                       <div className="space-y-1">
                          <Label>Model</Label>
                          <Input name="engine_model" defaultValue={selectedYacht?.engine_model} placeholder="e.g. V12 2000" className="bg-white" />
                       </div>
                       <div className="space-y-1">
                          <Label>Power (HP)</Label>
                          <Input name="engine_power" defaultValue={selectedYacht?.engine_power} placeholder="e.g. 2x 1500HP" className="bg-white" />
                       </div>
                       <div className="space-y-1">
                          <Label>Engine Hours</Label>
                          <Input name="engine_hours" defaultValue={selectedYacht?.engine_hours} placeholder="e.g. 450 hrs" className="bg-white" />
                       </div>
                       <div className="space-y-1">
                          <Label>Fuel Type</Label>
                          <Input name="fuel_type" defaultValue={selectedYacht?.fuel_type} placeholder="Diesel" className="bg-white" />
                       </div>
                       <div className="space-y-1">
                          <Label>Max Speed</Label>
                          <Input name="max_speed" defaultValue={selectedYacht?.max_speed} placeholder="e.g. 35 kn" className="bg-white" />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Section: Accommodation & Systems */}
                <div className="space-y-6">
                   <SectionHeader icon={<Bed size={14} />} title="Accommodation & Systems" />
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1">
                         <Label>Cabins</Label>
                         <Input name="cabins" type="number" defaultValue={selectedYacht?.cabins} placeholder="3" />
                      </div>
                      <div className="space-y-1">
                         <Label>Berths (Beds)</Label>
                         <Input name="berths" defaultValue={selectedYacht?.berths} placeholder="6 + 2 Crew" />
                      </div>
                      <div className="space-y-1">
                         <Label>Heads (Baths)</Label>
                         <Input name="heads" type="number" defaultValue={selectedYacht?.heads} placeholder="2" />
                      </div>
                      <div className="space-y-1">
                         <Label>Water Tank</Label>
                         <Input name="water_tank" defaultValue={selectedYacht?.water_tank} placeholder="e.g. 800L" />
                      </div>
                      <div className="space-y-1">
                         <Label>VAT Status</Label>
                         <select name="vat_status" defaultValue={selectedYacht?.vat_status} className="w-full border-b border-slate-200 py-2.5 text-xs font-bold text-[#003566] bg-transparent outline-none">
                            <option value="VAT Included">VAT Included</option>
                            <option value="VAT Excluded">VAT Excluded</option>
                            <option value="Margin Scheme">Margin Scheme</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <Label>Steering</Label>
                         <Input name="steering" defaultValue={selectedYacht?.steering} placeholder="Wheel / Joystick" />
                      </div>
                   </div>
                </div>
                
                {/* Sub-Section: Equipment Lists & Features */}
                <div className="space-y-6">
                    <SectionHeader icon={<Box size={14} />} title="Equipment & Features" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label>Navigation & Electronics</Label>
                            <textarea 
                                name="navigation_electronics" 
                                defaultValue={selectedYacht?.navigation_electronics}
                                placeholder="List all navigation equipment (GPS, Radar, Plotter, VHF...)"
                                className="w-full border border-slate-200 p-4 text-xs font-medium text-[#003566] h-32 outline-none focus:border-blue-600 resize-none bg-slate-50/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Exterior & Deck Equipment</Label>
                            <textarea 
                                name="exterior_equipment" 
                                defaultValue={selectedYacht?.exterior_equipment}
                                placeholder="Anchor, Teak deck, Swimming ladder, Covers..."
                                className="w-full border border-slate-200 p-4 text-xs font-medium text-[#003566] h-32 outline-none focus:border-blue-600 resize-none bg-slate-50/50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-blue-50/50 p-4 border border-blue-100 rounded-sm">
                        <input 
                            type="checkbox" 
                            name="trailer_included" 
                            id="trailer_check"
                            defaultChecked={selectedYacht?.trailer_included}
                            className="w-4 h-4 accent-[#003566] cursor-pointer"
                        />
                        <label htmlFor="trailer_check" className="text-[10px] font-black uppercase tracking-widest text-[#003566] cursor-pointer select-none flex items-center gap-2">
                             <CheckSquare size={14} /> Trailer Included in Sale
                        </label>
                    </div>
                </div>
              </div>

              {/* --- SECTION 4: GALLERY --- */}
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
                          onChange={(e) => handleGalleryAdd(category, e.target.files)}
                        />
                      </label>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-[120px]">
                      {galleryState[category].map((item, i) => {
                        const isFile = item instanceof File;
                        const src = isFile ? URL.createObjectURL(item) : `${STORAGE_URL}${item.url}`;
                        return (
                          <div key={i} className="aspect-square bg-slate-50 relative group overflow-hidden border border-slate-100">
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
                                    [category]: prev[category].filter((_, idx) => idx !== i),
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
                          <span className="text-[9px] uppercase font-bold">No Media</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end pt-10 border-t border-slate-100 sticky bottom-0 bg-[#F8FAFC] pb-6 z-20">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-12 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2 w-5 h-5" />
                  ) : (
                    <Plus className="mr-2 w-5 h-5" />
                  )}
                  Save Vessel Manifest
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------- Helper Components for Styling ---------------- //

function Label({ children }: { children: React.ReactNode }) {
    return <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-0.5">{children}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input 
            {...props} 
            className={cn(
                "w-full bg-transparent border-b border-slate-200 py-2.5 text-xs font-bold text-[#003566] outline-none focus:border-blue-600 focus:bg-white/50 transition-all placeholder:text-slate-300",
                props.className
            )} 
        />
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 mb-4">
            {icon} {title}
        </h4>
    );
}