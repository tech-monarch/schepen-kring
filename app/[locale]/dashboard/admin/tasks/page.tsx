// app/[locale]/dashboard/admin/tasks/page.tsx
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
  Filter,
  Users,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

// ============================================
// INTERFACES
// ============================================
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
  type: "assigned" | "personal";
  user_id?: number;
  created_at: string;
  updated_at: string;
}

type ViewMode = "list" | "calendar";
type StatusFilter = "all" | "To Do" | "In Progress" | "Done";
type PriorityFilter = "all" | "Low" | "Medium" | "High" | "Urgent" | "Critical";
type TypeFilter = "all" | "assigned" | "personal";

// ============================================
// CALENDAR VIEW COMPONENT
// ============================================
interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
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
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
      return taskDate.getDate() === day &&
             taskDate.getMonth() === currentDate.getMonth() &&
             taskDate.getFullYear() === currentDate.getFullYear();
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
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - startingDay + i + 1)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      });
    }
    
    const totalCells = 42;
    for (let i = 1; days.length < totalCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      });
    }
    
    return days;
  };

  const calendarGrid = getCalendarGrid();
  const today = new Date();

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 shadow-xl shadow-blue-50/50">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <button
            onClick={prevMonth}
            className="p-2.5 hover:bg-slate-100/80 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="text-slate-600" size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-white to-slate-50"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2.5 hover:bg-slate-100/80 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ChevronRight className="text-slate-600" size={20} />
          </button>
          <h2 className="text-2xl font-bold text-[#003566] ml-6 font-serif italic">
            {getMonthName(currentDate)}
          </h2>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 bg-gradient-to-br from-slate-100/50 to-white p-2 rounded-2xl">
        {weekDays.map(day => (
          <div key={day} className="bg-white/60 p-3 text-center text-sm font-semibold text-slate-700 rounded-lg backdrop-blur-sm">
            {day}
          </div>
        ))}
        
        {calendarGrid.map(({ day, isCurrentMonth, date }, index) => {
          const dayTasks = getTasksForDay(day);
          const isToday = date.getDate() === today.getDate() &&
                         date.getMonth() === today.getMonth() &&
                         date.getFullYear() === today.getFullYear();
          
          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-3 border border-slate-200/50 rounded-xl transition-all duration-300",
                !isCurrentMonth && "bg-slate-50/30",
                isToday && "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/70",
                isCurrentMonth && !isToday && "bg-white/60 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5"
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={cn(
                  "text-sm font-semibold",
                  isCurrentMonth ? "text-slate-900" : "text-slate-400",
                  isToday && "text-blue-600 font-bold bg-white px-2 py-1 rounded-full"
                )}>
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2.5 py-1 rounded-full font-medium shadow-sm">
                    {dayTasks.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5 max-h-20 overflow-y-auto">
                {dayTasks.slice(0, 3).map(task => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-xs p-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md border-l-4"
                    style={{
                      borderLeftColor: getPriorityColor(task.priority),
                      backgroundColor: `${getPriorityColor(task.priority)}08`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick?.(task);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {task.priority === "Critical" && <AlertTriangle className="text-red-600" size={10} />}
                      {task.priority === "Urgent" && <AlertCircle className="text-orange-500" size={10} />}
                      <span className="font-medium truncate">{task.title}</span>
                    </div>
                  </motion.div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-slate-500 text-center pt-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200/50">
        {[
          { color: "bg-blue-600", label: "Today" },
          { color: "bg-red-600", label: "Critical" },
          { color: "bg-orange-500", label: "Urgent" },
          { color: "bg-blue-500", label: "Medium" },
          { color: "bg-emerald-500", label: "Done" },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}></div>
            <span className="text-sm text-slate-600 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TASK MODAL COMPONENT
// ============================================
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  task?: Task;
  users: User[];
}

function TaskModal({ isOpen, onClose, onSubmit, task, users }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as Task["priority"],
    status: "To Do" as Task["status"],
    assigned_to: "",
    due_date: new Date().toISOString().split("T")[0],
    type: "assigned" as "assigned" | "personal",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        status: task.status || "To Do",
        assigned_to: task.assigned_to?.toString() || "",
        due_date: task.due_date ? task.due_date.split("T")[0] : new Date().toISOString().split("T")[0],
        type: task.type || "assigned",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        assigned_to: "",
        due_date: new Date().toISOString().split("T")[0],
        type: "assigned",
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }
    
    if (formData.type === "assigned" && !formData.assigned_to) {
      newErrors.assigned_to = "Please assign to a user";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const apiData = {
      ...formData,
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
    };

    onSubmit(apiData);
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
      case "Critical": return "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-700 shadow-red-100";
      case "Urgent": return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700 shadow-orange-100";
      case "High": return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-700 shadow-amber-100";
      case "Medium": return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700 shadow-blue-100";
      case "Low": return "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-700 shadow-slate-100";
      default: return "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-700";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/50"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-200/50 bg-gradient-to-r from-white to-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-3xl font-bold text-[#003566] font-serif italic">
              {task ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {task ? "Update task details" : "Fill in the details to create a new task"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100/80 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <X className="text-slate-500" size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Task Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Task Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: "assigned" }))}
                className={cn(
                  "flex-1 py-4 px-6 border-2 rounded-xl text-center transition-all duration-300 hover:scale-[1.02] active:scale-95",
                  formData.type === "assigned"
                    ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-lg shadow-blue-100"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                )}
              >
                <div className="font-semibold">Assigned Task</div>
                <div className="text-xs text-slate-500 mt-1">Assign to team member</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: "personal" }))}
                className={cn(
                  "flex-1 py-4 px-6 border-2 rounded-xl text-center transition-all duration-300 hover:scale-[1.02] active:scale-95",
                  formData.type === "personal"
                    ? "border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 shadow-lg shadow-purple-100"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                )}
              >
                <div className="font-semibold">Personal Task</div>
                <div className="text-xs text-slate-500 mt-1">For yourself</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={cn(
                "w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-lg",
                errors.title ? "border-red-500 bg-red-50/50" : "border-slate-200 hover:border-slate-300"
              )}
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle size={14} />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-300 resize-none"
              placeholder="Add details, instructions, or notes..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Priority */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Priority *
              </label>
              <div className="grid grid-cols-5 gap-3">
                {(["Low", "Medium", "High", "Urgent", "Critical"] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handlePrioritySelect(priority)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95",
                      formData.priority === priority
                        ? `${getPriorityColor(priority)} shadow-lg`
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    {getPriorityIcon(priority)}
                    <span className="text-xs font-semibold mt-2">{priority}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Due Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className={cn(
                    "w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300",
                    errors.due_date ? "border-red-500 bg-red-50/50" : "border-slate-200 hover:border-slate-300"
                  )}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.due_date && (
                <p className="text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle size={14} />
                  {errors.due_date}
                </p>
              )}
            </div>
          </div>

          {/* Assign to */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Assign to {formData.type === "assigned" && "*"}
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                className={cn(
                  "w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none",
                  errors.assigned_to ? "border-red-500 bg-red-50/50" : "border-slate-200 hover:border-slate-300",
                  formData.type === "personal" && "opacity-50 cursor-not-allowed bg-slate-50"
                )}
                disabled={formData.type === "personal"}
              >
                <option value="" className="text-slate-400">Select team member</option>
                {users.length > 0 ? (
                  users.map(user => (
                    <option key={user.id} value={user.id} className="text-slate-700">
                      {user.name} ({user.role})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No users available</option>
                )}
              </select>
            </div>
            {errors.assigned_to && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle size={14} />
                {errors.assigned_to}
              </p>
            )}
            {formData.type === "personal" && (
              <p className="text-sm text-slate-500 bg-slate-50/50 p-3 rounded-lg">
                Personal tasks will be assigned to you automatically
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Status
            </label>
            <div className="flex gap-4">
              {(["To Do", "In Progress", "Done"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status }))}
                  className={cn(
                    "flex-1 py-4 px-6 border-2 rounded-xl text-center transition-all duration-300 hover:scale-[1.02] active:scale-95 font-semibold",
                    formData.status === status
                      ? status === "Done" 
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 shadow-lg shadow-emerald-100"
                        : status === "In Progress" 
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-lg shadow-blue-100"
                          : "border-slate-500 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 shadow-lg shadow-slate-100"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-8 border-t border-slate-200/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-8 py-3 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-[#003566] to-blue-800 text-white hover:from-[#003566]/90 hover:to-blue-800/90 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ============================================
// MAIN ADMIN TASKS PAGE
// ============================================
export default function AdminTaskBoardPage() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showDone, setShowDone] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as StatusFilter,
    priority: "all" as PriorityFilter,
    type: "all" as TypeFilter,
  });

  const API_BASE = "https://schepen-kring.nl/api";

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      console.log("Fetching tasks with token:", token ? "Token exists" : "No token");
      
      // Fetch tasks
      const tasksRes = await axios.get(`${API_BASE}/tasks`, {
        headers: token ? { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        } : {}
      });
      
      console.log("Tasks response:", tasksRes.data);

      // Fetch users - FIXED: Using correct endpoint
      const usersRes = await axios.get(`${API_BASE}/users/staff`, {
        headers: token ? { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        } : {}
      });
      
      console.log("Users response:", usersRes.data);

      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      
    } catch (error: any) {
      console.error("Error fetching data:", error);
      
      // Detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to load data";
      
      // Show more specific error message
      if (error.response?.status === 500) {
        toast.error("Server error: Please check backend logs");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // Redirect to login if needed
        // window.location.href = '/login';
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sort tasks
  const sortedTasks = useMemo(() => {
    let sortableItems = [...tasks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
    }
    return sortableItems;
  }, [tasks, sortConfig]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...sortedTasks];

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assigned_to_user?.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply showDone filter
    if (!showDone) {
      filtered = filtered.filter(task => task.status !== "Done");
    }

    return filtered;
  }, [sortedTasks, filters, showDone]);

  // Handle create/update task
  const handleTaskSubmit = async (taskData: any) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Ensure assigned_to is a number or null
      const dataToSend = {
        ...taskData,
        assigned_to: taskData.assigned_to ? parseInt(taskData.assigned_to) : null,
      };

      console.log("Submitting task data:", dataToSend);

      if (editingTask) {
        await axios.put(`${API_BASE}/tasks/${editingTask.id}`, dataToSend, { headers });
        toast.success("Task updated successfully");
      } else {
        await axios.post(`${API_BASE}/tasks`, dataToSend, { headers });
        toast.success("Task created successfully");
      }

      await fetchData();
      setIsModalOpen(false);
      setEditingTask(undefined);
      
    } catch (error: any) {
      console.error("Error saving task:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to save task";
      toast.error(errorMessage);
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.delete(`${API_BASE}/tasks/${taskId}`, { headers });
      toast.success("Task deleted successfully");
      await fetchData();
      
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error(error.response?.data?.error || "Failed to delete task");
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId: number, newStatus: Task["status"]) => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.patch(
        `${API_BASE}/tasks/${taskId}/status`,
        { status: newStatus },
        { headers }
      );

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success("Status updated");
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  // Handle sort
  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get priority icon
  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "Critical": return <AlertTriangle className="text-red-600" size={18} />;
      case "Urgent": return <AlertCircle className="text-orange-500" size={18} />;
      case "High": return <AlertTriangle className="text-amber-500" size={18} />;
      case "Medium": return <Shield className="text-blue-500" size={18} />;
      case "Low": return <Info className="text-slate-500" size={18} />;
      default: return <Info size={18} />;
    }
  };

  // Get priority styles
  const getPriorityStyles = (priority: Task["priority"]) => {
    switch (priority) {
      case "Critical": return "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-700";
      case "Urgent": return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700";
      case "High": return "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-700";
      case "Medium": return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700";
      case "Low": return "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-700";
      default: return "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-700";
    }
  };

  // Get status styles
  const getStatusStyles = (status: Task["status"]) => {
    switch (status) {
      case "Done": return "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200";
      case "In Progress": return "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200";
      case "To Do": return "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 border-slate-200";
      default: return "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if overdue
  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && due.toDateString() !== today.toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-[#003566]">
      <DashboardHeader />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#003566',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />
      
      <div className="flex pt-20">
        <motion.main
          animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
          className="flex-1 p-6 min-h-[calc(100vh-80px)] z-30 -mt-20"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-8 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-blue-100/50 border border-white/50"
            >
              <div>
                <h1 className="text-5xl font-serif italic text-[#003566]">
                  Task Oversight
                </h1>
                <p className="text-xs uppercase tracking-widest text-blue-600 font-black mt-2 bg-gradient-to-r from-blue-100 to-cyan-100 inline-block px-4 py-2 rounded-full">
                  Fleet Management & Command
                </p>
              </div>

              <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="SEARCH TASKS..."
                    className="w-full bg-white/80 backdrop-blur-sm border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold tracking-wider uppercase focus:border-blue-400 outline-none rounded-xl transition-all duration-300 hover:border-slate-300"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "rounded-lg h-11 px-5 transition-all duration-300",
                      viewMode === "list" 
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    )}
                  >
                    <List size={18} className="mr-2" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "default" : "ghost"}
                    onClick={() => setViewMode("calendar")}
                    className={cn(
                      "rounded-lg h-11 px-5 transition-all duration-300",
                      viewMode === "calendar" 
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    )}
                  >
                    <CalendarDays size={18} className="mr-2" />
                    Calendar
                  </Button>
                </div>

                {/* New Task Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => {
                      setEditingTask(undefined);
                      setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-[#003566] to-blue-800 text-white rounded-xl h-12 px-8 uppercase text-sm tracking-widest font-black shadow-2xl shadow-blue-900/30 hover:from-[#003566]/90 hover:to-blue-800/90 transition-all duration-300"
                  >
                    <Plus size={18} className="mr-3" /> New Task
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-100/50 shadow-lg">
                <div className="text-3xl font-bold text-[#003566]">{tasks.length}</div>
                <div className="text-sm text-slate-600">Total Tasks</div>
              </div>
              <div className="bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100/50 shadow-lg">
                <div className="text-3xl font-bold text-emerald-600">
                  {tasks.filter(t => t.status === "Done").length}
                </div>
                <div className="text-sm text-slate-600">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-white to-amber-50/50 backdrop-blur-sm p-6 rounded-2xl border border-amber-100/50 shadow-lg">
                <div className="text-3xl font-bold text-amber-600">
                  {tasks.filter(t => t.priority === "High" || t.priority === "Urgent" || t.priority === "Critical").length}
                </div>
                <div className="text-sm text-slate-600">High Priority</div>
              </div>
              <div className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-sm p-6 rounded-2xl border border-rose-100/50 shadow-lg">
                <div className="text-3xl font-bold text-rose-600">
                  {tasks.filter(t => isOverdue(t.due_date)).length}
                </div>
                <div className="text-sm text-slate-600">Overdue</div>
              </div>
            </div>

            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-4 p-6 bg-gradient-to-r from-white/90 to-slate-50/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Filters:</span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  className="bg-white border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none rounded-xl transition-all duration-300 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as StatusFilter }))}
                >
                  <option value="all">All Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <select
                  className="bg-white border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none rounded-xl transition-all duration-300 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as PriorityFilter }))}
                >
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <select
                  className="bg-white border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none rounded-xl transition-all duration-300 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as TypeFilter }))}
                >
                  <option value="all">All Types</option>
                  <option value="assigned">Assigned</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              {/* Show Done Toggle */}
              <Button
                variant={showDone ? "default" : "outline"}
                onClick={() => setShowDone(!showDone)}
                className="gap-3 ml-auto px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {showDone ? <EyeOff size={18} /> : <Eye size={18} />}
                {showDone ? "Hide Done" : "Show Done"}
              </Button>

              {/* Sort Button */}
              <Button
                variant="outline"
                onClick={() => handleSort('due_date')}
                className="gap-3 px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {sortConfig?.direction === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                Sort by Date
              </Button>
            </motion.div>

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg">
                <Loader2 className="animate-spin text-[#003566]" size={48} />
                <span className="ml-3 text-lg text-slate-600 mt-4">Loading tasks...</span>
                <p className="text-sm text-slate-400 mt-2">Fetching data from server</p>
              </div>
            ) : viewMode === "list" ? (
              /* List View */
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-16 border-2 border-dashed border-slate-200/50 rounded-2xl bg-white/60 backdrop-blur-sm"
                    >
                      <div className="text-5xl mb-4">📋</div>
                      <p className="text-xl text-slate-400 font-semibold">No tasks found</p>
                      <p className="text-sm text-slate-300 mt-2">
                        {filters.search || filters.status !== "all" || filters.priority !== "all"
                          ? "Try changing your filters"
                          : "Create your first task"}
                      </p>
                      <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-6 bg-gradient-to-r from-[#003566] to-blue-800 text-white px-8 py-3 rounded-xl"
                      >
                        <Plus size={18} className="mr-2" />
                        Create New Task
                      </Button>
                    </motion.div>
                  ) : (
                    filteredTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        className={cn(
                          "flex flex-col md:flex-row items-start md:items-center justify-between p-8 gap-6 border-2 rounded-2xl transition-all duration-300",
                          task.status === "Done" 
                            ? "bg-gradient-to-r from-white to-emerald-50/30 border-emerald-200/50" 
                            : "bg-gradient-to-r from-white to-blue-50/30 border-blue-200/50",
                          task.priority === "Critical" && task.status !== "Done" && "border-l-8 border-l-red-600 shadow-xl shadow-red-100/50"
                        )}
                      >
                        {/* Left Section */}
                        <div className="flex items-start gap-6 flex-1">
                          {/* Priority Icon */}
                          <div className={cn(
                            "w-16 h-16 flex items-center justify-center rounded-2xl border-4 shadow-lg",
                            getPriorityStyles(task.priority)
                          )}>
                            {getPriorityIcon(task.priority)}
                          </div>

                          {/* Task Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="text-xl font-bold text-[#003566]">
                                {task.title}
                              </h3>
                              <span className={cn(
                                "px-3 py-1.5 text-xs font-black uppercase border-2 rounded-lg",
                                getPriorityStyles(task.priority)
                              )}>
                                {task.priority}
                              </span>
                              <span className={cn(
                                "px-3 py-1.5 text-xs font-black uppercase border-2 rounded-lg",
                                getStatusStyles(task.status)
                              )}>
                                {task.status}
                              </span>
                              {task.type === "personal" && (
                                <span className="px-3 py-1.5 text-xs font-black uppercase bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border-2 border-purple-200 rounded-lg">
                                  Personal
                                </span>
                              )}
                            </div>

                            {task.description && (
                              <p className="text-slate-600 mb-4 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              {task.assigned_to_user && (
                                <span className="flex items-center gap-2 bg-slate-50/50 px-4 py-2 rounded-lg">
                                  <UserIcon size={16} className="text-slate-400" />
                                  <span className="font-semibold">{task.assigned_to_user.name}</span>
                                  <span className="text-xs bg-slate-200/50 px-2 py-1 rounded">
                                    {task.assigned_to_user.role}
                                  </span>
                                </span>
                              )}
                              <span className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg",
                                isOverdue(task.due_date) 
                                  ? "bg-gradient-to-r from-rose-50 to-rose-100/50 text-rose-600 font-bold" 
                                  : "bg-blue-50/50"
                              )}>
                                <CalendarIcon size={16} className={isOverdue(task.due_date) ? "text-rose-500" : "text-slate-400"} />
                                Due: {formatDate(task.due_date)}
                                {isOverdue(task.due_date) && (
                                  <span className="ml-2 text-xs bg-rose-500 text-white px-2 py-1 rounded-full">
                                    OVERDUE
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-3">
                          {/* Status Change */}
                          {task.status !== "Done" ? (
                            <Button
                              onClick={() => handleStatusChange(task.id, "Done")}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-2 border-emerald-500 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                              <CheckCircle2 size={18} className="mr-2" />
                              Mark Done
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleStatusChange(task.id, "To Do")}
                              variant="outline"
                              className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                              Re-open
                            </Button>
                          )}

                          {/* Edit Button */}
                          <Button
                            onClick={() => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            variant="outline"
                            className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl p-3 transition-all duration-300 hover:scale-105 active:scale-95"
                          >
                            <Edit2 size={18} />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            onClick={() => handleDeleteTask(task.id)}
                            variant="outline"
                            className="border-2 border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300 rounded-xl p-3 transition-all duration-300 hover:scale-105 active:scale-95"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Calendar View */
              <div className="bg-white/90 backdrop-blur-sm border-2 border-slate-200/50 rounded-2xl shadow-xl overflow-hidden">
                <CalendarView 
                  tasks={filteredTasks} 
                  onTaskClick={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </motion.main>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        users={users}
      />
    </div>
  );
}