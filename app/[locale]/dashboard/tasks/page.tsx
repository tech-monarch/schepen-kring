"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { 
  BarChart3, Anchor, CheckSquare, Users, Lock, ShieldAlert, 
  User, Trash2, Clock, Search, AlertCircle, Wifi, WifiOff
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

interface Task {
  id: string | number;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  type: "assigned" | "personal";
  priority: "High" | "Medium" | "Low";
}

export default function TaskManifestPage() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const API_BASE = "http://127.0.0.1:8000/api";

  // --- SYNC LOGIC ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) setUserRole(JSON.parse(storedUser).userType);

    // Track Connection Status
    window.addEventListener("online", () => { setIsOnline(true); processSyncQueue(); });
    window.addEventListener("offline", () => setIsOnline(false));

    const loadInitialData = async () => {
      setLoading(true);
      // 1. Load from Cache immediately for speed
      const cached = localStorage.getItem("task_cache");
      if (cached) setTasks(JSON.parse(cached));

      try {
        const token = localStorage.getItem("auth_token");
        const res = await axios.get(`${API_BASE}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedTasks = res.data.map((t: any) => ({ ...t, type: "assigned" }));
        
        // Merge with personal tasks
        const personal = JSON.parse(localStorage.getItem("personal_tasks") || "[]");
        const finalTasks = [...fetchedTasks, ...personal];
        
        setTasks(finalTasks);
        localStorage.setItem("task_cache", JSON.stringify(finalTasks));
      } catch (err) {
        toast.error("Using offline manifest");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // --- BACKGROUND SYNC PROCESSOR ---
  const processSyncQueue = async () => {
    const queue = JSON.parse(localStorage.getItem("sync_queue") || "[]");
    if (queue.length === 0) return;

    toast.loading("Syncing offline changes...", { id: "sync" });
    const token = localStorage.getItem("auth_token");

    for (const action of queue) {
      try {
        await axios.patch(`${API_BASE}/tasks/${action.id}/status`, 
          { status: action.status },
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } catch (e) { console.error("Sync failed for task", action.id); }
    }

    localStorage.setItem("sync_queue", "[]");
    toast.success("All changes synced with fleet", { id: "sync" });
  };

  // --- SORTING: Undone & High Priority Top ---
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === "Done" && b.status !== "Done") return 1;
      if (a.status !== "Done" && b.status === "Done") return -1;
      const pMap = { "High": 3, "Medium": 2, "Low": 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    });
  }, [tasks]);

  const advanceStatus = async (id: string | number, currentStatus: string, type: string) => {
    const sequence: Task["status"][] = ["To Do", "In Progress", "Done"];
    const nextStatus = sequence[(sequence.indexOf(currentStatus as any) + 1) % sequence.length];

    // 1. Immediate UI Update
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t);
    setTasks(updatedTasks);
    localStorage.setItem("task_cache", JSON.stringify(updatedTasks));

    if (type === "assigned") {
      if (navigator.onLine) {
        try {
          const token = localStorage.getItem("auth_token");
          await axios.patch(`${API_BASE}/tasks/${id}/status`, { status: nextStatus }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          addToQueue(id, nextStatus);
        }
      } else {
        addToQueue(id, nextStatus);
        toast("Saved locally. Will sync when online.", { icon: "💾" });
      }
    } else {
      localStorage.setItem("personal_tasks", JSON.stringify(updatedTasks.filter(t => t.type === "personal")));
    }
  };

  const addToQueue = (id: any, status: string) => {
    const queue = JSON.parse(localStorage.getItem("sync_queue") || "[]");
    queue.push({ id, status, timestamp: Date.now() });
    localStorage.setItem("sync_queue", JSON.stringify(queue));
  };

  const getSidebarItems = () => {
    if (userRole === "Admin") return [
      { title: t("overview"), href: "/dashboard/admin", icon: BarChart3 },
      { title: t("fleet_management"), href: "/dashboard/admin/yachts", icon: Anchor },
      { title: t("task_board"), href: "/dashboard/admin/tasks", icon: CheckSquare },
      { title: t("sections.quickActions"), href: "/dashboard/admin/users", icon: Users },
    ];
    return [
      { title: t("overview"), href: "/dashboard", icon: BarChart3 },
      { title: t("fleet_management"), href: "/dashboard/yachts", icon: Anchor },
      { title: t("task_board"), href: "/dashboard/tasks", icon: CheckSquare },
    ];
  };

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      <DashboardHeader /> 
      <div className="flex pt-20">
        <aside className="w-64 fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:block z-40">
          <nav className="p-4 space-y-2 mt-4">
            <div className="px-4 mb-6 flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Staff Terminal</p>
              {isOnline ? <Wifi size={10} className="text-emerald-500" /> : <WifiOff size={10} className="text-red-500" />}
            </div>
            {getSidebarItems().map((item) => (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                pathname === item.href ? "bg-[#003566] text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
              )}>
                <item.icon size={16} /> {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 lg:ml-64 p-8 bg-white min-h-[calc(100vh-80px)]">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <Toaster position="top-right" />
            
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
              <div>
                <h1 className="text-3xl font-serif italic">Operational Manifest</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mt-2">Vessel Maintenance & Directives</p>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedTasks.map((task) => (
                  <motion.div layout key={task.id} className={cn(
                    "flex flex-col md:flex-row items-center justify-between p-6 gap-6 transition-all border bg-white shadow-sm",
                    task.status !== "Done" && task.priority === "High" ? "border-l-4 border-l-red-500" : "border-slate-200 border-l-4 border-l-[#003566]",
                    task.status === "Done" && "opacity-40 grayscale bg-slate-50"
                  )}>
                    <div className="flex items-center gap-6 flex-1 w-full">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border",
                        task.status !== "Done" && task.priority === "High" ? "bg-red-50 border-red-100 text-red-500" : "bg-slate-50 border-slate-100 text-slate-300"
                      )}>
                        {task.status !== "Done" && task.priority === "High" ? <AlertCircle size={20}/> : <ShieldAlert size={18}/>}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-black uppercase tracking-wider text-[#003566]">{task.title}</h3>
                          {task.status !== "Done" && task.priority === "High" && <span className="px-2 py-0.5 bg-red-600 text-white text-[7px] font-black uppercase">Urgent</span>}
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Ref: {task.id} • {task.priority} Priority</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => advanceStatus(task.id, task.status, task.type)}
                      className={cn(
                        "px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all min-w-[160px]",
                        task.status === "To Do" && "border-slate-200 text-slate-400 hover:bg-[#003566] hover:text-white",
                        task.status === "In Progress" && "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
                        task.status === "Done" && "border-emerald-500 text-emerald-500"
                      )}
                    >
                      {task.status}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}