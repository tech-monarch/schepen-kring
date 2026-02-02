"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, RefreshCw, LayoutDashboard, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ANSWER24LOGO from "@/public/schepenkring-logo.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const t = useTranslations("Navigation");
  const currentPath = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const adminToken = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    setIsLoggedIn(!!token);
    setIsImpersonating(!!adminToken);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPath]);

  const navItems = [
    { name: t("home"), href: "/" },
    { name: t("yacht"), href: "/yacht" },
    { name: t("blog"), href: "/blog" },
    { name: t("faq"), href: "/faq" },
    { name: t("contact"), href: "/contact" },
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-8",
        isScrolled
          ? "h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm"
          : "h-28 bg-white/50 backdrop-blur-[2px] border-b border-[#003566]/5", // Subtle glass on light backgrounds
      )}
    >
      {/* Impersonation Warning Bar */}
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

      <div className={cn(
        "max-w-[1500px] mx-auto flex items-center justify-between h-full transition-all",
        isImpersonating && "mt-10"
      )}>
        
        {/* LOGO - ALWAYS DARK/VISIBLE ON WHITE BG */}
        <Link href="/" className="relative z-10 transition-transform hover:scale-[1.02]">
          <Image
            src={ANSWER24LOGO}
            alt="Logo"
            width={160}
            height={45}
            className="object-contain brightness-100" // Keep original colors since BG is white
            priority
          />
        </Link>

        {/* Desktop Nav - Dark text for white BG */}
        <nav className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-[10px] font-sans font-black uppercase tracking-[0.4em] transition-all relative group",
                "text-[#003566]/60 hover:text-[#003566]" // Darker palette for visibility
              )}
            >
              {item.name}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#003566] transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Action Suite */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="font-sans text-[10px] font-black tracking-widest text-[#003566]">
            <LanguageSwitcher />
          </div>

          {isLoggedIn ? (
            <Link href="/dashboard">
              <button className="flex items-center gap-3 px-10 py-3.5 bg-[#003566] text-white text-[9px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-[#001d3d] transition-all">
                Portal
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="px-10 py-3.5 border border-[#003566] text-[#003566] text-[9px] font-sans font-bold uppercase tracking-[0.3em] hover:bg-[#003566] hover:text-white transition-all duration-500">
                Employee Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden w-12 h-12 flex items-center justify-center text-[#003566]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
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
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#003566]">
                <X size={35} strokeWidth={1} />
              </button>
            </div>

            <div className="flex flex-col gap-10">
              {navItems.map((item, i) => (
                <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
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
               <div className="py-8 border-t border-slate-100"><LanguageSwitcher /></div>
               <Link href={isLoggedIn ? "/dashboard" : "/login"} onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-[#003566] text-white font-sans font-bold h-16 rounded-none uppercase tracking-[0.3em]">
                  {isLoggedIn ? "Access Dashboard" : "Client Portal Login"}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}