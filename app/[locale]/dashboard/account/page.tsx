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
  Search
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import DEFAULT_PFP from "@/components/dashboard/pfp.webp";
import { Sidebar } from "@/components/dashboard/Sidebar";

const API_BASE = "https://schepen-kring.nl/api";
const STORAGE_URL = "https://schepen-kring.nl/storage/";

// Define Google Maps types locally if needed
declare global {
  interface Window {
    google: any;
  }
}

interface AddressSuggestion {
  description: string;
  place_id: string;
}

export default function ProfileSettingsPage() {
  const t = useTranslations("Dashboard");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Main form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    profile_image: null as File | null,
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
    confirm: false
  });

  // Address autocomplete
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Initialize Google Maps Autocomplete when component mounts
  useEffect(() => {
    if (!addressInputRef.current || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        initAutocomplete();
      };
    };

    const initAutocomplete = () => {
      if (window.google && window.google.maps && addressInputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'nl' },
            fields: ['address_components', 'formatted_address', 'geometry']
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          handlePlaceSelect(place);
        });
      }
    };

    loadGoogleMaps();

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
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

  // Manual address search using Google Places API
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:nl&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setAddressSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Address search error:', error);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Get place details when an address is selected
  const handleAddressSelect = async (placeId: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,formatted_address&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.result) {
        handlePlaceSelect(data.result);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Place details error:', error);
    }
  };

  const handlePlaceSelect = (place: any) => {
    if (!place) return;

    const addressComponents: any = {};
    const formattedAddress = place.formatted_address || "";
    
    place.address_components?.forEach((component: any) => {
      const types = component.types;
      if (types.includes('street_number')) {
        addressComponents.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        addressComponents.streetName = component.long_name;
      } else if (types.includes('locality')) {
        addressComponents.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        addressComponents.state = component.long_name;
      } else if (types.includes('postal_code')) {
        addressComponents.zipCode = component.long_name;
      } else if (types.includes('country')) {
        addressComponents.country = component.long_name;
      }
    });

    setFormData(prev => ({
      ...prev,
      address: formattedAddress,
      city: addressComponents.city || prev.city,
      state: addressComponents.state || prev.state,
    }));
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

    // Validate password match
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
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="border-b border-slate-100 pb-8 mt-4">
              <h1 className="text-5xl font-serif italic text-[#003566]">Profile Identity</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">
                Personnel Credentials & Asset Management
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-100 p-8 text-center shadow-sm relative">
                  <div className="relative inline-block group">
                    <div className="w-40 h-40 border border-slate-200 overflow-hidden bg-white mx-auto">
                      <img
                        src={previewUrl || (user?.profile_image ? `${STORAGE_URL}${user.profile_image}` : DEFAULT_PFP.src)}
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
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  </div>
                  <div className="mt-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#003566]">{user?.name}</h2>
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-2">
                      {user?.userType || "Staff Member"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: ALL FIELDS */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <User size={12} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] transition-all uppercase tracking-wider"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Mail size={12} /> Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] transition-all lowercase"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Phone size={12} /> Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Building2 size={12} /> City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                    />
                  </div>
                </div>

                {/* House Address with Google Maps */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <MapPin size={12} /> House Address
                  </label>
                  <div className="relative">
                    <input
                      ref={addressInputRef}
                      type="text"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        searchAddress(e.target.value);
                      }}
                      onFocus={() => {
                        if (formData.address.length >= 3) {
                          searchAddress(formData.address);
                        }
                      }}
                      className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                      placeholder="Start typing your address..."
                    />
                    {isSearchingAddress && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    )}
                    
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 shadow-lg max-h-60 overflow-y-auto">
                        {addressSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.place_id}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 border-b border-slate-100 last:border-b-0"
                            onClick={() => handleAddressSelect(suggestion.place_id)}
                          >
                            <div className="flex items-center gap-2">
                              <Search size={12} className="text-slate-400" />
                              {suggestion.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1">
                    Start typing your address and select from suggestions
                  </p>
                </div>

                {/* State/Region */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Globe size={12} /> State / Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566]"
                  />
                </div>

                {/* PASSWORD CHANGE SECTION */}
                <div className="mt-12 pt-12 border-t border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#003566] mb-6 flex items-center gap-2">
                    <Shield size={14} /> Change Password
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Lock size={12} /> Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#003566]"
                        >
                          {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Lock size={12} /> New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#003566]"
                        >
                          {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Lock size={12} /> Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.new_password_confirmation}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                          className="w-full bg-transparent border-b border-slate-200 py-2 text-sm font-bold text-[#003566] outline-none focus:border-[#003566] pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#003566]"
                        >
                          {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 h-14 px-12 text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-lg disabled:opacity-50 flex items-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield size={14} />}
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="mt-16 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003566] text-white hover:bg-[#003566]/90 h-14 px-12 text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-lg disabled:opacity-50 flex items-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />}
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