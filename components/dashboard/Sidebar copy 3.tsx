"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import axios from "axios"; // Added axios for live sync
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
  WifiOff
} from "lucide-react";

export function Sidebar({ onCollapse }: { onCollapse?: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]); // Array for DB permissions
  const [isOnline, setIsOnline] = useState(true);

  const API_BASE = "https://schepen-kring.nl/api"; // Update if your local dev URL is different

  // Sync collapse state with parent page
  useEffect(() => {
    onCollapse?.(isCollapsed);
  }, [isCollapsed, onCollapse]);

  useEffect(() => {
    // 1. Check Online Status
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // 2. Read User Info and Fetch Live Permissions
    const userDataStr = localStorage.getItem("user_data");
    const token = localStorage.getItem("auth_token");

    if (userDataStr && token) {
      try {
        const parsed = JSON.parse(userDataStr);
        setUserRole(parsed.userType || "Customer");

        // CRITICAL: Fetch permissions directly from the new table
        const syncPermissions = async () => {
          try {
            const res = await axios.get(`${API_BASE}/user/authorizations/${parsed.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserPermissions(res.data); // e.g. ["manage yachts", "manage tasks"]
          } catch (err) {
            console.error("Authorization sync failed", err);
          }
        };

        syncPermissions();
      } catch (e) { console.error("Auth Data Corrupt", e); }
    }

    return () => {
        window.removeEventListener("online", updateStatus);
        window.removeEventListener("offline", updateStatus);
    };
  }, [pathname]); // Refresh on navigation to keep rights up to date

  // --- MENU CONFIGURATION ---
  const menuItems = [
    { 
      title: "Overview", 
      href: userRole === "Admin" ? "/dashboard/admin" : "/dashboard", 
      icon: BarChart3, 
      roles: ["Admin", "Employee", "Partner"] 
    },
    { 
      title: "Fleet Management", 
      href: userRole === "Admin" ? "/dashboard/admin/yachts" : "/dashboard/yachts", 
      icon: Anchor, 
      roles: ["Admin", "Employee"],
      permission: "manage yachts" 
    },
    { 
      title: "Task Board", 
      href: userRole === "Admin" ? "/dashboard/admin/tasks" : "/dashboard/tasks", 
      icon: CheckSquare, 
      roles: ["Admin", "Employee"],
      permission: "manage tasks" 
    },
    { 
      title: "User Registry", 
      href: "/dashboard/admin/users", 
      icon: Users, 
      roles: ["Admin"],
      permission: "manage users" 
    },
    { 
      title: "My Boats", 
      href: "/dashboard/partner/boats", 
      icon: Ship, 
      roles: ["Partner"] 
    },
    { 
      title: "Widget Manager", 
      href: "/dashboard/widgets", 
      icon: Code, 
      roles: ["Admin", "Partner"] 
    },
  ];

  // Logic: Only show if role matches AND (if permission required) user has permission
  const visibleItems = menuItems.filter(item => {
    const hasRole = userRole && item.roles.includes(userRole);
    
    // Admins see everything they are allowed by role; Employees check the permissions array
    const hasPermission = userRole === "Admin" || (item.permission ? userPermissions.includes(item.permission) : true);

    return hasRole && hasPermission;
  });

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:block z-40 overflow-hidden shadow-sm"
    >
      <div className="flex flex-col h-full relative">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-3 top-4 bg-[#003566] border border-slate-200 rounded-full p-1 text-slate-400 hover:text-white transition-colors z-50 shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className="p-4 space-y-2 mt-4 flex-1">
          <div className={cn("px-4 mb-6 flex items-center justify-between transition-opacity", isCollapsed && "opacity-0")}>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
              {userRole ? `${userRole} Terminal` : "Loading..."}
            </p>
            {isOnline ? <Wifi size={10} className="text-emerald-500" /> : <WifiOff size={10} className="text-red-500" />}
          </div>

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

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
           <button 
              onClick={() => {
                  if(confirm("Terminate Session?")) {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user_data");
                    localStorage.removeItem("task_cache");
                    localStorage.removeItem("personal_tasks");
                    window.location.href = "/";
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