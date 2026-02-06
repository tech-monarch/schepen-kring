"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ShieldCheck, UserPlus, Trash2, X, Check, Loader2, Key, Mail,
  Search, AlertTriangle, Eye, EyeOff, UserCircle, Settings,
  Users, Briefcase, Anchor, UserCheck, LogIn, MapPin, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

type UserCategory = "Employee" | "Admin" | "Partner" | "Customer";

export default function RoleManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserCategory>("Employee"); // Employees first
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = "https://schepen-kring.nl/api";
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}`, Accept: "application/json" },
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/users`, getHeaders()),
        axios.get(`${API_BASE}/permissions`, getHeaders()).catch(() => ({ data: [] })),
      ]);
      setUsers(uRes.data);
      setPermissions(pRes.data);
    } catch (err) {
      toast.error("Failed to sync personnel directory.");
    } finally {
      setLoading(false);
    }
  };

  // --- IMPERSONATION LOGIC ---
  const impersonateUser = async (userId: number) => {
    try {
      const res = await axios.post(`${API_BASE}/users/${userId}/impersonate`, {}, getHeaders());
      // Store the original admin token to return later, and set the user token
      localStorage.setItem("admin_token", localStorage.getItem("auth_token") || "");
      localStorage.setItem("auth_token", res.data.token);
      toast.success("Identity Assumed. Redirecting...");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("Impersonation protocol failed.");
    }
  };

  const togglePermission = async (userId: number, permName: string) => {
    const previousUsers = [...users];
    setUsers(prev => prev.map(u => u.id === userId ? { 
      ...u, 
      permissions: u.permissions?.includes(permName) 
        ? u.permissions.filter((p: string) => p !== permName) 
        : [...(u.permissions || []), permName] 
    } : u));

    try {
      await axios.post(`${API_BASE}/users/${userId}/toggle-permission`, { permission: permName }, getHeaders());
      toast.success(`${permName.replace(/_/g, " ")} status updated.`);
    } catch (err) {
      setUsers(previousUsers);
      toast.error("Terminal rejected permission change.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.role === activeTab && 
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery, activeTab]);

  const tabs: { id: UserCategory; label: string; icon: any }[] = [
    { id: "Employee", label: "Operations Deck", icon: Briefcase },
    { id: "Admin", label: "Command Staff", icon: ShieldCheck },
    { id: "Partner", label: "Fleet Partners", icon: Anchor },
    { id: "Customer", label: "Client Registry", icon: UserCircle },
  ];

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">Personnel Command</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">Fleet-Wide Identity Management</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" placeholder="SEARCH MANIFEST..." 
            className="bg-white border border-slate-200 px-4 py-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-blue-400"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#003566] text-white rounded-none uppercase text-[10px] tracking-widest font-black px-8">
            <UserPlus className="mr-2 w-4 h-4" /> Provision New
          </Button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-[#003566]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#003566]" />}
          </button>
        ))}
      </div>

      {/* USER CARDS */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 text-[10px] font-black uppercase text-slate-400">No personnel matching this classification.</div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={user.id} className="bg-white border border-slate-200 p-8 hover:shadow-lg transition-all">
              <div className="flex flex-col lg:flex-row gap-10">
                
                {/* ID & Profile Data */}
                <div className="lg:w-1/3 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 flex items-center justify-center text-[#003566]">
                      {user.profile_image ? <img src={user.profile_image} className="w-full h-full object-cover" /> : <UserCheck size={32} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif italic text-[#003566]">{user.name}</h3>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.access_level} CLEARANCE</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="flex items-center gap-2"><Mail size={14} className="text-slate-300" /> {user.email}</div>
                    {user.phone_number && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {user.phone_number}</div>}
                    {user.city && <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-300" /> {user.city}, {user.state}</div>}
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                    <button onClick={() => impersonateUser(user.id)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                      <LogIn size={14} /> Assume Identity
                    </button>
                    <button onClick={() => toast.error("Editing locked.")} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
                      <Settings size={14} /> Full File
                    </button>
                  </div>
                </div>

                {/* Permissions (Only for Admins/Employees) */}
                {(user.role === "Admin" || user.role === "Employee") && (
                  <div className="lg:w-2/3 lg:border-l border-slate-100 lg:pl-10">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-4">Operations Authorization</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {permissions.map((perm) => (
                        <button
                          key={perm.id}
                          onClick={() => togglePermission(user.id, perm.name)}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all",
                            user.permissions?.includes(perm.name) ? "bg-[#003566] text-white border-[#003566]" : "bg-white text-slate-400 border-slate-100"
                          )}
                        >
                          {perm.name.replace(/_/g, " ")}
                          {user.permissions?.includes(perm.name) ? <Check size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}