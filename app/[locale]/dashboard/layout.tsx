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

 import { Sidebar } from "@/components/dashboard/Sidebar"; 

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
                 {/* <Sidebar onCollapse={setIsSidebarCollapsed} />    */}

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