"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  BarChart3,
  Anchor,
  CheckSquare,
  Users,
  ShieldAlert,
  User,
  Trash2,
  AlertCircle,
  Wifi,
  WifiOff,
  Plus,
  Clock,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight, Code
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
  priority: "Urgent" | "High" | "Medium" | "Low";
  timestamp: number;
  completedAt?: number;
}

export default function TaskManifestPage() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [now, setNow] = useState(Date.now());
  
  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const API_BASE = "https://kring.answer24.nl/api";
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) setUserRole(JSON.parse(storedUser).userType);

    window.addEventListener("online", () => {
      setIsOnline(true);
      processSyncQueue();
    });
    window.addEventListener("offline", () => setIsOnline(false));

    const loadInitialData = async () => {
      setLoading(true);
      const cached = localStorage.getItem("task_cache");
      let currentTasks: Task[] = cached ? JSON.parse(cached) : [];

      try {
        const token = localStorage.getItem("auth_token");
        const res = await axios.get(`${API_BASE}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedTasks = res.data.map((t: any) => ({
          ...t,
          type: "assigned",
          timestamp: t.timestamp || Date.now(),
        }));

        const personal = JSON.parse(localStorage.getItem("personal_tasks") || "[]");
        currentTasks = [...fetchedTasks, ...personal];
        const filteredTasks = currentTasks.filter(task => {
          if (task.status === "Done" && task.completedAt) {
            return Date.now() - task.completedAt < THREE_DAYS_MS;
          }
          return true;
        });
        setTasks(filteredTasks);
        saveToLocalStorage(filteredTasks);
      } catch (err) {
        toast.error("Using offline manifest");
        setTasks(currentTasks);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const saveToLocalStorage = (allTasks: Task[]) => {
    localStorage.setItem("task_cache", JSON.stringify(allTasks));
    localStorage.setItem("personal_tasks", JSON.stringify(allTasks.filter((t) => t.type === "personal")));
  };

  const processSyncQueue = async () => {
    const queue = JSON.parse(localStorage.getItem("sync_queue") || "[]");
    if (queue.length === 0) return;
    const token = localStorage.getItem("auth_token");
    for (const action of queue) {
      try {
        await axios.patch(`${API_BASE}/tasks/${action.id}/status`, { status: action.status }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (e) { console.error(e); }
    }
    localStorage.setItem("sync_queue", "[]");
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === "Done" && b.status !== "Done") return 1;
      if (a.status !== "Done" && b.status === "Done") return -1;
      const pMap = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0) || b.timestamp - a.timestamp;
    });
  }, [tasks]);

  const addPersonalTask = () => {
    const title = prompt("Enter task description:");
    if (!title) return;
    const newTask: Task = {
      id: `p-${Date.now()}`,
      title,
      status: "To Do",
      type: "personal",
      priority: "Medium",
      timestamp: Date.now(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveToLocalStorage(updated);
  };

  const deletePersonalTask = (id: string | number) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveToLocalStorage(updated);
    toast.success("Task removed");
  };

  const advanceStatus = async (id: string | number, currentStatus: string, type: string) => {
    const sequence: Task["status"][] = ["To Do", "In Progress", "Done"];
    const nextStatus = sequence[(sequence.indexOf(currentStatus as any) + 1) % sequence.length];
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, status: nextStatus, completedAt: nextStatus === "Done" ? Date.now() : undefined } : t
    );
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);

    if (type === "assigned") {
      if (navigator.onLine) {
        try {
          const token = localStorage.getItem("auth_token");
          await axios.patch(`${API_BASE}/tasks/${id}/status`, { status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) { addToQueue(id, nextStatus); }
      } else {
        addToQueue(id, nextStatus);
      }
    }
  };

  const addToQueue = (id: any, status: string) => {
    const queue = JSON.parse(localStorage.getItem("sync_queue") || "[]");
    queue.push({ id, status, timestamp: Date.now() });
    localStorage.setItem("sync_queue", JSON.stringify(queue));
  };

  const getSidebarItems = () => {
    return [
      { title: t("overview"), href: userRole === "Admin" ? "/dashboard/admin" : "/dashboard", icon: BarChart3 },
      { title: t("fleet_management"), href: userRole === "Admin" ? "/dashboard/admin/yachts" : "/dashboard/yachts", icon: Anchor },
      { title: t("task_board"), href: userRole === "Admin" ? "/dashboard/admin/tasks" : "/dashboard/tasks", icon: CheckSquare },
    ];
  };

  const getRemainingTime = (completedAt: number) => {
    const diff = THREE_DAYS_MS - (now - completedAt);
    if (diff <= 0) return "Clearing now...";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  const getPriorityStyles = (priority: Task["priority"], status: string) => {
    if (status === "Done") return "border-l-4 border-l-emerald-500 bg-slate-50 opacity-60";
    switch (priority) {
      case "Urgent": return "border-l-4 border-l-red-600 bg-red-50/30";
      case "High": return "border-l-4 border-l-orange-500 bg-orange-50/30";
      case "Medium": return "border-l-4 border-l-blue-500 bg-blue-50/30";
      case "Low": return "border-l-4 border-l-slate-400 bg-slate-50/30";
      default: return "border-l-4 border-l-[#003566]";
    }
  };

  const getIconStyles = (priority: Task["priority"], status: string) => {
    if (status === "Done") return "text-emerald-500 bg-emerald-50 border-emerald-100";
    switch (priority) {
      case "Urgent": return "text-red-600 bg-red-100 border-red-200";
      case "High": return "text-orange-500 bg-orange-100 border-orange-200";
      case "Medium": return "text-blue-500 bg-blue-100 border-blue-200";
      case "Low": return "text-slate-500 bg-slate-100 border-slate-200";
      default: return "text-slate-300 bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      <DashboardHeader />
      <div className="flex pt-20">
              {/* COLLAPSIBLE SIDEBAR */}
              <motion.aside 
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 256 }}
                className="fixed left-0 top-20 bottom-0 border-r border-slate-200 bg-white hidden lg:block z-40 overflow-hidden"
              >
                <div className="flex flex-col h-full relative">
                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute right-3 top-4 bg-[#003566] border border-slate-200 rounded-full p-1 text-slate-400 hover:text-[white] transition-colors z-999 shadow-sm"
                  >
                    {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  </button>
                  <nav className="p-4 space-y-2 mt-4">
                    <div className={cn("px-4 mb-6 flex items-center justify-between transition-opacity", isSidebarCollapsed && "opacity-0")}>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Staff Terminal</p>
                      {isOnline ? <Wifi size={10} className="text-emerald-500" /> : <WifiOff size={10} className="text-red-500" />}
                    </div>
                    {[
                      { title: t("overview"), href: "/dashboard", icon: BarChart3 },
                      { title: t("fleet_management"), href: "/dashboard/yachts", icon: Anchor },
                      { title: t("task_board"), href: "/dashboard/tasks", icon: CheckSquare },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} className={cn("flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group", pathname === item.href ? "bg-[#003566] text-white shadow-md" : "text-slate-400 hover:bg-slate-50", isSidebarCollapsed && "justify-center px-0")}>
                        <item.icon size={16} className="shrink-0" />
                        {!isSidebarCollapsed && <span>{item.title}</span>}
                      </Link>
                    ))}
      
      
        {/* Bottom Action Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <a href="/dashboard/widgets" className="w-full">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 border-2 border-[#003566] text-[#003566] hover:bg-[#003566] hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest transition-all group"
            >
              <Code size={16} className="group-hover:rotate-12 transition-transform" />
              Widget Manager
            </Button>
          </a>
        </div>
                  </nav>
                </div>
              </motion.aside>
      

        {/* MAIN CONTENT AREA */}
        <motion.main 
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-8 bg-white min-h-[calc(100vh-80px)] z-30 -mt-20"
        >
          <div className="max-w-[1600px] mx-auto space-y-6">
            <Toaster position="top-right" />
            <div className="flex justify-between items-end border-b border-slate-100 pb-8 mt-4">
              <div>
                <h1 className="text-3xl font-serif italic text-[#003566]">Operational Manifest</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mt-2">Vessel Maintenance & Directives</p>
              </div>
              <Button 
                onClick={addPersonalTask} 
                className="bg-[#003566] text-white hover:bg-[#003566]/90 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none transition-all shadow-xl"
              >
                <Plus size={14} className="mr-2" /> New Personal Task
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedTasks.map((task) => (
                  <motion.div layout key={task.id} className={cn("flex flex-col md:flex-row items-center justify-between p-6 gap-6 border shadow-sm", task.type === "personal" ? "border-dashed border-2 bg-slate-50/50" : "bg-white", getPriorityStyles(task.priority, task.status))}>
                    <div className="flex items-center gap-6 flex-1 w-full">
                      <div className={cn("w-12 h-12 flex items-center justify-center border", getIconStyles(task.priority, task.status))}>
                        {task.type === "personal" ? <User size={18} /> : 
                         task.status === "Done" ? <CheckSquare size={18} /> : 
                         task.priority === "Urgent" ? <AlertCircle size={20} /> :
                         task.priority === "High" ? <AlertTriangle size={18} /> :
                         task.priority === "Medium" ? <ShieldAlert size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-black uppercase tracking-wider text-[#003566]">{task.title}</h3>
                          {task.type === "personal" && <span className="px-2 py-0.5 bg-blue-100 text-[#003566] text-[7px] font-black uppercase border border-blue-200">Personal</span>}
                          {task.status !== "Done" && task.priority === "Urgent" && (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-[7px] font-black uppercase animate-pulse">Critical</span>
                          )}
                          {task.status === "Done" && (
                            <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100">
                              <Clock size={10} /> {getRemainingTime(task.completedAt!)}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                          Ref: {task.id} • <span className={cn(
                            task.priority === "Urgent" ? "text-red-600" :
                            task.priority === "High" ? "text-orange-500" :
                            task.priority === "Medium" ? "text-blue-500" : "text-slate-400"
                          )}>{task.priority} Priority</span> {task.status === "Done" && "• Clears automatically"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {task.type === "personal" && (
                        <button onClick={() => deletePersonalTask(task.id)} className="p-3 text-red-400 hover:text-red-600 transition-all border border-transparent hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button onClick={() => advanceStatus(task.id, task.status, task.type)} className={cn("flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all min-w-[160px]", task.status === "To Do" && "border-slate-200 text-slate-400 hover:bg-[#003566] hover:text-white", task.status === "In Progress" && "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white", task.status === "Done" && "border-emerald-500 text-emerald-500")}>
                        {task.status}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}