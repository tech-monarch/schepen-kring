"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  UserPlus,
  Trash2,
  X,
  Eye,
  EyeOff,
  UserCircle,
  Mail,
  Phone,
  RefreshCw,
  Briefcase,
  UserCheck,
  Loader2,
  BadgeDollarSign,
  Link as LinkIcon,
  Copy,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { api } from "@/lib/api";

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
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<
    Record<number, UserPagePermission[]>
  >({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedPermissions, setExpandedPermissions] = useState<
    Record<number, boolean>
  >({});

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
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      Accept: "application/json",
    },
  });

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
        axios
          .get(`${API_BASE}/page-permissions`, getHeaders())
          .catch(() => ({ data: [] })),
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
      const response = await axios.get(
        `${API_BASE}/users/${userId}/page-permissions`,
        getHeaders(),
      );
      setSelectedUserPermissions((prev) => ({
        ...prev,
        [userId]: response.data,
      }));
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading("Creating user...", { id: "create" });
      const res = await axios.post(
        `${API_BASE}/partner/users`,
        newUser,
        getHeaders(),
      );
      setUsers([...users, res.data]);
      setIsModalOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "Employee",
        access_level: "Limited",
        status: "Active",
      });
      toast.success("User created.", { id: "create" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Creation failed.", {
        id: "create",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      toast.loading("Deleting user...", { id: "delete" });
      await axios.delete(`${API_BASE}/partner/users/${userId}`, getHeaders());
      setUsers(users.filter((u) => u.id !== userId));
      const newPermissions = { ...selectedUserPermissions };
      delete newPermissions[userId];
      setSelectedUserPermissions(newPermissions);
      toast.success("User deleted.", { id: "delete" });
    } catch (err) {
      toast.error("Deletion failed.", { id: "delete" });
    }
  };

  const updateUserPermission = async (
    userId: number,
    pageKey: string,
    value: PermissionValue,
  ) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/page-permissions/update`,
        { page_key: pageKey, permission_value: value },
        getHeaders(),
      );
      setSelectedUserPermissions((prev) => {
        const userPerms = prev[userId] || [];
        const updatedPerms = userPerms.map((perm) =>
          perm.page_key === pageKey
            ? { ...perm, permission_value: value }
            : perm,
        );
        if (!updatedPerms.find((p) => p.page_key === pageKey)) {
          const page = pagePermissions.find((p) => p.page_key === pageKey);
          if (page) {
            updatedPerms.push({
              page_key: pageKey,
              page_name: page.page_name,
              permission_value: value,
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

  const resetUserPermissions = async (userId: number) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/page-permissions/reset`,
        {},
        getHeaders(),
      );
      setSelectedUserPermissions((prev) => {
        const userPerms = prev[userId] || [];
        const resetPerms = userPerms.map((perm) => ({
          ...perm,
          permission_value: 0 as PermissionValue,
        }));
        return { ...prev, [userId]: resetPerms };
      });
      toast.success("Permissions reset");
    } catch (err) {
      toast.error("Failed to reset permissions");
    }
  };

  const getPermissionValue = (
    userId: number,
    pageKey: string,
  ): PermissionValue => {
    return (
      selectedUserPermissions[userId]?.find((p) => p.page_key === pageKey)
        ?.permission_value ?? 0
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === activeTab &&
        (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [users, searchQuery, activeTab]);

  const togglePermissions = (userId: number) => {
    setExpandedPermissions((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const PermissionDropdown = ({
    userId,
    page,
  }: {
    userId: number;
    page: PagePermission;
  }) => {
    const currentValue = getPermissionValue(userId, page.page_key);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value) as PermissionValue;
      updateUserPermission(userId, page.page_key, value);
    };

    return (
      <select
        value={currentValue}
        onChange={handleChange}
        className="border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium rounded shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-gray-900"
      >
        <option value={0} className="text-gray-900">
          Default
        </option>
        <option value={1} className="text-gray-900">
          Allow
        </option>
        <option value={2} className="text-gray-900">
          Deny
        </option>
      </select>
    );
  };

  const referralLink =
    currentUser?.role === "Partner" && currentUser?.partner_token
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
        style={{ marginLeft: isSidebarCollapsed ? "80px" : "280px" }}
      >
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
          <Toaster position="top-right" />
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
            <div>
              <h1 className="text-4xl font-serif italic text-gray-900">
                Harbor Personnel
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-700 font-bold mt-2">
                Manage employees, customers & sellers
              </p>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="SEARCH..."
                className="bg-white border border-gray-300 px-4 py-3 text-xs font-semibold tracking-wider uppercase outline-none focus:border-blue-500 w-64 text-gray-900 placeholder:text-gray-500 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#003566] hover:bg-blue-800 text-white rounded-md uppercase text-xs tracking-wider font-bold px-6 h-12 shadow-md"
              >
                <UserPlus className="mr-2 w-4 h-4" /> Add New
              </Button>
            </div>
          </div>
          {/* REFERRAL LINK SECTION */}
          {referralLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <LinkIcon className="w-4 h-4 text-blue-800" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    Your Unique Referral Link
                  </p>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {referralLink}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => copyToClipboard(referralLink)}
                className="bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 rounded-md text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-2 shadow-sm"
              >
                <Copy size={14} /> Copy Link
              </Button>
            </div>
          )}
          {/* TABS */}
          <div className="flex flex-wrap gap-1 border-b border-gray-200">
            {(["Employee", "Customer", "Seller"] as UserCategory[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all relative",
                    activeTab === tab
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-800",
                  )}
                >
                  {tab === "Employee" ? (
                    <Briefcase size={16} />
                  ) : tab === "Customer" ? (
                    <UserCircle size={16} />
                  ) : (
                    <BadgeDollarSign size={16} />
                  )}
                  {tab}s
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003566]"
                    />
                  )}
                </button>
              ),
            )}
          </div>
          {/* USER LIST */}
          <div className="grid grid-cols-1 gap-6 pb-20">
            {loading ? (
              <Loader2
                className="animate-spin mx-auto mt-20 text-gray-400"
                size={48}
              />
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xs font-bold uppercase tracking-wider">
                  No users found
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  layout
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* User info column */}
                    <div className="lg:w-1/3 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-700 overflow-hidden">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCheck size={32} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-serif italic text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mt-1">
                            {user.access_level} CLEARANCE
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-600" />{" "}
                          {user.email}
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-600" />{" "}
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            if (confirm("Delete this user?"))
                              handleDeleteUser(user.id);
                          }}
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} /> Terminate
                        </button>
                      </div>
                    </div>

                    {/* Permissions section (only for Employees) */}
                    {user.role === "Employee" && pagePermissions.length > 0 && (
                      <div className="lg:w-2/3 lg:border-l border-gray-200 lg:pl-6">
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => togglePermissions(user.id)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-blue-700"
                          >
                            <Settings size={18} />
                            Manage Permissions
                            {expandedPermissions[user.id] ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                          {expandedPermissions[user.id] && (
                            <button
                              onClick={() => resetUserPermissions(user.id)}
                              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-900"
                            >
                              <RefreshCw size={14} /> Reset All
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {expandedPermissions[user.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-[10px] font-bold uppercase text-gray-600 mb-3 tracking-wider">
                                  Page Access Control (0=Default, 1=Allow,
                                  2=Deny)
                                </p>
                                <div className="space-y-3">
                                  {pagePermissions.map((page) => (
                                    <div
                                      key={page.id}
                                      className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
                                    >
                                      <div className="pr-4">
                                        <p className="text-sm font-semibold text-gray-900">
                                          {page.page_name}
                                        </p>
                                        {page.description && (
                                          <p className="text-xs text-gray-600 mt-0.5">
                                            {page.description}
                                          </p>
                                        )}
                                      </div>
                                      <PermissionDropdown
                                        userId={user.id}
                                        page={page}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                  onClick={() => setIsModalOpen(false)}
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white w-full max-w-xl p-8 shadow-2xl relative z-10 border border-gray-200 rounded-lg"
                >
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute right-4 top-4 text-gray-600 hover:text-gray-900"
                  >
                    <X size={20} />
                  </button>
                  <div className="mb-6">
                    <h2 className="text-2xl font-serif italic text-gray-900">
                      Add New User
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mt-1">
                      Create employee, customer or seller
                    </p>
                  </div>

                  <form onSubmit={handleCreateUser} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                          Full Name
                        </label>
                        <input
                          required
                          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-gray-900"
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                          Email Address
                        </label>
                        <input
                          required
                          type="email"
                          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-gray-900"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          placeholder="user@example.com"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                        Password
                      </label>
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-gray-900 pr-12"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-600 hover:text-gray-900"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                          Role
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none text-gray-900"
                          value={newUser.role}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              role: e.target.value as UserCategory,
                            })
                          }
                        >
                          <option value="Employee">Employee</option>
                          <option value="Customer">Customer</option>
                          <option value="Seller">Seller</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                          Access Level
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none text-gray-900"
                          value={newUser.access_level}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              access_level: e.target.value as
                                | "Limited"
                                | "Full",
                            })
                          }
                        >
                          <option value="Limited">Limited</option>
                          <option value="Full">Full</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                          Status
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none text-gray-900"
                          value={newUser.status}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              status: e.target.value as
                                | "Active"
                                | "Inactive"
                                | "Pending",
                            })
                          }
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#003566] hover:bg-blue-800 text-white rounded-md h-12 uppercase text-xs font-bold shadow-md mt-4"
                    >
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
