"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  User,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  List,
  CalendarDays,
  AlertTriangle,
  AlertCircle,
  CheckSquare,
  Clock,
  Info,
  ShieldAlert,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import CalendarView from "@/components/tasks/CalendarView";

interface Task {
  id: string | number;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  type: "assigned" | "personal";
  priority: "Low" | "Medium" | "High" | "Urgent" | "Critical";
  timestamp: number;
  due_date?: string;
  completedAt?: number;
  userId?: string;
}

type ViewMode = "list" | "calendar";
type StatusFilter = "all" | "todo" | "in-progress" | "done";

export default function EmployeeTaskPage() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showDone, setShowDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const API_BASE = "https://schepen-kring.nl/api";
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  // Initialize
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id || user.userId);
    }

    window.addEventListener("online", () => {
      setIsOnline(true);
      processSyncQueue();
    });
    window.addEventListener("offline", () => setIsOnline(false));

    loadInitialData();

    return () => clearInterval(timer);
  }, [userId]);

  // Get storage keys
  const getStorageKeys = () => {
    if (!userId) return null;
    return {
      taskCache: `task_cache_${userId}`,
      personalTasks: `personal_tasks_${userId}`,
      syncQueue: `sync_queue_${userId}`,
    };
  };

  // Load data
  const loadInitialData = async () => {
    if (!userId) return;
    
    setLoading(true);
    const keys = getStorageKeys();
    if (!keys) return;

    const cached = localStorage.getItem(keys.taskCache);
    let currentTasks: Task[] = cached ? JSON.parse(cached) : [];

    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchedTasks = res.data.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        type: "assigned",
        priority: t.priority,
        due_date: t.due_date,
        timestamp: new Date(t.created_at || t.updated_at).getTime(),
        completedAt: t.status === "Done" ? Date.now() : undefined,
        userId,
      }));

      const personal = JSON.parse(
        localStorage.getItem(keys.personalTasks) || "[]"
      ).filter((task: Task) => task.userId === userId);

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
      console.error("Error fetching tasks:", err);
      toast.error("Using offline manifest");
      const userTasks = currentTasks.filter(task => task.userId === userId);
      setTasks(userTasks);
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage
  const saveToLocalStorage = (allTasks: Task[]) => {
    if (!userId) return;
    const keys = getStorageKeys();
    if (!keys) return;
    
    const userTasks = allTasks.filter(task => task.userId === userId);
    localStorage.setItem(keys.taskCache, JSON.stringify(userTasks));
    
    const personalTasks = userTasks.filter((t) => t.type === "personal");
    localStorage.setItem(keys.personalTasks, JSON.stringify(personalTasks));
  };

  // Sync queue
  const processSyncQueue = async () => {
    if (!userId) return;
    const keys = getStorageKeys();
    if (!keys) return;
    
    const queue = JSON.parse(localStorage.getItem(keys.syncQueue) || "[]");
    if (queue.length === 0) return;
    
    const token = localStorage.getItem("auth_token");
    for (const action of queue) {
      try {
        await axios.patch(
          `${API_BASE}/tasks/${action.id}/status`,
          { status: action.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.error("Sync failed:", e);
      }
    }
    localStorage.setItem(keys.syncQueue, "[]");
  };

  const addToQueue = (id: any, status: string) => {
    if (!userId) return;
    const keys = getStorageKeys();
    if (!keys) return;
    
    const queue = JSON.parse(localStorage.getItem(keys.syncQueue) || "[]");
    queue.push({ id, status, timestamp: Date.now() });
    localStorage.setItem(keys.syncQueue, JSON.stringify(queue));
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "todo") {
        filtered = filtered.filter(t => t.status === "To Do");
      } else if (statusFilter === "in-progress") {
        filtered = filtered.filter(t => t.status === "In Progress");
      } else if (statusFilter === "done") {
        filtered = filtered.filter(t => t.status === "Done");
      }
    }

    // Apply showDone setting
    if (!showDone) {
      filtered = filtered.filter(t => t.status !== "Done");
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (task) => task.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [tasks, searchQuery, statusFilter, showDone]);

  // Add personal task
  const addPersonalTask = () => {
    if (!userId) {
      toast.error("Please log in first");
      return;
    }
    
    const title = prompt("Enter task description:");
    if (!title) return;
    
    const dueDate = prompt("Enter due date (YYYY-MM-DD) or leave empty for today:", 
      new Date().toISOString().split("T")[0]);
    
    const priority = prompt("Priority (Low/Medium/High/Urgent/Critical):", "Medium") as Task["priority"];
    
    const newTask: Task = {
      id: `p-${Date.now()}`,
      title,
      status: "To Do",
      type: "personal",
      priority: priority || "Medium",
      due_date: dueDate || new Date().toISOString().split("T")[0],
      timestamp: Date.now(),
      userId,
    };
    
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveToLocalStorage(updated);
    toast.success("Personal task added");
  };

  // Delete personal task
  const deletePersonalTask = (id: string | number) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveToLocalStorage(updated);
    toast.success("Task removed");
  };

  // Advance status
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
          toast.success("Status updated");
        } catch (err) {
          addToQueue(id, nextStatus);
          toast.success("Status saved offline");
        }
      } else {
        addToQueue(id, nextStatus);
        toast.success("Status saved offline");
      }
    }
  };

  // Get priority styles
  const getPriorityStyles = (priority: Task["priority"], status: string) => {
    if (status === "Done") return "border-l-4 border-l-emerald-500 bg-slate-50 opacity-60";
    switch (priority) {
      case "Critical":
        return "border-l-4 border-l-red-600 bg-red-50/30 animate-pulse";
      case "Urgent":
        return "border-l-4 border-l-red-500 bg-red-50/20";
      case "High":
        return "border-l-4 border-l-orange-500 bg-orange-50/20";
      case "Medium":
        return "border-l-4 border-l-blue-500 bg-blue-50/20";
      case "Low":
        return "border-l-4 border-l-slate-400 bg-slate-50/20";
      default:
        return "border-l-4 border-l-[#003566]";
    }
  };

  // Get icon styles
  const getIconStyles = (priority: Task["priority"], status: string) => {
    if (status === "Done") return "text-emerald-500 bg-emerald-50 border-emerald-100";
    switch (priority) {
      case "Critical":
        return "text-red-600 bg-red-100 border-red-200";
      case "Urgent":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "High":
        return "text-orange-500 bg-orange-100 border-orange-200";
      case "Medium":
        return "text-blue-500 bg-blue-100 border-blue-200";
      case "Low":
        return "text-slate-500 bg-slate-100 border-slate-200";
      default:
        return "text-slate-300 bg-slate-50 border-slate-100";
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Is overdue
  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  // Get remaining time
  const getRemainingTime = (completedAt: number) => {
    const diff = THREE_DAYS_MS - (now - completedAt);
    if (diff <= 0) return "Clearing now...";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#003566]">Please log in to view tasks</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      <DashboardHeader />
      <div className="flex pt-20">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        
        <motion.main
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-6 bg-white min-h-[calc(100vh-80px)] z-30 -mt-20"
        >
          <Toaster position="top-right" />
          
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-3xl font-serif italic text-[#003566]">
                  Task Manifest
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black mt-2">
                  Your Assignments & Personal Tasks
                </p>
                {!isOnline && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
                    <WifiOff size={12} />
                    <span>Offline Mode - Changes will sync when online</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                {/* Search */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="SEARCH TASKS..."
                    className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:border-blue-400 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className="rounded-none h-12 px-4 border text-xs"
                  >
                    <List size={16} className="mr-2" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "default" : "outline"}
                    onClick={() => setViewMode("calendar")}
                    className="rounded-none h-12 px-4 border text-xs"
                  >
                    <CalendarDays size={16} className="mr-2" />
                    Calendar
                  </Button>
                </div>

                {/* New Task Button */}
                <Button
                  onClick={addPersonalTask}
                  className="bg-[#003566] text-white rounded-none h-12 px-6 uppercase text-xs tracking-widest font-black hover:bg-[#003566]/90"
                >
                  <Plus size={16} className="mr-2" /> New Task
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  className="bg-white border border-slate-200 px-4 py-2 text-sm font-medium outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Show Done Toggle */}
              <Button
                variant={showDone ? "default" : "outline"}
                onClick={() => setShowDone(!showDone)}
                className="gap-2 text-xs"
              >
                {showDone ? <Eye size={16} /> : <EyeOff size={16} />}
                {showDone ? "Hide Done" : "Show Done"}
              </Button>
            </div>

            {/* Content */}
            {viewMode === "list" ? (
              /* List View */
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading tasks...</div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200">
                      <p className="text-slate-400">No tasks found</p>
                      <p className="text-xs text-slate-300 mt-2">
                        Add a personal task or wait for assignments
                      </p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <motion.div
                        layout
                        key={task.id}
                        className={cn(
                          "flex flex-col md:flex-row items-center justify-between p-6 gap-6 border shadow-sm",
                          task.type === "personal" && "border-dashed border-2 bg-slate-50/50",
                          getPriorityStyles(task.priority, task.status),
                        )}
                      >
                        {/* Left Section */}
                        <div className="flex items-center gap-6 flex-1 w-full">
                          {/* Icon */}
                          <div className={cn(
                            "w-12 h-12 flex items-center justify-center border",
                            getIconStyles(task.priority, task.status),
                          )}>
                            {task.type === "personal" ? (
                              <User size={18} />
                            ) : task.status === "Done" ? (
                              <CheckSquare size={18} />
                            ) : task.priority === "Critical" ? (
                              <AlertTriangle size={20} />
                            ) : task.priority === "Urgent" ? (
                              <AlertCircle size={20} />
                            ) : task.priority === "High" ? (
                              <AlertTriangle size={18} />
                            ) : task.priority === "Medium" ? (
                              <ShieldAlert size={18} />
                            ) : (
                              <Info size={18} />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-black uppercase tracking-wider text-[#003566]">
                                {task.title}
                              </h3>
                              {task.type === "personal" && (
                                <span className="px-2 py-0.5 bg-blue-100 text-[#003566] text-[7px] font-black uppercase border border-blue-200">
                                  Personal
                                </span>
                              )}
                              {task.priority === "Critical" && task.status !== "Done" && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-[7px] font-black uppercase animate-pulse">
                                  CRITICAL
                                </span>
                              )}
                              {task.status === "Done" && task.completedAt && (
                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100">
                                  <Clock size={10} /> {getRemainingTime(task.completedAt)}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              <span className={cn(
                                task.priority === "Critical" ? "text-red-600" :
                                task.priority === "Urgent" ? "text-orange-600" :
                                task.priority === "High" ? "text-orange-500" :
                                task.priority === "Medium" ? "text-blue-500" :
                                "text-slate-500"
                              )}>
                                {task.priority} Priority
                              </span>
                              {task.due_date && (
                                <span className={cn(
                                  "flex items-center gap-1",
                                  isOverdue(task.due_date) && "text-red-600 font-bold"
                                )}>
                                  <Clock size={10} />
                                  Due: {formatDate(task.due_date)}
                                  {isOverdue(task.due_date) && " (OVERDUE)"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          {task.type === "personal" && (
                            <button
                              onClick={() => deletePersonalTask(task.id)}
                              className="p-3 text-red-400 hover:text-red-600 transition-all border border-transparent hover:bg-red-50"
                              title="Delete personal task"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => advanceStatus(task.id, task.status, task.type)}
                            className={cn(
                              "flex-1 md:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest border transition-all min-w-[140px]",
                              task.status === "To Do" &&
                                "border-slate-200 text-slate-600 hover:bg-[#003566] hover:text-white",
                              task.status === "In Progress" &&
                                "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
                              task.status === "Done" &&
                                "border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white",
                            )}
                          >
                            {task.status}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Calendar View */
              <div className="bg-white border border-slate-200 p-6 shadow-sm">
                <CalendarView tasks={filteredTasks} />
              </div>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
}