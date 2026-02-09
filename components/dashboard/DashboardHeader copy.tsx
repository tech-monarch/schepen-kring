"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Bell,
  User as UserIcon,
  LogOut,
  MessageCircle,
  Wallet,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Users as UsersIcon,
  UserCog,
  Newspaper,
  Languages,
  FileText,
  MessageSquare,
  Mail, // <-- add thi
  ChevronDown,
  CreditCard,
  Globe,
  ShoppingBag,
  Puzzle,
  Shield,
  CalendarDays,
  Percent,
  RefreshCw,
  Gift,
  Sparkles,
  Bot,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import ANSWER24LOGO from "@/public/schepenkring-logo.png";
import Image from "next/image";
import { tokenUtils } from "@/utils/auth";
import { User } from "@/types/user";
import { NavItem } from "@/types/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/common/NotificationBell";
import { ReferralModal } from "@/components/ReferralModal"; // adjust path as needed

// Extend User type locally to handle overrides if not yet in your types file
interface ExtendedUser extends User {
  page_overrides?: Record<string, "allow" | "deny">;
}

export function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwitchDropdownOpen, setIsSwitchDropdownOpen] = useState(false);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userRole, setUserRole] = useState<string>("client");
  const t = useTranslations("Navigation");
  const currentPath = usePathname();
  const router = useRouter();
  const [showReferralModal, setShowReferralModal] = useState(false);

  const isDashboardView =
    currentPath.includes("/dashboard") ||
    currentPath.includes("/admin") ||
    currentPath.includes("/account");

  const handleLogout = () => {
    tokenUtils.logout();
    setUser(null);
    setUserRole("client");
  };

  /* ===========================
     FETCH USER ROLE
     =========================== */
  const fetchUserRole = async (forceRefresh = false): Promise<string> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return "client";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/role`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) return "client";

      const data = await response.json();
      let role = "client";

      if (data.role === "admin" || data.role === 1) {
        role = "admin";
      } else if (data.role === "partner" || data.role === 2) {
        role = "partner";
      } else {
        role = "client";
      }

      localStorage.setItem("user_role", role);
      return role;
    } catch (error) {
      console.error("Failed to fetch user role from database:", error);
      return "client";
    }
  };

  const refreshUserWithOverrides = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/role`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await response.json();

    if (data.user) {
      setUser(data.user);
      localStorage.setItem("user_data", JSON.stringify(data.user));
    }
  };

  /* ===========================
     UPDATE USER ROLE (ADMIN)
     =========================== */
  const updateUserRole = async (targetUserId: number, newRole: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/toggle-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            user_id: targetUserId,
            role: newRole,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        const role = await fetchUserRole(true);
        setUserRole(role);
      }
    } catch (error) {
      console.error("Failed to update role", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const handleUserDataUpdate = (event: CustomEvent) => {
      const userData = event.detail;
      if (userData && userData.email && userData.email !== "user@example.com") {
        setUser(userData);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener(
      "userDataUpdated",
      handleUserDataUpdate as EventListener,
    );

    const loadUserData = async () => {
      const userData = tokenUtils.getUser();
      if (userData && userData.email && userData.email !== "user@example.com") {
        setUser(userData);
      }
      const role = await fetchUserRole(true);
      setUserRole(role);
      refreshUserWithOverrides();
    };

    loadUserData();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener(
        "userDataUpdated",
        handleUserDataUpdate as EventListener,
      );
    };
  }, []);

  const getNavItems = (): NavItem[] => [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["partner", "admin"],
      // Transformed Dashboard into a dropdown containing management items
      subItems: [
        { title: "Cashback", href: "/dashboard#cashback", icon: Wallet },
        { title: "Bookings", href: "/dashboard#bookings", icon: CalendarDays },
        { title: "Deals", href: "/dashboard#deals", icon: Percent },
      ],
    },
    {
      title: "Messages",
      href: "/dashboard/chat",
      icon: MessageSquare,
      roles: ["client", "partner", "admin"],
      badge: 3,
    },
    {
      title: "Webshops",
      href: "/webshop",
      icon: ShoppingBag,
      roles: ["client", "partner", "admin"],
      badge: 3,
    },
    {
      title: "Deals",
      href: "/webshop/deals",
      icon: Mail,
      roles: ["client", "partner", "admin"], // Permissions synced with Webshops
    },
    {
      title: "Widgets",
      href: "/dashboard/admin/widget",
      icon: Puzzle,
      roles: ["partner", "admin"],
    },
    {
      title: "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
      roles: ["client", "partner", "admin"],
    },
    {
      title: "Admin",
      icon: UserCog,
      href: "#",
      roles: ["admin"],
      subItems: [
        {
          title: t("admin.planManagement"),
          href: "/dashboard/admin/plans",
          icon: CreditCard,
        },
        {
          title: t("admin.userManagement"),
          href: "/dashboard/admin/users",
          icon: UsersIcon,
        },
        {
          title: "Blog Management",
          href: "/dashboard/admin/blog",
          icon: Newspaper,
        },
        {
          title: "FAQ Management",
          href: "/dashboard/admin/faq",
          icon: HelpCircle,
        },
        {
          title: "Knowledgebase Management",
          href: "/dashboard/admin/knowledgebase",
          icon: HelpCircle,
        },
        {
          title: "AI Support",
          href: "/dashboard/admin/ai",
          icon: Bot,
        },
        { title: "Settings", href: "/dashboard/account", icon: Settings },
        {
          title: "Translation Management",
          href: "/dashboard/admin/translations",
          icon: Languages,
        },
        {
          title: "Legal Page Management",
          href: "/dashboard/admin/legal-pages",
          icon: FileText,
        },
        {
          title: "About Page",
          href: "/dashboard/admin/about-page",
          icon: FileText,
        },
      ],
    },
  ];

  const navItems = getNavItems();

  // const filteredNavItems = navItems.filter((item) => {
  //   if (user?.page_overrides && item.href) {
  //     const override = user.page_overrides[item.href];
  //     if (override === 'deny') return false;
  //     if (override === 'allow') return true;
  //   }

  //   if (userRole === "admin") return true;
  //   return item.roles?.includes(userRole);
  // });

  const filteredNavItems = navItems.filter((item) => {
    // 1. Determine the unified key for permission checks
    let permissionHref = item.href;

    // Force both tabs to use the same key so an override on one affects both
    if (item.title === "Webshops" || item.title === "Deals") {
      permissionHref = "/webshop";
    }

    // 2. Check for manual user overrides using the unified key
    if (user?.page_overrides && permissionHref) {
      const override = user.page_overrides[permissionHref]; // Use permissionHref here
      if (override === "deny") return false;
      if (override === "allow") return true;
    }

    // 3. Standard role-based access
    if (userRole === "admin") return true;
    return item.roles?.includes(userRole);
  });

  const isNavItemActive = (item: NavItem) => {
    if (currentPath === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => currentPath === subItem.href);
    }
    return false;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSwitchDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };
  /* ===========================
     EXIT IMPERSONATION
     =========================== */
  const handleExitImpersonation = () => {
    const adminToken = localStorage.getItem("admin_token");
    const adminData = localStorage.getItem("admin_data");

    if (adminToken) {
      // 1. Restore Admin Session
      localStorage.setItem("auth_token", adminToken);
      if (adminData) localStorage.setItem("user_data", adminData);
      localStorage.setItem("user_role", "admin");

      // 2. Clean up impersonation markers
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_data");

      // 3. Redirect to Admin User Management
      window.location.href = "/nl/dashboard/admin/users";
    }
  };

  // State to check if impersonating
  const [isImpersonating, setIsImpersonating] = useState(false);
  useEffect(() => {
    setIsImpersonating(!!localStorage.getItem("admin_token"));
  }, [currentPath]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-25 transition-all duration-300 border-b border-gray-100/10",
        isScrolled
          ? "bg-background/90 backdrop-blur-lg shadow-lg"
          : "bg-background/80 backdrop-blur-sm",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/nl/dashboard"
            className="flex items-center space-x-2 group"
          >
            <Image
              src={ANSWER24LOGO}
              alt="Schepenkring.nlLogo"
              width={150}
              height={150}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => (
              <div key={item.title} className="relative group">
                {item.subItems ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "rounded-full px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium transition-all duration-200 flex items-center group-hover:scale-105",
                          isNavItemActive(item) && "text-blue-600 bg-blue-50",
                        )}
                      >
                        {item.title}
                        <ChevronDown className="ml-1 h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="mt-2 p-2 rounded-xl shadow-xl border border-gray-100 min-w-[200px]"
                      sideOffset={10}
                    >
                      {item.subItems.map((subItem) => (
                        <DropdownMenuItem
                          key={subItem.title}
                          className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                          asChild
                        >
                          <Link href={subItem.href || "#"} className="w-full">
                            {subItem.icon && (
                              <subItem.icon className="mr-2 h-4 w-4" />
                            )}
                            {subItem.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="overflow-hidden rounded-full"
                  >
                    <Link
                      href={item.href || "#"}
                      className={cn(
                        "block px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium transition-all duration-200",
                        isNavItemActive(item) && "text-blue-600 bg-blue-50",
                      )}
                    >
                      {item.title}
                    </Link>
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full",
                        isNavItemActive(item) && "w-full",
                      )}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          {/* EXIT IMPERSONATION BUTTON */}
          {isImpersonating && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleExitImpersonation}
              className="bg-orange-600 hover:bg-orange-700 h-9 px-4 animate-pulse gap-2 rounded-full"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-tight">
                Exit Impersonation
              </span>
            </Button>
          )}
          <button
            onClick={() => router.push("/dashboard/favourites")}
            className="group relative flex items-center gap-2.5 px-4 py-2 bg-pink-50/60 hover:bg-pink-100/50 border border-pink-100 hover:border-pink-200 rounded-full transition-all duration-500 shadow-sm hover:shadow-[0_8px_20px_-6px_rgba(244,114,182,0.3)]"
          >
            {/* The Icon Wrapper */}
            <div className="relative flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-pink-400 group-hover:text-pink-600 group-hover:fill-pink-600 transition-all duration-300 transform group-hover:scale-110" />

              {/* Refined Notification Dot - Pink on Pink style */}
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-pink-600 rounded-full border border-white shadow-sm"></span>
            </div>

            {/* The Text - Compact and Clean */}
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-pink-700 group-hover:text-pink-800 transition-colors">
                Favorieten
              </span>
              <span className="text-[7px] font-bold uppercase text-pink-400/80 tracking-tight mt-0.5">
                Mijn Lijst
              </span>
            </div>

            {/* Subtle Internal Glow */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity" />
          </button>
          <div className="hidden md:flex items-center space-x-4">
            {/* Reverted Location Switcher */}
            <div className="relative">
              <DropdownMenu
                open={isSwitchDropdownOpen}
                onOpenChange={setIsSwitchDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-gray-50 border-gray-200 hover:bg-gray-100"
                  >
                    {isDashboardView ? (
                      <>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Frontend</span>
                      </>
                    )}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem
                    onClick={() => handleNavigation("/")}
                    className={cn(
                      "cursor-pointer flex items-center space-x-2",
                      !isDashboardView && "bg-blue-50 text-blue-600",
                    )}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Frontend</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className={cn(
                      "cursor-pointer flex items-center space-x-2",
                      isDashboardView && "bg-blue-50 text-blue-600",
                    )}
                  >
                    <Link
                      href="/webshop"
                      className="flex items-center w-full space-x-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <LanguageSwitcher />

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        user?.profile_picture || "https://github.com/shadcn.png"
                      }
                      alt="@shadcn"
                    />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="w-full cursor-pointer">
                  <Link
                    href="/nl/dashboard/account"
                    className="flex items-center w-full"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{t("userMenu.profile")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="w-full cursor-pointer">
                  <Link
                    href="/nl/dashboard/chat"
                    className="flex items-center w-full"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>{t("chat")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="w-full cursor-pointer">
                  <Link
                    href="/nl/dashboard/wallet"
                    className="flex items-center w-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>{t("wallet")}</span>
                  </Link>
                </DropdownMenuItem>

                {/* <DropdownMenuItem className="w-full cursor-pointer">
                  <Link href="/nl/dashboard/admin/widget" className="flex items-center w-full">
                    <Puzzle className="mr-2 h-4 w-4" />
                    <span>Widget Management</span>
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator className="bg-slate-50" />

                {/* --- NEW STUNNING INVITE SECTION --- */}
                <div className="px-2 py-2">
                  <button
                    onClick={() => setShowReferralModal(true)} // You'll need to define this state in your Navbar
                    className="w-full relative overflow-hidden group flex items-center gap-3 p-3 bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-2xl transition-all shadow-lg shadow-indigo-100"
                  >
                    <div className="relative z-10 bg-white/20 p-2 rounded-xl">
                      <Gift className="w-4 h-4 text-white animate-bounce" />
                    </div>
                    <div className="relative z-10 text-left">
                      <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none mb-1">
                        Invite & Earn
                      </p>
                      <p className="text-xs font-bold text-white leading-none">
                        Get €10.00 Free
                      </p>
                    </div>

                    {/* Decorative Sparkle */}
                    <Sparkles className="absolute -right-1 -top-1 w-8 h-8 text-white/10 rotate-12 group-hover:rotate-45 transition-transform" />
                  </button>
                  <ReferralModal
                    open={showReferralModal}
                    onOpenChange={setShowReferralModal}
                  />
                </div>
                {/* ----------------------------------- */}

                <DropdownMenuSeparator className="bg-slate-50" />

                {user?.role?.name === "admin" && user?.id && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateUserRole(Number(user.id), 0)}
                      className="w-full cursor-pointer"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Demote to User</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="w-full cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("userMenu.logOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-6 py-4 space-y-4">
              {isImpersonating && (
                <Button
                  variant="destructive"
                  className="w-full bg-orange-600 hover:bg-orange-700 gap-2 mb-4"
                  onClick={handleExitImpersonation}
                >
                  <RefreshCw className="w-4 h-4" />
                  Exit Impersonation
                </Button>
              )}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => handleNavigation("/")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all",
                    !isDashboardView
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200",
                  )}
                >
                  <Globe className="w-4 h-4" />
                  <span>Frontend</span>
                </button>
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all",
                    isDashboardView
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200",
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </div>

              {filteredNavItems.map((item) => (
                <div key={item.title}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                        {item.title}
                      </span>
                      <div className="grid grid-cols-1 gap-1 pl-2">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.title}
                            href={sub.href || "#"}
                            className="flex items-center gap-2 p-2 text-gray-700 font-medium hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {sub.icon && <sub.icon className="w-4 h-4" />}
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className="cursor-pointer block text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
                    Notifications
                  </span>
                  <NotificationBell />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
