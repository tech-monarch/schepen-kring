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
  Calendar,
  Eye,
  EyeOff,
  Filter,
  List,
  CalendarDays,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dynamic from "next/dynamic";

// Dynamically import calendar to avoid SSR issues
const CalendarView = dynamic(() => import("@/components/tasks/CalendarView"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <Loader2 className="animate-spin mx-auto" />
    </div>
  ),
});

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
  priority: "Low" | "Medium" | "High" | "Urgent" | "Critical";
  status: "To Do" | "In Progress" | "Done";
  due_date: string;
  assigned_to?: number;
  assigned_to_user?: User;
  yacht?: Yacht;
  created_at?: string;
  updated_at?: string;
}

type ViewMode = "list" | "calendar";
type StatusFilter = "all" | "todo" | "in-progress" | "done";

export default function AdminTaskBoardPage() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showDone, setShowDone] = useState<boolean>(false);

  // Form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as Task["priority"],
    status: "To Do" as Task["status"],
    assigned_to: "",
    yacht_id: "",
    due_date: new Date().toISOString().split("T")[0],
  });

  const API_BASE = "https://schepen-kring.nl/api";

  // Initialize
  useEffect(() => {
    initLoad();
    window.addEventListener("online", () => initLoad());
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

      const tasksWithUsers = taskRes.data.map((task: any) => ({
        ...task,
        assigned_to_user: userRes.data.find((u: User) => u.id === task.assigned_to),
      }));

      setTasks(tasksWithUsers);
      setUsers(userRes.data);
      setYachts(yachtRes.data);

      localStorage.setItem("admin_tasks_cache", JSON.stringify(tasksWithUsers));
    } catch (err) {
      console.error("Failed to load:", err);
      const cached = localStorage.getItem("admin_tasks_cache");
      if (cached) {
        setTasks(JSON.parse(cached));
        toast("Using cached data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter staff users
  const staffOnly = useMemo(() => {
    return users.filter((u) => u.role !== "Customer");
  }, [users]);

  // Filter tasks based on search and status
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
        (task) =>
          task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.assigned_to_user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [tasks, searchQuery, statusFilter, showDone]);

  // Get priority styles
  const getPriorityStyles = (priority: Task["priority"]) => {
    switch (priority) {
      case "Critical":
        return "bg-red-50 border-red-200 text-red-700";
      case "Urgent":
        return "bg-orange-50 border-orange-200 text-orange-700";
      case "High":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "Medium":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "Low":
        return "bg-slate-50 border-slate-200 text-slate-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  // Get priority border
  const getPriorityBorder = (priority: Task["priority"]) => {
    switch (priority) {
      case "Critical":
        return "border-l-4 border-l-red-600 bg-red-50/30";
      case "Urgent":
        return "border-l-4 border-l-red-500 bg-red-50/20";
      case "High":
        return "border-l-4 border-l-orange-500 bg-orange-50/20";
      case "Medium":
        return "border-l-4 border-l-blue-500 bg-blue-50/20";
      case "Low":
        return "border-l-4 border-l-slate-400 bg-slate-50/20";
      default:
        return "border-l-4 border-l-slate-400";
    }
  };

  // Get status icon
  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "Done":
        return <CheckCircle2 className="text-emerald-500" size={16} />;
      case "In Progress":
        return <Clock className="text-blue-500" size={16} />;
      case "To Do":
        return <Circle className="text-slate-400" size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  // Create task
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.assigned_to) {
      toast.error("Please select a crew member");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/tasks`, formData, getHeaders());
      
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
        due_date: new Date().toISOString().split("T")[0],
      });
      toast.success("Task assigned successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create task");
    }
  };

  // Delete task
  const deleteTask = async (id: number) => {
    if (!confirm("Permanently delete this task?")) return;

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

  // Toggle status
  const toggleTaskStatus = async (id: number, currentStatus: Task["status"]) => {
    const nextStatus = currentStatus === "Done" ? "To Do" : "Done";
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

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Is overdue
  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto -mt-20">
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
              className="rounded-none h-12 px-4 border"
            >
              <List size={16} className="mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              onClick={() => setViewMode("calendar")}
              className="rounded-none h-12 px-4 border"
            >
              <CalendarDays size={16} className="mr-2" />
              Calendar
            </Button>
          </div>

          {/* New Task Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003566] text-white rounded-none h-12 px-8 uppercase text-[10px] tracking-widest font-black shadow-lg hover:bg-[#003566]/90"
          >
            <Plus className="mr-2 w-4 h-4" /> New Task
          </Button>
        </div>
      </div>

      {/* FILTERS */}
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
          className="gap-2"
        >
          {showDone ? <Eye size={16} /> : <EyeOff size={16} />}
          {showDone ? "Hide Done" : "Show Done"}
        </Button>

        {/* Priority Filter */}
        <select
          className="bg-white border border-slate-200 px-4 py-2 text-sm font-medium outline-none"
          onChange={(e) => {
            const priority = e.target.value;
            if (priority === "all") {
              // Reset filter
            } else {
              // Filter by priority
              // You might want to add state for priority filter
            }
          }}
        >
          <option value="all">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* CONTENT AREA */}
      {viewMode === "list" ? (
        /* LIST VIEW */
        <div className="bg-white border border-slate-200 shadow-sm">
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
                className={cn(
                  "p-6 flex flex-col lg:flex-row justify-between items-center gap-6 group transition-all border-b border-slate-100",
                  getPriorityBorder(task.priority),
                  task.status === "Done" && "opacity-70 bg-slate-50"
                )}
              >
                {/* Left Section */}
                <div className="flex gap-6 items-start w-full lg:w-auto">
                  {/* Priority Indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-full border-2",
                      getPriorityStyles(task.priority)
                    )}>
                      {task.priority === "Critical" ? (
                        <AlertTriangle className="text-red-600" size={20} />
                      ) : task.priority === "Urgent" ? (
                        <AlertCircle className="text-orange-500" size={20} />
                      ) : task.status === "Done" ? (
                        <CheckCircle2 className="text-emerald-500" size={20} />
                      ) : (
                        <Clock className="text-blue-500" size={20} />
                      )}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                      {task.priority}
                    </span>
                  </div>

                  {/* Task Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-bold text-[#003566] uppercase tracking-widest">
                        {task.title}
                      </h3>
                      {task.priority === "Critical" && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[7px] font-black uppercase animate-pulse">
                          CRITICAL
                        </span>
                      )}
                      <span className={cn(
                        "px-2 py-0.5 text-[8px] font-black uppercase border",
                        task.status === "Done" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : task.status === "In Progress"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-slate-50 text-slate-600 border-slate-100"
                      )}>
                        {task.status}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <UserIcon size={12} />
                        {task.assigned_to_user?.name || "Unassigned"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Anchor size={12} />
                        {task.yacht?.name || "General Fleet"}
                      </span>
                      <span className={cn(
                        "flex items-center gap-1.5",
                        isOverdue(task.due_date) && "text-red-600 font-bold"
                      )}>
                        <Calendar size={12} />
                        Due: {formatDate(task.due_date)}
                        {isOverdue(task.due_date) && " (OVERDUE)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={cn(
                      "px-6 py-2 text-xs font-bold uppercase tracking-widest border transition-all",
                      task.status === "Done"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {task.status === "Done" ? "Mark Active" : "Mark Done"}
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
      ) : (
        /* CALENDAR VIEW */
        <div className="bg-white border border-slate-200 p-6 shadow-sm">
          <CalendarView tasks={filteredTasks} />
        </div>
      )}

      {/* TASK CREATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#003566]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 border border-slate-200 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif italic text-[#003566]">
                  Create New Task
                </h2>
                <X
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                  onClick={() => setIsModalOpen(false)}
                  size={20}
                />
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Task Title *
                    </label>
                    <input
                      className="w-full border border-slate-200 px-4 py-3 outline-none text-sm focus:border-blue-600"
                      placeholder="Enter task title"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Priority *
                    </label>
                    <select
                      className="w-full border border-slate-200 px-4 py-3 outline-none text-sm"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as Task["priority"] })
                      }
                      required
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                      <option value="Critical">Critical Priority (Red Alert)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    Description
                  </label>
                  <textarea
                    className="w-full border border-slate-200 px-4 py-3 outline-none text-sm focus:border-blue-600 resize-none"
                    placeholder="Detailed description of the task..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Assignee */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Assign to *
                    </label>
                    <select
                      className="w-full border border-slate-200 px-4 py-3 outline-none text-sm"
                      value={formData.assigned_to}
                      onChange={(e) =>
                        setFormData({ ...formData, assigned_to: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Crew Member</option>
                      {staffOnly.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Yacht */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Target Vessel
                    </label>
                    <select
                      className="w-full border border-slate-200 px-4 py-3 outline-none text-sm"
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

                <div className="grid grid-cols-2 gap-6">
                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      className="w-full border border-slate-200 px-4 py-3 outline-none text-sm"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Initial Status
                    </label>
                    <select
                      className="w-full border border-slate-200 px-4 py-3 outline-none text-sm"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as Task["status"] })
                      }
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                {formData.title && (
                  <div className={cn(
                    "p-4 border-l-4 mt-4",
                    formData.priority === "Critical" 
                      ? "border-l-red-600 bg-red-50" 
                      : formData.priority === "Urgent"
                      ? "border-l-orange-500 bg-orange-50"
                      : "border-l-blue-500 bg-blue-50"
                  )}>
                    <p className="text-sm font-medium text-slate-600">Preview:</p>
                    <p className="text-sm mt-1">
                      <strong>{formData.title}</strong> — {formData.priority} Priority
                      {formData.due_date && ` · Due: ${formatDate(formData.due_date)}`}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-500 rounded-none h-12 uppercase text-xs tracking-widest"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#003566] text-white rounded-none h-12 uppercase text-xs tracking-widest font-black hover:bg-[#003566]/90"
                  >
                    Create Task
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