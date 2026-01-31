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
import ANSWER24LOGO from "@/public/answerLogobgRemover-removebg-preview.png";

export function PrivateNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const t = useTranslations("Navigation");
  const currentPath = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    // Checking for both standard and admin tokens
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
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6",
        isScrolled 
          ? "h-20 bg-black/40 backdrop-blur-xl border-b border-white/5" 
          : "h-24 bg-transparent"
      )}
    >
      {/* Impersonation Warning Bar */}
      <AnimatePresence>
        {isImpersonating && (
          <motion.div 
            initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 bg-[#c5a572] text-black py-1.5 flex justify-center items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            <RefreshCw size={12} className="animate-spin" />
            Active Session: Impersonating User
            <button onClick={() => {}} className="underline decoration-2 underline-offset-4 ml-2">Exit</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("max-w-[1400px] mx-auto flex items-center justify-between h-full transition-all", isImpersonating && "mt-8")}>
        
        {/* Logo */}
        <Link href="/" className="relative z-10 transition-transform hover:scale-105 active:scale-95">
          {/* <Image
            src={ANSWER24LOGO}
            alt="Logo"
            width={130}
            height={36}
            className="object-contain brightness-0 invert"
            priority
          /> */}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-[#c5a572] transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#c5a572] transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Action Suite */}
        <div className="hidden lg:flex items-center gap-6">
          <LanguageSwitcher />

          {isLoggedIn ? (
            <Link href="/dashboard">
              <button className="flex items-center gap-3 px-8 py-3 bg-[#c5a572] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all group">
                Go to Dashboard
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="px-8 py-3 border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                Employee Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center text-white border border-white/10"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#0a0a0a] z-[150] flex flex-col p-10"
          >
            <div className="flex justify-between items-center mb-20">
              <Image src={ANSWER24LOGO} alt="Logo" width={100} height={30} className="invert brightness-0" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={32} /></button>
            </div>

            <div className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-4xl font-serif italic text-white hover:text-[#c5a572]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#c5a572] text-black font-bold h-14 rounded-none uppercase tracking-widest flex items-center justify-center gap-2">
                    <LayoutDashboard size={18} /> Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full border border-white/20 bg-transparent text-white font-bold h-14 rounded-none uppercase tracking-widest">
                    Employee Login
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}