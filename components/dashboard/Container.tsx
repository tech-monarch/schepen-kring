"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  ClipboardList,
  Ship,
  Anchor,
  Settings,
  CheckCircle2,
  Clock,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

interface Task {
  id: number;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  deadline: string;
  priority: "High" | "Medium" | "Low";
}

export default function CleanDashboardContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Crew Member");

  const API_BASE = "https://schepen-kring.nl/api";
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
  };

  useEffect(() => {
    // Simulating fetching tasks and user info
    const fetchData = async () => {
      try {
        // Replace with your actual tasks endpoint when ready
        // const res = await axios.get(`${API_BASE}/my-tasks`, { headers });
        // setTasks(res.data);

        // Mock data for display
        setTasks([
          {
            id: 1,
            title: "Engine Check: Blue Horizon",
            status: "In Progress",
            deadline: "Today",
            priority: "High",
          },
          {
            id: 2,
            title: "Clean Deck: Silver Sea",
            status: "Pending",
            deadline: "Tomorrow",
            priority: "Medium",
          },
          {
            id: 3,
            title: "Inventory Restock",
            status: "Pending",
            deadline: "Feb 5",
            priority: "Low",
          },
        ]);
        setUserName(localStorage.getItem("user_name") || "Crew Member");
      } catch (err) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status !== "Completed").length,
    new: 1, // Example for "New Task" notification
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 min-h-screen pb-20">
      <Toaster position="top-right" />

      {/* WELCOME HEADER */}
      <div className="border-b border-slate-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">
            Welcome back, {userName}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">
            Fleet Operations & Task Overview
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-50 border border-slate-200 px-6 py-2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Active Tasks
            </p>
            <p className="text-xl font-serif italic text-[#003566]">
              {stats.pending}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* TASK MANAGEMENT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#003566] flex items-center gap-2">
              <ClipboardList size={18} /> Assigned Manifest
            </h2>
            {stats.new > 0 && (
              <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 uppercase animate-pulse">
                {stats.new} New Task Assigned
              </span>
            )}
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group bg-white border border-slate-200 p-5 hover:border-blue-400 transition-all shadow-sm flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 flex items-center justify-center border",
                      task.status === "In Progress"
                        ? "bg-blue-50 border-blue-100 text-blue-600"
                        : "bg-slate-50 border-slate-100 text-slate-400",
                    )}
                  >
                    {task.status === "In Progress" ? (
                      <Clock size={20} />
                    ) : (
                      <Anchor size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                      {task.title}
                    </h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[9px] text-slate-400 font-medium italic">
                        Due: {task.deadline}
                      </span>
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase px-2",
                          task.priority === "High"
                            ? "text-red-500"
                            : "text-slate-400",
                        )}
                      >
                        • {task.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="group-hover:text-blue-600 transition-colors"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* NAVIGATION SHORTCUTS */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#003566] flex items-center gap-2">
            <LayoutDashboard size={18} /> Fleet Access
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <Link href="/nl/dashboard/yachts">
              <div className="bg-[#003566] p-8 text-white group cursor-pointer relative overflow-hidden transition-transform hover:-translate-y-1">
                <Ship className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-70">
                  Inventory
                </p>
                <h3 className="text-2xl font-serif italic">The Yacht List</h3>
                <div className="mt-4 flex items-center text-[9px] font-bold uppercase tracking-widest border-t border-white/20 pt-4">
                  View Catalog <ChevronRight size={12} className="ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/nl/dashboard/fleet">
              <div className="bg-white border border-slate-200 p-8 group cursor-pointer hover:border-blue-400 transition-all">
                <Anchor className="text-[#003566] mb-4" size={28} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                  Status
                </p>
                <h3 className="text-xl font-serif italic text-[#003566]">
                  Active Fleet
                </h3>
                <p className="text-[10px] text-slate-500 mt-2 uppercase font-medium leading-relaxed">
                  Real-time location and status of all vessels.
                </p>
              </div>
            </Link>

            <Link href="/nl/dashboard/fleet-management">
              <div className="bg-slate-50 border border-slate-200 p-8 group cursor-pointer hover:bg-white hover:border-blue-400 transition-all">
                <Settings
                  className="text-slate-400 group-hover:text-blue-600 mb-4 transition-colors"
                  size={28}
                />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                  Operations
                </p>
                <h3 className="text-xl font-serif italic text-slate-700">
                  Fleet Management
                </h3>
                <p className="text-[10px] text-slate-500 mt-2 uppercase font-medium">
                  Maintenance logs and logistics control.
                </p>
              </div>
            </Link>
          </div>

          {/* SECURITY NOTE */}
          <div className="p-6 bg-blue-50/50 border border-blue-100 mt-10">
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
              <p className="text-[9px] text-blue-800 leading-relaxed uppercase font-bold tracking-widest">
                All task completions are timestamped and verified by the Command
                Center.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
