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
  const [activeTab, setActiveTab] = useState<UserCategory>("Employee");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    access_level: "Limited",
  status: "Active",
  });

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

const handleEnrollment = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    toast.loading("Enrolling new personnel...", { id: "enroll" });
    
    const res = await axios.post(`${API_BASE}/users`, newUser, getHeaders());
    
    setUsers([...users, res.data]);
    setIsModalOpen(false);
    
    // Reset form including status
    setNewUser({ 
      name: "", 
      email: "", 
      password: "", 
      role: "Employee", 
      access_level: "Limited",
      status: "Active" 
    });
    
    toast.success("Personnel successfully enrolled.", { id: "enroll" });
  } catch (err: any) {
    console.error("Enrollment error details:", err.response?.data);
    toast.error(err.response?.data?.message || "Enrollment failed.", { id: "enroll" });
  }
};

  const handleDeleteUser = async (userId: number) => {
    try {
      toast.loading("Terminating access...", { id: "delete" });
      await axios.delete(`${API_BASE}/users/${userId}`, getHeaders());
      setUsers(users.filter(u => u.id !== userId));
      toast.success("Access terminated.", { id: "delete" });
    } catch (err) {
      toast.error("Termination failed.", { id: "delete" });
    }
  };

  const impersonateUser = async (userId: number) => {
    try {
      const res = await axios.post(`${API_BASE}/users/${userId}/impersonate`, {}, getHeaders());
      localStorage.setItem("admin_token", localStorage.getItem("auth_token") || "");
      localStorage.setItem("auth_token", res.data.token);
      toast.success("Identity Assumed. Redirecting...");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("Impersonation failed.");
    }
  };

  const togglePermission = async (userId: number, permName: string) => {
    try {
      await axios.post(`${API_BASE}/users/${userId}/toggle-permission`, { permission: permName }, getHeaders());
      fetchData(); // Refresh to show changes
      toast.success("Authorization updated.");
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.role === activeTab && 
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery, activeTab]);

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
            className="bg-white border border-slate-200 px-4 py-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-blue-400 w-64"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#003566] text-white rounded-none uppercase text-[10px] tracking-widest font-black px-8 h-12">
            <UserPlus className="mr-2 w-4 h-4" /> Provision New
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100">
        {(["Employee", "Admin", "Partner", "Customer"] as UserCategory[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
              activeTab === tab ? "text-[#003566]" : "text-slate-400"
            )}
          >
            {tab === "Employee" && <Briefcase size={16} />}
            {tab === "Admin" && <ShieldCheck size={16} />}
            {tab === "Partner" && <Anchor size={16} />}
            {tab === "Customer" && <UserCircle size={16} />}
            {tab}s
            {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#003566]" />}
          </button>
        ))}
      </div>

      {/* USER LIST */}
      <div className="grid grid-cols-1 gap-6 pb-20">
        {loading ? (
          <Loader2 className="animate-spin mx-auto mt-20 text-slate-200" size={48} />
        ) : filteredUsers.map((user) => (
          <motion.div layout key={user.id} className="bg-white border border-slate-200 p-8 hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row gap-10">
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
                <div className="space-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Mail size={14} /> {user.email}</div>
                  {user.phone_number && <div className="flex items-center gap-2"><Phone size={14} /> {user.phone_number}</div>}
                </div>
                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button onClick={() => impersonateUser(user.id)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                    <LogIn size={14} /> Assume Identity
                  </button>
                  <button onClick={() => { if(confirm("Terminate Access?")) handleDeleteUser(user.id) }} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-400">
                    <Trash2 size={14} /> Terminate
                  </button>
                </div>
              </div>

              {/* PERMISSIONS (Personnel Only) */}
              {(user.role === "Admin" || user.role === "Employee") && (
                <div className="lg:w-2/3 lg:border-l border-slate-100 lg:pl-10">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Operations Authorization</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {permissions.map((perm) => (
                      <button key={perm.id} onClick={() => togglePermission(user.id, perm.name)} className={cn(
                        "flex items-center justify-between px-4 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all",
                        user.permissions?.includes(perm.name) ? "bg-[#003566] text-white" : "bg-white text-slate-400 border-slate-100"
                      )}>
                        {perm.name.replace(/_/g, " ")}
                        {user.permissions?.includes(perm.name) ? <Check size={12} /> : <div className="w-1 h-1 rounded-full bg-slate-200" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ENROLLMENT MODAL (Restored from your old code) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#003566]/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl p-10 shadow-2xl border border-slate-200">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><X size={24} /></button>
              <div className="mb-8">
                <h2 className="text-2xl font-serif italic text-[#003566]">Personnel Enrollment</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1">Add new user to the global manifest</p>
              </div>
              
              <form onSubmit={handleEnrollment} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <input required className="w-full border-b border-slate-200 py-3 text-sm font-bold text-[#003566] outline-none focus:border-blue-600" onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <input type="email" required className="w-full border-b border-slate-200 py-3 text-sm font-bold text-[#003566] outline-none focus:border-blue-600" onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div className="space-y-1 relative">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Access Key</label>
                  <input type={showPassword ? "text" : "password"} required className="w-full border-b border-slate-200 py-3 text-sm font-bold text-[#003566] outline-none focus:border-blue-600" onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-3 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Classification</label>
                    <select className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none" onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin</option>
                      <option value="Partner">Partner</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Clearance</label>
                    <select className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none" onChange={(e) => setNewUser({...newUser, access_level: e.target.value})}>
                      <option value="Limited">Limited</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Account Status</label>
                    <select 
                      className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none" 
                      value={newUser.status}
                      onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#003566] text-white rounded-none h-14 uppercase text-[10px] tracking-widest font-black shadow-lg">Finalize Enrollment</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}