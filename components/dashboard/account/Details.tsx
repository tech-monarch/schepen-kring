"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Added for description
import {
  Copy,
  Check,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Building2,
  User,
  ExternalLink,
  Pencil,
  ArrowLeft,
  Save,
  FileText,
  Phone,
} from "lucide-react";
import { toast } from "react-toastify";

// Aligned with your Laravel Database Column Names
interface Company {
  id?: number;
  company_name?: string;
  business_email?: string;
  business_phone?: string;
  contact_person?: string;
  address?: string;
  description?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export default function CompanyDetails() {
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<Company>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://kring.answer24.nl/api/v1";

  useEffect(() => {
    const storedUserData = localStorage.getItem("user_data");
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        if (parsed.email) {
          // Update the form state with the email from localStorage
          setForm((prev) => ({ ...prev, business_email: parsed.email }));
        }
      } catch (err) {
        console.error("Error parsing user_data", err);
      }
    }
    fetchCompany();
  }, []);
  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("auth_token");
    return token ? token.replace(/["']/g, "") : null;
  };

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  // Interceptor to attach token
  api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      // Using the endpoint we created in the controller
      const { data } = await api.get(`/my-business-details`);
      if (data.data) {
        setCompany(data.data);
        setForm(data.data);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load company details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Get the email again just to be safe
      const storedUserData = localStorage.getItem("user_data");
      const parsed = JSON.parse(storedUserData || "{}");
      const emailToUse = form.business_email || parsed.email;

      if (!emailToUse) {
        toast.error("User email not found. Please log in again.");
        return;
      }

      // 2. Prepare the payload exactly as the controller expects
      const payload = {
        ...form,
        identifier: emailToUse, // Maps to 'identifier' in controller
        phone: form.business_phone, // Maps to 'phone' in controller
        contact_person: form.contact_person,
        company_name: form.company_name,
        address: form.address,
        description: form.description,
        website: form.website,
        facebook: form.facebook,
        instagram: form.instagram,
        youtube: form.youtube,
      };

      const response = await api.post(`/pending-onboarding`, payload);

      toast.success("Details updated successfully!");
      setCompany(form);
      setEditing(false);
    } catch (err: any) {
      console.error("Save error:", err.response?.data);
      toast.error(err.response?.data?.message || "Check all required fields");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-neutral-400 animate-pulse font-medium">
        Fetching business profile...
      </div>
    );

  // --- EDIT MODE ---
  if (!company || editing) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Company Settings
            </h2>
            <p className="text-neutral-500 text-sm">
              Update your identity, location, and social presence.
            </p>
          </div>
          {company && (
            <Button
              variant="ghost"
              onClick={() => setEditing(false)}
              className="text-neutral-500 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
            </Button>
          )}
        </div>

        <div className="space-y-12">
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Identity
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Official business name and contact person.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Company Name</Label>
                <Input
                  name="company_name"
                  value={form.company_name || ""}
                  onChange={handleChange}
                  className="bg-neutral-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">
                  Primary Contact Person
                </Label>
                <Input
                  name="contact_person"
                  value={form.contact_person || ""}
                  onChange={handleChange}
                  className="bg-neutral-50/50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs text-neutral-500">
                  Business Description
                </Label>
                <Textarea
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  className="bg-neutral-50/50 min-h-[100px]"
                  placeholder="Briefly describe your business..."
                />
              </div>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Location & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> Contact &
                Location
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Where customers can find or reach you.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">
                  Physical Address
                </Label>
                <Input
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  className="bg-neutral-50/50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500">
                    Business Phone
                  </Label>
                  <Input
                    name="business_phone"
                    value={form.business_phone || ""}
                    onChange={handleChange}
                    className="bg-neutral-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500">
                    Business Email
                  </Label>
                  <Input
                    name="business_email"
                    value={form.business_email || ""}
                    onChange={handleChange}
                    className="bg-neutral-50/50"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Globe size={18} className="text-blue-600" /> Digital Presence
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Manage your website and social URLs.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              {[
                { name: "website", icon: Globe },
                { name: "facebook", icon: Facebook },
                { name: "instagram", icon: Instagram },
                { name: "youtube", icon: Youtube },
              ].map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <div className="w-24 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    {f.name}
                  </div>
                  <Input
                    name={f.name}
                    value={(form as any)[f.name] || ""}
                    onChange={handleChange}
                    placeholder="https://"
                    className="bg-neutral-50/50"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-end gap-4 border-t border-neutral-100 pt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 shadow-lg shadow-blue-100"
          >
            {saving ? (
              "Saving..."
            ) : (
              <span className="flex items-center gap-2">
                <Save size={16} /> Save Settings
              </span>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // --- DISPLAY MODE ---
  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-neutral-100 mb-12">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <Building2 size={36} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
              {company.company_name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-neutral-600 text-xs font-bold uppercase tracking-wider">
                <MapPin size={12} />{" "}
                {company.address?.split(",").pop()?.trim() || "Headquarters"}
              </div>
              <span className="text-neutral-300">•</span>
              <span className="text-sm text-neutral-500 font-medium">
                {company.business_email}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setEditing(true)}
          variant="outline"
          className="border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 hover:text-blue-600 h-11 px-6 group"
        >
          <Pencil
            size={16}
            className="mr-2 group-hover:rotate-12 transition-transform"
          />{" "}
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-12">
          {/* Contact Person */}
          <div>
            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] mb-4">
              Contact Person
            </h4>
            <div className="flex items-center gap-4 p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-neutral-400">
                <User size={20} />
              </div>
              <p className="font-bold text-neutral-800 text-lg">
                {company.contact_person || "Not assigned"}
              </p>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] mb-4">
              Business Info
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-neutral-400 mt-1" />
                <p className="text-sm text-neutral-700">
                  {company.business_phone}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-neutral-400 mt-1" />
                <p className="text-sm text-neutral-700">{company.address}</p>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-neutral-400 mt-1" />
                <p className="text-sm text-neutral-600 italic">
                  "{company.description}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Assets List */}
        <div className="lg:col-span-8">
          <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] mb-6">
            Digital Presence
          </h4>
          <div className="grid gap-3">
            {[
              {
                label: "Website",
                val: company.website,
                icon: Globe,
                color: "text-blue-500",
              },
              {
                label: "Facebook",
                val: company.facebook,
                icon: Facebook,
                color: "text-blue-700",
              },
              {
                label: "Instagram",
                val: company.instagram,
                icon: Instagram,
                color: "text-pink-600",
              },
              {
                label: "YouTube",
                val: company.youtube,
                icon: Youtube,
                color: "text-red-600",
              },
            ]
              .filter((i) => i.val)
              .map((item) => (
                <div
                  key={item.label}
                  className="group flex items-center justify-between p-5 hover:bg-neutral-50 rounded-2xl transition-all border border-transparent hover:border-neutral-100"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`h-12 w-12 rounded-xl bg-white border border-neutral-100 flex items-center justify-center shadow-sm ${item.color} group-hover:scale-110 transition-transform`}
                    >
                      <item.icon size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-0.5">
                        {item.label}
                      </span>
                      <a
                        href={item.val}
                        target="_blank"
                        className="text-neutral-900 font-bold flex items-center gap-1.5 hover:text-blue-600 truncate max-w-[200px] md:max-w-xs"
                      >
                        {item.val?.replace(/(^\w+:|^)\/\//, "").split("/")[0]}
                        <ExternalLink
                          size={14}
                          className="opacity-0 group-hover:opacity-100 text-neutral-300 transition-opacity"
                        />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item.val!)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied === item.val ? "bg-green-50 text-green-600" : "bg-white text-neutral-400 opacity-0 group-hover:opacity-100 border border-neutral-100 hover:text-neutral-900"}`}
                  >
                    {copied === item.val ? (
                      <>
                        <Check size={14} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
