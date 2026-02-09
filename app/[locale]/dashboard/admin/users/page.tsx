"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ShieldCheck, UserPlus, Trash2, X, Check, Loader2, Key, Mail,
  Search, AlertTriangle, Eye, EyeOff, UserCircle, Settings,
  Users, Briefcase, Anchor, UserCheck, LogIn, MapPin, Phone,
  Lock, Unlock, RefreshCw, CheckSquare, Square, MinusSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

type UserCategory = "Employee" | "Admin" | "Partner" | "Customer";
type PermissionValue = 0 | 1 | 2;

interface PagePermission {
  page_key: string;
  page_name: string;
  description?: string;
}

interface UserPagePermission {
  page_key: string;
  page_name: string;
  permission_value: PermissionValue;
}

export default function RoleManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserCategory>("Employee");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<Record<number, UserPagePermission[]>>({});

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/users`, getHeaders()),
        axios.get(`${API_BASE}/page-permissions`, getHeaders()).catch(() => ({ data: [] })),
      ]);
      setUsers(uRes.data);
      setPagePermissions(pRes.data);
      
      // Fetch permissions for each employee
      const employees = uRes.data.filter((u: any) => u.role === "Employee");
      for (const employee of employees) {
        await fetchUserPermissions(employee.id);
      }
    } catch (err) {
      toast.error("Failed to sync personnel directory.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/page-permissions`, getHeaders());
      setSelectedUserPermissions(prev => ({
        ...prev,
        [userId]: response.data
      }));
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
    }
  };

  const handleEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading("Enrolling new personnel...", { id: "enroll" });
      const res = await axios.post(`${API_BASE}/users`, newUser, getHeaders());
      setUsers([...users, res.data]);
      setIsModalOpen(false);
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
      toast.error(err.response?.data?.message || "Enrollment failed.", { id: "enroll" });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      toast.loading("Terminating access...", { id: "delete" });
      await axios.delete(`${API_BASE}/users/${userId}`, getHeaders());
      setUsers(users.filter(u => u.id !== userId));
      
      // Remove from permissions state
      const newPermissions = { ...selectedUserPermissions };
      delete newPermissions[userId];
      setSelectedUserPermissions(newPermissions);
      
      toast.success("Access terminated.", { id: "delete" });
    } catch (err) {
      toast.error("Termination failed.", { id: "delete" });
    }
  };

  const impersonateUser = async (userId: number) => {
    try {
      toast.loading("Assimilating identity...", { id: "impersonate" });
      const res = await axios.post(`${API_BASE}/users/${userId}/impersonate`, {}, getHeaders());
      const adminToken = localStorage.getItem("auth_token");
      localStorage.clear();
      if (adminToken) localStorage.setItem("admin_token", adminToken);
      localStorage.setItem("auth_token", res.data.token);
      const impersonatedUserData = JSON.stringify({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          userType: res.data.user.role
      });
      localStorage.setItem("user_data", impersonatedUserData);
      toast.success(`Identity assumed: ${res.data.user.name}`, { id: "impersonate" });
      setTimeout(() => { window.location.href = "/nl/dashboard"; }, 1000);
    } catch (err) {
      toast.error("Impersonation protocol failed.", { id: "impersonate" });
    }
  };

  const updateUserPermission = async (userId: number, pageKey: string, value: PermissionValue) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/page-permissions/update`,
        { page_key: pageKey, permission_value: value },
        getHeaders()
      );

      // Update local state
      setSelectedUserPermissions(prev => {
        const userPerms = prev[userId] || [];
        const updatedPerms = userPerms.map(perm => 
          perm.page_key === pageKey ? { ...perm, permission_value: value } : perm
        );
        
        // If permission doesn't exist yet, add it
        if (!updatedPerms.find(p => p.page_key === pageKey)) {
          const page = pagePermissions.find(p => p.page_key === pageKey);
          if (page) {
            updatedPerms.push({
              page_key: pageKey,
              page_name: page.page_name,
              permission_value: value
            });
          }
        }
        
        return { ...prev, [userId]: updatedPerms };
      });

      toast.success("Permission updated");
    } catch (err) {
      toast.error("Failed to update permission");
    }
  };

  const bulkUpdatePermissions = async (userId: number, permissions: UserPagePermission[]) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/page-permissions/bulk-update`,
        { permissions },
        getHeaders()
      );
      
      setSelectedUserPermissions(prev => ({
        ...prev,
        [userId]: permissions
      }));
      
      toast.success("All permissions updated");
    } catch (err) {
      toast.error("Failed to update permissions");
    }
  };

  const resetUserPermissions = async (userId: number) => {
    try {
      await axios.post(`${API_BASE}/users/${userId}/page-permissions/reset`, {}, getHeaders());
      
      // Reset all permissions to 0 in local state
      setSelectedUserPermissions(prev => {
        const userPerms = prev[userId] || [];
        const resetPerms = userPerms.map(perm => ({
          ...perm,
          permission_value: 0
        }));
        return { ...prev, [userId]: resetPerms };
      });
      
      toast.success("Permissions reset to default");
    } catch (err) {
      toast.error("Failed to reset permissions");
    }
  };

  const getPermissionValue = (userId: number, pageKey: string): PermissionValue => {
    const userPerms = selectedUserPermissions[userId];
    if (!userPerms) return 0;
    
    const perm = userPerms.find(p => p.page_key === pageKey);
    return perm ? perm.permission_value : 0;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.role === activeTab && 
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery, activeTab]);

  const PermissionToggle = ({ userId, page }: { userId: number, page: PagePermission }) => {
    const currentValue = getPermissionValue(userId, page.page_key);
    
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateUserPermission(userId, page.page_key, 1)}
          className={cn(
            "px-3 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all",
            currentValue === 1 
              ? "bg-green-100 text-green-700 border-green-300" 
              : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
          )}
        >
          <CheckSquare size={12} className="inline mr-1" />
          Allow
        </button>
        
        <button
          onClick={() => updateUserPermission(userId, page.page_key, 2)}
          className={cn(
            "px-3 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all",
            currentValue === 2 
              ? "bg-red-100 text-red-700 border-red-300" 
              : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
          )}
        >
          <Square size={12} className="inline mr-1" />
          Deny
        </button>
        
        <button
          onClick={() => updateUserPermission(userId, page.page_key, 0)}
          className={cn(
            "px-3 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all",
            currentValue === 0 
              ? "bg-blue-100 text-blue-700 border-blue-300" 
              : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
          )}
        >
          <MinusSquare size={12} className="inline mr-1" />
          Default
        </button>
      </div>
    );
  };

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

              {/* PERMISSION SIMULATOR - Only for Employees */}
              {user.role === "Employee" && (
                <div className="lg:w-2/3 lg:border-l border-slate-100 lg:pl-10">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em]">Page Access Control</p>
                      <p className="text-[7px] text-slate-400 mt-1">
                        0=Default | 1=Show | 2=Hide
                      </p>
                    </div>
                    <button 
                      onClick={() => resetUserPermissions(user.id)}
                      className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700"
                    >
                      <RefreshCw size={12} /> Reset All to Default
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {pagePermissions.map((page) => (
                      <div key={page.page_key} className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#003566]">{page.page_name}</p>
                          <p className="text-[8px] text-slate-400 mt-1">{page.description}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
                              getPermissionValue(user.id, page.page_key) === 0 
                                ? "bg-blue-100 text-blue-600" 
                                : "bg-slate-100 text-slate-400"
                            )}>
                              0
                            </div>
                            <p className="text-[7px] text-slate-400 mt-1">Default</p>
                          </div>
                          
                          <div className="text-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
                              getPermissionValue(user.id, page.page_key) === 1 
                                ? "bg-green-100 text-green-600" 
                                : "bg-slate-100 text-slate-400"
                            )}>
                              1
                            </div>
                            <p className="text-[7px] text-slate-400 mt-1">Show</p>
                          </div>
                          
                          <div className="text-center">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
                              getPermissionValue(user.id, page.page_key) === 2 
                                ? "bg-red-100 text-red-600" 
                                : "bg-slate-100 text-slate-400"
                            )}>
                              2
                            </div>
                            <p className="text-[7px] text-slate-400 mt-1">Hide</p>
                          </div>
                          
                          <PermissionToggle userId={user.id} page={page} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ENROLLMENT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white w-full max-w-xl p-10 shadow-2xl relative z-10 border border-slate-200 rounded-none"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              <div className="mb-8">
                <h2 className="text-2xl font-serif italic text-[#003566]">Personnel Enrollment</h2>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Establish new system identity</p>
              </div>

              <form onSubmit={handleEnrollment} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                    <input required className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <input required type="email" className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">System Password</label>
                  <input required type={showPassword ? "text" : "password"} className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 bottom-2 text-slate-400">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Assignment</label>
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
                    <select className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none" value={newUser.status} onChange={(e) => setNewUser({...newUser, status: e.target.value})}>
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