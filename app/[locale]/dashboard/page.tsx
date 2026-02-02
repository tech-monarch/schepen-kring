"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  BarChart3, 
  Anchor, 
  CheckSquare, 
  Users,
  Lock,
  ClipboardList,
  Ship,
  Settings,
  CheckCircle2,
  Clock,
  ChevronRight,
  LayoutDashboard,
  AlertCircle,
  Bell
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";

export default function EmployeeDashboardPage() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("Personnel");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserRole(parsed.userType); // 'Admin', 'Employee', or 'Customer' [cite: 75]
      setUserName(parsed.name);
    }

    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await axios.get(`${API_BASE}/my-tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Task sync failed");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // [cite_start]// Define sidebar items based on role [cite: 76]
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

    return []; //[cite_start]// Customers get an empty list (locked sidebar) [cite: 78]
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
            
           {/* If Customer, show Locked state [cite: 81] */}
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
            <Toaster position="top-right" />
            
            {/* Inner Dashboard Content */}
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
                <div>
                  <h1 className="text-4xl font-serif italic text-[#003566]">Welcome, {userName}</h1>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">
                    Staff Terminal & Operational Overview
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-white border border-slate-200 px-8 py-4 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Bell size={10} className="text-blue-600" /> Active Tasks
                    </p>
                    <p className="text-2xl font-serif italic text-[#003566]">{tasks.length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#003566] flex items-center gap-2">
                    <ClipboardList size={16} className="text-blue-600" /> Assigned Manifest
                  </h2>

                  <div className="space-y-4">
                    {loading ? (
                      <div className="h-40 flex items-center justify-center border border-dashed border-slate-200 bg-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Syncing manifest...</p>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="bg-white border border-slate-100 p-16 text-center shadow-sm">
                        <CheckCircle2 size={32} className="mx-auto text-emerald-300 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Clear: No Pending Operations</p>
                      </div>
                    ) : (
                      tasks.map((task: any) => (
                        <div key={task.id} className="bg-white border border-slate-200 p-6 flex items-center justify-between group hover:border-blue-300 transition-all shadow-sm">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-12 h-12 border flex items-center justify-center transition-colors",
                              task.status === "In Progress" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-slate-100 text-slate-300"
                            )}>
                              {task.status === "In Progress" ? <Clock size={20} /> : <Anchor size={20} />}
                            </div>
                            <div>
                              <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-700">{task.title}</h4>
                              <p className="text-[9px] text-slate-400 font-medium italic mt-1">Due: {task.deadline}</p>
                            </div>
                          </div>
                          <Link href="/dashboard/tasks">
                            <Button variant="ghost" className="text-slate-300 group-hover:text-blue-600">
                              <ChevronRight size={18} />
                            </Button>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#003566] flex items-center gap-2">
                    <LayoutDashboard size={16} className="text-blue-600" /> Quick Access
                  </h2>
                  <div className="grid grid-cols-1 gap-5">
                    <Link href="/dashboard/yachts">
                      <div className="bg-[#003566] p-10 text-white group cursor-pointer relative overflow-hidden transition-all hover:shadow-xl">
                        <Ship className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-4 text-blue-300">Inventory</p>
                        <h3 className="text-2xl font-serif italic mb-8 text-left">The Yacht List</h3>
                        <div className="flex items-center text-[8px] font-black uppercase tracking-[0.2em] border-t border-white/10 pt-5">
                          Fleet Access <ChevronRight size={12} className="ml-1" />
                        </div>
                      </div>
                    </Link>

                    <Link href="/dashboard/tasks">
                      <div className="bg-white border border-slate-200 p-8 group cursor-pointer hover:border-[#003566] transition-all shadow-sm">
                        <Settings className="text-slate-300 group-hover:text-[#003566] mb-6 transition-colors" size={24} />
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Operations</p>
                        <h3 className="text-xl font-serif italic text-[#003566]">Fleet Task Board</h3>
                        <p className="text-[10px] text-slate-400 mt-3 uppercase font-medium">Update vessel logistics status.</p>
                      </div>
                    </Link>

                    <div className="p-6 bg-slate-50 border border-slate-100">
                      <div className="flex gap-4">
                        <AlertCircle size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[8px] text-slate-400 leading-relaxed uppercase font-medium tracking-wider">
                          Staff Identity Verified. Activity is monitored for security and fleet safety.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}