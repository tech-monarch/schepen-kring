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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface Yacht {
  id: number;
  name: string;
  vessel_id: string;
}

interface User {
  id: number;
  name: string;
  role: string; // Admin, Employee, Customer [cite: 11]
}

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
  due_date: string;
  assigned_to?: User;
  yacht?: Yacht;
}

export default function AdminTaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [yachts, setYachts] = useState<Yacht[]>([]); // New state for ships
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    status: "To Do",
    assigned_to: "",
    yacht_id: "", // Added for ship assignment [cite: 70]
    due_date: "",
  });

  const API_BASE = "https://schepen-kring.nl/api";

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
  };

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      try {
        // Fetch tasks, users, and yachts in parallel [cite: 36, 68, 9]
        const [taskRes, userRes, yachtRes] = await Promise.all([
          axios.get(`${API_BASE}/tasks`, getHeaders()),
          axios.get(`${API_BASE}/users`, getHeaders()),
          axios.get(`${API_BASE}/yachts`, getHeaders()),
        ]);

        setTasks(taskRes.data);
        setUsers(userRes.data);
        setYachts(yachtRes.data);

        localStorage.setItem("fleet_tasks", JSON.stringify(taskRes.data));
      } catch (err) {
        console.error("Fleet sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initLoad();
  }, []);

  // --- FILTERING ---
  // 1. Filter out Customers so only Staff/Admins show in the crew dropdown [cite: 11]
  const staffOnly = useMemo(() => {
    return users.filter((u) => u.role !== "Customer");
  }, [users]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task: Task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assigned_to?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [tasks, searchQuery]);

  // --- ACTIONS ---
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/tasks`, formData, getHeaders());
      setTasks([res.data, ...tasks]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        priority: "Medium",
        status: "To Do",
        assigned_to: "",
        yacht_id: "",
        due_date: "",
      });
    } catch (err) {
      alert("Error: Ensure all fields match system requirements.");
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Permanently delete this task from the manifest?")) return;

    // Optimistic Update
    const previousTasks = [...tasks];
    setTasks(tasks.filter((t) => t.id !== id));

    try {
      await axios.delete(`${API_BASE}/tasks/${id}`, getHeaders()); // [cite: 77]
    } catch (err) {
      setTasks(previousTasks);
      alert("System could not purge task. Check connection.");
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
      ); // [cite: 80]
    } catch (err) {
      console.error("Status sync failed");
    }
  };

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto -mt-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">
            Task Oversight
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black mt-2">
            Fleet Management & Command
          </p>
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
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003566] text-white rounded-none h-12 px-8 uppercase text-[10px] tracking-widest font-black shadow-lg"
          >
            <Plus className="mr-2 w-4 h-4" /> New Assignment
          </Button>
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white border border-slate-200 divide-y divide-slate-100 shadow-sm">
        {loading && tasks.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-slate-300 uppercase tracking-widest text-[10px] font-black">
            <Loader2 className="animate-spin mb-4" /> Syncing Fleet...
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
                    task.priority === "Urgent" || task.priority === "High"
                      ? "bg-red-500"
                      : "bg-blue-600",
                  )}
                />
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100">
                      {task.yacht?.name || "General Fleet"}
                    </span>
                    <h3 className="text-sm font-bold text-[#003566] uppercase tracking-widest">
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-slate-400 mt-2 font-medium">
                    <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <UserIcon size={12} className="text-blue-600" />{" "}
                      {task.assigned_to?.name || "Unassigned"}
                    </span>
                    <span>Due: {task.due_date || "Immediate"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all min-w-[110px]",
                    task.status === "Done"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-white text-slate-500 border-slate-200",
                  )}
                >
                  {task.status}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPDATED MODAL WITH SHIP SELECTION & FILTERED CREW */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#003566]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 border border-slate-200 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif italic text-[#003566]">
                  Assign New Task
                </h2>
                <X
                  className="cursor-pointer text-slate-400"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Task Title
                  </label>
                  <input
                    className="w-full border-b border-slate-200 py-2 outline-none text-xs uppercase tracking-widest focus:border-blue-600"
                    placeholder="E.G. ENGINE SERVICE"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Crew Member
                    </label>
                    <select
                      className="w-full border-b border-slate-200 py-2 outline-none text-[10px] uppercase font-bold"
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
                      onChange={(e) =>
                        setFormData({ ...formData, yacht_id: e.target.value })
                      }
                    >
                      <option value="">General Fleet</option>
                      {yachts.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name}
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
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#003566] text-white rounded-none h-12 uppercase text-[10px] tracking-widest font-black"
                >
                  Deploy Assignment
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
