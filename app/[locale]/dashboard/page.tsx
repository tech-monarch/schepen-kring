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
  TrendingUp,
  ChevronLeft,
  ChevronRight,
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

  const API_BASE = "https://schepen-kring.nl/api";
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

        const personal = JSON.parse(
          localStorage.getItem("personal_tasks") || "[]",
        );
        currentTasks = [...fetchedTasks, ...personal];

        const filteredTasks = currentTasks.filter((task) => {
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

  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Done").length;
    const urgent = tasks.filter(
      (t) => t.priority === "Urgent" && t.status !== "Done",
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, urgent, percent };
  }, [tasks]);

  const saveToLocalStorage = (allTasks: Task[]) => {
    localStorage.setItem("task_cache", JSON.stringify(allTasks));
    localStorage.setItem(
      "personal_tasks",
      JSON.stringify(allTasks.filter((t) => t.type === "personal")),
    );
  };

  const processSyncQueue = async () => {
    const queue = JSON.parse(localStorage.getItem("sync_queue") || "[]");
    if (queue.length === 0) return;
    const token = localStorage.getItem("auth_token");
    for (const action of queue) {
      try {
        await axios.patch(
          `${API_BASE}/tasks/${action.id}/status`,
          { status: action.status },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem("sync_queue", "[]");
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === "Done" && b.status !== "Done") return 1;
      if (a.status !== "Done" && b.status === "Done") return -1;
      const pMap = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return (
        (pMap[b.priority] || 0) - (pMap[a.priority] || 0) ||
        b.timestamp - a.timestamp
      );
    });
  }, [tasks]);

  const advanceStatus = async (
    id: string | number,
    currentStatus: string,
    type: string,
  ) => {
    const sequence: Task["status"][] = ["To Do", "In Progress", "Done"];
    const nextStatus =
      sequence[(sequence.indexOf(currentStatus as any) + 1) % sequence.length];

    const updatedTasks = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === "Done" ? Date.now() : undefined,
          }
        : t,
    );

    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);

    if (type === "assigned") {
      if (navigator.onLine) {
        try {
          const token = localStorage.getItem("auth_token");
          await axios.patch(
            `${API_BASE}/tasks/${id}/status`,
            { status: nextStatus },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } catch (err) {
          addToQueue(id, nextStatus);
        }
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

  const getPriorityStyles = (priority: Task["priority"], status: string) => {
    if (status === "Done")
      return "border-l-4 border-l-emerald-500 bg-slate-50 opacity-60";
    switch (priority) {
      case "Urgent":
        return "border-l-4 border-l-red-600 bg-red-50/30";
      case "High":
        return "border-l-4 border-l-orange-500 bg-orange-50/30";
      case "Medium":
        return "border-l-4 border-l-blue-500 bg-blue-50/30";
      case "Low":
        return "border-l-4 border-l-slate-400 bg-slate-50/30";
      default:
        return "border-l-4 border-l-[#003566]";
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
              className="absolute right-3 top-4 bg-[#003566] border border-slate-200 rounded-full p-1 text-white hover:bg-[#003566]/90 transition-colors z-[999] shadow-sm"
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>
            <nav className="p-4 space-y-2 mt-4">
              <div
                className={cn(
                  "px-4 mb-6 flex items-center justify-between transition-opacity",
                  isSidebarCollapsed && "opacity-0",
                )}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
                  Staff Terminal
                </p>
                {isOnline ? (
                  <Wifi size={10} className="text-emerald-500" />
                ) : (
                  <WifiOff size={10} className="text-red-500" />
                )}
              </div>
              {[
                { title: t("overview"), href: "/dashboard", icon: BarChart3 },
                {
                  title: t("fleet_management"),
                  href: "/dashboard/yachts",
                  icon: Anchor,
                },
                {
                  title: t("task_board"),
                  href: "/dashboard/tasks",
                  icon: CheckSquare,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                    pathname === item.href
                      ? "bg-[#003566] text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-50",
                    isSidebarCollapsed && "justify-center px-0",
                  )}
                >
                  <item.icon size={16} className="shrink-0" />
                  {!isSidebarCollapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* MAIN CONTENT - Removed -mt-20 and fixed Margin */}
        <motion.main
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-8 bg-white min-h-[calc(100vh-80px)]"
        >
          <div className="max-w-[1600px] mx-auto space-y-12">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex justify-between items-end border-b border-slate-100 pb-8 mt-4">
              <div>
                <h1 className="text-5xl font-serif italic text-[#003566]">
                  Operational Manifest
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mt-2">
                  Vessel Maintenance & Directives
                </p>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  label: "Active Tasks",
                  val: analytics.total - analytics.completed,
                  icon: <CheckSquare size={16} />,
                },
                {
                  label: "Critical Priority",
                  val: analytics.urgent,
                  icon: <AlertCircle size={16} className="text-red-500" />,
                },
                {
                  label: "Completed Assets",
                  val: analytics.completed,
                  icon: <TrendingUp size={16} className="text-emerald-500" />,
                },
                {
                  label: "User Efficiency",
                  val: `${analytics.percent}%`,
                  icon: <BarChart3 size={16} className="text-blue-500" />,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-slate-50/50 border border-slate-100 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {stat.label}
                    </p>
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-serif italic text-[#003566]">
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Task List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedTasks.map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    className={cn(
                      "flex flex-col md:flex-row items-center justify-between p-6 gap-6 border shadow-sm",
                      getPriorityStyles(task.priority, task.status),
                    )}
                  >
                    <div className="flex items-center gap-6 flex-1 w-full">
                      <div className="w-12 h-12 flex items-center justify-center border bg-white">
                        {task.status === "Done" ? (
                          <CheckSquare size={18} className="text-emerald-500" />
                        ) : (
                          <ShieldAlert size={18} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-black uppercase tracking-wider text-[#003566]">
                          {task.title}
                        </h3>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                          Ref: {task.id} • {task.priority} Priority{" "}
                          {task.status === "Done" &&
                            "• Auto-clears after 3 days"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        advanceStatus(task.id, task.status, task.type)
                      }
                      className={cn(
                        "px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all min-w-[160px]",
                        task.status === "To Do"
                          ? "border-slate-200 text-slate-400 hover:bg-[#003566] hover:text-white"
                          : task.status === "In Progress"
                            ? "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            : "border-emerald-500 text-emerald-500",
                      )}
                    >
                      {task.status}
                    </button>
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
