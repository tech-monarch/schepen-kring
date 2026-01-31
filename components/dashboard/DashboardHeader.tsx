"use client";

import { useState, useEffect } from "react";
import { 
  Anchor, 
  CheckSquare, 
  Users, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ChevronDown,
  LayoutDashboard,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    { title: "Fleet", href: "/dashboard/yachts", icon: Anchor },
    { title: "Task Board", href: "/dashboard/tasks", icon: CheckSquare },
    // { title: "Team", href: "/dashboard/admin/users", icon: Users }, 
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 h-20 flex items-center justify-between",
        isScrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      )}
    >
      {/* Branding & Fast-Search */}
      <div className="flex items-center gap-12">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c5a572] flex items-center justify-center">
            <ShieldCheck className="text-black w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white hidden lg:block">
            Terminal v2.1
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center bg-white/5 border border-white/10 px-4 py-2 gap-3 focus-within:border-[#c5a572] transition-all">
          <Search size={14} className="text-gray-500" />
          <input 
            placeholder="Search vessels or tasks..." 
            className="bg-transparent border-none outline-none text-[10px] uppercase tracking-widest text-white placeholder:text-gray-600 w-64"
          />
        </div>
      </div>

      {/* Primary Navigation Icons */}
      <nav className="hidden lg:flex items-center gap-2">
        {managementItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "px-6 py-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
              currentPath === item.href 
                ? "text-[#c5a572] bg-[#c5a572]/10 border border-[#c5a572]/20" 
                : "text-gray-400 hover:text-white"
            )}
          >
            <item.icon size={14} />
            {item.title}
          </Link>
        ))}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none group">
            <Avatar className="h-9 w-9 border border-white/10 group-hover:border-[#c5a572] transition-all">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AD</AvatarFallback> 
            </Avatar>
            <div className="hidden text-left lg:block">
              <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">Admin Terminal</p>
              <p className="text-[8px] text-[#c5a572] uppercase tracking-tighter mt-1">SuperAdmin</p> 
            </div>
            <ChevronDown size={14} className="text-gray-600 group-hover:text-white transition-all" /> 
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 bg-[#0d0d0d] border border-white/10 text-white rounded-none">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Account</DropdownMenuLabel> 
            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer gap-3 text-xs uppercase tracking-widest py-3">
              <Settings size={14} /> System Settings 
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer gap-3 text-xs uppercase tracking-widest py-3">
              <LogOut size={14} /> Sign Out 
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}