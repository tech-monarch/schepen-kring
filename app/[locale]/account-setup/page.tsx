"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Ship, Waves, Coins, Anchor, Zap, Info, Loader2, CheckCircle, Camera, X, Upload,
  Compass, Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";

export default function AccountSetupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string }[]>([]);
  const router = useRouter();

  // Replicating every technical field from your Admin Yacht Code
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    make: "",
    model: "",
    year: "",
    location: "",
    length: "",
    beam: "",
    draft: "",
    fuel_type: "Diesel",
    hull_material: "GRP",
    vat_status: "Paid",
    engines: "",
    cabins: "",
    berths: "",
    description: "",
    status: "Partner_Pending" // For admin review
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      toast.error("Vessel manifest requires at least one image.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Uploading vessel manifest...");

    try {
      const data = new FormData();
      
      // 1. Append Text Data
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // 2. Set first image as main_image (per your controller)
      data.append("main_image", selectedImages[0].file);

      // 3. Append all to gallery array
      selectedImages.forEach((img) => {
        data.append("images[]", img.file);
      });

      // POSTING TO YOUR NEW PARTNER-SETUP ROUTE
      await api.post("/yachts/partner-setup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Manifest submitted. System activating...", { id: toastId });
      setTimeout(() => router.push("/yachts"), 2000);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Check your API connection";
      toast.error(`ERROR: ${msg}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ship className="w-10 h-10 text-[#003566]" />
          </div>
          <h1 className="text-2xl font-black text-[#003566] uppercase tracking-tighter mb-4 italic">Partner Activation</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Your account is currently restricted. To access the dashboard, you must list your first vessel for verification.
          </p>
          <Button onClick={() => setStep(2)} className="w-full bg-[#003566] hover:bg-blue-800 text-white font-bold py-6 rounded-none uppercase tracking-widest text-[10px] transition-all shadow-lg">
            Begin Initial Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col mb-8">
            <h2 className="text-4xl font-black text-[#003566] uppercase tracking-tighter italic">First Vessel Onboarding</h2>
            <div className="h-1 w-20 bg-[#003566] mt-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-8 md:p-12 space-y-12">
            
            {/* 1. MEDIA SECTION (Replica of Admin Gallery) */}
            <section>
              <SectionHeader icon={<Camera className="w-4 h-4" />} title="Visual Documentation" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square border border-slate-200 group">
                    <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-all">
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] font-bold text-center py-1">MAIN</div>}
                  </div>
                ))}
                <label className="border-2 border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                  <Upload className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Add Media</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </section>

            {/* 2. CORE SPECS */}
            <section>
              <SectionHeader icon={<Waves className="w-4 h-4" />} title="Primary Manifest" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-1"><Label>Vessel Name</Label><Input name="name" required onChange={handleInputChange} /></div>
                <div className="space-y-1"><Label>Asking Price (€)</Label><Input name="price" type="number" required onChange={handleInputChange} /></div>
                <div className="space-y-1"><Label>Make</Label><Input name="make" required onChange={handleInputChange} /></div>
                <div className="space-y-1"><Label>Model</Label><Input name="model" required onChange={handleInputChange} /></div>
              </div>
            </section>

            {/* 3. TECHNICAL (Replicating Admin Tech Sections) */}
            <section>
              <SectionHeader icon={<Compass className="w-4 h-4" />} title="Technical Architecture" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1"><Label>Build Year</Label><Input name="year" type="number" onChange={handleInputChange} /></div>
                <div className="space-y-1"><Label>Length (M)</Label><Input name="length" onChange={handleInputChange} /></div>
                <div className="space-y-1"><Label>Beam (M)</Label><Input name="beam" onChange={handleInputChange} /></div>
                <div className="space-y-1"><Label>Draft (M)</Label><Input name="draft" onChange={handleInputChange} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-1">
                  <Label>Fuel Type</Label>
                  <select name="fuel_type" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-200 py-3 text-xs font-bold text-[#003566] outline-none uppercase">
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Hull Material</Label>
                  <select name="hull_material" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-200 py-3 text-xs font-bold text-[#003566] outline-none uppercase">
                    <option value="GRP">GRP</option>
                    <option value="Steel">Steel</option>
                    <option value="Aluminum">Aluminum</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>VAT Status</Label>
                  <select name="vat_status" onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-200 py-3 text-xs font-bold text-[#003566] outline-none uppercase">
                    <option value="Paid">VAT Paid</option>
                    <option value="Not Paid">VAT Not Paid</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 4. DESCRIPTION */}
            <section>
              <SectionHeader icon={<Info className="w-4 h-4" />} title="Broker Remarks" />
              <textarea 
                name="description" 
                rows={5} 
                onChange={handleInputChange} 
                className="w-full bg-slate-50 border border-slate-200 p-4 text-xs font-bold text-[#003566] outline-none focus:border-[#003566] transition-all uppercase"
              />
            </section>
          </div>

          <div className="bg-slate-50 p-8 flex justify-end items-center gap-6 border-t border-slate-200">
            <Button 
                disabled={isSubmitting} 
                className="bg-[#003566] hover:bg-blue-900 text-white h-16 px-16 font-black uppercase text-[11px] tracking-[0.2em] rounded-none shadow-2xl transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 w-4 h-4" />}
              Finalize & Activate
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// UI Replicas
function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-4 border-b-2 border-[#003566] pb-3 mb-8">
      <div className="p-2 bg-[#003566] text-white rounded-none">{icon}</div>
      <h3 className="text-sm font-black text-[#003566] uppercase tracking-[0.3em] italic">{title}</h3>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className={cn(
        "w-full bg-transparent border-b border-slate-200 py-3 text-xs font-bold text-[#003566] outline-none focus:border-[#003566] transition-all placeholder:text-slate-300 uppercase",
        props.className
      )} 
    />
  );
}