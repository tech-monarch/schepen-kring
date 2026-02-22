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
  Phone,
  MapPin,
  Building2,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Search,
  Map,
  Hash,
  Calendar,
  Link,
  FileText,
  Smartphone,
  Home,
  UserCircle,
  Briefcase,
  Tag,
  BookOpen,
  Clock,
  KeyRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import DEFAULT_PFP from "@/components/dashboard/pfp.webp";
import { Sidebar } from "@/components/dashboard/Sidebar";

const API_BASE = "https://schepen-kring.nl/api";
const STORAGE_URL = "https://schepen-kring.nl/storage/";

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export default function ProfileSettingsPage() {
  const t = useTranslations("Dashboard");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<
    "profile" | "personal" | "address" | "security" | "password"
  >("profile");

  // Main form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "Netherlands",
    profile_image: null as File | null,
    relationNumber: "",
    firstName: "",
    lastName: "",
    prefix: "",
    initials: "",
    title: "",
    salutation: "",
    attentionOf: "",
    identification: "",
    dateOfBirth: "",
    website: "",
    mobile: "",
    street: "",
    houseNumber: "",
    note: "",
    claimHistoryCount: 0,
    lockscreen_timeout: 10,
    lockscreen_code: "1234",
    otp_enabled: false,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Address autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    fetchProfile();
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setUser(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        postcode: data.postcode || "",
        country: data.country || "Netherlands",
        profile_image: null,
        relationNumber: data.relationNumber || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        prefix: data.prefix || "",
        initials: data.initials || "",
        title: data.title || "",
        salutation: data.salutation || "",
        attentionOf: data.attentionOf || "",
        identification: data.identification || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
        website: data.website || "",
        mobile: data.mobile || "",
        street: data.street || "",
        houseNumber: data.houseNumber || "",
        note: data.note || "",
        claimHistoryCount: data.claimHistoryCount || 0,
        lockscreen_timeout: data.lockscreen_timeout || 10,
        lockscreen_code: data.lockscreen_code || "1234",
        otp_enabled: data.otp_enabled === 1 || data.otp_enabled === true,
      });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  };

  const compressImage = (
    file: File,
    maxSizeMB: number = 5,
    maxWidth: number = 1200,
    initialQuality: number = 0.9,
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          // Calculate new dimensions (keep aspect ratio)
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          // Create canvas and draw resized image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Recursive compression until size fits or quality is too low
          const compressRecursive = (quality: number): void => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Canvas to Blob failed"));
                  return;
                }
                if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.2) {
                  // Accept if size is within limit or quality is already low
                  resolve(new File([blob], file.name, { type: file.type }));
                } else {
                  // Try again with lower quality
                  compressRecursive(quality - 0.1);
                }
              },
              file.type,
              quality,
            );
          };

          compressRecursive(initialQuality);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: keep a generous sanity check (e.g., 50 MB) to avoid huge files crashing the browser
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Image is too large (max 50 MB)");
      return;
    }

    try {
      // Show a loading toast (optional)
      const toastId = toast.loading("Compressing image...");

      // Compress the image to target ~5 MB
      const compressedFile = await compressImage(file, 5, 1200, 0.9);

      // Update form state and preview
      setFormData({ ...formData, profile_image: compressedFile });
      setPreviewUrl(URL.createObjectURL(compressedFile));

      // Show success message with final size
      toast.dismiss(toastId);
      toast.success(
        `Image compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      );
    } catch (error) {
      console.error("Compression failed", error);
      toast.error("Image compression failed. Please try another image.");
    }
  };

  const searchAddress = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=nl&limit=5&addressdetails=1`,
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Address search error:", error);
      toast.error("Failed to search address");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, address: value });
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      searchAddress(value);
    }, 500);
    setDebounceTimer(timer);
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    const address = suggestion.display_name;
    const city =
      suggestion.address.city ||
      suggestion.address.town ||
      suggestion.address.village ||
      suggestion.address.suburb ||
      "";
    const state = suggestion.address.state || suggestion.address.county || "";
    const postcode = suggestion.address.postcode || "";
    const country = suggestion.address.country || "Netherlands";
    setFormData((prev) => ({
      ...prev,
      address: address,
      city: city,
      state: state,
      postcode: postcode,
      country: country,
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone_number", formData.phone_number);
    data.append("address", formData.address);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("postcode", formData.postcode);
    data.append("country", formData.country);
    data.append("relationNumber", formData.relationNumber);
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("prefix", formData.prefix);
    data.append("initials", formData.initials);
    data.append("title", formData.title);
    data.append("salutation", formData.salutation);
    data.append("attentionOf", formData.attentionOf);
    data.append("identification", formData.identification);
    data.append("dateOfBirth", formData.dateOfBirth);
    data.append("website", formData.website);
    data.append("mobile", formData.mobile);
    data.append("street", formData.street);
    data.append("houseNumber", formData.houseNumber);
    data.append("note", formData.note);
    data.append("claimHistoryCount", String(formData.claimHistoryCount));
    data.append("lockscreen_timeout", String(formData.lockscreen_timeout));
    data.append("lockscreen_code", formData.lockscreen_code);
    data.append("otp_enabled", formData.otp_enabled ? "1" : "0");

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("New passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(`${API_BASE}/profile/change-password`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Password changed successfully");
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password change failed");
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
        <Sidebar onCollapse={setIsSidebarCollapsed} />

        <motion.main
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-8 bg-white min-h-[calc(100vh-80px)] -mt-20"
        >
          <div className="max-w-4xl mx-auto">
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
              className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8"
            >
              {/* Left column – Profile image (always visible) */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-100 p-8 text-center shadow-sm sticky top-24">
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
                      className="absolute -bottom-3 -right-3 bg-[#003566] text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform z-10"
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
              </div>

              {/* Right column – Tabbed content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Tab navigation */}
                <div className="flex border-b border-slate-200">
                  {[
                    { id: "profile", label: "Profile" },
                    { id: "personal", label: "Personal" },
                    { id: "address", label: "Address" },
                    { id: "security", label: "Security" },
                    { id: "password", label: "Password" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          tab.id as
                            | "profile"
                            | "personal"
                            | "address"
                            | "security"
                            | "password",
                        )
                      }
                      className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                        activeTab === tab.id
                          ? "border-[#003566] text-[#003566]"
                          : "border-transparent text-slate-400 hover:text-[#003566]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="py-4">
                  {/* Profile Tab */}
                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <User size={12} /> Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] transition-all uppercase tracking-wider"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Mail size={12} /> Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] transition-all lowercase"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Phone size={12} /> Phone Number
                          </label>
                          <input
                            type="text"
                            value={formData.phone_number}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone_number: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Smartphone size={12} /> Mobile
                          </label>
                          <input
                            type="text"
                            value={formData.mobile}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mobile: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Tab */}
                  {activeTab === "personal" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {/* Relation Number */}
                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <Hash size={10} /> Relation Number
                          </label>
                          <input
                            type="text"
                            value={formData.relationNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                relationNumber: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <User size={10} /> First Name
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <User size={10} /> Last Name
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <Tag size={10} /> Prefix
                          </label>
                          <input
                            type="text"
                            value={formData.prefix}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                prefix: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <User size={10} /> Initials
                          </label>
                          <input
                            type="text"
                            value={formData.initials}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                initials: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <Briefcase size={10} /> Title
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <UserCircle size={10} /> Salutation
                          </label>
                          <input
                            type="text"
                            value={formData.salutation}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                salutation: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <BookOpen size={10} /> Attention Of
                          </label>
                          <input
                            type="text"
                            value={formData.attentionOf}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                attentionOf: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <FileText size={10} /> Identification
                          </label>
                          <input
                            type="text"
                            value={formData.identification}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                identification: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <Calendar size={10} /> Date of Birth
                          </label>
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1">
                            <Link size={10} /> Website
                          </label>
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                website: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>
                      </div>

                      {/* Note & Claim History */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <FileText size={12} /> Note
                          </label>
                          <textarea
                            value={formData.note}
                            onChange={(e) =>
                              setFormData({ ...formData, note: e.target.value })
                            }
                            rows={3}
                            className="w-full bg-transparent border border-slate-200 p-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <BookOpen size={12} /> Claim History Count
                          </label>
                          <div className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566]">
                            {formData.claimHistoryCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address Tab */}
                  {activeTab === "address" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <MapPin size={12} /> Street
                          </label>
                          <input
                            type="text"
                            value={formData.street}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                street: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Hash size={12} /> House Number
                          </label>
                          <input
                            type="text"
                            value={formData.houseNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                houseNumber: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 relative">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <MapPin size={12} /> Full Address (autocomplete)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) =>
                              handleAddressChange(e.target.value)
                            }
                            onFocus={() => {
                              if (formData.address.length >= 3) {
                                searchAddress(formData.address);
                              }
                            }}
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                            placeholder="Type your address..."
                          />
                          {isSearchingAddress && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            </div>
                          )}
                          {showSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 shadow-lg max-h-60 overflow-y-auto rounded-b-md">
                              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  <Map size={10} className="inline mr-1" />
                                  OpenStreetMap Results
                                </p>
                              </div>
                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                                  type="button"
                                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 border-b border-slate-100 last:border-b-0"
                                  onClick={() =>
                                    handleAddressSelect(suggestion)
                                  }
                                >
                                  <div className="flex items-start gap-2">
                                    <Search
                                      size={12}
                                      className="text-slate-400 mt-0.5 flex-shrink-0"
                                    />
                                    <div className="text-left">
                                      <p className="font-medium">
                                        {suggestion.display_name.split(",")[0]}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">
                                        {suggestion.display_name
                                          .split(",")
                                          .slice(1)
                                          .join(",")
                                          .trim()}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Building2 size={12} /> City
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Globe size={12} /> State / Province
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                state: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <MapPin size={12} /> Postal Code
                          </label>
                          <input
                            type="text"
                            value={formData.postcode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                postcode: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] uppercase"
                            placeholder="1234 AB"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <Globe size={12} /> Country
                        </label>
                        <select
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                        >
                          <option value="Netherlands">Netherlands</option>
                          <option value="Belgium">Belgium</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === "security" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Clock size={12} /> Auto‑Lock Timeout (min)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={formData.lockscreen_timeout}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lockscreen_timeout:
                                  parseInt(e.target.value) || 10,
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                          <p className="text-[8px] text-slate-400 mt-1">
                            After this many minutes of inactivity, the screen
                            will lock.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <KeyRound size={12} /> 4-Digit PIN Code
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            value={formData.lockscreen_code}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lockscreen_code: e.target.value,
                              })
                            }
                            placeholder="1234"
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          />
                          <p className="text-[8px] text-slate-400 mt-1">
                            Used to unlock the screen. (Default: 1234)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Shield size={12} /> 1-Time Password
                          </label>
                          <select
                            value={formData.otp_enabled ? "true" : "false"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                otp_enabled: e.target.value === "true",
                              })
                            }
                            className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                          >
                            <option value="false">NO</option>
                            <option value="true">YES</option>
                          </select>
                          <p className="text-[8px] text-slate-400 mt-1">
                            Enable OTP for additional security.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Tab */}
                  {activeTab === "password" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Lock size={12} /> Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.current_password}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  current_password: e.target.value,
                                })
                              }
                              className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords({
                                  ...showPasswords,
                                  current: !showPasswords.current,
                                })
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#003566]"
                            >
                              {showPasswords.current ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Lock size={12} /> New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.new_password}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  new_password: e.target.value,
                                })
                              }
                              className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords({
                                  ...showPasswords,
                                  new: !showPasswords.new,
                                })
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#003566]"
                            >
                              {showPasswords.new ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Lock size={12} /> Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.new_password_confirmation}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  new_password_confirmation: e.target.value,
                                })
                              }
                              className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords({
                                  ...showPasswords,
                                  confirm: !showPasswords.confirm,
                                })
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#003566]"
                            >
                              {showPasswords.confirm ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={handlePasswordChange}
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 h-12 px-8 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg disabled:opacity-50 flex items-center gap-3"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Shield size={14} />
                          )}
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Save Button (always visible) */}
                <div className="flex justify-end pt-6 border-t border-slate-100">
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
