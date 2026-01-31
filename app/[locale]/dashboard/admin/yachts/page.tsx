"use client";

import { useState } from "react";
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Search, 
  Anchor, 
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FleetManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Example technical spec workflow: Intake -> Active -> Sold
  const fleet = [
    { id: 1, name: "M/Y Sovereign", ref: "7701", status: "Active", visible: true, branch: "Monaco" },
    { id: 2, name: "M/Y Azure Sky", ref: "7702", status: "Intake", visible: false, branch: "Cannes" },
    { id: 3, name: "M/Y Excellence", ref: "7703", status: "Sold", visible: true, branch: "Dubai" },
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-white">Fleet Management</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a572] font-black mt-2">
            Inventory Control & Technical Specs
          </p>
        </div>
        <Button className="bg-[#c5a572] hover:bg-white text-black rounded-none uppercase text-[10px] tracking-[0.2em] font-bold h-12 px-8 transition-all">
          <Plus className="mr-2 w-4 h-4" /> Add New Vessel
        </Button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0d0d0d] border border-white/5 p-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search by vessel name or ref..."
            className="w-full bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-[10px] uppercase tracking-widest text-white outline-none focus:border-[#c5a572] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {['All', 'Intake', 'Active', 'Sold'].map((filter) => (
            <button key={filter} className="px-4 py-2 text-[8px] font-bold uppercase tracking-widest text-gray-400 hover:text-white border border-transparent hover:border-white/10 transition-all">
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-[#0d0d0d] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black">Vessel Details</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black">Lifecycle Status</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black">Customer Visibility</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black text-right">Terminal Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {fleet.map((yacht) => (
              <tr key={yacht.id} className="group hover:bg-white/2 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10">
                      <Anchor size={18} className="text-[#c5a572]" />
                    </div>
                    <div>
                      <p className="text-sm font-serif text-white">{yacht.name}</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                        Ref: #{yacht.ref} • {yacht.branch} Branch
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
                    yacht.status === "Active" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    yacht.status === "Intake" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    yacht.status === "Sold" && "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  )}>
                    {yacht.status}
                  </span>
                </td>
                <td className="p-6">
                  <button className={cn(
                    "flex items-center gap-2 transition-colors",
                    yacht.visible ? "text-[#c5a572] hover:text-white" : "text-gray-600 hover:text-white"
                  )}>
                    {yacht.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span className="text-[9px] uppercase font-bold tracking-widest">
                      {yacht.visible ? "Publicly Visible" : "Hidden from Site"}
                    </span>
                  </button>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button className="p-2.5 hover:bg-white/5 text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                      <Edit3 size={14} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2.5 hover:bg-white/5 text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                          <MoreHorizontal size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0d0d0d] border border-white/10 rounded-none text-white p-1">
                        <DropdownMenuItem className="text-[9px] uppercase tracking-widest font-bold py-3 hover:bg-white/5 cursor-pointer">
                          View Audit Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[9px] uppercase tracking-widest font-bold py-3 hover:bg-white/5 cursor-pointer">
                          Technical Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[9px] uppercase tracking-widest font-bold py-3 hover:bg-red-500/10 text-red-500 cursor-pointer">
                          Archive Vessel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State / Bottom Info */}
      <div className="flex items-center gap-3 p-6 bg-white/2 border border-white/5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#c5a572] animate-pulse" />
        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
          Showing {fleet.length} Vessels in global inventory
        </p>
      </div>
    </div>
  );
}