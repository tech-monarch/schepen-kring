"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  ShieldCheck, UserPlus, Trash2, 
  X, Check, Loader2, Key, Mail, Search, AlertTriangle, Eye, EyeOff 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast"; 

// --- TYPES ---
interface Permission {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  access_level: string;
  permissions?: string[]; 
}

export default function RoleManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "",
    role: "Employee", status: "Active", access_level: "Limited"
  });

  const API_BASE = "http://127.0.0.1:8000/api";
  const getHeaders = () => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      Accept: "application/json"
    }
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/users`, getHeaders()),
        axios.get(`${API_BASE}/permissions`, getHeaders()).catch(() => ({ data: [] }))
      ]);
      setUsers(uRes.data);
      setPermissions(pRes.data);
    } catch (err) {
      toast.error("Failed to sync personnel directory.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * OPTIMISTIC TOGGLE: 
   * Instantly updates the UI. Reverts if the API fails.
   */
  const togglePermission = async (userId: number, permName: string) => {
    const previousUsers = [...users];

    // 1. Instant UI update
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const hasPerm = u.permissions?.includes(permName);
        const newPerms = hasPerm 
          ? u.permissions?.filter(p => p !== permName) 
          : [...(u.permissions || []), permName];
        return { ...u, permissions: newPerms };
      }
      return u;
    }));

    try {
      const res = await axios.post(`${API_BASE}/users/${userId}/toggle-permission`, 
        { permission: permName }, getHeaders());
      toast.success(`${permName.replace(/_/g, ' ')} ${res.data.status === 'attached' ? 'Granted' : 'Revoked'}`, {
        style: { fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }
      });
    } catch (err) {
      // 2. Rollback on failure
      setUsers(previousUsers);
      toast.error("Terminal rejected permission change.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadToast = toast.loading("Enrolling personnel...");
    try {
      const res = await axios.post(`${API_BASE}/users`, newUser, getHeaders());
      setUsers([res.data, ...users]);
      setIsModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "Employee", status: "Active", access_level: "Limited" });
      toast.success("User provisioned successfully.", { id: loadToast });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.", { id: loadToast });
    }
  };

  const terminateAccount = async (id: number) => {
    if (!confirm("TERMINATE ACCOUNT: This will permanently remove this user from the fleet. Proceed?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`, getHeaders());
      setUsers(users.filter(u => u.id !== id));
      toast.success("Account successfully purged.");
    } catch (err) {
      toast.error("Authorization failed.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.role !== 'Customer' && 
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">Command Center</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">Access & Security Oversight</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="SEARCH PERSONNEL..."
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:border-blue-400 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#003566] text-white rounded-none h-12 px-8 uppercase text-[10px] tracking-widest font-black shadow-xl hover:bg-blue-900 transition-all">
            <UserPlus className="mr-2 w-4 h-4" /> New Provisioning
          </Button>
        </div>
      </div>

      {/* USER LIST */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-24 text-slate-300">
            <Loader2 className="animate-spin mb-4" size={32} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing Secure Directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No personnel found in manifest</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={user.id} 
              className="bg-white border border-slate-200 p-8 shadow-sm transition-all hover:shadow-md relative group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-8">
                {/* ID Card Style */}
                <div className="w-full md:w-1/3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center text-[#003566] group-hover:bg-blue-50 transition-colors">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif italic text-[#003566]">{user.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100">
                          {user.role}
                        </span>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border",
                          user.status === 'Active' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-red-600 bg-red-50 border-red-100"
                        )}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2 mb-6 italic">
                    <Mail size={12}/> {user.email}
                  </p>
                  <button 
                    onClick={() => terminateAccount(user.id)}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} /> Terminate Access
                  </button>
                </div>

                {/* Permissions Board */}
                <div className="w-full md:w-2/3 md:border-l border-slate-50 md:pl-8">
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-4 font-black">Authorized Operations</p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {permissions.map(perm => (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(user.id, perm.name)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all duration-75",
                          user.permissions?.includes(perm.name) 
                            ? "bg-[#003566] text-white border-[#003566] shadow-sm" 
                            : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                        )}
                      >
                        {perm.name.replace(/_/g, ' ')}
                        {user.permissions?.includes(perm.name) ? <Check size={12} /> : <div className="w-2 h-2 rounded-full bg-slate-100" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* PROVISIONING MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#003566]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 border border-slate-200 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
              
              <div className="mb-8">
                <h2 className="text-2xl font-serif italic text-[#003566]">Register Personnel</h2>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-1">System Enrollment Manifest</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                    <input 
                      required
                      className="w-full border-b border-slate-200 py-2 outline-none text-xs focus:border-blue-600 uppercase"
                      placeholder="E.G. MARCUS VANE"
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <input 
                      required type="email"
                      className="w-full border-b border-slate-200 py-2 outline-none text-xs focus:border-blue-600"
                      placeholder="CREW@ANSWER.COM"
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Temporary Password
                  </label>

                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      className="w-full border-b border-slate-200 py-2 pr-6 outline-none text-xs focus:border-blue-600"
                      onChange={e =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                    />

                    {/* Key icon */}
                    <Key size={14} className="absolute right-6 top-2 text-slate-300" />

                    {/* Eye toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-2 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">System Role</label>
                    <select 
                      className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none bg-transparent"
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="Employee">Fleet Employee</option>
                      <option value="Admin">System Admin</option>
                      <option value="Customer">Client User</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Access Tier</label>
                    <select 
                      className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none bg-transparent"
                      onChange={e => setNewUser({...newUser, access_level: e.target.value})}
                    >
                      <option value="Limited">Limited Clearance</option>
                      <option value="Full">Full Clearance</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#003566] text-white rounded-none h-14 uppercase text-[10px] tracking-[0.3em] font-black shadow-lg hover:bg-blue-900">
                  Finalize Enrollment
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}