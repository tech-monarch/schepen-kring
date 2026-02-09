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

// Storage URL constant
const STORAGE_URL = "https://schepen-kring.nl/storage/";
// Hardcoded API URL
const API_URL = "https://schepen-kring.nl/api";

// Notification type
interface Notification {
  id: number;
  notification: {
    id: number;
    type: 'info' | 'warning' | 'success' | 'error' | 'system';
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentPath = usePathname();
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found");
        return;
      }

      console.log("Fetching notifications from:", `${API_URL}/notifications`);
      console.log("Token (first 20 chars):", token.substring(0, 20) + "...");
      
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log("Response status:", response.status);
      
      // Get response as text first to see what's returned
      const responseText = await response.text();
      console.log("Response text (first 500 chars):", responseText.substring(0, 500));
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("Notifications data received:", data);
          setNotifications(data.data || []);
          setUnreadCount(data.meta?.unread_count || 0);
        } catch (jsonError) {
          console.error("Failed to parse as JSON:", jsonError);
          // Set empty state
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
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found for unread count");
        return;
      }

      console.log("Fetching unread count from:", `${API_URL}/notifications/unread-count`);
      
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log("Unread count response status:", response.status);
      
      if (response.ok) {
        const text = await response.text();
        console.log("Unread count response:", text);
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

  // Fetch data on mount and setup polling
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      console.log("Marking notification as read:", notificationId);
      
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log("Mark as read response status:", response.status);
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success('Notification marked as read');
      } else {
        const text = await response.text();
        console.error("Mark as read error:", text);
        toast.error('Failed to mark as read');
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error('Failed to mark as read');
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

      console.log("Marking all notifications as read");
      
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log("Mark all as read response status:", response.status);
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read: true, 
            read_at: new Date().toISOString() 
          }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      } else {
        const text = await response.text();
        console.error("Mark all as read error:", text);
        toast.error('Failed to mark all as read');
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error('Failed to mark all as read');
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

      console.log("Deleting notification:", notificationId);
      
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("Delete notification response status:", response.status);
      
      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId);
          return notification?.read ? prev : Math.max(0, prev - 1);
        });
        toast.success('Notification deleted');
      } else {
        const text = await response.text();
        console.error("Delete notification error:", text);
        toast.error('Failed to delete notification');
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error('Failed to delete notification');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("fleet_tasks");
    localStorage.removeItem("task_cache");
    router.push("/");
  };

  const managementItems = [
    { title: "Fleet Management", href: "/yachts", icon: Anchor },
  ];

  // Format notification time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'system': return '⚙️';
      default: return 'ℹ️';
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
      <Toaster position="top-right" reverseOrder={false} />

      {/* Brand Logo Section */}
      <div className="flex items-center gap-12">
        <Link href="/nl/dashboard" className="flex items-center group">
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

      {/* Navigation */}
      <nav className="hidden lg:flex items-center gap-3">
        {managementItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "px-6 py-2.5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-sm",
              currentPath === item.href
                ? "text-white bg-[#003566]"
                : "text-slate-500 hover:text-[#003566] hover:bg-slate-50",
            )}
          >
            <item.icon
              size={14}
              strokeWidth={currentPath === item.href ? 3 : 2}
            />
            {item.title}
          </Link>
        ))}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-8">
        <ReturnToAdmin />
        
        {/* Updated Notifications Dropdown */}
        <DropdownMenu onOpenChange={(open) => {
          if (open) {
            fetchNotifications(); // Refresh when dropdown opens
          }
        }}>
          <DropdownMenuTrigger className="relative text-slate-400 hover:text-[#003566] transition-colors outline-none">
            <Bell size={20} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
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
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003566] mx-auto"></div>
                  <p className="text-[9px] text-slate-500 mt-2">Loading notifications...</p>
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
                        !notification.read && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="text-xs">
                            {getNotificationIcon(notification.notification.type)}
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
                              onClick={() => deleteNotification(notification.id)}
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
            
            <DropdownMenuSeparator className="m-0 bg-slate-100" />
            <button 
              onClick={() => router.push('/nl/dashboard/activity-logs')}
              className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              View All Activity Logs
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu
          onOpenChange={(open) => !open && setShowLogoutConfirm(false)}
        >
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
            <AnimatePresence mode="wait">
              {!showLogoutConfirm ? (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
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

                  <DropdownMenuItem
                    onSelect={() => router.push("/nl/dashboard/activity-logs")}
                    className="hover:bg-slate-50 cursor-pointer gap-3 text-[10px] font-bold uppercase tracking-widest py-3 px-3"
                  >
                    <Bell size={14} /> Activity Logs
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-100" />

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowLogoutConfirm(true);
                    }}
                    className="text-red-500 hover:bg-red-50 cursor-pointer gap-3 text-[10px] font-bold uppercase tracking-widest py-3 px-3"
                  >
                    <LogOut size={14} /> Logout
                  </DropdownMenuItem>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-4 flex flex-col items-center text-center"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle className="text-red-500 w-5 h-5" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#003566] mb-1">
                    Confirm Logout?
                  </h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-tighter mb-4">
                    Your current session will be terminated.
                  </p>

                  <div className="flex w-full gap-2">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 py-2 text-[9px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Stay
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-2 text-[9px] font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}