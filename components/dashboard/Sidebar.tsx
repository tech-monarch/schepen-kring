"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import axios from "axios";
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
  FileText,
  Gavel,
  Calendar,
  Settings
} from "lucide-react";

type PermissionValue = 0 | 1 | 2;

interface PagePermission {
  page_key: string;
  page_name: string;
  permission_value: PermissionValue;
}

export function Sidebar({ onCollapse }: { onCollapse?: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPagePermissions, setUserPagePermissions] = useState<PagePermission[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  const API_BASE = "https://schepen-kring.nl/api";

  // Sync collapse state with parent page
  useEffect(() => {
    onCollapse?.(isCollapsed);
  }, [isCollapsed, onCollapse]);

  useEffect(() => {
    // Check Online Status
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // Read User Info and Fetch Page Permissions
    const userDataStr = localStorage.getItem("user_data");
    const token = localStorage.getItem("auth_token");

    if (userDataStr && token) {
      try {
        const parsed = JSON.parse(userDataStr);
        console.log("Parsed user data:", parsed); // Debug
        
        // Support both 'role' and 'userType' fields
        const role = parsed.role || parsed.userType || "Customer";
        setUserRole(role);
        setUserId(parsed.id);

        // Fetch page permissions from the new system
        const fetchPagePermissions = async () => {
          try {
            const res = await axios.get(`${API_BASE}/users/${parsed.id}/page-permissions`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Fetched permissions:", res.data); // Debug
            setUserPagePermissions(res.data);
          } catch (err) {
            console.error("Failed to fetch page permissions", err);
            // If endpoint doesn't exist yet, use empty array
            setUserPagePermissions([]);
          }
        };

        fetchPagePermissions();
      } catch (e) { 
        console.error("Auth Data Corrupt", e); 
      }
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [pathname]);

  // Helper function to check if a page should be shown
  const shouldShowPage = (pageKey: string, itemRoles: string[]): boolean => {
    // If no user role, don't show
    if (!userRole) return false;
    
    // Find the permission for this page
    const pagePermission = userPagePermissions.find(p => p.page_key === pageKey);
    
    // If no specific permission found, check if user has the required role
    if (!pagePermission) {
      return itemRoles.includes(userRole);
    }
    
    // Use the permission value
    switch (pagePermission.permission_value) {
      case 1: // Explicitly show
        return true;
      case 2: // Explicitly hide
        return false;
      case 0: // Use default (role-based)
      default:
        return itemRoles.includes(userRole);
    }
  };

  // --- MENU CONFIGURATION ---
  // Each page now has a page_key that matches the backend
  const menuItems = [
    { 
      title: "Overview", 
      href: userRole === "Admin" ? "/dashboard/admin" : "/dashboard", 
      icon: BarChart3, 
      roles: ["Admin", "Employee"],
      page_key: "dashboard"
    },
    { 
      title: "Harbor", 
      href: userRole === "Partner" ? "/dashboard/harbor" : "/dashboard/harbor", 
      icon: BarChart3, 
      roles: ["Partner", "Seller"],
      page_key: "dashboard"
    },
    
  {
    title: "Harbor Users",
    href: "/dashboard/partner/users",
    icon: Users,
    roles: ["Partner"],
    page_key: "harbor_users" // optional, for permission control
  },
    { 
      title: "Tasks", 
      href: userRole === "Admin" ? "/dashboard/tasks" : "/dashboard/tasks", 
      icon: CheckSquare, 
      roles: ["Admin", "Employee"],
      page_key: "tasks"
    },
    { 
      title: "Tasks", 
      href:  "/dashboard/partner/tasks", 
      icon: CheckSquare, 
      roles: ["Seller"],
      page_key: "tasks"
    },
    { 
      title: "Assign Tasks", 
      href: userRole === "Admin" ? "/dashboard/admin/tasks" : "/dashboard/admin/tasks", 
      icon: Calendar, 
      roles: ["Admin", "Employee"],
      page_key: "assign_tasks"
    },
    { 
      title: "View Users", 
      href: "/dashboard/admin/users", 
      icon: Users, 
      roles: ["Admin", "Employee"],
      page_key: "view_users"
    },
    { 
      title: "Yachts", 
      href: userRole === "Admin" ? "/dashboard/admin/yachts" : "/dashboard/yachts", 
      icon: Anchor, 
      roles: ["Admin", "Employee"],
      page_key: "yachts"
    },
    { 
      title: "Fleets", 
      href: userRole === "Admin" ? "/yachts" : "/yachts", 
      icon: Anchor, 
      roles: ["Admin", "Employee", "Customer"],
      page_key: "manage_yachts"
    },
    { 
      title: "Biddings", 
      href: userRole === "Admin" ? "/dashboard/admin/biddings" : "/dashboard/biddings", 
      icon: Gavel, 
      roles: ["Admin", "Employee"],
      page_key: "biddings"
    },
    { 
      title: "Blog", 
      href: userRole === "Admin" ? "/dashboard/admin/blog" : "/dashboard/blog", 
      icon: FileText, 
      roles: ["Admin", "Employee"],
      page_key: "blog"
    },
    { 
      title: "Faqs", 
      href: userRole === "Admin" ? "/dashboard/admin/faq" : "/dashboard/faq", 
      icon: FileText, 
      roles: ["Admin", "Employee"],
      page_key: "faq"
    },
    { 
      title: "System Audits", 
      href: userRole === "Admin" ? "/dashboard/admin/audit" : "/dashboard/admin/audit", 
      icon: FileText, 
      roles: ["Admin"],
      page_key: "logs"
    },
    { 
      title: "Train AI", 
      href: userRole === "Admin" ? "/dashboard/admin/ai" : "/dashboard/admin/ai", 
      icon: FileText, 
      roles: ["Admin"],
      page_key: "dashboard"
    },
    { 
      title: "My Boats", 
      href: "/dashboard/partner", 
      icon: Ship, 
      roles: ["Partner", "Seller"],
      page_key: "partner_boats"
    },
    { 
      title: "Account Settings", 
      href: "/dashboard/account", 
      icon: Settings, 
      roles: ["Admin", "Employee", "Partner", "Customer", "Seller"],
      page_key: "settings"
    },
  ];

  // Filter menu items based on role AND page permissions
  const visibleItems = menuItems.filter(item => {
    // Check if user has required role
    const hasRole = userRole && item.roles.includes(userRole);
    if (!hasRole) return false;

    // Check page permission if page_key exists
    if (item.page_key) {
      return shouldShowPage(item.page_key, item.roles);
    }

    // If no page_key specified, show by default for allowed roles
    return true;
  });

  // For debugging: show current permissions
  useEffect(() => {
    console.log("=== SIDEBAR DEBUG ===");
    console.log("User Role:", userRole);
    console.log("User ID:", userId);
    console.log("Page Permissions:", userPagePermissions);
    console.log("Menu Items:", menuItems.length);
    console.log("Visible Items:", visibleItems.length);
    
    // Show what items are visible and why
    if (userRole) {
      const visibilityReport = menuItems.map(item => {
        const hasRole = item.roles.includes(userRole);
        const permission = userPagePermissions.find(p => p.page_key === item.page_key);
        const shouldShow = item.page_key ? shouldShowPage(item.page_key, item.roles) : true;
        
        return {
          title: item.title,
          page_key: item.page_key,
          hasRole,
          permission: permission ? `${permission.permission_value} (${permission.permission_value === 1 ? 'show' : permission.permission_value === 2 ? 'hide' : 'default'})` : 'none',
          shouldShow,
          visible: visibleItems.includes(item)
        };
      });
      
      console.log("Visibility Report:", visibilityReport);
      console.log("Visible Items Titles:", visibleItems.map(item => item.title));
    }
  }, [userRole, userId, userPagePermissions, visibleItems]);

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

          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            const permission = userPagePermissions.find(p => p.page_key === item.page_key);
            
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                  isActive ? "bg-[#003566] text-white shadow-md" : "text-slate-400 hover:bg-slate-50",
                  isCollapsed && "justify-center px-0"
                )}
                title={item.title}
              >
                <item.icon size={16} className="shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    {permission && permission.permission_value !== 0 && (
                      <span className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded",
                        permission.permission_value === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {permission.permission_value === 1 ? "✓" : "✗"}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Permission indicator dot for collapsed sidebar */}
                {isCollapsed && permission && permission.permission_value !== 0 && (
                  <div className={cn(
                    "absolute top-1 right-1 w-1.5 h-1.5 rounded-full",
                    permission.permission_value === 1 ? "bg-green-500" : "bg-red-500"
                  )} />
                )}
              </Link>
            );
          })}
          
          {/* Show message if no items are visible */}
          {visibleItems.length === 0 && userRole && (
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                No pages available
              </p>
              <p className="text-[8px] text-slate-300 mt-1">
                Check your permissions
              </p>
            </div>
          )}
        </nav>

          {/* <div className="p-4 border-t border-slate-100 bg-slate-50/50">
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
          </div> */}
      </div>
    </motion.aside>
  );
}