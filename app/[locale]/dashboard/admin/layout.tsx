"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  BarChart3, 
  Anchor, 
  CheckSquare, 
  Users,
  Lock,
  ChevronLeft,
  ChevronRight,
  Code2,
  ShieldCheck,
  Settings
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserRole(parsed.userType);
    }
  }, []);

  const getSidebarItems = () => {
    if (userRole === "Admin") {
      return [
        { title: t("overview"), href: "/dashboard/admin", icon: BarChart3 },
        { title: t("fleet_management"), href: "/dashboard/admin/yachts", icon: Anchor },
        { title: t("task_board"), href: "/dashboard/admin/tasks", icon: CheckSquare },
        { title: t("sections.quickActions"), href: "/dashboard/admin/users", icon: Users },
      ];
    } 
    if (userRole === "Employee") {
      return [
        { title: t("overview"), href: "/dashboard", icon: BarChart3 },
        { title: t("fleet_management"), href: "/dashboard/yachts", icon: Anchor },
        { title: t("task_board"), href: "/dashboard/tasks", icon: CheckSquare },
      ];
    }
    return [];
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#003566]">
      <DashboardHeader /> 
      
      <div className="flex pt-20">
        {/* Sidebar Container */}
        <motion.aside 
          initial={false}
          animate={{ width: isCollapsed ? 80 : 260 }}
          className="fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:flex flex-col z-40 shadow-sm transition-all duration-300"
        >
          {/* Toggle Button - Corrected Positioning */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-[#003566] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-[51]"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Label / Role Header */}
          <div className="px-6 py-6 h-16 flex items-center overflow-hidden">
             <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.p 
                    key="label"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 whitespace-nowrap"
                  >
                    {userRole === "Admin" ? t("admin_label") : "Staff Terminal"}
                  </motion.p>
                ) : (
                  <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto">
                    <ShieldCheck size={18} className="text-slate-200" />
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
            {userRole === "Customer" ? (
              <div className="py-10 flex flex-col items-center text-center px-4">
                <Lock size={20} className="text-slate-200 mb-4" />
                {!isCollapsed && <p className="text-[10px] font-bold uppercase text-slate-300">Terminal Locked</p>}
              </div>
            ) : (
              sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center h-11 px-3 rounded-md transition-all group relative",
                      isActive 
                        ? "bg-[#003566] text-white shadow-md" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#003566]"
                    )}
                  >
                    <item.icon size={18} className={cn("shrink-0", isActive ? "text-white" : "text-slate-400")} />
                    {!isCollapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-4 text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                        {item.title}
                      </motion.span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-14 bg-[#003566] text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                        {item.title}
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* Bottom Action Area (The "Properly Put" Button) */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1">
            <button className="w-full flex items-center h-11 px-3 text-blue-600 hover:bg-blue-50 transition-colors group relative rounded-md">
              <Code2 size={18} className="shrink-0" />
              {!isCollapsed && (
                <span className="ml-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  Partner Embed
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-14 bg-blue-600 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                  Embed Tool
                </div>
              )}
            </button>

            <button className="w-full flex items-center h-11 px-3 text-slate-400 hover:text-[#003566] transition-colors group relative rounded-md">
              <Settings size={18} className="shrink-0" />
              {!isCollapsed && (
                <span className="ml-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  Settings
                </span>
              )}
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area - Margin syncs with sidebar width */}
        <motion.main 
          initial={false}
          animate={{ marginLeft: isCollapsed ? 80 : 260 }}
          className="flex-1 p-8 bg-[#FAFAFA] min-h-[calc(100vh-80px)] transition-all duration-300"
        >
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}