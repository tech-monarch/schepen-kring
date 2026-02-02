"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api"; 
import { 
  Plus, Camera, Loader2, Upload, Waves, Coins, Images, Trash, 
  AlertCircle, MapPin, Maximize2, Calendar, Edit3, X, Info, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// Base storage URL
const STORAGE_URL = "http://127.0.0.1:8000/storage/";

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
    "Exterior": [], "Interior": [], "Engine Room": [], "Bridge": []
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

  useEffect(() => { fetchFleet(); }, []);

  // Open sheet and load yacht
  const openTerminal = (yacht: any = null) => {
    setSelectedYacht(yacht);
    setErrors(null);
    setMainFile(null);

    const initialGallery: GalleryState = {
      "Exterior": [], "Interior": [], "Engine Room": [], "Bridge": []
    };

    if (yacht?.images) {
      yacht.images.forEach((img: any) => {
        if (initialGallery[img.category]) {
          initialGallery[img.category].push(img);
        }
      });
    }

    setGalleryState(initialGallery);
    setMainPreview(yacht?.main_image ? `${STORAGE_URL}${yacht.main_image}` : null);
    setIsSheetOpen(true);
  };

  // Add files to gallery
  const handleGalleryAdd = (category: string, files: FileList | null) => {
    if (!files) return;
    setGalleryState(prev => ({
      ...prev,
      [category]: [...prev[category], ...Array.from(files)]
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    const formData = new FormData(e.currentTarget);

    // Main image
    if (mainFile) formData.set("main_image", mainFile);
    else if (selectedYacht) formData.delete("main_image");

    // Numeric fields cleanup
    ['cabins', 'heads', 'price'].forEach(field => {
      const val = formData.get(field);
      if (!val || val === "") formData.delete(field);
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
        const newFiles = galleryState[cat].filter(item => item instanceof File);
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
      if (err.response?.status === 422) setErrors(err.response.data.errors);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete existing gallery image
  const deleteExistingImage = async (id: number, category: string, index: number) => {
    if (!confirm("Remove this image permanently?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      setGalleryState(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 text-[#003566]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight">Registry Command</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">Fleet Management System v2.0</p>
        </div>
        <Button onClick={() => openTerminal()} className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-10 font-black uppercase text-[10px] tracking-widest transition-all">
          <Plus className="mr-2 w-5 h-5" /> Register New Vessel
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600" size={20} />
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
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div>
        ) : (
          fleet.filter(y => y.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((yacht) => (
              <div key={yacht.id} className="bg-white border border-slate-200 group overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                <div className="h-72 bg-slate-100 overflow-hidden relative">
                  <img src={yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : "/placeholder-yacht.jpg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[#003566]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => openTerminal(yacht)} className="bg-white text-[#003566] p-4 rounded-none font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center gap-2">
                      <Edit3 size={14} /> Edit Manifest
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-serif italic">{yacht.name}</h3>
                    <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest text-slate-500">{yacht.status}</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 tracking-tighter">€{Number(yacht.price).toLocaleString()}</p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase text-slate-400">
                    <div className="flex items-center gap-1"><Maximize2 size={12}/> {yacht.length}</div>
                    <div className="flex items-center gap-1"><Calendar size={12}/> {yacht.year}</div>
                    <div className="flex items-center gap-1"><MapPin size={12}/> {yacht.location || 'Local'}</div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* POPUP TERMINAL */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[950px] bg-[#F8FAFC] p-0 border-l-12 border-[#003566] overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col min-h-full pb-20">
            <div className="bg-[#003566] p-10 text-white sticky top-0 z-40 flex justify-between items-center shadow-xl">
              <div>
                <SheetTitle className="text-4xl font-serif italic">Vessel Manifest Entry</SheetTitle>
                <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.4em]">Registry Auth: Admin</p>
              </div>
              <X className="text-white/20 cursor-pointer hover:text-white" size={32} onClick={() => setIsSheetOpen(false)} />
            </div>

            {/* ERROR SUMMARY */}
            {errors && (
              <div className="m-10 p-6 bg-red-50 border-l-4 border-red-500 text-red-700">
                <div className="flex items-center gap-2 mb-3 font-black uppercase text-[11px]"><AlertCircle size={16} /> Conflict Detected</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(errors).map((key) => <p key={key} className="text-[10px] font-bold">● {key.toUpperCase()}: {errors[key][0]}</p>)}
                </div>
              </div>
            )}

            {/* ALL SECTIONS: PROFILE, CORE SPECS, TECH MATRIX, GALLERY */}
            <div className="p-10 space-y-16">

              {/* --- SECTION 1: PROFILE IMAGE --- */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-[#003566] tracking-widest flex items-center gap-2 italic"><Camera size={16}/> 01. Profile Authority</label>
                <div onClick={() => document.getElementById('main_image_input')?.click()} className="h-96 bg-white border-2 border-dashed border-slate-200 relative flex items-center justify-center cursor-pointer overflow-hidden shadow-inner group">
                  <input id="main_image_input" name="main_image" type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setMainFile(file); setMainPreview(URL.createObjectURL(file)); }
                  }} />
                  {mainPreview ? (
                    <img src={mainPreview} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-slate-200 mb-2" size={48} />
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Select Primary Identification Photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- SECTION 2: CORE SPECS --- */}
              <div className="bg-white p-10 border border-slate-200 shadow-sm space-y-10">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-2 border-b border-slate-50 pb-6 italic"><Coins size={16}/> Essential Registry Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: "Vessel Name", name: "name", placeholder: "e.g. M/Y NOBILITY", req: true },
                    { label: "Price (€)", name: "price", placeholder: "1500000", req: true, type: "number" },
                    { label: "Year Built", name: "year", placeholder: "2024", req: true },
                    { label: "Length (LOA)", name: "length", placeholder: "45m", req: true },
                  ].map(f => (
                    <div key={f.name} className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-[#003566]">{f.label}</label>
                      <input name={f.name} type={f.type || "text"} defaultValue={selectedYacht?.[f.name]} placeholder={f.placeholder} className="w-full bg-slate-50 p-4 border-b-2 border-slate-100 text-[#003566] font-bold text-sm outline-none focus:border-blue-600 transition-all shadow-inner" required={f.req} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-[#003566]">Current Status</label>
                    <select name="status" defaultValue={selectedYacht?.status || "Active"} className="w-full bg-slate-50 p-4 border-b-2 border-slate-100 text-[#003566] font-black uppercase text-[10px] outline-none appearance-none">
                      <option value="Active">Active Market</option>
                      <option value="Intake">Initial Intake</option>
                      <option value="Sold">Vessel Sold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-[#003566]">Location</label>
                    <input name="location" defaultValue={selectedYacht?.location} placeholder="e.g. Monaco" className="w-full bg-slate-50 p-4 border-b-2 border-slate-100 text-[#003566] font-bold text-sm outline-none focus:border-blue-600" />
                  </div>
                </div>
              </div>

              {/* --- SECTION 3: TECHNICAL MATRIX --- */}
              <div className="bg-[#003566]/5 p-10 border border-blue-100 space-y-10">
                <h3 className="text-[10px] font-black text-[#003566] uppercase tracking-[0.4em] flex items-center gap-2 italic border-b border-blue-100 pb-6"><Waves size={16} /> Technical Specifications Matrix</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: "Beam", name: "beam" },
                    { label: "Draft", name: "draft" },
                    { label: "Engine Type", name: "engine_type" },
                    { label: "Fuel Type", name: "fuel_type" },
                    { label: "Fuel Cap.", name: "fuel_capacity" },
                    { label: "Water Cap.", name: "water_capacity" },
                    { label: "Cabins", name: "cabins", type: "number" },
                    { label: "Heads", name: "heads", type: "number" },
                  ].map(f => (
                    <div key={f.name} className="space-y-2">
                      <label className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{f.label}</label>
                      <input name={f.name} type={f.type || "text"} defaultValue={selectedYacht?.[f.name]} className="w-full bg-white border-b-2 border-slate-100 p-3 text-[11px] font-bold text-[#003566] outline-none focus:border-blue-600" />
                    </div>
                  ))}
                </div>
              </div>

              {/* --- SECTION 4: GALLERY --- */}
              {Object.keys(galleryState).map((category) => (
                <div key={category} className="space-y-8">
                  <h3 className="text-[11px] font-black uppercase text-[#003566] tracking-widest flex items-center gap-2 italic border-b border-slate-200 pb-4"><Images size={20} className="text-blue-600"/> {category} Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm">
                      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#003566]">{category}</span>
                        <label className="cursor-pointer bg-[#003566] text-white px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors">
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
                      <div className="p-4 grid grid-cols-4 gap-2 min-h-[120px]">
                        {galleryState[category].map((item, i) => {
                          const isFile = item instanceof File;
                          const src = isFile ? URL.createObjectURL(item) : `${STORAGE_URL}${item.path}`;
                          return (
                            <div key={i} className="aspect-square bg-slate-50 relative group overflow-hidden border border-slate-100">
                              <img src={src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              <button
                                type="button"
                                onClick={() => {
                                  if (isFile) {
                                    setGalleryState(prev => ({
                                      ...prev,
                                      [category]: prev[category].filter((_, idx) => idx !== i)
                                    }));
                                  } else {
                                    deleteExistingImage(item.id, category, i);
                                  }
                                }}
                                className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          );
                        })}
                        {galleryState[category].length === 0 && (
                          <div className="col-span-full flex items-center justify-center py-6 opacity-20">
                            <Info size={24} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end mt-10">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#003566] text-white hover:bg-blue-800 rounded-none h-14 px-10 font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : <Plus className="mr-2 w-5 h-5" />}
                  Save Vessel
                </Button>
              </div>

            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

