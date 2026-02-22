"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Search,
  Check,
  CheckCheck,
  Trash2,
  BellOff,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
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
import DEFAULT_PFP from "@/components/dashboard/pfp.webp";
import ReturnToAdmin from "./ReturnToAdmin";
import * as PusherPushNotifications from "@pusher/push-notifications-web";

const STORAGE_URL = "https://schepen-kring.nl/storage/";
const API_URL = "https://schepen-kring.nl/api";

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
    id?: number;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState(true);
  const [browserPushEnabled, setBrowserPushEnabled] = useState(true);

  // Beams
  const [beamsInitialized, setBeamsInitialized] = useState(false);
  const beamsClientRef = useRef<any>(null);

  const currentPath = usePathname();
  const router = useRouter();

  // Load user and preferences
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) setUser(JSON.parse(storedUser));

    const notifPref = localStorage.getItem("notifications_enabled");
    if (notifPref !== null) setNotificationsEnabled(notifPref === "true");

    const pushPref = localStorage.getItem("push_alerts_enabled");
    if (pushPref !== null) setPushAlertsEnabled(pushPref === "true");

    const browserPref = localStorage.getItem("browser_push_enabled");
    if (browserPref !== null) setBrowserPushEnabled(browserPref === "true");
  }, []);

  // Initialize Beams if enabled
  const initializeBeams = async () => {
    if (!user?.id || beamsInitialized) return;
    try {
      const client = new PusherPushNotifications.Client({
        instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID!,
      });
      await client.start();
      beamsClientRef.current = client;
      setBeamsInitialized(true);
      await client.addDeviceInterest(`user-${user.id}`);
      console.log("Beams ready, subscribed to user-" + user.id);
    } catch (error) {
      console.error("Beams init failed", error);
      if (error instanceof Error && error.message.includes("permission")) {
        toast.error("Please allow browser notifications in your settings.");
      }
    }
  };

  // Auto-initialize Beams if enabled on mount
  useEffect(() => {
    if (user?.id && browserPushEnabled && !beamsInitialized) {
      initializeBeams();
    }
  }, [user?.id, browserPushEnabled, beamsInitialized]);

  // Toggle functions
  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem("notifications_enabled", newState.toString());

    if (!newState) {
      setNotifications([]);
      setUnreadCount(0);
      // Optionally remove Beams interest if you want to completely disable
      if (beamsClientRef.current && user?.id && browserPushEnabled) {
        beamsClientRef.current.removeDeviceInterest(`user-${user.id}`);
      }
      toast.success("Notifications disabled");
    } else {
      fetchNotifications();
      fetchUnreadCount();
      // Re-subscribe Beams if browser push is enabled
      if (browserPushEnabled && beamsClientRef.current && user?.id) {
        beamsClientRef.current.addDeviceInterest(`user-${user.id}`);
      }
      toast.success("Notifications enabled");
    }
  };

  const togglePushAlerts = () => {
    const newState = !pushAlertsEnabled;
    setPushAlertsEnabled(newState);
    localStorage.setItem("push_alerts_enabled", newState.toString());
    toast.success(newState ? "Toast alerts enabled" : "Toast alerts disabled");
  };

  const toggleBrowserPush = async () => {
    const newState = !browserPushEnabled;
    setBrowserPushEnabled(newState);
    localStorage.setItem("browser_push_enabled", newState.toString());

    if (newState) {
      if (!beamsInitialized && user?.id) await initializeBeams();
      else if (beamsClientRef.current && user?.id) {
        await beamsClientRef.current.addDeviceInterest(`user-${user.id}`);
      }
    } else {
      if (beamsClientRef.current && user?.id) {
        await beamsClientRef.current.removeDeviceInterest(`user-${user.id}`);
      }
    }
  };

  // API calls
  const fetchNotifications = async () => {
    if (!notificationsEnabled) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.meta?.unread_count || 0);
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!notificationsEnabled) return;
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return toast.error("No auth token");

      const res = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, read: true, read_at: new Date().toISOString() }
              : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Marked as read");
      } else {
        toast.error("Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return toast.error("No auth token");

      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            read: true,
            read_at: new Date().toISOString(),
          })),
        );
        setUnreadCount(0);
        toast.success("All marked as read");
      } else {
        toast.error("Failed to mark all as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return toast.error("No auth token");

      const res = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const wasUnread = notifications.find(
          (n) => n.id === notificationId && !n.read,
        );
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Polling for unread count (fallback)
  useEffect(() => {
    if (notificationsEnabled) {
      fetchNotifications();
      fetchUnreadCount();
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const interval = setInterval(() => {
      if (notificationsEnabled) fetchUnreadCount();
    }, 30000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [notificationsEnabled]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("fleet_tasks");
    localStorage.removeItem("task_cache");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sidebar_cache_")) localStorage.removeItem(key);
    });
    router.push("/");
  };

  // Helpers
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return diffDays < 7 ? `${diffDays}d ago` : date.toLocaleDateString();
  };

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
      <Toaster position="top-right" reverseOrder={false} />
      {/* Brand Logo */}
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

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 px-4 py-2.5 gap-3 focus-within:border-[#003566] focus-within:bg-white transition-all">
          <Search size={14} className="text-slate-400" />
          <input
            placeholder="Search vessels..."
            className="bg-transparent border-none outline-none text-[10px] uppercase tracking-widest text-[#003566] placeholder:text-slate-400 w-64 font-medium"
          />
        </div>
      </div>
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

        {/* Notifications Dropdown */}
        <DropdownMenu
          onOpenChange={(open) => {
            if (open && notificationsEnabled) fetchNotifications();
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
            {/* Header with toggles */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003566]">
                  Notifications
                </h3>
                <div className="flex items-center gap-4">
                  {/* Master toggle */}
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

              {/* Toast alerts toggle */}
              {notificationsEnabled && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Toast Alerts
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
                      {pushAlertsEnabled ? "ON" : "OFF"}
                    </span>
                    <button
                      onClick={togglePushAlerts}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        pushAlertsEnabled ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          pushAlertsEnabled
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Browser Push toggle */}
              {notificationsEnabled && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Browser Push
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
                      {browserPushEnabled ? "ON" : "OFF"}
                    </span>
                    <button
                      onClick={toggleBrowserPush}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        browserPushEnabled ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          browserPushEnabled
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications list */}
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
                                <Check size={10} /> Mark as read
                              </button>
                            ) : (
                              <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                <CheckCheck size={10} /> Read
                              </span>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="text-[9px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
                            >
                              <Trash2 size={10} /> Delete
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

        {/* User Menu */}
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
