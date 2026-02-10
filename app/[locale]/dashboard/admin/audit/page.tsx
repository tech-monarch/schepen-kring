"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  ShieldCheck,
  Filter,
  Download,
  Search,
  Clock,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Database,
  Server,
  ChevronRight,
  Eye,
  Users,
  Calendar,
  FileText,
  Ship,
  Settings,
  Key,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  Database as DatabaseIcon,
  Network,
  Terminal,
  Cpu,
  HardDrive,
  MemoryStick,
  Router,
  Wifi,
  ServerCrash,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, parseISO } from "date-fns";

// ============================================
// TYPES AND INTERFACES
// ============================================

interface ActivityLog {
  id: string | number;
  user_id: string | number;
  user?: {
    id: string | number;
    name: string;
    email: string;
    role: string;
  };
  entity_type: string;
  entity_id: string | number | null;
  entity_name: string | null;
  action: string;
  description: string;
  severity: "info" | "success" | "warning" | "error";
  ip_address: string;
  user_agent: string;
  created_at: string;
  metadata?: Record<string, any>;
  old_data?: any;
  new_data?: any;
}

interface ApiResponse {
  logs: ActivityLog[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface StatsResponse {
  total_logs: number;
  today_logs: number;
  unique_users: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
  recent_activity: ActivityLog[];
}

interface FilterState {
  severity: string[];
  type: string[];
  dateRange: {
    from: string;
    to: string;
  };
  search: string;
  user_id?: string;
}

interface SystemStats {
  totalLogs: number;
  todayLogs: number;
  uniqueUsers: number;
  systemStatus: "online" | "degraded" | "offline";
  apiStatus: "online" | "error";
  responseTime: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const transformBackendLogToFrontend = (log: ActivityLog) => {
  return {
    id: String(log.id),
    userId: String(log.user_id),
    userName: log.user?.name || "Unknown User",
    userEmail: log.user?.email || "unknown@example.com",
    userRole: log.user?.role || "Unknown",
    action: log.action,
    description: log.description,
    entityType: log.entity_type,
    entityId: log.entity_id ? String(log.entity_id) : "",
    entityName: log.entity_name || log.entity_type,
    severity: log.severity,
    ipAddress: log.ip_address,
    userAgent: log.user_agent,
    timestamp: log.created_at,
    metadata: log.metadata,
  };
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function SystemAuditPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalLogs: 0,
    todayLogs: 0,
    uniqueUsers: 0,
    systemStatus: "online",
    apiStatus: "online",
    responseTime: 0,
    bySeverity: {},
    byType: {},
  });
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1,
  });

  const [filters, setFilters] = useState<FilterState>({
    severity: [],
    type: [],
    dateRange: {
      from: "",
      to: "",
    },
    search: "",
  });

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchSystemStats = useCallback(async () => {
    try {
      const startTime = Date.now();
      
      // Test API connectivity
      const testResponse = await Promise.race([
        api.get<StatsResponse>("/activity-logs/stats").catch(() => null),
        new Promise(resolve => setTimeout(() => resolve(null), 3000))
      ]);

      const responseTime = Date.now() - startTime;
      
      // Fix: Check if testResponse exists and has data property
      if (testResponse && typeof testResponse === 'object' && 'data' in testResponse) {
        const stats = testResponse.data as StatsResponse;
        
        setSystemStats(prev => ({
          ...prev,
          totalLogs: stats.total_logs,
          todayLogs: stats.today_logs,
          uniqueUsers: stats.unique_users,
          bySeverity: stats.by_severity,
          byType: stats.by_type,
          responseTime,
          apiStatus: "online",
          systemStatus: "online"
        }));
      } else {
        setSystemStats(prev => ({
          ...prev,
          responseTime,
          apiStatus: "error",
          systemStatus: "degraded"
        }));
        setApiError("Unable to fetch system stats");
      }

    } catch (error) {
      console.error("Error fetching system stats:", error);
      setApiError("Failed to fetch system statistics");
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setIsRefreshing(true);
    setApiError(null);
    
    try {
      // Build query parameters
      const params: any = {
        per_page: 50,
      };

      if (filters.severity.length > 0) {
        params.severity = filters.severity.join(',');
      }

      if (filters.type.length > 0) {
        params.type = filters.type.join(',');
      }

      if (filters.dateRange.from && filters.dateRange.to) {
        params.start_date = filters.dateRange.from;
        params.end_date = filters.dateRange.to;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      // Fetch from actual API
      const response = await api.get<ApiResponse>("/activity-logs", { params });
      
      // Fix: Check if response exists and has data property
      if (response && typeof response === 'object' && 'data' in response) {
        const data = response.data;
        
        if (data) {
          const logs = data.logs;
          const transformedLogs = logs.map(transformBackendLogToFrontend);
          
          setAuditLogs(logs);
          setFilteredLogs(transformedLogs);
          
          if (data.pagination) {
            setPagination(data.pagination);
          }
          
          // If we have filters, show message
          if (filters.severity.length > 0 || filters.type.length > 0 || filters.search) {
            setApiError(null);
          }
        }
      }
      
    } catch (error: any) {
      console.error("Error loading audit data:", error);
      
      // Provide helpful error message
      if (error.response?.status === 401) {
        setApiError("Unauthorized - Please log in to view audit logs");
      } else if (error.response?.status === 403) {
        setApiError("Forbidden - You don't have permission to view audit logs");
      } else if (error.response?.status === 500) {
        setApiError("Server error - Unable to fetch audit logs");
      } else if (error.message?.includes("Network Error")) {
        setApiError("Network error - Cannot connect to server");
      } else {
        setApiError("Failed to load audit logs. Please try again.");
      }
      
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  // ============================================
  // FILTERS AND UTILITIES
  // ============================================

  const applyFilters = useCallback(() => {
    // Debounce the filter application
    const timeoutId = setTimeout(() => {
      fetchAuditLogs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchAuditLogs]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getSeverityInfo = (severity: ActivityLog['severity']) => {
    switch (severity) {
      case 'success':
        return { 
          icon: CheckCircle, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200',
          label: 'Success',
          dotColor: 'bg-emerald-400'
        };
      case 'warning':
        return { 
          icon: AlertCircle, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          label: 'Warning',
          dotColor: 'bg-amber-400'
        };
      case 'error':
        return { 
          icon: XCircle, 
          color: 'text-rose-600', 
          bg: 'bg-rose-50', 
          border: 'border-rose-200',
          label: 'Error',
          dotColor: 'bg-rose-400'
        };
      default:
        return { 
          icon: Activity, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          label: 'Info',
          dotColor: 'bg-blue-400'
        };
    }
  };

  const entityTypes = useMemo(() => {
    const types = Array.from(new Set(auditLogs.map(log => log.entity_type)));
    return types.sort();
  }, [auditLogs]);

  const severityCounts = useMemo(() => {
    return systemStats.bySeverity || auditLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [systemStats.bySeverity, auditLogs]);

  // ============================================
  // ACTIONS
  // ============================================

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Severity', 'Action', 'Description', 'User', 'Role', 'Entity', 'Entity Type', 'IP Address'],
      ...filteredLogs.map(log => [
        format(parseISO(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.severity.toUpperCase(),
        log.action,
        `"${log.description.replace(/"/g, '""')}"`,
        log.userName,
        log.userRole,
        log.entityName,
        log.entityType,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      severity: [],
      type: [],
      dateRange: { from: '', to: '' },
      search: ''
    });
  };

  const toggleFilter = (type: 'severity' | 'type', value: string) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    const init = async () => {
      await fetchSystemStats();
      await fetchAuditLogs();
    };
    init();
  }, [fetchSystemStats]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[#003566]/10 rounded-lg">
                <ShieldCheck className="text-[#003566]" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-serif italic text-[#003566]">
                  System Audit & Security
                </h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-medium mt-1">
                  REAL-TIME MONITORING • SECURITY COMPLIANCE • ACTIVITY TRACKING
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  systemStats.systemStatus === 'online' ? 'bg-emerald-500' :
                  systemStats.systemStatus === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-slate-600 font-medium">
                  {systemStats.systemStatus === 'online' ? 'All Systems Operational' :
                   systemStats.systemStatus === 'degraded' ? 'Partial Degradation' : 'System Offline'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  setTimeout(() => {
                    fetchAuditLogs();
                    fetchSystemStats();
                  }, 500);
                }}
                disabled={isRefreshing}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCcw size={18} className={cn("text-slate-500", isRefreshing && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <DatabaseIcon size={20} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                TOTAL LOGS
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{systemStats.totalLogs.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">
              <span className="text-emerald-600 font-medium">+{systemStats.todayLogs}</span> today
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Users size={20} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                UNIQUE USERS
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{systemStats.uniqueUsers}</div>
            <div className="text-xs text-slate-500 mt-2">
              Active across the system
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Server size={20} className={cn(
                systemStats.apiStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'
              )} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                API STATUS
              </span>
            </div>
            <div className={cn(
              "text-3xl font-bold",
              systemStats.apiStatus === 'online' ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {systemStats.apiStatus === 'online' ? 'ONLINE' : 'ERROR'}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {systemStats.responseTime > 0 ? `${systemStats.responseTime}ms` : 'Monitoring...'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Shield size={20} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                SECURITY LEVEL
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">HIGH</div>
            <div className="text-xs text-slate-500 mt-2">
              All protocols active
            </div>
          </div>
        </div>

        {/* Severity Quick Stats */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={16} />
            Activity by Severity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['info', 'success', 'warning', 'error'] as const).map((severity, index) => {
              const info = getSeverityInfo(severity);
              const Icon = info.icon;
              const count = severityCounts[severity] || 0;
              const percentage = systemStats.totalLogs > 0 ? (count / systemStats.totalLogs) * 100 : 0;
              
              return (
                <motion.div
                  key={severity}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md",
                    info.bg,
                    info.border,
                    filters.severity.includes(severity) && "ring-2 ring-offset-1",
                    filters.severity.includes(severity) && info.color.replace('text', 'ring')
                  )}
                  onClick={() => toggleFilter('severity', severity)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", info.bg)}>
                        <Icon className={info.color} size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{info.label}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: info.color.split(' ')[1] }}>
                          {count}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div 
                      className={cn("h-2 rounded-full transition-all", info.dotColor)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Filter & Search</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                  filteredLogs.length === 0
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Severity Filters */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Severity Level</h3>
              <div className="flex flex-wrap gap-2">
                {(['info', 'success', 'warning', 'error'] as const).map((severity) => {
                  const info = getSeverityInfo(severity);
                  const Icon = info.icon;
                  const isActive = filters.severity.includes(severity);
                  
                  return (
                    <button
                      key={severity}
                      onClick={() => toggleFilter('severity', severity)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? `${info.bg} ${info.color} border ${info.border}`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                      )}
                    >
                      <Icon size={14} />
                      {info.label}
                      {isActive && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 bg-white/50 rounded">
                          {severityCounts[severity] || 0}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entity Type Filters */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Entity Type</h3>
              <div className="flex flex-wrap gap-2">
                {entityTypes.slice(0, 6).map((type) => {
                  const isActive = filters.type.includes(type);
                  const count = systemStats.byType?.[type] || auditLogs.filter(log => log.entity_type === type).length;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFilter('type', type)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                      )}
                    >
                      {type}
                      {isActive && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 bg-white/50 rounded">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
                {entityTypes.length > 6 && (
                  <span className="text-xs text-slate-500 self-center ml-2">
                    +{entityTypes.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Date Range</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, from: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, to: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear date filters
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          {(filters.severity.length > 0 || filters.type.length > 0 || filters.dateRange.from || filters.dateRange.to || filters.search) && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.severity.map(severity => (
                      <span key={severity} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {getSeverityInfo(severity as any).label}
                      </span>
                    ))}
                    {filters.type.map(type => (
                      <span key={type} className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                        {type}
                      </span>
                    ))}
                    {filters.search && (
                      <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                        Search: "{filters.search}"
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-rose-600 hover:text-rose-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Audit Log Entries</h2>
              <div className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-700">{filteredLogs.length}</span> of{" "}
                <span className="font-bold text-slate-700">{pagination.total}</span> logs
                {pagination.last_page > 1 && (
                  <span className="ml-2">(Page {pagination.current_page} of {pagination.last_page})</span>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const info = getSeverityInfo(log.severity);
                const Icon = info.icon;
                
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          info.bg
                        )}>
                          <Icon className={info.color} size={20} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800 leading-tight">
                              {log.description}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              <span className="font-medium">{log.userName}</span> ({log.userRole}) • {log.entityType}: {log.entityName}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
                              info.bg,
                              info.color
                            )}>
                              {log.severity}
                            </span>
                            <ChevronRight 
                              size={16} 
                              className={cn(
                                "text-slate-400 transition-transform",
                                selectedLog?.id === log.id && "rotate-90"
                              )} 
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true })}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {log.userEmail}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                            {log.ipAddress}
                          </span>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {selectedLog?.id === log.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-slate-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* User Information */}
                                <div>
                                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    User Information
                                  </h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Name
                                      </p>
                                      <p className="text-sm font-medium">{log.userName}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Email
                                      </p>
                                      <p className="text-sm font-medium">{log.userEmail}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Role
                                      </p>
                                      <p className="text-sm font-medium">{log.userRole}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        User ID
                                      </p>
                                      <p className="text-sm font-mono">{log.userId}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Technical Details */}
                                <div>
                                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Settings size={16} />
                                    Technical Details
                                  </h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Action
                                      </p>
                                      <p className="text-sm font-mono bg-slate-100 px-3 py-2 rounded">
                                        {log.action}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Entity Details
                                      </p>
                                      <p className="text-sm text-slate-600">
                                        {log.entityType} / {log.entityId} / {log.entityName}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                        Timestamp
                                      </p>
                                      <p className="text-sm font-medium">
                                        {format(parseISO(log.timestamp), 'PPpp')}
                                      </p>
                                    </div>
                                    {log.metadata && (
                                      <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                                          Metadata
                                        </p>
                                        <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">
                                          {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No logs found</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  {filters.search || filters.severity.length > 0 || filters.type.length > 0
                    ? "No audit logs match your current filters. Try adjusting your search criteria."
                    : "No audit logs available. Start by generating some activity in the system."}
                </p>
                {(filters.search || filters.severity.length > 0 || filters.type.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {apiError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle size={16} className="text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">System Notice</p>
                    <p className="text-xs text-amber-600">{apiError}</p>
                  </div>
                </div>
              )}
              {isRefreshing && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <RefreshCcw size={16} className="text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-blue-800">Refreshing data...</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Server size={14} />
                <span>System ID: MARITIME-AUDIT-001</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span>Security Level: HIGH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}