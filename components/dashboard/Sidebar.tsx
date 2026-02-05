"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Anchor, 
  CheckSquare, 
  Code, 
  Users, 
  Ship, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Wifi,
  WifiOff,
  Settings
} from "lucide-react";

export function Sidebar({ onCollapse }: { onCollapse?: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Sync collapse state with parent page for layout adjustments
  useEffect(() => {
    onCollapse?.(isCollapsed);
  }, [isCollapsed, onCollapse]);

  useEffect(() => {
    // 1. Check Online Status
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // 2. Read User Role from LocalStorage
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserRole(parsed.userType || "Customer");
      } catch (e) { console.error("Auth Data Corrupt", e); }
    }

    return () => {
        window.removeEventListener("online", updateStatus);
        window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // --- MENU CONFIGURATION ---
const menuItems = [
    // 1. DASHBOARD
    { 
      title: "Overview", 
      href: userRole === "Admin" ? "/dashboard/admin" : "/dashboard", 
      icon: BarChart3, 
      roles: ["Admin", "Employee", "Partner"] 
    },
    // 2. FLEET
    { 
      title: "Fleet Management", 
      href: userRole === "Admin" ? "/dashboard/admin/yachts" : "/dashboard/yachts", 
      icon: Anchor, 
      roles: ["Admin", "Employee"] 
    },
    // 3. TASKS
    { 
      title: "Task Board", 
      href: userRole === "Admin" ? "/dashboard/admin/tasks" : "/dashboard/tasks", 
      icon: CheckSquare, 
      roles: ["Admin", "Employee"] 
    },
    // 4. USERS
    { 
      title: "User Registry", 
      href: "/dashboard/admin/users", 
      icon: Users, 
      roles: ["Admin"] 
    },
    // 5. PARTNER BOATS
    { 
      title: "My Boats", 
      href: "/dashboard/partner/boats", 
      icon: Ship, 
      roles: ["Partner"] 
    },
    // 6. WIDGETS
    { 
      title: "Widget Manager", 
      href: "/dashboard/widgets", 
      icon: Code, 
      roles: ["Admin", "Partner"] 
    },
  ];

  // Filter items based on the current user's role
  const visibleItems = menuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:block z-40 overflow-hidden shadow-sm"
    >
      <div className="flex flex-col h-full relative">
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-3 top-4 bg-[#003566] border border-slate-200 rounded-full p-1 text-slate-400 hover:text-white transition-colors z-50 shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Status Header */}
        <nav className="p-4 space-y-2 mt-4 flex-1">
          <div className={cn("px-4 mb-6 flex items-center justify-between transition-opacity", isCollapsed && "opacity-0")}>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
              {userRole ? `${userRole} Terminal` : "Loading..."}
            </p>
            {isOnline ? <Wifi size={10} className="text-emerald-500" /> : <WifiOff size={10} className="text-red-500" />}
          </div>

          {/* Render Links */}
          {visibleItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                pathname === item.href ? "bg-[#003566] text-white shadow-md" : "text-slate-400 hover:bg-slate-50",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon size={16} className="shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
           <button 
              onClick={() => {
                  if(confirm("Terminate Session?")) {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user_data");
                    window.location.href = "/login";
                  }
              }}
              className={cn(
                  "w-full flex items-center gap-3 border-2 border-red-100 text-red-400 hover:bg-red-50 p-3 rounded-none font-black uppercase text-[10px] tracking-widest transition-all",
                  isCollapsed && "justify-center px-0 gap-0 border-none"
              )}
          >
              <LogOut size={16} className="shrink-0" />
              {!isCollapsed && <span>Terminate Session</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}