"use client";

import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Anchor, 
  MapPin, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SailingSchedulePage() {
  const [view, setView] = useState<"calendar" | "list">("list");

  // Mock data for test sail bookings
  const bookings = [
    {
      id: "BK-402",
      yacht: "M/Y Sovereign",
      client: "Robert Chen",
      date: "Oct 24, 2023",
      time: "10:00 - 14:00",
      assignedEmployee: "Capt. Marco Rossi",
      status: "Confirmed",
      prepStatus: "Ready"
    },
    {
      id: "BK-405",
      yacht: "M/Y Azure Sky",
      client: "Sarah Jenkins",
      date: "Oct 25, 2023",
      time: "09:00 - 12:00",
      assignedEmployee: "Julian Vane",
      status: "Pending Prep",
      prepStatus: "In Progress"
    }
  ];

  return (
    <div className="space-y-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-white">Sailing Schedule</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a572] font-black mt-2">
            Operations & Experience Management
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 border border-white/10">
            <button 
              onClick={() => setView("list")}
              className={cn(
                "px-4 py-2 text-[9px] uppercase tracking-widest font-bold transition-all",
                view === "list" ? "bg-[#c5a572] text-black" : "text-gray-500 hover:text-white"
              )}
            >
              List View
            </button>
            <button 
              onClick={() => setView("calendar")}
              className={cn(
                "px-4 py-2 text-[9px] uppercase tracking-widest font-bold transition-all",
                view === "calendar" ? "bg-[#c5a572] text-black" : "text-gray-500 hover:text-white"
              )}
            >
              Master Calendar
            </button>
          </div>
          <Button className="bg-white text-black hover:bg-[#c5a572] rounded-none uppercase text-[10px] tracking-widest font-bold h-12 px-6">
            Book Test Sail
          </Button>
        </div>
      </div>

      {/* Preparation Conflict Alert Example */}
      <div className="flex items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/20 text-orange-200">
        <AlertCircle size={18} />
        <p className="text-[10px] uppercase tracking-widest font-bold">
          Note: System is enforcing a 4-hour maintenance window between sails for all vessels.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-[#0d0d0d] border border-white/5 p-6 hover:border-[#c5a572]/30 transition-all group">
            <div className="flex flex-col xl:flex-row justify-between gap-8">
              
              {/* Vessel & Client Info */}
              <div className="flex gap-6 items-start">
                <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Anchor size={24} className="text-gray-600 group-hover:text-[#c5a572] transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-serif text-white">{booking.yacht}</h3>
                    <span className="text-[8px] px-2 py-0.5 bg-white/5 text-gray-500 uppercase tracking-widest">Ref: {booking.id}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-gray-400">
                      <User size={12} className="text-[#c5a572]" /> Client: {booking.client}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-gray-400">
                      <MapPin size={12} className="text-[#c5a572]" /> Branch: Monaco Main Port
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing & Crew */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex gap-10">
                  <div className="text-center md:text-left">
                    <p className="text-[8px] uppercase tracking-tighter text-gray-600 mb-1">Date & Time</p>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar size={14} className="text-[#c5a572]" />
                      <span className="text-xs font-bold uppercase tracking-widest">{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold">{booking.time}</span>
                    </div>
                  </div>

                  <div className="text-center md:text-left">
                    <p className="text-[8px] uppercase tracking-tighter text-gray-600 mb-1">Assigned Crew</p>
                    <p className="text-[10px] text-white font-bold uppercase tracking-widest mb-1">{booking.assignedEmployee}</p>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-tighter border border-emerald-500/20">
                      Available
                    </span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-6 border-l border-white/5 pl-8">
                  <div className="text-right">
                    <p className="text-[8px] uppercase tracking-tighter text-gray-600 mb-1">Prep Status</p>
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle2 size={14} className={cn(
                        booking.prepStatus === "Ready" ? "text-emerald-500" : "text-[#c5a572]"
                      )} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{booking.prepStatus}</span>
                    </div>
                  </div>
                  <button className="p-3 bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Quick Summary Bar */}
      <div className="flex justify-between items-center p-6 bg-white/2 border border-white/5">
        <div className="flex gap-8">
          <div>
            <span className="text-[8px] uppercase text-gray-600 block">Today</span>
            <span className="text-sm font-serif text-white">4 Sails</span>
          </div>
          <div>
            <span className="text-[8px] uppercase text-gray-600 block">Vessel Capacity</span>
            <span className="text-sm font-serif text-[#c5a572]">82%</span>
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
          Syncing with Maritime Weather API...
        </p>
      </div>
    </div>
  );
}