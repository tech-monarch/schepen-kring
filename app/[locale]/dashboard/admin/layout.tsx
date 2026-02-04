"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  BarChart3, 
  Anchor, 
  CheckSquare, 
  Users,
  ChevronLeft,
  ChevronRight,
  Code,
  Wifi,
  WifiOff
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Role detection
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserRole(parsed.userType);
    }

    // Connectivity detection
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
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
    return [
      { title: t("overview"), href: "/dashboard", icon: BarChart3 },
      { title: t("fleet_management"), href: "/dashboard/yachts", icon: Anchor },
      { title: t("task_board"), href: "/dashboard/tasks", icon: CheckSquare },
    ];
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#003566]">
      <DashboardHeader /> 
      
      <div className="flex pt-20">
        {/* COLLAPSIBLE SIDEBAR */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 80 : 256 }}
          className="fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:block z-40 overflow-hidden"
        >
          <div className="flex flex-col h-full relative">
            {/* Toggle Button */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute right-3 top-4 bg-[#003566] border border-slate-200 rounded-full p-1 text-slate-400 hover:text-white transition-colors z-50 shadow-sm"
            >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <nav className="p-4 space-y-2 mt-4 flex-1">
              {/* Terminal Label & Status */}
              <div className={cn(
                "px-4 mb-6 flex items-center justify-between transition-opacity duration-300", 
                isSidebarCollapsed && "opacity-0 pointer-events-none"
              )}>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
                  {userRole === "Admin" ? t("admin_label") : "Staff Terminal"}
                </p>
                {isOnline ? (
                  <Wifi size={10} className="text-emerald-500 animate-pulse" />
                ) : (
                  <WifiOff size={10} className="text-red-500" />
                )}
              </div>

              {/* Dynamic Navigation Items */}
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group rounded-md",
                      isActive 
                        ? "bg-[#003566] text-white shadow-md" 
                        : "text-slate-400 hover:bg-slate-50 hover:text-[#003566]",
                      isSidebarCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon size={16} className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-[#003566]")} />
                    {!isSidebarCollapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {item.title}
                      </motion.span>
                    )}
                    
                    {/* Tooltip for Collapsed State */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-16 bg-[#003566] text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50 pointer-events-none">
                        {item.title}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Action Button */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Link href="/dashboard/widgets" className="w-full">
                <Button 
                    variant="outline" 
                    className={cn(
                        "w-full justify-start gap-3 border-2 border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest transition-all group",
                        isSidebarCollapsed && "justify-center px-0 gap-0 border-none bg-transparent hover:bg-transparent hover:text-blue-600"
                    )}
                >
                    <Code size={16} className="shrink-0 group-hover:rotate-12 transition-transform" />
                    {!isSidebarCollapsed && <span>Widget Manager</span>}
                </Button>
              </Link>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <motion.main 
          initial={false}
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
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