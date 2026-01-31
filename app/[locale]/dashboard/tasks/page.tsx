"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ShieldAlert, User, ChevronRight, CheckCircle2, 
  Trash2, Zap, LayoutGrid, List, BarChart2, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: "Todo" | "In Progress" | "Review" | "Completed";
  type: "assigned" | "personal";
  priority: string;
}

export default function ReadableTaskManifest() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Initial Data Load
    const assigned: Task[] = [
      { id: "ADM-99", title: "EMERGENCY: PORT ENGINE COOLING SYNC", status: "In Progress", type: "assigned", priority: "Urgent" },
      { id: "ADM-101", title: "Quarterly Hull Inspection: M/Y Sovereign", status: "Todo", type: "assigned", priority: "High" },
    ];
    const saved = localStorage.getItem("personal_tasks");
    setTasks([...assigned, ...(saved ? JSON.parse(saved) : [])]);
  }, []);

  // --- DATA ANALYSIS CALCULATIONS ---
  const analysis = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = total - completed;
    const admin = tasks.filter(t => t.type === "assigned").length;
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, admin, efficiency };
  }, [tasks]);

  const advanceStatus = (id: string) => {
    const sequence: Task["status"][] = ["Todo", "In Progress", "Review", "Completed"];
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextIdx = (sequence.indexOf(t.status) + 1) % sequence.length;
        return { ...t, status: sequence[nextIdx] };
      }
      return t;
    }));
  };

  const addPersonal = () => {
    if (!inputValue.trim()) return;
    const newTask: Task = {
      id: `USR-${Date.now()}`,
      title: inputValue,
      status: "Todo",
      type: "personal",
      priority: "Normal"
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    localStorage.setItem("personal_tasks", JSON.stringify(updated.filter(t => t.type === "personal")));
    setInputValue("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans selection:bg-[#c5a572] selection:text-black">
      
      {/* 1. DATA ANALYSIS HEADER (BIG & READABLE) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#111] border-l-4 border-[#c5a572] p-5">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Efficiency</p>
          <p className="text-3xl font-bold">{analysis.efficiency}%</p>
        </div>
        <div className="bg-[#111] border-l-4 border-blue-500 p-5">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Active Missions</p>
          <p className="text-3xl font-bold">{analysis.pending}</p>
        </div>
        <div className="bg-[#111] border-l-4 border-white/20 p-5">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Admin Directives</p>
          <p className="text-3xl font-bold">{analysis.admin}</p>
        </div>
        <div className="bg-[#c5a572] p-5 text-black">
          <p className="text-black/60 text-[10px] uppercase font-bold tracking-widest mb-1">Completed</p>
          <p className="text-3xl font-bold">{analysis.completed}</p>
        </div>
      </div>

      {/* 2. TASK INPUT */}
      <div className="flex gap-2 mb-10">
        <input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a personal task and press enter..."
          onKeyDown={(e) => e.key === "Enter" && addPersonal()}
          className="flex-1 bg-[#111] border border-white/10 px-6 py-4 text-sm focus:border-[#c5a572] outline-none transition-all placeholder:text-gray-700"
        />
        <button onClick={addPersonal} className="bg-white text-black px-8 font-bold text-xs uppercase hover:bg-[#c5a572] transition-all">
          Add
        </button>
      </div>

      {/* 3. TASK LIST */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-4 py-2 text-[10px] uppercase font-black text-gray-600 tracking-[0.2em]">
          <span>Task Manifest</span>
          <span>Click Status to Advance</span>
        </div>

        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div 
              layout
              key={task.id}
              className={cn(
                "group flex flex-col md:flex-row items-center justify-between p-5 gap-4 transition-all border",
                task.type === "assigned" ? "bg-[#161410] border-[#c5a572]/30" : "bg-[#0d0d0d] border-white/5",
                task.status === "Completed" && "opacity-40 grayscale"
              )}
            >
              <div className="flex items-center gap-5 flex-1 w-full">
                {/* BIG TYPE INDICATOR */}
                <div className={cn(
                  "px-3 py-2 text-[10px] font-black uppercase flex flex-col items-center justify-center min-w-[70px]",
                  task.type === "assigned" ? "bg-[#c5a572] text-black" : "bg-white/10 text-white"
                )}>
                  {task.type === "assigned" ? <ShieldAlert size={14}/> : <User size={14}/>}
                  <span className="mt-1">{task.type}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold tracking-tight text-white leading-tight">
                    {task.title}
                  </h3>
                  <p className="text-[10px] font-mono text-gray-500 uppercase">ID: {task.id}</p>
                </div>
              </div>

              {/* EASY SWITCHER BUTTON */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <button 
                  onClick={() => advanceStatus(task.id)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3",
                    task.status === "Todo" && "border-white/20 text-white hover:bg-white hover:text-black",
                    task.status === "In Progress" && "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
                    task.status === "Review" && "border-[#c5a572] text-[#c5a572] hover:bg-[#c5a572] hover:text-black",
                    task.status === "Completed" && "border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black"
                  )}
                >
                  <Clock size={12} className={task.status === "In Progress" ? "animate-spin" : ""} />
                  {task.status}
                </button>

                {task.type === "personal" && (
                  <button 
                    onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                    className="text-gray-700 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}