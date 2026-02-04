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
  Search,
  Anchor,
  Zap,
  Bed,
  Ship,
  Box,
  CheckSquare,
  BarChart3,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { motion } from "framer-motion";

const STORAGE_URL = "https://kring.answer24.nl/storage/";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80";

type GalleryState = { [key: string]: any[] };

export default function EmployeeFleetPage() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  
  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Terminal State
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

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/yachts");
      setFleet(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
  }, []);

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.classList.add("opacity-50", "grayscale");
  };

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
        const category = img.category || "Exterior";
        if (initialGallery[category]) initialGallery[category].push(img);
        else initialGallery["Exterior"].push(img);
      });
    }

    setGalleryState(initialGallery);
    setMainPreview(yacht?.main_image ? `${STORAGE_URL}${yacht.main_image}` : null);
    setIsSheetOpen(true);
  };

  const handleGalleryAdd = (category: string, files: FileList | null) => {
    if (!files) return;
    setGalleryState((prev) => ({
      ...prev,
      [category]: [...prev[category], ...Array.from(files)],
    }));
  };

  const deleteExistingImage = async (id: number, category: string, index: number) => {
    if (!confirm("Remove this image?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      setGalleryState((prev) => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index),
      }));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);
    const formData = new FormData(e.currentTarget);

    if (mainFile) formData.set("main_image", mainFile);
    if (!formData.has('trailer_included')) formData.append('trailer_included', '0');
    else formData.set('trailer_included', '1');

    const numericFields = ["cabins", "heads", "price", "year", "engine_hours", "engine_power", "berths"];
    numericFields.forEach((field) => {
      if (!formData.get(field)) formData.set(field, "");
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

      for (const cat of Object.keys(galleryState)) {
        const newFiles = galleryState[cat].filter((item) => item instanceof File);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      <DashboardHeader />
      <div className="flex pt-20">
        {/* COLLAPSIBLE SIDEBAR */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 80 : 256 }}
          className="fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:block z-40 overflow-hidden"
        >
          <div className="flex flex-col h-full relative">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute right-3 top-4 bg-[#003566] border border-slate-200 rounded-full p-1 text-slate-400 hover:text-[white] transition-colors z-999 shadow-sm"
            >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <nav className="p-4 space-y-2 mt-4">
              <div className={cn("px-4 mb-6 flex items-center justify-between transition-opacity", isSidebarCollapsed && "opacity-0")}>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Staff Terminal</p>
                {isOnline ? <Wifi size={10} className="text-emerald-500" /> : <WifiOff size={10} className="text-red-500" />}
              </div>
              {[
                { title: t("overview"), href: "/dashboard", icon: BarChart3 },
                { title: t("fleet_management"), href: "/dashboard/yachts", icon: Anchor },
                { title: t("task_board"), href: "/dashboard/tasks", icon: CheckSquare },
              ].map((item) => (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group", pathname === item.href ? "bg-[#003566] text-white shadow-md" : "text-slate-400 hover:bg-slate-50", isSidebarCollapsed && "justify-center px-0")}>
                  <item.icon size={16} className="shrink-0" />
                  {!isSidebarCollapsed && <span>{item.title}</span>}
                </Link>
              ))}


  {/* Bottom Action Button */}
  <div className="p-4 border-t border-slate-100 bg-slate-50/50">
    <a href="/dashboard/widgets" className="w-full">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-3 border-2 border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest transition-all group"
      >
        <Code size={16} className="group-hover:rotate-12 transition-transform" />
        Widget Manager
      </Button>
    </a>
  </div>
            </nav>
          </div>
        </motion.aside>

        {/* MAIN CONTENT AREA */}
        <motion.main 
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-8 lg:p-12 bg-white min-h-[calc(100vh-80px)] z-30 -mt-20"
        >
          <div className="max-w-[1600px] mx-auto space-y-12">
            {/* Header Section - Fixed button color and visibility */}
            <div className="flex justify-between items-end border-b border-slate-100 pb-10">
              <div>
                <h1 className="text-5xl font-serif italic text-[#003566]">Registry Command</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-3 pl-1">Vessel Inventory Manifest</p>
              </div>
              <Button 
                onClick={() => openTerminal()} 
                className="bg-[#003566] text-white hover:bg-[#003566]/90 rounded-none h-14 px-12 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center gap-2"
              >
                <Plus size={18} /> Register Vessel
              </Button>
            </div>

            {/* Search Manifest */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="SEARCH MANIFEST..." 
                className="w-full bg-white border border-slate-200 p-6 pl-16 text-[11px] font-black tracking-widest outline-none shadow-sm focus:border-blue-200 transition-colors" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>

            {/* Vessel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {loading ? (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Fleet Data...</p>
                </div>
              ) : (
                fleet.filter(y => y.name.toLowerCase().includes(searchQuery.toLowerCase())).map((yacht) => (
                  <div key={yacht.id} className="bg-white border border-slate-200 group overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                    <div className="h-80 bg-slate-100 overflow-hidden relative">
                      <img src={yacht.main_image ? `${STORAGE_URL}${yacht.main_image}` : PLACEHOLDER_IMAGE} onError={handleImageError} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-[#003566]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-opacity">
                        <button onClick={() => openTerminal(yacht)} className="bg-white text-[#003566] px-6 py-4 rounded-none font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 hover:bg-[#003566] hover:text-white transition-all">
                          <Edit3 size={14} /> Update Registry
                        </button>
                      </div>
                    </div>
                    <div className="p-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-serif italic text-[#003566]">{yacht.name}</h3>
                        <span className="text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 text-blue-600 bg-blue-50/30">{yacht.status}</span>
                      </div>
                      <p className="text-2xl font-bold text-[#003566] tracking-tighter">
                        {new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(yacht.price)}
                      </p>
                      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-[10px] font-black uppercase text-slate-400">
                        <div className="flex flex-col gap-1"><span className="text-[8px] text-slate-300">Length</span><div className="flex items-center gap-1 text-[#003566]"><Maximize2 size={12} /> {yacht.length}m</div></div>
                        <div className="flex flex-col gap-1"><span className="text-[8px] text-slate-300">Year</span><div className="flex items-center gap-1 text-[#003566]"><Calendar size={12} /> {yacht.year}</div></div>
                        <div className="flex flex-col gap-1"><span className="text-[8px] text-slate-300">Port</span><div className="flex items-center gap-1 text-[#003566] truncate"><MapPin size={12} /> {yacht.location || "N/A"}</div></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.main>
      </div>

      {/* REGISTRY TERMINAL (SHEET) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[1000px] w-full bg-[#F8FAFC] p-0 border-l-[16px] border-[#003566] overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col min-h-full pb-20">
            <div className="bg-[#003566] p-10 lg:p-12 text-white sticky top-0 z-50 flex justify-between items-center shadow-2xl">
              <div>
                <SheetTitle className="text-4xl font-serif italic text-white">Registry Manifest Entry</SheetTitle>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Authentication: Operational Staff</p>
              </div>
              <button type="button" onClick={() => setIsSheetOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={40} />
              </button>
            </div>

            {errors && (
              <div className="mx-12 mt-10 p-8 bg-red-50 border-l-4 border-red-500 text-red-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4 font-black uppercase text-xs tracking-widest"><AlertCircle size={20} /> Data Conflict Detected</div>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-wider">
                  {Object.keys(errors).map(k => <p key={k} className="bg-white p-2 border border-red-100">● {k}: {errors[k][0]}</p>)}
                </div>
              </div>
            )}

            <div className="p-12 lg:p-16 space-y-20">
              {/* Profile Photo */}
              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase text-[#003566] tracking-[0.3em] flex items-center gap-3 italic"><Camera size={20} className="text-blue-600" /> 01. Primary Visual Asset</label>
                <div onClick={() => document.getElementById("main_image_input")?.click()} className="h-[500px] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden shadow-inner group transition-all hover:border-blue-400 hover:bg-slate-50">
                  <input id="main_image_input" name="main_image" type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setMainFile(file); setMainPreview(URL.createObjectURL(file)); }
                  }} />
                  {mainPreview ? <img src={mainPreview} className="w-full h-full object-cover" /> : <div className="text-center space-y-4"><Upload className="mx-auto text-slate-200" size={64} /><p className="text-slate-300 text-[11px] font-black uppercase tracking-widest">Upload Primary Vessel Profile</p></div>}
                </div>
              </div>

              {/* Core Specs */}
              <div className="bg-white p-12 border border-slate-200 shadow-sm space-y-10">
                <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-3 italic border-b border-slate-50 pb-6"><Coins size={20} className="text-blue-600" /> Essential Registry Data</h3>
                <div className="grid grid-cols-3 gap-12">
                  <div className="space-y-2"><Label>Vessel Name</Label><Input name="name" defaultValue={selectedYacht?.name} required /></div>
                  <div className="space-y-2"><Label>Price (€)</Label><Input name="price" type="number" defaultValue={selectedYacht?.price} required /></div>
                  <div className="space-y-2"><Label>Year Built</Label><Input name="year" type="number" defaultValue={selectedYacht?.year} required /></div>
                  <div className="space-y-2"><Label>Length (m)</Label><Input name="length" defaultValue={selectedYacht?.length} required /></div>
                  <div className="space-y-2"><Label>Location</Label><Input name="location" defaultValue={selectedYacht?.location} /></div>
                  <div className="space-y-2"><Label>Status</Label>
                    <select name="status" defaultValue={selectedYacht?.status || "Draft"} className="w-full bg-slate-50 p-4 border-b-2 border-slate-100 text-[11px] font-black uppercase tracking-widest text-[#003566] outline-none">
                      <option value="For Sale">For Sale</option>
                      <option value="For Bid">For Bid</option>
                      <option value="Sold">Sold</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical Dossier */}
              <div className="space-y-16">
                <h3 className="text-[14px] font-black text-[#003566] uppercase tracking-[0.4em] flex items-center gap-4 border-b-4 border-[#003566] pb-6"><Waves size={24} className="text-blue-600" /> Technical Dossier</h3>
                
                <div className="grid grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <SectionHeader icon={<Ship size={18} />} title="Hull & Dimensions" />
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2"><Label>Hull Shape</Label><Input name="hull_shape" defaultValue={selectedYacht?.hull_shape} /></div>
                      <div className="space-y-2"><Label>Material</Label><Input name="construction_material" defaultValue={selectedYacht?.construction_material} /></div>
                      <div className="space-y-2"><Label>Beam</Label><Input name="beam" defaultValue={selectedYacht?.beam} /></div>
                      <div className="space-y-2"><Label>Draft</Label><Input name="draft" defaultValue={selectedYacht?.draft} /></div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <SectionHeader icon={<Zap size={18} />} title="Engine & Performance" />
                    <div className="bg-slate-50 p-8 grid grid-cols-2 gap-8 border border-slate-100">
                      <div className="space-y-2"><Label>Engine Brand</Label><Input name="engine_brand" defaultValue={selectedYacht?.engine_brand} className="bg-white" /></div>
                      <div className="space-y-2"><Label>Model</Label><Input name="engine_model" defaultValue={selectedYacht?.engine_model} className="bg-white" /></div>
                      <div className="space-y-2"><Label>Power (HP)</Label><Input name="engine_power" defaultValue={selectedYacht?.engine_power} className="bg-white" /></div>
                      <div className="space-y-2"><Label>Hours</Label><Input name="engine_hours" defaultValue={selectedYacht?.engine_hours} className="bg-white" /></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <SectionHeader icon={<Bed size={18} />} title="Accommodation & Systems" />
                  <div className="grid grid-cols-4 gap-8">
                    <div className="space-y-2"><Label>Cabins</Label><Input name="cabins" type="number" defaultValue={selectedYacht?.cabins} /></div>
                    <div className="space-y-2"><Label>Berths</Label><Input name="berths" defaultValue={selectedYacht?.berths} /></div>
                    <div className="space-y-2"><Label>Heads</Label><Input name="heads" type="number" defaultValue={selectedYacht?.heads} /></div>
                    <div className="space-y-2"><Label>Water Tank</Label><Input name="water_tank" defaultValue={selectedYacht?.water_tank} /></div>
                  </div>
                </div>
              </div>

              {/* Gallery System */}
              {Object.keys(galleryState).map((cat) => (
                <div key={cat} className="space-y-8">
                  <h3 className="text-[12px] font-black uppercase text-[#003566] tracking-[0.3em] flex items-center gap-3 italic border-b border-slate-100 pb-6"><Images size={22} className="text-blue-600" /> {cat} Gallery</h3>
                  <div className="bg-white border-2 border-slate-50 p-6">
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Categorized Assets</span>
                      <label className="cursor-pointer bg-[#003566] text-white px-8 py-3 text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-800 transition-all">Queue {cat} Files<input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleGalleryAdd(cat, e.target.files)} /></label>
                    </div>
                    <div className="grid grid-cols-4 lg:grid-cols-6 gap-4 min-h-[150px]">
                      {galleryState[cat].map((item, i) => {
                        const isFile = item instanceof File;
                        const src = isFile ? URL.createObjectURL(item) : `${STORAGE_URL}${item.url}`;
                        return (
                          <div key={i} className="aspect-square relative group border border-slate-100 overflow-hidden">
                            <img src={src} className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={handleImageError} />
                            <button type="button" onClick={() => isFile ? setGalleryState(p => ({...p, [cat]: p[cat].filter((_, idx) => idx !== i)})) : deleteExistingImage(item.id, cat, i)} className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><Trash size={20} /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-16 border-t-2 border-slate-100 sticky bottom-0 bg-[#F8FAFC] pb-10">
                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#003566] text-white h-20 font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl hover:bg-blue-800 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin mr-3" /> : <Plus className="mr-3" />} Commit Vessel to Registry
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{children}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full bg-transparent border-b-2 border-slate-100 py-3 text-xs font-bold text-[#003566] outline-none focus:border-blue-600 transition-all placeholder:text-slate-200", props.className)} />;
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 flex items-center gap-3 mb-6 bg-blue-50/50 p-3 border-l-4 border-blue-600">{icon} {title}</h4>;
}