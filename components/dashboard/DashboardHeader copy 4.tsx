"use client";

import { useState, useEffect } from "react";
import {
  Anchor,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Search,
  AlertTriangle,
  Check,
  CheckCheck,
  Trash2,
  BellOff,
  BellRing,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import ANSWER24LOGO from "@/public/schepenkring-logo.png";
// Import your default profile picture
import DEFAULT_PFP from "@/components/dashboard/pfp.webp";
import ReturnToAdmin from "./ReturnToAdmin";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component

// Storage URL constant
const STORAGE_URL = "https://schepen-kring.nl/storage/";
// Hardcoded API URL
const API_URL = "https://schepen-kring.nl/api";

// Notification type
interface Notification {
  id: number;
  notification: {
    id: number;
    type: "info" | "warning" | "success" | "error" | "system";
    title: string;
    message: string;
    data: any;
    created_at: string;
  };
  read: boolean;
  read_at: string | null;
  pivot: {
    read: boolean;
    read_at: string | null;
  };
}

export function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    userType: string;
    profile_image?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const currentPath = usePathname();
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load notification preference from localStorage
    const notificationPref = localStorage.getItem("notifications_enabled");
    if (notificationPref !== null) {
      setNotificationsEnabled(notificationPref === "true");
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!notificationsEnabled) return;
    // Skip if notifications are disabled

    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found");
        return;
      }

      console.log("Fetching notifications from:", `${API_URL}/notifications`);
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log(
        "Response text (first 500 chars):",
        responseText.substring(0, 500),
      );
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("Notifications data received:", data);
          setNotifications(data.data || []);
          setUnreadCount(data.meta?.unread_count || 0);
        } catch (jsonError) {
          console.error("Failed to parse as JSON:", jsonError);
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        console.error("Notifications API error:", responseText);
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count separately
  const fetchUnreadCount = async () => {
    if (!notificationsEnabled) return;
    // Skip if notifications are disabled

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found for unread count");
        return;
      }

      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setUnreadCount(data.count || 0);
        } catch (e) {
          console.error("Failed to parse unread count:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Toggle notifications
  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem("notifications_enabled", newState.toString());

    if (newState) {
      // If enabling notifications, fetch them
      fetchNotifications();
      fetchUnreadCount();
      toast.success("Notifications enabled");
    } else {
      // If disabling, clear notifications
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notifications disabled");
    }
  };

  // Fetch data on mount and setup polling
  useEffect(() => {
    if (notificationsEnabled) {
      fetchNotifications();
      fetchUnreadCount();
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Poll for new notifications every 30 seconds only if enabled
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [notificationsEnabled]);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, read: true, read_at: new Date().toISOString() }
              : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Notification marked as read");
      } else {
        const text = await response.text();
        console.error("Mark as read error:", text);
        toast.error("Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            read: true,
            read_at: new Date().toISOString(),
          })),
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } else {
        const text = await response.text();
        console.error("Mark all as read error:", text);
        toast.error("Failed to mark all as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId),
        );
        setUnreadCount((prev) => {
          const notification = notifications.find(
            (n) => n.id === notificationId,
          );
          return notification?.read ? prev : Math.max(0, prev - 1);
        });
        toast.success("Notification deleted");
      } else {
        const text = await response.text();
        console.error("Delete notification error:", text);
        toast.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("fleet_tasks");
    localStorage.removeItem("task_cache");
    // Clear sidebar cache on logout
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sidebar_cache_")) {
        localStorage.removeItem(key);
      }
    });
    router.push("/");
  };

  // Format notification time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "system":
        return "⚙️";
      default:
        return "ℹ️";
    }
  };

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8 h-20 flex items-center justify-between",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-white border-b border-slate-100",
      )}
    >
      // <Toaster position="top-right" reverseOrder={false} />
      {/* Brand Logo Section */}
      <div className="flex items-center gap-12">
        <Link href="#" className="flex items-center group">
          <Image
            src={ANSWER24LOGO}
            alt="Schepenkring Logo"
            width={140}
            height={40}
            className="object-contain transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 px-4 py-2.5 gap-3 focus-within:border-[#003566] focus-within:bg-white transition-all">
          <Search size={14} className="text-slate-400" />
          <input
            placeholder="Search vessels..."
            className="bg-transparent border-none outline-none text-[10px] uppercase tracking-widest text-[#003566] placeholder:text-slate-400 w-64 font-medium"
          />
        </div>
      </div>
      {/* Navigation - Fleet Management Link Removed */}
      <nav className="hidden lg:flex items-center gap-3">
        {/* Navigation links removed as requested */}
      </nav>
      {/* User Actions */}
      <div className="flex items-center gap-8">
        <ReturnToAdmin />
        <Link href="/yachts">
          <button className="flex items-center gap-3 px-8 py-3 bg-[#003566] text-white text-[9px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-[#001d3d] transition-all group">
            Frontend
            <ArrowRight
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </Link>

        {/* Updated Notifications Dropdown with Toggle */}
        <DropdownMenu
          onOpenChange={(open) => {
            if (open && notificationsEnabled) {
              fetchNotifications(); // Refresh when dropdown opens
            }
          }}
        >
          <DropdownMenuTrigger className="relative text-slate-400 hover:text-[#003566] transition-colors outline-none">
            {notificationsEnabled ? (
              <Bell size={20} strokeWidth={1.5} />
            ) : (
              <BellOff size={20} strokeWidth={1.5} className="text-slate-300" />
            )}
            {notificationsEnabled && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-96 bg-white border border-slate-200 rounded-none shadow-xl p-0 overflow-hidden max-h-[500px]"
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003566]">
                Notifications
              </h3>
              <div className="flex items-center gap-4">
                {/* Notification Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
                    {notificationsEnabled ? "ON" : "OFF"}
                  </span>
                  <button
                    onClick={toggleNotifications}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      notificationsEnabled ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationsEnabled
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {notificationsEnabled && notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {!notificationsEnabled ? (
                <div className="p-8 text-center">
                  <BellOff size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-2">
                    Notifications Disabled
                  </p>
                  <p className="text-[8px] text-slate-400 mb-4">
                    You won't receive new notifications until enabled
                  </p>
                  <button
                    onClick={toggleNotifications}
                    className="text-[8px] font-bold uppercase tracking-widest bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
                  >
                    Enable Notifications
                  </button>
                </div>
              ) : loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003566] mx-auto"></div>
                  <p className="text-[9px] text-slate-500 mt-2">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={24} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    No notifications yet
                  </p>
                  <button
                    onClick={fetchNotifications}
                    className="mt-2 text-[8px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-slate-50 transition-colors relative group",
                        !notification.read && "bg-blue-50/50",
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="text-xs">
                            {getNotificationIcon(
                              notification.notification.type,
                            )}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-[11px] font-bold text-[#003566] truncate">
                              {notification.notification.title}
                            </h4>
                            <span className="text-[8px] text-slate-400 font-medium whitespace-nowrap ml-2">
                              {formatTime(notification.notification.created_at)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 mb-2">
                            {notification.notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            {!notification.read ? (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <Check size={10} />
                                Mark as read
                              </button>
                            ) : (
                              <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                <CheckCheck size={10} />
                                Read
                              </span>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="text-[9px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu - Without Logout Confirmation */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-4 outline-none group">
            <div className="hidden text-right lg:block">
              <p className="text-[10px] font-bold text-[#003566] uppercase tracking-wider leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter mt-1">
                {user?.userType || "Authenticated"}
              </p>
            </div>

            <Avatar className="h-10 w-10 border-2 border-slate-100 group-hover:border-[#003566] transition-all duration-300">
              <AvatarImage
                src={
                  user?.profile_image
                    ? `${STORAGE_URL}${user.profile_image}`
                    : DEFAULT_PFP.src
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-100 text-[#003566] text-xs font-bold">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <ChevronDown
              size={14}
              className="text-slate-400 group-hover:text-[#003566] transition-all"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 bg-white border border-slate-200 text-[#003566] rounded-none p-2 shadow-xl overflow-hidden"
          >
            <DropdownMenuLabel className="flex flex-col px-3 py-2">
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                User Identity
              </span>
              <span className="text-[11px] font-medium lowercase text-[#003566] mt-1 truncate">
                {user?.email || "Authenticated Session"}
              </span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onSelect={() => router.push("/dashboard/account")}
              className="hover:bg-slate-50 cursor-pointer gap-3 text-[10px] font-bold uppercase tracking-widest py-3 px-3"
            >
              <Settings size={14} /> Account Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-100" />

            <DropdownMenuItem
              onSelect={handleLogout}
              className="text-red-500 hover:bg-red-50 cursor-pointer gap-3 text-[10px] font-bold uppercase tracking-widest py-3 px-3"
            >
              <LogOut size={14} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
