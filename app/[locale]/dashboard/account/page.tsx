"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  Shield,
  BarChart3,
  Anchor,
  CheckSquare,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Code,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DEFAULT_PFP from "@/components/dashboard/pfp.webp";

const API_BASE = "https://schepen-kring.nl/api";
const STORAGE_URL = "https://schepen-kring.nl/storage/";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function ProfileSettingsPage() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile_image: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
    fetchProfile();
    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData({
        name: res.data.name,
        email: res.data.email,
        profile_image: null,
      });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      setFormData({ ...formData, profile_image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.profile_image) {
      data.append("profile_image", formData.profile_image);
    }

    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.post(`${API_BASE}/profile/update`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully");
      setUser(res.data.user);
      localStorage.setItem("user_data", JSON.stringify(res.data.user));
      setFormData((prev) => ({ ...prev, profile_image: null }));
      setPreviewUrl(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#003566]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      <DashboardHeader />
      <Toaster position="top-right" />

      <div className="flex pt-20">
        {/* COLLAPSIBLE SIDEBAR */}
        <Sidebar onCollapse={setIsSidebarCollapsed} />

        {/* MAIN CONTENT - WHITE BACKGROUND */}
        <motion.main
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-8 bg-white min-h-[calc(100vh-80px)] -mt-20"
        >
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="border-b border-slate-100 pb-8 mt-4">
              <h1 className="text-5xl font-serif italic text-[#003566]">
                Profile Identity
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">
                Personnel Credentials & Asset Management
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              {/* Left Column: Avatar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-100 p-8 text-center shadow-sm relative">
                  <div className="relative inline-block group">
                    <div className="w-40 h-40 border border-slate-200 overflow-hidden bg-white mx-auto">
                      <img
                        src={
                          previewUrl ||
                          (user?.profile_image
                            ? `${STORAGE_URL}${user.profile_image}`
                            : DEFAULT_PFP.src)
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-[-12px] right-[-12px] bg-[#003566] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform z-10"
                    >
                      <Camera size={18} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <div className="mt-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#003566]">
                      {user?.name}
                    </h2>
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-2">
                      {user?.userType || "Staff Member"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border-l-4 border-l-blue-500 p-6 flex gap-4">
                  <Shield className="text-blue-600 shrink-0" size={18} />
                  <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-black tracking-tighter">
                    Identity verification is active. Profile changes are logged
                    for security auditing.
                  </p>
                </div>
              </div>

              {/* Right Column: Fields */}
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <User size={12} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-slate-200 py-3 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] transition-all uppercase tracking-wider"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Mail size={12} /> Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-slate-200 py-3 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] transition-all lowercase tracking-tight"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-12 pt-6">
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        Member Since
                      </p>
                      <p className="text-xs font-serif italic text-slate-500">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        Access Level
                      </p>
                      <p className="text-[10px] font-black text-[#003566] uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 inline-block border border-slate-100">
                        {user?.userType}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-16 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003566] text-white hover:bg-[#003566]/90 h-14 px-12 text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-lg disabled:opacity-50 flex items-center gap-3"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Synchronize Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
