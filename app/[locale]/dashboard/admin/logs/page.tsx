"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Clock,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ActivityLog {
  id: number;
  log_type: string;
  action: string;
  description: string;
  ip_address: string;
  user_agent?: string;
  metadata: any;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image?: string;
  } | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    log_type: "",
    action: "",
    user_id: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        sort: sortField,
        order: sortOrder,
        ...(search && { search }),
        ...(filters.log_type && { log_type: filters.log_type }),
        ...(filters.action && { action: filters.action }),
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_from: filters.date_to }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/activity-logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setPagination(data.meta || pagination);
      } else if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

const fetchStats = async () => {
    try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        console.log("Fetching stats from:", `${process.env.NEXT_PUBLIC_API_URL}/activity-logs/stats`);
        
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/activity-logs/stats`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }
        );

        console.log("Stats response status:", response.status);
        
        // Check if response is HTML instead of JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            console.error("Stats endpoint returned HTML instead of JSON");
            console.error("First 200 chars:", text.substring(0, 200));
            
            // Return mock stats for now
            return {
                daily_stats: [],
                top_actions: [],
                top_users: [],
                activity_by_type: [],
                recent_activity: [],
                summary: {
                    total_logs: 0,
                    total_users: 0,
                    today_logs: 0,
                    yesterday_logs: 0,
                }
            };
        }

        if (!response.ok) {
            console.error("Stats HTTP error:", response.status);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Stats data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching stats:", error);
        
        // Return mock stats on error
        return {
            daily_stats: [],
            top_actions: [],
            top_users: [],
            activity_by_type: [],
            recent_activity: [],
            summary: {
                total_logs: 0,
                total_users: 0,
                today_logs: 0,
                yesterday_logs: 0,
            }
        };
    }
};

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [sortField, sortOrder]);

  // Filter log types for dropdown
  const logTypes = [
    "api_call",
    "auth",
    "yacht",
    "bid",
    "booking",
    "user_action",
    "system",
    "ai",
    "profile",
    "permission",
  ];

  // Common actions for dropdown
  const commonActions = [
    "login",
    "registration",
    "yacht_created",
    "yacht_updated",
    "yacht_deleted",
    "bid_placed",
    "bid_accepted",
    "bid_declined",
    "booking_created",
    "user_created",
    "user_updated",
    "user_deleted",
    "user_impersonated",
    "user_status_toggled",
  ];

  // Get icon for log type
  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case "auth":
        return "🔐";
      case "yacht":
        return "🚤";
      case "bid":
        return "💰";
      case "booking":
        return "📅";
      case "user_action":
        return "👤";
      case "system":
        return "⚙️";
      case "ai":
        return "🤖";
      default:
        return "📡";
    }
  };

  // Get status color
  const getStatusColor = (action: string) => {
    if (action.includes("failed") || action.includes("error") || action.includes("declined")) {
      return "bg-red-100 text-red-800";
    }
    if (action.includes("success") || action.includes("accepted") || action.includes("created")) {
      return "bg-green-100 text-green-800";
    }
    if (action.includes("updated") || action.includes("modified")) {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-slate-100 text-slate-800";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Export logs as CSV
  const exportToCSV = () => {
    const headers = ["ID", "Time", "User", "Type", "Action", "Description", "IP Address"];
    const rows = logs.map(log => [
      log.id,
      formatDate(log.created_at),
      log.user?.name || "System",
      log.log_type,
      log.action,
      log.description,
      log.ip_address,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Logs exported successfully");
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      log_type: "",
      action: "",
      user_id: "",
      date_from: "",
      date_to: "",
    });
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#003566]">Activity Logs</h1>
              <p className="text-slate-600 text-sm mt-1">
                Monitor all system activities and user actions in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Download size={14} />
                Export CSV
              </button>
              <button
                onClick={() => fetchLogs()}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#003566] text-white hover:bg-[#002855] transition-colors flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-6">
        <div className="bg-white border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 focus:border-[#003566] focus:outline-none"
                />
              </div>
            </div>

            {/* Log Type Filter */}
            <div>
              <select
                value={filters.log_type}
                onChange={(e) => setFilters({ ...filters, log_type: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 focus:border-[#003566] focus:outline-none bg-white"
              >
                <option value="">All Types</option>
                {logTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 focus:border-[#003566] focus:outline-none bg-white"
              >
                <option value="">All Actions</option>
                {commonActions.map((action) => (
                  <option key={action} value={action}>
                    {action.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 focus:border-[#003566] focus:outline-none"
              />
            </div>

            {/* Date To */}
            <div>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 focus:border-[#003566] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={clearFilters}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700"
            >
              Clear all filters
            </button>
            <button
              onClick={() => fetchLogs()}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#003566] text-white hover:bg-[#002855] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white border border-slate-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003566] mx-auto"></div>
              <p className="text-slate-500 text-sm mt-3">Loading activity logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="text-slate-300 mx-auto mb-3" size={48} />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No activity logs found</h3>
              <p className="text-slate-500">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-3 px-6 text-left">
                        <button
                          onClick={() => handleSort("created_at")}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#003566]"
                        >
                          <Clock size={12} />
                          Time
                          <ChevronsUpDown size={12} />
                        </button>
                      </th>
                      <th className="py-3 px-6 text-left">
                        <button
                          onClick={() => handleSort("user_id")}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#003566]"
                        >
                          <User size={12} />
                          User
                          <ChevronsUpDown size={12} />
                        </button>
                      </th>
                      <th className="py-3 px-6 text-left">
                        <button
                          onClick={() => handleSort("log_type")}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#003566]"
                        >
                          Type
                          <ChevronsUpDown size={12} />
                        </button>
                      </th>
                      <th className="py-3 px-6 text-left">
                        <button
                          onClick={() => handleSort("action")}
                          className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-[#003566]"
                        >
                          Action
                          <ChevronsUpDown size={12} />
                        </button>
                      </th>
                      <th className="py-3 px-6 text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                          Description
                        </span>
                      </th>
                      <th className="py-3 px-6 text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                          IP Address
                        </span>
                      </th>
                      <th className="py-3 px-6 text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                          Details
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900">
                              {new Date(log.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                                {log.user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {log.user.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {log.user.role}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">System</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-xs font-medium">
                            <span className="text-lg">{getLogTypeIcon(log.log_type)}</span>
                            {log.log_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(log.action)}`}>
                            {log.action.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-slate-900">{log.description}</div>
                          {log.user_agent && (
                            <div className="text-xs text-slate-500 truncate max-w-xs mt-1">
                              {log.user_agent}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                            {log.ip_address}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => {
                              // Show modal with metadata
                              toast.custom((t) => (
                                <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-6 max-w-md">
                                  <h3 className="text-lg font-bold text-[#003566] mb-4">
                                    Log Details
                                  </h3>
                                  <pre className="bg-slate-50 p-4 rounded text-xs overflow-auto max-h-96">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                  <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#003566] text-white hover:bg-[#002855] transition-colors"
                                  >
                                    Close
                                  </button>
                                </div>
                              ));
                            }}
                            className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                  <div className="text-sm text-slate-600">
                    Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{" "}
                    {pagination.total} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchLogs(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 text-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => fetchLogs(page)}
                          className={`px-3 py-1 text-sm ${
                            pagination.current_page === page
                              ? "bg-[#003566] text-white"
                              : "border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {pagination.last_page > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <button
                          onClick={() => fetchLogs(pagination.last_page)}
                          className="px-3 py-1 text-sm border border-slate-200 hover:bg-slate-50"
                        >
                          {pagination.last_page}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => fetchLogs(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 text-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Logs</p>
                <p className="text-2xl font-bold text-[#003566]">{pagination.total}</p>
              </div>
              <Activity className="text-slate-400" size={24} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">This Page</p>
                <p className="text-2xl font-bold text-[#003566]">{logs.length}</p>
              </div>
              <Eye className="text-slate-400" size={24} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">API Calls</p>
                <p className="text-2xl font-bold text-[#003566]">
                  {logs.filter(log => log.log_type === "api_call").length}
                </p>
              </div>
              <Activity className="text-slate-400" size={24} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">User Actions</p>
                <p className="text-2xl font-bold text-[#003566]">
                  {logs.filter(log => log.log_type === "user_action").length}
                </p>
              </div>
              <User className="text-slate-400" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}