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
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import ANSWER24LOGO from "@/public/schepenkring-logo.png";
// Import your default profile picture
import DEFAULT_PFP from "@/components/dashboard/pfp.webp";
import ReturnToAdmin from "./ReturnToAdmin";

// Storage URL constant
const STORAGE_URL = "https://schepen-kring.nl/storage/";

export function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    userType: string;
    profile_image?: string;
  } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const currentPath = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative text-slate-400 hover:text-[#003566] transition-colors outline-none">
            <Bell size={20} strokeWidth={1.5} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-white border border-slate-200 rounded-none shadow-xl p-0 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003566]">
                Communications & Alerts
              </h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="p-8 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  No new directives
                </p>
              </div>
            </div>
            <DropdownMenuSeparator className="m-0 bg-slate-100" />
            <button className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 hover:bg-blue-50 transition-colors">
              View All Notifications
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

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

            {/* UPDATED AVATAR LOGIC */}
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
