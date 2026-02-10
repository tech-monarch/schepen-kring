"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, AlertCircle, Clock, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  task?: any;
  isAdmin?: boolean;
  users?: any[];
  yachts?: any[];
}

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task, 
  isAdmin = false, 
  users = [], 
  yachts = [] 
}: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Urgent" | "Critical",
    status: "To Do" as "To Do" | "In Progress" | "Done",
    assigned_to: "",
    yacht_id: "",
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
        assigned_to: task.assigned_to || "",
        yacht_id: task.yacht_id || "",
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
        yacht_id: "",
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
    
    if (formData.type === "assigned" && !formData.assigned_to && isAdmin) {
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

    // For non-admin personal tasks, auto-assign to current user
    const submitData = { ...formData };
    if (!isAdmin && submitData.type === "personal") {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        submitData.assigned_to = user.id;
      }
    }

    onSubmit(submitData);
  };

  const handlePrioritySelect = (priority: "Low" | "Medium" | "High" | "Urgent" | "Critical") => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#003566]">
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="text-slate-500" size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Type */}
          {isAdmin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Task Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "assigned" }))}
                  className={cn(
                    "flex-1 py-3 px-4 border rounded-lg text-center transition-all",
                    formData.type === "assigned"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  Assigned Task
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "personal" }))}
                  className={cn(
                    "flex-1 py-3 px-4 border rounded-lg text-center transition-all",
                    formData.type === "personal"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  Personal Task
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                errors.title ? "border-red-500" : "border-slate-200"
              )}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Priority *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(["Low", "Medium", "High", "Urgent", "Critical"] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handlePrioritySelect(priority)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-lg transition-all",
                      formData.priority === priority
                        ? priority === "Critical" ? "border-red-500 bg-red-50 text-red-700"
                        : priority === "Urgent" ? "border-orange-500 bg-orange-50 text-orange-700"
                        : priority === "High" ? "border-amber-500 bg-amber-50 text-amber-700"
                        : priority === "Medium" ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-500 bg-slate-50 text-slate-700"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {getPriorityIcon(priority)}
                    <span className="text-xs mt-1">{priority}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className={cn(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                  errors.due_date ? "border-red-500" : "border-slate-200"
                )}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.due_date && (
                <p className="text-red-500 text-sm">{errors.due_date}</p>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assign to */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Assign to {formData.type === "assigned" && "*"}
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                    errors.assigned_to ? "border-red-500" : "border-slate-200"
                  )}
                  disabled={formData.type === "personal"}
                >
                  <option value="">Select user</option>
                  {users
                    .filter(user => user.role !== "Customer")
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                </select>
                {errors.assigned_to && (
                  <p className="text-red-500 text-sm">{errors.assigned_to}</p>
                )}
              </div>

              {/* Yacht */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Yacht (Optional)
                </label>
                <select
                  value={formData.yacht_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, yacht_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select yacht</option>
                  {yachts.map(yacht => (
                    <option key={yacht.id} value={yacht.id}>
                      {yacht.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <div className="flex gap-4">
              {(["To Do", "In Progress", "Done"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status }))}
                  className={cn(
                    "flex-1 py-3 px-4 border rounded-lg text-center transition-all",
                    formData.status === status
                      ? status === "Done" ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : status === "In Progress" ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-500 bg-slate-50 text-slate-700"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-8 py-3 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 py-3 bg-[#003566] text-white hover:bg-[#003566]/90"
            >
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}