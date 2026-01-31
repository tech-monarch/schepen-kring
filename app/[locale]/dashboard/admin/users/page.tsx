"use client";

import { useState } from "react";
import { 
  Users, 
  UserCircle, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Trash2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<"all" | "employees" | "customers">("all");

  const users = [
    { id: 1, name: "Jean-Marc L.", email: "jm.l@answer24.com", role: "Employee", status: "Active", access: "Full" },
    { id: 2, name: "Sarah Connor", email: "sarah.c@gmail.com", role: "Customer", status: "Active", access: "None" },
    { id: 3, name: "Marcus Vane", email: "m.vane@answer24.com", role: "Employee", status: "Suspended", access: "Limited" },
    { id: 4, name: "Julian Rossi", email: "julian@luxury-yachts.it", role: "Customer", status: "Active", access: "None" },
  ];

  const filteredUsers = users.filter(user => {
    if (activeTab === "employees") return user.role === "Employee";
    if (activeTab === "customers") return user.role === "Customer";
    return true;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-white">Access Control</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c5a572] font-black mt-2">
            SuperAdmin Management Terminal
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#c5a572] rounded-none uppercase text-[10px] tracking-[0.2em] font-bold h-12 px-8 transition-all">
          <ShieldCheck className="mr-2 w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-white/5 p-1 border border-white/10 w-full md:w-auto">
          {[
            { id: "all", label: "Global Directory", icon: Users },
            { id: "employees", label: "Fleet Staff", icon: ShieldCheck },
            { id: "customers", label: "Customer Base", icon: UserCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2 text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all",
                activeTab === tab.id ? "bg-[#c5a572] text-black" : "text-gray-500 hover:text-white"
              )}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            placeholder="Search users..." 
            className="w-full bg-[#0d0d0d] border border-white/10 py-3 pl-12 pr-4 text-[10px] uppercase tracking-widest text-white outline-none focus:border-[#c5a572]"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-[#0d0d0d] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black">Identity</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black">Role</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black">Account Status</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-gray-500 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-white/2 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-gray-400 group-hover:border-[#c5a572]/50 group-hover:text-[#c5a572] transition-all">
                      <UserCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-serif text-white">{user.name}</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                      user.role === "Employee" ? "text-[#c5a572] border-[#c5a572]/20 bg-[#c5a572]/5" : "text-gray-400 border-white/10 bg-white/5"
                    )}>
                      {user.role}
                    </span>
                    {user.role === "Employee" && (
                      <span className="text-[8px] text-gray-600 font-black uppercase tracking-tighter">[{user.access} Access]</span>
                    )}
                  </div>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest",
                    user.status === "Active" ? "text-emerald-500" : "text-red-500"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", user.status === "Active" ? "bg-emerald-500" : "bg-red-500")} />
                    {user.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0d0d0d] border border-white/10 rounded-none text-white p-1 w-48">
                        <DropdownMenuLabel className="text-[8px] uppercase tracking-widest text-gray-500 px-3 py-2">Terminal Commands</DropdownMenuLabel>
                        <DropdownMenuItem className="text-[9px] uppercase tracking-widest font-bold py-3 hover:bg-white/5 cursor-pointer gap-2">
                          <Mail size={14} /> Send Credential Reset
                        </DropdownMenuItem>
                        {user.role === "Employee" && (
                          <DropdownMenuItem className="text-[9px] uppercase tracking-widest font-bold py-3 hover:bg-[#c5a572]/10 hover:text-[#c5a572] cursor-pointer gap-2">
                            <ShieldAlert size={14} /> Edit Permissions
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem className="text-[9px] uppercase tracking-widest font-bold py-3 hover:bg-red-500/10 text-red-500 cursor-pointer gap-2">
                          <Trash2 size={14} /> Terminate Account
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

      {/* Security Info */}
      <div className="p-6 bg-[#c5a572]/5 border border-[#c5a572]/10">
        <div className="flex gap-4 items-start">
          <ShieldCheck className="text-[#c5a572] shrink-0" size={18} />
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#c5a572] font-black mb-1">SuperAdmin Policy</p>
            <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
              Only SuperAdmins can delete employee accounts. Employees can manage yacht listings and tasks but cannot modify system-level access rules. All changes are logged in the global audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}