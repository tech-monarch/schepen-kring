"use client";

import { useState, useEffect } from "react";
import { 
  Anchor, 
  CheckSquare, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Bell,
  ChevronDown,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; 
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const currentPath = usePathname(); 

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const managementItems = [
    { title: "Fleet", href: "/yachts", icon: Anchor },
    // { title: "Task Board", href: "/dashboard/tasks", icon: CheckSquare },
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8 h-20 flex items-center justify-between",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm" 
          : "bg-white border-b border-slate-100"
      )}
    >
      {/* Branding & Fast-Search */}
      <div className="flex items-center gap-12">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-[#003566] flex items-center justify-center rounded-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#003566]">
              Fleet Command
            </span>
            <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-slate-400">
              System v2.1
            </span>
          </div>
        </Link>

        {/* Global Search Bar - Clean Light Theme */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 px-4 py-2.5 gap-3 focus-within:border-[#003566] focus-within:bg-white transition-all">
          <Search size={14} className="text-slate-400" />
          <input 
            placeholder="Search vessels or tasks..." 
            className="bg-transparent border-none outline-none text-[10px] uppercase tracking-widest text-[#003566] placeholder:text-slate-400 w-64 font-medium"
          />
        </div>
      </div>

      {/* Primary Navigation Icons */}
      <nav className="hidden lg:flex items-center gap-3">
        {managementItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "px-6 py-2.5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-sm",
              currentPath === item.href 
                ? "text-white bg-[#003566] shadow-lg shadow-blue-900/10" 
                : "text-slate-500 hover:text-[#003566] hover:bg-slate-50"
            )}
          >
            <item.icon size={14} strokeWidth={currentPath === item.href ? 3 : 2} />
            {item.title}
          </Link>
        ))}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-8">
        <button className="relative text-slate-400 hover:text-[#003566] transition-colors">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-4 outline-none group">
            <div className="hidden text-right lg:block">
              <p className="text-[10px] font-bold text-[#003566] uppercase tracking-wider leading-none">Admin Terminal</p>
              <p className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter mt-1">Super Admin</p> 
            </div>
            <Avatar className="h-10 w-10 border-2 border-slate-100 group-hover:border-[#003566] transition-all duration-300">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-slate-100 text-[#003566] text-xs font-bold">AD</AvatarFallback> 
            </Avatar>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-[#003566] transition-all" /> 
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64 bg-white border border-slate-200 text-[#003566] rounded-none p-2 shadow-xl shadow-blue-900/5">
            <DropdownMenuLabel className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold px-3 py-2">Account Management</DropdownMenuLabel> 
            <DropdownMenuItem className="hover:bg-slate-50 cursor-pointer gap-3 text-[10px] font-bold uppercase tracking-widest py-3 px-3">
              <Settings size={14} /> System Settings 
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="text-red-500 hover:bg-red-50 cursor-pointer gap-3 text-[10px] font-bold uppercase tracking-widest py-3 px-3">
              <LogOut size={14} /> Sign Out 
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}