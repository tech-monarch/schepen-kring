"use client";

import { useState } from "react";
import { 
  CheckSquare, Clock, AlertCircle, Plus, Filter, 
  MoreHorizontal, User as UserIcon, PieChart, Activity,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// ADD THIS IMPORT BELOW
import { motion } from "framer-motion"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminTaskBoardPage() {
  const tasks = [
    {
      id: "TSK-101",
      title: "Pre-Sail Inspection: M/Y Sovereign",
      priority: "high",
      status: "In Progress",
      assignedTo: "Capt. Marco Rossi",
      dueDate: "Today, 14:00",
      category: "Maintenance",
      completion: 65
    },
    {
      id: "TSK-109",
      title: "Fuel Logistics: M/Y Azure Sky",
      priority: "urgent",
      status: "Blocked",
      assignedTo: "Julian Vane",
      dueDate: "Immediate",
      category: "Operations",
      completion: 10
    }
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-white">Task Oversight</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a572] font-black mt-2">
            Fleet Intelligence & Command
          </p>
        </div>
        <div className="flex gap-3">
            <Button className="bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-none uppercase text-[10px] tracking-widest font-bold h-12 px-6">
                <PieChart className="mr-2 w-4 h-4" /> Reports
            </Button>
            <Button className="bg-[#c5a572] hover:bg-white text-black rounded-none uppercase text-[10px] tracking-[0.2em] font-bold h-12 px-8 transition-all">
                <Plus className="mr-2 w-4 h-4" /> New Assignment
            </Button>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Staff Efficiency", value: "94%", color: "text-white", sub: "Operational peak" },
          { label: "Active Blockers", value: "03", color: "text-red-500", sub: "Urgent attention" },
          { label: "Assigned Crew", value: "12", color: "text-[#c5a572]", sub: "Active on deck" },
          { label: "Completed", value: "08", color: "text-emerald-500", sub: "Past 24 hours" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0d0d0d] border border-white/5 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <Activity size={40} className={stat.color} />
            </div>
            <p className="text-[8px] uppercase tracking-widest text-gray-500 mb-1 font-black">{stat.label}</p>
            <p className={cn("text-2xl font-serif mb-1", stat.color)}>{stat.value}</p>
            <p className="text-[9px] text-gray-600 font-medium italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Task List */}
      <div className="bg-[#0d0d0d] border border-white/5 overflow-hidden">
        {/* Fixed class bg-white/2 */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex gap-6">
            {["Live Monitoring", "Staff Performance"].map((t) => (
              <button key={t} className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-500 hover:text-[#c5a572] transition-colors">
                {t}
              </button>
            ))}
          </div>
          <Filter size={14} className="text-gray-500" />
        </div>

        <div className="divide-y divide-white/5">
          {tasks.map((task) => (
            /* Fixed class hover:bg-white/2 */
            <div key={task.id} className="p-8 flex flex-col lg:flex-row justify-between items-center gap-8 group hover:bg-white/2 transition-colors">
              <div className="flex gap-6 items-start w-full lg:w-auto">
                <div className={cn(
                  "w-1 h-14 shrink-0",
                  task.priority === "urgent" ? "bg-red-600" : "bg-[#c5a572]"
                )} />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[8px] font-black text-[#c5a572] uppercase tracking-widest bg-[#c5a572]/10 px-2 py-0.5 border border-[#c5a572]/20">
                      {task.category}
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">{task.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-gray-500 mt-2">
                    <span className="flex items-center gap-2 font-bold text-gray-300">
                        <UserIcon size={12} className="text-[#c5a572]" /> {task.assignedTo}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>ID: {task.id}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Progress Bar */}
              <div className="flex items-center gap-12 w-full lg:w-auto">
                 <div className="w-32 space-y-2">
                    <div className="flex justify-between text-[8px] uppercase font-black tracking-widest text-gray-500">
                        <span>Sync Progress</span>
                        <span className="text-white">{task.completion}%</span>
                    </div>
                    <div className="h-1 bg-white/5 w-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${task.completion}%` }}
                            className="h-full bg-[#c5a572]" 
                        />
                    </div>
                 </div>

                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-tighter text-gray-600 mb-1 font-black">Timeline</p>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">{task.dueDate}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={cn(
                    "px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border",
                    task.status === "In Progress" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    task.status === "Blocked" && "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {task.status}
                  </div>
                  <button className="p-2 hover:bg-white/5 text-gray-600 hover:text-white transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}