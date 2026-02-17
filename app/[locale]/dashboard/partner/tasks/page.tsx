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
  Edit2,
  ChevronLeft,
  ChevronRight,
  Save,
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
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Done";
  due_date?: string;
  assigned_to?: number;
  assigned_to_user?: User;
  created_by?: number;
  created_by_user?: User;
  type: "personal" | "assigned";
  assignment_status?: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

// Form data uses strings for inputs (select values)
interface TaskFormData {
  title: string;
  description: string;
  priority: Task["priority"];
  status: Task["status"];
  assigned_to: string; // empty string or user id as string
  due_date: string;
  type: "personal" | "assigned";
}

type ViewMode = "list" | "calendar";
type StatusFilter = "all" | "To Do" | "In Progress" | "Done";
type PriorityFilter = "all" | "Low" | "Medium" | "High";
type TypeFilter = "all" | "personal" | "assigned";
type BlockFilter = "active" | "priority" | "completed" | "efficiency" | null;

// ============================================
// CALENDAR VIEW COMPONENT (unchanged)
// ============================================
function CalendarView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick?: (task: Task) => void }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "High": return "#dc2626";
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
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTasksForDay = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return tasks.filter((task) => {
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

    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    );
    const prevMonthDays = prevMonth.getDate();

    for (let i = 0; i < startingDay; i++) {
      days.push({
        day: prevMonthDays - startingDay + i + 1,
        isCurrentMonth: false,
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          prevMonthDays - startingDay + i + 1,
        ),
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
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          i,
        ),
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
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="text-slate-600" size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="text-slate-600" size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#003566] ml-4">
            {getMonthName(currentDate)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-slate-50 p-3 text-center text-sm font-medium text-slate-600"
          >
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
                isToday && "bg-blue-50",
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrentMonth ? "text-slate-900" : "text-slate-400",
                    isToday && "text-blue-600 font-bold",
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
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded border-l-2 cursor-pointer hover:opacity-90"
                    style={{
                      borderLeftColor: getPriorityColor(task.priority),
                      backgroundColor: `${getPriorityColor(task.priority)}10`,
                      color: getPriorityColor(task.priority),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick?.(task);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {task.priority === "High" && (
                        <AlertTriangle className="text-red-600" size={10} />
                      )}
                      {task.priority === "Medium" && (
                        <Shield className="text-blue-500" size={10} />
                      )}
                      {task.priority === "Low" && (
                        <Info className="text-slate-500" size={10} />
                      )}
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-slate-500 text-center">
                    +{dayTasks.length - 3} more
                  </div>
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
          <span className="text-sm text-slate-600">High</span>
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
// MAIN TASKS PAGE – NO MODALS, INLINE CREATE & EDIT
// ============================================
export default function UserTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showDone, setShowDone] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as StatusFilter,
    priority: "all" as PriorityFilter,
    type: "all" as TypeFilter,
  });
  const [blockFilter, setBlockFilter] = useState<BlockFilter>(null);

  // Inline create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    assigned_to: "",
    due_date: new Date().toISOString().split("T")[0],
    type: "personal",
  });

  // Editing state per task
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    assigned_to: "",
    due_date: "",
    type: "personal",
  });

  const API_BASE = "https://schepen-kring.nl/api";

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
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

      const tasksRes = await axios.get(`${API_BASE}/tasks/my`, getHeaders());
      setTasks(tasksRes.data);

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

  const metrics = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status === "To Do").length;
    const highPriority = tasks.filter(t => t.priority === "High").length;
    const completedAssets = tasks.filter(t => t.status === "Done").length;

    const today = new Date().toISOString().split("T")[0];
    const tasksDueToday = tasks.filter(t => t.due_date && t.due_date.startsWith(today));
    const completedToday = tasksDueToday.filter(t => t.status === "Done").length;
    const efficiency = tasksDueToday.length > 0 ? Math.round((completedToday / tasksDueToday.length) * 100) : 0;

    return { activeTasks, highPriority, completedAssets, efficiency };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (blockFilter) {
      switch (blockFilter) {
        case "active":
          filtered = filtered.filter(task => task.status === "To Do");
          break;
        case "priority":
          filtered = filtered.filter(task => task.priority === "High");
          break;
        case "completed":
          filtered = filtered.filter(task => task.status === "Done");
          break;
        case "efficiency":
          const today = new Date().toISOString().split("T")[0];
          filtered = filtered.filter(task => task.due_date && task.due_date.startsWith(today));
          break;
      }
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.priority !== "all") {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    if (filters.type !== "all") {
      filtered = filtered.filter(task => task.type === filters.type);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.created_by_user?.name.toLowerCase().includes(searchLower)
      );
    }
    if (!showDone) {
      filtered = filtered.filter(task => task.status !== "Done");
    }

    return filtered;
  }, [tasks, filters, showDone, blockFilter]);

  const handleBlockClick = (block: BlockFilter) => {
    setBlockFilter(prev => prev === block ? null : block);
  };

  // --- CREATE TASK ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (newTask.type === "assigned" && !newTask.assigned_to) {
      toast.error("Please select an employee");
      return;
    }

    try {
      const apiData = {
        ...newTask,
        assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null,
      };
      await axios.post(`${API_BASE}/tasks`, apiData, getHeaders());
      toast.success("Task created");
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        assigned_to: "",
        due_date: new Date().toISOString().split("T")[0],
        type: "personal",
      });
      setShowCreateForm(false);
      await fetchData();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.error || "Failed to create task");
    }
  };

  // --- UPDATE TASK (inline) ---
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to?.toString() || "",
      due_date: task.due_date ? task.due_date.split("T")[0] : new Date().toISOString().split("T")[0],
      type: task.type,
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "To Do",
      assigned_to: "",
      due_date: "",
      type: "personal",
    });
  };

  const saveEditing = async (taskId: number) => {
    if (!editFormData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editFormData.type === "assigned" && !editFormData.assigned_to) {
      toast.error("Please select an employee");
      return;
    }

    try {
      const apiData = {
        ...editFormData,
        assigned_to: editFormData.assigned_to ? parseInt(editFormData.assigned_to) : null,
      };
      await axios.put(`${API_BASE}/tasks/${taskId}`, apiData, getHeaders());
      toast.success("Task updated");
      setEditingTaskId(null);
      setEditFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        assigned_to: "",
        due_date: "",
        type: "personal",
      });
      await fetchData();
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(error.response?.data?.error || "Failed to update task");
    }
  };

  // --- DELETE TASK ---
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`, getHeaders());
      toast.success("Task deleted");
      await fetchData();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.error || "Failed to delete task");
    }
  };

  // --- STATUS CHANGE ---
  const handleStatusChange = async (taskId: number, newStatus: Task["status"]) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/status`, { status: newStatus }, getHeaders());
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success("Status updated");
    } catch (error: any) {
      console.error("Error updating status:", error);
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
      console.error("Error accepting task:", error);
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
      console.error("Error rejecting task:", error);
      toast.error(error.response?.data?.error || "Failed to reject task");
    }
  };

  // --- ASSIGNEE CHANGE (for non‑editing mode) ---
  const handleAssigneeChange = async (taskId: number, newAssigneeId: string) => {
    if (!newAssigneeId) return;
    try {
      await axios.put(`${API_BASE}/tasks/${taskId}`, { assigned_to: parseInt(newAssigneeId) }, getHeaders());
      toast.success("Assignee updated");
      await fetchData();
    } catch (error: any) {
      console.error("Error updating assignee:", error);
      toast.error(error.response?.data?.error || "Failed to update assignee");
    }
  };

  // Helpers for display
  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "High": return <AlertTriangle className="text-red-600" size={16} />;
      case "Medium": return <Shield className="text-blue-500" size={16} />;
      case "Low": return <Info className="text-slate-500" size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getPriorityStyles = (priority: Task["priority"]) => {
    switch (priority) {
      case "High": return "bg-red-50 border-red-200 text-red-700";
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && due.toDateString() !== today.toDateString();
  };

  // ============================================
  // RENDER
  // ============================================
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
                <h1 className="text-3xl font-serif italic text-[#003566]">
                  Task Manifest
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black mt-2">
                  Your Assignments & Personal Tasks
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
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-[#003566] text-white rounded-none h-12 px-8 uppercase text-xs tracking-widest font-black shadow-lg hover:bg-[#003566]/90"
                >
                  <Plus size={16} className="mr-2" /> {showCreateForm ? "Cancel" : "New Task"}
                </Button>
              </div>
            </div>

            {/* Four metric blocks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                onClick={() => handleBlockClick("active")}
                className={cn(
                  "p-6 border rounded-lg cursor-pointer transition-all",
                  blockFilter === "active" ? "bg-blue-50 border-blue-500" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <p className="text-sm uppercase tracking-wider text-slate-500">Active Tasks</p>
                <p className="text-4xl font-bold text-[#003566]">{metrics.activeTasks}</p>
              </div>
              <div
                onClick={() => handleBlockClick("priority")}
                className={cn(
                  "p-6 border rounded-lg cursor-pointer transition-all",
                  blockFilter === "priority" ? "bg-red-50 border-red-500" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <p className="text-sm uppercase tracking-wider text-slate-500">High Priority</p>
                <p className="text-4xl font-bold text-[#003566]">{metrics.highPriority}</p>
              </div>
              <div
                onClick={() => handleBlockClick("completed")}
                className={cn(
                  "p-6 border rounded-lg cursor-pointer transition-all",
                  blockFilter === "completed" ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <p className="text-sm uppercase tracking-wider text-slate-500">Completed Assets</p>
                <p className="text-4xl font-bold text-[#003566]">{metrics.completedAssets}</p>
              </div>
              <div
                onClick={() => handleBlockClick("efficiency")}
                className={cn(
                  "p-6 border rounded-lg cursor-pointer transition-all",
                  blockFilter === "efficiency" ? "bg-purple-50 border-purple-500" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <p className="text-sm uppercase tracking-wider text-slate-500">User Efficiency</p>
                <p className="text-4xl font-bold text-[#003566]">{metrics.efficiency}%</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Status:</span>
                <select
                  className="bg-white border border-slate-200 px-3 py-2 text-sm font-medium outline-none rounded"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as StatusFilter }))}
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
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as PriorityFilter }))}
                >
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Type:</span>
                <select
                  className="bg-white border border-slate-200 px-3 py-2 text-sm font-medium outline-none rounded"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as TypeFilter }))}
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

            {/* Conditional rendering: list or calendar */}
            {viewMode === "calendar" ? (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <CalendarView tasks={filteredTasks} />
              </div>
            ) : (
              <>
                {/* INLINE CREATE FORM */}
                {showCreateForm && (
                  <div className="border-2 border-blue-200 bg-blue-50 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-bold text-[#003566]">Create New Task</h3>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title *</label>
                          <input
                            type="text"
                            className="w-full border border-slate-300 rounded px-3 py-2"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Due Date *</label>
                          <input
                            type="date"
                            className="w-full border border-slate-300 rounded px-3 py-2"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description</label>
                        <textarea
                          className="w-full border border-slate-300 rounded px-3 py-2"
                          rows={2}
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Priority</label>
                          <select
                            className="w-full border border-slate-300 rounded px-3 py-2"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Type</label>
                          <select
                            className="w-full border border-slate-300 rounded px-3 py-2"
                            value={newTask.type}
                            onChange={(e) => {
                              const type = e.target.value as "personal" | "assigned";
                              setNewTask({ ...newTask, type, assigned_to: type === "personal" ? "" : newTask.assigned_to });
                            }}
                          >
                            <option value="personal">My own task</option>
                            <option value="assigned">Assign to employee</option>
                          </select>
                        </div>
                        {newTask.type === "assigned" && (
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Assign to</label>
                            <select
                              className="w-full border border-slate-300 rounded px-3 py-2"
                              value={newTask.assigned_to}
                              onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                              required
                            >
                              <option value="">Select employee</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                        <Button type="submit" className="bg-[#003566] text-white">Create Task</Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TASK LIST */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-12">
                      <Loader2 className="animate-spin text-[#003566]" size={32} />
                      <span className="ml-3 text-slate-600">Loading tasks...</span>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-slate-400">No tasks found</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => {
                      const isEditing = editingTaskId === task.id;

                      if (isEditing) {
                        // EDIT MODE – inline form for this task
                        return (
                          <div key={task.id} className="border-2 border-blue-200 bg-blue-50 p-6 rounded-lg space-y-4">
                            <h3 className="text-lg font-bold text-[#003566]">Edit Task</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title *</label>
                                <input
                                  type="text"
                                  className="w-full border border-slate-300 rounded px-3 py-2"
                                  value={editFormData.title}
                                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Due Date *</label>
                                <input
                                  type="date"
                                  className="w-full border border-slate-300 rounded px-3 py-2"
                                  value={editFormData.due_date}
                                  onChange={(e) => setEditFormData({ ...editFormData, due_date: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description</label>
                              <textarea
                                className="w-full border border-slate-300 rounded px-3 py-2"
                                rows={2}
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Priority</label>
                                <select
                                  className="w-full border border-slate-300 rounded px-3 py-2"
                                  value={editFormData.priority}
                                  onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as Task["priority"] })}
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Type</label>
                                <select
                                  className="w-full border border-slate-300 rounded px-3 py-2"
                                  value={editFormData.type}
                                  onChange={(e) => {
                                    const type = e.target.value as "personal" | "assigned";
                                    setEditFormData({ ...editFormData, type, assigned_to: type === "personal" ? "" : editFormData.assigned_to });
                                  }}
                                >
                                  <option value="personal">My own task</option>
                                  <option value="assigned">Assign to employee</option>
                                </select>
                              </div>
                              {editFormData.type === "assigned" && (
                                <div>
                                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Assign to</label>
                                  <select
                                    className="w-full border border-slate-300 rounded px-3 py-2"
                                    value={editFormData.assigned_to}
                                    onChange={(e) => setEditFormData({ ...editFormData, assigned_to: e.target.value })}
                                    required
                                  >
                                    <option value="">Select employee</option>
                                    {users.map((u) => (
                                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
                              <Button onClick={() => saveEditing(task.id)} className="bg-[#003566] text-white">
                                <Save size={16} className="mr-2" /> Save
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      // VIEW MODE
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={cn(
                            "flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 gap-4 border shadow-sm rounded-lg transition-all hover:shadow-md",
                            task.status === "Done" && "opacity-70",
                            task.priority === "High" && task.status !== "Done" && "border-l-4 border-l-red-600"
                          )}
                        >
                          {/* Left side: icon + details */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={cn(
                              "w-12 h-12 flex items-center justify-center rounded-full border-2 shrink-0",
                              getPriorityStyles(task.priority)
                            )}>
                              {getPriorityIcon(task.priority)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-bold text-[#003566] truncate max-w-xs">
                                  {task.title}
                                </h3>
                                <span className={cn(
                                  "px-2 py-1 text-xs font-bold uppercase border rounded",
                                  getPriorityStyles(task.priority)
                                )}>
                                  {task.priority}
                                </span>
                                <span className={cn(
                                  "px-2 py-1 text-xs font-bold uppercase border rounded",
                                  getStatusStyles(task.status)
                                )}>
                                  {task.status}
                                </span>
                                {task.assignment_status === "pending" && task.assigned_to === currentUser?.id && (
                                  <span className="px-2 py-1 text-xs font-bold uppercase bg-yellow-50 text-yellow-600 border border-yellow-200 rounded">
                                    Pending Acceptance
                                  </span>
                                )}
                              </div>

                              {task.description && (
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                {task.created_by_user && (
                                  <span className="flex items-center gap-1.5">
                                    <UserIcon size={14} />
                                    Created by: {task.created_by_user.name}
                                  </span>
                                )}
                                {task.assigned_to_user && task.type === "assigned" && (
                                  <span className="flex items-center gap-1.5">
                                    <UserIcon size={14} />
                                    Assigned to: {task.assigned_to_user.name}
                                  </span>
                                )}
                                <span className={cn(
                                  "flex items-center gap-1.5",
                                  isOverdue(task.due_date) && "text-red-600 font-bold"
                                )}>
                                  <CalendarIcon size={14} />
                                  Due: {formatDate(task.due_date)}
                                  {isOverdue(task.due_date) && " (OVERDUE)"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right side: actions and assignee dropdown */}
                          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                            {/* Assignee dropdown (visible only for assigned tasks and if user has permission) */}
                            {task.type === "assigned" && (task.created_by === currentUser?.id || currentUser?.role === "Partner") && (
                              <select
                                className="border border-slate-300 bg-white rounded px-2 py-1 text-sm"
                                value={task.assigned_to || ""}
                                onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                              >
                                <option value="">Unassigned</option>
                                {users.map((u) => (
                                  <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                              </select>
                            )}

                            {/* Accept/Reject for pending tasks */}
                            {task.assignment_status === "pending" && task.assigned_to === currentUser?.id && (
                              <>
                                <Button
                                  onClick={() => handleAcceptTask(task.id)}
                                  className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                  size="sm"
                                >
                                  <CheckCircle2 size={16} className="mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  onClick={() => handleRejectTask(task.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X size={16} className="mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}

                            {/* Status change buttons */}
                            {task.assignment_status !== "pending" && task.status !== "Done" ? (
                              <Button
                                onClick={() => handleStatusChange(task.id, "Done")}
                                className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                size="sm"
                              >
                                <CheckCircle2 size={16} className="mr-2" />
                                Mark Done
                              </Button>
                            ) : task.assignment_status !== "pending" && task.status === "Done" ? (
                              <Button
                                onClick={() => handleStatusChange(task.id, "To Do")}
                                variant="outline"
                                size="sm"
                              >
                                Re‑open
                              </Button>
                            ) : null}

                            {/* Edit/Delete for creator */}
                            {task.created_by === currentUser?.id && (
                              <>
                                <Button
                                  onClick={() => startEditing(task)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit2 size={16} />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteTask(task.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
}