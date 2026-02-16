"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  UserPlus, Trash2, X, Eye, EyeOff, UserCircle, Mail, Phone,
  RefreshCw, CheckSquare, Square, MinusSquare, Briefcase, UserCheck,
  Loader2, BadgeDollarSign, Link as LinkIcon, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { api } from "@/lib/api"; // adjust import to your api instance

type UserCategory = "Employee" | "Customer" | "Seller";
type PermissionValue = 0 | 1 | 2;

interface PagePermission {
  id: number;
  page_key: string;
  page_name: string;
  description?: string;
}

interface UserPagePermission {
  page_key: string;
  page_name: string;
  permission_value: PermissionValue;
}

export default function PartnerUserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserCategory>("Employee");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<Record<number, UserPagePermission[]>>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee" as UserCategory,
    access_level: "Limited" as "Limited" | "Full",
    status: "Active" as "Active" | "Inactive" | "Pending",
  });

  const API_BASE = "https://schepen-kring.nl/api";
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}`, Accept: "application/json" },
  });

  // Fetch current user (partner) data
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/user", getHeaders());
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Failed to fetch current user", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/partner/users`, getHeaders()),
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
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/page-permissions`, getHeaders());
      setSelectedUserPermissions(prev => ({ ...prev, [userId]: response.data }));
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading("Creating user...", { id: "create" });
      const res = await axios.post(`${API_BASE}/partner/users`, newUser, getHeaders());
      setUsers([...users, res.data]);
      setIsModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "Employee", access_level: "Limited", status: "Active" });
      toast.success("User created.", { id: "create" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Creation failed.", { id: "create" });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      toast.loading("Deleting user...", { id: "delete" });
      await axios.delete(`${API_BASE}/partner/users/${userId}`, getHeaders());
      setUsers(users.filter(u => u.id !== userId));
      const newPermissions = { ...selectedUserPermissions };
      delete newPermissions[userId];
      setSelectedUserPermissions(newPermissions);
      toast.success("User deleted.", { id: "delete" });
    } catch (err) {
      toast.error("Deletion failed.", { id: "delete" });
    }
  };

  const updateUserPermission = async (userId: number, pageKey: string, value: PermissionValue) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/page-permissions/update`,
        { page_key: pageKey, permission_value: value },
        getHeaders()
      );
      setSelectedUserPermissions(prev => {
        const userPerms = prev[userId] || [];
        const updatedPerms = userPerms.map(perm =>
          perm.page_key === pageKey ? { ...perm, permission_value: value } : perm
        );
        if (!updatedPerms.find(p => p.page_key === pageKey)) {
          const page = pagePermissions.find(p => p.page_key === pageKey);
          if (page) {
            updatedPerms.push({ page_key: pageKey, page_name: page.page_name, permission_value: value });
          }
        }
        return { ...prev, [userId]: updatedPerms };
      });
      toast.success("Permission updated");
    } catch (err) {
      toast.error("Failed to update permission");
    }
  };

  const resetUserPermissions = async (userId: number) => {
    try {
      await axios.post(`${API_BASE}/users/${userId}/page-permissions/reset`, {}, getHeaders());
      setSelectedUserPermissions(prev => {
        const userPerms = prev[userId] || [];
        const resetPerms = userPerms.map(perm => ({ ...perm, permission_value: 0 as PermissionValue }));
        return { ...prev, [userId]: resetPerms };
      });
      toast.success("Permissions reset");
    } catch (err) {
      toast.error("Failed to reset permissions");
    }
  };

  const getPermissionValue = (userId: number, pageKey: string): PermissionValue => {
    return selectedUserPermissions[userId]?.find(p => p.page_key === pageKey)?.permission_value ?? 0;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.role === activeTab &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery, activeTab]);

  // Dropdown component for permissions
  const PermissionDropdown = ({ userId, page }: { userId: number, page: PagePermission }) => {
    const currentValue = getPermissionValue(userId, page.page_key);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value) as PermissionValue;
      updateUserPermission(userId, page.page_key, value);
    };

    return (
      <select
        value={currentValue}
        onChange={handleChange}
        className="border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-blue-400 cursor-pointer"
      >
        <option value={0}>Default</option>
        <option value={1}>Allow</option>
        <option value={2}>Deny</option>
      </select>
    );
  };

  // Construct referral link if current user is a partner and has a token
  const referralLink = currentUser?.role === "Partner" && currentUser?.partner_token
    ? `${window.location.origin}/nl/login/${currentUser.partner_token}`
    : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Referral link copied to clipboard!");
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <main
        className="flex-1 transition-all duration-300 bg-white"
        style={{ marginLeft: isSidebarCollapsed ? '80px' : '280px' }}
      >
        <div className="space-y-10 p-6 max-w-7xl mx-auto">
          <Toaster position="top-right" />

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
            <div>
              <h1 className="text-4xl font-serif italic text-[#003566]">Harbor Personnel</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">Manage your employees & customers & sellers</p>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="SEARCH..."
                className="bg-white border border-slate-200 px-4 py-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-blue-400 w-64 text-[#003566] placeholder:text-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => setIsModalOpen(true)} className="bg-[#003566] text-white rounded-none uppercase text-[10px] tracking-widest font-black px-8 h-12">
                <UserPlus className="mr-2 w-4 h-4" /> Add New
              </Button>
            </div>
          </div>

          {/* REFERRAL LINK SECTION (only for partners) */}
          {referralLink && (
            <div className="bg-blue-50 border border-blue-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <LinkIcon className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-800">Your Unique Referral Link</p>
                  <p className="text-xs text-blue-900 font-mono break-all">{referralLink}</p>
                </div>
              </div>
              <Button
                onClick={() => copyToClipboard(referralLink)}
                className="bg-white border border-blue-200 text-blue-800 hover:bg-blue-100 rounded-none text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2"
              >
                <Copy size={14} /> Copy Link
              </Button>
            </div>
          )}

          {/* TABS */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100">
            {(["Employee", "Customer", "Seller"] as UserCategory[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                  activeTab === tab ? "text-[#003566]" : "text-slate-400"
                )}
              >
                {tab === "Employee" ? <Briefcase size={16} /> :
                 tab === "Customer" ? <UserCircle size={16} /> :
                 <BadgeDollarSign size={16} />}
                {tab}s
                {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#003566]" />}
              </button>
            ))}
          </div>

          {/* USER LIST */}
          <div className="grid grid-cols-1 gap-6 pb-20">
            {loading ? (
              <Loader2 className="animate-spin mx-auto mt-20 text-slate-200" size={48} />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-[10px] font-bold uppercase tracking-widest">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div layout key={user.id} className="bg-white border border-slate-200 p-8 hover:shadow-lg transition-all">
                  <div className="flex flex-col lg:flex-row gap-10">
                    {/* User info column */}
                    <div className="lg:w-1/3 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-200 flex items-center justify-center text-[#003566]">
                          {user.profile_image ? (
                            <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCheck size={32} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-serif italic text-[#003566]">{user.name}</h3>
                          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.access_level} CLEARANCE</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {user.email}</div>
                        {user.phone_number && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {user.phone_number}</div>}
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <button onClick={() => { if(confirm("Delete this user?")) handleDeleteUser(user.id); }} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600">
                          <Trash2 size={14} /> Terminate
                        </button>
                      </div>
                    </div>

                    {/* PERMISSION DROPDOWNS (only for Employees) */}
                    {user.role === "Employee" && pagePermissions.length > 0 && (
                      <div className="lg:w-2/3 lg:border-l border-slate-100 lg:pl-10">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em]">Page Access Control</p>
                            <p className="text-[7px] text-slate-400 mt-1">0=Default | 1=Show | 2=Hide</p>
                          </div>
                          <button onClick={() => resetUserPermissions(user.id)} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700">
                            <RefreshCw size={12} /> Reset All
                          </button>
                        </div>

                        <div className="space-y-4">
                          {pagePermissions.map((page) => (
                            <div key={page.id} className="flex items-center justify-between border-b border-slate-100 pb-4">
                              <div>
                                <p className="text-[10px] font-bold uppercase text-[#003566]">{page.page_name}</p>
                                {page.description && <p className="text-[8px] text-slate-500 mt-1">{page.description}</p>}
                              </div>
                              <PermissionDropdown userId={user.id} page={page} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* CREATE MODAL */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center p-6 z-50">
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
                    <h2 className="text-2xl font-serif italic text-[#003566]">Add New User</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Create employee, customer or seller</p>
                  </div>

                  <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                        <input
                          required
                          className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400 text-[#003566] placeholder:text-slate-300"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <input
                          required
                          type="email"
                          className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400 text-[#003566] placeholder:text-slate-300"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          placeholder="user@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Password</label>
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400 text-[#003566] placeholder:text-slate-300"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 bottom-2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Role</label>
                        <select
                          className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none text-[#003566]"
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value as UserCategory})}
                        >
                          <option value="Employee">Employee</option>
                          <option value="Customer">Customer</option>
                          <option value="Seller">Seller</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Access Level</label>
                        <select
                          className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none text-[#003566]"
                          value={newUser.access_level}
                          onChange={(e) => setNewUser({...newUser, access_level: e.target.value as "Limited" | "Full"})}
                        >
                          <option value="Limited">Limited</option>
                          <option value="Full">Full</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Status</label>
                        <select
                          className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none text-[#003566]"
                          value={newUser.status}
                          onChange={(e) => setNewUser({...newUser, status: e.target.value as "Active" | "Inactive" | "Pending"})}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#003566] text-white rounded-none h-14 uppercase text-[10px] tracking-widest font-black shadow-lg">
                      Create User
                    </Button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}