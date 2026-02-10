"use client";

import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  Plus,
  User as UserIcon,
  X,
  Trash2,
  Search,
  Loader2,
  Anchor,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

interface Yacht {
  id: number;
  name: string;
  vessel_id: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date: string;
  assigned_to?: number;
  assigned_to_user?: User;
  yacht?: Yacht;
  created_at?: string;
  updated_at?: string;
}

export default function AdminTaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    assigned_to: "",
    yacht_id: "",
    due_date: "",
  });

  const API_BASE = "https://schepen-kring.nl/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id || user.userId);
    }

    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    initLoad();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
  };

  const initLoad = async () => {
    setLoading(true);
    try {
      const [taskRes, userRes, yachtRes] = await Promise.all([
        axios.get(`${API_BASE}/tasks`, getHeaders()),
        axios.get(`${API_BASE}/users`, getHeaders()),
        axios.get(`${API_BASE}/yachts`, getHeaders()),
      ]);

      // Transform tasks to include assigned user object
      const tasksWithUsers = taskRes.data.map((task: any) => ({
        ...task,
        assigned_to_user: userRes.data.find((u: User) => u.id === task.assigned_to)
      }));

      setTasks(tasksWithUsers);
      setUsers(userRes.data);
      setYachts(yachtRes.data);

      // Cache with user-specific key
      if (currentUserId) {
        localStorage.setItem(`admin_tasks_${currentUserId}`, JSON.stringify(tasksWithUsers));
      }
    } catch (err) {
      console.error("Failed to load:", err);
      toast.error("Failed to load tasks");
      
      // Try to load from cache
      if (currentUserId) {
        const cached = localStorage.getItem(`admin_tasks_${currentUserId}`);
        if (cached) {
          setTasks(JSON.parse(cached));
          toast("Using cached data");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const staffOnly = useMemo(() => {
    return users.filter((u) => u.role !== "Customer");
  }, [users]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task: Task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assigned_to_user?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        task.assigned_to_user?.email
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.assigned_to) {
      toast.error("Please select a crew member");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/tasks`, formData, getHeaders());
      
      // Add the assigned user object to the new task
      const newTask = {
        ...res.data,
        assigned_to_user: users.find(u => u.id === parseInt(formData.assigned_to))
      };
      
      setTasks([newTask, ...tasks]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        assigned_to: "",
        yacht_id: "",
        due_date: "",
      });
      toast.success("Task assigned successfully");
    } catch (err: any) {
      console.error("Error creating task:", err);
      toast.error(err.response?.data?.error || "Failed to create task");
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Permanently delete this task from the manifest?")) return;

    const previousTasks = [...tasks];
    setTasks(tasks.filter((t) => t.id !== id));

    try {
      await axios.delete(`${API_BASE}/tasks/${id}`, getHeaders());
      toast.success("Task deleted");
    } catch (err) {
      setTasks(previousTasks);
      toast.error("Failed to delete task");
    }
  };

  const toggleTaskStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Done" ? "In Progress" : "Done";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)),
    );

    try {
      await axios.patch(
        `${API_BASE}/tasks/${id}/status`,
        { status: nextStatus },
        getHeaders(),
      );
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto -mt-20">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">
            Task Oversight
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black mt-2">
            Fleet Management & Command
          </p>
          {!isOnline && (
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
              <WifiOff size={12} />
              <span>Offline Mode</span>
            </div>
          )}
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative grow md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="SEARCH MANIFEST..."
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:border-blue-400 outline-none"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <Wifi size={12} />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <WifiOff size={12} />
                <span>Offline</span>
              </div>
            )}
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#003566] text-white rounded-none h-12 px-8 uppercase text-[10px] tracking-widest font-black shadow-lg hover:bg-[#003566]/90"
            >
              <Plus className="mr-2 w-4 h-4" /> New Assignment
            </Button>
          </div>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="bg-white border border-slate-200 divide-y divide-slate-100 shadow-sm">
        {loading && tasks.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-slate-300 uppercase tracking-widest text-[10px] font-black">
            <Loader2 className="animate-spin mb-4" /> Loading Tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            No tasks found. {searchQuery && "Try a different search term."}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-6 flex flex-col lg:flex-row justify-between items-center gap-6 group hover:bg-slate-50/50 transition-all"
            >
              <div className="flex gap-6 items-start w-full lg:w-auto">
                <div
                  className={cn(
                    "w-1 h-12 shrink-0",
                    task.priority === "Urgent"
                      ? "bg-red-500"
                      : task.priority === "High"
                      ? "bg-orange-500"
                      : task.priority === "Medium"
                      ? "bg-blue-500"
                      : "bg-slate-400"
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100">
                      {task.yacht?.name || "General Fleet"}
                    </span>
                    <h3 className="text-sm font-bold text-[#003566] uppercase tracking-widest">
                      {task.title}
                    </h3>
                    {task.priority === "Urgent" && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[7px] font-black uppercase">
                        URGENT
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-600 mb-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <UserIcon size={12} className="text-blue-600" />{" "}
                      {task.assigned_to_user?.name || "Unassigned"}
                      {task.assigned_to_user?.email && (
                        <span className="text-slate-400 font-normal">
                          ({task.assigned_to_user.email})
                        </span>
                      )}
                    </span>
                    <span>Due: {task.due_date || "No deadline"}</span>
                    <span className={cn(
                      "px-2 py-0.5",
                      task.priority === "Urgent" ? "bg-red-100 text-red-700" :
                      task.priority === "High" ? "bg-orange-100 text-orange-700" :
                      task.priority === "Medium" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all min-w-[110px]",
                    task.status === "Done"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50",
                  )}
                >
                  {task.status}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#003566]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 border border-slate-200 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif italic text-[#003566]">
                  Assign New Task
                </h2>
                <X
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                  onClick={() => setIsModalOpen(false)}
                  size={20}
                />
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Task Title *
                  </label>
                  <input
                    className="w-full border-b border-slate-200 py-2 outline-none text-xs uppercase tracking-widest focus:border-blue-600"
                    placeholder="E.G. ENGINE SERVICE"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Description (Optional)
                  </label>
                  <textarea
                    className="w-full border-b border-slate-200 py-2 outline-none text-xs focus:border-blue-600 resize-none"
                    placeholder="Detailed instructions..."
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Crew Member *
                    </label>
                    <select
                      className="w-full border-b border-slate-200 py-2 outline-none text-[10px] uppercase font-bold"
                      value={formData.assigned_to}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assigned_to: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Personnel</option>
                      {staffOnly.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Target Vessel
                    </label>
                    <select
                      className="w-full border-b border-slate-200 py-2 outline-none text-[10px] uppercase font-bold"
                      value={formData.yacht_id}
                      onChange={(e) =>
                        setFormData({ ...formData, yacht_id: e.target.value })
                      }
                    >
                      <option value="">General Fleet</option>
                      {yachts.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name} ({y.vessel_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-1/2 space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Priority
                    </label>
                    <select
                      className="w-full border-b border-slate-200 py-2 text-[10px] font-bold outline-none"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="w-1/2 space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Deadline
                    </label>
                    <input
                      type="date"
                      className="w-full border-b border-slate-200 py-2 text-[10px] outline-none"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-500 rounded-none h-12 uppercase text-[10px] tracking-widest"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#003566] text-white rounded-none h-12 uppercase text-[10px] tracking-widest font-black hover:bg-[#003566]/90"
                  >
                    Deploy Assignment
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}