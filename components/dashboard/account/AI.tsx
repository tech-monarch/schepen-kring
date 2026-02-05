"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  MessageSquare,
  Calendar,
  Eye,
  Search,
  CheckSquare,
  Square,
  X,
  Clock,
  User,
  Bot,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ChatLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingChat, setViewingChat] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminReply, setAdminReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://schepen-kring.nl/api/v1";

  const getAuthToken = () => {
    try {
      const stored = localStorage.getItem("auth_token");
      if (stored && stored.includes(",")) {
        const parts = stored.replace(/[\[\]']+/g, "").split(",");
        return parts[1]?.trim() || parts[0]?.trim();
      }
      return stored?.trim() || null;
    } catch {
      return null;
    }
  };

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(typeof window !== "undefined" && getAuthToken()
        ? { Authorization: `Bearer ${getAuthToken()}` }
        : {}),
    },
  });

  // --- AUTO-REFRESH (POLLING) ---
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh list every 10s
    return () => clearInterval(interval);
  }, []);

  // Poll for new messages when a specific chat is open
  useEffect(() => {
    if (!viewingChat) return;
    const interval = setInterval(() => {
      fetchTranscript(viewingChat.session_id, true);
    }, 4000); // Check for user messages every 4s
    return () => clearInterval(interval);
  }, [viewingChat?.session_id]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [viewingChat?.messages]);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get("/admin/logs");
      setLogs(data.data || []);
    } catch (err) {
      console.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (sessionId: string, isSilent = false) => {
    try {
      const { data } = await api.get(`/admin/logs/${sessionId}`);
      setViewingChat(data);
    } catch (err) {
      if (!isSilent) toast.error("Could not load transcript");
    }
  };

  // --- SEND HUMAN REPLY ---
  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || isSending || !viewingChat) return;

    setIsSending(true);
    const newMessage = {
      id: Date.now().toString(),
      role: "assistant", // Admin acts as assistant
      content: adminReply,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...viewingChat.messages, newMessage];

    try {
      // Sync the whole JSON blob back to the history endpoint
      await api.post("/history", {
        id: viewingChat.session_id, // Ensure this key is exactly 'id' to match $request->id
        title: viewingChat.title,
        messages: updatedMessages,
        is_human_escalated: true,
      });

      setViewingChat({ ...viewingChat, messages: updatedMessages });
      setAdminReply("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm("Delete this conversation permanently?")) return;
    try {
      await api.delete(`/admin/logs/${id}`);
      setLogs(logs.filter((l) => l.session_id !== id));
      toast.success("Log removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  if (loading)
    return (
      <div className="p-20 text-center font-black text-neutral-300 animate-pulse tracking-widest uppercase text-xs">
        Accessing Encrypted Logs...
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-[1000] tracking-tighter text-neutral-900 mb-2">
            Support Dashboard
          </h1>
          <p className="text-neutral-500 font-medium">
            Manage escalated chats and AI logs.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-3 bg-neutral-100 border-none rounded-2xl text-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-neutral-100">
              <th className="p-6 w-10"></th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Context
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Status
              </th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Activity
              </th>
              <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {logs
              .filter((l) =>
                l.title?.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((log) => (
                <tr
                  key={log.session_id}
                  className={`group hover:bg-blue-50/30 transition-all ${log.is_human_escalated ? "bg-orange-50/50" : ""}`}
                >
                  <td className="p-6">
                    <button onClick={() => toggleSelect(log.session_id)}>
                      {selectedIds.includes(log.session_id) ? (
                        <CheckSquare className="text-blue-600" size={20} />
                      ) : (
                        <Square className="text-neutral-200" size={20} />
                      )}
                    </button>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-neutral-800 line-clamp-1">
                      {log.title || "Untitled"}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400 mt-1">
                      ID: {log.session_id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="p-6">
                    {log.is_human_escalated ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full animate-pulse">
                        NEEDS HELP
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase">
                        AI Managed
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
                      <Clock size={14} className="text-neutral-300" />
                      {new Date(log.last_active).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => fetchTranscript(log.session_id)}
                        className="p-2.5 bg-white hover:bg-blue-600 hover:text-white rounded-xl shadow-sm border border-neutral-100 text-neutral-500 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteLog(log.session_id)}
                        className="p-2.5 bg-white hover:bg-red-500 hover:text-white rounded-xl shadow-sm border border-neutral-100 text-neutral-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Live Chat / Transcript Modal */}
      {viewingChat && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setViewingChat(null)}
          />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black tracking-tighter">
                  Live Support
                </h2>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">
                  {viewingChat.is_human_escalated
                    ? "● Escalated to Human"
                    : "AI Mode Only"}
                </p>
              </div>
              <button
                onClick={() => setViewingChat(null)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-neutral-50/50"
            >
              {viewingChat.messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-2 px-1">
                    {msg.role === "user" ? (
                      <>
                        <span className="text-[10px] font-black uppercase text-neutral-400">
                          User
                        </span>{" "}
                        <User size={12} className="text-neutral-400" />
                      </>
                    ) : (
                      <>
                        <Bot size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase text-blue-500">
                          Agent
                        </span>
                      </>
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === "user" ? "bg-neutral-900 text-white rounded-tr-none" : "bg-white text-neutral-800 border border-neutral-100 rounded-tl-none"}`}
                  >
                    {msg.content}
                    {msg.image_path && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${msg.image_path}`}
                        className="mt-3 rounded-xl w-full"
                        alt="Attachment"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Input Area */}
            <div className="p-6 border-t border-neutral-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <form onSubmit={handleAdminReply} className="flex gap-2">
                <input
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type your response as a human agent..."
                  className="flex-1 px-4 py-3 bg-neutral-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                />
                <Button
                  type="submit"
                  disabled={!adminReply.trim() || isSending}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-700 h-12 w-12 p-0"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
