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
  Puzzle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";
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
import ANSWER24LOGO from "@/public/Answer24Logo.png";
import Image from "next/image";
import { tokenUtils } from "@/utils/auth";
import { User } from "@/types/user";
import NotificationBell from "./NotificationBell";

export function PrivateNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleUserDataUpdate = (event: CustomEvent) => {
      const userData = event.detail;
      if (userData && userData.email && userData.email !== "user@example.com") {
        setUser(userData);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("userDataUpdated", handleUserDataUpdate as EventListener);

    // Initialize user data with retry mechanism
    const loadUserData = () => {
      const userData = tokenUtils.getUser();
      if (userData && userData.email && userData.email !== "user@example.com") {
        setUser(userData);
        return true;
      }
      return false;
    };

    // Try to load user data immediately
    if (!loadUserData()) {
      // If no user data found, retry with exponential backoff
      let retryCount = 0;
      const maxRetries = 10;
      
      const retryInterval = setInterval(() => {
        retryCount++;
        if (loadUserData() || retryCount >= maxRetries) {
          clearInterval(retryInterval);
        }
      }, 200 * retryCount); // Exponential backoff

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("userDataUpdated", handleUserDataUpdate as EventListener);
        clearInterval(retryInterval);
      };
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("userDataUpdated", handleUserDataUpdate as EventListener);
    };
  }, []);

  const t = useTranslations("Navigation");

  const navItems = [
    { name: t("account"), href: "/webshop", as: "/webshop" },
    { name: t("chat"), href: "/dashboard/chat", as: "/chat" },
    {
      name: t("wallet"),
      href: "/dashboard/wallet",
      as: "/wallet",
    },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={ANSWER24LOGO}
              alt="Answer24 Logo"
              width={150}
              height={50}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ y: -2 }}
                className="cursor-pointer text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
              >
                <Link href={item.href}>{item.name}</Link>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full" />
              </motion.div>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <NotificationBell />
            <LanguageSwitcher />
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
                      alt="User Avatar"
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
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/account"
                    className="flex items-center w-full"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{t("userMenu.profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/chat"
                    className="flex items-center w-full"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>{t("chat")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/wallet"
                    className="flex items-center w-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>{t("wallet")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/admin/widget"
                    className="flex items-center w-full"
                  >
                    <Puzzle className="mr-2 h-4 w-4" />
                    <span>Widget Management</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("userMenu.logOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="cursor-pointer block text-gray-700 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Menu */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        user?.profile_picture || "https://github.com/shadcn.png"
                      }
                      alt="User Avatar"
                    />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/dashboard/account"
                    className="flex items-center py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="mr-3 h-4 w-4" />
                    <span>{t("userMenu.profile")}</span>
                  </Link>

                  <Link
                    href="/dashboard/chat"
                    className="flex items-center py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageCircle className="mr-3 h-4 w-4" />
                    <span>{t("chat")}</span>
                  </Link>

                  <Link
                    href="/dashboard/wallet"
                    className="flex items-center py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Wallet className="mr-3 h-4 w-4" />
                    <span>{t("wallet")}</span>
                  </Link>

                  <Link
                    href="/dashboard/admin/widget"
                    className="flex items-center py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Puzzle className="mr-3 h-4 w-4" />
                    <span>Widget Management</span>
                  </Link>

                  <button className="flex items-center py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{t("userMenu.logOut")}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
