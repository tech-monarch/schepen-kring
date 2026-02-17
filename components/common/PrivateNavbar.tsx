"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  RefreshCw,
  LayoutDashboard,
  ArrowRight,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ANSWER24LOGO from "@/public/schepenkring-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";

// Storage URL constant - Fixed to match your actual storage structure
const STORAGE_URL = "https://schepen-kring.nl/storage/";
// Hardcoded API URL
const API_URL = "https://schepen-kring.nl/api";

// User profile type based on localStorage structure
interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string; // Changed from userType to role to match your localStorage
  profile_image?: string;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string;
  access_level?: string;
}

export function PrivateNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const t = useTranslations("Navigation");
  const currentPath = usePathname();
  const router = useRouter();

  // Parse and get user data from localStorage
  const getUserFromLocalStorage = (): UserProfile | null => {
    try {
      const storedUser = localStorage.getItem("user_data");
      if (!storedUser) return null;

      const parsedUser = JSON.parse(storedUser);

      // Transform the localStorage data to match our UserProfile interface
      return {
        id: parsedUser.id,
        name: parsedUser.name,
        email: parsedUser.email,
        role: parsedUser.role || parsedUser.userType || "User", // Handle both 'role' and 'userType'
        profile_image: parsedUser.profile_image,
        phone_number: parsedUser.phone_number,
        address: parsedUser.address,
        city: parsedUser.city,
        state: parsedUser.state,
        status: parsedUser.status,
        access_level: parsedUser.access_level,
      };
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  // Fetch user profile data from API
  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found");
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform API data to match our interface
        const formattedData: UserProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role || data.userType || "User",
          profile_image: data.profile_image,
          phone_number: data.phone_number,
          address: data.address,
          city: data.city,
          state: data.state,
          status: data.status,
          access_level: data.access_level,
        };
        setUserProfile(formattedData);
        localStorage.setItem("user_data", JSON.stringify(data));
      } else {
        console.error("Failed to fetch profile");
        // Fallback to localStorage data
        const localUser = getUserFromLocalStorage();
        if (localUser) {
          setUserProfile(localUser);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback to localStorage data
      const localUser = getUserFromLocalStorage();
      if (localUser) {
        setUserProfile(localUser);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const token = localStorage.getItem("auth_token");
    const adminToken = localStorage.getItem("admin_token");

    setIsLoggedIn(!!token);
    setIsImpersonating(!!adminToken);

    // Get user data immediately from localStorage
    const localUser = getUserFromLocalStorage();
    if (localUser) {
      setUserProfile(localUser);
    }

    // Then fetch fresh data from API if logged in
    if (token) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPath]);

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!userProfile) return "/dashboard";

    switch (userProfile.role?.toLowerCase()) {
      case "admin":
        return "/dashboard/admin";
      case "partner":
        return "/dashboard/partner";
      case "employee":
      case "user":
      default:
        return "/dashboard";
    }
  };

  // Format user role for display
  const formatUserRole = (role?: string) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Construct profile image URL
  const getProfileImageUrl = (profileImage?: string) => {
    if (!profileImage) return null;

    // Remove any leading slashes
    const cleanPath = profileImage.replace(/^\//, "");

    // Try different URL patterns
    const urlPatterns = [
      `${STORAGE_URL}${cleanPath}`,
      `${STORAGE_URL.replace(/\/$/, "")}/${cleanPath}`,
    ];

    return urlPatterns[0];
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userProfile?.name) return "U";
    const names = userProfile.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return userProfile.name.substring(0, 2).toUpperCase();
  };

  // Handle logout (copied from DashboardHeader)
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

  // --- LOGIC: HIDE NAVBAR ON HOMEPAGE IF LOGGED IN ---
  const isHomePage = currentPath === "/" || currentPath.endsWith("/");
  if (isLoggedIn && isHomePage) {
    return null;
  }

  const navItems = [
    { name: t("home"), href: "/" },
    { name: t("yacht"), href: "/yachts" },
    { name: t("blog"), href: "/blog" },
    { name: t("faq"), href: "/faq" },
    { name: t("contact"), href: "/contact" },
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-8",
        isScrolled
          ? "h-20 bg-white border-b border-slate-100 shadow-sm"
          : "h-28 bg-white border-b border-[#003566]/5",
      )}
    >
      <AnimatePresence>
        {isImpersonating && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 bg-[#003566] text-white py-2 flex justify-center items-center gap-4 text-[9px] font-sans font-bold uppercase tracking-[0.3em]"
          >
            <RefreshCw size={10} className="animate-spin" />
            System Override: Impersonating User
            <button className="underline decoration-1 underline-offset-4 ml-2 hover:opacity-70">
              End Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "max-w-[1500px] mx-auto flex items-center justify-between h-full transition-all",
          isImpersonating && "mt-10",
        )}
      >
        <Link
          href="/"
          className="relative z-10 transition-transform hover:scale-[1.02]"
        >
          <Image
            src={ANSWER24LOGO}
            alt="Logo"
            width={160}
            height={45}
            className="object-contain brightness-100"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-[10px] font-sans font-black uppercase tracking-[0.4em] transition-all relative group",
                "text-[#003566]/60 hover:text-[#003566]",
              )}
            >
              {item.name}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#003566] transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-8">
          <div className="font-sans text-[10px] font-black tracking-widest text-[#003566]">
            <LanguageSwitcher />
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              {/* Dashboard Button */}
              <Link href={getDashboardLink()}>
                <button className="flex items-center gap-3 px-8 py-3 bg-[#003566] text-white text-[9px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-[#001d3d] transition-all group">
                  Dashboard
                  <ArrowRight
                    size={12}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </Link>

              {/* User Dropdown Menu - replicated from DashboardHeader */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-4 outline-none group">
                  <div className="hidden text-right lg:block">
                    <p className="text-[10px] font-bold text-[#003566] uppercase tracking-wider leading-none">
                      {userProfile?.name || "User"}
                    </p>
                    <p className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter mt-1">
                      {formatUserRole(userProfile?.role)}
                    </p>
                  </div>

                  <Avatar className="h-10 w-10 border-2 border-slate-100 group-hover:border-[#003566] transition-all duration-300">
                    <AvatarImage
                      src={
                        userProfile?.profile_image
                          ? getProfileImageUrl(userProfile.profile_image) ||
                            undefined
                          : undefined
                      }
                      className="object-cover"
                      alt={userProfile?.name || "User"}
                    />
                    <AvatarFallback className="bg-slate-100 text-[#003566] text-xs font-bold">
                      {getUserInitials()}
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
                      {userProfile?.email || "Authenticated Session"}
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
          ) : (
            <Link href="/login">{/* Login button if needed */}</Link>
          )}
        </div>

        <button
          className="lg:hidden w-12 h-12 flex items-center justify-center text-[#003566]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-[150] flex flex-col p-12"
          >
            <div className="flex justify-between items-center mb-24">
              <Image src={ANSWER24LOGO} alt="Logo" width={120} height={35} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#003566]"
              >
                <X size={35} strokeWidth={1} />
              </button>
            </div>

            <div className="flex flex-col gap-10">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-5xl font-serif italic text-[#003566] hover:opacity-60 transition-all block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-6">
              <div className="py-8 border-t border-slate-100">
                <LanguageSwitcher />
              </div>

              {isLoggedIn ? (
                <div className="space-y-6">
                  {/* User Profile in Mobile Menu - STACKED LAYOUT (unchanged) */}
                  <div className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-lg">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                      <AvatarImage
                        src={
                          userProfile?.profile_image
                            ? getProfileImageUrl(userProfile.profile_image) ||
                              undefined
                            : undefined
                        }
                        className="object-cover"
                        alt={userProfile?.name || "User"}
                      />
                      <AvatarFallback className="bg-[#003566] text-white text-2xl font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#003566]">
                        {userProfile?.name || "User"}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {userProfile?.email || "User Email"}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider bg-slate-100 inline-block px-3 py-1 rounded-full">
                        {formatUserRole(userProfile?.role)}
                      </p>
                    </div>
                  </div>

                  {/* Dashboard Button in Mobile Menu */}
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-[#003566] text-white font-sans font-bold h-16 rounded-none uppercase tracking-[0.3em] hover:bg-[#001d3d]">
                      <LayoutDashboard size={20} className="mr-3" />
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  {/* Login button if needed */}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}