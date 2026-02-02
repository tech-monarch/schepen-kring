"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  BarChart3, 
  Anchor, 
  CheckSquare, 
  Users,
  Lock
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserRole(parsed.userType); // 'Admin', 'Employee', or 'Customer'
    }
  }, []);

  // Define sidebar items based on role
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
        // Employees do not get the 'Users' management tab
      ];
    }

    return []; // Customers get an empty list (locked sidebar)
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#003566]">
      <DashboardHeader /> 
      
      <div className="flex pt-20">
        <aside className="w-64 fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:block overflow-y-auto z-40 shadow-sm">
          <nav className="p-4 space-y-2 mt-4">
            <p className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">
              {userRole === "Admin" ? t("admin_label") : userRole === "Employee" ? "Staff Terminal" : "Guest Access"}
            </p>
            
            {/* If Customer, show Locked state */}
            {userRole === "Customer" ? (
              <div className="px-4 py-10 flex flex-col items-center text-center">
                <Lock size={20} className="text-slate-200 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 leading-relaxed">
                  Terminal Locked <br/> for Client Identity
                </p>
              </div>
            ) : (
              sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                    pathname === item.href 
                      ? "bg-[#003566] text-white shadow-lg shadow-blue-900/10" 
                      : "text-slate-400 hover:text-[#003566] hover:bg-slate-50"
                  )}
                >
                  <item.icon size={16} className={cn(
                    pathname === item.href ? "text-white" : "text-slate-300"
                  )} />
                  {item.title}
                </Link>
              ))
            )}
          </nav>
        </aside>

        <main className="flex-1 lg:ml-64 p-8 bg-[#FAFAFA] min-h-[calc(100vh-80px)]">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}