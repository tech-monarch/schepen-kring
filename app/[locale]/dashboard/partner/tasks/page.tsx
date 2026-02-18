"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  User as UserIcon,
  X,
  Trash2,
  Search,
  Loader2,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  List,
  CalendarDays,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";

// ============================================
// INTERFACES
// ============================================
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  partner_id?: number;
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
  created_by?: number;
  created_by_user?: User;
  type: "personal" | "assigned";
  assignment_status?: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

type ViewMode = "list" | "calendar";
type StatusFilter = "all" | "To Do" | "In Progress" | "Done";
type PriorityFilter = "all" | "Low" | "Medium" | "High" | "Urgent" | "Critical";
type TypeFilter = "all" | "personal" | "assigned";

// ============================================
// CALENDAR VIEW (same as before)
// ============================================
function CalendarView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick?: (task: Task) => void }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "Critical": return "#dc2626";
      case "Urgent": return "#ea580c";
      case "High": return "#d97706";
      case "Medium": return "#3b82f6";
      case "Low": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { firstDay, lastDay, daysInMonth, startingDay };
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTasksForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getCalendarGrid = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const days = [];

    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = 0; i < startingDay; i++) {
      days.push({
        day: prevMonthDays - startingDay + i + 1,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - startingDay + i + 1),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      });
    }

    const totalCells = 42;
    for (let i = 1; days.length < totalCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      });
    }

    return days;
  };

  const calendarGrid = getCalendarGrid();
  const today = new Date();

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="text-slate-600" size={20} />
          </button>
          <button onClick={goToToday} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="text-slate-600" size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#003566] ml-4">{getMonthName(currentDate)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
        {weekDays.map(day => (
          <div key={day} className="bg-slate-50 p-3 text-center text-sm font-medium text-slate-600">
            {day}
          </div>
        ))}

        {calendarGrid.map(({ day, isCurrentMonth, date }, index) => {
          const dayTasks = getTasksForDay(day);
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] bg-white p-2 border border-slate-100",
                !isCurrentMonth && "bg-slate-50",
                isToday && "bg-blue-50"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrentMonth ? "text-slate-900" : "text-slate-400",
                    isToday && "text-blue-600 font-bold"
                  )}
                >
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 max-h-20 overflow-y-auto">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded border-l-2 cursor-pointer hover:opacity-90"
                    style={{
                      borderLeftColor: getPriorityColor(task.priority),
                      backgroundColor: `${getPriorityColor(task.priority)}10`,
                      color: getPriorityColor(task.priority),
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onTaskClick?.(task);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {task.priority === "Critical" && <AlertTriangle className="text-red-600" size={10} />}
                      {task.priority === "Urgent" && <AlertCircle className="text-orange-500" size={10} />}
                      {task.priority === "High" && <AlertTriangle className="text-amber-500" size={10} />}
                      {["Medium", "Low"].includes(task.priority) && <Clock className="text-blue-500" size={10} />}
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-slate-500 text-center">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-sm text-slate-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="text-sm text-slate-600">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm text-slate-600">Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-slate-600">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm text-slate-600">Done</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PERSONAL TASK MODAL (no assignee)
// ============================================
interface PersonalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  task?: Task;
}

function PersonalTaskModal({ isOpen, onClose, onSubmit, task }: PersonalTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as Task["priority"],
    status: "To Do" as Task["status"],
    due_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        status: task.status || "To Do",
        due_date: task.due_date ? task.due_date.split("T")[0] : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        due_date: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.due_date) newErrors.due_date = "Due date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // type is always personal
    onSubmit({ ...formData, type: "personal" });
  };

  const handlePrioritySelect = (priority: Task["priority"]) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical": return <AlertTriangle className="text-red-600" size={20} />;
      case "Urgent": return <AlertCircle className="text-orange-500" size={20} />;
      case "High": return <AlertTriangle className="text-amber-500" size={20} />;
      case "Medium": return <Shield className="text-blue-500" size={20} />;
      case "Low": return <Info className="text-slate-500" size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-50 border-red-500 text-red-700";
      case "Urgent": return "bg-orange-50 border-orange-500 text-orange-700";
      case "High": return "bg-amber-50 border-amber-500 text-amber-700";
      case "Medium": return "bg-blue-50 border-blue-500 text-blue-700";
      case "Low": return "bg-slate-50 border-slate-500 text-slate-700";
      default: return "bg-slate-50 border-slate-500 text-slate-700";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#003566]">
            {task ? "Edit Personal Task" : "Create Personal Task"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="text-slate-500" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                errors.title ? "border-red-500" : "border-slate-200"
              )}
              placeholder="Enter task title"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Priority *</label>
              <div className="grid grid-cols-5 gap-2">
                {(["Low", "Medium", "High", "Urgent", "Critical"] as const).map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handlePrioritySelect(priority)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-lg transition-all",
                      formData.priority === priority
                        ? getPriorityColor(priority)
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {getPriorityIcon(priority)}
                    <span className="text-xs mt-1">{priority}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Due Date *</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                  errors.due_date ? "border-red-500" : "border-slate-200"
                )}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.due_date && <p className="text-red-500 text-sm">{errors.due_date}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <div className="flex gap-4">
              {(["To Do", "In Progress", "Done"] as const).map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status }))}
                  className={cn(
                    "flex-1 py-3 px-4 border rounded-lg text-center transition-all",
                    formData.status === status
                      ? status === "Done"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : status === "In Progress"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-500 bg-slate-50 text-slate-700"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose} className="px-8 py-3 border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button type="submit" className="px-8 py-3 bg-[#003566] text-white hover:bg-[#003566]/90">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MAIN EMPLOYEE TASKS PAGE
// ============================================
export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showDone, setShowDone] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as StatusFilter,
    priority: "all" as PriorityFilter,
    type: "all" as TypeFilter,
  });

  // For inline assign dropdown
  const [showAssignDropdown, setShowAssignDropdown] = useState<Record<number, boolean>>({});

  const API_BASE = "https://schepen-kring.nl/api";

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
  });

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user`, getHeaders());
      setCurrentUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch current user", error);
      toast.error("Could not verify your user. Please log in again.");
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await fetchCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Employee's tasks (personal + assigned)
      const tasksRes = await axios.get(`${API_BASE}/tasks/my`, getHeaders());
      setTasks(tasksRes.data);

      // Other employees under same partner (for reassign)
      if (user.partner_id) {
        const usersRes = await axios.get(`${API_BASE}/partner/users`, getHeaders());
        setUsers(usersRes.data.filter((u: User) => u.id !== user.id));
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (filters.status !== "all") filtered = filtered.filter(t => t.status === filters.status);
    if (filters.priority !== "all") filtered = filtered.filter(t => t.priority === filters.priority);
    if (filters.type !== "all") filtered = filtered.filter(t => t.type === filters.type);
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.assigned_to_user?.name.toLowerCase().includes(searchLower)
      );
    }
    if (!showDone) filtered = filtered.filter(t => t.status !== "Done");
    return filtered;
  }, [tasks, filters, showDone]);

  // --- CREATE PERSONAL TASK ---
  const handleCreateTask = async (taskData: any) => {
    try {
      await axios.post(`${API_BASE}/tasks`, taskData, getHeaders());
      toast.success("Task created");
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.error || "Failed to create task");
    }
  };

  // --- DELETE TASK (only if creator) ---
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`, getHeaders());
      toast.success("Task deleted");
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete task");
    }
  };

  // --- STATUS CHANGE ---
  const handleStatusChange = async (taskId: number, newStatus: Task["status"]) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/status`, { status: newStatus }, getHeaders());
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  // --- ACCEPT / REJECT ---
  const handleAcceptTask = async (taskId: number) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/accept`, {}, getHeaders());
      toast.success("Task accepted");
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to accept task");
    }
  };

  const handleRejectTask = async (taskId: number) => {
    if (!confirm("Reject this task?")) return;
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/reject`, {}, getHeaders());
      toast.success("Task rejected");
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reject task");
    }
  };

  // --- ASSIGN TASK TO ANOTHER EMPLOYEE (reassign) ---
  const handleAssignTask = async (taskId: number, newAssigneeId: string) => {
    if (!newAssigneeId) return;
    try {
      await axios.put(
        `${API_BASE}/tasks/${taskId}`,
        {
          assigned_to: parseInt(newAssigneeId),
          type: "assigned",
          assignment_status: "pending",
        },
        getHeaders()
      );
      toast.success("Task reassigned");
      await fetchData();
    } catch (error: any) {
      console.error("Error assigning task:", error);
      toast.error(error.response?.data?.error || "Failed to assign task");
    }
  };

  const toggleAssignDropdown = (taskId: number) => {
    setShowAssignDropdown(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAssignFromButton = async (taskId: number, newAssigneeId: string) => {
    await handleAssignTask(taskId, newAssigneeId);
    setShowAssignDropdown(prev => ({ ...prev, [taskId]: false }));
  };

  // Helper functions (same as before)
  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "Critical": return <AlertTriangle className="text-red-600" size={16} />;
      case "Urgent": return <AlertCircle className="text-orange-500" size={16} />;
      case "High": return <AlertTriangle className="text-amber-500" size={16} />;
      case "Medium": return <Shield className="text-blue-500" size={16} />;
      case "Low": return <Info className="text-slate-500" size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getPriorityStyles = (priority: Task["priority"]) => {
    switch (priority) {
      case "Critical": return "bg-red-50 border-red-200 text-red-700";
      case "Urgent": return "bg-orange-50 border-orange-200 text-orange-700";
      case "High": return "bg-amber-50 border-amber-200 text-amber-700";
      case "Medium": return "bg-blue-50 border-blue-200 text-blue-700";
      case "Low": return "bg-slate-50 border-slate-200 text-slate-700";
      default: return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getStatusStyles = (status: Task["status"]) => {
    switch (status) {
      case "Done": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "In Progress": return "bg-blue-50 text-blue-600 border-blue-200";
      case "To Do": return "bg-slate-50 text-slate-600 border-slate-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && due.toDateString() !== today.toDateString();
  };

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      <DashboardHeader />
      <Toaster position="top-right" />

      <div className="flex pt-20">
        <Sidebar onCollapse={setIsSidebarCollapsed} />

        <motion.main
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-6 bg-white min-h-[calc(100vh-80px)] z-30 -mt-20"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-4xl font-serif italic text-[#003566]">My Tasks</h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black mt-2">
                  Personal & Assigned
                </p>
              </div>

              <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="SEARCH TASKS..."
                    className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:border-blue-400 outline-none"
                    value={filters.search}
                    onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className="rounded-none h-12 px-4 border text-xs"
                  >
                    <List size={16} className="mr-2" /> List
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "default" : "outline"}
                    onClick={() => setViewMode("calendar")}
                    className="rounded-none h-12 px-4 border text-xs"
                  >
                    <CalendarDays size={16} className="mr-2" /> Calendar
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setEditingTask(undefined);
                    setIsModalOpen(true);
                  }}
                  className="bg-[#003566] text-white rounded-none h-12 px-8 uppercase text-xs tracking-widest font-black shadow-lg hover:bg-[#003566]/90"
                >
                  <Plus size={16} className="mr-2" /> New Task
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Status:</span>
                <select
                  className="bg-white border border-slate-200 px-3 py-2 text-sm font-medium outline-none rounded"
                  value={filters.status}
                  onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as StatusFilter }))}
                >
                  <option value="all">All Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Priority:</span>
                <select
                  className="bg-white border border-slate-200 px-3 py-2 text-sm font-medium outline-none rounded"
                  value={filters.priority}
                  onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value as PriorityFilter }))}
                >
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Type:</span>
                <select
                  className="bg-white border border-slate-200 px-3 py-2 text-sm font-medium outline-none rounded"
                  value={filters.type}
                  onChange={e => setFilters(prev => ({ ...prev, type: e.target.value as TypeFilter }))}
                >
                  <option value="all">All Types</option>
                  <option value="personal">Personal</option>
                  <option value="assigned">Assigned</option>
                </select>
              </div>

              <Button
                variant={showDone ? "default" : "outline"}
                onClick={() => setShowDone(!showDone)}
                className="gap-2 ml-auto"
              >
                {showDone ? <EyeOff size={16} /> : <Eye size={16} />}
                {showDone ? "Hide Done" : "Show Done"}
              </Button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-[#003566]" size={32} />
                <span className="ml-3 text-slate-600">Loading tasks...</span>
              </div>
            ) : viewMode === "calendar" ? (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <CalendarView tasks={filteredTasks} />
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-slate-400">No tasks found</p>
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          "flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-6 border shadow-sm rounded-lg transition-all hover:shadow-md",
                          task.status === "Done" && "opacity-70",
                          task.priority === "Critical" && task.status !== "Done" && "border-l-4 border-l-red-600"
                        )}
                      >
                        {/* Left Section */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className={cn("w-12 h-12 flex items-center justify-center rounded-full border-2", getPriorityStyles(task.priority))}>
                            {getPriorityIcon(task.priority)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-[#003566]">{task.title}</h3>
                              <span className={cn("px-2 py-1 text-xs font-bold uppercase border rounded", getPriorityStyles(task.priority))}>
                                {task.priority}
                              </span>
                              <span className={cn("px-2 py-1 text-xs font-bold uppercase border rounded", getStatusStyles(task.status))}>
                                {task.status}
                              </span>
                              {task.type === "personal" && (
                                <span className="px-2 py-1 text-xs font-bold uppercase bg-purple-50 text-purple-600 border border-purple-200 rounded">
                                  Personal
                                </span>
                              )}
                              {task.assignment_status === "pending" && task.assigned_to === currentUser?.id && (
                                <span className="px-2 py-1 text-xs font-bold uppercase bg-yellow-50 text-yellow-600 border border-yellow-200 rounded">
                                  Pending Acceptance
                                </span>
                              )}
                            </div>

                            {task.description && (
                              <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              {task.assigned_to_user && task.type === "assigned" && (
                                <span className="flex items-center gap-1.5">
                                  <UserIcon size={14} /> Assigned to: {task.assigned_to_user.name}
                                </span>
                              )}
                              {task.created_by_user && task.type === "personal" && (
                                <span className="flex items-center gap-1.5">
                                  <UserIcon size={14} /> Created by you
                                </span>
                              )}
                              <span className={cn("flex items-center gap-1.5", isOverdue(task.due_date) && "text-red-600 font-bold")}>
                                <CalendarIcon size={14} /> Due: {formatDate(task.due_date)}
                                {isOverdue(task.due_date) && " (OVERDUE)"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Assign button / dropdown (only if user is creator or has permission) */}
                          {(task.created_by === currentUser?.id || currentUser?.role === "Partner") && (
                            <>
                              {!showAssignDropdown[task.id] ? (
                                <Button
                                  onClick={() => toggleAssignDropdown(task.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  <UserIcon size={14} className="mr-1" /> Assign
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <select
                                    className="border border-slate-300 bg-white rounded px-2 py-1 text-sm"
                                    defaultValue=""
                                    onChange={e => handleAssignFromButton(task.id, e.target.value)}
                                    autoFocus
                                  >
                                    <option value="">Select employee...</option>
                                    {users.map(u => (
                                      <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                  </select>
                                  <Button variant="ghost" size="sm" onClick={() => toggleAssignDropdown(task.id)}>
                                    <X size={14} />
                                  </Button>
                                </div>
                              )}
                            </>
                          )}

                          {/* Accept/Reject for pending tasks */}
                          {task.assignment_status === "pending" && task.assigned_to === currentUser?.id && (
                            <>
                              <Button
                                onClick={() => handleAcceptTask(task.id)}
                                className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                size="sm"
                              >
                                <CheckCircle2 size={16} className="mr-2" /> Accept
                              </Button>
                              <Button
                                onClick={() => handleRejectTask(task.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X size={16} className="mr-2" /> Reject
                              </Button>
                            </>
                          )}

                          {/* Status change */}
                          {task.assignment_status !== "pending" && task.status !== "Done" ? (
                            <Button
                              onClick={() => handleStatusChange(task.id, "Done")}
                              className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                              size="sm"
                            >
                              <CheckCircle2 size={16} className="mr-2" /> Mark Done
                            </Button>
                          ) : task.assignment_status !== "pending" && task.status === "Done" ? (
                            <Button
                              onClick={() => handleStatusChange(task.id, "To Do")}
                              variant="outline"
                              size="sm"
                            >
                              Re-open
                            </Button>
                          ) : null}

                          {/* Delete button (only if creator) */}
                          {task.created_by === currentUser?.id && (
                            <Button
                              onClick={() => handleDeleteTask(task.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.main>
      </div>

      <PersonalTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        task={editingTask}
      />
    </div>
  );
}